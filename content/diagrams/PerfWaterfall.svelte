<!--
	«Водопад загрузки» (part 15, lesson 1). A teaching model of one landing page on a slow mobile
	network (200 KB/s, 150 ms round trip: the order of magnitude of Lighthouse's simulated slow
	4G). The person switches seven fixes on and watches three numbers (LCP, INP, CLS) move across
	the thresholds of Core Web Vitals (2.5 s / 200 ms / 0.1 good, 4 s / 500 ms / 0.25 poor), and the
	page weight against a budget they type. The formulas are a simplification chosen to show which
	fix matters, not a measurement: real numbers come from Lighthouse and from real visits.
-->
<script lang="ts">
	import './shared.css';

	const BW = 200; // KB per second
	const RTT = 0.15;

	type Fix = { id: string; label: string; hint: string; on: boolean };
	let fixes = $state<Fix[]>([
		{ id: 'img', label: 'Сжать главную картинку и выдать мобильный размер (srcset, WebP/AVIF)', hint: 'Было 900 КБ, станет около 110 КБ.', on: false },
		{ id: 'prio', label: 'Не откладывать главную картинку: убрать loading="lazy", добавить fetchpriority="high"', hint: 'Браузер начинает качать её сразу, а не после раскладки.', on: false },
		{ id: 'dims', label: 'Задать width и height всем картинкам и место под блоки', hint: 'Браузер резервирует место, текст не прыгает.', on: false },
		{ id: 'defer', label: 'Подключить скрипт с defer', hint: 'Скрипт не блокирует показ страницы.', on: false },
		{ id: 'lessjs', label: 'Убрать из скрипта лишнее (было 300 КБ, станет 90 КБ)', hint: 'Меньше кода выполнять, быстрее отклик.', on: false },
		{ id: 'chat', label: 'Загружать чат-виджет после первого касания, а не вместе со страницей', hint: 'Сторонний код не мешает первому экрану и отклику.', on: false },
		{ id: 'font', label: 'Шрифт: font-display: swap и только нужные начертания и письменности', hint: 'Текст виден сразу, шрифт подгружается позже.', on: false }
	]);
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
		{ name: 'HTML', kb: 20, early: true },
		{ name: 'CSS', kb: 40, early: true },
		{ name: 'Главная картинка', kb: hero, early: true },
		{ name: 'Шрифт', kb: font, early: !on('font') },
		{ name: 'Скрипт сайта', kb: js, early: !on('defer') },
		{ name: 'Чат-виджет (чужой)', kb: chat, early: false },
		{ name: 'Счётчик', kb: analytics, early: false },
		{ name: 'Остальные картинки', kb: others, early: false }
	]);

	const bytesBeforeLcp = $derived(rows.filter((r) => r.early).reduce((s, r) => s + r.kb, 0) + (on('chat') ? 0 : chat / 2));
	const lcp = $derived(RTT * 2 + bytesBeforeLcp / BW + (on('prio') ? 0 : 0.6) - (on('prio') ? 0.2 : 0));
	const inp = $derived(90 + (on('chat') ? 0 : 300) + (on('lessjs') ? 0 : 120));
	const cls = $derived((on('dims') ? 0.02 : 0.31) + (on('font') ? 0.0 : 0.03));
	const weight = $derived(rows.reduce((s, r) => s + r.kb, 0));
	const requests = 7 + 3;

	type Level = 'good' | 'mid' | 'poor';
	const level = (v: number, good: number, poor: number): Level => (v <= good ? 'good' : v <= poor ? 'mid' : 'poor');
	const mark: Record<Level, string> = { good: '✓ хорошо', mid: '! нужно улучшить', poor: '✕ плохо' };

	const gauges = $derived([
		{ id: 'lcp', name: 'LCP: когда виден главный элемент', value: `${lcp.toFixed(1).replace('.', ',')} с`, lv: level(lcp, 2.5, 4), rule: 'хорошо до 2,5 с, плохо после 4 с' },
		{ id: 'inp', name: 'INP: как быстро страница отвечает', value: `${Math.round(inp)} мс`, lv: level(inp, 200, 500), rule: 'хорошо до 200 мс, плохо после 500 мс' },
		{ id: 'cls', name: 'CLS: насколько прыгает макет', value: cls.toFixed(2).replace('.', ','), lv: level(cls, 0.1, 0.25), rule: 'хорошо до 0,1, плохо после 0,25' }
	]);
	const bar = (kb: number) => Math.max(2, Math.min(100, (kb / 900) * 100));
	const done = $derived(fixes.filter((f) => f.on).length);
</script>

<figure class="dg">
	<figcaption>Водопад загрузки: что тянет страницу вниз</figcaption>
	<p class="dg-out">Это модель одной посадочной страницы на медленном мобильном интернете (200 КБ/с). Включайте исправления по одному и смотрите, какое сдвигает какой показатель. Числа учебные: настоящие дают Lighthouse и реальные посещения.</p>

	<ul class="fix" aria-label="Исправления">
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

	<div class="wf" role="img" aria-label="Ширина полос показывает размер файлов страницы; чем больше файл, тем длиннее полоса.">
		{#each rows as r, i (i)}
			<div class="row">
				<span class="rn">{r.name}{r.early ? '' : ' (после первого экрана)'}</span>
				<span class="rb"><span class="fill" class:early={r.early} style:width="{bar(r.kb)}%"></span></span>
				<span class="rk">{r.kb} КБ</span>
			</div>
		{/each}
	</div>

	<div class="budget">
		<label>Бюджет по весу, КБ <input type="number" min="50" max="5000" step="50" bind:value={budgetKb} /></label>
		<label>Бюджет по запросам <input type="number" min="3" max="100" step="1" bind:value={budgetReq} /></label>
	</div>
	<p class="dg-out" aria-live="polite">
		Вес страницы <strong>{weight} КБ</strong> при бюджете {budgetKb} КБ: {weight <= budgetKb ? 'в рамках' : `выше на ${weight - budgetKb} КБ`}.
		Запросов <strong>{requests}</strong> при бюджете {budgetReq}: {requests <= budgetReq ? 'в рамках' : 'выше'}.
		Включено исправлений: {done} из {fixes.length}.
	</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> без исправлений страница грузит около 900 КБ главной картинки с отложенной загрузкой, большой скрипт и чужой чат вместе с первым экраном: LCP около 8 с, INP около 500 мс, CLS около 0,3. Сжатая картинка с высоким приоритетом, размеры картинок, defer, лёгкий скрипт, чат после касания и шрифт со swap приводят все три показателя в зелёную зону.</p>
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
