<!--
	«Лупа для стоп-слов» (part 10, lesson 2). A text is read by six small dictionaries and the words
	that carry no information are marked by kind: an appraisal with no fact behind it, an amplifier,
	officialese, an empty phrase, a cliché, a noun chain. The dictionaries are the textbook's own,
	short on purpose: they find candidates, and only a person can decide whether a flagged word
	stands for a fact. Nothing leaves the page: the text is read here, in the browser.
-->
<script lang="ts">
	import './shared.css';

	import { dictFor, cats, mark, words, type Cat } from './stopwords.ts';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			before:
				'Добро пожаловать в нашу мастерскую! Мы — команда профессионалов с богатым опытом. На сегодняшний день мы осуществляем качественный ремонт велосипедов и предоставляем широкий спектр услуг. Мы гарантируем индивидуальный подход к каждому клиенту и очень высокое качество. Осуществление проведения диагностики является бесплатным.',
			after:
				'Чиним городские и дорожные велосипеды. Заменим камеру за 20 минут, 400 ₽. Отрегулируем тормоза и скорости за 600 ₽. Полное ТО делаем за день, 2 500 ₽. Диагностика бесплатна: скажем, что сломано и сколько это стоит, прежде чем начать.',
			caption: 'Лупа для стоп-слов',
			useBefore: 'Подставить «было»',
			useAfter: 'Подставить «стало»',
			area: 'Текст (можно вставить свой; он остаётся в этом браузере)',
			words: 'Слов:',
			flagged: 'Помечено:',
			digits: 'Чисел в тексте:',
			marked: 'Текст с пометками',
			note: 'Лупа ищет кандидатов по короткому словарю. Решаете вы: «лучший» с ссылкой на премию года уже не оценка, а факт.'
		},
		en: {
			before:
				'Welcome to our workshop! We are a team of professionals with a wealth of experience. At this point in time we carry out high-quality bicycle repairs and provide a wide range of services. We guarantee a personalized approach to every customer and very high quality. The performance of an inspection is free of charge.',
			after:
				'We fix city and touring bikes. A new inner tube takes 20 minutes and costs $12. Brakes and gears adjusted: $25. A full service takes a day and costs $90. The inspection is free: we tell you what’s broken and what it costs before we start.',
			caption: 'Stop-word lens',
			useBefore: 'Use “before”',
			useAfter: 'Use “after”',
			area: 'Text (paste your own; it stays in this browser)',
			words: 'Words:',
			flagged: 'Marked:',
			digits: 'Numbers in the text:',
			marked: 'Text with marks',
			note: 'The lens looks for candidates in a short dictionary. You decide: “best” with a reference to this year’s award is no longer an appraisal but a fact.'
		}
	});
	const dict = dictFor();

	let text = $state(W.before);

	const segs = $derived(mark(text));
	const total = $derived(words(text));
	const flagged = $derived(segs.filter((s) => s.cat).reduce((n, s) => n + words(s.text), 0));
	const count = (c: Cat) => segs.filter((s) => s.cat === c).length;
	const digits = $derived((text.match(/\d+/g) ?? []).length);
	const share = $derived(total ? Math.round((flagged / total) * 100) : 0);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<button type="button" onclick={() => (text = W.before)}>{W.useBefore}</button>
		<button type="button" onclick={() => (text = W.after)}>{W.useAfter}</button>
	</div>
	<label class="area">
		{W.area}
		<textarea bind:value={text} rows="6"></textarea>
	</label>

	<p class="dg-out" aria-live="polite">
		{W.words} <strong>{total}</strong>. {W.flagged} <strong>{flagged}</strong> ({share}%). {W.digits} <strong>{digits}</strong>.
	</p>
	<div class="marked dg-box" aria-label={W.marked}>
		{#each segs as s, i (i)}{#if s.cat}<mark class="m-{s.cat}" title={dict[s.cat].label}>{s.text}</mark>{:else}{s.text}{/if}{/each}
	</div>

	<ul class="legend">
		{#each cats as c (c)}
			<li class:zero={count(c) === 0}>
				<mark class="m-{c}">{dict[c].label}</mark>: {count(c)}. <span class="ask">{dict[c].ask}</span>
			</li>
		{/each}
	</ul>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.area {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	textarea {
		width: 100%;
		padding: var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
		resize: vertical;
	}
	.marked {
		white-space: pre-wrap;
		line-height: 1.7;
	}
	mark {
		color: var(--text-primary);
		padding: 0 2px;
		border-bottom: 2px solid currentColor;
	}
	.m-appraisal {
		background: color-mix(in srgb, #d9534f 28%, transparent);
	}
	.m-amplifier {
		background: color-mix(in srgb, #e0a030 30%, transparent);
	}
	.m-officialese {
		background: color-mix(in srgb, #4a8fd9 28%, transparent);
	}
	.m-empty {
		background: color-mix(in srgb, #9b6bd1 26%, transparent);
	}
	.m-cliche {
		background: color-mix(in srgb, #3aa17e 28%, transparent);
	}
	.m-chain {
		background: color-mix(in srgb, #888 32%, transparent);
	}
	.legend {
		list-style: none;
		padding: 0 !important;
		margin: var(--space-4) 0 0;
		display: grid;
		gap: var(--space-2);
	}
	.legend .ask {
		color: var(--text-secondary);
	}
	.zero {
		color: var(--text-secondary);
	}
</style>
