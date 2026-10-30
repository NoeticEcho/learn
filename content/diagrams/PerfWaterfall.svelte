<!--
	«Водопад загрузки» (part 15, lesson 1). A teaching model of one landing page on a slow mobile
	network (200 KB/s, 150 ms round trip: the order of magnitude of Lighthouse's simulated slow
	4G). The person switches seven fixes on and watches three numbers (LCP, INP, CLS) move across
	the thresholds of Core Web Vitals (2.5 s / 200 ms / 0.1 good, 4 s / 500 ms / 0.25 poor), and the
	page weight against a budget they type. The formulas are a simplification chosen to show which
	fix matters, not a measurement: real numbers come from Lighthouse and from real visits.

	Bilingual: its words are in `W`, one entry per edition (docs/content-plan/README.md, «English edition»).
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	const BW = 200; // KB per second
	const RTT = 0.15;

	const W = pick({
		ru: {
			fixes: {
				img: ['Сжать главную картинку и выдать мобильный размер (srcset, WebP/AVIF)', 'Было 900 КБ, станет около 110 КБ.'],
				prio: ['Не откладывать главную картинку: убрать loading="lazy", добавить fetchpriority="high"', 'Браузер начинает качать её сразу, а не после раскладки.'],
				dims: ['Задать width и height всем картинкам и место под блоки', 'Браузер резервирует место, текст не прыгает.'],
				defer: ['Подключить скрипт с defer', 'Скрипт не блокирует показ страницы.'],
				lessjs: ['Убрать из скрипта лишнее (было 300 КБ, станет 90 КБ)', 'Меньше кода выполнять, быстрее отклик.'],
				chat: ['Загружать чат-виджет после первого касания, а не вместе со страницей', 'Сторонний код не мешает первому экрану и отклику.'],
				font: ['Шрифт: font-display: swap и только нужные начертания и письменности', 'Текст виден сразу, шрифт подгружается позже.']
			},
			rows: { html: 'HTML', css: 'CSS', hero: 'Главная картинка', font: 'Шрифт', js: 'Скрипт сайта', chat: 'Чат-виджет (чужой)', counter: 'Счётчик', others: 'Остальные картинки' },
			afterFirst: ' (после первого экрана)',
			kb: 'КБ',
			s: 'с',
			ms: 'мс',
			num: (n: number, d: number) => n.toFixed(d).replace('.', ','),
			good: '✓ хорошо',
			mid: '! нужно улучшить',
			poor: '✕ плохо',
			lcp: 'LCP: когда виден главный элемент',
			inp: 'INP: как быстро страница отвечает',
			cls: 'CLS: насколько прыгает макет',
			lcpRule: 'хорошо до 2,5 с, плохо после 4 с',
			inpRule: 'хорошо до 200 мс, плохо после 500 мс',
			clsRule: 'хорошо до 0,1, плохо после 0,25',
			caption: 'Водопад загрузки: что тянет страницу вниз',
			intro: 'Это модель одной посадочной страницы на медленном мобильном интернете (200 КБ/с). Включайте исправления по одному и смотрите, какое сдвигает какой показатель. Числа учебные: настоящие дают Lighthouse и реальные посещения.',
			fixesLabel: 'Исправления',
			bars: 'Ширина полос показывает размер файлов страницы; чем больше файл, тем длиннее полоса.',
			budgetKb: 'Бюджет по весу, КБ',
			budgetReq: 'Бюджет по запросам',
			weight: (w: number, b: number) => `Вес страницы <strong>${w} КБ</strong> при бюджете ${b} КБ: ${w <= b ? 'в рамках' : `выше на ${w - b} КБ`}.`,
			requests: (r: number, b: number) => `Запросов <strong>${r}</strong> при бюджете ${b}: ${r <= b ? 'в рамках' : 'выше'}.`,
			done: (d: number, n: number) => `Включено исправлений: ${d} из ${n}.`,
			altLabel: 'Текстовая альтернатива:',
			alt: 'без исправлений страница грузит около 900 КБ главной картинки с отложенной загрузкой, большой скрипт и чужой чат вместе с первым экраном: LCP около 8 с, INP около 500 мс, CLS около 0,3. Сжатая картинка с высоким приоритетом, размеры картинок, defer, лёгкий скрипт, чат после касания и шрифт со swap приводят все три показателя в зелёную зону.'
		},
		en: {
			fixes: {
				img: ['Compress the main picture and serve a mobile size (srcset, WebP/AVIF)', 'It was 900 KB and will be about 110 KB.'],
				prio: ['Stop postponing the main picture: remove loading="lazy", add fetchpriority="high"', 'The browser starts fetching it at once, not after the layout.'],
				dims: ['Give every image a width and a height, and reserve room for blocks', 'The browser reserves the space, so the text doesn’t jump.'],
				defer: ['Load the script with defer', 'The script doesn’t block showing the page.'],
				lessjs: ['Cut the extras out of the script (300 KB becomes 90 KB)', 'Less code to run, a faster response.'],
				chat: ['Load the chat widget after the first tap, not together with the page', 'Third-party code doesn’t get in the way of the first screen or the response.'],
				font: ['Fonts: font-display: swap and only the weights and scripts you need', 'The text is visible at once and the font loads later.']
			},
			rows: { html: 'HTML', css: 'CSS', hero: 'Main picture', font: 'Font', js: 'Site script', chat: 'Chat widget (third-party)', counter: 'Analytics counter', others: 'Other images' },
			afterFirst: ' (after the first screen)',
			kb: 'KB',
			s: 's',
			ms: 'ms',
			num: (n: number, d: number) => n.toFixed(d),
			good: '✓ good',
			mid: '! needs improvement',
			poor: '✕ poor',
			lcp: 'LCP: when the main element is visible',
			inp: 'INP: how fast the page responds',
			cls: 'CLS: how much the layout jumps',
			lcpRule: 'good up to 2.5 s, poor over 4 s',
			inpRule: 'good up to 200 ms, poor over 500 ms',
			clsRule: 'good up to 0.1, poor over 0.25',
			caption: 'Load waterfall: what drags the page down',
			intro: 'This is a model of one landing page on a slow mobile network (200 KB/s). Switch fixes on one at a time and see which one moves which measure. The numbers are for teaching: real ones come from Lighthouse and from real visits.',
			fixesLabel: 'Fixes',
			bars: 'The width of each bar shows the size of a page file: the bigger the file, the longer the bar.',
			budgetKb: 'Weight budget, KB',
			budgetReq: 'Request budget',
			weight: (w: number, b: number) => `Page weight <strong>${w} KB</strong> against a budget of ${b} KB: ${w <= b ? 'within budget' : `over by ${w - b} KB`}.`,
			requests: (r: number, b: number) => `Requests <strong>${r}</strong> against a budget of ${b}: ${r <= b ? 'within budget' : 'over'}.`,
			done: (d: number, n: number) => `Fixes switched on: ${d} of ${n}.`,
			altLabel: 'Text alternative:',
			alt: 'with no fixes the page loads about 900 KB of main picture, lazily, a big script and a third-party chat together with the first screen: LCP about 8 s, INP about 500 ms, CLS about 0.3. A compressed picture with high priority, image sizes, defer, a lighter script, the chat after a tap and a font with swap bring all three measures into the green zone.'
		}
	});

	type Fix = { id: string; label: string; hint: string; on: boolean };
	let fixes = $state<Fix[]>(
		(['img', 'prio', 'dims', 'defer', 'lessjs', 'chat', 'font'] as const).map((id) => ({ id, label: W.fixes[id][0], hint: W.fixes[id][1], on: false }))
	);
	const on = (id: string) => fixes.find((f) => f.id === id)!.on;

	let budgetKb = $state(800);
	let budgetReq = $state(15);

	const hero = $derived(on('img') ? 110 : 900);
	const js = $derived(on('lessjs') ? 90 : 300);
	const font = $derived(on('font') ? 18 : 55);
	const chat = 250;
	const analytics = 60;
	const others = 120; // three more pictures, already modest

	const rows = $derived([
		{ name: W.rows.html, kb: 20, early: true },
		{ name: W.rows.css, kb: 40, early: true },
		{ name: W.rows.hero, kb: hero, early: true },
		{ name: W.rows.font, kb: font, early: !on('font') },
		{ name: W.rows.js, kb: js, early: !on('defer') },
		{ name: W.rows.chat, kb: chat, early: false },
		{ name: W.rows.counter, kb: analytics, early: false },
		{ name: W.rows.others, kb: others, early: false }
	]);

	const bytesBeforeLcp = $derived(rows.filter((r) => r.early).reduce((s, r) => s + r.kb, 0) + (on('chat') ? 0 : chat / 2));
	const lcp = $derived(RTT * 2 + bytesBeforeLcp / BW + (on('prio') ? 0 : 0.6) - (on('prio') ? 0.2 : 0));
	const inp = $derived(90 + (on('chat') ? 0 : 300) + (on('lessjs') ? 0 : 120));
	const cls = $derived((on('dims') ? 0.02 : 0.31) + (on('font') ? 0.0 : 0.03));
	const weight = $derived(rows.reduce((s, r) => s + r.kb, 0));
	const requests = 7 + 3;

	type Level = 'good' | 'mid' | 'poor';
	const level = (v: number, good: number, poor: number): Level => (v <= good ? 'good' : v <= poor ? 'mid' : 'poor');
	const mark: Record<Level, string> = { good: W.good, mid: W.mid, poor: W.poor };

	const gauges = $derived([
		{ id: 'lcp', name: W.lcp, value: `${W.num(lcp, 1)} ${W.s}`, lv: level(lcp, 2.5, 4), rule: W.lcpRule },
		{ id: 'inp', name: W.inp, value: `${Math.round(inp)} ${W.ms}`, lv: level(inp, 200, 500), rule: W.inpRule },
		{ id: 'cls', name: W.cls, value: W.num(cls, 2), lv: level(cls, 0.1, 0.25), rule: W.clsRule }
	]);
	const bar = (kb: number) => Math.max(2, Math.min(100, (kb / 900) * 100));
	const done = $derived(fixes.filter((f) => f.on).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>

	<ul class="fix" aria-label={W.fixesLabel}>
		{#each fixes as f (f.id)}
			<li>
				<label>
					<input type="checkbox" bind:checked={f.on} />
					<span><strong>{f.label}</strong><br /><span class="dim">{f.hint}</span></span>
				</label>
			</li>
		{/each}
	</ul>

	<div class="gauges" aria-live="polite">
		{#each gauges as g (g.id)}
			<div class="gauge {g.lv}">
				<span class="gn">{g.name}</span>
				<span class="gv">{g.value}</span>
				<span class="gl">{mark[g.lv]}</span>
				<span class="dim">{g.rule}</span>
			</div>
		{/each}
	</div>

	<div class="wf" role="img" aria-label={W.bars}>
		{#each rows as r, i (i)}
			<div class="row">
				<span class="rn">{r.name}{r.early ? '' : W.afterFirst}</span>
				<span class="rb"><span class="fill" class:early={r.early} style:width="{bar(r.kb)}%"></span></span>
				<span class="rk">{r.kb} {W.kb}</span>
			</div>
		{/each}
	</div>

	<div class="budget">
		<label>{W.budgetKb} <input type="number" min="50" max="5000" step="50" bind:value={budgetKb} /></label>
		<label>{W.budgetReq} <input type="number" min="3" max="100" step="1" bind:value={budgetReq} /></label>
	</div>
	<p class="dg-out" aria-live="polite">
		{@html W.weight(weight, budgetKb)}
		{@html W.requests(requests, budgetReq)}
		{W.done(done, fixes.length)}
	</p>
	<p class="dg-out alt"><strong>{W.altLabel}</strong> {W.alt}</p>
</figure>

<style>
	.fix {
		list-style: none;
		margin: 0 0 var(--space-4);
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.fix li {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-1) var(--space-3);
	}
	.fix label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: start;
		min-height: var(--hit-min);
	}
	.dim {
		color: var(--text-secondary);
	}
	.gauges {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.gauge {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
	}
	.gauge.good {
		border-color: var(--accent-measure);
	}
	.gauge.mid {
		border-color: var(--border-brass);
		border-style: dashed;
	}
	.gauge.poor {
		border-style: dotted;
	}
	.gv {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.gl {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.wf {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-4);
	}
	.row {
		display: grid;
		grid-template-columns: minmax(8rem, 12rem) 1fr 5rem;
		gap: var(--space-2);
		align-items: center;
	}
	.rb {
		display: block;
		height: 0.7rem;
		border: var(--line) solid var(--border-hairline);
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--border-rule);
	}
	.fill.early {
		background: var(--accent-measure);
	}
	.rk {
		text-align: right;
		font-family: var(--font-mono);
	}
	.budget {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}
	.budget input {
		width: 6rem;
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: none;
		color: var(--text-body);
	}
	@media (max-width: 40rem) {
		.row {
			grid-template-columns: 1fr 4.5rem;
		}
		.rb {
			grid-column: 1 / -1;
			order: 3;
		}
	}
</style>
