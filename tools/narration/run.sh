#!/usr/bin/env bash
# Renders a course's narration part by part, unattended, then stops (docs/narration.md).
#
#   tools/narration/run.sh [parts…]                    # the Russian course; default: every part, 0 to 16
#   NARRATION_LANG=en tools/narration/run.sh [parts…]  # the English one, with logs of its own (run-en.log)
#
# For each part: render what is missing or changed (resumable), transcribe it with Whisper,
# publish its audio to NoeticEcho/learn-audio, then the manifest to NoeticEcho/learn's main, which
# is what makes «Слушать» («Listen») appear on that part's lessons. After the last part: the WER report.
# Progress goes to private/narration/run.log (and the renderer's own lines to render.log); the English
# run's files carry -en (run-en.log, render-en.log, transcripts.en.json, wer-en.txt), so Russian's stay as they are. A render
# that dies is tried again, three times. Run it again with the same arguments to resume: a
# rendered section is never rendered twice.
#
# Environment: NARRATION_LANG (ru or en, default ru), LEARN_AUDIO (default ../learn-audio beside this
# checkout), PUBLISH=0 to render without pushing anything, AUDIO_TREE_MAX_MB (default 900): the run stops
# before a part that could take the audio repository's tree past it (Pages allows 1 GB).
set -uo pipefail
here=$(cd "$(dirname "$0")/../.." && pwd)
cd "$here"
audio=${LEARN_AUDIO:-$(cd "$here/.." && pwd)/learn-audio}
logs=${NARRATION_LOGS:-$(cd "$(git rev-parse --git-common-dir)/.." && pwd)/private/narration}
py=${NARRATION_PYTHON:-$HOME/.cache/learn-tts/venv-qwen-sys/bin/python}
publish=${PUBLISH:-1}
lang=${NARRATION_LANG:-ru}
case "$lang" in ru) sfx="" ;; en) sfx="-en" ;; *) echo "NARRATION_LANG must be ru or en" >&2; exit 2 ;; esac
runlog="$logs/run$sfx.log"; renderlog="$logs/render$sfx.log"
treemax=${AUDIO_TREE_MAX_MB:-900}
export NARRATION_LANG="$lang"
mkdir -p "$logs"
log() { echo "$(date -Iseconds) $*" | tee -a "$runlog"; }
tree_mb() { du -sm --exclude=.git "$audio" | cut -f1; }
parts=("$@")
[ ${#parts[@]} -eq 0 ] && parts=($(seq 0 16))
export MIOPEN_FIND_MODE=FAST

log "run: ${sfx:+$lang, }parts ${parts[*]}, audio $audio, pid $$"
node scripts/narration.ts script --lang "$lang" --out ".cache/narration/$lang.scripts.json" >> "$runlog" 2>&1 || { log "script failed"; exit 1; }

for p in "${parts[@]}"; do
	# a part adds at most about 60 MB (the largest of Russia's was 45): stop before one that could pass the limit
	if [ "$(( $(tree_mb) + 60 ))" -gt "$treemax" ]; then log "part $p: the audio tree is $(tree_mb) MB and the limit $treemax MB; stopping"; exit 4; fi
	log "part $p: render"
	for attempt in 1 2 3; do
		"$py" -I tools/narration/render.py --scripts .cache/narration/$lang.scripts.json --audio "$audio" --parts "$p" --log "$renderlog" >> "$runlog" 2>&1
		rc=$?
		[ $rc -eq 0 ] && break
		log "part $p: render failed ($rc), attempt $attempt"
		sleep 60
	done
	if [ $rc -ne 0 ]; then log "part $p: render failed three times; stopping"; exit $rc; fi
	if grep -q "stopped:" <(tail -1 "$renderlog"); then log "part $p: render was stopped; stopping"; exit 3; fi
	log "part $p: transcribe"
	"$py" -I tools/narration/transcribe.py --audio "$audio" --lang "$lang" --out "$logs/transcripts.$lang.json" --parts "$p" >> "$runlog" 2>&1 || log "part $p: transcription failed (Lemonade down?); going on"
	if [ "$publish" = 1 ]; then
		if tools/narration/publish.sh audio "part $p" >> "$runlog" 2>&1; then
			tools/narration/publish.sh manifest >> "$runlog" 2>&1 && log "part $p: published" || log "part $p: publishing the manifest failed; going on"
		else
			log "part $p: publishing the audio failed; going on"
		fi
	fi
done

node scripts/narration.ts wer --lang "$lang" --transcripts "$logs/transcripts.$lang.json" --out "$logs/wer-$lang.json" > "$logs/wer-$lang.txt" 2>&1
log "wer: $(tail -1 "$logs/wer-$lang.txt")"
log "run: done"
