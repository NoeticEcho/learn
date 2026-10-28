"""Transcribes rendered sections with Whisper, the listening test this pipeline can run itself.

Each section's Opus file, as it will be served, goes to Lemonade's whisper.cpp
(Whisper-Large-v3-Turbo, http://localhost:13305) and the text it heard is written to a JSON
file. `npm run narration -- wer --transcripts <file>` then scores it against the script.
Local only, like the renderer. A section already transcribed at the same hash is skipped.

usage: transcribe.py --audio ../learn-audio --out private/narration/transcripts.ru.json
                     [--parts 0,1] [--lessons id,id]
"""
import argparse, json, os, subprocess, tempfile
from pathlib import Path

API = "http://localhost:13305/api/v1/audio/transcriptions"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--lang", default="ru")
    ap.add_argument("--out", required=True)
    ap.add_argument("--parts")
    ap.add_argument("--lessons")
    a = ap.parse_args()
    audio = Path(a.audio)
    manifest = json.loads((audio / f"{a.lang}.json").read_text(encoding="utf-8"))
    out_path = Path(a.out)
    out = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {}
    parts = {int(p) for p in a.parts.split(",")} if a.parts else None
    ids = set(a.lessons.split(",")) if a.lessons else None
    for lid, entry in sorted(manifest["lessons"].items()):
        if parts is not None and int(lid[:2]) not in parts:
            continue
        if ids is not None and lid not in ids:
            continue
        for s in entry["sections"]:
            have = out.get(lid, {}).get(s["key"])
            if have and have["hash"] == s["hash"]:
                continue
            with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
                subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(audio / s["file"]),
                                "-ar", "16000", "-ac", "1", tmp.name], check=True)
                r = subprocess.run(["curl", "-sf", API, "-F", "model=Whisper-Large-v3-Turbo", "-F", f"language={a.lang}",
                                    "-F", "response_format=json", "-F", f"file=@{tmp.name}"], capture_output=True, text=True)
            if r.returncode:
                print(f"{lid}#{s['key']}: whisper failed ({r.returncode})", flush=True)
                continue
            # whisper.cpp wraps its lines mid-word; a line break between words comes with its space
            text = json.loads(r.stdout)["text"].replace("\n", "").strip()
            out.setdefault(lid, {})[s["key"]] = {"hash": s["hash"], "text": text}
            tmp_out = out_path.with_suffix(".tmp")
            tmp_out.write_text(json.dumps(out, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
            os.replace(tmp_out, out_path)
            print(f"{lid}#{s['key']}: {len(text)} chars", flush=True)


if __name__ == "__main__":
    main()
