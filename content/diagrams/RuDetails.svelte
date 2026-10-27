<!--
	«Русский язык в интерфейсе» (part 4, lesson 10). Three things a design system for a Russian
	audience has to get right, all computed live by the browser's own Intl: the form of a noun
	after a number (three forms, not two), the way a price and a date are written, and a label
	that is longer than the English one and breaks a fixed-width button.
-->
<script lang="ts">
	import './shared.css';

	let n = $state(5);
	const rules = new Intl.PluralRules('ru');
	const cat = $derived(rules.select(n));
	const forms: Record<string, string> = { one: 'услуга', few: 'услуги', many: 'услуг', other: 'услуги' };
	const catRu: Record<string, string> = { one: 'один', few: 'несколько', many: 'много', other: 'прочее (дробные)' };

	let price = $state(12500);
	const money = $derived(new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price));
	const showNbsp = (s: string) => s.replace(/[  ]/g, '␣');
	const date = new Date(2026, 9, 27);
	const dateLong = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(date);
	const dateShort = new Intl.DateTimeFormat('ru-RU').format(date);

	let fixed = $state(true);
</script>

<figure class="dg">
	<figcaption>Три мелочи, на которых ломаются «английские» компоненты</figcaption>

	<div class="dh">1. Слово после числа: три формы, а не две</div>
	<label class="dg-ctl">
		Число: {n}
		<input type="range" min="0" max="30" step="1" bind:value={n} />
	</label>
	<p class="out"><strong>{n} {forms[cat]}</strong> <span class="small">(категория Intl.PluralRules: «{catRu[cat]}»)</span></p>

	<div class="dh">2. Цена и дата</div>
	<label class="dg-ctl">
		Цена: {price}
		<input type="range" min="0" max="250000" step="500" bind:value={price} />
	</label>
	<p class="out"><strong>{money}</strong> <span class="small">· пробелы внутри числа неразрывные, на схеме показаны как «␣»: {showNbsp(money)}</span></p>
	<p class="out"><strong>{dateLong}</strong> <span class="small">· коротко: {dateShort}</span></p>

	<div class="dh">3. Подпись длиннее английской</div>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={fixed} /> Кнопка жёстко шириной 9rem</label>
	</div>
	<div class="btns">
		<span class="btn" class:fixed>Book a call</span>
		<span class="btn" class:fixed>Записаться на консультацию</span>
	</div>
	<p class="dg-out">
		Русские подписи обычно заметно длиннее английских. Кнопка, ширина которой задана числом, ломается: русский текст вылезает или переносится на три
		строки. Задавайте не ширину, а минимальную ширину и внутренние отступы, и пусть кнопка растёт по подписи.
	</p>
</figure>

<style>
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.out {
		margin: var(--space-2) 0;
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.small {
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
		font-weight: normal;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin: var(--space-3) 0;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0 1.2rem;
		background: #0b5cad;
		color: #fff;
		border-radius: 6px;
		font-weight: 600;
		font-family: system-ui, sans-serif;
	}
	.btn.fixed {
		width: 9rem;
		min-height: 2.75rem;
		padding: 0.3rem 0.5rem;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
