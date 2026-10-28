<!--
	«Рамка кейса» (part 12, lesson 9). Two parts. First, a before/after slider over invented numbers
	for a repair case. Second, a text box with a sample case that contains details which would
	identify a client (a phone, an e-mail, a cadastral number, a case number, an address); the
	detector marks them and suggests a generalisation. It cannot find names or unusual combinations,
	and the lesson says so. All data here are invented and use zeros.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	type Rule = { re: RegExp; label: string; fix: string };
	const W = pick({
		ru: {
			rows: [
				{ what: 'Срок решения вопроса', before: 180, after: 14, unit: 'дн.' },
				{ what: 'Поездок в учреждения', before: 6, after: 1, unit: '' }
			],
			text: 'Клиент Иван Петров, тел. +7 000 000-00-00, почта ivan@example.ru, участок 00:00:000000:00 по адресу ул. Береговая, д. 0, обратился в связи с делом № А00-0000/2025. Мы сделали замер и подготовили план.',
			rules: [
				{ re: /\+?\d[\d\s()-]{8,}\d/g, label: 'телефон', fix: 'убрать' },
				{ re: /[\w.+-]+@[\w-]+\.[\w.]+/g, label: 'почта', fix: 'убрать' },
				{ re: /\d{2}:\d{2}:\d{6,7}:\d+/g, label: 'кадастровый номер', fix: 'заменить на «участок в пригороде»' },
				{ re: /дел\S{0,3}\s*№\s*[\wА-Яа-я\-/]+/giu, label: 'номер дела', fix: 'убрать, оставить «в суде»' },
				{ re: /(ул\.|улица|пр-т|проспект|пер\.)\s*[А-ЯЁа-яё]+,?\s*(д\.\s*)?\d*/gu, label: 'адрес', fix: 'заменить на «в городе N»' }
			] as Rule[],
			caption: 'До и после, и чего в кейсе нельзя',
			beforeAfter: 'До и после',
			slider: 'От «до» к «после»',
			numbersNote: 'Числа придуманы. В настоящем кейсе называйте только то, что измерили, а если не измеряли, скажите об этом.',
			cant: 'Что нельзя оставлять',
			area: 'Текст кейса (можно заменить своим)',
			none: 'Явных идентификаторов не найдено. Это не значит, что их нет: имена и редкие сочетания деталей программа не видит.',
			combo: 'Если по набору деталей (профессия, редкое место, дата, редкая ситуация) человека можно узнать, кейс тоже нужно обобщить или получить согласие.'
		},
		en: {
			rows: [
				{ what: 'Time to settle the matter', before: 180, after: 14, unit: 'days' },
				{ what: 'Trips to offices', before: 6, after: 1, unit: '' }
			],
			text: 'The client John Smith, tel. +1 000 000 0000, email john@example.com, parcel APN 000-000-000, at 0 Shore Road, came to us about case No. 00-CV-0000. We surveyed the boundary and prepared a plan.',
			rules: [
				{ re: /\+?\d[\d\s()-]{8,}\d/g, label: 'phone', fix: 'remove' },
				{ re: /[\w.+-]+@[\w-]+\.[\w.]+/g, label: 'email', fix: 'remove' },
				{ re: /\b(?:APN|[Pp]arcel)\b[\s:#.A-Za-z]*?\d[\d-]{5,}/g, label: 'parcel number', fix: 'replace with “a lot in the suburbs”' },
				{ re: /\b[Cc]ase\s*(?:No\.?|#|number)\s*[\w\-/.]*\d[\w\-/.]*/g, label: 'case number', fix: 'remove, keep “in court”' },
				{ re: /\b\d+\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s+(?:Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Lane|Ln\.?|Drive|Dr\.?|Way|Court|Ct\.?)\b/g, label: 'address', fix: 'replace with “in town N”' }
			] as Rule[],
			caption: 'Before and after, and what a case study must not carry',
			beforeAfter: 'Before and after',
			slider: 'From “before” to “after”',
			numbersNote: 'The numbers are invented. In a real case study name only what you measured, and if you didn’t measure, say so.',
			cant: 'What must not stay',
			area: 'Case study text (you can replace it with your own)',
			none: 'No obvious identifiers found. That doesn’t mean there are none: the program can’t see names or rare combinations of details.',
			combo: 'If a set of details (a profession, a rare place, a date, an unusual situation) lets someone recognize the person, the case study still has to be generalized, or consent obtained.'
		}
	});

	let pos = $state(0);
	const rows = W.rows;
	const val = (r: (typeof rows)[number]) => Math.round(r.before + ((r.after - r.before) * pos) / 100);
	const pct = (r: (typeof rows)[number]) => Math.max(4, (val(r) / r.before) * 100);

	let text = $state(W.text);
	const rules = W.rules;
	const found = $derived(
		rules.flatMap((r) => [...text.matchAll(r.re)].map((m) => ({ label: r.label, hit: m[0].trim(), fix: r.fix })))
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>

	<div class="dh">{W.beforeAfter}</div>
	<label class="dg-ctl">
		{W.slider}
		<input type="range" min="0" max="100" step="1" bind:value={pos} />
	</label>
	{#each rows as r (r.what)}
		<div class="row">
			<span>{r.what}: <strong>{val(r)} {r.unit}</strong></span>
			<div class="bar" role="img" aria-label="{r.what}: {val(r)} {r.unit}"><span style="width: {pct(r)}%"></span></div>
		</div>
	{/each}
	<p class="dg-out">{W.numbersNote}</p>

	<div class="dh">{W.cant}</div>
	<label class="area">{W.area}
		<textarea rows="4" bind:value={text}></textarea>
	</label>
	{#if found.length}
		<ul class="dg-out" aria-live="polite">
			{#each found as f, i (i)}<li><strong>{f.label}:</strong> <span class="dg-mono">{f.hit}</span> → {f.fix}</li>{/each}
		</ul>
	{:else}
		<p class="dg-out" aria-live="polite">{W.none}</p>
	{/if}
	<p class="dg-out">{W.combo}</p>
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
