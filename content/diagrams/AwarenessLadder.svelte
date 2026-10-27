<!--
	«Лестница осведомлённости» (part 11, lesson 1). Eugene Schwartz's five levels as a slider. For
	each level the first screen of a made-up bicycle workshop is rebuilt: what the headline starts
	from, how much the paragraph explains and what the button asks. From level 4 the button is
	the person's own main action, read from their brief; before that it leads to material.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Level = { n: number; name: string; knows: string; starts: string; explains: string; head: string; para: string; cta: string };
	const levels: Level[] = [
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
	];
	let at = $state(2);
	let action = $state('Главное действие из вашего брифа');
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
	<figcaption>Один и тот же проект для пяти читателей</figcaption>
	<div class="dg-ctl">
		<label>
			Читатель: <strong>{l.n}. {l.name}</strong>
			<input type="range" min="1" max="5" step="1" bind:value={at} aria-label="Уровень осведомлённости читателя" />
		</label>
	</div>
	<dl class="rules">
		<div><dt>Что знает</dt><dd>{l.knows}</dd></div>
		<div><dt>С чего начинать</dt><dd>{l.starts}</dd></div>
		<div><dt>Сколько объяснять</dt><dd>{l.explains}</dd></div>
	</dl>
	<div class="screen dg-box" aria-live="polite">
		<p class="k">Первый экран (пример: вымышленная велосипедная мастерская)</p>
		<p class="h">{l.head}</p>
		<p>{l.para}</p>
		<p><span class="btn">{cta}</span></p>
		{#if l.n >= 4}<p class="k">Кнопка здесь ваше главное действие из брифа.</p>{:else}<p class="k">Кнопка ведёт к материалу, а не к покупке: человек ещё не готов.</p>{/if}
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
