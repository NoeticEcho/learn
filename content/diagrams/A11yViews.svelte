<!--
	«Одна страница, три способа её пройти» (part 15, lesson 2). Nine defects of a small contact page,
	each tied to a WCAG 2.2 success criterion. The person switches the view (what the eyes and a
	finger meet, what the Tab key meets, what a screen reader says) and fixes defects one by one; the
	counter shows how many of the nine criteria the page now meets. The same defect looks different
	from each side, which is the point: one check never covers all three.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, «English edition»): the Russian stays as written. */
	const t = (ru: string, en: string) => pick({ ru, en });

	type View = 'eyes' | 'keys' | 'reader';
	type Defect = {
		id: string;
		sc: string;
		level: 'A' | 'AA';
		name: string;
		fresh?: boolean;
		fix: string;
		before: Record<View, string>;
		after: Record<View, string>;
		fixed: boolean;
	};

	const views: { id: View; label: string }[] = [
		{ id: 'eyes', label: t('Глаза и палец', 'Eyes and finger') },
		{ id: 'keys', label: t('Только клавиатура', 'Keyboard only') },
		{ id: 'reader', label: t('Диктор', 'Screen reader') }
	];
	let view = $state<View>('eyes');

	let defects = $state<Defect[]>([
		{
			id: 'contrast', sc: '1.4.3', level: 'AA', name: t('Контраст текста', 'Text contrast'), fix: t('Тёмно-серый текст с контрастом выше 4,5 к 1', 'Dark gray text with a contrast above 4.5 to 1'),
			before: { eyes: t('Светло-серый текст на белом, контраст 2 к 1. На солнце его не прочесть.', 'Light gray text on white, a contrast of 2 to 1. It cannot be read in sunlight.'), keys: t('Клавиатура с цветом не связана: здесь без отличий.', 'The keyboard has nothing to do with color: no difference here.'), reader: t('Диктор читает слова так же: людям, которые его слушают, это не мешает.', 'A screen reader reads the words the same way: the people listening to it aren’t bothered.') },
			after: { eyes: t('Тёмно-серый текст, контраст около 7 к 1. Читается и при ярком свете.', 'Dark gray text, a contrast of about 7 to 1. It reads even in bright light.'), keys: t('Без отличий.', 'No difference.'), reader: t('Без отличий.', 'No difference.') },
			fixed: false
		},
		{
			id: 'alt', sc: '1.1.1', level: 'A', name: t('Текстовая альтернатива', 'Text alternative'), fix: t('Осмысленный alt у изображения документа', 'A meaningful alt on the document image'),
			before: { eyes: t('Скан документа виден.', 'The scan of the document is visible.'), keys: t('Без отличий.', 'No difference.'), reader: t('Диктор: «Изображение, IMG_2041.jpg». Что на нём, неизвестно.', 'Screen reader: “Image, IMG_2041.jpg.” What is in it is not known.') },
			after: { eyes: t('Скан виден так же.', 'The scan is visible as before.'), keys: t('Без отличий.', 'No difference.'), reader: t('Диктор: «Изображение, скан диплома кадастрового инженера».', 'Screen reader: “Image, scan of a surveyor’s license.”') },
			fixed: false
		},
		{
			id: 'label', sc: '3.3.2', level: 'A', name: t('Подпись поля', 'Field label'), fix: t('Видимая подпись label, связанная с полем', 'A visible label tied to the field'),
			before: { eyes: t('Подсказка только внутри поля: начали печатать, и она исчезла.', 'The hint is only inside the field: you start typing and it vanishes.'), keys: t('Фокус на поле есть, но что вводить, уже не видно.', 'The field has focus, but what to enter is no longer visible.'), reader: t('Диктор: «Поле ввода, изменяемое». Что вводить, не сказано.', 'Screen reader: “Edit text, blank.” What to enter isn’t said.') },
			after: { eyes: t('Подпись «Телефон» стоит над полем и не исчезает.', 'The label “Phone” sits above the field and doesn’t vanish.'), keys: t('Подпись остаётся перед глазами.', 'The label stays in front of your eyes.'), reader: t('Диктор: «Телефон, поле ввода».', 'Screen reader: “Phone, edit text.”') },
			fixed: false
		},
		{
			id: 'focus', sc: '2.4.7', level: 'AA', name: t('Видимый фокус', 'Visible focus'), fix: t('Заметная рамка :focus-visible', 'A noticeable :focus-visible ring'),
			before: { eyes: t('Без отличий для мыши.', 'No difference for a mouse.'), keys: t('Нажали Tab: рамки нет. Где вы на странице, непонятно.', 'You press Tab: there is no ring. Where you are on the page is unclear.'), reader: t('Диктор объявляет элемент, но зрячий помощник не видит, где вы.', 'The screen reader announces the element, but a sighted helper can’t see where you are.') },
			after: { eyes: t('Без отличий для мыши.', 'No difference for a mouse.'), keys: t('Вокруг элемента в фокусе яркая рамка в два пикселя и больше.', 'A bright ring of two pixels or more surrounds the focused element.'), reader: t('Диктор объявляет элемент, рамка видна.', 'The screen reader announces the element, and the ring is visible.') },
			fixed: false
		},
		{
			id: 'obscured', sc: '2.4.11', level: 'AA', name: t('Фокус не закрыт', 'Focus not obscured'), fresh: true, fix: t('scroll-padding-top на высоту фиксированной шапки', 'scroll-padding-top equal to the height of the fixed header'),
			before: { eyes: t('Фиксированная шапка закрывает верх экрана.', 'The fixed header covers the top of the screen.'), keys: t('Tab перенёс фокус на поле, а оно спрятано под шапкой: целиком не видно.', 'Tab moved the focus to a field, and it is hidden under the header: not visible in full.'), reader: t('Диктор говорит про поле, зрячему не видно.', 'The screen reader speaks about the field, but a sighted person can’t see it.') },
			after: { eyes: t('Шапка на месте.', 'The header stays in place.'), keys: t('Страница прокручена так, что поле в фокусе видно целиком.', 'The page scrolls so that the focused field is fully visible.'), reader: t('Без отличий.', 'No difference.') },
			fixed: false
		},
		{
			id: 'target', sc: '2.5.8', level: 'AA', name: t('Размер цели', 'Target size'), fresh: true, fix: t('Не меньше 24 на 24 пикселя, лучше 44', 'At least 24 by 24 pixels, better 44'),
			before: { eyes: t('Крестик «закрыть» 16 на 16 пикселей. Пальцем попасть трудно, мышью с дрожью почти невозможно.', 'The “close” cross is 16 by 16 pixels. Hard to hit with a finger, nearly impossible with a mouse in a shaky hand.'), keys: t('Без отличий.', 'No difference.'), reader: t('Без отличий.', 'No difference.') },
			after: { eyes: t('Кнопка 44 на 44 пикселя: попадает палец.', 'The button is 44 by 44 pixels: a finger lands on it.'), keys: t('Без отличий.', 'No difference.'), reader: t('Без отличий.', 'No difference.') },
			fixed: false
		},
		{
			id: 'lang', sc: '3.1.2', level: 'AA', name: t('Язык фрагмента', 'Language of a part'), fix: t('lang="en" на английском абзаце и lang="ru" на странице', 'lang=en on the page and lang=ru on the Russian paragraph'),
			before: { eyes: t('Без отличий.', 'No difference.'), keys: t('Без отличий.', 'No difference.'), reader: t('Русский текст читает английский голос, английский абзац читается по слогам русским.', 'An English voice reads the Russian text, and the Russian paragraph is read syllable by syllable.') },
			after: { eyes: t('Без отличий.', 'No difference.'), keys: t('Без отличий.', 'No difference.'), reader: t('Диктор переключает голос на каждом абзаце.', 'The screen reader switches voice on each paragraph.') },
			fixed: false
		},
		{
			id: 'status', sc: '4.1.3', level: 'AA', name: t('Сообщение о состоянии', 'Status message'), fix: t('Контейнер сообщения с role="status" или "alert"', 'A message container with role=status or role=alert'),
			before: { eyes: t('После ошибки под полем появляется красный текст.', 'After an error, red text appears under the field.'), keys: t('Фокус остался на кнопке, сообщение где-то ниже.', 'The focus stayed on the button, and the message is somewhere lower.'), reader: t('Диктор молчит: он не знает, что на странице что-то появилось.', 'The screen reader is silent: it doesn’t know that something appeared on the page.') },
			after: { eyes: t('Тот же красный текст и значок.', 'The same red text and an icon.'), keys: t('Фокус там же, но сообщение объявлено.', 'The focus is in the same place, but the message is announced.'), reader: t('Диктор сразу говорит: «Введите телефон».', 'The screen reader says at once: “Enter your phone.”') },
			fixed: false
		},
		{
			id: 'auth', sc: '3.3.8', level: 'AA', name: t('Доступный вход', 'Accessible authentication'), fresh: true, fix: t('Разрешить вставку и автозаполнение пароля', 'Allow pasting and autofilling the password'),
			before: { eyes: t('Поле пароля запрещает вставку: нужно помнить и набирать.', 'The password field forbids pasting: you have to remember and type.'), keys: t('Менеджер паролей не может ничего подставить.', 'A password manager can fill in nothing.'), reader: t('Менеджер паролей и диктор не могут помочь.', 'Neither a password manager nor a screen reader can help.') },
			after: { eyes: t('Пароль можно вставить из менеджера.', 'The password can be pasted from a manager.'), keys: t('Менеджер паролей подставляет значение.', 'The password manager fills in the value.'), reader: t('Диктор объявляет поле «Пароль», вход проходит.', 'The screen reader announces the field “Password,” and login goes through.') },
			fixed: false
		}
	]);

	const met = $derived(defects.filter((d) => d.fixed).length);
</script>

<figure class="dg">
	<figcaption>{t('Одна страница, три способа её пройти', 'One page, three ways to walk it')}</figcaption>
	<p class="dg-out">{t('Контактная страница с девятью недочётами. Выберите, как её проходите, и исправляйте по одному. Метка «WCAG 2.2» отмечает критерии, которые появились в версии 2.2.', 'A contact page with nine faults. Choose how you walk through it and fix them one at a time. The “WCAG 2.2” tag marks criteria that appeared in version 2.2.')}</p>

	<div class="dg-ctl" role="radiogroup" aria-label={t('Способ прохода', 'Way of walking')}>
		{#each views as v (v.id)}
			<button type="button" role="radio" aria-checked={view === v.id} class:on={view === v.id} onclick={() => (view = v.id)}>{v.label}</button>
		{/each}
	</div>

	<ul class="list">
		{#each defects as d (d.id)}
			<li class:ok={d.fixed}>
				<div class="head">
					<label>
						<input type="checkbox" bind:checked={d.fixed} />
						<span><strong>{d.sc} {d.name}</strong> {t('(уровень', '(level')} {d.level}){#if d.fresh} <span class="tag">WCAG 2.2</span>{/if}</span>
					</label>
				</div>
				<p class="seen" aria-live="polite">{d.fixed ? d.after[view] : d.before[view]}</p>
				{#if d.fixed}<p class="dim">{t('Исправлено:', 'Fixed:')} {d.fix}.</p>{/if}
			</li>
		{/each}
	</ul>

	<p class="dg-out" aria-live="polite"><strong>{t('Выполнено критериев:', 'Criteria met:')} {met} {t('из', 'of')} {defects.length}.</strong>
		{#if met === defects.length}{t('Страница прошла эти девять. Но это девять из пятидесяти пяти критериев уровней A и AA, поэтому проверка на этом не заканчивается.', 'The page passes these nine. But they are nine of the fifty-five criteria at levels A and AA, so the check does not end here.')}{:else}{t('Каждый недочёт виден лишь с одной-двух сторон: проверять нужно всеми тремя способами.', 'Each fault shows from only one or two sides: you need to check all three ways.')}{/if}</p>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('схема перечисляет девять недочётов контактной страницы и для каждого описывает, как он выглядит для глаз и пальца, для клавиатуры и для диктора, до исправления и после. Низкий контраст видят только глаза, отсутствие рамки фокуса мешает клавиатуре, а подпись поля и сообщения об ошибке важны диктору.', 'the diagram lists nine faults of a contact page and describes, for each, how it looks to the eyes and finger, to the keyboard and to a screen reader, before the fix and after. Low contrast is seen only by the eyes, a missing focus ring bothers the keyboard, and the field label and error messages matter to the screen reader.')}</p>
</figure>

<style>
	.list {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.list li {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-2) var(--space-3);
	}
	.list li.ok {
		border-color: var(--accent-measure);
	}
	.head label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: center;
		min-height: var(--hit-min);
	}
	.tag {
		margin-left: var(--space-1);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-brass);
		font-size: 0.85em;
	}
	.seen {
		margin: var(--space-1) 0 0;
		color: var(--text-body);
	}
	.dim {
		margin: var(--space-1) 0 0;
		color: var(--text-secondary);
	}
</style>
