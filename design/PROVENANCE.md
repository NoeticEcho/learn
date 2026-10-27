# Provenance of `design/`

**Do not edit here; change upstream and copy again** (`scripts/sync-tokens.sh <EchoBaby checkout>`).

| What | Source |
|---|---|
| `tokens.css` | `NoeticEcho/EchoBaby` `design/tokens/` — `colors.css`, `spacing.css`, `typography.css`, `motion.css`, `fonts.css`, concatenated in that order with their generated headers kept. Upstream generates them from `tokens.dtcg.json` by `build.js`. |
| `fonts/*.woff2` | `NoeticEcho/EchoBaby` `design/assets/fonts/`: the 51 files `fonts.css` references (Literata 400/400i/500, IBM Plex Sans 400/500/600, JetBrains Mono 400/500; latin, latin-ext, cyrillic, cyrillic-ext, greek, vietnamese, and greek-ext for Literata). |
| `fonts/OFL-*.txt` | The SIL Open Font License 1.1 texts of the three families, from `google/fonts` `ofl/{literata,ibmplexsans,jetbrainsmono}/OFL.txt`. Upstream ships the fonts without them; they are required to redistribute the files. |

**Copied from commit** `5c495aa1af19bd65ce8ffbcbdf0d4e4127fa6e00` of EchoBaby, on 2026-10-27.

## The one mechanical change

`fonts.css` points at `../assets/fonts/…`, relative to upstream's `tokens/` directory. Here the
files sit beside `tokens.css` in `fonts/`, so the copy script rewrites those `url()`s to
`./fonts/…`. Nothing else in the CSS is changed.

## What is local, not upstream

- The Paper theme is upstream's: `colors.css` carries a `[data-theme="paper"]` block, so nothing
  had to be mapped locally.
- `src/app.css` applies the tokens (base type, focus, reduced motion). It is the app's own and
  is not part of the design system.
