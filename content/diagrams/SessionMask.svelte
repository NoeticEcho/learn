<!--
	«Что видно в записи сессии» (part 14, lesson 7). A made-up visitor fills in a made-up contact form
	on one of three pages. The right-hand pane shows what the owner of the site would see in a session
	recording. Three switches decide it: recording on at all, the form fields masked, and the page with
	the description of a client's case excluded from recording. Switch masking off and the visitor's
	name, phone and the story of their dispute are readable; switch it on and they become stars. Every
	person and every word here is invented.
-->
<script lang="ts">
	import './shared.css';

	type Page = 'prices' | 'contacts' | 'case';
	let page = $state<Page>('contacts');
	let recording = $state(true);
	let masked = $state(false);
	let excludeCase = $state(false);

	const titles: Record<Page, string> = { prices: 'Цены', contacts: 'Контакты и заявка', case: 'Расскажите о вашем деле' };
	const typed = $derived(
		page === 'prices'
			? [{ label: 'Прокрутка', text: 'дошёл до таблицы цен, остановился на 12 секунд' }]
			: page === 'contacts'
				? [
						{ label: 'Имя', text: 'Иван Петров' },
						{ label: 'Телефон', text: '+7 900 000-00-00' }
					]
				: [{ label: 'Описание', text: 'Сосед сдвинул забор на мой участок, у меня есть старый план и свидетель' }]
	);
	const blocked = $derived(!recording || (excludeCase && page === 'case'));
	const star = (s: string) => '•'.repeat(Math.min(12, s.length));
	const leaked = $derived(!blocked && !masked && page !== 'prices');
</script>

<figure class="dg">
	<figcaption>Одна запись: что в неё попадает</figcaption>
	<div class="dg-ctl" role="group" aria-label="Страница, которую открыл посетитель">
		{#each Object.keys(titles) as p (p)}
			<button type="button" aria-pressed={page === p} onclick={() => (page = p as Page)}>{titles[p as Page]}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label="Правила записи">
		<label><input type="checkbox" bind:checked={recording} /> запись сессий включена</label>
		<label><input type="checkbox" bind:checked={masked} /> поля формы замаскированы</label>
		<label><input type="checkbox" bind:checked={excludeCase} /> страница с описанием дела не записывается</label>
	</div>

	<div class="two">
		<div class="dg-box">
			<div class="dh">Что делает посетитель</div>
			<p>Страница: {titles[page]}</p>
			<ul>
				{#each typed as t (t.label)}<li>{t.label}: {t.text}</li>{/each}
			</ul>
		</div>
		<div class="dg-box" class:bad={leaked}>
			<div class="dh">Что видно в записи</div>
			{#if blocked}
				<p>Ничего: {recording ? 'эта страница исключена из записи' : 'запись выключена'}.</p>
			{:else}
				<ul>
					{#each typed as t (t.label)}
						<li>{t.label}: {page === 'prices' ? t.text : masked ? star(t.text) : t.text}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if leaked}
			Запись содержит личные сведения человека{page === 'case' ? ' и подробности его дела' : ''}. Человек об этом не знает, если вы ему не сказали, а вы теперь отвечаете за эти данные.
		{:else if blocked}
			Данные не собираются. Это самый безопасный вариант, но вы не узнаете, где людям трудно.
		{:else}
			В записи только поведение: куда нажал, докуда прокрутил. Содержимое полей скрыто.
		{/if}
	</p>
	<p class="dg-out">Посетитель и его слова выдуманы. Принцип настоящий: записывайте поведение, а не содержимое.</p>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.dg-box p {
		margin: 0 0 var(--space-1);
	}
	.dg-box.bad {
		border-color: var(--border-brass);
	}
</style>
