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

	let installed = $state(true);
	let twice = $state(false);
	let guard = $state(true);
	let webvisor = $state(false);
	let log = $state<{ kind: string; name: string }[]>([]);
	let visit = $state(1);
	let sentForm = $state(false);

	function push(kind: string, name: string) {
		if (!installed) return;
		log.push({ kind, name });
		if (twice && kind === 'просмотр') log.push({ kind, name: name + ' (второй раз: код стоит дважды)' });
	}
	function view() {
		push('просмотр', 'открыта страница');
	}
	function scrollTo(n: number) {
		push('событие', `scroll_${n}`);
	}
	function call() {
		push('цель', 'phone_click');
	}
	function submit() {
		if (guard && sentForm) return;
		sentForm = true;
		push('цель', 'lead_submit');
	}
	function reset() {
		log = [];
		sentForm = false;
		visit = 1;
	}
	const views = $derived(log.filter((l) => l.kind === 'просмотр').length);
	const events = $derived(log.filter((l) => l.kind === 'событие').length);
	const goals = $derived(log.filter((l) => l.kind === 'цель').length);
	const forms = $derived(log.filter((l) => l.name === 'lead_submit').length);
</script>

<figure class="dg">
	<figcaption>Нажимайте и смотрите, что записывает счётчик</figcaption>
	<div class="dg-ctl" role="group" aria-label="Состояние счётчика">
		<label><input type="checkbox" bind:checked={installed} /> код счётчика на странице</label>
		<label><input type="checkbox" bind:checked={twice} /> код вставлен дважды</label>
		<label><input type="checkbox" bind:checked={guard} /> защита от повторной отправки цели</label>
		<label><input type="checkbox" bind:checked={webvisor} /> Вебвизор</label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Действия посетителя">
		<button type="button" onclick={view}>Открыть страницу</button>
		<button type="button" onclick={() => scrollTo(50)}>Прокрутить до 50%</button>
		<button type="button" onclick={call}>Нажать на телефон</button>
		<button type="button" onclick={submit}>Отправить форму</button>
		<button type="button" onclick={reset}>Сбросить</button>
	</div>

	<div class="tot" role="status" aria-live="polite">
		<span>Визитов <strong>{views ? visit : 0}</strong></span>
		<span>Просмотров <strong>{views}</strong></span>
		<span>Событий <strong>{events}</strong></span>
		<span>Целей <strong>{goals}</strong></span>
	</div>
	<ol class="log" aria-label="Журнал счётчика">
		{#each log as l, i (i)}<li><span class="dg-mono">{l.kind}</span> {l.name}</li>{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{#if !installed}
			Кода счётчика на странице нет: ничего не записывается, и то, что происходит, вы не узнаете.
		{:else if twice && views}
			Просмотров вдвое больше, чем было открытий: код стоит дважды, и все цифры завышены.
		{:else if !guard && forms > 1}
			Форма отправлена один раз, а цель записана {forms} раза: без защиты каждое нажатие считается заявкой, и конверсия обманывает.
		{:else}
			Всё сходится: одно действие одна запись.
		{/if}
	</p>
	{#if webvisor}
		<p class="dg-out">Вебвизор включён: кроме этих записей собираются движения мыши, клики, прокрутка и, если поля не замаскированы, текст, который человек вводит. Об этом отдельный урок про приватность.</p>
	{/if}
	<p class="dg-out">Счётчик выдуманный и никуда ничего не отправляет: журнал только в этой схеме.</p>
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
