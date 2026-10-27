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

	let title = $state('Первая услуга');
	let price = $state('от 5 000 ₽');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.[0]) {
				title = p.items[0].title;
				price = p.items[0].price || 'по договорённости';
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
		`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>${css}</style><header>Название проекта</header><div class="layout"><main><h2>Основной блок</h2>${card}</main><aside><h2>Сбоку</h2>${card}</aside></div>`
	);

	const wide = $derived(width >= 768);
	// the page's own grid, to estimate the two containers (16px = 1rem): padding 2rem, gap 1rem
	const mainW = $derived(wide ? Math.round(((width - 48) * 2) / 3) : width - 32);
	const asideW = $derived(wide ? Math.round((width - 48) / 3) : width - 32);
	const marks = [320, 480, 768, 1024, 1280];
</script>

<figure class="dg">
	<figcaption>Одна страница на разных экранах</figcaption>
	<div class="dg-ctl">
		<label>
			Ширина окна: <strong>{width} px</strong>
			<input type="range" min="320" max="1280" step="10" bind:value={width} aria-label="Ширина окна в пикселях" />
		</label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Типичные ширины">
		{#each marks as m (m)}<button type="button" aria-pressed={width === m} onclick={() => (width = m)}>{m}</button>{/each}
	</div>
	<div class="stage"><iframe title="Страница на выбранной ширине" sandbox="" style="width: {width}px" {srcdoc}></iframe></div>
	<ul class="dg-out report">
		<li>Медиазапрос <span class="dg-mono">min-width: 48rem</span> (768 px): <strong>{wide ? 'сработал, два столбца' : 'не сработал, один столбец'}</strong>.</li>
		<li>Карточка в основном блоке: контейнер около {mainW} px, а порог контейнерного запроса 416 px (26rem): <strong>{mainW >= 416 ? 'горизонтальная' : 'вертикальная'}</strong>.</li>
		<li>Карточка сбоку: контейнер около {asideW} px: <strong>{asideW >= 416 ? 'горизонтальная' : 'вертикальная'}</strong>.</li>
	</ul>
	<p class="dg-out">Окно одно, а карточки ведут себя по-разному: каждая смотрит на ширину своего места. В этом разница между медиазапросом и контейнерным запросом.</p>
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
