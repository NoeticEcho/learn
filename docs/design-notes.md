# Design notes

What the hallmark audit found in the app's own design language, what was fixed, and what was
kept with a reason (plan 1, Task 16 Step 4; spec §4.7, §6).

## The audit of 27.10.2026

**Scope.** The prologue (the question screen, the 2025 frame and the Искин frame), the
returning person's home, one lesson (`00-start/01-how-to-learn`), the map and settings. Each
was checked at 1280 × 800, 1440 × 900, 1920 × 1080 and 375 × 812, in Ink and in Paper, on a
local `npm run build && npm run preview` and on the live site. The 1991 to 2014 prologue frames
were left out: they are meant to look like their eras. Эхо, the mascot in `design/mascot/`, is
approved by Martin and was not judged.

**Method.** hallmark 2.0.0, `audit`: the Floor, the gates of `gates.md` § 4 and the judged
clauses of § 5, walked by hand from the screenshots and the source. Its `sloplint.mjs` was not
run: the skill was fetched as reference, and running a fetched script was outside the brief.
So the static gates were checked with searches over `src/` (token literals, `transition: all`,
layout animation, `100vw`, removed outlines, tracked capitals, middle dots and arrows in the
catalogue), and the render gates by eye.

**Genre and scope.** Editorial (stamped in `src/app.css`). The prologue's question screen is the
one marketing-shaped screen; everything else is an app screen in hallmark's sense (`flow.md`
§ App screens: a screen someone works in), where the hero, fold, screen-budget and thin-section
gates step aside.

### Floor

| Gate | Finding | What was done |
|---|---|---|
| 40 | Field edges under 3:1. Inputs, selects and textareas were drawn with `--border-rule` (2.0:1 on Ink, 1.7:1 on Paper) or `--border-hairline` (about 1.5:1): the quiz's select and code field, the editor, the guide's question, the prologue's and settings' fields. | A new app token, `--field-edge: var(--text-muted)`, in `src/app.css`, used by every field. Muted text holds 3:1 or more in both themes. Upstream's rule and hairline stay what they are: separators. |
| all others | None found: every colour and face goes through a token, focus is a global instant `:focus-visible` ring that holds 3:1 in both themes, every animation is under the global reduced-motion rule, `html` and `body` clip overflow-x, no horizontal scroll at any audited width, no eyebrow, no tracked caps, no middle-dot strings, no invented figures, the question screen's headline, sentence and primary action fit 1280 × 800. | |

### Reflex

| Gate | Finding | What was done |
|---|---|---|
| 64 | Mono as costume: the quiz's «Вопрос 1 из 5» and the order question's step numbers were set in JetBrains Mono, though neither is code. | Body face with tabular numerals. Mono stays where the text is code or a file name: the editor, the practice tabs, the solution's file names, a script error. |
| 77, 44a | The Искин frame sat in the left half of a wide stage, the right half empty. | The frame's content is centred in the stage. |
| 26b | The progress file picker was the browser's grey native button, outside the system's controls. | `::file-selector-button` in the secondary recipe, with hover and active. |
| spacing | In settings, the project-kind select touched the label of the field grid below it. | A space step below it. |
| 77, 79 | The returning home is a left column with the right of the screen empty at 1280 and up. | **Kept.** It is an app screen (the next lesson, the streak, the backup line), where the thin-section and dead-band gates do not apply, and filling it would mean a picture or a figure the page does not have. |
| 69 | «Уроки этой части ещё пишутся» repeats under each unwritten part of the map. | **Kept.** It is a status per part, as a ledger repeats a value; it goes away part by part as content lands. |

### Finish (answered, never blocking)

- **F20**, a lone item on the last row: the lesson's four cards (three, then one) and the map's
  part 16. Kept: the grids follow the content's count, which changes per lesson and per part.
- **F16**: `::selection` and `caret-color` are themed; `scrollbar-color` is not. Kept: the
  browser's scrollbar follows `color-scheme`, which the app sets.

### Not changed, and why

- **The design system's own tokens** (`design/tokens.css`) are upstream's, copied with
  provenance. A fix that belongs there (the rule's contrast as a field edge) was made as an app
  token beside them, not as an edit to the copy.
- **Paper's Эхо** reads lighter than Ink's. The mascot is approved as drawn.
