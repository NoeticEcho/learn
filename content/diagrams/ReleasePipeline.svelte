<!--
	«Путь правки до посетителя» (part 8, lesson 7). Editor presses «Опубликовать»; a webhook starts a
	build, the build is uploaded, the CDN's cache is refreshed. The person steps through, can break
	any stage and see what a visitor still sees (the old version, because a deploy is switched all at
	once and a failed build leaves the old site alone), can roll back, and moves a slider for the number
	of pages to see how build time grows. All numbers are a model, not a measurement.
-->
<script lang="ts">
	import './shared.css';

	type Stage = { id: string; name: string; what: string; ok: string; fail: string };
	const stages: Stage[] = [
		{ id: 'publish', name: 'Публикация в CMS', what: 'Редактор нажал «Опубликовать»: запись сохранена.', ok: 'Запись сохранена в CMS. Сайт пока старый.', fail: 'Сохранить не удалось: правка не принята, сайт не затронут.' },
		{ id: 'hook', name: 'Вебхук', what: 'CMS отправила сборщику сообщение «содержание изменилось».', ok: 'Сборщик получил сообщение и поставил сборку в очередь.', fail: 'Сообщение не дошло: сборка не началась. Запись в CMS есть, а сайт остаётся прежним, пока кто-то не запустит сборку вручную.' },
		{ id: 'build', name: 'Сборка', what: 'Генератор берёт содержание у API и собирает все страницы заново.', ok: 'Все страницы собраны в новую версию.', fail: 'Сборка упала (например, в записи пустое обязательное поле). Старая версия сайта осталась на месте: посетитель ничего не заметил.' },
		{ id: 'deploy', name: 'Выкладка', what: 'Готовая папка загружается на хостинг и включается разом.', ok: 'Новая версия загружена и включена целиком, одним переключением.', fail: 'Загрузка не удалась: включена по-прежнему старая версия.' },
		{ id: 'cdn', name: 'Раздача (CDN)', what: 'Копии страниц по всему миру обновляются, старый кэш сбрасывается.', ok: 'Копии обновлены: посетители из любой страны видят новое.', fail: 'Кэш не сброшен: часть посетителей ещё какое-то время видит старую версию из копии.' }
	];
	let broken = $state<Record<string, boolean>>({});
	let at = $state(-1);
	let live = $state(12);
	let rolled = $state(false);
	const failedAt = $derived(stages.findIndex((s) => broken[s.id]));
	const stopped = $derived(failedAt >= 0 && at >= failedAt);
	const reached = $derived(stopped ? failedAt : at);
	const deployed = $derived(!stopped && at >= 3);
	const done = $derived(at === stages.length - 1 && failedAt === -1);
	const cdnStale = $derived(failedAt === 4 && at >= 4);
	const version = $derived(rolled ? 12 : deployed || (failedAt === 4 && at >= 4) ? 13 : live);
	const visitor = $derived(rolled ? 'v12 (откат на прошлую версию)' : failedAt === 4 && at >= 4 ? 'часть посетителей v12 (старый кэш), часть v13' : deployed ? 'v13: новая версия' : 'v12: прежняя версия');

	let pages = $state(200);
	const buildSec = $derived(Math.round(15 + pages * 0.05));
	const total = $derived(2 + buildSec + 10 + 5);

	function next() {
		if (at < stages.length - 1 && !stopped) at++;
	}
	function reset() {
		at = -1;
		rolled = false;
	}
	const toggle = (id: string) => {
		broken[id] = !broken[id];
		reset();
	};
</script>

<figure class="dg">
	<figcaption>Что происходит между «Опубликовать» и посетителем</figcaption>
	<p class="dg-out">Модель с придуманными секундами. Отметьте этап, который «сломается», и пройдите путь правки по шагам.</p>
	<ol class="stages">
		{#each stages as s, i (s.id)}
			<li class:on={i <= reached} class:bad={stopped && i === failedAt} class:now={i === reached && at >= 0}>
				<div class="top">
					<strong>{s.name}</strong>
					<label class="brk"><input type="checkbox" checked={!!broken[s.id]} onchange={() => toggle(s.id)} /> сломать</label>
				</div>
				<span class="dim">{at >= i ? (stopped && i === failedAt ? s.fail : i === 4 && cdnStale ? stages[4].fail : s.ok) : s.what}</span>
			</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" class="on" onclick={next} disabled={stopped || at >= stages.length - 1}>{at < 0 ? 'Опубликовать' : 'Дальше'}</button>
		<button type="button" onclick={reset} disabled={at < 0}>Сначала</button>
		<button type="button" onclick={() => (rolled = true)} disabled={!(done || deployed) || rolled}>Откатить на прошлую версию</button>
	</div>
	<p class="dg-out" aria-live="polite"><strong>Посетитель сейчас видит:</strong> {visitor}. {#if stopped}Правка не дошла до посетителя, но и сайт не сломался: старая версия на месте. {/if}{#if rolled}Откат переключает сайт на прошлую собранную версию. Заново собирать не нужно, поэтому он занимает секунды.{/if}</p>

	<label class="sl">Страниц на сайте: <strong>{pages}</strong>
		<input type="range" min="10" max="10000" step="10" bind:value={pages} />
	</label>
	<p class="dg-out" aria-live="polite">Сборка займёт около <strong>{buildSec} с</strong>, весь путь от «Опубликовать» до посетителей около <strong>{total} с</strong>. {pages > 2000 ? 'Когда страниц тысячи, пересобирать всё из-за одной правки дорого: тогда нужны быстрые генераторы или пересборка только изменённых страниц.' : 'Для небольшого сайта это почти мгновенно.'}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> путь правки состоит из пяти этапов: публикация, вебхук, сборка, выкладка, обновление копий в CDN. Если один из них ломается, посетитель продолжает видеть прежнюю версию, потому что новая включается целиком и только после успешной сборки. Откат это переключение на прошлую собранную версию. Время сборки растёт с числом страниц.</p>
</figure>

<style>
	.stages {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.stages li {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
		color: var(--text-secondary);
	}
	.stages li.on {
		color: var(--text-primary);
		border-color: var(--border-rule);
	}
	.stages li.now {
		border-color: var(--accent-measure);
	}
	.stages li.bad {
		border-style: dashed;
		border-color: var(--accent-measure);
	}
	.top {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.brk {
		min-height: 0;
		color: var(--text-secondary);
	}
	.dim {
		color: inherit;
	}
	.sl {
		display: grid;
		gap: var(--space-1);
		margin: var(--space-3) 0 0;
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
