<!--
	«Что скажет сквозной тест» (part 15, lesson 4). One end-to-end test of the main action, written
	either with locators by role and label (what a person or a screen reader perceives) or with a
	CSS class. The person breaks the site in four ways, one at a time or together, and runs the test:
	the log shows which step stops and why. The point: a test by role catches the missing label (a
	real accessibility defect) and survives a harmless class rename; a test by class does the opposite.
	The messages imitate Playwright's wording without quoting it exactly.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let action = $state('Записаться');
	onMount(async () => {
		try {
			const a = (await (await import('#lib/learner.ts')).persona()).mainAction?.label;
			if (a) action = a;
		} catch {
			/* the example stays */
		}
	});

	type Bug = { id: string; label: string; step: number; roleMsg: string; cssMsg: string | null; harmless?: boolean; hint: string };
	const bugs: Bug[] = [
		{ id: 'label', label: 'У поля телефона пропала подпись', step: 3, roleMsg: 'getByLabel(«Телефон»): элемент не найден', cssMsg: null, hint: 'Тест по подписи нашёл настоящий дефект доступности. Тест по классу его бы пропустил.' },
		{ id: 'banner', label: 'Баннер cookie перекрыл кнопку отправки', step: 4, roleMsg: 'клик по кнопке: другой элемент перехватывает нажатие (баннер)', cssMsg: 'клик по кнопке: другой элемент перехватывает нажатие (баннер)', hint: 'Оба теста нашли дефект, который видел бы и человек.' },
		{ id: 'server', label: 'Сервер отвечает ошибкой 500 при отправке', step: 5, roleMsg: 'ожидалось сообщение «Спасибо», а на странице «Ошибка сервера»', cssMsg: 'ожидалось сообщение «Спасибо», а на странице «Ошибка сервера»', hint: 'Заявки не доходят, а страница выглядит нормально. Без теста вы бы об этом не узнали.' },
		{ id: 'class', label: 'Разработчик переименовал класс кнопки, внешне всё то же', step: 4, roleMsg: '', cssMsg: 'селектор .btn-primary не нашёл ни одного элемента', harmless: true, hint: 'Ложная тревога: сайт цел, а тест по классу упал. Такие тесты называют хрупкими.' }
	];
	let on = $state<Record<string, boolean>>({ label: false, banner: false, server: false, class: false });
	let byRole = $state(true);
	let ran = $state(false);

	const steps = $derived([
		'Открыть главную страницу',
		byRole ? `Найти ссылку «${action}» по роли и имени и нажать` : 'Найти элемент по селектору .btn-primary и нажать',
		byRole ? 'Найти поле «Телефон» по подписи и ввести номер' : 'Найти поле по селектору #phone и ввести номер',
		byRole ? `Нажать кнопку «${action}» (найти по роли и имени)` : 'Нажать кнопку по селектору .btn-send',
		'Дождаться сообщения «Спасибо» (роль status)'
	]);

	function failure() {
		const hits = bugs
			.filter((b) => on[b.id])
			.map((b) => ({ b, msg: byRole ? b.roleMsg : b.cssMsg, step: b.id === 'class' ? 2 : b.step }))
			.filter((h) => h.msg);
		hits.sort((x, y) => x.step - y.step);
		return hits[0] ?? null;
	}
	const fail = $derived(ran ? failure() : null);
	const missed = $derived(ran ? bugs.filter((b) => on[b.id] && !b.harmless && !(byRole ? b.roleMsg : b.cssMsg)) : []);
	const falseAlarm = $derived(ran && fail && bugs.find((b) => b.id === 'class' && on.class) && fail.b.harmless);
</script>

<figure class="dg">
	<figcaption>Что скажет сквозной тест</figcaption>
	<p class="dg-out">Тест проходит главное действие сайта так, как его проходит человек. Сломайте сайт любым способом, выберите, как тест ищет элементы, и запустите.</p>

	<fieldset class="bugs">
		<legend>Сломать сайт</legend>
		{#each bugs as b (b.id)}
			<label><input type="checkbox" bind:checked={on[b.id]} onchange={() => (ran = false)} /> {b.label}</label>
		{/each}
	</fieldset>

	<div class="dg-ctl" role="radiogroup" aria-label="Как тест ищет элементы">
		<button type="button" role="radio" aria-checked={byRole} class:on={byRole} onclick={() => { byRole = true; ran = false; }}>По роли и подписи</button>
		<button type="button" role="radio" aria-checked={!byRole} class:on={!byRole} onclick={() => { byRole = false; ran = false; }}>По CSS-классу</button>
		<button type="button" onclick={() => (ran = true)}>Запустить тест</button>
	</div>

	<ol class="log">
		{#each steps as s, i (i)}
			{@const stopAt = fail ? fail.step : 99}
			<li class:bad={ran && fail && i + 1 === stopAt} class:skip={ran && fail && i + 1 > stopAt}>
				<span class="mk" aria-hidden="true">{ran ? (fail ? (i + 1 < stopAt ? '✓' : i + 1 === stopAt ? '✕' : '–') : '✓') : '·'}</span>
				<span>{s}{#if ran && fail && i + 1 === stopAt}<br /><strong>Ошибка:</strong> {fail.msg}{/if}{#if ran && fail && i + 1 > stopAt} (пропущен){/if}</span>
			</li>
		{/each}
	</ol>

	<p class="dg-out" aria-live="polite">
		{#if !ran}Нажмите «Запустить тест».
		{:else if !fail && missed.length === 0}<strong>Тест прошёл.</strong> Сайт работает по сценарию.
		{:else if fail}<strong>Тест упал на шаге {fail.step === 2 && fail.b.harmless ? 2 : fail.step}.</strong> {fail.b.hint}
		{/if}
		{#if missed.length}<br /><strong>Пропущено тестом:</strong> {missed.map((m) => m.label.toLowerCase()).join('; ')}. {missed[0].hint}{/if}
		{#if falseAlarm}<br />Это ложная тревога: сайт для человека не изменился.{/if}
	</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> схема запускает условный тест из пяти шагов. Тест, который ищет элементы по роли и подписи, замечает пропавшую подпись поля, перекрытую кнопку и ошибку сервера и не реагирует на переименование класса. Тест по CSS-классу пропускает пропавшую подпись и падает на безобидном переименовании класса.</p>
</figure>

<style>
	.bugs {
		display: grid;
		gap: var(--space-1);
		margin: 0 0 var(--space-4);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.bugs legend {
		padding: 0 var(--space-2);
		color: var(--text-primary);
	}
	.log {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.log li {
		display: grid;
		grid-template-columns: 1.5rem 1fr;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.log li.bad {
		border-color: var(--accent-measure);
	}
	.log li.skip {
		color: var(--text-secondary);
		border-style: dashed;
	}
	.mk {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}
</style>
