<!--
	«Конструктор палитры» (part 4, lesson 5). One accent hue becomes a ramp of eleven steps in
	OKLCH (equal steps of lightness look equal to the eye). For each text-on-background pair the
	WCAG contrast ratio is computed here, in the open, with the formula from WCAG 2: relative
	luminance from linear sRGB, then (L1 + 0.05) / (L2 + 0.05). A switch moves between a light
	theme and a dark one, which is not an inversion: different steps play the same roles.
-->
<script lang="ts">
	import './shared.css';

	let hue = $state(255);
	let chroma = $state(0.14);
	let dark = $state(false);

	const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
	const light = [0.98, 0.95, 0.9, 0.83, 0.74, 0.64, 0.55, 0.47, 0.39, 0.31, 0.23];

	function oklch(L: number, C: number, h: number): [number, number, number] {
		const a = C * Math.cos((h * Math.PI) / 180);
		const b = C * Math.sin((h * Math.PI) / 180);
		const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
		const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
		const s_ = L - 0.0894841775 * a - 1.291485548 * b;
		const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
		return [
			4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
			-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
			-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
		];
	}
	const inGamut = (c: number[]) => c.every((v) => v >= -0.0005 && v <= 1.0005);
	/** linear sRGB for L, C, h, taking chroma down until the colour fits the screen */
	function fit(L: number, C: number, h: number): number[] {
		let c = C;
		let lin = oklch(L, c, h);
		while (!inGamut(lin) && c > 0) {
			c -= 0.005;
			lin = oklch(L, Math.max(c, 0), h);
		}
		return lin.map((v) => Math.min(1, Math.max(0, v)));
	}
	const enc = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
	const hex = (lin: number[]) => '#' + lin.map((v) => Math.round(enc(v) * 255).toString(16).padStart(2, '0')).join('');
	const lum = (lin: number[]) => 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
	const ratio = (a: number[], b: number[]) => {
		const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
		return (x + 0.05) / (y + 0.05);
	};

	const ramp = $derived(
		stops.map((s, i) => {
			// colour is strongest in the middle, softer at both ends
			const c = chroma * (1 - Math.abs(light[i] - 0.6) * 1.3);
			const lin = fit(light[i], Math.max(c, 0), hue);
			return { s, lin, hex: hex(lin) };
		})
	);
	const neutral = $derived(
		stops.map((s, i) => {
			const lin = fit(light[i], 0.012, hue);
			return { s, lin, hex: hex(lin) };
		})
	);
	const white = [1, 1, 1];

	type Pair = { name: string; fg: number[]; bg: number[]; fgHex: string; bgHex: string; need: number };
	const pairs = $derived.by<Pair[]>(() => {
		const r = (s: number) => ramp.find((x) => x.s === s)!;
		const n = (s: number) => neutral.find((x) => x.s === s)!;
		const mk = (name: string, fg: { lin: number[]; hex: string }, bg: { lin: number[]; hex: string }, need = 4.5): Pair => ({ name, fg: fg.lin, bg: bg.lin, fgHex: fg.hex, bgHex: bg.hex, need });
		return dark
			? [
					mk('Основной текст (нейтральный 100 на 950)', n(100), n(950)),
					mk('Вторичный текст (нейтральный 300 на 950)', n(300), n(950)),
					mk('Ссылка (акцент 300 на 950)', r(300), n(950)),
					mk('Кнопка: тёмный текст на акценте 400', n(950), r(400)),
					mk('Слишком тёмный акцент 700 на 950', r(700), n(950))
				]
			: [
					mk('Основной текст (нейтральный 900 на 50)', n(900), n(50)),
					mk('Вторичный текст (нейтральный 700 на 50)', n(700), n(50)),
					mk('Ссылка (акцент 700 на 50)', r(700), n(50)),
					mk('Кнопка: белый текст на акценте 600', { lin: white, hex: '#ffffff' }, r(600)),
					mk('Слишком светлый акцент 300 на 50', r(300), n(50))
				];
	});
	const rows = $derived(pairs.map((p) => ({ ...p, ratio: ratio(p.fg, p.bg) })));
	const stageBg = $derived(dark ? neutral.find((x) => x.s === 950)!.hex : neutral.find((x) => x.s === 50)!.hex);
	const stageFg = $derived(dark ? neutral.find((x) => x.s === 100)!.hex : neutral.find((x) => x.s === 900)!.hex);
	const link = $derived(ramp.find((x) => x.s === (dark ? 300 : 700))!.hex);
	const btnBg = $derived(ramp.find((x) => x.s === (dark ? 400 : 600))!.hex);
	const btnFg = $derived(dark ? neutral.find((x) => x.s === 950)!.hex : '#ffffff');
	const badge = (v: number, need: number) => (v >= 7 && need === 4.5 ? 'AAA' : v >= need ? 'AA' : 'не проходит');
</script>

<figure class="dg">
	<figcaption>Палитра из одного оттенка и проверка контраста</figcaption>
	<div class="ctl">
		<label>Оттенок: {hue}° <input type="range" min="0" max="360" step="5" bind:value={hue} /></label>
		<label>Насыщенность: {chroma.toFixed(2)} <input type="range" min="0" max="0.2" step="0.01" bind:value={chroma} /></label>
		<div class="dg-ctl" role="group" aria-label="Тема" style="margin:0">
			<button type="button" aria-pressed={!dark} onclick={() => (dark = false)}>Светлая тема</button>
			<button type="button" aria-pressed={dark} onclick={() => (dark = true)}>Тёмная тема</button>
		</div>
	</div>

	<div class="ramp" role="img" aria-label="Одиннадцать ступеней акцентного цвета">
		{#each ramp as r (r.s)}
			<div class="sw" style="background:{r.hex};color:{lum(r.lin) > 0.35 ? '#111' : '#fff'}"><span>{r.s}</span></div>
		{/each}
	</div>
	<div class="ramp" role="img" aria-label="Одиннадцать ступеней нейтрального цвета">
		{#each neutral as r (r.s)}
			<div class="sw" style="background:{r.hex};color:{lum(r.lin) > 0.35 ? '#111' : '#fff'}"><span>{r.s}</span></div>
		{/each}
	</div>

	<div class="demo" style="background:{stageBg};color:{stageFg}">
		<p style="margin:0 0 .5rem;font-size:1.1rem;font-weight:600">Так выглядит страница в этой теме</p>
		<p style="margin:0 0 .6rem">Обычный текст и <a href="#top" tabindex="-1" style="color:{link};text-decoration:underline">ссылка с подчёркиванием</a>.</p>
		<span class="btn" style="background:{btnBg};color:{btnFg}">Главное действие</span>
	</div>

	<table class="tbl">
		<caption class="dg-out" style="text-align:left;margin:var(--space-4) 0 var(--space-2)">Контраст пар по формуле WCAG (нужно не меньше 4.5 к 1 для обычного текста)</caption>
		<thead><tr><th>Пара</th><th>Цвета</th><th>Контраст</th><th>Итог</th></tr></thead>
		<tbody>
			{#each rows as p (p.name)}
				<tr class:fail={p.ratio < p.need}>
					<td>{p.name}</td>
					<td class="dg-mono">{p.fgHex} / {p.bgHex}</td>
					<td>{p.ratio.toFixed(2)} к 1</td>
					<td>{p.ratio >= p.need ? '✓ ' : '✕ '}{badge(p.ratio, p.need)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="dg-out">
		Заметьте: ступени подобраны по одинаковому шагу светлоты, поэтому роли держатся на одних и тех же номерах при любом оттенке. А в тёмной
		теме те же роли играют другие ступени: это не инверсия, а новая раскладка. Если пара не проходит при каком-то оттенке, сдвиньте ступень на одну в сторону темноты (для светлой темы) или светлоты (для тёмной).
	</p>
</figure>

<style>
	.ctl {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.ramp {
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		margin-bottom: var(--space-2);
	}
	.sw {
		min-height: 2.6rem;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 2px;
		font-size: 0.7rem;
		font-family: var(--font-mono);
	}
	.demo {
		margin: var(--space-4) 0;
		padding: var(--space-4);
		border: var(--line) solid var(--border-hairline);
	}
	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 600;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-body-sm);
	}
	.tbl th,
	.tbl td {
		text-align: left;
		padding: var(--space-2);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	.tbl tr.fail td:last-child {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	@media (max-width: 40rem) {
		.tbl td:nth-child(2) {
			display: none;
		}
		.tbl th:nth-child(2) {
			display: none;
		}
	}
</style>
