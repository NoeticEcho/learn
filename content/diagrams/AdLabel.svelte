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

	type Where = 'platform' | 'direct';
	let where = $state<Where>('platform');
	let label = $state(false);
	let details = $state(false);
	let token = $state(false);
	let guarantee = $state(false);

	const steps = $derived(
		where === 'platform'
			? [
					'Вы создаёте объявление в кабинете площадки (Яндекс Директ, VK Реклама и т. д.).',
					'Площадка сама передаёт сведения о договоре и креативе в ОРД и получает токен.',
					'Объявление выходит с пометкой и токеном.',
					'ОРД передаёт сведения о показах в ЕРИР.',
					'Вы храните документы и проверяете, что данные верны.'
				]
			: [
					'Вы договариваетесь с блогером или владельцем канала напрямую.',
					'Вы (или посредник) вносите сведения о договоре и креативе в ОРД и получаете токен.',
					'Вы передаёте блогеру текст с пометкой «Реклама», сведениями о вас и токеном.',
					'Блогер публикует, а вы и он сообщаете ОРД о показах.',
					'ОРД передаёт сведения в ЕРИР; вы храните договор и акты.'
				]
	);
	const problems = $derived(
		[
			!label && 'нет слова «Реклама»: по правилам креатив только с пометкой считается неотмеченным, а без неё нарушение',
			!details && 'нет сведений о рекламодателе или ссылки на них',
			!token && 'нет токена (ERID): по сведениям Яндекса, за это штрафы заметно больше, чем за отсутствие пометки',
			guarantee && 'в тексте обещание результата: недостоверная реклама, независимо от пометки'
		].filter(Boolean) as string[]
	);
</script>

<figure class="dg">
	<figcaption>Одно объявление и его пометка</figcaption>
	<div class="dg-ctl" role="group" aria-label="Где куплена реклама">
		<button type="button" aria-pressed={where === 'platform'} onclick={() => (where = 'platform')}>Через кабинет площадки</button>
		<button type="button" aria-pressed={where === 'direct'} onclick={() => (where = 'direct')}>Напрямую у блогера</button>
	</div>
	<div class="dg-ctl" role="group" aria-label="Что есть в объявлении">
		<label><input type="checkbox" bind:checked={label} /> слово «Реклама»</label>
		<label><input type="checkbox" bind:checked={details} /> сведения о рекламодателе</label>
		<label><input type="checkbox" bind:checked={token} /> токен ERID</label>
		<label><input type="checkbox" bind:checked={guarantee} /> «Гарантируем результат»</label>
	</div>

	<div class="ad dg-box">
		{#if label}<p class="tag">Реклама</p>{/if}
		<p class="h">Межевание участка: запись на консультацию</p>
		<p>Расскажем, что нужно подготовить, и назовём цену до выезда.{guarantee ? ' Гарантируем результат.' : ''}</p>
		{#if details}<p class="small">Рекламодатель: кадастровый инженер, Заречье (сведения по ссылке)</p>{/if}
		{#if token}<p class="small dg-mono">erid: 2VtzqXXXXXX</p>{/if}
	</div>

	<ol>
		{#each steps as s, i (i)}<li>{s}</li>{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{#if problems.length}
			<strong>Что не так ({problems.length}):</strong>
			{problems.join('; ')}.
		{:else}
			По этой схеме всё на месте. Это не юридическая проверка: порядок, сроки и исключения определяет закон и они меняются.
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
