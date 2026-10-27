#!/usr/bin/env bash
# Copy NoeticEcho's design tokens and fonts from an EchoBaby checkout into design/.
# Usage: scripts/sync-tokens.sh /path/to/EchoBaby
# The tokens are upstream's; do not edit design/tokens.css by hand. Change upstream and run this again.
#
# Fonts: upstream ships seven unicode-range subsets. The textbook is Russian with English terms
# and needs three: latin (digits, punctuation, « » — … ), cyrillic (ё, №) and latin-ext (₽, ō).
# Only those faces are kept and copied; the rest would never be fetched by a page, but Vite would
# still emit them and the service worker would precache every one. tests/unit/fonts.test.ts fails
# when content starts to use a character only a dropped subset covers: add it to SUBSETS then.
set -euo pipefail

SUBSETS="${SUBSETS:-latin latin-ext cyrillic}"

src="${1:?usage: scripts/sync-tokens.sh /path/to/EchoBaby}"
tokens="$src/design/tokens"
fonts="$src/design/assets/fonts"
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/design"

# Drop every @font-face whose file is not one of $SUBSETS (named <family>-<weight>-<subset>.woff2).
keep_subsets() {
	awk -v keep=" $SUBSETS " '
		/^@font-face/ { buf = $0 "\n"; inface = 1; next }
		inface { buf = buf $0 "\n" }
		inface && /^}/ {
			inface = 0
			if (match(buf, /-(400i?|500|600)-[a-z-]+\.woff2/)) {
				sub_ = substr(buf, RSTART, RLENGTH); sub(/^-[0-9i]+-/, "", sub_); sub(/\.woff2$/, "", sub_)
				if (index(keep, " " sub_ " ")) printf "%s", buf
			}
			next
		}
		!inface { print }
		END { print "/* Subsets kept by scripts/sync-tokens.sh:" keep "(design/PROVENANCE.md). */" }
	'
}

mkdir -p "$out/fonts"
sha="$(git -C "$src" rev-parse HEAD)"

{
	echo "/* Copied from NoeticEcho/EchoBaby design/tokens/ at $sha by scripts/sync-tokens.sh. */"
	echo "/* Do not edit here: change upstream and copy again. See design/PROVENANCE.md. */"
	for f in colors spacing typography motion fonts; do
		echo
		echo "/* ---- design/tokens/$f.css ---- */"
		# fonts.css points at ../assets/fonts/; here the files sit beside this file in fonts/.
		sed 's#url(\.\./assets/fonts/#url(./fonts/#g' "$tokens/$f.css" |
			if [ "$f" = fonts ]; then keep_subsets; else cat; fi
	done
} > "$out/tokens.css"

rm -f "$out"/fonts/*.woff2
grep -o 'url(\./fonts/[^)]*\.woff2' "$out/tokens.css" | sort -u | while read -r rel; do
	cp "$fonts/${rel#url(./fonts/}" "$out/fonts/"
done

echo "$sha"
