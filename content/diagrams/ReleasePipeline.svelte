<!--
	«Путь правки до посетителя» (part 8, lesson 7). Editor presses «Опубликовать»; a webhook starts a
	build, the build is uploaded, the CDN's cache is refreshed. The person steps through, can break
	any stage and see what a visitor still sees (the old version, because a deploy is switched all at
	once and a failed build leaves the old site alone), can roll back, and moves a slider for the number
	of pages to see how build time grows. All numbers are a model, not a measurement.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Stage = { id: string; name: string; what: string; ok: string; fail: string };
	const W = pick({
		ru: {
			stages: [
				{ id: 'publish', name: 'Публикация в CMS', what: 'Редактор нажал «Опубликовать»: запись сохранена.', ok: 'Запись сохранена в CMS. Сайт пока старый.', fail: 'Сохранить не удалось: правка не принята, сайт не затронут.' },
				{ id: 'hook', name: 'Вебхук', what: 'CMS отправила сборщику сообщение «содержание изменилось».', ok: 'Сборщик получил сообщение и поставил сборку в очередь.', fail: 'Сообщение не дошло: сборка не началась. Запись в CMS есть, а сайт остаётся прежним, пока кто-то не запустит сборку вручную.' },
				{ id: 'build', name: 'Сборка', what: 'Генератор берёт содержание у API и собирает все страницы заново.', ok: 'Все страницы собраны в новую версию.', fail: 'Сборка упала (например, в записи пустое обязательное поле). Старая версия сайта осталась на месте: посетитель ничего не заметил.' },
				{ id: 'deploy', name: 'Выкладка', what: 'Готовая папка загружается на хостинг и включается разом.', ok: 'Новая версия загружена и включена целиком, одним переключением.', fail: 'Загрузка не удалась: включена по-прежнему старая версия.' },
				{ id: 'cdn', name: 'Раздача (CDN)', what: 'Копии страниц по всему миру обновляются, старый кэш сбрасывается.', ok: 'Копии обновлены: посетители из любой страны видят новое.', fail: 'Кэш не сброшен: часть посетителей ещё какое-то время видит старую версию из копии.' }
			] as Stage[],
			v12: 'v12 (откат на прошлую версию)',
			vMix: 'часть посетителей v12 (старый кэш), часть v13',
			v13: 'v13: новая версия',
			vOld: 'v12: прежняя версия',
			caption: 'Что происходит между «Опубликовать» и посетителем',
			intro: 'Модель с придуманными секундами. Отметьте этап, который «сломается», и пройдите путь правки по шагам.',
			break: 'сломать',
			publish: 'Опубликовать',
			next: 'Дальше',
			again: 'Сначала',
			rollback: 'Откатить на прошлую версию',
			sees: 'Посетитель сейчас видит:',
			stoppedNote: 'Правка не дошла до посетителя, но и сайт не сломался: старая версия на месте.',
			rolledNote: 'Откат переключает сайт на прошлую собранную версию. Заново собирать не нужно, поэтому он занимает секунды.',
			pages: 'Страниц на сайте:',
			buildPre: 'Сборка займёт около',
			sec: 'с',
			totalMid: ', весь путь от «Опубликовать» до посетителей около',
			big: 'Когда страниц тысячи, пересобирать всё из-за одной правки дорого: тогда нужны быстрые генераторы или пересборка только изменённых страниц.',
			small: 'Для небольшого сайта это почти мгновенно.',
			alt: 'Текстовая альтернатива:',
			altText:
				'путь правки состоит из пяти этапов: публикация, вебхук, сборка, выкладка, обновление копий в CDN. Если один из них ломается, посетитель продолжает видеть прежнюю версию, потому что новая включается целиком и только после успешной сборки. Откат это переключение на прошлую собранную версию. Время сборки растёт с числом страниц.'
		},
		en: {
			stages: [
				{ id: 'publish', name: 'Publish in the CMS', what: 'The editor pressed “Publish”: the entry is saved.', ok: 'The entry is saved in the CMS. The site is still the old one.', fail: 'Saving failed: the edit was not accepted and the site is untouched.' },
				{ id: 'hook', name: 'Webhook', what: 'The CMS sent the builder a message: “the content has changed”.', ok: 'The builder got the message and queued a build.', fail: 'The message never arrived, so no build started. The entry is in the CMS, but the site stays as it was until someone starts a build by hand.' },
				{ id: 'build', name: 'Build', what: 'The generator takes the content from the API and rebuilds every page.', ok: 'Every page is built into a new version.', fail: 'The build failed (say, a required field is empty in an entry). The old version of the site stayed in place: the visitor noticed nothing.' },
				{ id: 'deploy', name: 'Deploy', what: 'The finished folder is uploaded to the host and switched on in one go.', ok: 'The new version is uploaded and switched on as a whole, in one step.', fail: 'The upload failed: the old version is still the live one.' },
				{ id: 'cdn', name: 'Delivery (CDN)', what: 'Copies of the pages around the world are refreshed and the old cache is cleared.', ok: 'The copies are fresh: visitors in every country see the new version.', fail: 'The cache was not cleared: some visitors still see the old version from a copy for a while.' }
			] as Stage[],
			v12: 'v12 (rolled back to the previous version)',
			vMix: 'some visitors v12 (old cache), some v13',
			v13: 'v13: the new version',
			vOld: 'v12: the previous version',
			caption: 'What happens between “Publish” and the visitor',
			intro: 'A model with invented seconds. Tick a stage that will “break”, then walk through the path of an edit step by step.',
			break: 'break it',
			publish: 'Publish',
			next: 'Next',
			again: 'Start over',
			rollback: 'Roll back to the previous version',
			sees: 'The visitor sees now:',
			stoppedNote: 'The edit did not reach the visitor, but the site did not break either: the old version is still there.',
			rolledNote: 'A rollback switches the site to the previous built version. Nothing has to be built again, so it takes seconds.',
			pages: 'Pages on the site:',
			buildPre: 'The build will take about',
			sec: 's',
			totalMid: ', and the whole path from “Publish” to visitors about',
			big: 'When there are thousands of pages, rebuilding everything for one edit is expensive. That calls for fast generators or for rebuilding only the pages that changed.',
			small: 'For a small site this is almost instant.',
			alt: 'Text alternative:',
			altText:
				'an edit passes through five stages: publish, webhook, build, deploy and refreshing the copies on the CDN. If one of them breaks, the visitor keeps seeing the previous version, because the new one is switched on whole and only after a successful build. A rollback is a switch to the previous built version. Build time grows with the number of pages.'
		}
	});
	const stages = W.stages;
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
	const visitor = $derived(rolled ? W.v12 : failedAt === 4 && at >= 4 ? W.vMix : deployed ? W.v13 : W.vOld);

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
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>
	<ol class="stages">
		{#each stages as s, i (s.id)}
			<li class:on={i <= reached} class:bad={stopped && i === failedAt} class:now={i === reached && at >= 0}>
				<div class="top">
					<strong>{s.name}</strong>
					<label class="brk"><input type="checkbox" checked={!!broken[s.id]} onchange={() => toggle(s.id)} /> {W.break}</label>
				</div>
				<span class="dim">{at >= i ? (stopped && i === failedAt ? s.fail : i === 4 && cdnStale ? stages[4].fail : s.ok) : s.what}</span>
			</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" class="on" onclick={next} disabled={stopped || at >= stages.length - 1}>{at < 0 ? W.publish : W.next}</button>
		<button type="button" onclick={reset} disabled={at < 0}>{W.again}</button>
		<button type="button" onclick={() => (rolled = true)} disabled={!(done || deployed) || rolled}>{W.rollback}</button>
	</div>
	<p class="dg-out" aria-live="polite"><strong>{W.sees}</strong> {visitor}. {#if stopped}{W.stoppedNote} {/if}{#if rolled}{W.rolledNote}{/if}</p>

	<label class="sl">{W.pages} <strong>{pages}</strong>
		<input type="range" min="10" max="10000" step="10" bind:value={pages} />
	</label>
	<p class="dg-out" aria-live="polite">{W.buildPre} <strong>{buildSec} {W.sec}</strong>{W.totalMid} <strong>{total} {W.sec}</strong>. {pages > 2000 ? W.big : W.small}</p>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
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
