# «Сквозь время» / «Through Time»: the platform

**Status:** the owner's decision of 01.11.2026; this document records it and what was decided under it.
**Repository:** `NoeticEcho/learn`. The earlier design is [`2026-10-27-learn-design.md`](2026-10-27-learn-design.md); what it says about the web course still holds unless this document changes it.

## 1. Scope

The textbook becomes a learning platform at the same address, on the same principles.

**In scope:**
- the catalog at `/learn/` and `/learn/en/`;
- a page for every course, with its table of contents;
- the web course moved under a name of its own, and its home screen moved off the platform's home;
- 23 courses in all, each with a written table of contents in both languages, no lesson bodies;
- Эхо on every page;
- progress read per course;
- an Atom feed of what is new;
- SEO and answer-engine files for all of it.

**Out of scope:**
- writing any lesson;
- the page for a lesson of a new course (§5.4 says why, and what it will take);
- any date for anything.

**Unchanged:** open, no server, no analytics, no accounts, no third-party request before the person asks for it, code under Apache-2.0, content under CC BY-SA 4.0.

## 2. Decisions and what they cost

| Decision | Why | Cost |
|---|---|---|
| **The web course keeps its URLs.** `/learn/lesson/<part>/<lesson>/`, `/learn/map/`, `/learn/gallery/` stay exactly where they are. | No redirect pages, no canonical to move, no search ranking to lose, and every saved link and offline cache stays right. Moving 308 lesson pages under `/course/web/` for tidiness would add 308 redirect pages and buy nothing a reader sees. | The tree is not uniform: the first course lives at the root, the others under `/course/<id>/`. A reader never notices; a developer reads one line in `links.ts`. |
| **New courses live under `/course/<id>/`**, and later their lessons under `/course/<id>/<part>/<lesson>/`. | The prefix cannot collide with the web course's routes, and a course page is a natural parent. | None. |
| **Lesson ids stay as they are; a new course's lesson id has three segments**, `ai/symbols/eliza`. `courseOf(id)` is `web` for two segments and the first segment for three. | No key in the learner's store changes, so there is no migration to get wrong and old backups import as they are. The schema version stays 2. | A rule that lives in one function, and a test that holds it. |
| **XP, the streak and the review queue belong to the person, not to a course.** Lessons done, answers, practice and cards are read per course through their ids. | One daily habit, one queue. Splitting streaks per course would invent a game nobody asked for and would need a `course` field on old log rows. | A course's page cannot say «your XP in this course». Nobody needs it. |
| **The web course is called «Сеть насквозь» / «The Web, End to End».** | It is already its name in the 27.10 spec's title and in the mascot's README, so this restores a name rather than inventing one. It says what the course covers. | Lesson 00-start/01's definition still calls «Сквозь время» a web textbook, and cannot change yet (§6). |
| **Lesson files are not touched at all.** No file under `content/ru/` or `content/en/` changes. | A section's narration hash is its spoken text; an edit silences the lesson until it is rendered again. The English render is running now. | Four sentences in lessons say slightly old things (§6). |
| **One file per course, both languages side by side**, rather than one tree per edition. | A table of contents is short, and the Russian and the English of one line belong in one reviewer's eye. Ids cannot drift apart, because there is only one list of them; the schema refuses a missing language. | When lessons arrive, their bodies are separate files per edition, as now. |
| **The prologue moves to `/course/web/prologue/`**, and the web course's page takes the old returning home. | The prologue is the web course's magic: it builds a person's site era by era. It would be a strange front door to a course on privacy. | A first-time visitor to `/learn/` no longer lands in the prologue. The catalog's first row and the course page lead there in one and two clicks. |
| **Эхо's launcher is in the page flow below 1100 px and a tab on the screen's edge from 1100 px.** Its panel and its script are a lazy chunk. | Below 1100 px there is no margin that a fixed element could sit in without covering text. From 1100 px the container's padding holds a 44 px tab clear of the content. | On a phone, reaching Эхо mid-lesson means the footer's button or the top of the page, not a thumb's reach. That is the price of not covering the text. |
| **`Course` JSON-LD only for a course with a published lesson.** Today that is the web course. A planned course's page has breadcrumbs. | A `Course` with an instance and an offer says it can be taken now; for a table of contents that would be false. | Planned courses get no course rich result until their first lesson. |
| **One feed per edition,** not one per course. | A reader can filter by the entry's category; 46 more files buy little while no new lesson exists. | A person following only one course sees the others' entries. |

## 3. URLs

Nothing below the first block changes.

| Address | What |
|---|---|
| `/learn/`, `/learn/en/` | **new content, same address:** the catalog |
| `/learn/course/<id>/`, `/learn/en/course/<id>/` | **new:** a course's page, indexable, in the sitemap |
| `/learn/course/web/prologue/`, `/learn/en/…` | **new:** the prologue, `noindex`, not in the sitemap |
| `/learn/feed.xml`, `/learn/en/feed.xml` | **new:** the Atom feed |
| `/learn/lesson/<part>/<lesson>/`, `/map/`, `/review/`, `/gallery/`, `/settings/`, in both editions | unchanged |
| `/learn/llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, `og/*.png`, in both editions | unchanged addresses; `llms.txt` and the sitemap gain entries |

**The fence for this.** `tests/fixtures/published-urls.txt` is the list of every file the build of 01.11.2026 (commit `9b10605`) published, without `_app/` and the hashed lesson list. A test fails if a build lacks one. The file only grows. It holds the OG cards too:
- **Lesson and map cards** keep their names, because their drawn text does not change.
- **The old home card** is now the web course's card, drawn from exactly the same text, so `og/home-<hash>.png` and `og/en-home-<hash>.png` stay. The catalog has a card of its own.

**No thin URLs.** A planned lesson has no page, no route and no sitemap line. A test walks the build and the sitemap for any address below `/course/<id>/` other than the prologue.

## 4. Content schema

```
content/courses/index.yaml      the strands, in order, and the courses in each
content/courses/<id>.yaml       one course
content/courses/news.yaml       feed entries that are not lessons
```

```yaml
id: ai                          # the URL segment and the file's name, forever
history: true                   # it tells a history; then its last lesson must look ahead
title: { ru: …, en: … }
tagline: { ru: …, en: … }       # one sentence, 50–160 characters: the catalog's line and the meta description
about: { ru: …, en: … }         # up to three sentences: who it is for and what they can do after it
parts:
  - id: symbols
    title: { ru: …, en: … }
    summary: { ru: …, en: … }   # one sentence
    lessons:
      - id: eliza               # a slug without a number: inserting a lesson renumbers nothing
        title: { ru: …, en: … }
        summary: { ru: …, en: … } # one sentence
        status: planned         # the default; `open` needs `published: YYYY-MM-DD`
        ahead: true             # only the last lesson: it looks into the near future
```

`web` has no `parts`: it says `source: curriculum`, and its table of contents is `content/curriculum.yaml` and the written lessons, as ever.

`validateCourses` (`src/lib/courses/schema.ts`) throws every problem at once, from `content:check`, the build and the test. It refuses:
- a missing language;
- a lesson or part id used twice in a course;
- a lesson title used twice anywhere in the catalog;
- a course not in the index, or in it twice;
- fewer than 15 or more than 28 courses;
- `web` not first, or `ai` not second;
- a `history: true` course whose last lesson is not `ahead`, or an `ahead` lesson anywhere but last;
- `open` without `published`.

The unit test adds the house style (ё, no dash in a sentence, American spelling, sentence case), the kept font subsets, and the names that must not appear (§7.4).

## 5. What is built

### 5.1 The catalog

An editorial index, not a grid of cards: the NoeticEcho language of the rest of the app, Literata for titles, hairlines between rows, no images but Эхо.

- **The head:** the platform's name, one sentence on what it is, one on what it does not do (no account, nothing tracked), Эхо beside them from 700 px.
- **The strands:** each a heading with one sentence, then its courses as rows: the title as a link, the tagline, and at the right the state: «открыт, 154 урока», or «скоро, N уроков в плане».
- **The web course's row** is drawn first and larger. Once the store says the person has progress, its state becomes «12 из 154» and a link «Продолжить: …», in a slot reserved so nothing moves. Nothing is fetched for a first visit: the hashed lesson list comes only for a person with progress, as the home's did.
- **The foot:** the NoeticEcho line, and how to follow new lessons without being tracked: the feed's address and one sentence on what a feed is.

**Weight.** The page's data is the strands and each course's id, title, tagline and two counts, with no lesson of any course. It is the home that used to carry the prologue, so its JavaScript should fall; its inline data rises by a fixed amount per course. A test caps the data per course. A catalog of 23 stays under the old home's transferred HTML plus 5 KB, measured.

### 5.2 A course's page

**A planned course:** breadcrumbs, the title, the tagline, about, a plain line that lessons appear one at a time, and no date; the feed; then each part with its one sentence and its lessons, each a title, a sentence and «скоро». The list is the page's content, so it is indexable.

**The web course:** what the old returning home had (the era scene from 1024 px, the NoeticEcho line, streak, XP, lessons done, replay the prologue), plus the seventeen parts with their lessons as links, marked when done. Its first action is «Начать со вступления» until the store says the prologue was seen, then «Продолжить: …». Without JavaScript it is a link to the prologue. The map and the gallery stay the web course's; the header names them only on its pages.

### 5.3 Эхо everywhere

The lesson's own guide stays where it is. Over it, the root layout gets a launcher, so every page has one, the error page included.

- **Launcher:** the compact mark (`design/mascot/echo-mark.svg`, the file the favicon already loads) and the name. Below 1100 px it sits in the header and, again, in the footer; nothing is fixed. From 1100 px it is a tab on the screen's right edge, inside the container's padding, under the narration player's layer.
- **Panel:** `Dock.svelte`, a lazy chunk the service worker precaches. Below 1100 px it opens in flow under the header and pushes the page down; from the footer's button, it scrolls there, and closing returns focus and place. From 1100 px it is a non-modal panel over the corner, closed with Esc. It never opens by itself.
- **What it knows:** `pageContext(route, status, data)` names the kind of page (catalog, course, lesson, map, review, gallery, settings, prologue, error), the course and the lesson. Unit-tested for every route the build has, so a new route without a line fails.
- **Scripted, no key, no network:** a line for each kind of page, with the links that page needs. It never improvises. On a lesson it uses the lesson's own `guide.intro`. On the catalog it helps choose: a few plain questions as buttons («Хочу понять, что такое ИИ», «Боюсь отстать на работе», «Хочу проверять, что мне говорят»), each giving courses from `choose.ts`, and it says plainly which are open and which are planned. A test holds every course to at least one answer.
- **Model mode:** the existing `Guide` form, only when the person has set a key, off by default, the cost and the provider shown first. Its context is the page's own words: the lesson's title and summary, a course's table of contents, or the catalog's titles and taglines. Project data goes only when ticked for that question, as now.
- **Weight:** two strings and one small component in the first route; the rest is the lazy chunk.

### 5.4 Progress

No store migration: §2. `courseOf` and `progress.courseProgress(db)` read per course. `home.lessons` counts only the web course's. An e2e test seeds a real schema-2 database and `localStorage` by hand, before any app code runs, and reads the catalog, the course page, the map and a lesson; a unit test starts from schema 1. `narration:<lang>:<lesson>`, `learn.lang`, `learn.theme` and `practiceDone:<lesson>` are unchanged, and the test names them.

**A new course's lesson page is not built.** No lesson exists to prove it against, and the route, the concept graph per course, the OG card and the narration key are all easier to get right on the first real lesson than on a fixture. Until then setting `status: open` fails the build, loudly: the course page links the lesson, and the prerender's `handleHttpError: 'fail'` refuses the missing page. The work for the first lesson:
1. `content/courses/<id>/<lang>/<part>/<lesson>.svx`, outside the existing globs;
2. a route at `course/[course]/[part]/[lesson]` reusing `LessonView`;
3. `validateEdition`'s mirror checks over it;
4. narration's manifests keyed by the three-segment id, which they already accept as a string.

### 5.5 The feed

`/learn/feed.xml` and `/learn/en/feed.xml`, Atom 1.0, built at prerender from `news.yaml` and every `open` lesson with its `published`. Stable `tag:` ids, so an entry never shows as new twice. `<link rel="alternate">` on the catalog and course pages, and a visible link with a sentence saying a feed reader asks this file and tells nobody who you are. It starts with the entries that are true today: the platform, and the web course's two editions.

### 5.6 SEO and answer engines

- **Titles** keep their form, `<lesson>: Сквозь время`: the brand now names the platform and stays right.
- **`Course`** moves from home to `/course/web/`; lessons' `isPartOf` names it. Home has `WebSite` alone: an `ItemList` of courses repeated what the page's links already say and pushed the Russian catalog's HTML past a TCP slow-start window, one round trip (150 ms of LCP in Lighthouse).
- **`llms.txt`** opens with the platform, lists every course with its address, line and state, then the web course's lessons as before. `llms-full.txt` stays the web course's text.
- **Share images:** a card for the catalog and one per course, per edition, drawn by the existing template.
- **The manifest, the home's title and description, the footer («Проект NoeticEcho») and Эхо's system prompt** now name the platform.
- **The plate on `open.noeticecho.space`** is in another repository; it calls Through Time «a textbook of the whole web». Updated only if that is false by the time this lands, and the report says which.

### 5.7 Offline

The shell the worker installs gains the catalog, the web course's page and the prologue. Planned courses' pages are treated as lessons are, cached when opened, and «Скачать курс целиком» takes them, so a visit does not precache 44 pages it does not need. The feed is `forMachines`.

## 6. Sentences in lessons that are now a little old

Left alone, because changing them silences the audio (§2). The owner decides when; a change needs a re-render of those sections.

- `00-start/01` (ru, en), its definition: «“Through Time” is a web textbook…». Should say the course's name.
- `00-start/01` (ru): «Кнопка «Продолжить» на главной». Still true: the catalog's first row has it.
- `00-start/02` (ru): «На главной странице учебника есть вступление» and the button «Посмотреть вступление ещё раз». True of the course's own page, which is the textbook's home now; the button keeps that name there, and the catalog's first row leads to it.

## 7. The list, and why

### 7.1 The question

What will a person need to know and be able to do once a machine can do much of their thinking on request? Three answers shape the list:
1. **Understand and direct the machine,** or be directed by it.
2. **Keep what is yours:** your money, your data, your health decisions, your children's upbringing, your legal position.
3. **Keep developing as a mind.** Otherwise the first two become a slow handing-over.

The third is the owner's addition of 01.11, in his words: «те навыки, что нужны людям, чтобы не отставать от ASI». It gets its own strand with a visible heading, «Ноэтическая сингулярность» / “The Noetic Singularity”, and a course that says what the phrase means.

### 7.2 The strands and the courses

**Understand and work with the machine**
- `web`: «Сеть насквозь». Open. The first course, how the web works, by rebuilding your own site in each era.
- `ai`: the history and the mechanics, from symbols to agents, and a look ahead. First to be filled.
- `work-with-ai`: giving a machine a task, from a good request to a supervised agent.
- `own-tools`: small programs and local models of your own, for people who do not program.
- `work`: what changes in a job, a career and a small organization.

**The Noetic Singularity: developing the person**
- `noetic-singularity`: the aim, stated as an aim, its lineage and what can be said against it.
- `attention`: attention and deep work against an economy built to take them.
- `thinking`: memory and writing when a machine remembers and drafts for you.
- `learning`: metacognition and the learning methods with evidence behind them.
- `reasoning`: reasoning, arguments and decisions under uncertainty.
- `resilience`: emotions and steadiness through rapid change, and when to go to a professional.
- `meaning`: purpose and identity when work changes.
- `dialogue`: listening, disagreeing and thinking together, with people and beside machines.
- `responsibility`: ethics, power and who answers for what a machine did.
- `imagination`: making things beside a model, without losing your own taste.

**Check**
- `verify`: checking what a model says, and what a photo or a voice claims.
- `numbers`: reading the data and charts other people show you.

**Keep what is yours**
- `privacy`: where your data goes and what you can do about it.
- `security`: defending against attackers, now with cloned voices.
- `law`: copyright, liability and rules around AI, by jurisdiction; general information, not advice.
- `money`: personal finance and its new scams; general knowledge, not investment advice.
- `health`: reading health claims and using a chatbot about symptoms sensibly; not medical advice.
- `children`: for parents and teachers.

### 7.3 What was merged and dropped, and why

The first pass had 28, and the owner's bound allows about that. It came down to 23 because each of these failed the test of a course a person would miss:

| Was | Now | Why |
|---|---|---|
| prompting, agents | `work-with-ai` | A prompt is a small delegation and an agent a large one. Two courses would teach the same judgement twice. |
| career, a course for small organizations | `work` | The same analysis of tasks, at two scales. |
| own programs, open models | `own-tools` | Both are about not depending on someone else's service. Open models alone were too narrow for a course. |
| media literacy | split | Synthetic media went to `verify`, feeds to `attention`, cloned voices to `security`. Nothing was left over. |
| personal ethics, AI and society | `responsibility` | A person's responsibility cannot be taught apart from who holds power. |
| companions and over-reliance | split | Into `dialogue` and `children`. |

**Of the owner's nine candidates:** attention and focus became `attention`; metacognition `learning`; critical thinking and uncertainty `reasoning`; memory and deep work are split between `thinking` and `attention`, where each fits; emotional regulation `resilience`; meaning and identity `meaning`; dialogue and collective intelligence `dialogue`; ethics `responsibility`; imagination `imagination`. All nine earned a place, so the room came from the machine strand.

**Boundaries that keep courses from overlapping:**
- `verify` is one claim in front of you; `numbers` is data and charts; `reasoning` is your own decisions and arguments.
- `thinking` is keeping a skill while the machine offers to do it; `learning` is acquiring a new one.
- `privacy` is where your data flows without malice; `security` is an attacker.
- `resilience` is getting through a hard stretch; `meaning` is what the stretch is for.

### 7.4 The voice, and how honest it has to be

The owner, 01.11: a bolder tone is welcome, «но не скатываясь в эзотерику и голословные утверждения». The public is about to arrive, so the catalog should read as one project's voice.

- **Say plainly what NoeticEcho intends.** People and humanity should develop their minds so as not to be left behind by ASI, and the Noetic Singularity is the name of that aim. It is stated as a stance and a bet, in the project's first person, and not hedged line by line. By analogy: the technological singularity (Good 1965, Vinge 1993) is the idea of machine intelligence running away; this is the aim of people's own minds not being left behind.
- **An aim is called an aim. A statement about the world is backed or marked as a hypothesis.** Whether ASI will come, and when, is an open question, and the course says that once, clearly. It is not presented as established science or as a prediction, and no esoteric language is used.
- **Its community is small,** and it says so: no implied movement, no ranks, no path to join, no funnel.
- **Where evidence exists it is pointed at, and where it does not, that is marked.** Retrieval and spacing have a strong record; commercial brain training has a weak one (Simons et al., 2016).
- **No promises of what a person will become.** No medical or therapeutic claims; `resilience`, `health` and `children` point to professional help where that is the right answer.
- **Names.** The owner allows names from the corpus where they serve the reader, if the glossary has them as settled.
  - **Used:** NoeticEcho; its public projects as real examples where they teach something (Reminisce for agent memory, noetic-harness and control-room for supervising agents); Эхо and Искин, which the web course already teaches; sudo_make_god only as the author name the owner writes under (`K3-CON-02` leaves its other readings open).
  - **Left out:** KNS (glossary: `proposed`), Noetic Self (no settled entry), Ordo Noetica, Kira, and any expansion of NSL (`K3-NSL-01` is open). A test refuses them across every course file.
  - **The private corpus, chat exports and personal material stay out:** names and public ideas may go in, quotes may not.

### 7.5 How the tables of contents were written

The coordinator wrote `ai` and `noetic-singularity`. Three writers wrote the other twenty-one in parallel from one brief, checking dates and attributions by web search, and a single editor then read all of them and took out what a table of contents should not carry: statistics, sample sizes, case details and anything dated 2025 or 2026. Those belong to the lessons, which will check them again on the day they are written. So what is left are mostly plain promises of what a lesson teaches, and classics.

The session's web-search budget ran out during the pass, so the editor's rule was removal rather than checking. What remains from memory or from a secondary source is listed in the report of 01.11.2026, and the first thing a lesson's author does is check it. `law` is the course most exposed: its Russian and English lines teach different law under one set of ids, which is deliberate, and it is the most likely to need a rewrite before its first lesson.

## 8. A critical read

Read once against the brief, after drafting. What changed:

- **`ai` in the catalog's second row required the machine strand first,** and the person strand second, which puts ten planned courses between `ai` and `verify`. Accepted: the owner asked for the strand to be visible, and the page is short.
- **A cap on total HTML is weak if the old number was already large.** The readiness criterion below measures the catalog against the old home's own bytes, not against a round figure.
- **«Эхо on every page» was first read as lessons plus screens.** The prologue and the static 404 fallback are pages too: `404.html` hydrates client-side, so the launcher arrives with the layout. The test opens it there.
- **Rendering «скоро» on every line looked like noise,** and the design notes' gate 69 worries about a repeated phrase. Kept: the brief says «plainly marked», and it is a status per row, as a ledger repeats a value.
- **The web course's page risked inlining 154 lessons twice.** Its table of contents carries only id and title, no summaries; the summaries stay on the map.
- **Publishing `open` without a route** would otherwise have been a silent 404; it is a build failure instead (§5.4).
- **The catalog's returning state must not open the store on a first visit before paint.** It does so on mount, as the old home did, and reserves its slot so nothing moves.

## 9. Readiness criterion

This ships only when all of these hold. Each can fail.

1. **Every line of `tests/fixtures/published-urls.txt` exists in the build,** in both editions.
2. **`npm run narration -- status` reports the same covered and stale counts for both languages as on `origin/main`** at the moment of merge, and no file under `content/ru/` or `content/en/` differs.
3. **A person's store from before this change,** seeded by hand at schema 2 (and at schema 1 in the unit test), shows the same lessons done on the course page and the map.
4. **Эхо opens on the catalog, a planned course, the web course, a lesson, the map, review, gallery, settings, the prologue and a 404,** in both editions, offline after the worker is ready and with no key, and says something that names the page's kind.
5. **At 375 × 812 no launcher or closed panel overlaps any text,** nothing is `position: fixed`, and with the panel open the page has no horizontal scroll and `main` starts below it.
6. **No third-party request** is made by the catalog, a course page or the panel, with no key set.
7. **The first route's JavaScript is not above the old home's, and the catalog's transferred HTML is at most the old home's plus 5 KB,** measured on the same machine.
8. **Lighthouse thresholds hold** on the catalog and on one planned course, added to `lighthouserc.json`, in both editions: performance ≥ 0.9, accessibility ≥ 0.95, SEO 1.
9. **axe reports no serious issue** on the catalog, a course page and the open panel.
10. **No URL under `/course/<id>/` but the prologue is built or in the sitemap;** the feed parses as Atom; every course has a `tagline`, and every lesson a title and a sentence, in both languages; the schema test passes.
11. **After the push, over HTTP from the live site:** `/learn/`, `/learn/en/`, `/learn/course/web/`, `/learn/course/ai/`, one old lesson URL per edition, the feed and `llms.txt`.

Lighthouse and the full e2e run on CI, because a narration render holds this machine's memory.
