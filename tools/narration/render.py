"""Renders the course's narration, section by section (docs/narration.md).

Local and by hand, never on CI: it needs the model, the GPU and an hour or more. It reads the
scripts `npm run narration -- script` writes, loads Qwen3-TTS once, and for every section whose
hash has no audio yet renders its sentences in one batch, normalises the section to -16 LUFS,
encodes it as Opus (32 kbps, mono) and records it in the manifest. Then it unloads and exits.

Resumable: the manifest is rewritten (atomically) after every section and a file is named by its
section's hash, so a run that is stopped, killed or crashes picks up where it was. A section is
rendered again only when its text changed (its hash did). Two runs never share an audio
directory: the second refuses, naming the first one's pid.

Polite: other work runs on this machine, and the GPU's memory is the system's. Before every
section it reads MemAvailable: below --min-free-gb (8), or while a `mix test`/`mix precommit`
run is active, it waits until --resume-free-gb (8) is available and the run is over, checking
every ten seconds and logging the pause.

Listening: every sentence it renders is heard by Whisper (listen.py) and rendered again if it is not
the sentence (the model sometimes drifts into syllables of no language). A sentence still wrong
after three retakes is kept and logged as FLAGGED.

usage: render.py --scripts .cache/narration/ru.scripts.json --audio ../learn-audio
                 [--parts 0,1] [--lessons id,id] [--log private/narration/render.log]
                 [--min-free-gb 8] [--resume-free-gb 8] [--dry-run]
                 [--redo id#key,id#key --salt 2]   another sample of sections Whisper flagged
                 [--only id#key,id#key]   render these sections and no others of the lessons chosen (a sample)

The language is the scripts file's (`lang`, `voice`): `npm run narration -- script --lang en --speaker ryan` writes
English ones, and the audio and manifest go to <audio>/en/ and <audio>/en.json. Nothing here publishes; run.sh and
publish.sh are the Russian edition's alone.
"""
import argparse, json, os, signal, subprocess, sys, tempfile, threading, time, wave
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # python -I leaves the script's own directory out
import listen

MODEL_DIR = Path.home() / ".cache/learn-tts/models/Qwen3-TTS-12Hz-0.6B-CustomVoice"
LUFS, TRUE_PEAK, BITRATE = -16, -1.5, "32k"
GAP_AFTER_HEADING, GAP, TAIL = 0.7, 0.35, 0.6
CHARS_PER_SECOND = {"ru": 14.0, "en": 12.0}  # serena's Russian, measured in the spike; English: 11.4–12.3 on three samples, gaps included (docs/narration.md)
BATCH_SENTENCES, BATCH_CHARS = 12, 2400
RETAKES, MIN_RECALL, MIN_PRECISION = 3, 0.7, 0.5  # the thresholds separate the pilot's drifted sentences from the rest (docs/narration.md)

log_file = None
STOP = {"now": False}
ALIVE = {"at": time.monotonic()}  # the watchdog's clock: moved by every section and every pause tick
HANG_SECONDS = 1800  # the longest section takes minutes; a GPU that stops answering would take forever


def watchdog(lockfile):
    """A run nobody is watching must end: a process stuck in the driver exits, and run.sh tries again."""
    while True:
        time.sleep(60)
        if time.monotonic() - ALIVE["at"] > HANG_SECONDS:
            log(f"hung: no progress for {HANG_SECONDS // 60} min; exiting")
            lockfile.unlink(missing_ok=True)
            os._exit(75)


def log(msg):
    line = f"{datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line, flush=True)
    if log_file:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(line + "\n")


def mem_available_gb():
    with open("/proc/meminfo") as f:
        for line in f:
            if line.startswith("MemAvailable:"):
                return int(line.split()[1]) / 1024 / 1024
    return 0.0


def test_run_active():
    """A `mix test` or `mix precommit` on this machine: the coordinator's rule is not to compete with one.
    Read from /proc, argument by argument: a process whose arguments merely mention «mix precommit»
    (an agent's prompt does) is not one."""
    found = []
    for pid in os.listdir("/proc"):
        if not pid.isdigit():
            continue
        try:
            args = open(f"/proc/{pid}/cmdline", "rb").read().split(b"\0")
        except OSError:
            continue
        if not args or not args[0].endswith((b"beam.smp", b"/mix", b"mix")):
            continue
        if b"mix" in [a.rsplit(b"/", 1)[-1] for a in args] and (b"test" in args or b"precommit" in args):
            found.append(int(pid))
    return found


def wait_for_memory(min_gb, resume_gb):
    """Pauses below min_gb available, or while a test run is active; resumes at resume_gb and none.
    The model's memory is the GPU's, which here is system RAM and not counted in this process's RSS."""
    gb = mem_available_gb()
    busy = test_run_active()
    if gb >= min_gb and not busy:
        return
    log(f"pause: {gb:.1f} GB available (pause below {min_gb}, resume at {resume_gb}){', a test run is active' if busy else ''}")
    while (mem_available_gb() < resume_gb or test_run_active()) and not STOP["now"]:
        ALIVE["at"] = time.monotonic()
        time.sleep(10)
    log(f"resume: {mem_available_gb():.1f} GB available")


def write_json(path, data):
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
    os.replace(tmp, path)


def lock(audio):
    p = audio / ".render.lock"
    if p.exists():
        try:
            pid = int(p.read_text().strip())
            os.kill(pid, 0)
            sys.exit(f"render: another run (pid {pid}) is using {audio}")
        except (ValueError, ProcessLookupError):
            pass  # a stale lock: its run is gone
    p.write_text(str(os.getpid()))
    return p


def trim(w, sr, np):
    """Silence off both ends of an utterance (−45 dB), so the gaps between sentences are ours."""
    if len(w) == 0:
        return w
    frame = int(sr * 0.01)
    n = len(w) // frame
    if n == 0:
        return w
    rms = np.sqrt((w[: n * frame].reshape(n, frame) ** 2).mean(axis=1) + 1e-12)
    loud = np.where(20 * np.log10(rms) > -45)[0]
    if len(loud) == 0:
        return w
    a, b = max(0, loud[0] - 2), min(n, loud[-1] + 3)
    return w[a * frame : b * frame]


def plausible(text, seconds, cps):
    expected = len(text) / cps
    return 0.45 * expected - 0.5 <= seconds <= 2.2 * expected + 1.5


def batches(sentences):
    out, cur, chars = [], [], 0
    for i, s in enumerate(sentences):
        if cur and (len(cur) >= BATCH_SENTENCES or chars + len(s) > BATCH_CHARS):
            out.append(cur)
            cur, chars = [], 0
        cur.append(i)
        chars += len(s)
    if cur:
        out.append(cur)
    return out


def encode(wav_path, out_path):
    """Two-pass loudnorm to −16 LUFS, then Opus. Returns the encoded file's duration."""
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(wav_path), "-af",
         f"loudnorm=I={LUFS}:TP={TRUE_PEAK}:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    af = (f"loudnorm=I={LUFS}:TP={TRUE_PEAK}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    tmp = out_path.with_suffix(".tmp.opus")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path), "-af", af, "-ar", "48000",
                    "-ac", "1", "-c:a", "libopus", "-b:a", BITRATE, "-vbr", "on", "-application", "audio",
                    "-map_metadata", "-1", "-fflags", "+bitexact", str(tmp)], check=True)
    os.replace(tmp, out_path)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out_path)],
                         capture_output=True, text=True, check=True).stdout.strip()
    return round(float(dur), 2)


def main():
    global log_file
    ap = argparse.ArgumentParser()
    ap.add_argument("--scripts", required=True)
    ap.add_argument("--audio", required=True, help="the learn-audio checkout")
    ap.add_argument("--parts")
    ap.add_argument("--lessons")
    ap.add_argument("--log")
    ap.add_argument("--min-free-gb", type=float, default=8.0, help="pause below this much available memory")
    ap.add_argument("--resume-free-gb", type=float, default=8.0, help="and resume only at this much")
    ap.add_argument("--redo", help="lesson#key,…: render these sections again although they have audio (another sample)")
    ap.add_argument("--salt", type=int, default=1, help="with --redo: which other sample (the seed is shifted by it)")
    ap.add_argument("--only", help="lesson#key,…: of the lessons chosen, render only these sections")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    log_file = a.log
    if log_file:
        Path(log_file).parent.mkdir(parents=True, exist_ok=True)

    scripts = json.loads(Path(a.scripts).read_text(encoding="utf-8"))
    lang = scripts["lang"]
    cps = CHARS_PER_SECOND[lang]
    audio = Path(a.audio).resolve()
    manifest_path = audio / f"{lang}.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    manifest.update({"version": scripts["version"], "voice": scripts["voice"], "base": "/learn-audio/"})
    manifest.setdefault("lessons", {})

    lessons = scripts["lessons"]
    if a.parts:
        parts = {int(p) for p in a.parts.split(",")}
        lessons = [l for l in lessons if l["part"] in parts]
    if a.lessons:
        ids = set(a.lessons.split(","))
        lessons = [l for l in lessons if l["id"] in ids]

    def done(lesson, sec):
        for s in manifest["lessons"].get(lesson["id"], {}).get("sections", []):
            if s["hash"] == sec["hash"] and (audio / s["file"]).exists():
                return s
        return None

    redo = set(a.redo.split(",")) if a.redo else set()
    if redo:
        lessons = [l for l in lessons if any(r.split("#")[0] == l["id"] for r in redo)]
    only = set(a.only.split(",")) if a.only else None
    todo = [(l, s) for l in lessons for s in l["sections"] if (not done(l, s) or f"{l['id']}#{s['key']}" in redo) and (only is None or f"{l['id']}#{s['key']}" in only)]
    total_chars = sum(len(t) for _, s in todo for t in s["sentences"])
    log(f"start: {len(lessons)} lesson(s), {len(todo)} section(s) to render, {total_chars} chars "
        f"(~{total_chars / cps / 60:.0f} min of audio), {mem_available_gb():.1f} GB available, pid {os.getpid()}")
    if a.dry_run or not todo:
        finish_lessons(lessons, manifest, manifest_path, audio, done)
        log("done: nothing to render" if not todo else "dry run")
        return

    lockfile = lock(audio)
    stop = STOP
    threading.Thread(target=watchdog, args=(lockfile,), daemon=True).start()

    def on_signal(sig, frame):
        stop["now"] = True
        log(f"signal {sig}: stopping after this section")

    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)

    import numpy as np, torch
    from qwen_tts import Qwen3TTSModel

    wait_for_memory(a.resume_free_gb, a.resume_free_gb)  # to start, the higher bar
    t0 = time.monotonic()
    model = Qwen3TTSModel.from_pretrained(str(MODEL_DIR), device_map="cuda:0", dtype=torch.bfloat16, attn_implementation="sdpa")
    voice = scripts["voice"]
    log(f"model loaded in {time.monotonic() - t0:.1f}s")

    def synth(texts, seed):
        torch.manual_seed(seed)
        wavs, sr = model.generate_custom_voice(text=texts, speaker=[voice["speaker"]] * len(texts), language=[voice["language"]] * len(texts))
        torch.cuda.synchronize()
        return [np.asarray(w, dtype=np.float32) for w in wavs], sr

    ignore = frozenset(scripts.get("ignore", []))
    deaf = {"n": 0}

    def judge(text, w, sr):
        """Is this take the sentence? rank orders takes when none is good."""
        seconds = len(w) / sr
        fits = plausible(text, seconds, cps)
        heard = listen.transcribe_pcm((np.clip(w, -1, 1) * 32767).astype("<i2").tobytes(), sr, lang)
        if heard is None:  # Whisper is not answering: say so, and do not hold the run up
            deaf["n"] += 1
            return {"ok": fits, "why": f"{seconds:.1f}s for {len(text)} chars", "rank": 0.0, "heard": None}
        recall, precision, _ = listen.score(text, heard, ignore, lang)
        ok = fits and recall >= MIN_RECALL and precision >= MIN_PRECISION
        why = "" if ok else f"{seconds:.1f}s for {len(text)} chars, recall {recall:.2f}, precision {precision:.2f}"
        return {"ok": ok, "why": why, "rank": min(recall, precision) if fits else min(recall, precision) / 2, "heard": heard}

    rendered, audio_s, synth_s, retries, flagged = 0, 0.0, 0.0, 0, 0
    try:
        for lesson, sec in todo:
            if stop["now"]:
                break
            ALIVE["at"] = time.monotonic()
            wait_for_memory(a.min_free_gb, a.resume_free_gb)
            if stop["now"]:
                break
            ts = time.monotonic()
            ALIVE["at"] = ts
            sents = sec["sentences"]
            seed = int(sec["hash"][:8], 16) + (a.salt * 7919 if f"{lesson['id']}#{sec['key']}" in redo else 0)
            out = [None] * len(sents)
            sr = 24000
            for b in batches(sents):
                wavs, sr = synth([sents[i] for i in b], seed + b[0])
                for i, w in zip(b, wavs):
                    out[i] = trim(w, sr, np)
            # The model's known failures: a runaway or a swallowed sentence (a length no sentence
            # has), and a sentence that drifts into syllables of no language at a plausible length,
            # about 1 in 120 in the pilot, which only an ear catches. Either: render it again,
            # alone, with another seed, and keep the best take.
            for i, s in enumerate(sents):
                verdict = judge(s, out[i], sr)
                tries = 0
                while not verdict["ok"] and tries < RETAKES:
                    tries += 1
                    retries += 1
                    log(f"retake {lesson['id']}#{sec['key']} sentence {i} ({verdict['why']}): {s[:60]}")
                    w, sr = synth([s], seed + 1000 * tries + i)
                    take = trim(w[0], sr, np)
                    v = judge(s, take, sr)
                    if v["ok"] or v["rank"] > verdict["rank"]:
                        out[i], verdict = take, v
                if not verdict["ok"]:
                    flagged += 1
                    log(f"FLAGGED {lesson['id']}#{sec['key']} sentence {i} kept after {tries} retakes ({verdict['why']}): {s[:80]} => {(verdict['heard'] or '')[:80]}")
            chunks, starts, t = [], [], 0.0
            for i, w in enumerate(out):
                starts.append(round(t, 2))
                gap = GAP_AFTER_HEADING if i == 0 else (TAIL if i == len(out) - 1 else GAP)
                chunks += [w, np.zeros(int(sr * gap), dtype=np.float32)]
                t += (len(w) + int(sr * gap)) / sr
            pcm = np.concatenate(chunks)
            rel = Path(lang) / lesson["id"] / f"{sec['key']}-{sec['hash']}.opus"
            dest = audio / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                with wave.open(tmp.name, "wb") as wf:
                    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr)
                    wf.writeframes((np.clip(pcm, -1, 1) * 32767).astype("<i2").tobytes())
                duration = encode(Path(tmp.name), dest)
                os.unlink(tmp.name)
            entry = manifest["lessons"].setdefault(lesson["id"], {"sections": []})
            entry["sections"] = [s for s in entry["sections"] if s["key"] != sec["key"]] + [
                {"key": sec["key"], "hash": sec["hash"], "file": str(rel), "duration": duration, "starts": starts}]
            order = {s["key"]: i for i, s in enumerate(lesson["sections"])}
            entry["sections"].sort(key=lambda s: order.get(s["key"], 999))
            write_json(manifest_path, manifest)
            took = time.monotonic() - ts
            rendered += 1; audio_s += duration; synth_s += took
            log(f"ok {rendered}/{len(todo)} {lesson['id']}#{sec['key']} {duration:.1f}s audio in {took:.1f}s "
                f"(rtf {took / max(duration, 0.1):.2f}) {mem_available_gb():.1f} GB free")
    finally:
        del model
        torch.cuda.empty_cache()
        lockfile.unlink(missing_ok=True)
    finish_lessons(lessons, manifest, manifest_path, audio, done)
    log(f"{'stopped' if stop['now'] else 'done'}: {rendered} section(s), {audio_s / 60:.1f} min of audio in {synth_s / 60:.1f} min, "
        f"{retries} retake(s), {flagged} sentence(s) flagged, {deaf['n']} not heard (Whisper down); the model is unloaded")


def finish_lessons(lessons, manifest, manifest_path, audio, done):
    """Each rendered lesson keeps only its current sections; files nothing points at are removed."""
    for lesson in lessons:
        entry = manifest["lessons"].get(lesson["id"])
        if not entry:
            continue
        current = {s["hash"] for s in lesson["sections"]}
        entry["sections"] = [s for s in entry["sections"] if s["hash"] in current]
        keep = {s["file"] for s in entry["sections"]}
        d = audio / manifest_path.stem / lesson["id"]
        if d.exists():
            for f in d.glob("*.opus"):
                if str(f.relative_to(audio)) not in keep:
                    f.unlink()
        if not entry["sections"]:
            del manifest["lessons"][lesson["id"]]
    write_json(manifest_path, manifest)


if __name__ == "__main__":
    main()
