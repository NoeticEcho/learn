<!--
	«Три станка» (part 12, lesson 5). One set of facts about an invented café is typed in once and
	comes out as an ABT sentence, a six-line Pixar spine and four kishōtenketsu paragraphs. The
	reader can overwrite every fact with their own. The forms are paraphrased, not quoted.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	type F = { who: string; every: string; trouble: string; because: string; finally: string; since: string; twist: string };
	type Use = 'abt' | 'spine' | 'kisho';

	const W = pick({
		ru: {
			facts: {
				who: 'Кофейня «Пристань»',
				every: 'каждый день пекла хлеб и варила кофе для соседей',
				trouble: 'пекарня стала тесной',
				because: 'переехала в подвал побольше',
				finally: 'в подвале запахло хлебом на всю набережную',
				since: 'люди приходят за хлебом, а остаются на кофе',
				twist: 'в подвале нашли старую печь тридцатых годов, и хлеб теперь печётся в ней'
			} as F,
			fields: [
				['who', 'Кто'],
				['every', 'Что делает каждый день'],
				['trouble', 'Что мешает'],
				['because', 'Что из этого последовало'],
				['finally', 'Чем кончилось'],
				['since', 'Что с тех пор'],
				['twist', 'Неожиданный факт (для кисётэнкэцу)']
			] as [keyof F, string][],
			spine: (f: F) => [
				`Жила-была ${f.who}.`,
				`Каждый день она ${f.every}.`,
				`Но однажды ${f.trouble}.`,
				`Из-за этого она ${f.because}.`,
				`Пока наконец ${f.finally}.`,
				`С тех пор ${f.since}.`
			],
			abt: (f: F) => `${f.who} ${f.every}, но ${f.trouble}, поэтому ${f.because}.`,
			kisho: (f: F) => [
				['Ки (знакомство)', `${f.who}: ${f.every}.`],
				['Сё (развитие)', `С тех пор ${f.since}.`],
				['Тэн (поворот)', `И вот что ещё: ${f.twist}.`],
				['Кэцу (примирение)', `Так всё и сошлось: ${f.finally}.`]
			],
			when: {
				abt: 'Одно предложение: подзаголовок под названием, описание для поиска, строка в письме. Нужна ясная беда и ясный выход.',
				spine: 'Короткий рассказ из шести строк: «О нас», пост, начало кейса. Нужен человек и цепочка событий.',
				kisho: 'Спокойная история без борьбы: ремесло, место, традиция, неожиданный взгляд. Конфликт не нужен, нужен поворот, меняющий смысл.'
			} as Record<Use, string>,
			caption: 'Одни факты, три формы',
			summary: 'Факты (можно заменить своими)',
			group: 'Форма',
			spineBtn: 'Хребет Pixar',
			kishoBtn: 'Кисётэнкэцу',
			whenLabel: 'Когда уместна:'
		},
		en: {
			facts: {
				who: 'The Quay café',
				every: 'baked bread and brewed coffee for the neighbors',
				trouble: 'the bakery got cramped',
				because: 'moved into a bigger basement',
				finally: 'the whole waterfront smelled of bread',
				since: 'people come for the bread and stay for the coffee',
				twist: 'an old oven from the 1930s was found in the basement, and the bread is baked in it now'
			} as F,
			fields: [
				['who', 'Who'],
				['every', 'What they do every day (past tense)'],
				['trouble', 'What gets in the way'],
				['because', 'What followed from that (past tense)'],
				['finally', 'How it ended'],
				['since', 'What has been true since'],
				['twist', 'A surprising fact (for kishōtenketsu)']
			] as [keyof F, string][],
			spine: (f: F) => [
				`Once upon a time there was ${f.who}.`,
				`Every day it ${f.every}.`,
				`One day ${f.trouble}.`,
				`Because of that, it ${f.because}.`,
				`Until finally ${f.finally}.`,
				`Ever since then, ${f.since}.`
			],
			abt: (f: F) => `${f.who} ${f.every}, but ${f.trouble}, so it ${f.because}.`,
			kisho: (f: F) => [
				['Ki (introduction)', `${f.who} ${f.every}.`],
				['Shō (development)', `Ever since then, ${f.since}.`],
				['Ten (twist)', `And here is something more: ${f.twist}.`],
				['Ketsu (reconciliation)', `So it all came together: ${f.finally}.`]
			],
			when: {
				abt: 'One sentence: a subtitle under the name, a search description, a line in an email. It needs a clear trouble and a clear way out.',
				spine: 'A short story in six lines: “About”, a post, the start of a case study. It needs a person and a chain of events.',
				kisho: 'A calm story with no fight: a craft, a place, a tradition, a surprising view. It needs no conflict, but a twist that changes the meaning.'
			} as Record<Use, string>,
			caption: 'The same facts, three shapes',
			summary: 'Facts (replace them with your own)',
			group: 'Shape',
			spineBtn: 'Pixar spine',
			kishoBtn: 'Kishōtenketsu',
			whenLabel: 'When it fits:'
		}
	});

	let f = $state<F>({ ...W.facts });
	const fields = W.fields;
	const spine = $derived(W.spine(f));
	const abt = $derived(W.abt(f));
	const kisho = $derived(W.kisho(f));

	let use = $state<Use>('abt');
	const when = W.when;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<details class="facts" open>
		<summary>{W.summary}</summary>
		{#each fields as [k, label] (k)}
			<label class="row">{label}<input type="text" bind:value={f[k]} /></label>
		{/each}
	</details>

	<div class="dg-ctl" role="group" aria-label={W.group}>
		<button type="button" aria-pressed={use === 'abt'} onclick={() => (use = 'abt')}>ABT</button>
		<button type="button" aria-pressed={use === 'spine'} onclick={() => (use = 'spine')}>{W.spineBtn}</button>
		<button type="button" aria-pressed={use === 'kisho'} onclick={() => (use = 'kisho')}>{W.kishoBtn}</button>
	</div>

	<div class="dg-box out" aria-live="polite">
		{#if use === 'abt'}
			<p>{abt}</p>
		{:else if use === 'spine'}
			<ol>
				{#each spine as l (l)}<li>{l}</li>{/each}
			</ol>
		{:else}
			{#each kisho as [h, t] (h)}<p><strong>{h}.</strong> {t}</p>{/each}
		{/if}
	</div>
	<p class="dg-out"><strong>{W.whenLabel}</strong> {when[use]}</p>
</figure>

<style>
	.facts {
		margin-bottom: var(--space-4);
	}
	.facts summary {
		cursor: pointer;
		min-height: var(--hit-min);
	}
	.row {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
	}
	.row input {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
		font: inherit;
	}
	.out p {
		margin: 0 0 var(--space-2);
		max-width: var(--measure);
	}
</style>
