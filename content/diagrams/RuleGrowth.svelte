<!--
	«Сколько правил» (course ai, lesson symbols/expert-systems). The documented rule counts of MYCIN
	and XCON, each with the year and the source it comes from, so a figure is never shown without
	where it was said. The person picks a bar to read its source. A bar chart of five figures; the
	same figures are in the text under it.

	Bilingual: its words are in `W`, one entry per edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Row = { system: 'MYCIN' | 'XCON'; year: string; rules: number; exact?: boolean; source: { ru: string; en: string } };
	const ROWS: Row[] = [
		{ system: 'MYCIN', year: '1975', rules: 200, source: { ru: 'описание MYCIN 1975 года, перепечатанное в книге Buchanan и Shortliffe 1984 года, глава 5', en: 'the 1975 description of MYCIN, reprinted in Buchanan and Shortliffe’s 1984 book, chapter 5' } },
		{ system: 'MYCIN', year: '1984', rules: 450, source: { ru: 'книга Buchanan и Shortliffe 1984 года, глава 36', en: 'Buchanan and Shortliffe’s 1984 book, chapter 36' } },
		{ system: 'XCON', year: '1979', rules: 750, source: { ru: 'слова Макдермотта о сентябре 1979 года, по обзору Expert Systems Strategies 1987 года', en: 'McDermott on September 1979, quoted in Expert Systems Strategies, 1987' } },
		{ system: 'XCON', year: '1987', rules: 6200, source: { ru: 'обзор Expert Systems Strategies 1987 года', en: 'Expert Systems Strategies, 1987' } },
		{ system: 'XCON', year: '1989', rules: 10129, exact: true, source: { ru: 'статья сотрудников DEC 1989 года (Barker и соавторы), по статье Википедии о XCON', en: 'a 1989 paper by DEC staff (Barker et al.), as cited in Wikipedia’s article on XCON' } }
	];
	let picked = $state(4);

	const W = pick({
		ru: {
			caption: 'Сколько правил',
			group: 'Чью цифру показать',
			chart: 'Столбики: число правил MYCIN в 1975 и 1984 годах и XCON в 1979, 1987 и 1989 годах',
			num: (n: number) => n.toLocaleString('ru-RU'),
			out: (r: Row, n: string, src: string) => `${r.system}, ${r.year}: ${r.exact ? '' : 'около '}${n} правил. Источник: ${src}. Каждое правило кто-то записал со слов эксперта и кто-то должен был обновлять.`
		},
		en: {
			caption: 'How many rules',
			group: 'Whose figure to show',
			chart: 'Bars: the number of rules in MYCIN in 1975 and 1984, and in XCON in 1979, 1987 and 1989',
			num: (n: number) => n.toLocaleString('en-US'),
			out: (r: Row, n: string, src: string) => `${r.system}, ${r.year}: ${r.exact ? '' : 'about '}${n} rules. Source: ${src}. Someone wrote every rule down from an expert’s words, and someone had to keep it up to date.`
		}
	});
	const lang = pick({ ru: 'ru' as const, en: 'en' as const });
	const MAX = 10129;
	const L = 120;
	const bar = (n: number) => Math.max(3, ((480 - L - 70) * n) / MAX);
	const row = $derived(ROWS[picked]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each ROWS as r, i (i)}
			<button type="button" aria-pressed={picked === i} onclick={() => (picked = i)}>{r.system} {r.year}</button>
		{/each}
	</div>
	<svg viewBox="0 0 480 {ROWS.length * 34 + 8}" role="img" aria-label={W.chart} width="100%">
		{#each ROWS as r, i (i)}
			<text x="0" y={i * 34 + 26} font-size="15" fill="var(--text-primary)">{r.system} {r.year}</text>
			<rect x={L} y={i * 34 + 10} width={bar(r.rules)} height="22" fill={picked === i ? 'var(--accent-measure)' : 'var(--text-secondary)'} />
			<text x={L + bar(r.rules) + 6} y={i * 34 + 26} font-size="14" fill="var(--text-secondary)">{W.num(r.rules)}</text>
		{/each}
	</svg>
	<p class="dg-out" aria-live="polite">{W.out(row, W.num(row.rules), row.source[lang])}</p>
</figure>

<style>
	svg {
		display: block;
		max-width: 34rem;
	}
</style>
