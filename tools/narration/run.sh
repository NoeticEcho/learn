#!/usr/bin/env bash
# Renders the Russian course's narration part by part, unattended, then stops (docs/narration.md).
#
#   tools/narration/run.sh [parts…]        # default: every part, 0 to 16
#
# For each part: render what is missing or changed (resumable), transcribe it with Whisper,
# publish its audio to NoeticEcho/learn-audio, then the manifest to NoeticEcho/learn's main, which
# is what makes «Слушать» appear on that part's lessons. After the last part: the WER report.
# Progress goes to private/narration/run.log (and the renderer's own lines to render.log). A render
# that dies is tried again, three times. Run it again with the same arguments to resume: a
# rendered section is never rendered twice.
#
# Environment: LEARN_AUDIO (default ../learn-audio beside this checkout), PUBLISH=0 to render
# without pushing anything.
set -uo pipefail
here=$(cd "$(dirname "$0")/../.." && pwd)
cd "$here"
audio=${LEARN_AUDIO:-$(cd "$here/.." && pwd)/learn-audio}
logs=${NARRATION_LOGS:-$(cd "$(git rev-parse --git-common-dir)/.." && pwd)/private/narration}
py=${NARRATION_PYTHON:-$HOME/.cache/learn-tts/venv-qwen-sys/bin/python}
publish=${PUBLISH:-1}
mkdir -p "$logs"
log() { echo "$(date -Iseconds) $*" | tee -a "$logs/run.log"; }
parts=("$@")
[ ${#parts[@]} -eq 0 ] && parts=($(seq 0 16))
export MIOPEN_FIND_MODE=FAST

log "run: parts ${parts[*]}, audio $audio, pid $$"
node scripts/narration.ts script --out .cache/narration/ru.scripts.json >> "$logs/run.log" 2>&1 || { log "script failed"; exit 1; }

for p in "${parts[@]}"; do
	log "part $p: render"
	for attempt in 1 2 3; do
		"$py" -I tools/narration/render.py --scripts .cache/narration/ru.scripts.json --audio "$audio" --parts "$p" --log "$logs/render.log" >> "$logs/run.log" 2>&1
		rc=$?
		[ $rc -eq 0 ] && break
		log "part $p: render failed ($rc), attempt $attempt"
		sleep 60
	done
	if [ $rc -ne 0 ]; then log "part $p: render failed three times; stopping"; exit $rc; fi
	if grep -q "stopped:" <(tail -1 "$logs/render.log"); then log "part $p: render was stopped; stopping"; exit 3; fi
	log "part $p: transcribe"
	"$py" -I tools/narration/transcribe.py --audio "$audio" --out "$logs/transcripts.ru.json" --parts "$p" >> "$logs/run.log" 2>&1 || log "part $p: transcription failed (Lemonade down?); going on"
	if [ "$publish" = 1 ]; then
		if tools/narration/publish.sh audio "part $p" >> "$logs/run.log" 2>&1; then
			tools/narration/publish.sh manifest >> "$logs/run.log" 2>&1 && log "part $p: published" || log "part $p: publishing the manifest failed; going on"
		else
			log "part $p: publishing the audio failed; going on"
		fi
	fi
done

node scripts/narration.ts wer --transcripts "$logs/transcripts.ru.json" --out "$logs/wer-ru.json" > "$logs/wer-ru.txt" 2>&1
log "wer: $(tail -1 "$logs/wer-ru.txt")"
log "run: done"
