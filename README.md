# Through Time · Сквозь время

An open, interactive textbook of the whole web, from the first web page of 1991 to the agentic web. It is written for people who have never built a site.

**Read it:** <https://open.noeticecho.space/learn/>

You learn on your own project. At the start you describe a site of your own: who it is for and what a visitor should do. Every practice step then builds that site, and the course rebuilds it in each era of the web. Your 1996 page becomes a semantic page, then a responsive one, then a design system, and finally a site an AI builds from your brief, which you review with everything you have learned.

Perhaps the last textbook of the pre-AI era: for those who want to understand the magic, not only use it.

## What is in it

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
- metrics and behaviour;
- quality and law;
- AI and the future of the web.

Each lesson has:
- theory in plain words;
- diagrams;
- sources you can check;
- a quiz;
- practice in a browser sandbox that checks the page you build;
- narration you can listen to, section by section (synthesised: see [`docs/narration.md`](docs/narration.md)).

Spaced repetition keeps what you learned. A guide called Эхо (Echo) walks with you.

## Privacy

There is no registration and no analytics, and the fonts are self-hosted. Your progress stays in your browser, and you can export it as a file and import it elsewhere. You can bring your own model key to ask the guide questions. The key stays in your browser too.

## Status

The textbook is in Russian and is being written part by part. An English edition will follow once the Russian one is complete. It will be localised, not literally translated: for example, GDPR and WCAG take the place of the Russian laws.

The design is in [`docs/specs/2026-10-27-learn-design.md`](docs/specs/2026-10-27-learn-design.md), and the content plan is in [`docs/content-plan/`](docs/content-plan/).

## Development

```bash
npm ci
npm run dev                 # http://localhost:5173/learn/
npm test                    # unit tests
npm run check               # svelte-check
npm run content:check       # lessons, concepts, checks and links in the plan
npx playwright test         # end-to-end
npm run narration -- status # which lessons have audio of their current text
```

SvelteKit, static build, served from `/learn` on GitHub Pages.

## Licence

The code is under Apache-2.0. The lesson content is under CC BY-SA 4.0.

A NoeticEcho project · <https://open.noeticecho.space>
