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
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			caption: 'Одно и то же посещение, два ответа',
			seconds: 'Секунд на странице',
			views: 'Просмотров за визит',
			notBounce: "отправлено событие «неотказ» (ym(…, 'notBounce'))",
			keyEvent: 'совершено ключевое действие (цель, заявка)',
			accurate: 'в Метрике включён accurateTrackBounce',
			ym: 'Яндекс Метрика',
			bounce: 'Отказ',
			notBounceWord: 'Не отказ',
			ymRule: 'Отказ, если сразу: не больше одного просмотра, короче 15 секунд и нет «неотказа».',
			ga4Engaged: 'Вовлечённый сеанс',
			ga4Not: 'Невовлечённый: считается отказом',
			ga4Rule: 'Вовлечённый, если дольше 10 секунд, или есть ключевое событие, или два просмотра и больше.',
			ymName: 'Метрика',
			split: (a: string, b: string) => `Счётчики разошлись: ${a} считает визит отказом, а ${b} нет. Одно и то же поведение даёт разные «отказы», поэтому цифры из двух систем нельзя сравнивать напрямую.`,
			agree: 'Здесь счётчики согласны, но подвиньте ползунки: разница появится при 10–15 секундах и одном просмотре.',
			scrollHead: 'Глубина прокрутки',
			reached: 'Дошёл до',
			got: 'достигнут',
			no: 'нет',
			auto: (hit: boolean) => (hit ? 'автоматическое событие scroll в GA4 сработало' : 'автоматическое событие scroll в GA4 нет'),
			made: 'Числа и посетители выдуманы. Определения отказа взяты из справок Яндекса и Google; проверьте их на дату, когда настраиваете счётчик.'
		},
		en: {
			caption: 'One and the same visit, two answers',
			seconds: 'Seconds on the page',
			views: 'Page views in the visit',
			notBounce: "the “not a bounce” event was sent (ym(…, 'notBounce'))",
			keyEvent: 'a key action was done (a goal, a lead)',
			accurate: 'accurateTrackBounce is on in Metrica',
			ym: 'Yandex Metrica',
			bounce: 'Bounce',
			notBounceWord: 'Not a bounce',
			ymRule: 'A bounce if all together: at most one page view, shorter than 15 seconds, and no “not a bounce” event.',
			ga4Engaged: 'An engaged session',
			ga4Not: 'Not engaged: counts as a bounce',
			ga4Rule: 'Engaged if it lasts over 10 seconds, or has a key event, or has two or more page views.',
			ymName: 'Yandex Metrica',
			split: (a: string, b: string) => `The counters disagree: ${a} counts the visit as a bounce, and ${b} does not. The same behavior gives different “bounces”, so numbers from two systems can’t be compared directly.`,
			agree: 'Here the counters agree, but move the sliders: a difference appears at 10 to 15 seconds and one page view.',
			scrollHead: 'Scroll depth',
			reached: 'Got as far as',
			got: 'reached',
			no: 'no',
			auto: (hit: boolean) => (hit ? 'the automatic scroll event in GA4 fired' : 'the automatic scroll event in GA4 did not fire'),
			made: 'The numbers and visitors are invented. The bounce definitions come from the help pages of Yandex and Google; check them on the date you set up your counter.'
		}
	});

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
	<figcaption>{W.caption}</figcaption>
	<div class="grid">
		<label>{W.seconds}: <strong>{seconds}</strong><input type="range" min="0" max="60" bind:value={seconds} /></label>
		<label>{W.views}: <strong>{views}</strong><input type="range" min="1" max="4" bind:value={views} /></label>
		<label><input type="checkbox" bind:checked={notBounce} /> {W.notBounce}</label>
		<label><input type="checkbox" bind:checked={keyEvent} /> {W.keyEvent}</label>
		<label><input type="checkbox" bind:checked={accurate} /> {W.accurate}</label>
	</div>

	<div class="two">
		<div class="dg-box" class:hit={ymBounce}>
			<div class="dh">{W.ym}</div>
			<p><strong>{ymBounce ? W.bounce : W.notBounceWord}</strong></p>
			<p>{W.ymRule}</p>
		</div>
		<div class="dg-box" class:hit={!ga4Engaged}>
			<div class="dh">GA4</div>
			<p><strong>{ga4Engaged ? W.ga4Engaged : W.ga4Not}</strong></p>
			<p>{W.ga4Rule}</p>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if ymBounce !== !ga4Engaged}
			{W.split(ymBounce ? W.ymName : 'GA4', ymBounce ? 'GA4' : W.ymName)}
		{:else}
			{W.agree}
		{/if}
	</p>

	<div class="dh sub">{W.scrollHead}</div>
	<label>{W.reached}: <strong>{scroll}%</strong><input type="range" min="0" max="100" step="5" bind:value={scroll} /></label>
	<ul class="thr">
		{#each thresholds as t (t)}<li class:got={scroll >= t}>{t}%: {scroll >= t ? W.got : W.no}</li>{/each}
		<li class:got={scroll >= 90}>90%: {W.auto(scroll >= 90)}</li>
	</ul>
	<p class="dg-out">{W.made}</p>
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
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.dh.sub {
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
