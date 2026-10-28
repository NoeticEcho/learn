<!--
	«Лестница осведомлённости» (part 11, lesson 1). Eugene Schwartz's five levels as a slider. For
	each level the first screen of a made-up bicycle workshop is rebuilt: what the headline starts
	from, how much the paragraph explains and what the button asks. From level 4 the button is
	the person's own main action, read from their brief; before that it leads to material.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Level = { n: number; name: string; knows: string; starts: string; explains: string; head: string; para: string; cta: string };
	const W = pick({
		ru: {
			levels: [
					{
						n: 1,
						name: 'Не знает о проблеме',
						knows: 'Не замечает, что проблема есть, или не считает её проблемой.',
						starts: 'С истории, наблюдения или факта, который заставит заметить проблему.',
						explains: 'Много: сначала показать, что вопрос существует.',
						head: 'Почему велосипед, который «и так едет», с каждым месяцем требует больше сил',
						para: 'Цепь вытягивается, смазка выгорает, подшипники затягивает пылью. Каждое из этих изменений мелкое, а вместе они отнимают заметную часть усилий.',
						cta: 'Прочитать, как проверить велосипед за пять минут'
					},
					{
						n: 2,
						name: 'Знает о проблеме',
						knows: 'Чувствует неудобство, но не знает, что есть решение.',
						starts: 'С самой проблемы словами человека, как он её описал бы себе.',
						explains: 'Много: что происходит и почему, затем что с этим можно делать.',
						head: 'Скрипят тормоза? Пока скрипят, они ещё работают, но не надолго',
						para: 'Скрип означает, что колодка стёрлась или загрязнилась. Если не заменить, дальше изнашивается диск, и ремонт становится дороже.',
						cta: 'Посмотреть, как это чинят'
					},
					{
						n: 3,
						name: 'Знает о решениях',
						knows: 'Знает, что результат достижим, но не знает вашего продукта.',
						starts: 'С результата: что можно получить, и чем ваш способ отличается.',
						explains: 'Средне: сравнить способы и показать, чем ваш лучше именно для него.',
						head: 'Замена колодок и регулировка тросов за один визит',
						para: 'Можно купить колодки и сделать самому, а можно приехать: мы подберём колодки под ваши тормоза, поставим и отрегулируем, на ремонт нужно около 20 минут.',
						cta: 'Сравнить варианты и цены'
					},
					{
						n: 4,
						name: 'Знает о продукте',
						knows: 'Знает вас, но не уверен, что вы подходите именно ему.',
						starts: 'С вашего имени и конкретного предложения, затем сразу доводы.',
						explains: 'Мало: цены, сроки, доказательства, ответы на возражения.',
						head: 'Мастерская «Рейка»: ремонт за день, цены на странице',
						para: 'Мастера прошли обучение у производителя тормозных систем, на работу даётся гарантия 30 дней. Цены на камеру, тормоза и полное ТО указаны ниже.',
						cta: ''
					},
					{
						n: 5,
						name: 'Готов обратиться',
						knows: 'Хочет именно вас, нужно только лёгкое действие и условия.',
						starts: 'С предложения и действия: что сделать прямо сейчас.',
						explains: 'Почти нет: условия, срок, кнопка.',
						head: 'Запись на ремонт: сегодня принимаем без очереди до 18:00',
						para: 'Оставьте телефон: назовём время и примерную цену. Привезти велосипед можно и без записи по будням с 9 до 18.',
						cta: ''
					}
				] as Level[],
			defaultAction: 'Главное действие из вашего брифа',
			caption: 'Один и тот же проект для пяти читателей',
			reader: 'Читатель:',
			aria: 'Уровень осведомлённости читателя',
			knows: 'Что знает',
			starts: 'С чего начинать',
			explains: 'Сколько объяснять',
			first: 'Первый экран (пример: вымышленная велосипедная мастерская)',
			own: 'Кнопка здесь ваше главное действие из брифа.',
			material: 'Кнопка ведёт к материалу, а не к покупке: человек ещё не готов.'
		},
		en: {
			levels: [
				{
					n: 1,
					name: 'Doesn’t know about the problem',
					knows: 'Doesn’t notice there is a problem, or doesn’t think of it as one.',
					starts: 'With a story, an observation or a fact that makes them notice the problem.',
					explains: 'A lot: first show that the question exists.',
					head: 'Why a bike that “still rides fine” takes more effort every month',
					para: 'The chain stretches, the lubricant burns off, dust works into the bearings. Each change is small, but together they take a noticeable share of your effort.',
					cta: 'Read how to check your bike in five minutes'
				},
				{
					n: 2,
					name: 'Knows about the problem',
					knows: 'Feels the discomfort, but doesn’t know there is a fix.',
					starts: 'With the problem itself, in the person’s own words, as they would describe it to themselves.',
					explains: 'A lot: what is going on and why, then what can be done about it.',
					head: 'Squealing brakes? While they squeal they still work, but not for long',
					para: 'A squeal means the pad is worn or dirty. If it isn’t replaced, the rotor wears next, and the repair gets more expensive.',
					cta: 'See how it is fixed'
				},
				{
					n: 3,
					name: 'Knows about solutions',
					knows: 'Knows the result is achievable, but doesn’t know your product.',
					starts: 'With the result: what can be had, and how your way differs.',
					explains: 'Medium: compare the ways and show why yours is better for them.',
					head: 'New brake pads and cable adjustment in one visit',
					para: 'You can buy pads and fit them yourself, or you can come in: we match the pads to your brakes, fit them and adjust them, and the job takes about 20 minutes.',
					cta: 'Compare the options and prices'
				},
				{
					n: 4,
					name: 'Knows about the product',
					knows: 'Knows you, but isn’t sure you are right for them in particular.',
					starts: 'With your name and a specific offer, then the reasons at once.',
					explains: 'A little: prices, timing, proof, answers to objections.',
					head: 'Spoke & Tube workshop: repairs in a day, prices on the page',
					para: 'Our mechanics trained with a maker of brake systems, and the work carries a 30-day guarantee. Prices for a tube, brakes and a full service are below.',
					cta: ''
				},
				{
					n: 5,
					name: 'Ready to act',
					knows: 'Wants you in particular and needs only an easy action and the terms.',
					starts: 'With the offer and the action: what to do right now.',
					explains: 'Almost nothing: terms, timing, the button.',
					head: 'Book a repair: we take walk-ins with no wait until 6 p.m. today',
					para: 'Leave your phone number and we’ll give you a time and a rough price. You can also bring the bike in without a booking, weekdays 9 to 6.',
					cta: ''
				}
			] as Level[],
			defaultAction: 'The main action from your brief',
			caption: 'One project for five readers',
			reader: 'Reader:',
			aria: 'The reader’s level of awareness',
			knows: 'What they know',
			starts: 'Where to start',
			explains: 'How much to explain',
			first: 'First screen (an example: an invented bicycle workshop)',
			own: 'The button here is your main action from the brief.',
			material: 'The button leads to material, not to a purchase: the person isn’t ready yet.'
		}
	});
	const levels = W.levels;
	let at = $state(2);
	let action = $state(W.defaultAction);
	onMount(async () => {
		try {
			action = (await (await import('#lib/learner.ts')).persona()).mainAction.label || action;
		} catch {
			/* the generic label stays */
		}
	});
	const l = $derived(levels[at - 1]);
	const cta = $derived(l.cta || action);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.reader} <strong>{l.n}. {l.name}</strong>
			<input type="range" min="1" max="5" step="1" bind:value={at} aria-label={W.aria} />
		</label>
	</div>
	<dl class="rules">
		<div><dt>{W.knows}</dt><dd>{l.knows}</dd></div>
		<div><dt>{W.starts}</dt><dd>{l.starts}</dd></div>
		<div><dt>{W.explains}</dt><dd>{l.explains}</dd></div>
	</dl>
	<div class="screen dg-box" aria-live="polite">
		<p class="k">{W.first}</p>
		<p class="h">{l.head}</p>
		<p>{l.para}</p>
		<p><span class="btn">{cta}</span></p>
		{#if l.n >= 4}<p class="k">{W.own}</p>{:else}<p class="k">{W.material}</p>{/if}
	</div>
</figure>

<style>
	.rules {
		display: grid;
		gap: var(--space-2);
		margin: 0 0 var(--space-4);
	}
	.rules div {
		display: grid;
		grid-template-columns: 11rem 1fr;
		gap: var(--space-3);
	}
	.rules dt {
		color: var(--text-secondary);
	}
	.rules dd {
		margin: 0;
	}
	.screen p {
		margin: 0 0 var(--space-3);
	}
	.h {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.k {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.btn {
		display: inline-block;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--accent-measure);
		color: var(--text-primary);
	}
	@media (max-width: 36rem) {
		.rules div {
			grid-template-columns: 1fr;
		}
	}
</style>
