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

## Fonts (27.10.2026)

Martin: «шрифты лучше интегрируй в движок, а не скачивай с гугл шрифтов». They already were: the
three families are upstream's woff2 files in `design/fonts/`, imported through `design/tokens.css`,
emitted by Vite into `_app/immutable/` under content hashes and precached by the service worker,
and the live site was checked to make no request to Google. What changed is what was shipped
beyond what the course uses.

- **Families and faces.** Literata 400, 500 and 400 italic (titles, quotes, `<em>`), IBM Plex Sans
  400, 500, 600 (UI, body), JetBrains Mono 400, 500 (code). A crawl of all 70 pages at 1280 and
  375 found every one of them in use. The files are variable fonts, so 400 and 500 (and 600) are
  byte-identical and Vite emits one file for them: weights cost nothing to keep.
- **Subsets.** Latin (digits, « » — … ), Cyrillic (ё, №) and Latin Extended (₽, ō) are used; Greek,
  Greek Extended, Vietnamese and Cyrillic Extended are not, and are no longer copied
  (`scripts/sync-tokens.sh`, `SUBSETS`). `unicode-range` already kept a page from fetching them,
  but the build emitted 24 font files and the service worker precached all of them: 430 KB, now 12
  files and 301 KB. `tests/unit/fonts.test.ts` fails when content uses a letter outside the kept
  subsets.
- **No data: fonts.** Vite inlined the three smallest faces (under 4 KB) as base64 into the CSS,
  and the CSS is inlined into every page: 17 KB of every HTML file, 7 KB gzipped, paid on every
  page instead of cached once. `build.assetsInlineLimit` now never inlines a `.woff2`.
- **CSP.** `font-src 'self'` (was `'self' data:`); `style-src` and `connect-src` never named Google.
  A practice preview inherits the policy, so a person's `@font-face` there now falls back to the
  system faces, data: ones included; the preview's own policy (`sandbox.ts`) is unchanged.
- **Preload.** Unchanged: the four faces of the first screen (Literata and Plex Sans 400,
  Cyrillic and Latin), `font-display: swap` everywhere.
- **Measured** (Lighthouse, 3 runs each, the same static server on a private port for both
  builds): home LCP 2552 → 2403 ms, HTML 18.9 → 11.6 KB transferred; the lesson 02-html/01 LCP
  3001 → 2854 ms (median; its runs land on 2854 or 3002 either way), HTML 41.8 → 34.4 KB. Font bytes a visit transfers are unchanged (136 KB home, 177 KB that
  lesson). Screenshots of home and two lessons at 1280 and 375 are pixel-identical before and
  after. `tests/e2e/fonts.spec.ts` checks the build names no Google host and inlines no font, and
  that the faces are same-origin and come back offline.

## Эхо crossing the eras, and whose textbook this is (27.10.2026)

Martin: the returning home had an empty right column on a computer; put Эхо there, crossing the
digital eras, and say that this is a NoeticEcho project, the last textbook of the era before AI.

- **The scene** (`src/lib/home/EraScene.svelte`), at 1024 px and wider only, beside the hero and
  the path. A window shows one era's web at a time, in that era's own colours, which the hallmark
  token gates leave alone as they do the prologue's frames: 1991 (text and blue links), 1996
  (grey, a table, a hit counter, under construction), 2000 (the portal and «Skip intro»), 2005
  (glossy, beta), 2014 (flat), 2019 (a design system), 2025 (a chat) and Искин (agents, a check).
  Each holds 3.2 s and glides on in 0.8 s, away behind Эхо, whose ring lights the dot of the era
  in the window. Эхо is the approved `design/mascot/echo.svg`, untouched: the lit dots are a
  layer over the ring, faded, because the ring's own `era-<n>` class repaints fill and radius.
- **Motion** is transform and opacity only. The scene is fetched only on a wide screen, after home
  is drawn, and starts two frames after mount, on 2025 where its still pose is, so it does not
  jump. It stops on hover, while «Остановить анимацию» is pressed (an auto-playing animation
  longer than five seconds must have a pause, WCAG 2.2.2) and while the tab is hidden. Under
  reduced motion it is a still: Эхо, the window on 2025, Искин next. Its box is reserved, so
  nothing moves when it arrives. On Ink the eras are dimmed to 86%, so a white 1991 page does not
  outshine the text.
- **The line**, under the scene and under the question screen's lede, everywhere: «Проект
  NoeticEcho. Последний учебник эпохи до ИИ. Кто понимает, как устроен веб, тот ставит ИИ задачи
  и проверяет ответы, а не верит в магию.» It does not say AI makes learning pointless; it says
  understanding is what lets a person direct the machine.
- **Measured:** the question screen (the first visit, and the LCP page) LCP 2403 → 2403 ms, CLS 0,
  performance 0.98, accessibility 1.00 before and after; first-route JS 54.8 KB of 150.
  `tests/e2e/scene.spec.ts`: the scene moves on a wide screen and its button stops it, is still
  under reduced motion, and is neither shown nor fetched on a phone.

## The comic rail and the second review (27.10.2026)

Martin: «на текстовых уроках также справа есть большое пустое пространство — я предлагаю там тоже
разместить что-то вроде рисованного комикса с маскотом Эха в стиле дизайна NoeticEcho — да и в
целом, просмотреть все страницы и шаблоны уроков на предмет качественного дизайна и улучшений».

### The comic

A lesson's `comic` (format in `docs/content-plan/README.md`, «Комикс»; code in `src/lib/comic/`)
is two to four panels of Эхо with one prop each, written for all 13 lessons of parts 0 and 1.

- **Where.** From 1100 px it is a column of 16 to 21 rem a gutter after the theory, which keeps
  its measure; the composition stays left with the header rather than pushing the rail to the
  container's edge. It is sticky inside the theory and ends with it, so it never reaches the
  practice. Its top is `min(32px, 100dvh − its height − 32px)`, the height measured by a
  ResizeObserver: a rail taller than the screen (1100 × 800) scrolls with the text until its last
  panel shows, then stays. Below 1100 px it is a strip under the header, a panel and the next
  one's edge, scrolled sideways inside itself and run to the screen's edges; it takes a tab stop
  only while it scrolls (axe's scrollable-region rule), never on a wide screen.
- **Panel.** A rule-edged frame on the body surface: a caption in the corner (secondary text on
  the canvas: on Paper's inset it was 4.0:1, found by axe), the lines as bubbles above the
  drawing, Эхо's edged in its own echo light, a prop's in the plain rule, a tail pointing down at
  the speaker. Эхо's words are Literata, the guide's voice in the tokens.
- **Drawing.** One SVG, `aria-hidden`; the mascot nested inside it from `design/mascot/echo.svg`
  with its `<title>` removed and its gradient id made unique per panel, in the panel's mood and
  era. It is still: the guide's idle motion beside text being read was a distraction. Props are
  line drawings in tokens; a CRT's glass is the one pinned colour (`--crt-ground`, Ink's canvas),
  because the phosphor amber only reads on black and Paper inverts the ink ramp.
- **Text.** Every word is in the list as text, each line named for its speaker («Эхо: …»,
  «Сервер: …»), so nothing lives only in the drawing. Labels drawn on props repeat what a line says.
- **Motion.** The panels arrive (opacity and 8 px, `--dur-ui`, 120 ms apart) as a self-running
  CSS animation inside `prefers-reduced-motion: no-preference`; there is none under reduce
  (`tests/e2e/comic.spec.ts` checks both, and placement at 1100, 1280, 1440 and 1600).
- **Cost.** No new JavaScript on the first route (54.6 KB of 150); a lesson's HTML grows by the
  inlined mascot, about 7 KB per panel before gzip, which compresses to almost nothing as the
  copies repeat.

**Gates, read for the comic.**

| Gate | Reading |
|---|---|
| 80 (Reflex), the drawn illustration | **Waived**: Martin asked for a drawn comic with the mascot; the mascot is approved and reused, never redrawn, and the props are drawn in the same line language. |
| 47a (Floor), a drawn browser bar | Not a frame standing for a screenshot of a product: a browser is the subject of these lessons, drawn as an object in a comic. To stay clear of the tell, the browser prop has no traffic lights; it is a window and its address field. The 1996 window keeps a title bar because the 1996 bevel is what the panel is about. |
| 64 (Reflex), mono as costume | Fixed: drawn labels are in the body face; mono only on a CRT, an address field, a file name and packet numbers. |
| 75 (Reflex), text that strains | **Answered**: labels drawn on props render at about 9 px. They are decoration inside an `aria-hidden` drawing and every one repeats a line set at 14 px. |
| 19 (Floor), dashes | Fixed: five comic lines had an em dash; the lessons' house style writes «Интернет это дороги». |
| 62 (Floor), hidden at rest | Passes: the reveal is a self-running CSS animation from visible-by-default markup. |

### The review

Walked at 360, 768, 1280 and 1600, Ink and Paper, on a private build: a lesson with practice
(02-html/01), lessons with comics (all of parts 0 and 1), the map, review, gallery, settings with
the brief editor, the prologue's seven frames, the error page, and the empty states.

| Where | Finding | Gate | What was done |
|---|---|---|---|
| Brief editor | `font-size: var(--text-body)` twice: that token is the body *colour* (the size is `--text-body-size`), so the declaration was invalid and the size only inherited by luck | tokens | The size token. |
| Brief editor | Group heads («Люди», «Доказательства») sat 28 px under the add button above them and 16 px over their list | 71 | 32 px above a group head; sections padded 24 px. |
| Settings | The progress file picker said «Choose File / No file chosen» in an English browser: the native control speaks the browser's language, not the page's | 26b, copy | A label styled as the secondary button, «Выбрать файл с прогрессом», and «Файл не выбран» or the file's name; the input stays real and focusable, its ring drawn on the button. |
| Practice | A check's line showed its regex: «начинается как нужно (^tel:)», and elsewhere `^\s*\S[\s\S]{48,158}` | copy | A plain pattern is said in words («начинается с tel:», «Атрибут href у a: #top»); anything else is «подходит под образец». Unit-tested. |
| Lesson, «Дальше» and map | Concept titles mid-sentence kept their capitals: «Теперь вы знаете: Структура HTML-документа, Теги» | copy | `midSentence`: a Russian common noun loses its capital; acronyms, Latin names and proper names (Яндекс, Искин, Эхо) keep it. |
| Lesson, test | Options ran the container's full 1232 px at 1280, and a rule sat under the heading that no other section has | 25, 9 | 48 rem, no rule. |
| Lesson, header | The «Зачем» lede at 40 ch stood as a five-line ragged column | 25 | 52 ch. |
| Map | About 150 edges drawn in brass at all times read as noise, not as a graph | 9, restraint | Edges are hairlines at rest; pointing at or focusing a lesson lights its edges in brass and outlines the lessons it needs and opens. |
| Gallery | «Эта версия появится, когда вы дойдёте до практики этой эпохи» eight times over | 69 | Said once in the lede; each empty era links to the lesson where its practice begins, or says its practice is still being written. |
| Review, empty | «Повторять нечего» drawn in the same box as a card to answer | judged | Эхо beside the line, no box, and a way on («Открыть карту»). |
| Error page | A heading and two buttons in an empty screen | judged | Эхо in «hmm» above the heading. |
| Prologue, phone | Stepping the filmstrip at 360 left the next era's year and the top of its frame above the screen | judged | After a step, a frame whose top is above the screen is scrolled to its start (instantly). |

**Performance.** Lighthouse (mobile, 3 runs, the same private static server for both builds):
the lesson 02-html/01 had gone from 2853 to 3152 ms LCP between the build before this work and
after it, though it has no comic. The cause was not the comic: every lesson inlined the whole
catalogue (all lessons' summaries and concepts) for «Дальше», 29 KB gzipped and growing with each
lesson the other parts add, and the HTML crossed a TCP slow-start window (one more round trip).
A lesson now carries the titles of the concepts it teaches and reads which lessons it opens from
the home's hashed list after mount, cached by the service worker. The lesson's HTML went from
47.4 to 18.8 KB gzipped; LCP 2857 ms median again (02-html/01), 3002 ms for 01-internet/05 with
its comic (3004 before the comic); performance 0.93 to 0.95, accessibility 1.00 and 0.99. First-route
JS 55.2 KB of 150. The LCP element is the «Зачем» lede, a text paint waiting on the serif face.

**Checked and not changed.**

- **Heading order in diagrams.** Lighthouse's 0.99 on 01-internet/05 is `heading-order`: the DNS
  diagram's `<h4>` follows the lesson's `<h2>`. 97 `<h4>`s across `content/diagrams/` are the
  authors' convention for a diagram's inner heads; it is theirs to change (an `<h3>`, or a
  `<p>` styled as a head), and was left to them.

- **The editor's gutter** looked misaligned with its lines in full-page screenshots; measured live,
  the gutter's numbers and the lines share their tops to the pixel. It was the screenshot
  catching CodeMirror before its first measure.
- **The preview** was white in the same screenshots for the same reason; the frame holds the page.
- **Cards** keep their grid's count (three, then one: F20, as before).
- **The prologue's frames** are meant to look like their eras and were judged only for the
  phone scroll above.
- **Diagrams** in `content/diagrams/` use rem and em font sizes of their own; they belong to the
  lessons' authors and were left to them.
- **Home** (`src/routes/+page*`) and the fonts are another agent's work and were not touched.
