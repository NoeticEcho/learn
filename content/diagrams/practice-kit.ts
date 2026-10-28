/**
 * Parts 9 and 16: the learner's page that every practice step of those parts starts from, so a
 * lesson's metadata holds only what is its own (the scaffold the step asks to fill in).
 *
 * The page is the one the earlier parts end with, shortened: a header with the sections, the
 * project's name, what it is, the main action, the sections, the items. Templates (`{{name}}`)
 * are rendered with the person's brief. Licence of this file: Apache-2.0.
 */
export const baseCss = `/* styles.css: страница после частей про HTML и CSS, в сокращённом виде */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font: 1.0625rem/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #1d2430;
  background-color: #ffffff;
}

main {
  max-width: 50rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1,
h2,
h3 {
  line-height: 1.2;
}

a {
  color: #1a4d8f;
}

nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 1rem;
  color: #ffffff;
  background-color: #1a4d8f;
}

.site-header a {
  color: #ffffff;
}

.brand {
  margin: 0;
  font-size: 1.5rem;
}

.button {
  display: inline-block;
  min-height: 2.75rem;
  padding: 0.625rem 1.25rem;
  color: #ffffff;
  background-color: #1a4d8f;
  border-radius: 0.25rem;
  text-decoration: none;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
}

.card {
  padding: 1rem;
  background-color: #f3f5f8;
  border-radius: 0.5rem;
}

.price {
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem;
  border: 1px solid #c9d1dc;
  text-align: left;
  vertical-align: top;
}

pre,
textarea {
  width: 100%;
  font: 0.9rem/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

pre {
  overflow-x: auto;
  padding: 0.75rem;
  background-color: #f3f5f8;
  white-space: pre-wrap;
}

.site-footer {
  padding: 1rem;
  background-color: #f3f5f8;
}
`;

/** The English edition's stylesheet: the same rules, the comment in English. */
export const baseCssEn = baseCss.replace('/* styles.css: страница после частей про HTML и CSS, в сокращённом виде */', '/* styles.css: the page after the parts on HTML and CSS, shortened */');

export type PageOptions = {
	/** The page's language: the Russian edition's (the default) or the English edition's. */
	lang?: 'ru' | 'en';
	/** Extra elements in `<head>`, after the stylesheet link. */
	head?: string;
	/** Markup between the page and the footer: the step's own part (mark it `data-scaffold`). */
	scaffold?: string;
	/** Replaces the default list of items (the cards) when a step edits that part of the page. */
	offer?: string;
	/** Replaces the whole body of `<main>` when a step edits the page itself. */
	main?: string;
};

const offerFor = (lang: 'ru' | 'en') => `      <section id="offer">
        <h2>${lang === 'en' ? 'What we offer' : 'Что мы предлагаем'}</h2>
        <div class="cards">
          {{#each items}}<article class="card">
            <h3>{{title}}</h3>
            <p>{{text}}</p>
            <p class="price">{{price}}</p>
          </article>
          {{/each}}
        </div>
      </section>`;

const mainDefault = (offer: string, lang: 'ru' | 'en') => `      <h1>{{name}}</h1>
      <p>{{who}}</p>
      <p><a class="button" href="#offer">{{mainAction.label}}</a></p>

      <section id="sec-1">
        <h2>{{sections.0}}</h2>
        <p>${lang === 'en' ? 'A couple of sentences about the section.' : 'Пара предложений о разделе.'}</p>
      </section>

      <section id="sec-2">
        <h2>{{sections.1}}</h2>
        <p>${lang === 'en' ? 'A couple of sentences about the section.' : 'Пара предложений о разделе.'}</p>
      </section>

      <section id="sec-3">
        <h2>{{sections.2}}</h2>
        <p>${lang === 'en' ? 'A couple of sentences about the section.' : 'Пара предложений о разделе.'}</p>
      </section>

${offer}`;

export function page(o: PageOptions = {}): string {
	const lang = o.lang ?? 'ru';
	return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{title}}</title>
    <link rel="stylesheet" href="styles.css">${o.head ? '\n' + o.head : ''}
  </head>
  <body>
    <header class="site-header" id="top">
      <p class="brand">{{name}}</p>
      <nav aria-label="${lang === 'en' ? 'Site sections' : 'Разделы сайта'}">
        <ul>
          <li><a href="#sec-1">{{sections.0}}</a></li>
          <li><a href="#sec-2">{{sections.1}}</a></li>
          <li><a href="#sec-3">{{sections.2}}</a></li>
        </ul>
      </nav>
    </header>

    <main id="main">
${o.main ?? mainDefault(o.offer ?? offerFor(lang), lang)}
    </main>
${o.scaffold ? '\n' + o.scaffold + '\n' : ''}
    <footer class="site-footer">
      <p>{{name}}, {{city}}</p>
    </footer>
  </body>
</html>
`;
}

/** The two files of a step: the page and the shared stylesheet. */
export const files = (o: PageOptions = {}) => ({ 'index.html': page(o), 'styles.css': o.lang === 'en' ? baseCssEn : baseCss });
