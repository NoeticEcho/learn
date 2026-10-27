<!--
	«Три станка» (part 12, lesson 5). One set of facts about an invented café is typed in once and
	comes out as an ABT sentence, a six-line Pixar spine and four kishōtenketsu paragraphs. The
	reader can overwrite every fact with their own. The forms are paraphrased, not quoted.
-->
<script lang="ts">
	import './shared.css';

	let f = $state({
		who: 'Кофейня «Пристань»',
		every: 'каждый день пекла хлеб и варила кофе для соседей',
		trouble: 'пекарня стала тесной',
		because: 'переехала в подвал побольше',
		finally: 'в подвале запахло хлебом на всю набережную',
		since: 'люди приходят за хлебом, а остаются на кофе',
		twist: 'в подвале нашли старую печь тридцатых годов, и хлеб теперь печётся в ней'
	});
	const fields: [keyof typeof f, string][] = [
		['who', 'Кто'],
		['every', 'Что делает каждый день'],
		['trouble', 'Что мешает'],
		['because', 'Что из этого последовало'],
		['finally', 'Чем кончилось'],
		['since', 'Что с тех пор'],
		['twist', 'Неожиданный факт (для кисётэнкэцу)']
	];
	const spine = $derived([
		`Жила-была ${f.who}.`,
		`Каждый день она ${f.every}.`,
		`Но однажды ${f.trouble}.`,
		`Из-за этого она ${f.because}.`,
		`Пока наконец ${f.finally}.`,
		`С тех пор ${f.since}.`
	]);
	const abt = $derived(`${f.who} ${f.every}, но ${f.trouble}, поэтому ${f.because}.`);
	const kisho = $derived([
		['Ки (знакомство)', `${f.who}: ${f.every}.`],
		['Сё (развитие)', `С тех пор ${f.since}.`],
		['Тэн (поворот)', `И вот что ещё: ${f.twist}.`],
		['Кэцу (примирение)', `Так всё и сошлось: ${f.finally}.`]
	]);

	type Use = 'abt' | 'spine' | 'kisho';
	let use = $state<Use>('abt');
	const when: Record<Use, string> = {
		abt: 'Одно предложение: подзаголовок под названием, описание для поиска, строка в письме. Нужна ясная беда и ясный выход.',
		spine: 'Короткий рассказ из шести строк: «О нас», пост, начало кейса. Нужен человек и цепочка событий.',
		kisho: 'Спокойная история без борьбы: ремесло, место, традиция, неожиданный взгляд. Конфликт не нужен, нужен поворот, меняющий смысл.'
	};
</script>

<figure class="dg">
	<figcaption>Одни факты, три формы</figcaption>
	<details class="facts" open>
		<summary>Факты (можно заменить своими)</summary>
		{#each fields as [k, label] (k)}
			<label class="row">{label}<input type="text" bind:value={f[k]} /></label>
		{/each}
	</details>

	<div class="dg-ctl" role="group" aria-label="Форма">
		<button type="button" aria-pressed={use === 'abt'} onclick={() => (use = 'abt')}>ABT</button>
		<button type="button" aria-pressed={use === 'spine'} onclick={() => (use = 'spine')}>Хребет Pixar</button>
		<button type="button" aria-pressed={use === 'kisho'} onclick={() => (use = 'kisho')}>Кисётэнкэцу</button>
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
	<p class="dg-out"><strong>Когда уместна:</strong> {when[use]}</p>
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
