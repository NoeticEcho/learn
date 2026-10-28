<!--
	«Куда ведёт ссылка» (part 2, lesson 4). Two small experiments. First: the browser's own URL
	resolver takes the address of the current page and the href that was typed, and shows what the
	link really points to. Second: which candidate of an image's srcset a browser would pick for a
	window width and a screen density (a simplified rule: the smallest file that is still sharp).
	Nothing is requested: no address is opened and no image is loaded.

	Bilingual (docs/content-plan/README.md, «English edition»): its words are in `W`, one entry per
	edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			base: 'https://zarechye.example/uslugi/mezhevanie.html',
			href: '../kontakty.html',
			examples: [
				['Относительная', 'kontakty.html'],
				['Из корня сайта', '/kontakty.html'],
				['На уровень вверх', '../kontakty.html'],
				['Абсолютная', 'https://example.org/page'],
				['Якорь', '#price'],
				['Почта', 'mailto:ksenia@zarechye.example'],
				['Телефон', 'tel:+70000000000']
			] as [string, string][],
			relative: 'относительная: считается от адреса текущей страницы',
			absolute: 'абсолютная: адрес полный, откуда бы вы ни шли',
			scheme: 'особая схема: открывает почту, телефон или другую программу',
			anchor: 'якорь: место на этой же странице, на сервер не уходит',
			protocolRelative: 'абсолютная без схемы: берёт схему текущей страницы',
			root: 'от корня сайта: путь считается от главной, а не от текущей страницы',
			broken: 'не получается разобрать: проверьте адрес страницы',
			caption: 'Куда ведёт ссылка',
			pageAddress: 'Адрес этой страницы:',
			hrefValue: 'Значение href:',
			examplesLabel: 'Примеры значений href',
			isLink: 'Это ссылка',
			opens: 'Браузер откроет:',
			which: 'Какую картинку выберет браузер',
			intro: 'Одна картинка лежит на сервере в четырёх размерах: 480, 800, 1200 и 2000 пикселей по ширине. Атрибут',
			intro2: 'перечисляет их, а браузер сам выбирает нужный для вашего экрана.',
			width: 'Ширина окна:',
			widthLabel: 'Ширина окна в пикселях',
			density: 'Плотность экрана:',
			d1: 'обычный (×1)',
			d2: 'retina, телефон (×2)',
			d3: 'очень плотный (×3)',
			need1: 'Картинка на всю ширину окна должна быть не уже, чем',
			need2: '(ширина × плотность). Браузер возьмёт файл',
			biggest: ' (больше нет, это самый большой)',
			outro: 'Так телефон не скачивает лишние пиксели, а большой экран не получает размытую картинку.'
		},
		en: {
			base: 'https://riverbend.example/services/boundary-survey.html',
			href: '../contact.html',
			examples: [
				['Relative', 'contact.html'],
				['From the site root', '/contact.html'],
				['One level up', '../contact.html'],
				['Absolute', 'https://example.org/page'],
				['Anchor', '#price'],
				['Email', 'mailto:kate@riverbend.example'],
				['Phone', 'tel:+440000000000']
			] as [string, string][],
			relative: 'relative: worked out from the address of the current page',
			absolute: 'absolute: the address is complete, wherever you start from',
			scheme: 'a special scheme: opens an email, a phone call or another program',
			anchor: 'an anchor: a place on this same page, nothing goes to the server',
			protocolRelative: 'absolute without a scheme: takes the scheme of the current page',
			root: 'from the site root: the path starts at the home page, not at the current page',
			broken: 'can’t be read: check the address of the page',
			caption: 'Where a link goes',
			pageAddress: 'Address of this page:',
			hrefValue: 'The href value:',
			examplesLabel: 'Example href values',
			isLink: 'This link is',
			opens: 'The browser will open:',
			which: 'Which image the browser will pick',
			intro: 'One image sits on the server in four sizes: 480, 800, 1200 and 2000 pixels wide. The',
			intro2: 'attribute lists them, and the browser picks the right one for your screen.',
			width: 'Window width:',
			widthLabel: 'Window width in pixels',
			density: 'Screen density:',
			d1: 'standard (×1)',
			d2: 'retina, phone (×2)',
			d3: 'very dense (×3)',
			need1: 'An image that fills the window must be at least',
			need2: 'wide (width × density). The browser will take the file',
			biggest: ' (there is nothing bigger, so this is the largest)',
			outro: 'That way a phone doesn’t download pixels it can’t use, and a big screen doesn’t get a blurry picture.'
		}
	});

	let base = $state(W.base);
	let href = $state(W.href);
	const examples = W.examples;

	const info = $derived.by(() => {
		const h = href.trim();
		let kind = W.relative;
		if (/^[a-z][a-z0-9+.-]*:/i.test(h)) kind = /^https?:/i.test(h) ? W.absolute : W.scheme;
		else if (h.startsWith('#')) kind = W.anchor;
		else if (h.startsWith('//')) kind = W.protocolRelative;
		else if (h.startsWith('/')) kind = W.root;
		try {
			return { full: new URL(h, base).href, kind };
		} catch {
			return { full: '', kind: W.broken };
		}
	});

	const sizes = [480, 800, 1200, 2000];
	let width = $state(390);
	let dpr = $state(2);
	const need = $derived(width * dpr);
	const chosen = $derived(sizes.find((s) => s >= need) ?? sizes[sizes.length - 1]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.pageAddress} <input type="text" bind:value={base} spellcheck="false" size="42" /></label>
	</div>
	<div class="dg-ctl">
		<label>{W.hrefValue} <input type="text" bind:value={href} spellcheck="false" size="36" /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.examplesLabel}>
		{#each examples as [name, v] (name)}
			<button type="button" aria-pressed={href === v} onclick={() => (href = v)}>{name}</button>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		{W.isLink} <strong>{info.kind}</strong>.
		{#if info.full}<br />{W.opens} <span class="dg-mono">{info.full}</span>{/if}
	</p>

	<div class="dh">{W.which}</div>
	<p class="dg-out">
		{W.intro} <span class="dg-mono">srcset</span> {W.intro2}
	</p>
	<div class="dg-ctl">
		<label>
			{W.width} <strong>{width} px</strong>
			<input type="range" min="320" max="1400" step="10" bind:value={width} aria-label={W.widthLabel} />
		</label>
		<label>
			{W.density}
			<select bind:value={dpr}>
				<option value={1}>{W.d1}</option>
				<option value={2}>{W.d2}</option>
				<option value={3}>{W.d3}</option>
			</select>
		</label>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.need1} <strong>{need} px</strong> {W.need2} <strong>{chosen} px</strong>{need > 2000 ? W.biggest : ''}.
		{W.outro}
	</p>
</figure>

<style>
	input[type='text'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-family: var(--font-mono);
		max-width: 100%;
	}
	.dh {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
