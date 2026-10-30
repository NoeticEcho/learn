<!--
	«Путь рекламы до ЕРИР» (part 13, lesson 9). A made-up advertisement and a chain of five steps
	(advertiser, ad platform or blogger, ОРД, ЕРИР at Roskomnadzor): the reader chooses where the ad
	is bought, switches the «Реклама» label, the advertiser's details and the token (ERID) on and off
	and watches the preview and the checklist. The steps and the label's parts follow the public
	explanation of Yandex Direct (cited in the lesson); rules, deadlines and exceptions are the law's
	and change, so the diagram is a map for orientation and not a legal check.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			platformSteps: [
				'Вы создаёте объявление в кабинете площадки (Яндекс Директ, VK Реклама и т. д.).',
				'Площадка сама передаёт сведения о договоре и креативе в ОРД и получает токен.',
				'Объявление выходит с пометкой и токеном.',
				'ОРД передаёт сведения о показах в ЕРИР.',
				'Вы храните документы и проверяете, что данные верны.'
			],
			directSteps: [
				'Вы договариваетесь с блогером или владельцем канала напрямую.',
				'Вы (или посредник) вносите сведения о договоре и креативе в ОРД и получаете токен.',
				'Вы передаёте блогеру текст с пометкой «Реклама», сведениями о вас и токеном.',
				'Блогер публикует, а вы и он сообщаете ОРД о показах.',
				'ОРД передаёт сведения в ЕРИР; вы храните договор и акты.'
			],
			noLabel: 'нет слова «Реклама»: по правилам креатив только с пометкой считается неотмеченным, а без неё нарушение',
			noDetails: 'нет сведений о рекламодателе или ссылки на них',
			noToken: 'нет токена (ERID): по сведениям Яндекса, за это штрафы заметно больше, чем за отсутствие пометки',
			promise: 'в тексте обещание результата: недостоверная реклама, независимо от пометки',
			caption: 'Одно объявление и его пометка',
			whereGroup: 'Где куплена реклама',
			platform: 'Через кабинет площадки',
			direct: 'Напрямую у блогера',
			whatGroup: 'Что есть в объявлении',
			labelL: 'слово «Реклама»',
			detailsL: 'сведения о рекламодателе',
			tokenL: 'токен ERID',
			guaranteeL: '«Гарантируем результат»',
			tag: 'Реклама',
			head: 'Межевание участка: запись на консультацию',
			body: 'Расскажем, что нужно подготовить, и назовём цену до выезда.',
			guar: ' Гарантируем результат.',
			advertiser: 'Рекламодатель: кадастровый инженер, Заречье (сведения по ссылке)',
			erid: 'erid: 2VtzqXXXXXX',
			wrong: 'Что не так',
			ok: 'По этой схеме всё на месте. Это не юридическая проверка: порядок, сроки и исключения определяет закон и они меняются.'
		},
		en: {
			platformSteps: [
				'You create the ad in the platform’s ad manager (Google Ads, Meta Ads Manager, LinkedIn Campaign Manager and so on).',
				'The platform labels its own ads (Ad, Sponsored) and shows who paid.',
				'The ad runs with the platform’s label, and you check that your advertiser details are right.',
				'The platform keeps ad libraries in which anyone can look the ad up.',
				'You keep your records and check that every claim in the ad is true.'
			],
			directSteps: [
				'You agree a placement with an influencer or a channel owner directly.',
				'You put the disclosure rule in writing: a clear label at the start of the post, and the platform’s paid-partnership tool.',
				'You give the creator the text, the label and the wording of the advertiser line.',
				'The creator publishes, and you check the live post.',
				'You keep the contract and screenshots, and have any post without a clear label fixed or taken down.'
			],
			noLabel: 'there is no “Ad” label: an endorsement that is paid for must be clearly identifiable, and a vague tag or one buried in the text is not enough',
			noDetails: 'there is no “paid for by” line naming the advertiser: platforms and some laws (for example the EU’s Digital Services Act) expect people to see who paid',
			noToken: 'the platform’s paid-partnership tool is off: for a creator’s post it is the way the platform shows the connection',
			promise: 'the text has a promise of results: a misleading claim, label or no label',
			caption: 'One ad and its disclosure',
			whereGroup: 'Where the ad is bought',
			platform: 'Through a platform’s ad manager',
			direct: 'Directly from an influencer',
			whatGroup: 'What the ad has',
			labelL: 'the word “Ad”',
			detailsL: 'a “paid for by” line',
			tokenL: 'the paid-partnership tool',
			guaranteeL: '“We guarantee results”',
			tag: 'Ad',
			head: 'Boundary survey: book a consultation',
			body: 'We’ll tell you what to prepare and name the price before the visit.',
			guar: ' We guarantee results.',
			advertiser: 'Paid for by: Alder Boundary Surveys, Riverbend (details at the link)',
			erid: 'Paid partnership with @riverbend.creator',
			wrong: 'What is wrong',
			ok: 'By this sketch everything is in place. It is not a legal check: the rules differ by country and change.'
		}
	});

	type Where = 'platform' | 'direct';
	let where = $state<Where>('platform');
	let label = $state(false);
	let details = $state(false);
	let token = $state(false);
	let guarantee = $state(false);

	const steps = $derived(where === 'platform' ? W.platformSteps : W.directSteps);
	const problems = $derived(
		[!label && W.noLabel, !details && W.noDetails, !token && W.noToken, guarantee && W.promise].filter(Boolean) as string[]
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.whereGroup}>
		<button type="button" aria-pressed={where === 'platform'} onclick={() => (where = 'platform')}>{W.platform}</button>
		<button type="button" aria-pressed={where === 'direct'} onclick={() => (where = 'direct')}>{W.direct}</button>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.whatGroup}>
		<label><input type="checkbox" bind:checked={label} /> {W.labelL}</label>
		<label><input type="checkbox" bind:checked={details} /> {W.detailsL}</label>
		<label><input type="checkbox" bind:checked={token} /> {W.tokenL}</label>
		<label><input type="checkbox" bind:checked={guarantee} /> {W.guaranteeL}</label>
	</div>

	<div class="ad dg-box">
		{#if label}<p class="tag">{W.tag}</p>{/if}
		<p class="h">{W.head}</p>
		<p>{W.body}{guarantee ? W.guar : ''}</p>
		{#if details}<p class="small">{W.advertiser}</p>{/if}
		{#if token}<p class="small dg-mono">{W.erid}</p>{/if}
	</div>

	<ol>
		{#each steps as s, i (i)}<li>{s}</li>{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{#if problems.length}
			<strong>{W.wrong} ({problems.length}):</strong>
			{problems.join('; ')}.
		{:else}
			{W.ok}
		{/if}
	</p>
</figure>

<style>
	.ad {
		max-width: 28rem;
		margin-bottom: var(--space-3);
	}
	.ad p {
		margin: 0 0 var(--space-1);
	}
	.tag,
	.small {
		font-size: 0.82em;
		color: var(--text-secondary);
	}
	.h {
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	ol {
		display: grid;
		gap: var(--space-1);
	}
</style>
