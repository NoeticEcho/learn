<!--
	«Что видит счётчик» (part 14, lesson 2). A made-up page with four things to press (reload, scroll,
	call link, send form) and a counter that is either installed or not. Every press becomes a line in
	an event log (a view, an event or a goal) and moves four totals: visits, views, events, goals. Two
	switches show the two classic mistakes: the counter code twice on one page, which doubles the
	views, and a goal sent on every press with no once-only guard, which counts one form many times.
	A third switch, Webvisor, lists what is collected when it is on. Nothing leaves the page: the log
	is local state. The counter is made up and tied to no real service.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			kinds: { view: 'просмотр', event: 'событие', goal: 'цель' },
			opened: 'открыта страница',
			second: ' (второй раз: код стоит дважды)',
			caption: 'Нажимайте и смотрите, что записывает счётчик',
			state: 'Состояние счётчика',
			installed: 'код счётчика на странице',
			twice: 'код вставлен дважды',
			guard: 'защита от повторной отправки цели',
			recording: 'Вебвизор',
			actions: 'Действия посетителя',
			open: 'Открыть страницу',
			scroll: 'Прокрутить до 50%',
			call: 'Нажать на телефон',
			submit: 'Отправить форму',
			reset: 'Сбросить',
			visits: 'Визитов',
			views: 'Просмотров',
			events: 'Событий',
			goals: 'Целей',
			logLabel: 'Журнал счётчика',
			none: 'Кода счётчика на странице нет: ничего не записывается, и то, что происходит, вы не узнаете.',
			doubled: 'Просмотров вдвое больше, чем было открытий: код стоит дважды, и все цифры завышены.',
			repeated: (n: number) => `Форма отправлена один раз, а цель записана ${n} раза: без защиты каждое нажатие считается заявкой, и конверсия обманывает.`,
			fine: 'Всё сходится: одно действие одна запись.',
			rec: 'Вебвизор включён: кроме этих записей собираются движения мыши, клики, прокрутка и, если поля не замаскированы, текст, который человек вводит. Об этом отдельный урок про приватность.',
			made: 'Счётчик выдуманный и никуда ничего не отправляет: журнал только в этой схеме.'
		},
		en: {
			kinds: { view: 'view', event: 'event', goal: 'goal' },
			opened: 'page opened',
			second: ' (a second time: the code is there twice)',
			caption: 'Press and watch what the counter records',
			state: 'State of the counter',
			installed: 'the counter code is on the page',
			twice: 'the code is pasted twice',
			guard: 'a guard against sending the goal again',
			recording: 'Session recording',
			actions: 'The visitor’s actions',
			open: 'Open the page',
			scroll: 'Scroll to 50%',
			call: 'Tap the phone number',
			submit: 'Send the form',
			reset: 'Reset',
			visits: 'Visits',
			views: 'Page views',
			events: 'Events',
			goals: 'Goals',
			logLabel: 'The counter’s log',
			none: 'There is no counter code on the page: nothing is recorded, and you won’t know what happens.',
			doubled: 'There are twice as many page views as there were openings: the code is there twice, and all the numbers are inflated.',
			repeated: (n: number) => `The form was sent once, but the goal was recorded ${n} times: without a guard every press counts as a lead, and the conversion lies.`,
			fine: 'Everything adds up: one action, one record.',
			rec: 'Session recording is on: besides these records, mouse movements, clicks, scrolling and, if fields are not masked, the text a person types are collected. There is a separate lesson on privacy.',
			made: 'The counter is invented and sends nothing anywhere: the log lives only in this diagram.'
		}
	});

	let installed = $state(true);
	let twice = $state(false);
	let guard = $state(true);
	let webvisor = $state(false);
	let log = $state<{ kind: 'view' | 'event' | 'goal'; name: string }[]>([]);
	let visit = $state(1);
	let sentForm = $state(false);

	function push(kind: 'view' | 'event' | 'goal', name: string) {
		if (!installed) return;
		log.push({ kind, name });
		if (twice && kind === 'view') log.push({ kind, name: name + W.second });
	}
	function view() {
		push('view', W.opened);
	}
	function scrollTo(n: number) {
		push('event', `scroll_${n}`);
	}
	function call() {
		push('goal', 'phone_click');
	}
	function submit() {
		if (guard && sentForm) return;
		sentForm = true;
		push('goal', 'lead_submit');
	}
	function reset() {
		log = [];
		sentForm = false;
		visit = 1;
	}
	const views = $derived(log.filter((l) => l.kind === 'view').length);
	const events = $derived(log.filter((l) => l.kind === 'event').length);
	const goals = $derived(log.filter((l) => l.kind === 'goal').length);
	const forms = $derived(log.filter((l) => l.name === 'lead_submit').length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.state}>
		<label><input type="checkbox" bind:checked={installed} /> {W.installed}</label>
		<label><input type="checkbox" bind:checked={twice} /> {W.twice}</label>
		<label><input type="checkbox" bind:checked={guard} /> {W.guard}</label>
		<label><input type="checkbox" bind:checked={webvisor} /> {W.recording}</label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.actions}>
		<button type="button" onclick={view}>{W.open}</button>
		<button type="button" onclick={() => scrollTo(50)}>{W.scroll}</button>
		<button type="button" onclick={call}>{W.call}</button>
		<button type="button" onclick={submit}>{W.submit}</button>
		<button type="button" onclick={reset}>{W.reset}</button>
	</div>

	<div class="tot" role="status" aria-live="polite">
		<span>{W.visits} <strong>{views ? visit : 0}</strong></span>
		<span>{W.views} <strong>{views}</strong></span>
		<span>{W.events} <strong>{events}</strong></span>
		<span>{W.goals} <strong>{goals}</strong></span>
	</div>
	<ol class="log" aria-label={W.logLabel}>
		{#each log as l, i (i)}<li><span class="dg-mono">{W.kinds[l.kind]}</span> {l.name}</li>{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{#if !installed}
			{W.none}
		{:else if twice && views}
			{W.doubled}
		{:else if !guard && forms > 1}
			{W.repeated(forms)}
		{:else}
			{W.fine}
		{/if}
	</p>
	{#if webvisor}
		<p class="dg-out">{W.rec}</p>
	{/if}
	<p class="dg-out">{W.made}</p>
</figure>

<style>
	.tot {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}
	.log {
		list-style: none;
		padding: 0 !important;
		max-height: 11rem;
		overflow: auto;
		display: grid;
		gap: 2px;
	}
</style>
