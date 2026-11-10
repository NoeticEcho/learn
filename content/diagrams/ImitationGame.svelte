<!--
	«Игра в имитацию» (course ai, lesson symbols/turing-question). Three set-ups of the same rooms:
	Turing's parlour game (a man, a woman and a judge), the game with a machine in A's place, and
	a conversation with a chatbot today, where the judge has one partner and nothing to compare it
	with. The drawing is a schematic; what each set-up means is said in text under it, so nothing
	lives only in the picture.

	Bilingual: its words are in `W`, one entry per edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Mode = 'game' | 'machine' | 'today';
	let mode = $state<Mode>('machine');

	const W = pick({
		ru: {
			caption: 'Что видит судья',
			group: 'Какую игру показать',
			modes: { game: 'Игра 1950 года', machine: 'Машина вместо A', today: 'Вы и чат-бот' } as Record<Mode, string>,
			judge: 'Судья C',
			you: 'Вы',
			wall: 'стена',
			text: 'только текст',
			a: { game: 'A: мужчина', machine: 'A: машина', today: 'чат-бот' } as Record<Mode, string>,
			b: 'B: человек',
			bGame: 'B: женщина',
			chart: (m: Mode) =>
				m === 'today'
					? 'Схема: вы и один чат-бот, между вами только текст'
					: `Схема: судья в отдельной комнате переписывается с двумя скрытыми собеседниками, ${m === 'game' ? 'мужчиной и женщиной' : 'машиной и человеком'}`,
			out: {
				game: 'Салонная игра, с которой Тьюринг начинает: судья должен понять, кто из двоих женщина. Мужчина путает его, женщина помогает. Ответы напечатаны, так что голос и почерк ничего не выдают.',
				machine:
					'Место мужчины занимает машина. Вопрос Тьюринга: будет ли судья ошибаться так же часто, как с двумя людьми? Судья сравнивает двоих, и решает только по тексту.',
				today:
					'Так вы говорите с чат-ботом: собеседник один, и сравнить его не с кем. Вы тоже судите по тексту, но игра проще, чем у Тьюринга, и складный ответ легко принять за верный.'
			} as Record<Mode, string>
		},
		en: {
			caption: 'What the judge sees',
			group: 'Which game to show',
			modes: { game: 'The 1950 game', machine: 'A machine as A', today: 'You and a chatbot' } as Record<Mode, string>,
			judge: 'Judge C',
			you: 'You',
			wall: 'wall',
			text: 'text only',
			a: { game: 'A: a man', machine: 'A: a machine', today: 'chatbot' } as Record<Mode, string>,
			b: 'B: a person',
			bGame: 'B: a woman',
			chart: (m: Mode) =>
				m === 'today'
					? 'Diagram: you and one chatbot, with only text between you'
					: `Diagram: a judge in a separate room exchanges typed messages with two hidden players, ${m === 'game' ? 'a man and a woman' : 'a machine and a person'}`,
			out: {
				game: 'The parlor game Turing starts from: the judge has to tell which of the two is the woman. The man tries to mislead, the woman to help. The answers are typed, so no voice or handwriting gives anything away.',
				machine:
					'A machine takes the man’s place. Turing’s question: will the judge be wrong as often as with two people? The judge compares two players, and decides from the text alone.',
				today:
					'This is how you talk to a chatbot: one partner and nobody to compare it with. You judge by the text too, but the game is easier than Turing’s, and a fluent answer is easy to take for a right one.'
			} as Record<Mode, string>
		}
	});
	const MODES: Mode[] = ['game', 'machine', 'today'];
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each MODES as m (m)}
			<button type="button" aria-pressed={mode === m} onclick={() => (mode = m)}>{W.modes[m]}</button>
		{/each}
	</div>
	<svg viewBox="0 0 480 220" role="img" aria-label={W.chart(mode)} width="100%">
		<!-- the judge's room -->
		<rect x="16" y="70" width="128" height="80" fill="none" stroke="var(--border-rule)" stroke-width="1.5" />
		<text x="80" y="115" text-anchor="middle" font-size="20" fill="var(--text-primary)">{mode === 'today' ? W.you : W.judge}</text>
		<!-- the wall -->
		<line x1="210" y1="20" x2="210" y2="200" stroke="var(--text-secondary)" stroke-width="3" />
		<text x="210" y="214" text-anchor="middle" font-size="16" fill="var(--text-secondary)">{W.wall}</text>
		{#if mode === 'today'}
			<line x1="144" y1="110" x2="330" y2="110" stroke="var(--accent-measure)" stroke-width="2" stroke-dasharray="6 4" />
			<text x="270" y="98" text-anchor="middle" font-size="16" fill="var(--text-secondary)">{W.text}</text>
			<rect x="330" y="70" width="134" height="80" fill="none" stroke="var(--accent-measure)" stroke-width="1.5" />
			<text x="397" y="115" text-anchor="middle" font-size="20" fill="var(--text-primary)">{W.a.today}</text>
		{:else}
			<line x1="144" y1="100" x2="330" y2="55" stroke="var(--accent-measure)" stroke-width="2" stroke-dasharray="6 4" />
			<line x1="144" y1="120" x2="330" y2="165" stroke="var(--accent-measure)" stroke-width="2" stroke-dasharray="6 4" />
			<text x="270" y="115" text-anchor="middle" font-size="16" fill="var(--text-secondary)">{W.text}</text>
			<rect x="330" y="20" width="134" height="70" fill="none" stroke={mode === 'machine' ? 'var(--accent-measure)' : 'var(--border-rule)'} stroke-width="1.5" />
			<text x="397" y="60" text-anchor="middle" font-size="20" fill="var(--text-primary)">{W.a[mode]}</text>
			<rect x="330" y="130" width="134" height="70" fill="none" stroke="var(--border-rule)" stroke-width="1.5" />
			<text x="397" y="170" text-anchor="middle" font-size="20" fill="var(--text-primary)">{mode === 'game' ? W.bGame : W.b}</text>
		{/if}
	</svg>
	<p class="dg-out" aria-live="polite">{W.out[mode]}</p>
</figure>

<style>
	/* a schematic: on a wide screen it need not fill the measure */
	svg {
		display: block;
		max-width: 32rem;
	}
</style>
