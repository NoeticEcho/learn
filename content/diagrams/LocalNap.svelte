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
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			site: { name: 'Кадастровый кабинет Ольховской', address: 'ул. Береговая, 12', phone: '+7 000 000-00-00' },
			card: { name: 'Кадастровый кабинет К. Ольховской', address: 'ул. Береговая, 12', phone: '8 000 000-00-00' },
			labels: { name: 'Название', address: 'Адрес', phone: 'Телефон' },
			others: ['Землеустроительная компания «Меридиан»', 'Кадастровый инженер, частная практика', 'Бюро технической инвентаризации'],
			me: 'Ваш проект',
			caption: 'Одни и те же сведения в двух местах',
			onSite: 'На сайте',
			inCard: 'В карточке организации',
			same: 'совпадает',
			differ: 'не совпадает, поисковику и человеку это выглядит как две разные организации',
			agree: (n: number) => `Совпадает ${n} из 3. Знаки препинания и регистр не считаются, а «+7» и «8» считаются разными записями, пока вы не приведёте их к одному виду.`,
			rankHead: 'Кто выше в поиске «рядом» (учебная модель)',
			relevance: 'Подходит запросу',
			distance: 'Близость к человеку',
			prominence: 'Известность и отзывы',
			note: 'Google называет три фактора местного поиска: соответствие запросу, расстояние и известность; у Яндекса логика схожа. Веса не публикуются, и в модели они придуманы. Вы влияете на соответствие (категория, описание, сайт) и известность (честные отзывы), на расстояние нет.'
		},
		en: {
			site: { name: 'Alder Boundary Surveys', address: '12 Bank Street', phone: '+1 000 000 0000' },
			card: { name: 'K. Alder Boundary Surveys LLC', address: '12 Bank Street', phone: '000 000 0000' },
			labels: { name: 'Name', address: 'Address', phone: 'Phone' },
			others: ['Meridian Land Surveying Company', 'A land surveyor in private practice', 'The county surveyor’s office'],
			me: 'Your project',
			caption: 'The same facts in two places',
			onSite: 'On the website',
			inCard: 'On the business listing',
			same: 'matches',
			differ: 'doesn’t match, and to a search engine and a person it looks like two different businesses',
			agree: (n: number) => `${n} of 3 match. Punctuation and case don’t count, but “+1” and a missing country code count as different records until you bring them to one form.`,
			rankHead: 'Who ranks higher in a search for “near me” (a teaching model)',
			relevance: 'Matches the query',
			distance: 'Closeness to the person',
			prominence: 'Prominence and reviews',
			note: 'Google names three factors of local search: relevance, distance and prominence; other platforms use similar logic. The weights are not published, and in the model they are invented. You influence relevance (category, description, site) and prominence (honest reviews), not distance.'
		}
	});

	let site = $state({ ...W.site });
	let card = $state({ ...W.card });
	const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
	const fields = [
		{ k: 'name', label: W.labels.name },
		{ k: 'address', label: W.labels.address },
		{ k: 'phone', label: W.labels.phone }
	] as const;
	const same = $derived(fields.map((f) => norm(site[f.k]) === norm(card[f.k])));
	const agree = $derived(same.filter(Boolean).length);

	let relevance = $state(4);
	let distance = $state(3);
	let prominence = $state(2);
	const others = [
		{ name: W.others[0], r: 5, d: 2, p: 5 },
		{ name: W.others[1], r: 4, d: 4, p: 3 },
		{ name: W.others[2], r: 3, d: 5, p: 4 }
	];
	const ranked = $derived(
		[{ name: W.me, r: relevance, d: distance, p: prominence }, ...others]
			.map((o) => ({ ...o, score: o.r * 3 + o.d * 2 + o.p * 2 }))
			.sort((a, b) => b.score - a.score)
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="cols">
		<div class="dg-box">
			<div class="dh">{W.onSite}</div>
			{#each fields as f (f.k)}
				<label>{f.label} <input type="text" bind:value={site[f.k]} /></label>
			{/each}
		</div>
		<div class="dg-box">
			<div class="dh">{W.inCard}</div>
			{#each fields as f (f.k)}
				<label>{f.label} <input type="text" bind:value={card[f.k]} /></label>
			{/each}
		</div>
	</div>
	<ul class="marks">
		{#each fields as f, i (f.k)}
			<li>{f.label}: {same[i] ? W.same : W.differ}</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">{W.agree(agree)}</p>

	<div class="dh sub">{W.rankHead}</div>
	<div class="dg-ctl">
		<label>{W.relevance}: {relevance}<input type="range" min="1" max="5" bind:value={relevance} /></label>
		<label>{W.distance}: {distance}<input type="range" min="1" max="5" bind:value={distance} /></label>
		<label>{W.prominence}: {prominence}<input type="range" min="1" max="5" bind:value={prominence} /></label>
	</div>
	<ol class="rank">
		{#each ranked as o (o.name)}
			<li class:me={o.name === W.me}>{o.name}: {o.score}</li>
		{/each}
	</ol>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.dh.sub {
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
