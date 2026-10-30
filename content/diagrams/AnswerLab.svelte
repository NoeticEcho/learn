<!--
	«Чат с ИИ-поиском» (part 13, lesson 7). A toy model of how an AI answer engine might choose
	sources for one question. The reader switches features of their own page on and off (a direct
	first sentence, a list of facts, an author and a date, references to sources, keyword stuffing,
	hidden text, a robots.txt that blocks the search bot) and watches a made-up «ответ» change and a
	«цитируемость» meter move. The weights are the author's teaching choices, built from what the
	GEO paper (Aggarwal et al., 2023) and the search engines' own guidance say qualitatively; no real
	system is known to work like this, and the diagram says so.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			whyBlocked: 'Поисковый бот не может прочитать страницу, поэтому процитировать её нельзя.',
			whyHidden: 'Скрытый текст это спам: страницу не только не процитируют, но и могут понизить.',
			whyIndirect: 'Ответ на вопрос спрятан в тексте: проще взять страницу, где он в первом предложении.',
			question: 'Как узнать, где проходит граница участка?',
			caption: (q: string) => `Вопрос: «${q}»`,
			legend: 'Ваша страница',
			direct: 'первое предложение отвечает на вопрос',
			facts: 'факты вынесены в список или таблицу',
			byline: 'указаны автор и дата обновления',
			sources: 'есть ссылки на закон и документы',
			stuffing: 'текст набит ключевыми словами',
			hidden: 'часть текста скрыта от человека',
			blocked: 'поисковый бот закрыт в robots.txt',
			meter: (n: number) => `Шанс попасть в ответ: ${n} из 100`,
			cite: 'Цитируемость в этой модели',
			of: 'из 100',
			you: 'Вы',
			ai: 'ИИ-поиск',
			a1: 'Границы участка определяют по сведениям Единого государственного реестра недвижимости, а на местности их устанавливает кадастровый инженер. [1]',
			s1: '[1] ваш сайт: страница о границах участка',
			a2: 'Границы участка указаны в выписке из реестра недвижимости; на местности их устанавливает кадастровый инженер. [1][2]',
			s2: '[1] сайт справочника, [2] форум владельцев. Вашей страницы среди источников нет.',
			note: 'Это игрушечная модель. Настоящие системы устроены сложнее и не раскрывают, как выбирают источники. Мы показываем только направление: ясный ответ, факты и честность помогают, а обман и закрытая дверь вредят.'
		},
		en: {
			whyBlocked: 'The search bot can’t read the page, so it can’t be cited.',
			whyHidden: 'Hidden text is spam: the page won’t only go uncited, it may be demoted.',
			whyIndirect: 'The answer is buried in the text: it is easier to take a page where it is in the first sentence.',
			question: 'How do I find where my property boundary runs?',
			caption: (q: string) => `Question: “${q}”`,
			legend: 'Your page',
			direct: 'the first sentence answers the question',
			facts: 'facts are in a list or a table',
			byline: 'the author and the date of the update are given',
			sources: 'there are links to the law and the documents',
			stuffing: 'the text is stuffed with keywords',
			hidden: 'part of the text is hidden from the person',
			blocked: 'the search bot is blocked in robots.txt',
			meter: (n: number) => `Chance of getting into the answer: ${n} out of 100`,
			cite: 'Chance of being cited in this model',
			of: 'out of 100',
			you: 'You',
			ai: 'AI search',
			a1: 'A property’s boundaries are set by the recorded deed and plat, and a licensed land surveyor marks them on the ground. [1]',
			s1: '[1] your site: the page on property boundaries',
			a2: 'A property’s boundaries are described in its recorded deed and plat; a licensed land surveyor marks them on the ground. [1][2]',
			s2: '[1] a reference site, [2] a homeowners’ forum. Your page is not among the sources.',
			note: 'This is a toy model. Real systems are more complex and don’t reveal how they choose sources. We show only the direction: a clear answer, facts and honesty help, while deceit and a closed door hurt.'
		}
	});

	let direct = $state(false);
	let facts = $state(false);
	let byline = $state(false);
	let sources = $state(false);
	let stuffing = $state(false);
	let hidden = $state(false);
	let blocked = $state(false);

	const score = $derived.by(() => {
		if (blocked) return 0;
		let s = 20;
		if (direct) s += 25;
		if (facts) s += 15;
		if (byline) s += 10;
		if (sources) s += 10;
		if (stuffing) s -= 10;
		if (hidden) s -= 40;
		return Math.max(0, Math.min(100, s));
	});
	const cited = $derived(score >= 55);
	const why = $derived(blocked ? W.whyBlocked : hidden ? W.whyHidden : !direct ? W.whyIndirect : '');
</script>

<figure class="dg">
	<figcaption>{W.caption(W.question)}</figcaption>
	<fieldset>
		<legend>{W.legend}</legend>
		<label><input type="checkbox" bind:checked={direct} /> {W.direct}</label>
		<label><input type="checkbox" bind:checked={facts} /> {W.facts}</label>
		<label><input type="checkbox" bind:checked={byline} /> {W.byline}</label>
		<label><input type="checkbox" bind:checked={sources} /> {W.sources}</label>
		<label><input type="checkbox" bind:checked={stuffing} /> {W.stuffing}</label>
		<label><input type="checkbox" bind:checked={hidden} /> {W.hidden}</label>
		<label><input type="checkbox" bind:checked={blocked} /> {W.blocked}</label>
	</fieldset>

	<div class="meter" role="img" aria-label={W.meter(score)}><div class="fill" style="width: {score}%"></div></div>
	<p class="dg-out" aria-live="polite">{W.cite}: <strong>{score} {W.of}</strong>.</p>

	<div class="chat">
		<p class="u"><span class="who">{W.you}</span> {W.question}</p>
		<div class="a">
			<span class="who">{W.ai}</span>
			{#if cited}
				<p>{W.a1}</p>
				<p class="src">{W.s1}</p>
			{:else}
				<p>{W.a2}</p>
				<p class="src">{W.s2} {why}</p>
			{/if}
		</div>
	</div>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	fieldset {
		margin: 0 0 var(--space-4);
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-1);
	}
	legend {
		padding: 0 var(--space-2);
		color: var(--text-secondary);
	}
	.meter {
		height: 0.9rem;
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.fill {
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.chat {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}
	.chat p {
		margin: 0 0 var(--space-1);
	}
	.who {
		display: block;
		font-size: 0.8em;
		color: var(--text-secondary);
	}
	.a {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	.src {
		font-size: 0.85em;
		color: var(--text-secondary);
	}
</style>
