<!--
	«Один визит, два счётчика» (part 14, lesson 3). The reader sets one visit (seconds on the page, page
	views, a non-bounce event, a key action) and sees how Яндекс Метрика and GA4 each classify it.
	Метрика: a bounce is a visit with at most one view, shorter than the threshold (15 s by default)
	and without the service «неотказ» event; with accurateTrackBounce on, the counter sends that event
	itself after the threshold. GA4: a visit is engaged when it lasts over 10 s, or has 2+ views, or has
	a key event, and the bounce rate is the share of sessions that were not engaged. A scroll bar shows
	the thresholds (25/50/75/100 in Метрика-style goals, 90 for the GA4 automatic event). Sources:
	the Яндекс Директ article and the GA4 Data API schema cited in the lesson. Everything else is made up.
-->
<script lang="ts">
	import './shared.css';

	let seconds = $state(8);
	let views = $state(1);
	let notBounce = $state(false);
	let keyEvent = $state(false);
	let accurate = $state(true);
	let scroll = $state(40);

	const ymBounce = $derived(views <= 1 && !notBounce && !(accurate && seconds >= 15));
	const ga4Engaged = $derived(seconds > 10 || views >= 2 || keyEvent);
	const thresholds = [25, 50, 75, 100];
</script>

<figure class="dg">
	<figcaption>Одно и то же посещение, два ответа</figcaption>
	<div class="grid">
		<label>Секунд на странице: <strong>{seconds}</strong><input type="range" min="0" max="60" bind:value={seconds} /></label>
		<label>Просмотров за визит: <strong>{views}</strong><input type="range" min="1" max="4" bind:value={views} /></label>
		<label><input type="checkbox" bind:checked={notBounce} /> отправлено событие «неотказ» (ym(…, 'notBounce'))</label>
		<label><input type="checkbox" bind:checked={keyEvent} /> совершено ключевое действие (цель, заявка)</label>
		<label><input type="checkbox" bind:checked={accurate} /> в Метрике включён accurateTrackBounce</label>
	</div>

	<div class="two">
		<div class="dg-box" class:hit={ymBounce}>
			<h4>Яндекс Метрика</h4>
			<p><strong>{ymBounce ? 'Отказ' : 'Не отказ'}</strong></p>
			<p>Отказ, если сразу: не больше одного просмотра, короче 15 секунд и нет «неотказа».</p>
		</div>
		<div class="dg-box" class:hit={!ga4Engaged}>
			<h4>GA4</h4>
			<p><strong>{ga4Engaged ? 'Вовлечённый сеанс' : 'Невовлечённый: считается отказом'}</strong></p>
			<p>Вовлечённый, если дольше 10 секунд, или есть ключевое событие, или два просмотра и больше.</p>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if ymBounce !== !ga4Engaged}
			Счётчики разошлись: {ymBounce ? 'Метрика' : 'GA4'} считает визит отказом, а {ymBounce ? 'GA4' : 'Метрика'} нет. Одно и то же поведение даёт разные «отказы», поэтому цифры из двух систем нельзя сравнивать напрямую.
		{:else}
			Здесь счётчики согласны, но подвиньте ползунки: разница появится при 10–15 секундах и одном просмотре.
		{/if}
	</p>

	<h4 class="sub">Глубина прокрутки</h4>
	<label>Дошёл до: <strong>{scroll}%</strong><input type="range" min="0" max="100" step="5" bind:value={scroll} /></label>
	<ul class="thr">
		{#each thresholds as t (t)}<li class:got={scroll >= t}>{t}%: {scroll >= t ? 'достигнут' : 'нет'}</li>{/each}
		<li class:got={scroll >= 90}>90%: {scroll >= 90 ? 'автоматическое событие scroll в GA4 сработало' : 'автоматическое событие scroll в GA4 нет'}</li>
	</ul>
	<p class="dg-out">Числа и посетители выдуманы. Определения отказа взяты из справок Яндекса и Google; проверьте их на дату, когда настраиваете счётчик.</p>
</figure>

<style>
	.grid {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	label {
		display: grid;
		gap: var(--space-1);
	}
	label:has(input[type='checkbox']) {
		display: flex;
		gap: var(--space-2);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-3);
	}
	.dg-box p {
		margin: 0 0 var(--space-1);
	}
	.dg-box.hit {
		border-color: var(--border-brass);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	h4.sub {
		margin-top: var(--space-5);
	}
	.thr {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: 2px;
		color: var(--text-secondary);
	}
	.thr li.got {
		color: var(--text-primary);
	}
</style>
