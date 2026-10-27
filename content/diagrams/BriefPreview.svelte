<!--
	«Бриф и страница» (part 0, lesson 4). The eight project templates, each as a brief, and beside
	it a schematic page that grows with every field that is filled. Unticking a field takes its
	block off the page, which is the point: the page is a function of the brief.
-->
<script lang="ts">
	import './shared.css';
	import { t } from '#lib/i18n/index.ts';
	import { TEMPLATES } from '#lib/persona/render.ts';
	import { KINDS, type Kind } from '#lib/persona/fields.ts';

	type Field = 'who' | 'forWhom' | 'action' | 'sections' | 'items' | 'people' | 'proofs' | 'contacts' | 'languages' | 'tone';
	const labels: Record<Field, string> = {
		who: 'Кто и что',
		forWhom: 'Для кого',
		action: 'Главное действие',
		sections: 'Разделы',
		items: 'Услуги или товары',
		people: 'Люди',
		proofs: 'Доказательства',
		contacts: 'Контакты',
		languages: 'Языки',
		tone: 'Тон'
	};
	const fields = Object.keys(labels) as Field[];
	const tones = { formal: 'деловой', warm: 'тёплый', bold: 'смелый', calm: 'спокойный' } as const;
	const langs = { ru: 'русский', en: 'английский' } as const;
	const actions = { call: 'позвонить', form: 'написать через форму', buy: 'купить', book: 'записаться или забронировать', signup: 'вступить или попробовать', read: 'прочитать' } as const;

	let kind = $state<Kind>('expert');
	let on = $state<Record<Field, boolean>>(Object.fromEntries(fields.map((f) => [f, true])) as Record<Field, boolean>);
	const b = $derived(TEMPLATES[kind]);
	const filled = $derived(fields.filter((f) => on[f]).length);
	const value = (f: Field): string => {
		switch (f) {
			case 'who':
				return b.who;
			case 'forWhom':
				return b.forWhom;
			case 'action':
				return `${b.mainAction.label} (${actions[b.mainAction.kind]})`;
			case 'sections':
				return b.sections.join(', ');
			case 'items':
				return b.items.length ? b.items.map((i) => i.title).join('; ') : 'пока не записано';
			case 'people':
				return b.people.length ? b.people.map((p) => `${p.name}, ${p.role}`).join('; ') : 'пока не записано';
			case 'proofs':
				return b.proofs.length ? b.proofs.map((p) => p.title).join('; ') : 'пока не записано';
			case 'contacts':
				return [b.contacts.phone, b.contacts.email, b.contacts.address].filter(Boolean).join(', ');
			case 'languages':
				return b.languages.map((l) => langs[l]).join(' и ');
			case 'tone':
				return tones[b.tone];
		}
	};
</script>

<figure class="dg">
	<figcaption>Бриф слева, страница справа</figcaption>
	<div class="dg-ctl" role="group" aria-label="Тип проекта">
		{#each KINDS.filter((k) => k !== 'custom') as k (k)}
			<button type="button" aria-pressed={kind === k} onclick={() => (kind = k)}>{t(`settings.kind.${k}`)}</button>
		{/each}
	</div>
	<div class="two">
		<dl class="brief">
			{#each fields as f (f)}
				<div class:off={!on[f]}>
					<dt>
						<label><input type="checkbox" bind:checked={on[f]} /> {labels[f]}</label>
					</dt>
					<dd>{value(f)}</dd>
				</div>
			{/each}
		</dl>
		<div class="page" aria-label="Схема страницы, собранной из брифа" role="group">
			<header class="bar">
				<strong>{b.title}</strong>
				{#if on.languages && b.languages.length > 1}<span class="chip">RU / EN</span>{/if}
			</header>
			{#if on.who}<p class="hero">{b.who}</p>{/if}
			{#if on.action}<p><span class="cta">{b.mainAction.label}</span></p>{/if}
			{#if on.sections}<p class="chips">{#each b.sections as s (s)}<span class="chip">{s}</span>{/each}</p>{/if}
			{#if on.forWhom}<p class="small">Для кого: {b.forWhom}</p>{/if}
			{#if on.items && b.items.length}
				<div class="cards">{#each b.items as i (i.title)}<span class="card">{i.title}</span>{/each}</div>
			{/if}
			{#if on.people && b.people.length}<p class="small">Люди: {b.people.map((p) => p.name).join(', ')}</p>{/if}
			{#if on.proofs && b.proofs.length}<p class="small">Документы и доказательства: {b.proofs.length}</p>{/if}
			{#if on.contacts}<p class="small foot">{[b.contacts.phone, b.contacts.email].filter(Boolean).join(' · ')}</p>{/if}
			{#if filled <= 2}<p class="small">Страница почти пуста: про этот проект пока нечего сказать.</p>{/if}
		</div>
	</div>
	<p class="dg-out" aria-live="polite">Заполнено полей: <strong>{filled} из {fields.length}</strong>. Тон «{on.tone ? tones[b.tone] : 'не задан'}» не рисуется блоком: он определит слова и вид страницы.</p>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-5);
	}
	.brief {
		margin: 0;
		display: grid;
		gap: var(--space-2);
		align-content: start;
	}
	.brief > div {
		border-bottom: var(--line) solid var(--border-hairline);
		padding-bottom: var(--space-2);
	}
	.brief > .off dd {
		opacity: 0.4;
		text-decoration: line-through;
	}
	dt {
		color: var(--text-primary);
	}
	dd {
		margin: 0 0 0 var(--space-6);
		color: var(--text-body);
	}
	.page {
		background: var(--preview-canvas, #fff);
		color: #1a1a1a;
		padding: var(--space-4);
		font-family: var(--font-sans);
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-height: 14rem;
	}
	.page p {
		margin: 0;
	}
	.bar {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		border-bottom: 2px solid #1a1a1a;
		padding-bottom: var(--space-2);
	}
	.hero {
		font-size: 1.05rem;
	}
	.cta {
		display: inline-block;
		background: #1a1a1a;
		color: #fff;
		padding: var(--space-2) var(--space-4);
	}
	.chips,
	.cards {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.chip {
		border: 1px solid #888;
		padding: 0 var(--space-2);
		font-size: 0.8rem;
	}
	.card {
		border: 1px solid #1a1a1a;
		padding: var(--space-2) var(--space-3);
		font-size: 0.85rem;
	}
	.small {
		font-size: 0.8rem;
		color: #444;
	}
	.foot {
		border-top: 1px solid #888;
		padding-top: var(--space-2);
	}
</style>
