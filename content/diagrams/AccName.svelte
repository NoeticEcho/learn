<!--
	«Что слышит диктор и что делает Tab» (part 15, lesson 3). Three controls (a menu button, a phone
	field, a window), each written five or three ways. For each way the person sees the markup, what
	the Tab key and Enter do, and the sentence a screen reader says. The spoken lines are the teaching
	simplification of what NVDA, JAWS and VoiceOver say; their exact wording differs by program and
	version, and the lesson says so.
-->
<script lang="ts">
	import './shared.css';
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });

	type Way = { code: string; tab: boolean; keys: boolean; said: string; verdict: string };
	type Control = { id: string; label: string; ways: Way[] };

	const controls: Control[] = [
		{
			id: 'menu',
			label: t('Кнопка меню', 'Menu button'),
			ways: [
				{ code: t('<div onclick="open()">Меню</div>', '<div onclick="open()">Menu</div>'), tab: false, keys: false, said: t('«Меню» (обычный текст, роль не названа)', '“Menu” (plain text, no role named)'), verdict: t('Мышью работает, клавиатурой и диктором нет: фокус сюда не доходит.', 'Works with a mouse, but not with a keyboard or a screen reader: focus never gets here.') },
				{ code: t('<div role="button">Меню</div>', '<div role="button">Menu</div>'), tab: false, keys: false, said: t('«Меню, кнопка»', '“Menu, button”'), verdict: t('Роль обещана, а поведения нет: Tab сюда не доходит, Enter не нажимает.', 'The role is promised but the behavior is missing: Tab doesn’t reach it and Enter doesn’t press it.') },
				{ code: t('<div role="button" tabindex="0">Меню</div>', '<div role="button" tabindex="0">Menu</div>'), tab: true, keys: false, said: t('«Меню, кнопка»', '“Menu, button”'), verdict: t('Фокус есть, но Enter и Пробел нужно дописывать скриптом. Много работы ради того, что уже есть в button.', 'It takes focus, but Enter and Space have to be added with a script. A lot of work for what button already has.') },
				{ code: t('<button type="button">Меню</button>', '<button type="button">Menu</button>'), tab: true, keys: true, said: t('«Меню, кнопка»', '“Menu, button”'), verdict: t('Хорошо. Но диктор не знает, раскрыто меню или нет.', 'Good. But the screen reader doesn’t know whether the menu is open.') },
				{ code: t('<button type="button" aria-expanded="false" aria-controls="menu">Меню</button>', '<button type="button" aria-expanded="false" aria-controls="menu">Menu</button>'), tab: true, keys: true, said: t('«Меню, кнопка, свёрнуто»', '“Menu, button, collapsed”'), verdict: t('Лучший вариант: нативная кнопка и состояние. Скрипт меняет aria-expanded на true при открытии.', 'The best option: a native button and a state. The script sets aria-expanded to true when it opens.') }
			]
		},
		{
			id: 'field',
			label: t('Поле телефона', 'Phone field'),
			ways: [
				{ code: t('<input type="tel" placeholder="Телефон">', '<input type="tel" placeholder="Phone">'), tab: true, keys: true, said: t('Зависит от программы: «Телефон, поле ввода» или просто «поле ввода»', 'Depends on the program: “Phone, edit text” or just “edit text”'), verdict: t('Ненадёжно, и подсказка исчезает, как только человек начал печатать.', 'Unreliable, and the hint vanishes as soon as the person starts typing.') },
				{ code: t('<input type="tel" aria-label="Телефон">', '<input type="tel" aria-label="Phone">'), tab: true, keys: true, said: t('«Телефон, поле ввода»', '“Phone, edit text”'), verdict: t('Диктор слышит название, но зрячий не видит подписи. Для людей с плохим зрением и когнитивными особенностями этого мало.', 'The screen reader hears a name, but a sighted person sees no label. For people with low vision or cognitive differences that isn’t enough.') },
				{ code: t('<label for="p">Телефон</label><input id="p" type="tel" autocomplete="tel">', '<label for="p">Phone</label><input id="p" type="tel" autocomplete="tel">'), tab: true, keys: true, said: t('«Телефон, поле ввода»', '“Phone, edit text”'), verdict: t('Лучший вариант: подпись видна всегда, щелчок по ней ставит фокус в поле, автозаполнение подставит номер.', 'The best option: the label is always visible, a click on it puts focus in the field, and autofill fills in the number.') },
				{ code: t('<label for="p">Телефон</label><input id="p" type="tel" aria-describedby="h"><small id="h">Например, +7 000 000-00-00</small>', '<label for="p">Phone</label><input id="p" type="tel" aria-describedby="h"><small id="h">For example, +1 000 000 0000</small>'), tab: true, keys: true, said: t('«Телефон, поле ввода. Например, плюс семь…»', '“Phone, edit text. For example, plus one…”'), verdict: t('Подпись плюс подсказка: диктор читает подсказку следом за названием.', 'A label plus a hint: the screen reader reads the hint right after the name.') }
			]
		},
		{
			id: 'dialog',
			label: t('Окно «Записаться»', '“Book” dialog'),
			ways: [
				{ code: '<div class="modal">…</div>', tab: false, keys: false, said: t('Ничего: диктор не знает, что появилось окно', 'Nothing: the screen reader doesn’t know a window appeared'), verdict: t('Фокус остаётся под окном, Esc не закрывает.', 'Focus stays under the dialog, and Esc doesn’t close it.') },
				{ code: '<div role="dialog" aria-modal="true" aria-labelledby="t">…</div>', tab: true, keys: false, said: t('«Записаться, диалог»', '“Book, dialog”'), verdict: t('Роль названа, но фокус остался под окном и Esc не работает, пока вы не написали это сами.', 'The role is named, but focus stayed under the dialog and Esc doesn’t work until you write that yourself.') },
				{ code: '<dialog aria-labelledby="t">…</dialog> + dialog.showModal()', tab: true, keys: true, said: t('«Записаться, диалог»', '“Book, dialog”'), verdict: t('Хорошо: фокус переходит в окно, Esc закрывает, страница под ним недоступна, а по закрытию фокус возвращается к кнопке.', 'Good: focus moves into the dialog, Esc closes it, the page beneath is unreachable, and on closing focus returns to the button.') }
			]
		}
	];

	let cid = $state('menu');
	let wi = $state(0);
	const control = $derived(controls.find((c) => c.id === cid)!);
	const way = $derived(control.ways[Math.min(wi, control.ways.length - 1)]);
	function pick(id: string) {
		cid = id;
		wi = 0;
	}
</script>

<figure class="dg">
	<figcaption>{t('Что слышит диктор и что делает Tab', 'What the screen reader says and what Tab does')}</figcaption>
	<p class="dg-out">{t('Выберите элемент и способ, которым он написан. Справа видно, что с ним делают клавиатура и диктор. Слова диктора условны: каждая программа говорит чуть иначе, но смысл тот же.', 'Choose an element and the way it is written. On the right you see what the keyboard and a screen reader do with it. The screen reader’s words are indicative: each program says it a little differently, and the sense is the same.')}</p>

	<div class="dg-ctl" role="radiogroup" aria-label={t('Элемент', 'Element')}>
		{#each controls as c (c.id)}
			<button type="button" role="radio" aria-checked={cid === c.id} class:on={cid === c.id} onclick={() => pick(c.id)}>{c.label}</button>
		{/each}
	</div>

	<div class="dg-ctl" role="radiogroup" aria-label={t('Способ написания', 'Way of writing')}>
		{#each control.ways as w, i (i)}
			<button type="button" role="radio" aria-checked={wi === i} class:on={wi === i} onclick={() => (wi = i)}>{t('Вариант', 'Variant')} {i + 1}</button>
		{/each}
	</div>

	<pre class="dg-box dg-mono code">{way.code}</pre>

	<dl class="res" aria-live="polite">
		<div><dt>{t('Tab доходит', 'Tab reaches it')}</dt><dd>{way.tab ? t('✓ да', '✓ yes') : t('✕ нет', '✕ no')}</dd></div>
		<div><dt>{t('Enter и Пробел работают', 'Enter and Space work')}</dt><dd>{way.keys ? t('✓ да', '✓ yes') : t('✕ нет', '✕ no')}</dd></div>
		<div><dt>{t('Диктор говорит', 'The screen reader says')}</dt><dd>{way.said}</dd></div>
		<div><dt>{t('Вывод', 'Conclusion')}</dt><dd>{way.verdict}</dd></div>
	</dl>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('схема показывает для кнопки меню, поля и окна, как разные способы разметки ведут себя с клавиатурой и с диктором. Нативные элементы (button, label с input, dialog) получают фокус, управляются клавишами и называются сами; div с обработчиком клика и ролью требует дописывать всё это вручную.', 'the diagram shows, for a menu button, a field and a dialog, how different ways of writing the markup behave with a keyboard and a screen reader. Native elements (button, a label with an input, dialog) take focus, answer to keys and name themselves; a div with a click handler and a role needs all of that added by hand.')}</p>
</figure>

<style>
	.code {
		margin: var(--space-3) 0;
		overflow-x: auto;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.res {
		display: grid;
		gap: var(--space-2);
		margin: 0;
	}
	.res div {
		display: grid;
		grid-template-columns: minmax(9rem, 14rem) 1fr;
		gap: var(--space-3);
		padding: var(--space-1) 0;
		border-top: var(--line) solid var(--border-hairline);
	}
	.res dt {
		color: var(--text-secondary);
	}
	.res dd {
		margin: 0;
		color: var(--text-primary);
	}
	@media (max-width: 40rem) {
		.res div {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
