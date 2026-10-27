<!--
	«Куда ведёт ссылка» (part 2, lesson 4). Two small experiments. First: the browser's own URL
	resolver takes the address of the current page and the href that was typed, and shows what the
	link really points to. Second: which candidate of an image's srcset a browser would pick for a
	window width and a screen density (a simplified rule: the smallest file that is still sharp).
	Nothing is requested: no address is opened and no image is loaded.
-->
<script lang="ts">
	import './shared.css';

	let base = $state('https://zarechye.example/uslugi/mezhevanie.html');
	let href = $state('../kontakty.html');
	const examples = [
		['Относительная', 'kontakty.html'],
		['Из корня сайта', '/kontakty.html'],
		['На уровень вверх', '../kontakty.html'],
		['Абсолютная', 'https://example.org/page'],
		['Якорь', '#price'],
		['Почта', 'mailto:ksenia@zarechye.example'],
		['Телефон', 'tel:+70000000000']
	];

	const info = $derived.by(() => {
		const h = href.trim();
		let kind = 'относительная: считается от адреса текущей страницы';
		if (/^[a-z][a-z0-9+.-]*:/i.test(h)) kind = /^https?:/i.test(h) ? 'абсолютная: адрес полный, откуда бы вы ни шли' : 'особая схема: открывает почту, телефон или другую программу';
		else if (h.startsWith('#')) kind = 'якорь: место на этой же странице, на сервер не уходит';
		else if (h.startsWith('//')) kind = 'абсолютная без схемы: берёт схему текущей страницы';
		else if (h.startsWith('/')) kind = 'от корня сайта: путь считается от главной, а не от текущей страницы';
		try {
			return { full: new URL(h, base).href, kind };
		} catch {
			return { full: '', kind: 'не получается разобрать: проверьте адрес страницы' };
		}
	});

	const sizes = [480, 800, 1200, 2000];
	let width = $state(390);
	let dpr = $state(2);
	const need = $derived(width * dpr);
	const pick = $derived(sizes.find((s) => s >= need) ?? sizes[sizes.length - 1]);
</script>

<figure class="dg">
	<figcaption>Куда ведёт ссылка</figcaption>
	<div class="dg-ctl">
		<label>Адрес этой страницы: <input type="text" bind:value={base} spellcheck="false" size="42" /></label>
	</div>
	<div class="dg-ctl">
		<label>Значение href: <input type="text" bind:value={href} spellcheck="false" size="36" /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Примеры значений href">
		{#each examples as [name, v] (name)}
			<button type="button" aria-pressed={href === v} onclick={() => (href = v)}>{name}</button>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		Это ссылка <strong>{info.kind}</strong>.
		{#if info.full}<br />Браузер откроет: <span class="dg-mono">{info.full}</span>{/if}
	</p>

	<h4>Какую картинку выберет браузер</h4>
	<p class="dg-out">
		Одна картинка лежит на сервере в четырёх размерах: 480, 800, 1200 и 2000 пикселей по ширине. Атрибут <span class="dg-mono">srcset</span> перечисляет их, а браузер сам выбирает нужный для вашего экрана.
	</p>
	<div class="dg-ctl">
		<label>
			Ширина окна: <strong>{width} px</strong>
			<input type="range" min="320" max="1400" step="10" bind:value={width} aria-label="Ширина окна в пикселях" />
		</label>
		<label>
			Плотность экрана:
			<select bind:value={dpr}>
				<option value={1}>обычный (×1)</option>
				<option value={2}>retina, телефон (×2)</option>
				<option value={3}>очень плотный (×3)</option>
			</select>
		</label>
	</div>
	<p class="dg-out" aria-live="polite">
		Картинка на всю ширину окна должна быть не уже, чем <strong>{need} px</strong> (ширина × плотность). Браузер возьмёт файл <strong>{pick} px</strong>{need > 2000 ? ' (больше нет, это самый большой)' : ''}.
		Так телефон не скачивает лишние пиксели, а большой экран не получает размытую картинку.
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
	h4 {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
