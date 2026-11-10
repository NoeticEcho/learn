<!--
	«Стол с кубиками» (course ai, lesson symbols/blocks-world). Not SHRDLU, and none of its
	dialogue: a handful of ready requests to a table of blocks, to show the principle. Inside the
	world every word maps to something the program knows, and it can say what it did and why;
	one step outside, it has no word at all. The person picks a request; the table and the answer
	change. The answer is text under the drawing, so nothing lives only in the picture.

	Bilingual: its words are in `W`, one entry per edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Ask = 'stack' | 'onBlue' | 'why' | 'pyramid' | 'weight' | 'buy';
	let stacked = $state(false);
	let last = $state<Ask | null>(null);
	let answer = $state('');

	const W = pick({
		ru: {
			caption: 'Стол с кубиками',
			group: 'Что сказать столу',
			reset: 'Начать заново',
			chart: (s: boolean) => `Стол: синий кубик, ${s ? 'на нём красный кубик' : 'рядом красный кубик'}, зелёная и жёлтая пирамиды, коробка`,
			asks: {
				stack: 'Поставь красный кубик на синий',
				onBlue: 'Что лежит на синем кубике?',
				why: 'Зачем ты взял красный кубик?',
				pyramid: 'Возьми пирамиду',
				weight: 'Сколько весит красный кубик?',
				buy: 'Купи ещё кубиков'
			} as Record<Ask, string>,
			say: {
				stack: (s: boolean) => (s ? 'Он уже там.' : 'Хорошо. Красный кубик стоит на синем.'),
				onBlue: (s: boolean) => (s ? 'Красный кубик.' : 'Ничего.'),
				why: (s: boolean) => (s ? 'Чтобы поставить его на синий, как вы просили.' : 'Я его не брал.'),
				pyramid: (): string => 'Пирамид две, зелёная и жёлтая. Какую?',
				weight: (): string => 'Я не знаю слова «весит».',
				buy: (): string => 'Я не знаю слова «купи».'
			},
			inside: 'Внутри мира: программа знает каждый предмет и помнит, что делала.',
			outside: 'За краем мира: веса и магазинов в нём нет, и слов для них тоже.',
			start: 'Выберите просьбу.',
			q: (t: string) => `«${t}»`
		},
		en: {
			caption: 'A table of blocks',
			group: 'What to say to the table',
			reset: 'Start again',
			chart: (s: boolean) => `The table: a blue block, ${s ? 'with a red block on it' : 'a red block beside it'}, a green and a yellow pyramid, a box`,
			asks: {
				stack: 'Put the red block on the blue one',
				onBlue: 'What is on the blue block?',
				why: 'Why did you pick up the red block?',
				pyramid: 'Pick up the pyramid',
				weight: 'How much does the red block weigh?',
				buy: 'Buy some more blocks'
			} as Record<Ask, string>,
			say: {
				stack: (s: boolean) => (s ? 'It is already there.' : 'OK. The red block is on the blue one.'),
				onBlue: (s: boolean) => (s ? 'The red block.' : 'Nothing.'),
				why: (s: boolean) => (s ? 'To put it on the blue one, as you asked.' : 'I did not pick it up.'),
				pyramid: (): string => 'There are two, a green one and a yellow one. Which?',
				weight: (): string => 'I don’t know the word “weigh.”',
				buy: (): string => 'I don’t know the word “buy.”'
			},
			inside: 'Inside the world: the program knows every object and remembers what it did.',
			outside: 'Past the edge of the world: it has no weights and no shops, and no words for them.',
			start: 'Pick a request.',
			q: (t: string) => `“${t}”`
		}
	});
	const ASKS: Ask[] = ['stack', 'onBlue', 'why', 'pyramid', 'weight', 'buy'];
	const OUTSIDE = new Set<Ask>(['weight', 'buy']);

	function ask(a: Ask) {
		answer = W.say[a](stacked);
		if (a === 'stack') stacked = true;
		last = a;
	}
	function reset() {
		stacked = false;
		last = null;
		answer = '';
	}
	// the red block: beside the blue one, or on top of it
	const red = $derived(stacked ? { x: 200, y: 50 } : { x: 90, y: 110 });
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each ASKS as a (a)}
			<button type="button" aria-pressed={last === a} onclick={() => ask(a)}>{W.asks[a]}</button>
		{/each}
		<button type="button" onclick={reset}>{W.reset}</button>
	</div>
	<svg viewBox="0 0 480 190" role="img" aria-label={W.chart(stacked)} width="100%">
		<line x1="10" y1="170" x2="470" y2="170" stroke="var(--border-rule)" stroke-width="2" />
		<rect x="200" y="110" width="60" height="60" fill="none" stroke="var(--accent-measure)" stroke-width="2" />
		<text x="230" y="146" text-anchor="middle" font-size="14" fill="var(--text-secondary)">{pick({ ru: 'синий', en: 'blue' })}</text>
		<rect x={red.x} y={red.y} width="60" height="60" fill="var(--accent-measure)" opacity="0.35" stroke="var(--accent-measure)" stroke-width="2" />
		<text x={red.x + 30} y={red.y + 36} text-anchor="middle" font-size="14" fill="var(--text-primary)">{pick({ ru: 'красный', en: 'red' })}</text>
		<polygon points="290,170 320,115 350,170" fill="none" stroke="var(--text-secondary)" stroke-width="2" />
		<polygon points="355,170 380,125 405,170" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-dasharray="4 3" />
		<rect x="415" y="130" width="50" height="40" fill="none" stroke="var(--border-rule)" stroke-width="2" />
	</svg>
	<p class="dg-out" aria-live="polite">
		{#if last}<strong>{W.asks[last]}</strong>: {W.q(answer)} {OUTSIDE.has(last) ? W.outside : W.inside}{:else}{W.start}{/if}
	</p>
</figure>

<style>
	svg {
		display: block;
		max-width: 32rem;
	}
</style>
