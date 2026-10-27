#!/usr/bin/env bash
# Copy NoeticEcho's design tokens and fonts from an EchoBaby checkout into design/.
# Usage: scripts/sync-tokens.sh /path/to/EchoBaby
# The tokens are upstream's; do not edit design/tokens.css by hand. Change upstream and run this again.
set -euo pipefail

src="${1:?usage: scripts/sync-tokens.sh /path/to/EchoBaby}"
tokens="$src/design/tokens"
fonts="$src/design/assets/fonts"
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/design"

mkdir -p "$out/fonts"
sha="$(git -C "$src" rev-parse HEAD)"

{
	echo "/* Copied from NoeticEcho/EchoBaby design/tokens/ at $sha by scripts/sync-tokens.sh. */"
	echo "/* Do not edit here: change upstream and copy again. See design/PROVENANCE.md. */"
	for f in colors spacing typography motion fonts; do
		echo
		echo "/* ---- design/tokens/$f.css ---- */"
		# fonts.css points at ../assets/fonts/; here the files sit beside this file in fonts/.
		sed 's#url(\.\./assets/fonts/#url(./fonts/#g' "$tokens/$f.css"
	done
} > "$out/tokens.css"

rm -f "$out"/fonts/*.woff2
grep -o 'assets/fonts/[^)]*\.woff2' "$tokens/fonts.css" | sort -u | while read -r rel; do
	cp "$fonts/${rel#assets/fonts/}" "$out/fonts/"
done

echo "$sha"
