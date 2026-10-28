<!--
	«Страница как набор деталей» (part 4, lesson 12). Two parts. First: Brad Frost's five levels
	laid over a small page of the person's project; choose a level and the parts of that level
	are outlined and named. Second: one button in the states a component needs, shown side by
	side so the differences can be compared; a note says which states a pointer cannot show.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			fallback: { title: 'Ваш проект', action: 'Главное действие', items: ['Первый пункт', 'Второй пункт', 'Третий пункт'] },
			levels: [
				['Атомы', 'Нельзя разобрать дальше, не потеряв смысл: заголовок, абзац, ссылка, кнопка, метка, поле. На схеме выделены обведённым.'],
				['Молекулы', 'Несколько атомов, работающих как одно целое: карточка пункта (заголовок, описание, ссылка), поле с подписью и подсказкой.'],
				['Организмы', 'Самостоятельная часть страницы из молекул и атомов: шапка с меню, секция с карточками, подвал.'],
				['Шаблон', 'Скелет страницы из организмов, без настоящих слов: так видно структуру отдельно от содержимого.'],
				['Страница', 'Шаблон с настоящим содержимым вашего проекта. Здесь выясняется, подходят ли детали к жизни: длинные названия, пустые поля.']
			],
			states: [
				['Обычное', 'Как кнопка выглядит, пока с ней ничего не делают.'],
				['Наведение', 'Подсказка «это нажимается». На телефоне наведения нет, поэтому смысл не должен держаться только на нём.'],
				['Фокус', 'Виден, когда на кнопку перешли клавишей Tab. Убирать его нельзя: тогда клавиатурный пользователь теряется (WCAG 2.4.7).'],
				['Нажатие', 'Короткая реакция, пока нажата. Подтверждает, что нажатие принято.'],
				['Недоступно', 'Действие сейчас невозможно. Объясните почему рядом: серая кнопка без пояснения раздражает.'],
				['Загрузка', 'Идёт работа. Подпись меняется («Отправляем…»), а повторное нажатие блокируется.']
			],
			caption: 'Страница как набор деталей: пять уровней Брэда Фроста',
			levelGroup: 'Уровень',
			mock: 'Схема страницы',
			menu: 'Меню',
			what: 'Что мы делаем',
			desc: 'Описание в одну строку',
			more: 'Подробнее',
			stateTitle: 'Состояния одной кнопки',
			stateGroup: 'Состояние кнопки',
			sending: 'Отправляем…'
		},
		en: {
			fallback: { title: 'Your project', action: 'Main action', items: ['First item', 'Second item', 'Third item'] },
			levels: [
				['Atoms', 'They cannot be taken apart further without losing meaning: a heading, a paragraph, a link, a button, a label, a field. On the diagram they are outlined.'],
				['Molecules', 'Several atoms working as one: an item card (a heading, a description, a link), a field with a label and a hint.'],
				['Organisms', 'A self-contained part of a page made of molecules and atoms: a header with a menu, a section with cards, a footer.'],
				['Template', 'The skeleton of a page made of organisms, with no real words: it shows the structure apart from the content.'],
				['Page', 'The template with the real content of your project. Here you find out whether the parts fit real life: long titles, empty fields.']
			],
			states: [
				['Default', 'How the button looks while nothing is being done to it.'],
				['Hover', 'A hint: “this can be pressed”. A phone has no hover, so the meaning must not rest on it alone.'],
				['Focus', 'Visible when the button has been reached with the Tab key. It must not be removed: a keyboard user would be lost (WCAG 2.4.7).'],
				['Pressed', 'A short reaction while it is pressed. It confirms that the press was received.'],
				['Disabled', 'The action is impossible right now. Explain why nearby: a gray button with no explanation is annoying.'],
				['Loading', 'Work is in progress. The label changes (“Sending…”) and a second press is blocked.']
			],
			caption: 'A page as a set of parts: Brad Frost’s five levels',
			levelGroup: 'Level',
			mock: 'A diagram of the page',
			menu: 'Menu',
			what: 'What we do',
			desc: 'A one-line description',
			more: 'Read more',
			stateTitle: 'The states of one button',
			stateGroup: 'State of the button',
			sending: 'Sending…'
		}
	});

	let brief = $state({ ...W.fallback });
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

	const ids = ['atom', 'molecule', 'organism', 'template', 'page'] as const;
	const levels = ids.map((id, i) => ({ id, name: W.levels[i][0], text: W.levels[i][1] }));
	let level = $state<(typeof ids)[number]>('atom');
	const cur = $derived(levels.find((l) => l.id === level)!);
	const template = $derived(level === 'template');
	const t = (s: string) => (template ? '▒▒▒▒▒' : s);

	type St = 'normal' | 'hover' | 'focus' | 'pressed' | 'disabled' | 'loading';
	const looks: Record<St, string> = {
		normal: '',
		hover: 'filter:brightness(1.18)',
		focus: 'outline:3px solid #ffdd00;outline-offset:2px',
		pressed: 'transform:translateY(2px);filter:brightness(.92)',
		disabled: 'opacity:.5;cursor:not-allowed',
		loading: 'opacity:.8;cursor:progress'
	};
	const stateIds: St[] = ['normal', 'hover', 'focus', 'pressed', 'disabled', 'loading'];
	const states = stateIds.map((id, i) => ({ id, name: W.states[i][0], style: looks[id], note: W.states[i][1] }));
	let st = $state<St>('normal');
	const curSt = $derived(states.find((s) => s.id === st)!);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.levelGroup}>
		{#each levels as l (l.id)}
			<button type="button" aria-pressed={level === l.id} onclick={() => (level = l.id)}>{l.name}</button>
		{/each}
	</div>

	<div class="mock" class:l-atom={level === 'atom'} class:l-molecule={level === 'molecule'} class:l-organism={level === 'organism'} class:l-template={template} role="group" aria-label={W.mock}>
		<div class="org header">
			<span class="atom brand">{t(brief.title)}</span>
			<span class="atom link">{t(W.menu)}</span>
		</div>
		<div class="org section">
			<div class="dh atom">{t(W.what)}</div>
			<div class="grid">
				{#each brief.items as it, k (k)}
					<div class="mol card">
						<span class="atom ttl">{t(it)}</span>
						<span class="atom txt">{t(W.desc)}</span>
						<span class="atom link">{t(W.more)}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="org hero">
			<span class="atom cta">{t(brief.action)}</span>
		</div>
	</div>
	<p class="dg-out" aria-live="polite"><strong>{cur.name}.</strong> {cur.text}</p>

	<div class="dh sub">{W.stateTitle}</div>
	<div class="dg-ctl" role="group" aria-label={W.stateGroup}>
		{#each states as s (s.id)}
			<button type="button" aria-pressed={st === s.id} onclick={() => (st = s.id)}>{s.name}</button>
		{/each}
	</div>
	<div class="stage">
		<span class="b" style={curSt.style}>{st === 'loading' ? W.sending : brief.action}</span>
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
		/* the mock page's own ink, not the diagram title's theme color (on Ink that was light on light) */
		color: inherit;
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
