# «Сеть насквозь» (Web, end to end): design

**Status:** approved in conversation by Martin, 27.10.2026. This document records it.
**Repository:** `NoeticEcho/learn`, public. Served at `open.noeticecho.space/learn`.
**Licences:** code Apache-2.0; lesson content CC BY-SA 4.0.

## 1. What it is

An interactive textbook that takes a person who knows nothing about the web to the
point where they can make, publish, write for, market and measure a website, and
then tell an AI to build one. It covers the whole industry in order: how the web
began and works, HTML and CSS, design and design systems, JavaScript, servers and
languages, databases, CMS and static site generators, headless and Jamstack,
infrastructure (domains, DNS, TLS, CDN, serverless, containers, orchestration),
writing for the web, copywriting and marketing frameworks, storytelling, SEO and
GEO, metrics, quality and law, AI site builders and vibe coding, and the agentic
web, ending with Искин and NoeticEcho.

It is a web application, not a book: every lesson has theory, a live
demonstration, a test, and a practical step done inside the application.

### Who it is for

A Russian-speaking adult with no technical background. Every term is explained the
first time it appears and is linked to its node in the concept graph.

### Success criteria

1. A person who finishes the course has built the practice site eight times, once
   per era, and can publish it.
2. Every lesson cites open sources, and every external link works (CI checks it).
3. Every page passes accessibility (axe, no serious issues), performance (LCP <
   2.5 s on a mid phone on 4G, measured by Lighthouse CI) and the hallmark audit.
4. Nothing leaves the person's browser except what they send to a model with
   their own key, and the app says so.

## 2. Decisions (Martin, 27.10.2026)

| Question | Decision |
|---|---|
| Language | Russian first; content structured bilingual so English follows in waves |
| AI guide | scripted guide that works offline and free, plus an optional person's own key (Anthropic, OpenAI or OpenRouter), stored only in their browser |
| Hosting | static build at `open.noeticecho.space/learn` (GitHub Pages); Vercel can mirror later |
| First release | the whole programme at once |
| Stack | SvelteKit, no registration, all progress local |
| Repository | public from the start; all code and work go there |
| Practice | one site in many variations: a bilingual (RU/EN) site for a land-law specialist in Russia |
| Emphases | design systems in depth; every copywriting and marketing framework that matters; a large block on storytelling |

## 3. The product

### 3.1 The time machine

The course follows the web's history, and the person rebuilds the same practice
site in each era with that era's tools:

| Era | The site is built with |
|---|---|
| 1. 1996 | HTML tables, `<font>`, a GIF counter |
| 2. 2005 | separate CSS, floats, «web 2.0» |
| 3. 2010 | WordPress, a theme, plugins |
| 4. 2014 | responsive layout, flexbox, mobile first |
| 5. 2019 | a static site generator and Markdown |
| 6. 2022 | a headless CMS and Jamstack deploy |
| 7. 2025 | an AI site builder and vibe coding |
| 8. next | a brief and an interview, from which Искин builds the site and service |

The person's gallery shows all eight versions side by side, each with what changed
and why. Each era also has a «what was wrong with it» page: what aged badly, and
what is still right.

### 3.2 The practice persona

A **fictional** land-law specialist: a cadastral engineer and forensic expert with
a law degree, who works on land boundary disputes for private owners, developers
and advocates. The persona has a name, a city, a timeline of education and work,
accreditations and documents, all invented. The bio's *structure* comes from a
real reference text, kept in `private/` (git-ignored) and never published. A real
person's data enters only with their written consent.

**The learner's own data.** The persona is the default, not a fixture. At the brief
(part 0), or at any time later, the person may replace any of its fields with their
own: a name, a profession, a city, a biography, services and documents. From then
on every era's site is about them. Martin, 27.10: the reference author «сам в
уроках будет свои данные вписывать».
- These fields are stored locally like all progress (§4.3).
- They appear only in the person's own previews and in the zip they download.
- A model sees them only in model mode, and only if the person allows it for the question.
- Every practice check is written against the field structure, never against the persona's literal text, so that it passes for anyone's data.

The persona's site is bilingual (RU/EN). The app's practice teaches i18n on it:
`lang`, `hreflang`, translated slugs, and why machine translation of legal text is
a risk.

The persona also gives the course its legal material: personal data on forms
(152-ФЗ), the cookie notice, the advertising law, and the professional ethics that
limit how advocates and experts may advertise.

### 3.3 The curriculum: 17 parts, about 110 lessons

Lessons form a **concept graph**: each lesson declares the concepts it teaches and
those it requires. The map view draws the graph, and the next lesson is always one
whose prerequisites are met. A part may be entered out of order once its
prerequisites are done.

0. **Старт**
   - how to learn here (the guide, the map, the review cards, the practice);
   - the brief: who the persona is and what they need from a site.
1. **Как устроен интернет**
   - the history from ARPANET to the web: Berners-Lee, Mosaic, Netscape, the browser wars, dot-com, web 2.0, mobile, the platforms;
   - packets, IP and TCP;
   - DNS, from the resolver to the root, through the TLD to the authoritative server: records and TTL;
   - HTTP and HTTPS: requests, responses, status codes, headers, TLS;
   - how a browser renders: parsing, DOM, CSSOM, layout, paint;
   - URLs, domains and registrars.
2. **HTML**
   - documents and tags;
   - semantics and the outline;
   - links, images and media;
   - forms;
   - tables (for data, not for layout);
   - meta, the head, and Open Graph;
   - accessibility basics.
3. **CSS**
   - selectors and the cascade;
   - the box model;
   - typography;
   - colour and units;
   - flexbox;
   - grid;
   - responsive design and container queries;
   - custom properties;
   - animation and motion, with reduced motion;
   - modern CSS: nesting, `:has()`, layers.
4. **Дизайн и дизайн-системы** (in depth)
   - the history of web design: tables and spacer GIFs, Flash, splash pages, skeuomorphism, flat, Material, glass, neumorphism and brutalism;
   - what aged and why;
   - visual hierarchy, grids, whitespace and typographic scale;
   - colour systems and contrast;
   - **design systems**: what they are, and how to read one, with Material (1–3), Apple HIG, Fluent, IBM Carbon, Atlassian, Shopify Polaris, GOV.UK, GitHub Primer, Radix/shadcn, Tailwind as a system, and NoeticEcho's own;
   - design tokens (W3C DTCG);
   - atomic design and components;
   - design to code: Figma, handoff and Claude Design;
   - the tells of AI-made pages (after hallmark), and how to avoid them;
   - modern and outdated patterns side by side, in a quiz the person grades.
5. **JavaScript**
   - values, functions and the DOM;
   - events;
   - fetch and JSON;
   - modules;
   - why frameworks exist;
   - a component, in Svelte;
   - progressive enhancement.
6. **Сервер и языки**
   - what a web server is: Apache, nginx, Caddy;
   - static versus dynamic;
   - CGI to PHP to application servers;
   - why each language lives where it lives: PHP, Python, Ruby, Java, C#, Go, JavaScript/Node, Elixir, Rust;
   - APIs: REST, GraphQL, webhooks;
   - authentication in plain words.
7. **Данные**
   - what a database is;
   - relational databases and SQL, practised on real Postgres in the browser (PGlite);
   - indexes and transactions;
   - document, key-value, graph and vector databases: when to use each, and when not;
   - search;
   - privacy by design.
8. **CMS, генераторы и Jamstack**
   - what a CMS is;
   - WordPress, Tilda and 1С-Битрикс (the Russian market), with Drupal and Joomla in history;
   - static site generators: Jekyll, Hugo, Eleventy, Astro, SvelteKit;
   - headless CMS: Strapi, Directus, Sanity, Contentful, Decap;
   - Jamstack;
   - choosing for the persona.
9. **Инфраструктура**
   - hosting from shared to VPS to cloud;
   - domains and DNS in practice;
   - TLS certificates;
   - CDN;
   - serverless and edge;
   - containers: Docker, by analogy and then hands-on in a simulator;
   - orchestration: Kubernetes in plain words, and when not to need it;
   - CI/CD;
   - backups and monitoring;
   - Russian specifics: data localisation, local providers.
10. **Тексты для веба**
    - how people read on screens (the F-pattern, scanning);
    - information style («Пиши, сокращай»: stop words, facts over adjectives);
    - the inverted pyramid;
    - headlines;
    - microcopy and UX writing;
    - tone of voice;
    - legal and expert texts;
    - rewriting the persona's «before» bio.
11. **Копирайтинг и маркетинговые фреймворки** (every framework that matters, each with an example on the persona)
    - **copy:** AIDA and AIDCA, PAS and PASO, BAB, 4U, 4P (Picture–Promise–Prove–Push), FAB, QUEST, ACCA, SLAP, the Ogilvy principles, Schwartz's five levels of awareness;
    - **positioning and value:** JTBD and job stories, the Value Proposition Canvas, StoryBrand (SB7), Hook–Story–Offer;
    - **persuasion and ethics:** Cialdini's principles, the Fogg behaviour model, the Hooked model, and where persuasion becomes manipulation (dark patterns);
    - **marketing:** STP, 4P/7P, the customer journey map, funnels (TOFU/MOFU/BOFU), See–Think–Do–Care, RACE, AARRR, the flywheel, the North Star metric, ICE and RICE;
    - **the value ladder:** lead magnets, tripwires, the core offer, one-time offers (OTO), upsells and downsells.
12. **Сторителлинг** (a large part of its own)
    - why stories work (narrative transport, memory);
    - Freytag's pyramid and three acts;
    - the hero's journey (Campbell and Vogler);
    - Harmon's story circle;
    - the Pixar story spine;
    - kishōtenketsu;
    - ABT (And–But–Therefore);
    - Duarte's sparklines;
    - in medias res;
    - the brand story;
    - the case study (STAR, before and after);
    - the founder story;
    - data storytelling;
    - visual storytelling and scrollytelling on the web;
    - storytelling for an expert who must not boast (the ethics of professional advertising);
    - writing the persona's story three ways and testing which reads best.
13. **Маркетинг и рост**
    - marketing automation: triggers, segments, cascades across channels;
    - e-mail;
    - SMM (VK, Telegram, YouTube, and what changed after 2022);
    - SEO: crawling, indexing, ranking, Яндекс and Google, technical SEO, content, links;
    - GEO: being cited by AI answers;
    - local SEO for an expert;
    - paid traffic in brief;
    - legal limits in Russia (ad labelling, ОРД).
14. **Метрики и поведение**
    - what moves clicks and retention;
    - bounce rate and its definitions in Яндекс Метрика versus GA4;
    - time on page;
    - scroll depth;
    - CTR;
    - conversion and micro-conversion;
    - cohorts and retention;
    - A/B tests and their traps;
    - heatmaps and session replay, with their ethics;
    - HEART;
    - setting up Метрика for the persona's site.
15. **Качество и право**
    - performance: Core Web Vitals;
    - accessibility: WCAG 2.2, and the law;
    - security: OWASP basics, forms, spam;
    - 152-ФЗ on personal data, consent and processing notices;
    - cookies;
    - copyright and images;
    - the law on advertising, and the ethics of advocates and experts;
    - a pre-launch checklist.
16. **ИИ и будущее веба**
    - AI site builders: bolt, Lovable, v0, Tilda AI;
    - vibe coding: what it gives, and what it costs;
    - prompts as briefs;
    - reviewing AI output;
    - **capstone:** the person builds a mini site builder in the app with their own key, a brief → structure → copy → code pipeline;
    - the agentic web: MCP, A2A, aweb, agents as visitors;
    - the internet of intelligence;
    - Искин: a brief and an interview → a site and a service, turnkey;
    - NoeticEcho and where to go next.

A lesson count per part lives in `content/curriculum.yaml`, the single source of the
map. The list above is the outline. The final split into lessons is made when each
part's content is written, and stays within ±15% of 110.

### 3.4 The anatomy of a lesson

Every lesson has the same parts, so the engine can render, test and track it:

1. **Зачем:** one paragraph on what the person will be able to do after it.
2. **Теория:** short sections, each ending in a check-yourself question.
3. **Живая схема:** an interactive Svelte component (a DNS resolver walk, the box model, a funnel), or a «compare the eras» slider.
4. **Практика:** a step on the persona's site, with an editor, a preview and checks.
5. **Тест:** 4–8 questions (single, multiple, order, match, code). Feedback says why an answer is wrong and links to the theory.
6. **Карточки:** 3–6 review cards fed to spaced repetition.
7. **Источники:** cited sources, with their licence, and videos (links only, opened behind a click-to-load facade).
8. **Дальше:** the concepts this lesson unlocks.

## 4. Architecture

### 4.1 Stack

- **SvelteKit 2 with Svelte 5**, `adapter-static`, prerendering every route, and `paths.base = "/learn"`.
- **TypeScript** throughout.
- **Content:** mdsvex lessons (`content/ru/<part>/<lesson>.svx`), with front matter validated by a Zod schema at build time. A lesson that fails validation fails the build.
- **No server.** No database, no analytics, and no third-party request before the person asks for it.

### 4.2 Units

| Unit | Does | Depends on |
|---|---|---|
| `content/` | lessons, curriculum, concept graph, cards, sources | nothing |
| `lib/content` | loads and validates content; builds the graph | Zod, mdsvex |
| `lib/store` | progress, answers, cards, settings, the gallery | IndexedDB (`idb`) |
| `lib/srs` | spaced repetition | `ts-fsrs` |
| `lib/practice` | editor, preview sandbox, check runner | CodeMirror 6 |
| `lib/sim` | DNS, HTTP, server, container and CDN simulators | Svelte only |
| `lib/sql` | real Postgres in the browser for part 7 | PGlite (lazy) |
| `lib/guide` | the guide character, scripted dialogue, optional model | Rive or SVG, `fetch` |
| `lib/game` | XP, streaks, era badges, the gallery | `lib/store` |
| `lib/i18n` | UI strings, the locale switch | a JSON catalogue per locale |
| `design/` | NoeticEcho tokens compiled to CSS variables | EchoBaby `design/tokens` (copied, with provenance) |

### 4.3 Progress, privacy and export

- **Storage:** everything the person does is in IndexedDB on their device, behind a schema version and migrations.
- **Export and import:** «Сохранить прогресс» writes one JSON file; «Загрузить» reads it, after a preview and a confirmation. This is the only backup, and the app says so on the first screen.
- **The person's own key:** it is stored in IndexedDB, never in a URL or a log. It is sent only to the provider the person chose, and only when they ask the guide something.

### 4.4 Practice

- **Editing and preview.** CodeMirror 6 edits HTML, CSS, JS, Markdown and SQL. The preview is a sandboxed `iframe srcdoc`: `sandbox="allow-scripts"`, no `allow-same-origin`, and a CSP that blocks network access.
- **Checks.** Each practice step declares checks in a small DSL, for example «an element `h1` exists», «computed `display` of `.cards` is `grid`», «contrast of `body` ≥ 4.5», «the form has a label for every input». The checks run inside the sandbox and post results back by `postMessage`.
- **The persona's site** is one project per era, saved in the store. Downloading it gives a zip, with deploy guides for GitHub Pages, Netlify, Vercel and a Russian host.
- **Server topics** (part 6) use simulators and recorded request–response traces, not a real server.

### 4.5 The guide «Эхо»

- **The character.** An animated character with idle, explain, hint, cheer and «hmm» states. It honours `prefers-reduced-motion`.
- **Scripted mode** works offline and free. Each lesson carries its lines (intro, hints by attempt, a reading of common mistakes keyed by failed check, an outro), and the guide never improvises in it.
- **Model mode** works with the person's own key. The guide answers free questions with the lesson, the concept graph and the person's current code as context. Its system prompt keeps it a tutor:
  - it explains;
  - it hints before it solves;
  - it cites the lesson's sources;
  - it says when it is unsure.
- **Costs.** The app shows an estimate per question, and model mode is off by default.

### 4.6 Gamification

- **What is counted:** XP for lessons, tests, practice and reviews, and a daily streak with one free «freeze» a week.
- **Era badges:** one per era (§3.1), for a finished version of the site.
- **The gallery:** the person's eight sites.
- **No leaderboard.** There is no server to rank people on, and none is wanted.

### 4.7 Design

- **Tokens:** NoeticEcho's tokens, with the Ink and Paper themes, the typography and the motion. The app is built in its own design language and passes the hallmark audit.
- **Each era's practice site looks like its era.** That is the point.
- **Accessibility:** WCAG 2.2 AA, keyboard-first, visible focus, and reduced motion.

### 4.8 Offline

A service worker precaches the shell and every lesson the person has opened. «Скачать курс целиком» precaches all of it.

## 5. Content pipeline

1. **Research.** For each lesson, a source list from open educational resources: MDN (CC BY-SA), web.dev (CC BY), W3C/WHATWG specs, HTTP Archive Web Almanac, open university courses (MIT OCW, Stanford, CS50, Open University OpenLearn, Stepik/ИТМО/НИУ ВШЭ open courses), official documentation of each tool, Nielsen Norman Group articles, and the authors of the frameworks, each with its licence.
2. **Draft.** Sonnet writes the lesson in its own words to the anatomy in §3.4, with citations. It never copies text from a source whose licence is not compatible with CC BY-SA (NC and ND licences: link, never adapt).
3. **Fact check.** A second pass by another model checks every claim against its cited source and marks the doubtful ones.
4. **Machine checks** in CI:
   - schema validation;
   - every link resolves;
   - every video exists;
   - every concept in `requires` exists;
   - the graph is acyclic;
   - every practice step's checks pass on its reference solution and fail on the starter code.
5. **Human review.** The coordinator reads every part. Martin reads what he chooses.

Videos are links: YouTube and VK Видео, behind a click-to-load facade, with Russian-language videos preferred.

## 6. Quality gates (CI on every PR)

- `svelte-check`, `vitest` (units: the store, SRS, checks DSL, graph) and `playwright` (flows: a lesson, practice, test, export and import, offline);
- axe on every route;
- Lighthouse CI on representative routes;
- the hallmark audit on the shell and on the persona's era 4–8 sites;
- content validation and the link checker (above);
- the bundle budget: the first route under 150 KB of JS gzipped, with PGlite, CodeMirror and Rive lazy.

## 7. Release

- **Publishing:** GitHub Pages from `NoeticEcho/learn` at `open.noeticecho.space/learn`.
- **The first release** is the whole programme (Martin's decision), tagged `v1.0.0`.
- **The site:** open.noeticecho.space lists the textbook in «Open now».
- **English** follows, part by part, as content in `content/en/`.

## 8. How the work is done

- **The coordinator** owns the spec, the plan, the engine's review and the landing.
- **Our cloud workers** (Claude Code sessions on the subscription) build the engine and write content, a part per worker per wave. Alexander's and Роберто's workers never touch NoeticEcho.
- **API credits** (about $45, until 31.10.2026) go to Sonnet drafts and fact checks for the first parts. After that, the workers write and the coordinator reviews.
- **Order:**
  1. the engine, the content schema, the curriculum file, the design tokens, CI;
  2. part 0 and part 1 as the reference parts, reviewed by Martin;
  3. the remaining parts in parallel waves;
  4. integration, the gallery, the capstone;
  5. a full QA pass;
  6. `v1.0.0`.

## 9. Risks

- **Volume.** About 110 lessons with practice is large. *Mitigation:* the schema and the reference parts first, then parallel waves to the same anatomy, with machine checks that refuse a half-made lesson.
- **Accuracy.** Model-written content can be wrong. *Mitigation:* citations, a second-model fact check, and a coordinator read of every part.
- **Licences.** *Mitigation:* the source policy in §5 and a licence field per source.
- **Real people's data.** *Mitigation:* the fictional persona (§3.2), and the reference kept private.
- **Third-party requests.** *Mitigation:* none before a click; the CSP enforces it.
- **The person's key.** *Mitigation:* stored locally, sent only to the chosen provider, model mode off by default, and the cost shown.

## 10. Readiness criterion

`v1.0.0` ships when:
- all 17 parts pass the content checks;
- every practice step's reference solution passes and its starter fails;
- the eight era sites build;
- the quality gates in §6 are green;
- a person can go from part 0 to the capstone offline, after «Скачать курс целиком», with progress surviving an export and import into a fresh browser.
