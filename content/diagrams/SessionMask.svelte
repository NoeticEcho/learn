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
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			titles: { prices: 'Цены', contacts: 'Контакты и заявка', case: 'Расскажите о вашем деле' },
			scroll: 'Прокрутка',
			scrollText: 'дошёл до таблицы цен, остановился на 12 секунд',
			name: 'Имя',
			nameText: 'Иван Петров',
			phone: 'Телефон',
			phoneText: '+7 900 000-00-00',
			desc: 'Описание',
			descText: 'Сосед сдвинул забор на мой участок, у меня есть старый план и свидетель',
			caption: 'Одна запись: что в неё попадает',
			pageGroup: 'Страница, которую открыл посетитель',
			rules: 'Правила записи',
			rec: 'запись сессий включена',
			mask: 'поля формы замаскированы',
			excl: 'страница с описанием дела не записывается',
			does: 'Что делает посетитель',
			page: 'Страница',
			sees: 'Что видно в записи',
			nothing: 'Ничего',
			excluded: 'эта страница исключена из записи',
			off: 'запись выключена',
			leakA: 'Запись содержит личные сведения человека',
			leakB: ' и подробности его дела',
			leakC: 'Человек об этом не знает, если вы ему не сказали, а вы теперь отвечаете за эти данные.',
			safe: 'Данные не собираются. Это самый безопасный вариант, но вы не узнаете, где людям трудно.',
			ok: 'В записи только поведение: куда нажал, докуда прокрутил. Содержимое полей скрыто.',
			made: 'Посетитель и его слова выдуманы. Принцип настоящий: записывайте поведение, а не содержимое.'
		},
		en: {
			titles: { prices: 'Prices', contacts: 'Contact and request', case: 'Tell us about your case' },
			scroll: 'Scrolling',
			scrollText: 'reached the price table and stayed 12 seconds',
			name: 'Name',
			nameText: 'Ivan Peters',
			phone: 'Phone',
			phoneText: '+1 000 000 0000',
			desc: 'Description',
			descText: 'A neighbor moved the fence onto my lot, and I have an old plan and a witness',
			caption: 'One recording: what gets into it',
			pageGroup: 'The page the visitor opened',
			rules: 'Recording rules',
			rec: 'session recording is on',
			mask: 'the form fields are masked',
			excl: 'the page with the description of the case is not recorded',
			does: 'What the visitor does',
			page: 'Page',
			sees: 'What shows in the recording',
			nothing: 'Nothing',
			excluded: 'this page is excluded from recording',
			off: 'recording is off',
			leakA: 'The recording contains the person’s personal details',
			leakB: ' and the particulars of their case',
			leakC: 'The person doesn’t know, if you haven’t told them, and you are now responsible for this data.',
			safe: 'No data is collected. This is the safest option, but you won’t learn where people find it hard.',
			ok: 'The recording holds only behavior: where they pressed, how far they scrolled. The contents of the fields are hidden.',
			made: 'The visitor and their words are invented. The principle is real: record behavior, not content.'
		}
	});

	type Page = 'prices' | 'contacts' | 'case';
	let page = $state<Page>('contacts');
	let recording = $state(true);
	let masked = $state(false);
	let excludeCase = $state(false);

	const titles: Record<Page, string> = W.titles;
	const typed = $derived(
		page === 'prices'
			? [{ label: W.scroll, text: W.scrollText }]
			: page === 'contacts'
				? [
						{ label: W.name, text: W.nameText },
						{ label: W.phone, text: W.phoneText }
					]
				: [{ label: W.desc, text: W.descText }]
	);
	const blocked = $derived(!recording || (excludeCase && page === 'case'));
	const star = (s: string) => '•'.repeat(Math.min(12, s.length));
	const leaked = $derived(!blocked && !masked && page !== 'prices');
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.pageGroup}>
		{#each Object.keys(titles) as p (p)}
			<button type="button" aria-pressed={page === p} onclick={() => (page = p as Page)}>{titles[p as Page]}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label={W.rules}>
		<label><input type="checkbox" bind:checked={recording} /> {W.rec}</label>
		<label><input type="checkbox" bind:checked={masked} /> {W.mask}</label>
		<label><input type="checkbox" bind:checked={excludeCase} /> {W.excl}</label>
	</div>

	<div class="two">
		<div class="dg-box">
			<div class="dh">{W.does}</div>
			<p>{W.page}: {titles[page]}</p>
			<ul>
				{#each typed as t (t.label)}<li>{t.label}: {t.text}</li>{/each}
			</ul>
		</div>
		<div class="dg-box" class:bad={leaked}>
			<div class="dh">{W.sees}</div>
			{#if blocked}
				<p>{W.nothing}: {recording ? W.excluded : W.off}.</p>
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
			{W.leakA}{page === 'case' ? W.leakB : ''}. {W.leakC}
		{:else if blocked}
			{W.safe}
		{:else}
			{W.ok}
		{/if}
	</p>
	<p class="dg-out">{W.made}</p>
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
