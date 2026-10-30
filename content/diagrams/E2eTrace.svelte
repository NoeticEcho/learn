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
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });
	import { onMount } from 'svelte';

	let action = $state(t('Записаться', 'Book'));
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
		{ id: 'label', label: t('У поля телефона пропала подпись', 'The phone field lost its label'), step: 3, roleMsg: t('getByLabel(«Телефон»): элемент не найден', 'getByLabel(“Phone”): element not found'), cssMsg: null, hint: t('Тест по подписи нашёл настоящий дефект доступности. Тест по классу его бы пропустил.', 'The test that finds by label found a real accessibility defect. A test that finds by class would have missed it.') },
		{ id: 'banner', label: t('Баннер cookie перекрыл кнопку отправки', 'The cookie banner covers the submit button'), step: 4, roleMsg: t('клик по кнопке: другой элемент перехватывает нажатие (баннер)', 'click on the button: another element intercepts the click (the banner)'), cssMsg: t('клик по кнопке: другой элемент перехватывает нажатие (баннер)', 'click on the button: another element intercepts the click (the banner)'), hint: t('Оба теста нашли дефект, который видел бы и человек.', 'Both tests found a defect a person would have seen too.') },
		{ id: 'server', label: t('Сервер отвечает ошибкой 500 при отправке', 'The server answers with a 500 error on submit'), step: 5, roleMsg: t('ожидалось сообщение «Спасибо», а на странице «Ошибка сервера»', 'expected the message “Thank you,” but the page says “Server error”'), cssMsg: t('ожидалось сообщение «Спасибо», а на странице «Ошибка сервера»', 'expected the message “Thank you,” but the page says “Server error”'), hint: t('Заявки не доходят, а страница выглядит нормально. Без теста вы бы об этом не узнали.', 'Inquiries don’t arrive, though the page looks fine. Without a test you would never know.') },
		{ id: 'class', label: t('Разработчик переименовал класс кнопки, внешне всё то же', 'A developer renamed the button’s class, and visually it is the same'), step: 4, roleMsg: '', cssMsg: t('селектор .btn-primary не нашёл ни одного элемента', 'the selector .btn-primary found no elements'), harmless: true, hint: t('Ложная тревога: сайт цел, а тест по классу упал. Такие тесты называют хрупкими.', 'A false alarm: the site is fine and the class-based test failed. Such tests are called brittle.') }
	];
	let on = $state<Record<string, boolean>>({ label: false, banner: false, server: false, class: false });
	let byRole = $state(true);
	let ran = $state(false);

	const steps = $derived([
		t('Открыть главную страницу', 'Open the home page'),
		byRole ? t(`Найти ссылку «${action}» по роли и имени и нажать`, `Find the link “${action}” by role and name and click it`) : t('Найти элемент по селектору .btn-primary и нажать', 'Find the element by the selector .btn-primary and click it'),
		byRole ? t('Найти поле «Телефон» по подписи и ввести номер', 'Find the “Phone” field by its label and type a number') : t('Найти поле по селектору #phone и ввести номер', 'Find the field by the selector #phone and type a number'),
		byRole ? t(`Нажать кнопку «${action}» (найти по роли и имени)`, `Click the “${action}” button (found by role and name)`) : t('Нажать кнопку по селектору .btn-send', 'Click the button by the selector .btn-send'),
		t('Дождаться сообщения «Спасибо» (роль status)', 'Wait for the message “Thank you” (role status)')
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
	<figcaption>{t('Что скажет сквозной тест', 'What an end-to-end test will say')}</figcaption>
	<p class="dg-out">{t('Тест проходит главное действие сайта так, как его проходит человек. Сломайте сайт любым способом, выберите, как тест ищет элементы, и запустите.', 'The test walks the site’s main action the way a person does. Break the site in any way, choose how the test finds elements, and run it.')}</p>

	<fieldset class="bugs">
		<legend>{t('Сломать сайт', 'Break the site')}</legend>
		{#each bugs as b (b.id)}
			<label><input type="checkbox" bind:checked={on[b.id]} onchange={() => (ran = false)} /> {b.label}</label>
		{/each}
	</fieldset>

	<div class="dg-ctl" role="radiogroup" aria-label={t('Как тест ищет элементы', 'How the test finds elements')}>
		<button type="button" role="radio" aria-checked={byRole} class:on={byRole} onclick={() => { byRole = true; ran = false; }}>{t('По роли и подписи', 'By role and label')}</button>
		<button type="button" role="radio" aria-checked={!byRole} class:on={!byRole} onclick={() => { byRole = false; ran = false; }}>{t('По CSS-классу', 'By CSS class')}</button>
		<button type="button" onclick={() => (ran = true)}>{t('Запустить тест', 'Run the test')}</button>
	</div>

	<ol class="log">
		{#each steps as s, i (i)}
			{@const stopAt = fail ? fail.step : 99}
			<li class:bad={ran && fail && i + 1 === stopAt} class:skip={ran && fail && i + 1 > stopAt}>
				<span class="mk" aria-hidden="true">{ran ? (fail ? (i + 1 < stopAt ? '✓' : i + 1 === stopAt ? '✕' : '–') : '✓') : '·'}</span>
				<span>{s}{#if ran && fail && i + 1 === stopAt}<br /><strong>{t('Ошибка:', 'Error:')}</strong> {fail.msg}{/if}{#if ran && fail && i + 1 > stopAt}{t('\u00a0(пропущен)', '\u00a0(skipped)')}{/if}</span>
			</li>
		{/each}
	</ol>

	<p class="dg-out" aria-live="polite">
		{#if !ran}{t('Нажмите «Запустить тест».', 'Press “Run the test.”')}
		{:else if !fail && missed.length === 0}<strong>{t('Тест прошёл.', 'The test passed.')}</strong> {t('Сайт работает по сценарию.', 'The site works as scripted.')}
		{:else if fail}<strong>{t('Тест упал на шаге', 'The test failed at step')} {fail.step === 2 && fail.b.harmless ? 2 : fail.step}.</strong> {fail.b.hint}
		{/if}
		{#if missed.length}<br /><strong>{t('Пропущено тестом:', 'Missed by the test:')}</strong> {missed.map((m) => m.label.toLowerCase()).join('; ')}. {missed[0].hint}{/if}
		{#if falseAlarm}<br />{t('Это ложная тревога: сайт для человека не изменился.', 'This is a false alarm: for a person the site has not changed.')}{/if}
	</p>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('схема запускает условный тест из пяти шагов. Тест, который ищет элементы по роли и подписи, замечает пропавшую подпись поля, перекрытую кнопку и ошибку сервера и не реагирует на переименование класса. Тест по CSS-классу пропускает пропавшую подпись и падает на безобидном переименовании класса.', 'the diagram runs an imaginary test of five steps. A test that finds elements by role and label notices a vanished field label, a covered button and a server error, and doesn’t react to a renamed class. A test by CSS class misses the vanished label and fails on a harmless class rename.')}</p>
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
