<!--
	«Страница как сюжет» (part 12, lesson 7). The sections of a landing page in scrolling order, each
	marked with the act it belongs to; a switch shows which parts of a page are facts for a hurried
	reader and should not be narrated (navigation, price, legal text, form, contacts). The page is
	an invented one and the wording is ours.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			parts: [
				{ name: 'Меню', act: 0, fact: true, note: 'Навигация: человек ищет, куда нажать. Названия простые, без метафор.' },
				{ name: 'Первый экран', act: 1, fact: false, note: 'Обычный мир и желание: одна узнаваемая ситуация, одна кнопка.' },
				{ name: 'Проблема', act: 1, fact: false, note: 'Беда растёт: что мешает, как это чувствуется.' },
				{ name: 'Проводник и доказательства', act: 2, fact: false, note: 'Документы, случаи, отзывы: каждое доказательство коротким эпизодом.' },
				{ name: 'Как это работает', act: 2, fact: false, note: 'Три шага: путь героя становится ясным.' },
				{ name: 'Цены и условия', act: 0, fact: true, note: 'Таблица или список. Человек сравнивает и считает, сюжет мешает.' },
				{ name: 'Призыв и контакты', act: 3, fact: false, note: 'Развязка: кнопка, телефон, адрес. Просто и без украшений.' },
				{ name: 'Политика и согласие', act: 0, fact: true, note: 'Юридический текст: точные формулировки, не рассказ.' }
			],
			actName: ['', 'Акт 1: завязка', 'Акт 2: развитие', 'Акт 3: развязка'],
			outside: 'вне сюжета',
			flag: 'факты, не сюжет',
			caption: 'Разделы страницы в порядке прокрутки',
			toggle: 'Показать, где историю не рассказывают',
			note: 'Сюжет идёт от первого экрана до призыва. Меню, цены, условия и политика стоят рядом с ним, но не рассказывают.'
		},
		en: {
			parts: [
				{ name: 'Menu', act: 0, fact: true, note: 'Navigation: the person is looking for where to click. Plain names, no metaphors.' },
				{ name: 'First screen', act: 1, fact: false, note: 'The ordinary world and the want: one recognizable situation, one button.' },
				{ name: 'Problem', act: 1, fact: false, note: 'The trouble grows: what gets in the way, how it feels.' },
				{ name: 'Guide and proof', act: 2, fact: false, note: 'Documents, cases, testimonials: each proof as a short episode.' },
				{ name: 'How it works', act: 2, fact: false, note: 'Three steps: the hero’s path becomes clear.' },
				{ name: 'Prices and terms', act: 0, fact: true, note: 'A table or a list. The person compares and counts, and a plot gets in the way.' },
				{ name: 'Call to action and contacts', act: 3, fact: false, note: 'The resolution: a button, a phone number, an address. Simple, with no decoration.' },
				{ name: 'Privacy policy and consent', act: 0, fact: true, note: 'Legal text: exact wording, not a story.' }
			],
			actName: ['', 'Act 1: setup', 'Act 2: confrontation', 'Act 3: resolution'],
			outside: 'outside the plot',
			flag: 'facts, not plot',
			caption: 'The sections of a page, in scrolling order',
			toggle: 'Show where a story is not told',
			note: 'The plot runs from the first screen to the call to action. The menu, prices, terms and policy stand beside it, but don’t tell a story.'
		}
	});
	const parts = W.parts;
	let marks = $state(false);
	const actName = W.actName;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<button type="button" aria-pressed={marks} onclick={() => (marks = !marks)}>{W.toggle}</button>
	</div>
	<ol class="stack">
		{#each parts as p (p.name)}
			<li class:fact={marks && p.fact}>
				<strong>{p.name}</strong>
				<span class="act">{p.act ? actName[p.act] : W.outside}</span>
				{#if marks && p.fact}<span class="flag">{W.flag}</span>{/if}
				<p>{p.note}</p>
			</li>
		{/each}
	</ol>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.stack {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.stack li {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	.stack li.fact {
		border-style: dashed;
		border-color: var(--border-brass);
	}
	.stack p {
		margin: var(--space-1) 0 0;
	}
	.act {
		margin-left: var(--space-2);
		color: var(--text-secondary);
	}
	.flag {
		margin-left: var(--space-2);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-brass);
	}
</style>
