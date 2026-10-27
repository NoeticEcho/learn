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
- Practice checks can read only the brief's flat string fields (`name`, `title`, `who`, `forWhom`, `profession`, `city`, `phone`, `email`, `bio`); a plan's check about a list (sections, items) is written as «not fewer than N elements» with N the smallest list among the eight templates.
- Saved practice files are keyed by era and file, so every practice step adds an `aside` block to its era's page and checks only that block; a starter is a complete page, so a step also works out of order.
