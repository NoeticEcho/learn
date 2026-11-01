# Through Time

Open courses for an age when a machine can do your thinking for you: how it works, how to work with it, and how to keep thinking for yourself. Bilingual, free, with no sign-up and nothing tracked. A [NoeticEcho](https://open.noeticecho.space) project.

**Read it:** [English](https://open.noeticecho.space/learn/en/) · [по-русски (Сквозь время)](https://open.noeticecho.space/learn/)

## The catalog

Twenty-three courses in four strands. One is open; the others have written tables of contents, and their lessons will appear one at a time, starting with the course on AI. No dates are promised. To hear about new lessons without giving an address, add the [Atom feed](https://open.noeticecho.space/learn/en/feed.xml) to a feed reader.

- **Understand the machine and work with it:** the web, AI from symbols to agents, working with a machine, your own tools, work.
- **The Noetic Singularity:** NoeticEcho's stated aim, that people must develop their minds so as not to be left behind by superintelligence, as a course that says what is supported, what is a bet and what can be said against it; then attention, memory and writing, learning, reasoning, steadiness, meaning, dialogue, responsibility, imagination.
- **Check:** a claim in front of you, and other people's numbers.
- **Keep what is yours:** privacy, security, law, money, health, children.

Each course's file is in [`content/courses/`](content/courses/). The reasons for the list are in [the platform's spec](docs/specs/2026-11-01-platform-design.md), §7.

## The first course: The Web, End to End (Сеть насквозь)

An interactive textbook of the whole web, from the first web page of 1991 to the agentic web, written for people who have never built a site.

You learn on your own project. At the start you describe a site of your own: who it is for and what a visitor should do. Every practice step then builds that site, and the course rebuilds it in each era of the web. Your 1996 page becomes a semantic page, then a responsive one, then a design system, and finally a site an AI builds from your brief, which you review with everything you have learned.

Perhaps the last textbook of the pre-AI era: for those who want to understand the magic, not only use it.

Seventeen parts:
- how the internet works;
- HTML and CSS;
- design and design systems;
- JavaScript;
- servers and languages;
- data;
- CMS, generators and Jamstack;
- infrastructure;
- writing for the web;
- copywriting and marketing frameworks;
- storytelling;
- marketing, SEO and GEO;
- metrics and behavior;
- quality and law;
- AI and the future of the web.

Each lesson has:
- theory in plain words;
- diagrams;
- sources you can check;
- a quiz;
- practice in a browser sandbox that checks the page you build;
- narration you can listen to, section by section (synthesized: see [`docs/narration.md`](docs/narration.md)).

Spaced repetition keeps what you learned. A guide called Эхо (Echo) is on every page: it works with no key and no network, and on the catalog it helps you choose a course.

## Privacy

There is no registration and no analytics, and the fonts are self-hosted. Your progress stays in your browser, and you can export it as a file and import it elsewhere. You can bring your own model key to ask the guide questions. The key stays in your browser too.

## Status

The web course is written in two editions, English and Russian. The English edition is localized, not literally translated: for example, GDPR, the FTC rules and WCAG take the place of the Russian laws.

The platform's design is in [`docs/specs/2026-11-01-platform-design.md`](docs/specs/2026-11-01-platform-design.md), the textbook's in [`docs/specs/2026-10-27-learn-design.md`](docs/specs/2026-10-27-learn-design.md), and its content plan in [`docs/content-plan/`](docs/content-plan/).

## Development

```bash
npm ci
npm run dev                 # http://localhost:5173/learn/
npm test                    # unit tests
npm run check               # svelte-check
npm run content:check       # lessons, concepts, checks, links in the plan, and the catalog
npx playwright test         # end-to-end
npm run narration -- status # which lessons have audio of their current text
```

SvelteKit, static build, served from `/learn` on GitHub Pages.

## Licence

The code is under Apache-2.0. The lesson content is under CC BY-SA 4.0.

A NoeticEcho project · <https://open.noeticecho.space>
