/**
 * Scaffolding: what a lesson puts into the person's page for the exercise and not for their
 * site, such as a note to fill in or a table to complete. A content author marks it with the
 * attribute `data-scaffold` on the element (any element, any class). The practice preview shows
 * it; the gallery and «Скачать сайт» leave it out, because those are the person's site.
 *
 * Pages saved before the marker existed (schema 1's era pages) carried the same notes as
 * `<aside class="note">`; with `legacy` those go too.
 */
export const SCAFFOLD = 'data-scaffold';

const LEGACY = /<aside\b[^>]*\bclass=["'][^"']*\bnote\b/i;

/** The page without its scaffolding. A page with none is returned exactly as written. */
export function withoutScaffold(html: string, opts: { legacy?: boolean } = {}): string {
	const legacy = !!opts.legacy && LEGACY.test(html);
	if (!html.includes(SCAFFOLD) && !legacy) return html;
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const marked = doc.querySelectorAll(`[${SCAFFOLD}]${legacy ? ', aside.note' : ''}`);
	if (!marked.length) return html;
	for (const el of Array.from(marked)) el.remove();
	const doctype = /^\s*<!doctype[^>]*>/i.exec(html)?.[0].trim();
	return (doctype ? `${doctype}\n` : '') + doc.documentElement.outerHTML;
}
