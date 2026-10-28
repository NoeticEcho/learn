<!--
	«Один проект, восемь визуальных эпох» (part 4, lesson 1). The same card, with the person's own
	words, drawn in the manner of each period of web design. Every look is drawn here in plain CSS
	(nothing is copied from a real site); each carries the reason it appeared: a technology, a
	screen or a fashion.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Look = { id: string; year: string; name: string; cause: string; kept: string; gone: string; stage: string; card: string; h: string; p: string; li: string; btn: string; note?: string };

	const base: Look[] = [
		{
			id: '1996', year: '1996', name: 'Таблицы и серый фон',
			cause: 'Технология: CSS ещё нет или он не работает одинаково, и раскладку делают таблицами, а промежутки прозрачными картинками-распорками.',
			kept: 'Простота и скорость: страница лёгкая и открывается везде.',
			gone: 'Раскладка зашита в разметку, мобильных экранов нет, смысла в таблице-каркасе тоже нет.',
			stage: 'background:#c0c0c0;padding:12px;font-family:"Times New Roman",serif;color:#000',
			card: 'background:#c0c0c0;border:2px outset #fff;padding:10px',
			h: 'font-size:26px;font-weight:bold;margin:0 0 8px;font-family:"Times New Roman",serif;color:#000080',
			p: 'margin:0 0 8px;font-size:15px',
			li: 'border-bottom:1px solid #808080;padding:3px 0;font-size:15px',
			btn: 'background:#c0c0c0;border:2px outset #fff;color:#000;font:14px Arial,sans-serif;padding:4px 10px;cursor:pointer'
		},
		{
			id: '2000', year: '2000', name: 'Заставка и Flash',
			cause: 'Технология: плагин Flash даёт анимацию и звук, и первую страницу делают «киношной» заставкой с кнопкой «пропустить».',
			kept: 'Желание сразу задать настроение.',
			gone: 'Посетитель ждёт, а не читает; поисковик и экранный диктор видят пустоту; на телефонах плагина нет.',
			stage: 'background:#000;padding:14px;font-family:Verdana,sans-serif;color:#ffcc00',
			card: 'border:1px solid #ffcc00;padding:12px;background:#111',
			h: 'font-size:24px;letter-spacing:6px;text-transform:uppercase;margin:0 0 8px;color:#ffcc00;font-weight:normal',
			p: 'margin:0 0 8px;font-size:13px;color:#eee',
			li: 'padding:3px 0;font-size:13px;color:#eee',
			btn: 'background:#000;border:1px solid #ffcc00;color:#ffcc00;font:12px Verdana,sans-serif;padding:4px 10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer',
			note: 'Вход • Пропустить заставку'
		},
		{
			id: '2008', year: '2008', name: 'Веб 2.0 и скевоморфизм',
			cause: 'Технология и мода: CSS научился скруглять углы и рисовать тени, а графика подражает вещам: кожа, стекло, блик на кнопке.',
			kept: 'Кнопка должна выглядеть нажимаемой.',
			gone: 'Блики и текстуры шумят, тяжело грузятся и быстро выходят из моды.',
			stage: 'background:linear-gradient(#e6eef7,#c9d9ec);padding:14px;font-family:"Lucida Grande",Verdana,sans-serif;color:#223',
			card: 'background:linear-gradient(#fff,#eef3f9);border:1px solid #9bb;border-radius:12px;padding:14px;box-shadow:0 3px 8px rgba(0,0,0,.3)',
			h: 'font-size:24px;margin:0 0 8px;color:#1b3c68;text-shadow:0 1px 0 #fff',
			p: 'margin:0 0 8px;font-size:14px',
			li: 'padding:4px 0;font-size:14px;border-bottom:1px dotted #9bb',
			btn: 'background:linear-gradient(#7cc4ff,#1f7ad6);border:1px solid #165ea6;border-radius:14px;color:#fff;font:bold 14px Verdana,sans-serif;padding:6px 16px;text-shadow:0 -1px 0 #14538f;box-shadow:inset 0 1px 0 rgba(255,255,255,.7);cursor:pointer'
		},
		{
			id: '2013', year: '2013', name: 'Плоский дизайн',
			cause: 'Экран: телефоны с разной плотностью пикселей, и блики с тенями мешают. Цвет, шрифт и пустое место делают всю работу.',
			kept: 'Меньше украшений: внимание на содержании. Адаптивность.',
			gone: 'Перегибы: кнопка неотличима от надписи, а у ссылок нет признака «нажимаемо». NN/g писали об этом сразу.',
			stage: 'background:#fff;padding:14px;font-family:"Helvetica Neue",Arial,sans-serif;color:#2c3e50',
			card: 'background:#ecf0f1;padding:14px',
			h: 'font-size:28px;font-weight:300;margin:0 0 8px;color:#2c3e50',
			p: 'margin:0 0 8px;font-size:14px;color:#34495e',
			li: 'padding:6px 8px;margin:0 0 4px;font-size:14px;background:#3498db;color:#fff',
			btn: 'background:#e74c3c;border:0;color:#fff;font:bold 14px Arial,sans-serif;padding:8px 18px;cursor:pointer'
		},
		{
			id: '2018', year: '2018', name: 'Material: бумага и тень',
			cause: 'Система: Google в 2014 году описал мир «листов бумаги» с высотой и тенью. Появилась общая грамматика для всех приложений.',
			kept: 'Тень как язык: что выше, то важнее. Сетка, шаг отступов, состояния.',
			gone: 'Одинаковые карточки и кнопки заглавными буквами на тысячах сайтов.',
			stage: 'background:#fafafa;padding:14px;font-family:Roboto,Arial,sans-serif;color:#212121',
			card: 'background:#fff;border-radius:4px;padding:16px;box-shadow:0 2px 4px rgba(0,0,0,.2),0 1px 10px rgba(0,0,0,.12)',
			h: 'font-size:24px;font-weight:500;margin:0 0 8px;color:#212121',
			p: 'margin:0 0 8px;font-size:14px;color:#555',
			li: 'padding:8px 0;font-size:14px;border-bottom:1px solid #e0e0e0',
			btn: 'background:#6200ee;border:0;border-radius:4px;color:#fff;font:500 14px Roboto,Arial,sans-serif;letter-spacing:1.25px;text-transform:uppercase;padding:10px 18px;box-shadow:0 2px 4px rgba(0,0,0,.3);cursor:pointer'
		},
		{
			id: '2021', year: '2021', name: 'Стекло и неоморфизм',
			cause: 'Мода и железо: размытие фона стало дешёвым, и интерфейс стал «матовым стеклом» или «выдавленным из пластика».',
			kept: 'Слои и глубина, если они объясняют, что над чем.',
			gone: 'Низкий контраст: края и тексты сливаются. Для слабовидящих такие страницы нечитаемы.',
			stage: 'background:linear-gradient(135deg,#7f7fd5,#86a8e7 50%,#91eae4);padding:14px;font-family:Inter,Arial,sans-serif;color:#10213f',
			card: 'background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.6);border-radius:18px;padding:16px;backdrop-filter:blur(10px)',
			h: 'font-size:26px;font-weight:600;margin:0 0 8px;color:#10213f',
			p: 'margin:0 0 8px;font-size:14px;color:#10213f',
			li: 'padding:7px 10px;margin:0 0 6px;font-size:14px;background:rgba(255,255,255,.4);border-radius:10px',
			btn: 'background:#10213f;border:0;border-radius:12px;color:#fff;font:600 14px Inter,Arial,sans-serif;padding:9px 18px;cursor:pointer'
		},
		{
			id: 'brutal', year: 'с 2014', name: 'Брутализм',
			cause: 'Протест: ответ на одинаковые гладкие шаблоны. Системный шрифт, жёсткие рамки, сырая сетка, нарочитая «неотделанность».',
			kept: 'Честность: страница ничего не изображает, она читается.',
			gone: 'Как стиль для большинства проектов не годится: выглядит как позиция, а не как забота о посетителе.',
			stage: 'background:#fff;padding:14px;font-family:"Courier New",monospace;color:#000',
			card: 'border:3px solid #000;padding:12px;background:#fff',
			h: 'font-size:26px;font-weight:900;margin:0 0 8px;text-transform:uppercase;font-family:Arial Black,Arial,sans-serif',
			p: 'margin:0 0 8px;font-size:14px',
			li: 'border-top:3px solid #000;padding:5px 0;font-size:14px',
			btn: 'background:#ff0;border:3px solid #000;color:#000;font:bold 14px "Courier New",monospace;padding:6px 14px;box-shadow:4px 4px 0 #000;cursor:pointer'
		},
		{
			id: '2025', year: '2025', name: 'Сегодняшняя сдержанность',
			cause: 'Накопленный опыт: переменные шрифты, токены, светлая и тёмная темы, крупный текст, одно сильное действие и много воздуха.',
			kept: 'Всё полезное из предыдущего: сетка, состояния, слои только когда нужны.',
			gone: 'Пока ничего. Но через десять лет что-то из этого тоже будет датировать страницу.',
			stage: 'background:#faf9f7;padding:18px;font-family:"IBM Plex Sans",system-ui,sans-serif;color:#1c1b19',
			card: 'background:transparent;padding:6px 2px',
			h: 'font-size:32px;font-weight:600;line-height:1.1;margin:0 0 12px;color:#1c1b19;letter-spacing:-0.01em',
			p: 'margin:0 0 14px;font-size:16px;line-height:1.5;max-width:46ch;color:#4a4742',
			li: 'padding:9px 0;font-size:16px;border-top:1px solid #d9d5ce',
			btn: 'background:#1c1b19;border:0;border-radius:6px;color:#faf9f7;font:500 16px "IBM Plex Sans",system-ui,sans-serif;padding:12px 22px;cursor:pointer'
		}
	];

	// The English edition's words for each look (docs/content-plan/README.md, «English edition»):
	// the drawn CSS is shared, only the words change. The Russian rendering is `base` as it is.
	const EN: Record<string, Partial<Look>> = {
		'1996': {
			name: 'Tables and a gray background',
			cause: 'Technology: CSS barely exists or behaves differently in each browser, so layout is done with tables and the gaps are held open by transparent one-pixel images.',
			kept: 'Simplicity and speed: the page is light and opens anywhere.',
			gone: 'The layout is baked into the markup, there are no mobile screens, and the table that frames the page means nothing.'
		},
		'2000': {
			name: 'The splash page and Flash',
			cause: 'Technology: the Flash plugin brings animation and sound, so the first page becomes a “cinematic” intro with a “skip intro” button.',
			kept: 'The wish to set the mood at once.',
			gone: 'The visitor waits instead of reading, search engines and screen readers see nothing, and phones have no plugin.',
			note: 'Enter • Skip intro'
		},
		'2008': {
			name: 'Web 2.0 and skeuomorphism',
			cause: 'Technology and fashion: CSS learns rounded corners and shadows, and graphics imitate objects such as leather, glass and the gloss on a button.',
			kept: 'A button should look like something you can press.',
			gone: 'Gloss and textures are noisy, slow to load and quickly out of fashion.'
		},
		'2013': {
			name: 'Flat design',
			cause: 'Screen: phones with different pixel densities, where gloss and shadows get in the way. Color, type and empty space do all the work.',
			kept: 'Fewer decorations, so attention goes to the content. Responsiveness.',
			gone: 'The excesses: a button you can’t tell from a label, and links with no sign that they can be pressed. Nielsen Norman Group wrote about this at once.'
		},
		'2018': {
			name: 'Material: paper and shadow',
			cause: 'System: in 2014 Google described a world of “sheets of paper” with height and shadow. All apps got a common grammar.',
			kept: 'Shadow as a language: the higher, the more important. A grid, a spacing step, states.',
			gone: 'Identical cards and all-caps buttons on thousands of sites.'
		},
		'2021': {
			name: 'Glass and neumorphism',
			cause: 'Fashion and hardware: blurring the background became cheap, so interfaces turned into “frosted glass” or “pressed out of plastic”.',
			kept: 'Layers and depth, when they explain what is above what.',
			gone: 'Low contrast: edges and text blend together. For people with low vision such pages are unreadable.'
		},
		brutal: {
			year: 'from 2014',
			name: 'Brutalism',
			cause: 'Protest: an answer to identical smooth templates. A system font, hard borders, a raw grid and a deliberate lack of polish.',
			kept: 'Honesty: the page pretends to be nothing, so it reads well.',
			gone: 'As a style it doesn’t suit most projects: it looks like a position, not like care for the visitor.'
		},
		'2025': {
			name: 'Today’s restraint',
			cause: 'Accumulated experience: variable fonts, tokens, light and dark themes, large text, one strong action and plenty of air.',
			kept: 'Everything useful from before: the grid, the states, layers only when they are needed.',
			gone: 'Nothing yet. But in ten years something here will date the page too.'
		}
	};
	const over = pick({ ru: {} as Record<string, Partial<Look>>, en: EN });
	const looks: Look[] = base.map((l) => ({ ...l, ...over[l.id] }));
	const W = pick({
		ru: {
			title: 'Один проект, восемь визуальных эпох',
			era: 'Эпоха:',
			stage: 'Страница вашего проекта в манере',
			forWhom: 'Для кого:',
			kept: 'Что осталось верным.',
			gone: 'Что устарело.',
			fallback: { title: 'Ваш проект', forWhom: 'Для кого он', action: 'Что делает посетитель', items: ['Первый пункт', 'Второй пункт', 'Третий пункт'] }
		},
		en: {
			title: 'One project, eight visual eras',
			era: 'Era:',
			stage: 'Your project’s page in the manner of',
			forWhom: 'For:',
			kept: 'What is still right.',
			gone: 'What has aged.',
			fallback: { title: 'Your project', forWhom: 'Who it is for', action: 'What the visitor does', items: ['First item', 'Second item', 'Third item'] }
		}
	});

	let i = $state(0);
	let brief = $state({ ...W.fallback });

	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			const items = (p.items ?? []).map((x: { title: string }) => x.title).slice(0, 3);
			brief = { title: p.title, forWhom: p.forWhom, action: p.mainAction.label, items: items.length ? items : brief.items };
		} catch {
			/* the example words stay */
		}
	});

	const look = $derived(looks[i]);
</script>

<figure class="dg">
	<figcaption>{W.title}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.era}
			<input type="range" min="0" max={looks.length - 1} step="1" bind:value={i} aria-valuetext="{look.year}: {look.name}" />
		</label>
		<span class="years">
			{#each looks as l, k (l.id)}<button type="button" class:on={k === i} onclick={() => (i = k)} tabindex="-1">{l.year}</button>{/each}
		</span>
	</div>
	<div class="stage" style={look.stage} role="group" aria-label="{W.stage}: {look.name}">
		<div style={look.card}>
			{#if look.note}<p style="{look.p};font-size:11px;text-align:right">{look.note}</p>{/if}
			<h3 style={look.h}>{brief.title}</h3>
			<p style={look.p}>{W.forWhom} {brief.forWhom}</p>
			<ul class="items">
				{#each brief.items as it, k (k)}<li style={look.li}>{it}</li>{/each}
			</ul>
			<p style="margin:12px 0 0"><button type="button" style={look.btn} tabindex="-1">{brief.action}</button></p>
		</div>
	</div>
	<div class="dg-out" aria-live="polite">
		<p><strong>{look.year}: {look.name}.</strong> {look.cause}</p>
		<p><strong>{W.kept}</strong> {look.kept}</p>
		<p><strong>{W.gone}</strong> {look.gone}</p>
	</div>
</figure>

<style>
	.years {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}
	.stage {
		border: var(--line) solid var(--border-hairline);
		overflow: hidden;
	}
	.items {
		list-style: none;
		margin: 0;
		padding: 0 !important;
	}
	.dg-out p {
		margin: 0 0 var(--space-2);
	}
</style>
