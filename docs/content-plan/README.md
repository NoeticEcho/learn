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
- **House style is a test** (28.10.2026, `tests/unit/style.test.ts`): ё where eyo-kernel's safe dictionary has it (narration is synthesised from the text), no dash in a sentence outside a definition and a quotation, and one spelling for the variants the QA pass replaced (хеш, кэш, офлайн, Tilda, Яндекс Метрика, «4,5 к 1», дизайн-токены). The full glossary of chosen terms is in `docs/qa-2026-10-28.md`. A reference to another lesson is a link, `[урок о …](../../07-data/07-privacy-by-design/)`, in the tense the course order gives it.
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

## English edition (engine, 28.10.2026)

The textbook is bilingual. Russian is the source edition and is complete; English follows part by part, written by translators into `content/en/`. The English edition is **localised, not translated**: it teaches the same concepts with the same practice, but in the world an English-speaking reader lives in.

### How it is wired

- **Addresses.** Russian stays at `/learn/…`, as it always was. English is `/learn/en/…`, the same paths below it: `/learn/en/lesson/00-start/01-how-to-learn/`. Every screen (home, map, review, gallery, settings) exists in both. Every lesson has an English page too: the lesson when it is translated, and otherwise an honest «This lesson isn't in English yet» page that links to the Russian one, says `noindex` and is left out of the English sitemap and `en/llms.txt`.
- **The header's switch** goes to the same page in the other edition. From a Russian lesson English does not have yet, it goes to that lesson's part on the English map. The choice is remembered in this browser (`localStorage` `learn.lang`), and a person who chose English and opens the Russian home is sent to the English one. Settings has the same choice under «Language».
- **One store for both.** Progress, cards, practice files and the brief are keyed by ids the editions share (lesson id, card id, practice step id), so a learner who switches keeps everything. A card keeps the language it was learnt in, and review marks it with `lang`.
- **The head.** `<html lang>`, the canonical, `hreflang` for `ru`, `en` and `x-default` (Russian) on every page that exists in both, `og:locale` and `og:locale:alternate`, `inLanguage` in the structured data, an English Open Graph card (`og/en-…png`), sitemap entries with `xhtml:link` alternates, and `en/llms.txt` and `en/llms-full.txt`.
- **UI strings** are `src/lib/i18n/ru.json` and `en.json`, with the same keys: `npm run check` fails on a key one has and the other lacks (`KeysMatch` in `index.ts`), and `tests/unit/i18n.test.ts` also holds placeholders and plural forms (three in Russian, two in English). A new string goes into both, written in each language, not translated by machine.
- **Project templates.** `src/lib/persona/default.en.json` and `templates.en.json` are the English examples: Kate Alder, a land surveyor and expert witness in boundary disputes, and seven other projects, all in the invented town of Riverbend, with numbers made of zeros. They have the Russian templates' structure item for item, so every check passes for both (`tests/unit/persona.test.ts`). An empty field of the learner's brief takes the template of the page's edition; what the learner wrote is theirs and is never translated.

### What a translator does, per lesson

1. **Copy** `content/ru/<part>/<lesson>.svx` to `content/en/<part>/<lesson>.svx`: the same folder and file name, so the same id.
2. **Keep what progress and the graph are keyed by**, which `npm run content:check` holds against the Russian lesson: `id`, `part`, `order`, `teaches` and `requires` (same concepts, same order), the card ids, and the practice step's `id`, `era`, `continues` and check ids. Everything else is the edition's own: the words, the quiz (its questions may differ), the sources and videos, the comic, the guide's lines, the checks' patterns.
3. **Write it in English**, natively: the text, the definition (the rules of «Определение», with «you» in place of «вы»: no «you», no «In this lesson»), the summary, the comic, the quiz with its feedback, the cards, the guide's lines, and the practice task, starter and solution. A check that reads the person's words (`field`) works for any language; a check whose pattern is Russian text gets an English pattern. Run the unit tests: an English step is checked against all eight English templates (`tests/unit/content.test.ts`).
4. **Diagrams** in `content/diagrams/` are shared by both editions. A diagram the lesson uses gets its words in a `pick({ ru: {…}, en: {…} })` table (`#lib/i18n/index.ts`), as `ForgettingCurve.svelte` does; the Russian rendering must not change.
5. **Sources**: at least one in English (`content:check` refuses a lesson with none). Prefer the English primary source: MDN in English, the W3C or WHATWG text, the English Wikipedia, web.dev, the official English docs. A Russian source stays only where the topic is Russian (Runet, Яндекс, 152-ФЗ cited for comparison). Videos: English ones, found and checked as the Russian ones were.
6. **Concepts** need no new entry: every part and concept already has an English title in `content/en/curriculum.yaml`. Use the title as the lesson's term; if the lesson shows the title is wrong, fix it there in the same commit.
7. Run `npm run content:check`, `npm test -- --run` (including `tests/unit/style-en.test.ts`) and look at the page at `/learn/en/lesson/<id>/`.

### Localisation rules

- **Law.** A lesson that teaches Russian law teaches the English-speaking reader's equivalents instead, with Russia's kept as one example where the course compares jurisdictions:
  - personal data: GDPR and UK GDPR (and the US state laws by name), in place of 152-ФЗ; cookies: the ePrivacy Directive and PECR;
  - advertising: the FTC's endorsement guides and the ASA and the CAP Code, in place of the Russian ad law and ОРД; email: CAN-SPAM, PECR and GDPR consent;
  - accessibility: WCAG 2.2 with the ADA, the European Accessibility Act and EN 301 549, in place of ГОСТ Р 52872-2019;
  - consumer law: the EU and UK distance-selling rules (the Consumer Contracts Regulations), in place of the Russian law on consumer rights;
  - data localisation: what GDPR says about transfers, with Russia's localisation rule as the strict case it is.
  Every lesson on law carries a note that it is general information, not legal advice, and names the authority to ask. The legal facts are checked against the primary text, as `docs/legal-review.md` asks of the Russian ones.
- **Russian tools and the Runet** stay where the lesson's point is history or a real example (the history of the Runet, Яндекс beside Google, VK and Telegram as one market among others, Tilda and 1С-Битрикс beside Wix, Squarespace and Shopify, Яндекс Метрика beside GA4 and the privacy-friendly counters). They are named in their Latin form (Yandex, Yandex Metrica, 1C-Bitrix) and explained once.
- **Money and places.** Prices in pounds in the templates, «Riverbend» for the town, a «Russian host» becomes «an ordinary host».
- **Echo** is the guide's name in English (Эхо in Russian); Iskin is Искин. Refer to Echo by name, and as «they» where a pronoun is needed. Echo speaks to the learner as «you», warmly and briefly, as in Russian.

### English house style (`tests/unit/style-en.test.ts`)

- **British spelling** (colour, licence as a noun, organise, behaviour), the spelling the code and the docs already use.
- **Headings and titles in sentence case**: «Cards and spaced repetition», not «Cards and Spaced Repetition». A capital after the first word only for a name, an acronym or a word with capitals inside it (JavaScript); a name a lesson needs is added to `NAMES` in the test. After a colon the next word is lower case.
- **Typographic quotes and apostrophes** in prose: “ ” and ’, never " or '. A label the learner presses is quoted: press “Save progress”.
- **No dash in a sentence**, as in Russian: two sentences, a colon or a comma instead. A definition defines with «is»: «DNS is a distributed system that…».
- **Plain English**: short sentences, active voice, «you» for the learner, contractions where they read naturally («you’ll», «isn’t»). No ё rule, no «вы» rule: their purposes are served here by the rules above.
- **Numbers and dates**: «28 October 2026», «4.5 to 1», «1,000».
- **Comic lines** keep the comic's limits (`src/lib/comic/kit.ts`): 28 characters a label, 32 a caption, 120 a line and 170 a panel; English runs shorter than Russian, so a line usually fits as it is. A joke that does not survive translation is replaced by one that teaches the same idea.

### Glossary

The terms are the concept titles in `content/en/curriculum.yaml`. Beyond them, the ones the UI and the reference lesson fixed:

| Russian | English |
|---|---|
| Сквозь время | Through Time |
| Эхо, проводник | Echo, the guide |
| Зачем · Теория · Живая схема · Практика · Тест · Карточки · Источники · Дальше | Why · Theory · Live diagram · Practice · Test · Cards · Sources · Next |
| Проверьте себя | Check yourself |
| Карта курса | Course map |
| Повторение | Review |
| Снова · Трудно · Хорошо · Легко | Again · Hard · Good · Easy |
| бриф проекта | project brief |
| эпоха | era |
| песочница, предпросмотр, проверки | sandbox, preview, checks |
| Завершить урок | Finish the lesson |
| Сохранить прогресс | Save progress |
| инфостиль | plain, informative style |
| канцелярит | officialese |
| Заречье | Riverbend |
| Искин | Iskin |
