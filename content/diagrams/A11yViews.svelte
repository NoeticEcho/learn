<!--
	«Одна страница, три способа её пройти» (part 15, lesson 2). Nine defects of a small contact page,
	each tied to a WCAG 2.2 success criterion. The person switches the view (what the eyes and a
	finger meet, what the Tab key meets, what a screen reader says) and fixes defects one by one; the
	counter shows how many of the nine criteria the page now meets. The same defect looks different
	from each side, which is the point: one check never covers all three.
-->
<script lang="ts">
	import './shared.css';

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
		{ id: 'eyes', label: 'Глаза и палец' },
		{ id: 'keys', label: 'Только клавиатура' },
		{ id: 'reader', label: 'Диктор' }
	];
	let view = $state<View>('eyes');

	let defects = $state<Defect[]>([
		{
			id: 'contrast', sc: '1.4.3', level: 'AA', name: 'Контраст текста', fix: 'Тёмно-серый текст с контрастом выше 4,5 к 1',
			before: { eyes: 'Светло-серый текст на белом, контраст 2 к 1. На солнце его не прочесть.', keys: 'Клавиатура с цветом не связана: здесь без отличий.', reader: 'Диктор читает слова так же: людям, которые его слушают, это не мешает.' },
			after: { eyes: 'Тёмно-серый текст, контраст около 7 к 1. Читается и при ярком свете.', keys: 'Без отличий.', reader: 'Без отличий.' },
			fixed: false
		},
		{
			id: 'alt', sc: '1.1.1', level: 'A', name: 'Текстовая альтернатива', fix: 'Осмысленный alt у изображения документа',
			before: { eyes: 'Скан документа виден.', keys: 'Без отличий.', reader: 'Диктор: «Изображение, IMG_2041.jpg». Что на нём, неизвестно.' },
			after: { eyes: 'Скан виден так же.', keys: 'Без отличий.', reader: 'Диктор: «Изображение, скан диплома кадастрового инженера».' },
			fixed: false
		},
		{
			id: 'label', sc: '3.3.2', level: 'A', name: 'Подпись поля', fix: 'Видимая подпись label, связанная с полем',
			before: { eyes: 'Подсказка только внутри поля: начали печатать, и она исчезла.', keys: 'Фокус на поле есть, но что вводить, уже не видно.', reader: 'Диктор: «Поле ввода, изменяемое». Что вводить, не сказано.' },
			after: { eyes: 'Подпись «Телефон» стоит над полем и не исчезает.', keys: 'Подпись остаётся перед глазами.', reader: 'Диктор: «Телефон, поле ввода».' },
			fixed: false
		},
		{
			id: 'focus', sc: '2.4.7', level: 'AA', name: 'Видимый фокус', fix: 'Заметная рамка :focus-visible',
			before: { eyes: 'Без отличий для мыши.', keys: 'Нажали Tab: рамки нет. Где вы на странице, непонятно.', reader: 'Диктор объявляет элемент, но зрячий помощник не видит, где вы.' },
			after: { eyes: 'Без отличий для мыши.', keys: 'Вокруг элемента в фокусе яркая рамка в два пикселя и больше.', reader: 'Диктор объявляет элемент, рамка видна.' },
			fixed: false
		},
		{
			id: 'obscured', sc: '2.4.11', level: 'AA', name: 'Фокус не закрыт', fresh: true, fix: 'scroll-padding-top на высоту фиксированной шапки',
			before: { eyes: 'Фиксированная шапка закрывает верх экрана.', keys: 'Tab перенёс фокус на поле, а оно спрятано под шапкой: целиком не видно.', reader: 'Диктор говорит про поле, зрячему не видно.' },
			after: { eyes: 'Шапка на месте.', keys: 'Страница прокручена так, что поле в фокусе видно целиком.', reader: 'Без отличий.' },
			fixed: false
		},
		{
			id: 'target', sc: '2.5.8', level: 'AA', name: 'Размер цели', fresh: true, fix: 'Не меньше 24 на 24 пикселя, лучше 44',
			before: { eyes: 'Крестик «закрыть» 16 на 16 пикселей. Пальцем попасть трудно, мышью с дрожью почти невозможно.', keys: 'Без отличий.', reader: 'Без отличий.' },
			after: { eyes: 'Кнопка 44 на 44 пикселя: попадает палец.', keys: 'Без отличий.', reader: 'Без отличий.' },
			fixed: false
		},
		{
			id: 'lang', sc: '3.1.2', level: 'AA', name: 'Язык фрагмента', fix: 'lang="en" на английском абзаце и lang="ru" на странице',
			before: { eyes: 'Без отличий.', keys: 'Без отличий.', reader: 'Русский текст читает английский голос, английский абзац читается по слогам русским.' },
			after: { eyes: 'Без отличий.', keys: 'Без отличий.', reader: 'Диктор переключает голос на каждом абзаце.' },
			fixed: false
		},
		{
			id: 'status', sc: '4.1.3', level: 'AA', name: 'Сообщение о состоянии', fix: 'Контейнер сообщения с role="status" или "alert"',
			before: { eyes: 'После ошибки под полем появляется красный текст.', keys: 'Фокус остался на кнопке, сообщение где-то ниже.', reader: 'Диктор молчит: он не знает, что на странице что-то появилось.' },
			after: { eyes: 'Тот же красный текст и значок.', keys: 'Фокус там же, но сообщение объявлено.', reader: 'Диктор сразу говорит: «Введите телефон».' },
			fixed: false
		},
		{
			id: 'auth', sc: '3.3.8', level: 'AA', name: 'Доступный вход', fresh: true, fix: 'Разрешить вставку и автозаполнение пароля',
			before: { eyes: 'Поле пароля запрещает вставку: нужно помнить и набирать.', keys: 'Менеджер паролей не может ничего подставить.', reader: 'Менеджер паролей и диктор не могут помочь.' },
			after: { eyes: 'Пароль можно вставить из менеджера.', keys: 'Менеджер паролей подставляет значение.', reader: 'Диктор объявляет поле «Пароль», вход проходит.' },
			fixed: false
		}
	]);

	const met = $derived(defects.filter((d) => d.fixed).length);
</script>

<figure class="dg">
	<figcaption>Одна страница, три способа её пройти</figcaption>
	<p class="dg-out">Контактная страница с девятью недочётами. Выберите, как её проходите, и исправляйте по одному. Метка «WCAG 2.2» отмечает критерии, которые появились в версии 2.2.</p>

	<div class="dg-ctl" role="radiogroup" aria-label="Способ прохода">
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
						<span><strong>{d.sc} {d.name}</strong> (уровень {d.level}){#if d.fresh} <span class="tag">WCAG 2.2</span>{/if}</span>
					</label>
				</div>
				<p class="seen" aria-live="polite">{d.fixed ? d.after[view] : d.before[view]}</p>
				{#if d.fixed}<p class="dim">Исправлено: {d.fix}.</p>{/if}
			</li>
		{/each}
	</ul>

	<p class="dg-out" aria-live="polite"><strong>Выполнено критериев: {met} из {defects.length}.</strong>
		{#if met === defects.length}Страница прошла эти девять. Но это девять из пятидесяти пяти критериев уровней A и AA, поэтому проверка на этом не заканчивается.{:else}Каждый недочёт виден лишь с одной-двух сторон: проверять нужно всеми тремя способами.{/if}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> схема перечисляет девять недочётов контактной страницы и для каждого описывает, как он выглядит для глаз и пальца, для клавиатуры и для диктора, до исправления и после. Низкий контраст видят только глаза, отсутствие рамки фокуса мешает клавиатуре, а подпись поля и сообщения об ошибке важны диктору.</p>
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
