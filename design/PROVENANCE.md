# Provenance of `design/`

**Do not edit here; change upstream and copy again** (`scripts/sync-tokens.sh <EchoBaby checkout>`).

| What | Source |
|---|---|
| `tokens.css` | `NoeticEcho/EchoBaby` `design/tokens/` — `colors.css`, `spacing.css`, `typography.css`, `motion.css`, `fonts.css`, concatenated in that order with their generated headers kept. Upstream generates them from `tokens.dtcg.json` by `build.js`. |
| `fonts/*.woff2` | `NoeticEcho/EchoBaby` `design/assets/fonts/`: of the 51 files `fonts.css` references (Literata 400/400i/500, IBM Plex Sans 400/500/600, JetBrains Mono 400/500; seven subsets), the 24 of the subsets latin, latin-ext and cyrillic. |
| `fonts/OFL-*.txt` | The SIL Open Font License 1.1 texts of the three families, from `google/fonts` `ofl/{literata,ibmplexsans,jetbrainsmono}/OFL.txt`. Upstream ships the fonts without them; they are required to redistribute the files. |

**Copied from commit** `5c495aa1af19bd65ce8ffbcbdf0d4e4127fa6e00` of EchoBaby, on 2026-10-27.

## The two mechanical changes

`fonts.css` points at `../assets/fonts/…`, relative to upstream's `tokens/` directory. Here the
files sit beside `tokens.css` in `fonts/`, so the copy script rewrites those `url()`s to
`./fonts/…`.

The copy script also keeps only the `@font-face` rules of the subsets in its `SUBSETS` (latin,
latin-ext, cyrillic), and copies only their files. The course sets no Greek, Vietnamese or
extended-Cyrillic letter, so those faces would never be fetched by a page, but Vite emitted them
and the service worker precached them. `tests/unit/fonts.test.ts` fails when content starts to use
a letter the kept subsets do not cover; widen `SUBSETS` then. Nothing else in the CSS is changed.

## What is local, not upstream

- The Paper theme is upstream's: `colors.css` carries a `[data-theme="paper"]` block, so nothing
  had to be mapped locally.
- `src/app.css` applies the tokens (base type, focus, reduced motion). It is the app's own and
  is not part of the design system.
