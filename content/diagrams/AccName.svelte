<!--
	«Что слышит диктор и что делает Tab» (part 15, lesson 3). Three controls (a menu button, a phone
	field, a window), each written five or three ways. For each way the person sees the markup, what
	the Tab key and Enter do, and the sentence a screen reader says. The spoken lines are the teaching
	simplification of what NVDA, JAWS and VoiceOver say; their exact wording differs by program and
	version, and the lesson says so.
-->
<script lang="ts">
	import './shared.css';

	type Way = { code: string; tab: boolean; keys: boolean; said: string; verdict: string };
	type Control = { id: string; label: string; ways: Way[] };

	const controls: Control[] = [
		{
			id: 'menu',
			label: 'Кнопка меню',
			ways: [
				{ code: '<div onclick="open()">Меню</div>', tab: false, keys: false, said: '«Меню» (обычный текст, роль не названа)', verdict: 'Мышью работает, клавиатурой и диктором нет: фокус сюда не доходит.' },
				{ code: '<div role="button">Меню</div>', tab: false, keys: false, said: '«Меню, кнопка»', verdict: 'Роль обещана, а поведения нет: Tab сюда не доходит, Enter не нажимает.' },
				{ code: '<div role="button" tabindex="0">Меню</div>', tab: true, keys: false, said: '«Меню, кнопка»', verdict: 'Фокус есть, но Enter и Пробел нужно дописывать скриптом. Много работы ради того, что уже есть в button.' },
				{ code: '<button type="button">Меню</button>', tab: true, keys: true, said: '«Меню, кнопка»', verdict: 'Хорошо. Но диктор не знает, раскрыто меню или нет.' },
				{ code: '<button type="button" aria-expanded="false" aria-controls="menu">Меню</button>', tab: true, keys: true, said: '«Меню, кнопка, свёрнуто»', verdict: 'Лучший вариант: нативная кнопка и состояние. Скрипт меняет aria-expanded на true при открытии.' }
			]
		},
		{
			id: 'field',
			label: 'Поле телефона',
			ways: [
				{ code: '<input type="tel" placeholder="Телефон">', tab: true, keys: true, said: 'Зависит от программы: «Телефон, поле ввода» или просто «поле ввода»', verdict: 'Ненадёжно, и подсказка исчезает, как только человек начал печатать.' },
				{ code: '<input type="tel" aria-label="Телефон">', tab: true, keys: true, said: '«Телефон, поле ввода»', verdict: 'Диктор слышит название, но зрячий не видит подписи. Для людей с плохим зрением и когнитивными особенностями этого мало.' },
				{ code: '<label for="p">Телефон</label><input id="p" type="tel" autocomplete="tel">', tab: true, keys: true, said: '«Телефон, поле ввода»', verdict: 'Лучший вариант: подпись видна всегда, щелчок по ней ставит фокус в поле, автозаполнение подставит номер.' },
				{ code: '<label for="p">Телефон</label><input id="p" type="tel" aria-describedby="h"><small id="h">Например, +7 000 000-00-00</small>', tab: true, keys: true, said: '«Телефон, поле ввода. Например, плюс семь…»', verdict: 'Подпись плюс подсказка: диктор читает подсказку следом за названием.' }
			]
		},
		{
			id: 'dialog',
			label: 'Окно «Записаться»',
			ways: [
				{ code: '<div class="modal">…</div>', tab: false, keys: false, said: 'Ничего: диктор не знает, что появилось окно', verdict: 'Фокус остаётся под окном, Esc не закрывает.' },
				{ code: '<div role="dialog" aria-modal="true" aria-labelledby="t">…</div>', tab: true, keys: false, said: '«Записаться, диалог»', verdict: 'Роль названа, но фокус остался под окном и Esc не работает, пока вы не написали это сами.' },
				{ code: '<dialog aria-labelledby="t">…</dialog> + dialog.showModal()', tab: true, keys: true, said: '«Записаться, диалог»', verdict: 'Хорошо: фокус переходит в окно, Esc закрывает, страница под ним недоступна, а по закрытию фокус возвращается к кнопке.' }
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
	<figcaption>Что слышит диктор и что делает Tab</figcaption>
	<p class="dg-out">Выберите элемент и способ, которым он написан. Справа видно, что с ним делают клавиатура и диктор. Слова диктора условны: каждая программа говорит чуть иначе, но смысл тот же.</p>

	<div class="dg-ctl" role="radiogroup" aria-label="Элемент">
		{#each controls as c (c.id)}
			<button type="button" role="radio" aria-checked={cid === c.id} class:on={cid === c.id} onclick={() => pick(c.id)}>{c.label}</button>
		{/each}
	</div>

	<div class="dg-ctl" role="radiogroup" aria-label="Способ написания">
		{#each control.ways as w, i (i)}
			<button type="button" role="radio" aria-checked={wi === i} class:on={wi === i} onclick={() => (wi = i)}>Вариант {i + 1}</button>
		{/each}
	</div>

	<pre class="dg-box dg-mono code">{way.code}</pre>

	<dl class="res" aria-live="polite">
		<div><dt>Tab доходит</dt><dd>{way.tab ? '✓ да' : '✕ нет'}</dd></div>
		<div><dt>Enter и Пробел работают</dt><dd>{way.keys ? '✓ да' : '✕ нет'}</dd></div>
		<div><dt>Диктор говорит</dt><dd>{way.said}</dd></div>
		<div><dt>Вывод</dt><dd>{way.verdict}</dd></div>
	</dl>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> схема показывает для кнопки меню, поля и окна, как разные способы разметки ведут себя с клавиатурой и с диктором. Нативные элементы (button, label с input, dialog) получают фокус, управляются клавишами и называются сами; div с обработчиком клика и ролью требует дописывать всё это вручную.</p>
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
