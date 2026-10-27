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

	type Cond = 'fine' | 'off' | 'slow' | 'crash' | 'old';
	const conds: { id: Cond; name: string }[] = [
		{ id: 'fine', name: 'Всё хорошо' },
		{ id: 'off', name: 'JavaScript выключен' },
		{ id: 'slow', name: 'Медленная сеть: скрипт ещё качается' },
		{ id: 'crash', name: 'Скрипт упал с ошибкой' },
		{ id: 'old', name: 'Старый браузер' }
	];
	// core: part of the HTML; enh: only an improvement
	const features = [
		{ name: 'Список предложений', core: true },
		{ name: 'Форма заявки', core: true },
		{ name: 'Телефон и почта', core: true },
		{ name: 'Меню-кнопка', core: false },
		{ name: 'Поиск по списку', core: false },
		{ name: 'Проверка телефона на лету', core: false }
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
	<figcaption>Что остаётся посетителю</figcaption>
	<div class="dg-ctl" role="group" aria-label="Условия">
		{#each conds as c (c.id)}
			<button type="button" aria-pressed={cond === c.id} onclick={() => (cond = c.id)}>{c.name}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label="Как построена страница">
		<button type="button" aria-pressed={enhanced} onclick={() => (enhanced = true)}>Построена как улучшение</button>
		<button type="button" aria-pressed={!enhanced} onclick={() => (enhanced = false)}>Построена только на скрипте</button>
	</div>
	<ul class="rows" aria-label="Функции страницы">
		{#each rows as r (r.name)}
			<li class:ok={r.ok} class:bad={!r.ok}>
				<span class="mark" aria-hidden="true">{r.ok ? '✓' : '✗'}</span>
				<span>{r.name}</span>
				<span class="tag">{r.core ? 'обязательная' : 'улучшение'}</span>
				<span class="sr">{r.ok ? 'работает' : 'не работает'}</span>
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		<strong>Работает функций: {kept} из {rows.length}; из обязательных: {mustKept} из 3.</strong>
		{#if cond === 'fine'}При исправном скрипте обе страницы одинаковы. Разница видна, когда скрипт не сработал.
		{:else if mustKept === 3}Страница проще, но главное доступно: посетитель увидит предложения, отправит заявку и найдёт контакты.
		{:else}Посетитель не получил ничего из того, ради чего пришёл.{/if}
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
