<!--
	«Что остаётся без скрипта» (part 5, lesson 8). A table of six features of the person's page
	against five conditions (all fine, JavaScript off, slow network with the script still loading,
	the script crashes, an old browser). Two builds are compared: one made as an enhancement (the
	content, the form and the contacts are in the HTML) and one that needs the script for
	everything. The cells are computed from a few rules, so changing the build or the condition
	shows at once what a visitor keeps.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			conds: ['Всё хорошо', 'JavaScript выключен', 'Медленная сеть: скрипт ещё качается', 'Скрипт упал с ошибкой', 'Старый браузер'],
			features: ['Список предложений', 'Форма заявки', 'Телефон и почта', 'Меню-кнопка', 'Поиск по списку', 'Проверка телефона на лету'],
			caption: 'Что остаётся посетителю',
			condGroup: 'Условия',
			buildGroup: 'Как построена страница',
			enhancedBuild: 'Построена как улучшение',
			scriptBuild: 'Построена только на скрипте',
			list: 'Функции страницы',
			core: 'обязательная',
			enh: 'улучшение',
			works: 'работает',
			broken: 'не работает',
			summary: (kept: number, all: number, must: number) => `Работает функций: ${kept} из ${all}; из обязательных: ${must} из 3.`,
			same: 'При исправном скрипте обе страницы одинаковы. Разница видна, когда скрипт не сработал.',
			simpler: 'Страница проще, но главное доступно: посетитель увидит предложения, отправит заявку и найдёт контакты.',
			nothing: 'Посетитель не получил ничего из того, ради чего пришёл.'
		},
		en: {
			conds: ['All is well', 'JavaScript is off', 'Slow network: the script is still downloading', 'The script crashed', 'An old browser'],
			features: ['The list of offers', 'The enquiry form', 'Phone and email', 'The menu button', 'Search in the list', 'Live phone check'],
			caption: 'What the visitor keeps',
			condGroup: 'Conditions',
			buildGroup: 'How the page is built',
			enhancedBuild: 'Built as an enhancement',
			scriptBuild: 'Built on the script alone',
			list: 'The page’s features',
			core: 'essential',
			enh: 'enhancement',
			works: 'works',
			broken: 'does not work',
			summary: (kept: number, all: number, must: number) => `Working features: ${kept} of ${all}; of the essential ones: ${must} of 3.`,
			same: 'With a working script both pages are the same. The difference shows when the script fails.',
			simpler: 'The page is plainer, but the main things work: the visitor sees the offers, sends an enquiry and finds the contacts.',
			nothing: 'The visitor got nothing of what they came for.'
		}
	});

	type Cond = 'fine' | 'off' | 'slow' | 'crash' | 'old';
	const conds: { id: Cond; name: string }[] = [
		{ id: 'fine', name: W.conds[0] },
		{ id: 'off', name: W.conds[1] },
		{ id: 'slow', name: W.conds[2] },
		{ id: 'crash', name: W.conds[3] },
		{ id: 'old', name: W.conds[4] }
	];
	// core: part of the HTML; enh: only an improvement
	const features = [
		{ name: W.features[0], core: true },
		{ name: W.features[1], core: true },
		{ name: W.features[2], core: true },
		{ name: W.features[3], core: false },
		{ name: W.features[4], core: false },
		{ name: W.features[5], core: false }
	];
	let cond = $state<Cond>('off');
	let enhanced = $state(true);

	const scriptRuns = (c: Cond) => c === 'fine';
	const works = (core: boolean, c: Cond): boolean => {
		if (scriptRuns(c)) return true;
		// no script: the enhancement build keeps what is in the HTML; the script-only build keeps nothing
		return enhanced && core;
	};
	const rows = $derived(features.map((f) => ({ ...f, ok: works(f.core, cond) })));
	const kept = $derived(rows.filter((r) => r.ok).length);
	const mustKept = $derived(rows.filter((r) => r.core && r.ok).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.condGroup}>
		{#each conds as c (c.id)}
			<button type="button" aria-pressed={cond === c.id} onclick={() => (cond = c.id)}>{c.name}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label={W.buildGroup}>
		<button type="button" aria-pressed={enhanced} onclick={() => (enhanced = true)}>{W.enhancedBuild}</button>
		<button type="button" aria-pressed={!enhanced} onclick={() => (enhanced = false)}>{W.scriptBuild}</button>
	</div>
	<ul class="rows" aria-label={W.list}>
		{#each rows as r (r.name)}
			<li class:ok={r.ok} class:bad={!r.ok}>
				<span class="mark" aria-hidden="true">{r.ok ? '✓' : '✗'}</span>
				<span>{r.name}</span>
				<span class="tag">{r.core ? W.core : W.enh}</span>
				<span class="sr">{r.ok ? W.works : W.broken}</span>
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		<strong>{W.summary(kept, rows.length, mustKept)}</strong>
		{#if cond === 'fine'}{W.same}
		{:else if mustKept === 3}{W.simpler}
		{:else}{W.nothing}{/if}
	</p>
</figure>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 1.5rem 1fr auto;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-1) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	li.ok {
		border-color: var(--accent-state-text);
	}
	li.bad {
		color: var(--text-secondary);
		text-decoration: line-through;
	}
	.mark {
		font-weight: bold;
	}
	.tag {
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
