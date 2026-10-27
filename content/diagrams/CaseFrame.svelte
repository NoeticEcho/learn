<!--
	«Рамка кейса» (part 12, lesson 9). Two parts. First, a before/after slider over invented numbers
	for a repair case. Second, a text box with a sample case that contains details which would
	identify a client (a phone, an e-mail, a cadastral number, a case number, an address); the
	detector marks them and suggests a generalisation. It cannot find names or unusual combinations,
	and the lesson says so. All data here are invented and use zeros.
-->
<script lang="ts">
	import './shared.css';

	let pos = $state(0);
	const rows = [
		{ what: 'Срок решения вопроса', before: 180, after: 14, unit: 'дн.' },
		{ what: 'Поездок в учреждения', before: 6, after: 1, unit: '' }
	];
	const val = (r: (typeof rows)[number]) => Math.round(r.before + ((r.after - r.before) * pos) / 100);
	const pct = (r: (typeof rows)[number]) => Math.max(4, (val(r) / r.before) * 100);

	let text = $state(
		'Клиент Иван Петров, тел. +7 000 000-00-00, почта ivan@example.ru, участок 00:00:000000:00 по адресу ул. Береговая, д. 0, обратился в связи с делом № А00-0000/2025. Мы сделали замер и подготовили план.'
	);
	const rules: { re: RegExp; label: string; fix: string }[] = [
		{ re: /\+?\d[\d\s()-]{8,}\d/g, label: 'телефон', fix: 'убрать' },
		{ re: /[\w.+-]+@[\w-]+\.[\w.]+/g, label: 'почта', fix: 'убрать' },
		{ re: /\d{2}:\d{2}:\d{6,7}:\d+/g, label: 'кадастровый номер', fix: 'заменить на «участок в пригороде»' },
		{ re: /дел\S{0,3}\s*№\s*[\wА-Яа-я\-/]+/giu, label: 'номер дела', fix: 'убрать, оставить «в суде»' },
		{ re: /(ул\.|улица|пр-т|проспект|пер\.)\s*[А-ЯЁа-яё]+,?\s*(д\.\s*)?\d*/gu, label: 'адрес', fix: 'заменить на «в городе N»' }
	];
	const found = $derived(
		rules.flatMap((r) => [...text.matchAll(r.re)].map((m) => ({ label: r.label, hit: m[0].trim(), fix: r.fix })))
	);
</script>

<figure class="dg">
	<figcaption>До и после, и чего в кейсе нельзя</figcaption>

	<div class="dh">До и после</div>
	<label class="dg-ctl">
		От «до» к «после»
		<input type="range" min="0" max="100" step="1" bind:value={pos} />
	</label>
	{#each rows as r (r.what)}
		<div class="row">
			<span>{r.what}: <strong>{val(r)} {r.unit}</strong></span>
			<div class="bar" role="img" aria-label="{r.what}: {val(r)} {r.unit}"><span style="width: {pct(r)}%"></span></div>
		</div>
	{/each}
	<p class="dg-out">Числа придуманы. В настоящем кейсе называйте только то, что измерили, а если не измеряли, скажите об этом.</p>

	<div class="dh">Что нельзя оставлять</div>
	<label class="area">Текст кейса (можно заменить своим)
		<textarea rows="4" bind:value={text}></textarea>
	</label>
	{#if found.length}
		<ul class="dg-out" aria-live="polite">
			{#each found as f, i (i)}<li><strong>{f.label}:</strong> <span class="dg-mono">{f.hit}</span> → {f.fix}</li>{/each}
		</ul>
	{:else}
		<p class="dg-out" aria-live="polite">Явных идентификаторов не найдено. Это не значит, что их нет: имена и редкие сочетания деталей программа не видит.</p>
	{/if}
	<p class="dg-out">Если по набору деталей (профессия, редкое место, дата, редкая ситуация) человека можно узнать, кейс тоже нужно обобщить или получить согласие.</p>
</figure>

<style>
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.row {
		margin: var(--space-2) 0;
	}
	.bar {
		height: 0.9rem;
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--accent-measure);
	}
	.area {
		display: grid;
		gap: var(--space-2);
	}
	textarea {
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
		font: inherit;
		max-width: var(--measure);
	}
</style>
