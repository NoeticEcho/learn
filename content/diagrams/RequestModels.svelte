<!--
	«Три модели запроса» (part 6, lesson 3). Five requests are sent through CGI, PHP-FPM and an
	application server. Each model keeps a counter variable; in the first two it starts from zero
	for every request (the program or the script begins from a clean sheet), in the third it lives
	in the running program and grows. The table of per-request times is a model, not a
	measurement: the shape is what matters (start-up cost per request, a warm pool, a program that
	never exits), and the page says so.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			models: [
				{ id: 'cgi', name: 'CGI', ms: 45, startup: 'запускается новая программа', memory: 'программа завершается, память освобождена', lives: false },
				{ id: 'fpm', name: 'PHP-FPM', ms: 12, startup: 'берётся готовый рабочий процесс из пула', memory: 'переменные скрипта забыты после ответа', lives: false },
				{ id: 'app', name: 'Сервер приложений', ms: 6, startup: 'программа уже работает', memory: 'переменные живут между запросами', lives: true }
			],
			caption: 'Пять запросов, три устройства',
			send: 'Отправить запрос',
			sendFive: 'Отправить сразу пять',
			reset: 'Сначала',
			requests: 'Запросов:',
			each: 'Каждый запрос:',
			after: 'После ответа:',
			counter: 'Счётчик в коде',
			time: (n: number, ms: number) => `Время на ${n} запр.: ≈ ${ms} мс`,
			few: 'Отправьте несколько запросов и следите за счётчиком.',
			many: 'Счётчик в CGI и PHP каждый раз «забывает» прошлые запросы: у них нет общей памяти. У сервера приложений он растёт. Это и плюс (можно хранить сессии и соединения), и минус (ошибка в памяти накапливается).',
			note: 'Время условное и показывает порядок: старт программы дорогой, пул готовых процессов дешевле, живая программа дешевле всего. Настоящие цифры зависят от языка, кода и железа.'
		},
		en: {
			models: [
				{ id: 'cgi', name: 'CGI', ms: 45, startup: 'a new program is started', memory: 'the program ends and its memory is freed', lives: false },
				{ id: 'fpm', name: 'PHP-FPM', ms: 12, startup: 'a ready worker is taken from the pool', memory: 'the script’s variables are forgotten after the answer', lives: false },
				{ id: 'app', name: 'Application server', ms: 6, startup: 'the program is already running', memory: 'variables live on between requests', lives: true }
			],
			caption: 'Five requests, three designs',
			send: 'Send a request',
			sendFive: 'Send five at once',
			reset: 'Start over',
			requests: 'Requests:',
			each: 'Each request:',
			after: 'After the answer:',
			counter: 'Counter in the code',
			time: (n: number, ms: number) => `Time for ${n} request${n === 1 ? '' : 's'}: ≈ ${ms} ms`,
			few: 'Send a few requests and watch the counter.',
			many: 'In CGI and PHP the counter “forgets” the earlier requests every time: they have no shared memory. In an application server it grows. That is both a plus (it can keep sessions and connections) and a minus (a mistake in memory piles up).',
			note: 'The times are illustrative and show the order of magnitude: starting a program is expensive, a pool of ready workers is cheaper, and a running program is cheapest of all. Real figures depend on the language, the code and the hardware.'
		}
	});

	type Model = { id: string; name: string; ms: number; startup: string; memory: string; lives: boolean };
	const models: Model[] = W.models;
	let sent = $state(0);
	const counter = (m: Model) => (m.lives ? sent : sent > 0 ? 1 : 0);
	const total = (m: Model) => m.ms * sent;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<button type="button" onclick={() => (sent += 1)}>{W.send}</button>
		<button type="button" onclick={() => (sent = 5)}>{W.sendFive}</button>
		<button type="button" onclick={() => (sent = 0)}>{W.reset}</button>
		<span>{W.requests} <strong>{sent}</strong></span>
	</div>
	<div class="three">
		{#each models as m (m.id)}
			<section class="dg-box" aria-label={m.name}>
				<div class="dh">{m.name}</div>
				<p class="line"><b>{W.each}</b> {m.startup}.</p>
				<p class="line"><b>{W.after}</b> {m.memory}.</p>
				<p class="counter">{W.counter} (<code>$visits++</code>): <strong>{counter(m)}</strong></p>
				<p class="line">{W.time(sent, total(m))}</p>
			</section>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		{#if sent < 2}{W.few}
		{:else}{W.many}{/if}
	</p>
	<p class="note">{W.note}</p>
</figure>

<style>
	.three {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--space-3);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		color: var(--text-primary);
	}
	.line,
	.counter {
		margin: 0 0 var(--space-2);
	}
	.counter {
		color: var(--text-primary);
	}
	.note {
		margin: var(--space-3) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
</style>
