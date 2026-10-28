<!--
	«Восемь эпох одного сайта» (part 16, lesson 8). The prologue promised the person's own site in
	every era and this is the answer: a slider across the eight eras of the course, with the
	person's own name and main action drawn in each era's manner, and, beside it, what the era's
	tools changed and what stayed the same. The drawings are a few lines of CSS per era, not
	screenshots, and the words are the person's own brief. The last era is not history but a
	direction (a brief, an interview, and a check by a person), and the page says so.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Era = { year: string; title: string; tool: string; changed: string; stayed: string; style: string; btn: string };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The CSS of each era is the same in both; the words are the edition's.
	const W = pick({
		ru: {
			fallback: { name: 'Мой проект', action: 'Оставить заявку' },
			eras: [
		{ year: '1996', title: 'Таблицы и тег font', tool: 'HTML-таблицы, GIF-счётчик, FTP', changed: 'Страница впервые стала вашей: любой мог выложить своё.', stayed: 'Текст, ссылка и название: то, зачем пришли.', style: 'background:#c0c0c0;color:#000;font-family:"Times New Roman",serif', btn: 'border:2px outset #fff;background:#d4d0c8;color:#000' },
		{ year: '2005', title: 'Отдельные стили', tool: 'CSS-файл, float, «веб 2.0»', changed: 'Содержимое и оформление разделились: один файл стилей на весь сайт.', stayed: 'Тот же текст и те же ссылки.', style: 'background:#eaf3ff;color:#123;font-family:Verdana,sans-serif', btn: 'background:linear-gradient(#6aa7ff,#2a6fd6);color:#fff;border:1px solid #1d4fa0;border-radius:6px' },
		{ year: '2010', title: 'WordPress', tool: 'Тема, плагины, панель владельца', changed: 'Править сайт мог не программист: появилась панель.', stayed: 'Содержимое по-прежнему ваше, а его надо обновлять.', style: 'background:#f4f4f0;color:#333;font-family:Georgia,serif', btn: 'background:#21759b;color:#fff;border-radius:3px' },
		{ year: '2014', title: 'Адаптивная вёрстка', tool: 'Flexbox, медиазапросы, mobile first', changed: 'Один сайт для любого экрана, телефон стал главным.', stayed: 'Главное действие должно быть видно сразу.', style: 'background:#fff;color:#222;font-family:system-ui,sans-serif', btn: 'background:#e8503a;color:#fff;border-radius:2px' },
		{ year: '2019', title: 'Генератор и Markdown', tool: 'Статические страницы из текстовых файлов и Git', changed: 'Сайт стал файлами в репозитории: версии, откат, скорость.', stayed: 'Ваши тексты: теперь это файлы Markdown.', style: 'background:#fafafa;color:#1a1a1a;font-family:Inter,system-ui,sans-serif', btn: 'background:#111;color:#fff;border-radius:4px' },
		{ year: '2022', title: 'Headless CMS и Jamstack', tool: 'Содержимое как API, сборка по вебхуку, CDN', changed: 'Содержимое отделилось от вида, сайт собирается и раздаётся с границы сети.', stayed: 'Что сказать и кому. Структура ваших данных.', style: 'background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif', btn: 'background:#38bdf8;color:#0f172a;border-radius:8px' },
		{ year: '2025', title: 'ИИ-конструктор', tool: 'Описание словами, код от модели, вайб-кодинг', changed: 'Страница получается за минуты, а ценность сместилась на проверку и конкретику.', stayed: 'Ответственность за факты, данные и доступность.', style: 'background:linear-gradient(135deg,#6d28d9,#2563eb);color:#fff;font-family:Inter,system-ui,sans-serif', btn: 'background:#fff;color:#4c1d95;border-radius:999px' },
		{ year: 'Дальше', title: 'Бриф, интервью и проверка', tool: 'Собеседник расспрашивает и собирает сайт и сервис; агенты как посетители', changed: 'Интерфейс становится диалогом и действием, а сайт частью сети агентов. Это направление, а не гарантия.', stayed: 'Бриф, факты, ваше понимание и подтверждение человека.', style: 'background:#f6f1e7;color:#2a2418;font-family:Georgia,serif', btn: 'background:#8a6a2f;color:#fff;border-radius:2px' }
	] as Era[],
			caption: 'Ваш сайт в восьми эпохах: что менялось и что осталось',
			era: 'Эпоха:',
			line: 'Одно и то же слово в каждой эпохе. Менялась только одежда.',
			tools: 'Инструменты:',
			changed: 'Что изменилось:',
			stayed: 'Что осталось:',
			outro: 'Пролог обещал: «Сейчас вы сделаете это сами». Вы сделали восемь версий своего проекта, и в галерее они лежат рядом. Посмотрите на них не как на музей, а как на ответ на вопрос: что в вашем деле осталось неизменным.'
		},
		en: {
			fallback: { name: 'My project', action: 'Get in touch' },
			eras: [
				{ year: '1996', title: 'Tables and the font tag', tool: 'HTML tables, a GIF counter, FTP', changed: 'For the first time a page could be yours: anyone could publish their own.', stayed: 'The text, the link and the name: what people came for.', style: 'background:#c0c0c0;color:#000;font-family:"Times New Roman",serif', btn: 'border:2px outset #fff;background:#d4d0c8;color:#000' },
				{ year: '2005', title: 'A separate stylesheet', tool: 'A CSS file, float, “web 2.0”', changed: 'Content and looks parted: one stylesheet for the whole site.', stayed: 'The same text and the same links.', style: 'background:#eaf3ff;color:#123;font-family:Verdana,sans-serif', btn: 'background:linear-gradient(#6aa7ff,#2a6fd6);color:#fff;border:1px solid #1d4fa0;border-radius:6px' },
				{ year: '2010', title: 'WordPress', tool: 'A theme, plugins, an owner’s dashboard', changed: 'Someone who wasn’t a programmer could edit the site: a dashboard appeared.', stayed: 'The content is still yours, and it has to be kept up to date.', style: 'background:#f4f4f0;color:#333;font-family:Georgia,serif', btn: 'background:#21759b;color:#fff;border-radius:3px' },
				{ year: '2014', title: 'Responsive layout', tool: 'Flexbox, media queries, mobile first', changed: 'One site for any screen, and the phone became the main one.', stayed: 'The main action has to be visible at once.', style: 'background:#fff;color:#222;font-family:system-ui,sans-serif', btn: 'background:#e8503a;color:#fff;border-radius:2px' },
				{ year: '2019', title: 'A generator and Markdown', tool: 'Static pages from text files and Git', changed: 'The site became files in a repository: versions, rollback, speed.', stayed: 'Your texts: now they are Markdown files.', style: 'background:#fafafa;color:#1a1a1a;font-family:Inter,system-ui,sans-serif', btn: 'background:#111;color:#fff;border-radius:4px' },
				{ year: '2022', title: 'A headless CMS and Jamstack', tool: 'Content as an API, a build on a webhook, a CDN', changed: 'Content parted from looks, and the site is built and served from the edge of the network.', stayed: 'What to say and to whom. The structure of your data.', style: 'background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif', btn: 'background:#38bdf8;color:#0f172a;border-radius:8px' },
				{ year: '2025', title: 'An AI builder', tool: 'A description in words, code from a model, vibe coding', changed: 'A page comes in minutes, and the value moved to checking and being specific.', stayed: 'Responsibility for facts, data and accessibility.', style: 'background:linear-gradient(135deg,#6d28d9,#2563eb);color:#fff;font-family:Inter,system-ui,sans-serif', btn: 'background:#fff;color:#4c1d95;border-radius:999px' },
				{ year: 'Next', title: 'A brief, an interview and a check', tool: 'A partner asks questions and builds a site and a service; agents as visitors', changed: 'The interface becomes a conversation and an action, and a site part of a network of agents. This is a direction, not a guarantee.', stayed: 'The brief, the facts, your understanding and a person’s confirmation.', style: 'background:#f6f1e7;color:#2a2418;font-family:Georgia,serif', btn: 'background:#8a6a2f;color:#fff;border-radius:2px' }
			] as Era[],
			caption: 'Your site in eight eras: what changed and what stayed',
			era: 'Era:',
			line: 'The same words in every era. Only the clothes changed.',
			tools: 'Tools:',
			changed: 'What changed:',
			stayed: 'What stayed:',
			outro: 'The prologue promised that your own site would pass through the eras. You made eight versions of your project, and in the gallery they lie side by side. Look at them not as a museum but as an answer to the question: what in your work has stayed the same?'
		}
	});

	let name = $state(W.fallback.name);
	let action = $state(W.fallback.action);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			name = p.name || name;
			action = p.mainAction?.label || action;
		} catch {
			/* the example stays */
		}
	});

	const eras: Era[] = W.eras;
	let i = $state(0);
	const e = $derived(eras[i]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.era} <input type="range" min="0" max="7" step="1" bind:value={i} aria-valuetext={`${e.year}: ${e.title}`} /> <strong>{e.year}</strong></label>
	</div>
	<div class="frame" style={e.style}>
		<p class="nm">{name}</p>
		<p class="ln">{W.line}</p>
		<span class="btn" style={e.btn}>{action}</span>
	</div>
	<div class="dh">{e.year}: {e.title}</div>
	<ul class="notes" aria-live="polite">
		<li><strong>{W.tools}</strong> {e.tool}.</li>
		<li><strong>{W.changed}</strong> {e.changed}</li>
		<li><strong>{W.stayed}</strong> {e.stayed}</li>
	</ul>
	<p class="dg-out">{W.outro}</p>
</figure>

<style>
	.frame {
		padding: var(--space-5);
		border: var(--line) solid var(--border-rule);
		min-height: 9rem;
	}
	.nm {
		margin: 0 0 var(--space-2);
		font-size: 1.6rem;
		font-weight: 600;
	}
	.ln {
		margin: 0 0 var(--space-3);
	}
	.btn {
		display: inline-block;
		padding: var(--space-2) var(--space-4);
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.notes {
		margin-top: 0;
	}
</style>
