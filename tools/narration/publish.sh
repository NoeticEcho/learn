#!/usr/bin/env bash
# Publishes narration (docs/narration.md).
#
#   tools/narration/publish.sh audio [what]   commit and push NoeticEcho/learn-audio's new files
#   tools/narration/publish.sh manifest       copy its manifest into NoeticEcho/learn's
#                                             content/narration/ru.json on main, and push
#
# NARRATION_LANG=en does the same for the English edition: en/ and en.json in the audio repository,
# content/narration/en.json in this one. Russian's files, and so its commits, are not touched by it.
#
# Audio first, always: the manifest names files, and a manifest that reaches the site before its
# files would offer «Слушать» on audio that is not there yet. The manifest is committed from a
# throwaway worktree at origin/main, so nobody's working tree is touched, and a push that loses
# a race with another commit is rebased and tried again.
set -euo pipefail
here=$(cd "$(dirname "$0")/../.." && pwd)
audio=${LEARN_AUDIO:-$(cd "$here/.." && pwd)/learn-audio}
lang=${NARRATION_LANG:-ru}
case "$lang" in ru) sfx="" ;; en) sfx=" (en)" ;; *) echo "NARRATION_LANG must be ru or en" >&2; exit 2 ;; esac
trailer="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

push_retry() { # dir ref
	for i in 1 2 3 4 5; do
		git -C "$1" push origin "$2" && return 0
		sleep $((i * 10))
		git -C "$1" fetch -q origin && git -C "$1" rebase -q origin/main || return 1
	done
	return 1
}

case "${1:-}" in
audio)
	git -C "$audio" add -A "$lang" "$lang.json" README.md .gitignore .nojekyll 2>/dev/null || git -C "$audio" add -A "$lang" "$lang.json"
	if git -C "$audio" diff --cached --quiet; then echo "audio: nothing new"; exit 0; fi
	n=$(git -C "$audio" diff --cached --name-only -- '*.opus' | wc -l)
	git -C "$audio" commit -q -m "Narration${sfx}: ${2:-update}, $n file(s)" -m "$trailer"
	push_retry "$audio" HEAD:main
	echo "audio: pushed $n file(s)"
	;;
manifest)
	tmp=$(mktemp -d)
	git -C "$here" fetch -q origin
	git -C "$here" worktree add -q --detach "$tmp/learn" origin/main
	trap 'git -C "$here" worktree remove --force "$tmp/learn"; rm -rf "$tmp"' EXIT
	# never point at files the audio repository's main does not have
	if [ -n "$(git -C "$audio" status --porcelain -- "$lang" "$lang.json")" ] || [ "$(git -C "$audio" rev-parse HEAD)" != "$(git -C "$audio" rev-parse origin/main 2>/dev/null)" ]; then
		echo "manifest: learn-audio has unpublished changes; run '$0 audio' first" >&2
		exit 1
	fi
	cp "$audio/$lang.json" "$tmp/learn/content/narration/$lang.json"
	if git -C "$tmp/learn" diff --quiet; then echo "manifest: unchanged"; exit 0; fi
	lessons=$(python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1]))["lessons"]))' "$audio/$lang.json")
	git -C "$tmp/learn" add "content/narration/$lang.json"
	git -C "$tmp/learn" commit -q -m "Narration${sfx}: the manifest, $lessons lesson(s) rendered" -m "$trailer"
	push_retry "$tmp/learn" HEAD:main
	echo "manifest: pushed ($lessons lessons)"
	;;
*)
	sed -n 2,11p "$0"
	exit 2
	;;
esac
