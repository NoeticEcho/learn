# Content plan: all 17 parts

One YAML file per part, as the shape in spec §3.3–3.4 needs it. Each file has:
- the concepts the part teaches;
- 5–8 lessons, each with «Зачем», the concepts it teaches and requires, an idea for a live diagram, a practice step on the person's project brief with its checks in plain words, and the sources and videos.

**How it was made (27.10.2026):**
- Four Sonnet runs drafted the parts from spec §5's source policy.
- The coordinator then checked every URL live: 471 of 474 unique URLs answered 200 (YouTube through oEmbed). Three timed out from here: `book.systemsapproach.org`, `letsencrypt.org/how-it-works`, `tilda.cc/ru/lp/ai`; the nightly link check retries them.
- The coordinator reconciled the concept graph: 128 lessons, 277 concepts, each taught exactly once, no unresolved requirement, and no cycle. 44 guessed cross-part ids were mapped to real ones, and one cycle (Jamstack ⇄ CDN) was cut.

**This is a plan, not lesson text.** The lessons are written from it, to the reference lessons' format. A lesson may refine its plan, and when it does, this file is updated in the same commit.

**Written lessons follow these conventions (parts 0 and 1, 27.10.2026; later parts copy them):**
- A concept id in `content/curriculum.yaml` is the plan's id with the dot written as a dash (`start.project-brief` is `start-project-brief`), because the schema's id pattern has no dot.
- A part's folder is the slug in `curriculum.yaml` (`01-internet`), not the plan's `slug`.
- Live diagrams are Svelte components in `content/diagrams/`, sharing `shared.css`; a lesson imports them by relative path.
- **Checks read the brief by a path** (engine, 28.10.2026). A `field` check's `field` is a path into the brief: a flat field (`name`, `phone`), a nested one (`mainAction.label`, `contacts.address`), an item (`sections[0]`, `items[1].title`), a whole list of values (`sections`, `languages`), or one field of every item (`items[].title`, `people[].name`). A list needs every value, each in the text of some element the selector matches, or `min: N` of them. A `count` bound may be a list's length: `min: { brief: 'sections' }`. Any check may carry `when: { brief: 'languages', contains: 'en' }` (or `equals: 'form'`, or neither for «has a value»), and then passes as skipped for a brief it does not apply to. A path the brief's schema does not have fails `content:check`, so a typo fails the build. The `custom` template has no items, people or proofs: a check on them fails there as an empty field, which tells the person to fill that part of the brief (the brief editor, in settings and in 00-start/04-brief, edits every field), so add `when: { brief: 'items[].title' }` if the step should pass without them. A plan's «not fewer than N» check is now `min: { brief: … }`.
- **Saved practice files are keyed by the step's `id`** (engine, 28.10.2026). Each step keeps its own files, so its starter is what the person sees until they edit it; the id must be unique across the course (`content:check` says so). A starter is still a complete page, so a step works out of order. A step that should start from the person's own page in an earlier step of the same era names it: `continues: '<step id>'`; it then starts from that step's saved work while it has none of its own (and from its starter if that step was never done), so its checks must hold on that page plus what the task asks to add. The era's site, which the gallery shows and zips, is the era's furthest step with saved work, in curriculum order. The `aside` block per step in parts 0 and 1 was the workaround for era keys; the written lessons keep it, and new lessons need not use it.
- **Scaffolding is marked `data-scaffold`.** What a step puts into the page for the exercise and not for the person's site (a note to fill in, a table to complete) carries the attribute `data-scaffold` on its outermost element, any element and any class. The practice preview shows it; the gallery's thumbnail and «Скачать сайт» leave it out. Checks still see it.
- Parts 0 to 3 have their plan files regenerated from the written lessons (sources, videos, practice, checks), so those files describe what exists. Part 2 gained a lesson (the 1996 page, `02-html/02-page-1996`), because the first-page lesson that was already written covers tags and not the table layout; its forms step moved from era 3 to era 4, so that one era carries the learner's page from the form to the stylesheet. A `diagram` entry in any plan is an idea; the component that was built is in `content/diagrams/`.
- Checks see the person's `index.html` only: what the sandbox adds (its CSP `meta`, its scripts, and `styles.css` and `script.js` as a `style` and a `script`) is skipped, so `noTag` with `script` or `style` and a count of `meta` or `script` mean what they say (engine, 28.10.2026).
- Sources the CI link check cannot reach from GitHub's runners (the Russian government's `pd.rkn.gov.ru` did not answer) fail the Links workflow; cite a mirror or a reference article instead. `alistapart.com` answers 403 to the runners some of the time (28.10.2026); part 3 cites it twice, so check those two before writing part 3.
- **What a check cannot see (part 3, 28.10.2026).** A check reads the page's DOM and the *computed* style of the first match, in the sandbox's own browser and, in the unit test, in jsdom, so a step's solution must pass in both. Three consequences:
  - A check cannot see a media query, `@layer`, nesting, `var()` or any other source text, only what they compute to; a `custom property` on `:root` is readable (`style` with `prop: '--color-text'`). A step that is about one of these says so in the lesson and has the learner check it by hand in DevTools.
  - jsdom drops a rule inside `@layer` or nested, ignores `@media`, and does not resolve `var()` or expand `padding-block`; so in a reference solution the declarations a check reads are written at the top level, with longhands (`transition-property`, `animation-name`), and a contrast check does not use `var()`.
  - A quiz `match` question needs a different right-hand text on every pair (the engine keys its options by it); the same for the items of `order`.
- A video is found by searching YouTube, then checked by its oEmbed answer; a title and a channel are what was judged, not the minutes of the video.
- **Practice about code (part 5, 28.10.2026).** The unit test runs no scripts (jsdom without `runScripts`), so a check cannot see what a script does; it can read the *text* of an inline `<script type="module" id="…">` in `index.html` (a `text` check with a regex on `#id`, a `field` check for the brief's words in it). `script.js` is the sandbox's own element and is skipped. Give each lesson's script its own id; `type="module"` keeps `const`s of different scripts from clashing and runs after parsing. Say in the lesson that the check reads the code and the learner runs it by eye.
- **Scaffolding that is code.** A step that needs a fake server puts it in a `data-scaffold` module script and says so (part 5, lesson 4 replaces `window.fetch`; the sandbox's CSP allows no network). A step that continues an earlier one cannot assume the learner's page has the new scaffold: either the lesson shows the block to paste (lesson 4), or the step does not `continue` and starts from its own complete page (lessons 5 to 8). Code that is only text (modules, components, a config) is written into `pre` (no `<`) or `textarea` (any code) blocks in a scaffold and checked by regex.
- **mdsvex gotcha.** In a lesson's metadata, a `</pre>`, `</style>` or `</textarea>` inside a template literal ends the markdown HTML block that begins at `<script module>`; the rest of the metadata is then read as markdown and smartypants turns `...` into `…`. Write `<\/pre>` (the same as for `</script>`). Use ```html, not ```svelte, for Svelte code: the svelte grammar logs «failed to load language css».
- **A diagram's title is `<div class="dh">`, never an `h4`** (28.10.2026): a diagram sits under whichever heading the lesson has reached, so a heading of fixed level skipped one and every lesson with a diagram scored 0.99 on Lighthouse's heading-order. `.dh` is styled in `src/app.css` as the heading was; `tests/unit/diagram-headings.test.ts` fails on an `h4` in `content/diagrams/`.
- **Diagrams** key an `{#each}` by index when the items come from the person's brief: two items with the same title make a duplicate key and break the page.

## Определение (the definition, 27.10.2026)

Every lesson opens with a **definition**: the quotable one- or two-sentence answer to «что такое <тема урока>?». It is the first thing on the lesson page, under the header and before the theory, and it is what the outside world quotes: the page's meta description (the search snippet), the `description` of its structured data (`LearningResource`), its line in `llms.txt`, and the caption a share sends. It is written in the metadata, beside `summary`, and validated by `content:check` (`Definition` in `src/lib/content/schema.ts`):

```js
title: 'DNS: от резолвера до корня и обратно',
definition: 'DNS — распределённая система, которая переводит имя сайта, например example.ru, в IP-адрес сервера. Ответы хранятся в кэшах на срок TTL из записи.',
summary: 'Вы поймёте, как имя превращается в адрес, …',
```

- **50 to 160 characters**, one or two sentences, ending with a period: a search engine shows about 160 characters, and an answer engine quotes a sentence, not a paragraph.
- **Define the topic, not the lesson.** Start with the term and a dash: «HTML — язык разметки, …», «Инфостиль — …». A lesson about two or three things defines the main one and names the rest in the same or the second sentence.
- **It is read quoted alone, out of the lesson**, so: no «вы» (the check refuses it), no «В этом уроке…», nothing that needs the page around it to make sense.
- **Accurate as the lesson is.** Take it from the lesson's own text; no date, number or claim the lesson does not support. When a fact had to be compressed to fit, the lesson still says it in full.
- Plain text: no Markdown, no tags (a tag's name as a word is fine: `<a>`, `fetch`), «ёлочки», ё where it belongs.
- **`summary` is a different thing**: «Зачем», addressed to the learner, what they can do after the lesson. It stays, and it is what a link preview shows under the title (`og:description`); the definition is what a search result shows.

Write the definition after the lesson's text, from it. A good test: would it be a correct answer if someone asked a search engine «что такое …» and got only this sentence?

## Комикс (the comic rail, 27.10.2026)

Every lesson carries a short comic: two to four panels in which Эхо carries the lesson's one idea, a joke or a picture that makes it stick. On a screen 1100 px and wider it is the rail beside the theory, sticky while the theory scrolls; narrower, it is a strip under the lesson's header that scrolls sideways. It is written in the lesson's metadata, beside `summary`, and validated by `content:check` (`Comic` in `src/lib/content/schema.ts`; the kit is `src/lib/comic/kit.ts`).

```js
comic: {
	era: 3, // optional: the dot lit on Эхо's ring; else the practice's era, else the part's
	panels: [
		{ mood: 'hmm', prop: 'server', label: 'корневой сервер', caption: 'Эхо работает резолвером',
		  say: [{ text: 'Где живёт example.ru?' }, { who: 'Корневой сервер', text: 'Не знаю. Спросите серверы зоны .ru.' }] },
		{ mood: 'cheer', side: 'right', prop: 'server', label: '203.0.113.10', say: 'Запомню на TTL секунд.' }
	]
},
```

- **A panel** is Эхо, at most one prop, and one or two lines.
  - `mood`: `idle`, `explain` (the default), `hint`, `cheer` or `hmm`, the mascot's own states (`design/mascot/README.md`).
  - `side`: where Эхо stands, `left` (the default) or `right`; the prop takes the other half. Without a prop Эхо stands in the middle.
  - `era`: this panel's era on the ring, when it differs from the comic's (a panel per era, as in 00-start/02).
  - `prop`: one of `crt`, `browser-1996`, `browser`, `editor`, `phone`, `server`, `network`, `flowchart`, `packets`, `envelope`, `postcard`, `lock`, `certificate`, `cards`, `sheet`. A `flowchart`'s label is its boxes, split by `|` (`'DOM|CSSOM|раскладка|пиксели'`, read left, right, down, left); a `packets` label is its numbers, split by spaces (`'3 1'` draws two).
  - `label`: up to 28 characters drawn on the prop (a screen, an address, a tag). A long one is squeezed to fit.
  - `caption`: up to 32 characters in the panel's corner: a year, a place, «Ответ».
  - `say`: a string is Эхо's one line. A list holds at most one line by Эхо and one by the prop (`who` names the prop: «Сервер»), in the order they are said. Up to 120 characters a line and 170 a panel.
- **The drawing is `aria-hidden`; the words are text.** A screen reader hears the caption and each line with its speaker («Эхо: …», «Сервер: …»), so nothing may live only in the drawing: a label is decoration, and what it says, a line says too.
- **Write the comic last**, from the lesson's own metaphors (the postcard, the envelope, the phone book), so the strip and the text tell one story. It must be accurate as the lesson is: a joke that teaches a wrong fact is worse than none. One idea per comic, the panels as beats: the problem, the turn, the rule.
- **A new prop** is a drawing in `src/lib/comic/Prop.svelte` (a 150 × 130 box, tokens only, `vector-effect: non-scaling-stroke`) and a name in `kit.ts`; never an image file.
