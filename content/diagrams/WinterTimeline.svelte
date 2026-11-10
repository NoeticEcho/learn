<!--
	«Две зимы» (course ai, lesson symbols/winters). A timeline from 1955 to 1995 with the two
	stretches historians usually call AI winters shaded, and the events the lesson names on it.
	The person picks an event and reads what happened and what it led to. The edges of the
	winters are drawn as the usual approximation, and the text says so: historians draw them
	differently. Every event's words are in the text under the drawing.

	Bilingual: its words are in `W`, one entry per edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Ev = { year: number; label: string; text: string };
	const W = pick({
		ru: {
			caption: 'Две зимы',
			group: 'Какое событие показать',
			chart: 'Шкала времени с 1955 по 1995 год. Затенены первая зима, примерно 1974–1980, и вторая, с 1987 года',
			first: 'первая зима',
			second: 'вторая зима',
			note: 'Края зим приблизительны: историки проводят их по-разному.',
			events: [
				{ year: 1956, label: 'Дартмут', text: 'Летний семинар: у области появляется имя и обещание заметно продвинуться за одно лето.' },
				{ year: 1966, label: 'ALPAC', text: 'Доклад комитета ALPAC: машинный перевод далёк от обещанного. Финансирование перевода в США сокращают.' },
				{ year: 1969, label: 'Мэнсфилд', text: 'Поправка Мэнсфилда: военные деньги только на работы с прямой и очевидной военной пользой.' },
				{ year: 1972, label: 'Лайтхилл', text: 'Доклад Лайтхилла датирован июлем 1972 года, опубликован в 1973-м. В Британии перестраивают финансирование ИИ.' },
				{ year: 1976, label: 'речь', text: 'Пятилетняя программа DARPA по пониманию речи заканчивается без продолжения.' },
				{ year: 1980, label: 'XCON', text: 'XCON в регулярной работе в DEC: экспертные системы начинают приносить деньги.' },
				{ year: 1982, label: 'Япония', text: 'Япония начинает проект компьютеров пятого поколения.' },
				{ year: 1983, label: 'DARPA', text: 'DARPA объявляет программу Strategic Computing и обещает на неё миллиард долларов за десять лет.' },
				{ year: 1984, label: 'AAAI', text: 'На конференции AAAI исследователи предупреждают, что за бумом последует спад.' },
				{ year: 1987, label: 'лисп-машины', text: 'Рынок лисп-машин рушится: обычные рабочие станции дешевле и не хуже.' },
				{ year: 1992, label: 'конец проекта', text: 'Японский проект пятого поколения закончен, его главные цели не достигнуты.' },
				{ year: 1993, label: 'Symbolics', text: 'Symbolics, главный производитель лисп-машин, просит защиты от кредиторов.' }
			] as Ev[]
		},
		en: {
			caption: 'Two winters',
			group: 'Which event to show',
			chart: 'A timeline from 1955 to 1995. Shaded: the first winter, about 1974 to 1980, and the second, from 1987',
			first: 'first winter',
			second: 'second winter',
			note: 'The edges of the winters are approximate: historians draw them differently.',
			events: [
				{ year: 1956, label: 'Dartmouth', text: 'The summer workshop: the field gets a name, and a promise of real progress in one summer.' },
				{ year: 1966, label: 'ALPAC', text: 'The ALPAC committee reports that machine translation is far from what was promised. US funding for translation is cut.' },
				{ year: 1969, label: 'Mansfield', text: 'The Mansfield Amendment: military money only for work with a direct and apparent military use.' },
				{ year: 1972, label: 'Lighthill', text: 'The Lighthill report is dated July 1972 and published in 1973. Britain reorganizes its funding for AI.' },
				{ year: 1976, label: 'speech', text: 'DARPA’s five-year speech understanding program ends with no follow-on.' },
				{ year: 1980, label: 'XCON', text: 'XCON in regular use at DEC: expert systems start to make money.' },
				{ year: 1982, label: 'Japan', text: 'Japan starts its Fifth Generation Computer Systems project.' },
				{ year: 1983, label: 'DARPA', text: 'DARPA announces Strategic Computing and commits a billion dollars over ten years.' },
				{ year: 1984, label: 'AAAI', text: 'At the AAAI conference, researchers warn that the boom will be followed by a bust.' },
				{ year: 1987, label: 'Lisp machines', text: 'The Lisp machine market collapses: ordinary workstations are cheaper and just as good.' },
				{ year: 1992, label: 'project ends', text: 'Japan’s Fifth Generation project ends without reaching its main goals.' },
				{ year: 1993, label: 'Symbolics', text: 'Symbolics, the main maker of Lisp machines, files for bankruptcy protection.' }
			] as Ev[]
		}
	});
	let picked = $state(3);
	const X0 = 1955,
		X1 = 1995,
		L = 20,
		R = 460;
	const x = (y: number) => L + ((R - L) * (y - X0)) / (X1 - X0);
	const ev = $derived(W.events[picked]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each W.events as e, i (i)}
			<button type="button" aria-pressed={picked === i} onclick={() => (picked = i)}>{e.year} {e.label}</button>
		{/each}
	</div>
	<svg viewBox="0 0 480 110" role="img" aria-label={W.chart} width="100%">
		<rect x={x(1974)} y="10" width={x(1980) - x(1974)} height="60" fill="var(--text-secondary)" opacity="0.18" />
		<text x={(x(1974) + x(1980)) / 2} y="26" text-anchor="middle" font-size="13" fill="var(--text-secondary)">{W.first}</text>
		<rect x={x(1987)} y="10" width={x(1995) - x(1987)} height="60" fill="var(--text-secondary)" opacity="0.18" />
		<text x={(x(1987) + x(1995)) / 2} y="26" text-anchor="middle" font-size="13" fill="var(--text-secondary)">{W.second}</text>
		<line x1={L} y1="70" x2={R} y2="70" stroke="var(--border-rule)" stroke-width="2" />
		{#each [1960, 1970, 1980, 1990] as y (y)}
			<text x={x(y)} y="92" text-anchor="middle" font-size="13" fill="var(--text-secondary)">{y}</text>
		{/each}
		{#each W.events as e, i (i)}
			<circle cx={x(e.year)} cy="70" r={picked === i ? 7 : 4} fill={picked === i ? 'var(--accent-measure)' : 'var(--text-secondary)'} />
		{/each}
	</svg>
	<p class="dg-out" aria-live="polite"><strong>{ev.year}.</strong> {ev.text} {W.note}</p>
</figure>

<style>
	svg {
		display: block;
		max-width: 34rem;
	}
</style>
