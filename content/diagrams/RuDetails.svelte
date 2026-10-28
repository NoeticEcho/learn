<!--
	«Русский язык в интерфейсе» (part 4, lesson 10). Three things a design system for a Russian
	audience has to get right, all computed live by the browser's own Intl: the form of a noun
	after a number (three forms, not two), the way a price and a date are written, and a label
	that is longer than the English one and breaks a fixed-width button.
-->
<script lang="ts">
	import './shared.css';
	import { getLocale } from '#lib/i18n/index.ts';

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

	// The English edition (docs/content-plan/README.md, «English edition») shows the same three things
	// from an English speaker's side: Russian is the worked example of what other languages do.
	// Everything is again computed by the browser's own Intl.
	const en = getLocale() === 'en';
	const langs = [
		{ tag: 'en-GB', name: 'English' },
		{ tag: 'ru-RU', name: 'Russian' },
		{ tag: 'ar', name: 'Arabic' }
	];
	const pluralWord: Record<string, Record<string, string>> = {
		'en-GB': { one: 'service', other: 'services' },
		'ru-RU': { one: 'услуга', few: 'услуги', many: 'услуг', other: 'услуги' },
		ar: {}
	};
	const catEn: Record<string, string> = { zero: 'zero', one: 'one', two: 'two', few: 'few', many: 'many', other: 'other' };
	const forLang = (tag: string) => {
		const r = new Intl.PluralRules(tag);
		return { cats: r.resolvedOptions().pluralCategories.map((c) => catEn[c]).join(', '), cat: catEn[r.select(n)], word: pluralWord[tag][r.select(n)] };
	};
	const places = ['en-GB', 'ru-RU', 'de-DE'] as const;
	const moneyFor = (tag: string) => {
		const cur = tag === 'ru-RU' ? 'RUB' : tag === 'de-DE' ? 'EUR' : 'GBP';
		return new Intl.NumberFormat(tag, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(price);
	};
	const dateFor = (tag: string) => ({ long: new Intl.DateTimeFormat(tag, { dateStyle: 'long' }).format(date), short: new Intl.DateTimeFormat(tag).format(date) });
	const labels = ['Book a call', 'Beratungstermin vereinbaren', 'Записаться на консультацию'];
</script>

{#if en}
<figure class="dg">
	<figcaption>Three things that break when an interface meets another language</figcaption>

	<div class="dh">1. The word after a number: English has two forms, other languages more</div>
	<label class="dg-ctl">
		Number: {n}
		<input type="range" min="0" max="30" step="1" bind:value={n} />
	</label>
	<ul class="langs">
		{#each langs as l (l.tag)}
			{@const f = forLang(l.tag)}
			<li>
				<strong>{l.name}:</strong>
				{#if f.word}<span class="out"><strong>{n} {f.word}</strong></span>{/if}
				<span class="small">(category “{f.cat}”; all the forms this language has: {f.cats})</span>
			</li>
		{/each}
	</ul>

	<div class="dh">2. A price and a date</div>
	<label class="dg-ctl">
		Price: {price}
		<input type="range" min="0" max="250000" step="500" bind:value={price} />
	</label>
	<ul class="langs">
		{#each places as tag (tag)}
			<li><strong>{tag}:</strong> <span class="out"><strong>{moneyFor(tag)}</strong></span> <span class="small">· spaces inside a number are non-breaking, shown here as “␣”: {showNbsp(moneyFor(tag))}</span></li>
		{/each}
	</ul>
	<ul class="langs">
		{#each places as tag (tag)}
			<li><strong>{tag}:</strong> <span class="out"><strong>{dateFor(tag).long}</strong></span> <span class="small">· short: {dateFor(tag).short}</span></li>
		{/each}
	</ul>

	<div class="dh">3. A label longer than the English one</div>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={fixed} /> The button is rigidly 9rem wide</label>
	</div>
	<div class="btns">
		{#each labels as t (t)}<span class="btn" class:fixed>{t}</span>{/each}
	</div>
	<p class="dg-out">
		English labels are often the shortest. A button whose width is set by a number breaks in German or Russian: the text sticks out or wraps onto three lines. Set a minimum width and padding instead, and let the button grow with its label.
	</p>
</figure>
{:else}
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
{/if}

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
	.langs {
		list-style: none;
		margin: var(--space-2) 0 !important;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
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
