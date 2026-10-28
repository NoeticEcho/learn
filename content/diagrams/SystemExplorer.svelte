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
	import { SYSTEMS_EN } from './systems.en.ts';
	import { pick as byLocale, getLocale } from '#lib/i18n/index.ts';

	// The words of the page, one table per edition (docs/content-plan/README.md, «English edition»).
	// The systems' own facts are in systems.ts (Russian) and systems.en.ts (English overrides).
	const W = byLocale({
		ru: {
			needs: [
				{ k: 'forms', t: 'Формы и понятные услуги' },
				{ k: 'brand', t: 'Свой узнаваемый характер' },
				{ k: 'dense', t: 'Плотные рабочие экраны (таблицы, панели)' },
				{ k: 'open', t: 'Открытый код и свободная лицензия' },
				{ k: 'ru', t: 'Русский язык и своя аудитория' }
			],
			chooserCaption: 'У кого брать идеи для вашего проекта',
			readCaption: 'Читаем системы одним и тем же способом',
			systems: 'Системы',
			idea: 'Идея',
			tokens: 'Токены',
			components: 'Компоненты',
			access: 'Доступность',
			open: 'Открытость',
			take: 'Что взять себе',
			avoid: 'Когда не брать',
			docs: 'Открыть документацию системы',
			docsNote: '(откроется сайт системы)',
			legend: 'Что нужно вашему проекту?',
			points: (n: number) => `${n} очк.`,
			note: 'Очки поставлены вручную по описаниям выше: это подсказка для первого выбора, а не измерение. Системы можно (и нужно) смешивать: формы из одной, сетку из другой, доступные компоненты из третьей.'
		},
		en: {
			needs: [
				{ k: 'forms', t: 'Forms and clear services' },
				{ k: 'brand', t: 'A recognizable character of your own' },
				{ k: 'dense', t: 'Dense working screens (tables, panels)' },
				{ k: 'open', t: 'Open code and a free license' }
			],
			chooserCaption: 'Whose ideas to take for your project',
			readCaption: 'Reading the systems the same way each time',
			systems: 'Systems',
			idea: 'Idea',
			tokens: 'Tokens',
			components: 'Components',
			access: 'Accessibility',
			open: 'Openness',
			take: 'What to take',
			avoid: 'When not to take it',
			docs: 'Open the system’s documentation',
			docsNote: '(opens the system’s own site)',
			legend: 'What does your project need?',
			points: (n: number) => `${n} pts`,
			note: 'The points are set by hand from the descriptions above: they are a hint for a first choice, not a measurement. Systems can (and should) be mixed: forms from one, the grid from another, accessible components from a third.'
		}
	});
	const systems: System[] = SYSTEMS.map((s) => ({ ...s, ...(getLocale() === 'en' ? SYSTEMS_EN[s.id] : {}) }));

	let { ids, chooser = false }: { ids: string[]; chooser?: boolean } = $props();

	const list = $derived(ids.map((id) => systems.find((s) => s.id === id)).filter((s): s is System => !!s));
	let picked = $state<string | null>(null);
	const pick = $derived(picked ?? ids[0]);
	const cur = $derived(list.find((s) => s.id === pick) ?? list[0]);

	const needs = W.needs;
	let want = $state<Record<string, boolean>>({ forms: false, brand: false, dense: false, open: false, ru: false });
	const ranked = $derived(
		list
			.map((s) => ({ s, score: needs.reduce((a, n) => a + (want[n.k] ? s.fit[n.k as keyof System['fit']] : 0), 0) }))
			.sort((a, b) => b.score - a.score)
	);
	const any = $derived(Object.values(want).some(Boolean));
</script>

<figure class="dg">
	<figcaption>{chooser ? W.chooserCaption : W.readCaption}</figcaption>

	<div class="dg-ctl" role="tablist" aria-label={W.systems}>
		{#each list as s (s.id)}
			<button type="button" role="tab" aria-selected={pick === s.id} onclick={() => (picked = s.id)}>{s.name}</button>
		{/each}
	</div>

	<div class="dg-box card" role="tabpanel">
		<p class="owner">{cur.owner}</p>
		<dl>
			<dt>{W.idea}</dt>
			<dd>{cur.idea}</dd>
			<dt>{W.tokens}</dt>
			<dd>{cur.tokens}</dd>
			<dt>{W.components}</dt>
			<dd>{cur.components}</dd>
			<dt>{W.access}</dt>
			<dd>{cur.access}</dd>
			<dt>{W.open}</dt>
			<dd>{cur.open}</dd>
			<dt>{W.take}</dt>
			<dd>{cur.take}</dd>
			<dt>{W.avoid}</dt>
			<dd>{cur.avoid}</dd>
		</dl>
		<p class="src"><a href={cur.url} rel="noopener">{W.docs}</a> {W.docsNote}</p>
	</div>

	{#if chooser}
		<fieldset class="needs">
			<legend>{W.legend}</legend>
			{#each needs as n (n.k)}
				<label><input type="checkbox" bind:checked={want[n.k]} /> {n.t}</label>
			{/each}
		</fieldset>
		<ol class="rank" aria-live="polite">
			{#each ranked as r (r.s.id)}
				<li class:dim={any && r.score === 0}>
					<strong>{r.s.name}</strong>
					<span>{any ? W.points(r.score) : ''}</span>
				</li>
			{/each}
		</ol>
		<p class="dg-out">{W.note}</p>
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
