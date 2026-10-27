<!--
	«Страница как набор деталей» (part 4, lesson 12). Two parts. First: Brad Frost's five levels
	laid over a small page of the person's project; choose a level and the parts of that level
	are outlined and named. Second: one button in the states a component needs, shown side by
	side so the differences can be compared; a note says which states a pointer cannot show.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let brief = $state({ title: 'Ваш проект', action: 'Главное действие', items: ['Первый пункт', 'Второй пункт', 'Третий пункт'] });
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			const items = (p.items ?? []).map((x: { title: string }) => x.title).slice(0, 3);
			brief = { title: p.title, action: p.mainAction.label, items: items.length ? items : brief.items };
		} catch {
			/* the example words stay */
		}
	});

	const levels = [
		{ id: 'atom', name: 'Атомы', text: 'Нельзя разобрать дальше, не потеряв смысл: заголовок, абзац, ссылка, кнопка, метка, поле. На схеме выделены обведённым.' },
		{ id: 'molecule', name: 'Молекулы', text: 'Несколько атомов, работающих как одно целое: карточка пункта (заголовок, описание, ссылка), поле с подписью и подсказкой.' },
		{ id: 'organism', name: 'Организмы', text: 'Самостоятельная часть страницы из молекул и атомов: шапка с меню, секция с карточками, подвал.' },
		{ id: 'template', name: 'Шаблон', text: 'Скелет страницы из организмов, без настоящих слов: так видно структуру отдельно от содержимого.' },
		{ id: 'page', name: 'Страница', text: 'Шаблон с настоящим содержимым вашего проекта. Здесь выясняется, подходят ли детали к жизни: длинные названия, пустые поля.' }
	] as const;
	let level = $state<(typeof levels)[number]['id']>('atom');
	const cur = $derived(levels.find((l) => l.id === level)!);
	const template = $derived(level === 'template');
	const t = (s: string) => (template ? '▒▒▒▒▒' : s);

	type St = 'normal' | 'hover' | 'focus' | 'pressed' | 'disabled' | 'loading';
	const states: { id: St; name: string; style: string; note: string }[] = [
		{ id: 'normal', name: 'Обычное', style: '', note: 'Как кнопка выглядит, пока с ней ничего не делают.' },
		{ id: 'hover', name: 'Наведение', style: 'filter:brightness(1.18)', note: 'Подсказка «это нажимается». На телефоне наведения нет, поэтому смысл не должен держаться только на нём.' },
		{ id: 'focus', name: 'Фокус', style: 'outline:3px solid #ffdd00;outline-offset:2px', note: 'Виден, когда на кнопку перешли клавишей Tab. Убирать его нельзя: тогда клавиатурный пользователь теряется (WCAG 2.4.7).' },
		{ id: 'pressed', name: 'Нажатие', style: 'transform:translateY(2px);filter:brightness(.92)', note: 'Короткая реакция, пока нажата. Подтверждает, что нажатие принято.' },
		{ id: 'disabled', name: 'Недоступно', style: 'opacity:.5;cursor:not-allowed', note: 'Действие сейчас невозможно. Объясните почему рядом: серая кнопка без пояснения раздражает.' },
		{ id: 'loading', name: 'Загрузка', style: 'opacity:.8;cursor:progress', note: 'Идёт работа. Подпись меняется («Отправляем…»), а повторное нажатие блокируется.' }
	];
	let st = $state<St>('normal');
	const curSt = $derived(states.find((s) => s.id === st)!);
</script>

<figure class="dg">
	<figcaption>Страница как набор деталей: пять уровней Брэда Фроста</figcaption>
	<div class="dg-ctl" role="group" aria-label="Уровень">
		{#each levels as l (l.id)}
			<button type="button" aria-pressed={level === l.id} onclick={() => (level = l.id)}>{l.name}</button>
		{/each}
	</div>

	<div class="mock" class:l-atom={level === 'atom'} class:l-molecule={level === 'molecule'} class:l-organism={level === 'organism'} class:l-template={template} role="group" aria-label="Схема страницы">
		<div class="org header">
			<span class="atom brand">{t(brief.title)}</span>
			<span class="atom link">{t('Меню')}</span>
		</div>
		<div class="org section">
			<div class="dh atom">{t('Что мы делаем')}</div>
			<div class="grid">
				{#each brief.items as it, k (k)}
					<div class="mol card">
						<span class="atom ttl">{t(it)}</span>
						<span class="atom txt">{t('Описание в одну строку')}</span>
						<span class="atom link">{t('Подробнее')}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="org hero">
			<span class="atom cta">{t(brief.action)}</span>
		</div>
	</div>
	<p class="dg-out" aria-live="polite"><strong>{cur.name}.</strong> {cur.text}</p>

	<div class="dh sub">Состояния одной кнопки</div>
	<div class="dg-ctl" role="group" aria-label="Состояние кнопки">
		{#each states as s (s.id)}
			<button type="button" aria-pressed={st === s.id} onclick={() => (st = s.id)}>{s.name}</button>
		{/each}
	</div>
	<div class="stage">
		<span class="b" style={curSt.style}>{st === 'loading' ? 'Отправляем…' : brief.action}</span>
	</div>
	<p class="dg-out" aria-live="polite">{curSt.note}</p>
</figure>

<style>
	.sub {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.mock {
		background: #faf9f7;
		color: #1c1b19;
		padding: var(--space-3);
		display: grid;
		gap: var(--space-3);
		font-family: system-ui, sans-serif;
		font-size: 0.85rem;
	}
	.org {
		padding: var(--space-2);
		border: 1px dashed transparent;
	}
	.header {
		display: flex;
		justify-content: space-between;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	.card {
		display: grid;
		gap: 2px;
		padding: var(--space-2);
		border: 1px solid #d9d5ce;
		background: #fff;
	}
	.dh.atom {
		margin: 0;
		font-size: 1rem;
	}
	.cta {
		display: inline-block;
		background: #0b5cad;
		color: #fff;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		font-weight: 600;
	}
	.link {
		color: #0b4a8b;
		text-decoration: underline;
	}
	.l-atom .atom {
		outline: 2px solid #c2410c;
		outline-offset: 1px;
	}
	.l-molecule .mol {
		outline: 2px solid #c2410c;
		outline-offset: 2px;
	}
	.l-organism .org {
		border: 2px dashed #c2410c;
	}
	.l-template .org {
		border: 2px dashed #6a665f;
	}
	.l-template .card,
	.l-template .cta {
		background: #e6e2da;
		color: #6a665f;
	}
	.stage {
		padding: var(--space-5);
		background: #faf9f7;
		border: var(--line) solid var(--border-hairline);
	}
	.b {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1.2rem;
		background: #0b5cad;
		color: #fff;
		border-radius: 8px;
		font-weight: 600;
		font-family: system-ui, sans-serif;
	}
</style>
