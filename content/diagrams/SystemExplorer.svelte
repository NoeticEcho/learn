<!--
	«Обозреватель систем» (part 4, lessons 7–10). One card per public design system, read the same
	way each time: who made it, the idea, how it names its values, its components, how it treats
	accessibility, how open it is, what to take and when not to. The facts are in systems.ts. With
	`chooser`, the person ticks what their project needs and the explorer ranks these systems by
	whom to borrow ideas from, using hand-set scores that the lesson explains.
-->
<script lang="ts">
	import './shared.css';
	import { SYSTEMS, type System } from './systems.ts';

	let { ids, chooser = false }: { ids: string[]; chooser?: boolean } = $props();

	const list = $derived(ids.map((id) => SYSTEMS.find((s) => s.id === id)).filter((s): s is System => !!s));
	let picked = $state<string | null>(null);
	const pick = $derived(picked ?? ids[0]);
	const cur = $derived(list.find((s) => s.id === pick) ?? list[0]);

	const needs = [
		{ k: 'forms', t: 'Формы и понятные услуги' },
		{ k: 'brand', t: 'Свой узнаваемый характер' },
		{ k: 'dense', t: 'Плотные рабочие экраны (таблицы, панели)' },
		{ k: 'open', t: 'Открытый код и свободная лицензия' },
		{ k: 'ru', t: 'Русский язык и своя аудитория' }
	] as const;
	let want = $state<Record<string, boolean>>({ forms: false, brand: false, dense: false, open: false, ru: false });
	const ranked = $derived(
		list
			.map((s) => ({ s, score: needs.reduce((a, n) => a + (want[n.k] ? s.fit[n.k] : 0), 0) }))
			.sort((a, b) => b.score - a.score)
	);
	const any = $derived(Object.values(want).some(Boolean));
</script>

<figure class="dg">
	<figcaption>{chooser ? 'У кого брать идеи для вашего проекта' : 'Читаем системы одним и тем же способом'}</figcaption>

	<div class="dg-ctl" role="tablist" aria-label="Системы">
		{#each list as s (s.id)}
			<button type="button" role="tab" aria-selected={pick === s.id} onclick={() => (picked = s.id)}>{s.name}</button>
		{/each}
	</div>

	<div class="dg-box card" role="tabpanel">
		<p class="owner">{cur.owner}</p>
		<dl>
			<dt>Идея</dt>
			<dd>{cur.idea}</dd>
			<dt>Токены</dt>
			<dd>{cur.tokens}</dd>
			<dt>Компоненты</dt>
			<dd>{cur.components}</dd>
			<dt>Доступность</dt>
			<dd>{cur.access}</dd>
			<dt>Открытость</dt>
			<dd>{cur.open}</dd>
			<dt>Что взять себе</dt>
			<dd>{cur.take}</dd>
			<dt>Когда не брать</dt>
			<dd>{cur.avoid}</dd>
		</dl>
		<p class="src"><a href={cur.url} rel="noopener">Открыть документацию системы</a> (откроется сайт системы)</p>
	</div>

	{#if chooser}
		<fieldset class="needs">
			<legend>Что нужно вашему проекту?</legend>
			{#each needs as n (n.k)}
				<label><input type="checkbox" bind:checked={want[n.k]} /> {n.t}</label>
			{/each}
		</fieldset>
		<ol class="rank" aria-live="polite">
			{#each ranked as r (r.s.id)}
				<li class:dim={any && r.score === 0}>
					<strong>{r.s.name}</strong>
					<span>{any ? `${r.score} очк.` : ''}</span>
				</li>
			{/each}
		</ol>
		<p class="dg-out">
			Очки поставлены вручную по описаниям выше: это подсказка для первого выбора, а не измерение. Системы можно (и нужно) смешивать:
			формы из одной, сетку из другой, доступные компоненты из третьей.
		</p>
	{/if}
</figure>

<style>
	.card {
		margin-top: var(--space-3);
	}
	.owner {
		margin: 0 0 var(--space-2);
		color: var(--text-secondary);
	}
	dl {
		margin: 0;
		display: grid;
		gap: var(--space-1);
	}
	dt {
		margin-top: var(--space-2);
		font-weight: var(--weight-medium);
		color: var(--text-primary);
	}
	dd {
		margin: 0;
	}
	.src {
		margin: var(--space-3) 0 0;
	}
	.needs {
		margin: var(--space-4) 0 var(--space-2);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-1);
	}
	.rank {
		list-style: none;
		margin: 0 !important;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.rank li {
		display: flex;
		justify-content: space-between;
		padding: var(--space-1) 0;
		border-bottom: var(--line) solid var(--border-hairline);
	}
	.rank li.dim {
		opacity: 0.5;
	}
</style>
