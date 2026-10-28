<!--
	«Рамка, которую можно сузить» (part 3, lesson 6). A small mobile-first page in a frame whose
	width the person moves from a phone to a monitor. It is a real page with real media and
	container queries inside a sandboxed frame with no scripts, so the frame reflows exactly as a
	browser would. The same card sits twice: in the wide main column and in the narrow side column.
	The card answers its own container's width, not the window's, and the numbers under the frame
	(approximate: they are computed from the page's grid, not measured) say which rule applied.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			service: 'Первая услуга',
			price: 'от 5 000 ₽',
			onRequest: 'по договорённости',
			project: 'Название проекта',
			main: 'Основной блок',
			side: 'Сбоку',
			caption: 'Одна страница на разных экранах',
			width: 'Ширина окна',
			widthLabel: 'Ширина окна в пикселях',
			typical: 'Типичные ширины',
			frame: 'Страница на выбранной ширине',
			query: 'Медиазапрос',
			fired: 'сработал, два столбца',
			notFired: 'не сработал, один столбец',
			cardMain: 'Карточка в основном блоке: контейнер около',
			cardSide: 'Карточка сбоку: контейнер около',
			threshold: 'а порог контейнерного запроса 416 px (26rem)',
			horizontal: 'горизонтальная',
			vertical: 'вертикальная',
			note: 'Окно одно, а карточки ведут себя по-разному: каждая смотрит на ширину своего места. В этом разница между медиазапросом и контейнерным запросом.'
		},
		en: {
			service: 'First service',
			price: 'from £000',
			onRequest: 'on quotation',
			project: 'Project name',
			main: 'Main block',
			side: 'Side',
			caption: 'One page on different screens',
			width: 'Window width',
			widthLabel: 'Window width in pixels',
			typical: 'Typical widths',
			frame: 'The page at the chosen width',
			query: 'The media query',
			fired: 'applies, two columns',
			notFired: 'does not apply, one column',
			cardMain: 'The card in the main block: the container is about',
			cardSide: 'The card in the side column: the container is about',
			threshold: 'and the container query’s threshold is 416 px (26rem)',
			horizontal: 'horizontal',
			vertical: 'vertical',
			note: 'There is one window, yet the cards behave differently: each looks at the width of its own place. That is the difference between a media query and a container query.'
		}
	});

	let title = $state(W.service);
	let price = $state(W.price);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.[0]) {
				title = p.items[0].title;
				price = p.items[0].price || W.onRequest;
			}
		} catch {
			/* the example stays */
		}
	});

	let width = $state(390);
	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const css = `*,*::before,*::after{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,sans-serif;color:#1d2430;background:#fff}
header{background:#1a4d8f;color:#fff;padding:.75rem 1rem}
.layout{display:grid;gap:1rem;padding:1rem;grid-template-areas:"main" "aside"}
@media (min-width:48rem){.layout{grid-template-columns:minmax(0,2fr) minmax(8rem,1fr);grid-template-areas:"main aside"}}
main{grid-area:main}aside{grid-area:aside}
h2{margin:0 0 .5rem;font-size:1rem}
.slot{container-type:inline-size}
.card{background:#e8eef6;padding:.75rem;border-radius:.5rem}
.card h3{margin:0 0 .25rem;font-size:1rem}.card p{margin:0}.price{font-weight:600}
@container (min-width:26rem){.card{display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:1rem}}`;
	const card = $derived(`<div class="slot"><div class="card"><h3>${esc(title)}</h3><p class="price">${esc(price)}</p></div></div>`);
	const srcdoc = $derived(
		`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>${css}</style><header>${W.project}</header><div class="layout"><main><h2>${W.main}</h2>${card}</main><aside><h2>${W.side}</h2>${card}</aside></div>`
	);

	const wide = $derived(width >= 768);
	// the page's own grid, to estimate the two containers (16px = 1rem): padding 2rem, gap 1rem
	const mainW = $derived(wide ? Math.round(((width - 48) * 2) / 3) : width - 32);
	const asideW = $derived(wide ? Math.round((width - 48) / 3) : width - 32);
	const marks = [320, 480, 768, 1024, 1280];
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.width}: <strong>{width} px</strong>
			<input type="range" min="320" max="1280" step="10" bind:value={width} aria-label={W.widthLabel} />
		</label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.typical}>
		{#each marks as m (m)}<button type="button" aria-pressed={width === m} onclick={() => (width = m)}>{m}</button>{/each}
	</div>
	<div class="stage"><iframe title={W.frame} sandbox="" style="width: {width}px" {srcdoc}></iframe></div>
	<ul class="dg-out report">
		<li>{W.query} <span class="dg-mono">min-width: 48rem</span> (768 px): <strong>{wide ? W.fired : W.notFired}</strong>.</li>
		<li>{W.cardMain} {mainW} px, {W.threshold}: <strong>{mainW >= 416 ? W.horizontal : W.vertical}</strong>.</li>
		<li>{W.cardSide} {asideW} px: <strong>{asideW >= 416 ? W.horizontal : W.vertical}</strong>.</li>
	</ul>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.stage {
		overflow-x: auto;
		padding: var(--space-3);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
	}
	iframe {
		display: block;
		max-width: none;
		height: 22rem;
		border: 0;
		background: #fff;
	}
	.report {
		padding-left: var(--space-5) !important;
		margin: var(--space-3) 0 0;
	}
</style>
