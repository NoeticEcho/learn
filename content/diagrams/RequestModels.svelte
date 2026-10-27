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

	type Model = { id: string; name: string; ms: number; startup: string; memory: string; lives: boolean };
	const models: Model[] = [
		{ id: 'cgi', name: 'CGI', ms: 45, startup: 'запускается новая программа', memory: 'программа завершается, память освобождена', lives: false },
		{ id: 'fpm', name: 'PHP-FPM', ms: 12, startup: 'берётся готовый рабочий процесс из пула', memory: 'переменные скрипта забыты после ответа', lives: false },
		{ id: 'app', name: 'Сервер приложений', ms: 6, startup: 'программа уже работает', memory: 'переменные живут между запросами', lives: true }
	];
	let sent = $state(0);
	const counter = (m: Model) => (m.lives ? sent : sent > 0 ? 1 : 0);
	const total = (m: Model) => m.ms * sent;
</script>

<figure class="dg">
	<figcaption>Пять запросов, три устройства</figcaption>
	<div class="dg-ctl">
		<button type="button" onclick={() => (sent += 1)}>Отправить запрос</button>
		<button type="button" onclick={() => (sent = 5)}>Отправить сразу пять</button>
		<button type="button" onclick={() => (sent = 0)}>Сначала</button>
		<span>Запросов: <strong>{sent}</strong></span>
	</div>
	<div class="three">
		{#each models as m (m.id)}
			<section class="dg-box" aria-label={m.name}>
				<h4>{m.name}</h4>
				<p class="line"><b>Каждый запрос:</b> {m.startup}.</p>
				<p class="line"><b>После ответа:</b> {m.memory}.</p>
				<p class="counter">Счётчик в коде (<code>$visits++</code>): <strong>{counter(m)}</strong></p>
				<p class="line">Время на {sent} запр.: ≈ {total(m)} мс</p>
			</section>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		{#if sent < 2}Отправьте несколько запросов и следите за счётчиком.
		{:else}Счётчик в CGI и PHP каждый раз «забывает» прошлые запросы: у них нет общей памяти. У сервера приложений он растёт. Это и плюс (можно хранить сессии и соединения), и минус (ошибка в памяти накапливается).{/if}
	</p>
	<p class="note">Время условное и показывает порядок: старт программы дорогой, пул готовых процессов дешевле, живая программа дешевле всего. Настоящие цифры зависят от языка, кода и железа.</p>
</figure>

<style>
	.three {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--space-3);
	}
	h4 {
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
