<!--
	«Адрес на сайте и в карточке» (part 13, lesson 8). Two columns of the same three facts (название,
	адрес, телефон): what the site says and what the directory card says. The card starts a little
	different, as cards do after a move or a rebrand. The diagram marks every mismatch, counts the
	agreeing facts and, below, shows the three things local search is said to weigh (соответствие
	запросу, расстояние, известность) on three made-up organisations, with sliders for the
	reader's own. The ranking is a teaching model: the services publish the factors, not the weights.
-->
<script lang="ts">
	import './shared.css';

	let site = $state({ name: 'Кадастровый кабинет Ольховской', address: 'ул. Береговая, 12', phone: '+7 000 000-00-00' });
	let card = $state({ name: 'Кадастровый кабинет К. Ольховской', address: 'ул. Береговая, 12', phone: '8 000 000-00-00' });
	const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
	const fields = [
		{ k: 'name', label: 'Название' },
		{ k: 'address', label: 'Адрес' },
		{ k: 'phone', label: 'Телефон' }
	] as const;
	const same = $derived(fields.map((f) => norm(site[f.k]) === norm(card[f.k])));
	const agree = $derived(same.filter(Boolean).length);

	let relevance = $state(4);
	let distance = $state(3);
	let prominence = $state(2);
	const others = [
		{ name: 'Землеустроительная компания «Меридиан»', r: 5, d: 2, p: 5 },
		{ name: 'Кадастровый инженер, частная практика', r: 4, d: 4, p: 3 },
		{ name: 'Бюро технической инвентаризации', r: 3, d: 5, p: 4 }
	];
	const ranked = $derived(
		[{ name: 'Ваш проект', r: relevance, d: distance, p: prominence }, ...others]
			.map((o) => ({ ...o, score: o.r * 3 + o.d * 2 + o.p * 2 }))
			.sort((a, b) => b.score - a.score)
	);
</script>

<figure class="dg">
	<figcaption>Одни и те же сведения в двух местах</figcaption>
	<div class="cols">
		<div class="dg-box">
			<h4>На сайте</h4>
			{#each fields as f (f.k)}
				<label>{f.label} <input type="text" bind:value={site[f.k]} /></label>
			{/each}
		</div>
		<div class="dg-box">
			<h4>В карточке организации</h4>
			{#each fields as f (f.k)}
				<label>{f.label} <input type="text" bind:value={card[f.k]} /></label>
			{/each}
		</div>
	</div>
	<ul class="marks">
		{#each fields as f, i (f.k)}
			<li>{f.label}: {same[i] ? 'совпадает' : 'не совпадает, поисковику и человеку это выглядит как две разные организации'}</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">Совпадает {agree} из 3. Знаки препинания и регистр не считаются, а «+7» и «8» считаются разными записями, пока вы не приведёте их к одному виду.</p>

	<h4 class="sub">Кто выше в поиске «рядом» (учебная модель)</h4>
	<div class="dg-ctl">
		<label>Подходит запросу: {relevance}<input type="range" min="1" max="5" bind:value={relevance} /></label>
		<label>Близость к человеку: {distance}<input type="range" min="1" max="5" bind:value={distance} /></label>
		<label>Известность и отзывы: {prominence}<input type="range" min="1" max="5" bind:value={prominence} /></label>
	</div>
	<ol class="rank">
		{#each ranked as o (o.name)}
			<li class:me={o.name === 'Ваш проект'}>{o.name}: {o.score}</li>
		{/each}
	</ol>
	<p class="dg-out">Google называет три фактора местного поиска: соответствие запросу, расстояние и известность; у Яндекса логика схожа. Веса не публикуются, и в модели они придуманы. Вы влияете на соответствие (категория, описание, сайт) и известность (честные отзывы), на расстояние нет.</p>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	h4.sub {
		margin-top: var(--space-5);
	}
	label {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
	}
	input[type='text'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font: inherit;
		min-width: 0;
	}
	.marks {
		list-style: none;
		padding: 0 !important;
		margin: var(--space-3) 0;
		color: var(--text-secondary);
	}
	.rank li.me {
		font-weight: var(--weight-medium);
		color: var(--text-primary);
	}
</style>
