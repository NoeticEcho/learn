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
	const why = $derived(
		blocked
			? 'Поисковый бот не может прочитать страницу, поэтому процитировать её нельзя.'
			: hidden
				? 'Скрытый текст это спам: страницу не только не процитируют, но и могут понизить.'
				: !direct
					? 'Ответ на вопрос спрятан в тексте: проще взять страницу, где он в первом предложении.'
					: ''
	);
</script>

<figure class="dg">
	<figcaption>Вопрос: «Как узнать, где проходит граница участка?»</figcaption>
	<fieldset>
		<legend>Ваша страница</legend>
		<label><input type="checkbox" bind:checked={direct} /> первое предложение отвечает на вопрос</label>
		<label><input type="checkbox" bind:checked={facts} /> факты вынесены в список или таблицу</label>
		<label><input type="checkbox" bind:checked={byline} /> указаны автор и дата обновления</label>
		<label><input type="checkbox" bind:checked={sources} /> есть ссылки на закон и документы</label>
		<label><input type="checkbox" bind:checked={stuffing} /> текст набит ключевыми словами</label>
		<label><input type="checkbox" bind:checked={hidden} /> часть текста скрыта от человека</label>
		<label><input type="checkbox" bind:checked={blocked} /> поисковый бот закрыт в robots.txt</label>
	</fieldset>

	<div class="meter" role="img" aria-label="Шанс попасть в ответ: {score} из 100"><div class="fill" style="width: {score}%"></div></div>
	<p class="dg-out" aria-live="polite">Цитируемость в этой модели: <strong>{score} из 100</strong>.</p>

	<div class="chat">
		<p class="u"><span class="who">Вы</span> Как узнать, где проходит граница участка?</p>
		<div class="a">
			<span class="who">ИИ-поиск</span>
			{#if cited}
				<p>Границы участка определяют по сведениям Единого государственного реестра недвижимости, а на местности их устанавливает кадастровый инженер. [1]</p>
				<p class="src">[1] ваш сайт: страница о границах участка</p>
			{:else}
				<p>Границы участка указаны в выписке из реестра недвижимости; на местности их устанавливает кадастровый инженер. [1][2]</p>
				<p class="src">[1] сайт справочника, [2] форум владельцев. Вашей страницы среди источников нет. {why}</p>
			{/if}
		</div>
	</div>
	<p class="dg-out">Это игрушечная модель. Настоящие системы устроены сложнее и не раскрывают, как выбирают источники. Мы показываем только направление: ясный ответ, факты и честность помогают, а обман и закрытая дверь вредят.</p>
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
