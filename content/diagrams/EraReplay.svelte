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

	let name = $state('Мой проект');
	let action = $state('Оставить заявку');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			name = p.name || name;
			action = p.mainAction?.label || action;
		} catch {
			/* the example stays */
		}
	});

	type Era = { year: string; title: string; tool: string; changed: string; stayed: string; style: string; btn: string };
	const eras: Era[] = [
		{ year: '1996', title: 'Таблицы и тег font', tool: 'HTML-таблицы, GIF-счётчик, FTP', changed: 'Страница впервые стала вашей: любой мог выложить своё.', stayed: 'Текст, ссылка и название: то, зачем пришли.', style: 'background:#c0c0c0;color:#000;font-family:"Times New Roman",serif', btn: 'border:2px outset #fff;background:#d4d0c8;color:#000' },
		{ year: '2005', title: 'Отдельные стили', tool: 'CSS-файл, float, «веб 2.0»', changed: 'Содержимое и оформление разделились: один файл стилей на весь сайт.', stayed: 'Тот же текст и те же ссылки.', style: 'background:#eaf3ff;color:#123;font-family:Verdana,sans-serif', btn: 'background:linear-gradient(#6aa7ff,#2a6fd6);color:#fff;border:1px solid #1d4fa0;border-radius:6px' },
		{ year: '2010', title: 'WordPress', tool: 'Тема, плагины, панель владельца', changed: 'Править сайт мог не программист: появилась панель.', stayed: 'Содержимое по-прежнему ваше, а его надо обновлять.', style: 'background:#f4f4f0;color:#333;font-family:Georgia,serif', btn: 'background:#21759b;color:#fff;border-radius:3px' },
		{ year: '2014', title: 'Адаптивная вёрстка', tool: 'Flexbox, медиазапросы, mobile first', changed: 'Один сайт для любого экрана, телефон стал главным.', stayed: 'Главное действие должно быть видно сразу.', style: 'background:#fff;color:#222;font-family:system-ui,sans-serif', btn: 'background:#e8503a;color:#fff;border-radius:2px' },
		{ year: '2019', title: 'Генератор и Markdown', tool: 'Статические страницы из текстовых файлов и Git', changed: 'Сайт стал файлами в репозитории: версии, откат, скорость.', stayed: 'Ваши тексты: теперь это файлы Markdown.', style: 'background:#fafafa;color:#1a1a1a;font-family:Inter,system-ui,sans-serif', btn: 'background:#111;color:#fff;border-radius:4px' },
		{ year: '2022', title: 'Headless CMS и Jamstack', tool: 'Содержимое как API, сборка по вебхуку, CDN', changed: 'Содержимое отделилось от вида, сайт собирается и раздаётся с границы сети.', stayed: 'Что сказать и кому. Структура ваших данных.', style: 'background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif', btn: 'background:#38bdf8;color:#0f172a;border-radius:8px' },
		{ year: '2025', title: 'ИИ-конструктор', tool: 'Описание словами, код от модели, вайб-кодинг', changed: 'Страница получается за минуты, а ценность сместилась на проверку и конкретику.', stayed: 'Ответственность за факты, данные и доступность.', style: 'background:linear-gradient(135deg,#6d28d9,#2563eb);color:#fff;font-family:Inter,system-ui,sans-serif', btn: 'background:#fff;color:#4c1d95;border-radius:999px' },
		{ year: 'Дальше', title: 'Бриф, интервью и проверка', tool: 'Собеседник расспрашивает и собирает сайт и сервис; агенты как посетители', changed: 'Интерфейс становится диалогом и действием, а сайт частью сети агентов. Это направление, а не гарантия.', stayed: 'Бриф, факты, ваше понимание и подтверждение человека.', style: 'background:#f6f1e7;color:#2a2418;font-family:Georgia,serif', btn: 'background:#8a6a2f;color:#fff;border-radius:2px' }
	];
	let i = $state(0);
	const e = $derived(eras[i]);
</script>

<figure class="dg">
	<figcaption>Ваш сайт в восьми эпохах: что менялось и что осталось</figcaption>
	<div class="dg-ctl">
		<label>Эпоха: <input type="range" min="0" max="7" step="1" bind:value={i} aria-valuetext={`${e.year}: ${e.title}`} /> <strong>{e.year}</strong></label>
	</div>
	<div class="frame" style={e.style}>
		<p class="nm">{name}</p>
		<p class="ln">Одно и то же слово в каждой эпохе. Менялась только одежда.</p>
		<span class="btn" style={e.btn}>{action}</span>
	</div>
	<div class="dh">{e.year}: {e.title}</div>
	<ul class="notes" aria-live="polite">
		<li><strong>Инструменты:</strong> {e.tool}.</li>
		<li><strong>Что изменилось:</strong> {e.changed}</li>
		<li><strong>Что осталось:</strong> {e.stayed}</li>
	</ul>
	<p class="dg-out">Пролог обещал: «Сейчас вы сделаете это сами». Вы сделали восемь версий своего проекта, и в галерее они лежат рядом. Посмотрите на них не как на музей, а как на ответ на вопрос: что в вашем деле осталось неизменным.</p>
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
