// @ts-nocheck
/*
	«Учебный генератор»: крошечный генератор сайта для урока 5 части 8 и его практики. Он делает то же,
	что настоящие генераторы, в миниатюре: берёт файл Markdown с front matter, подставляет данные в
	шаблон в стиле Liquid (Jekyll) и выдаёт готовый HTML. Не Jekyll и не Eleventy: понимает только
	{% for x in list %}...{% endfor %}, {{ путь }} и фильтры escape и strip (остальные игнорирует).
	Файл написан на простом JavaScript без типов: практика вставляет его текст в страницу человека
	(блок data-scaffold). Licence: Apache-2.0.
*/

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** «---\nключ: значение\n---\nтекст» → { data, body }. Значения остаются строками. */
export function frontMatter(text) {
	const m = /^\s*---\s*\n([\s\S]*?)\n---\s*(?:\n([\s\S]*))?$/.exec(text);
	if (!m) return { data: {}, body: text, ok: false };
	const data = {};
	for (const line of m[1].split('\n')) {
		const k = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line.trim());
		if (k) data[k[1]] = k[2].replace(/^["']|["']$/g, '');
	}
	return { data, body: m[2] ?? '', ok: true };
}

/** Подстановка: циклы, {{ путь | фильтр }}. */
export function liquid(tpl, ctx) {
	const out = tpl.replace(/\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g, (_, v, list, body) =>
		(Array.isArray(ctx[list]) ? ctx[list] : []).map((item) => liquid(body, { ...ctx, [v]: item })).join('')
	);
	return out.replace(/\{\{\s*([\w.]+)\s*(?:\|\s*(\w+))?[^}]*\}\}/g, (_, path, filter) => {
		let v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), ctx);
		if (v == null) v = '';
		return filter === 'escape' ? esc(v) : String(v).trim();
	});
}

// Как и настоящий Markdown, пропускает HTML и сущности как есть (экранирует фильтр escape в шаблоне).
const inline = (s) =>
	s
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

/** Markdown в миниатюре: # и ## заголовки, абзацы, списки «- », **жирный**, [ссылка](адрес). */
export function markdown(src) {
	const html = [];
	let para = [];
	let list = false;
	const flush = () => {
		if (para.length) html.push('<p>' + inline(para.join(' ')) + '</p>');
		para = [];
	};
	const close = () => {
		if (list) html.push('</ul>');
		list = false;
	};
	for (const raw of src.split('\n')) {
		const line = raw.trim();
		let m;
		if (!line) (flush(), close());
		else if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) (flush(), close(), html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`));
		else if ((m = /^[-*]\s+(.*)$/.exec(line))) (flush(), list || html.push('<ul>'), (list = true), html.push('<li>' + inline(m[1]) + '</li>'));
		else (close(), para.push(line));
	}
	flush();
	close();
	return html.join('\n');
}

/**
 * Собирает одну страницу: front matter, подстановка данных в текст, Markdown, потом layout.
 * site: настройки (title, lang...), pages: все страницы [{title, path}], collections: { items: [...] }.
 */
export function buildPage(layout, site, file, pages, collections) {
	const fm = frontMatter(file);
	const ctx = { site, pages, ...collections, page: fm.data };
	const content = markdown(liquid(fm.body, ctx));
	return liquid(layout, { ...ctx, content });
}
