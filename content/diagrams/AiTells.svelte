<!--
	«Приметы шаблонной страницы» (part 4, lesson 15). A page assembled from the defaults that
	generated and template pages share: a violet-to-blue gradient, a default font, an empty promise
	in the headline, three equal cards with emoji, invented numbers. Eight switches replace each
	default with something taken from the person's own brief. The point is not that a machine made
	it: any template does this. The point is that specific words and one real decision cannot.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			fallback: { title: 'Ваш проект', who: 'Что вы делаете', forWhom: 'Для кого', action: 'Главное действие', items: ['Первый пункт', 'Второй пункт', 'Третий пункт'], proofs: [] as string[] },
			itemN: (i: number) => `Пункт ${i + 1}`,
			tells: {
				gradient: ['Фиолетово-синий градиент на первом экране', 'Один спокойный цвет из токенов'],
				headline: ['Заголовок-лозунг: «Инновационные решения для вашего бизнеса»', 'Название и суть из брифа'],
				sub: ['Подзаголовок «Мы поможем достичь новых высот»', 'Для кого это, конкретно'],
				cta: ['Кнопка «Get Started» на русской странице', 'Главное действие из брифа'],
				cards: ['Три одинаковые карточки с эмодзи и словами «Качество, Надёжность, Инновации»', 'Настоящие пункты проекта, без эмодзи'],
				stats: ['Выдуманные цифры: «10k+ клиентов, 99.9 %»', 'Реальные подтверждения из проекта'],
				font: ['Шрифт по умолчанию (Inter) и всё по центру', 'Свой шрифт и выравнивание по левому краю'],
				round: ['Всё скруглено одинаково и с большой тенью', 'Тонкие линии и одно скругление из токена']
			} as Record<string, string[]>,
			page: { headline: 'Инновационные решения для вашего бизнеса', sub: 'Мы поможем вам достичь новых высот. Ваш надёжный партнёр в мире технологий.', cta: 'Get Started', forLabel: 'Для:', cards: [['Инновации', 'Современные подходы'], ['Качество', 'Высокие стандарты'], ['Надёжность', 'Мы всегда рядом']], stats: '10k+ довольных клиентов · 99.9 % · 24/7', proofs: 'Здесь будут ваши подтверждения: документы, работы, люди' },
			caption: 'Одна страница, восемь шаблонных решений',
			legend: 'Заменить на своё',
			label: 'Шаблонная страница',
			replaced: 'Заменено:',
			of: 'из',
			done: 'Страница стала про ваш проект, а не про «любой бизнес». Дело не в том, что её сделал не ИИ, а в том, что в ней теперь есть то, чего не бывает в шаблоне: ваши слова и ваши решения.'
		},
		en: {
			fallback: { title: 'Your project', who: 'What you do', forWhom: 'Who it is for', action: 'Main action', items: ['First item', 'Second item', 'Third item'], proofs: [] as string[] },
			itemN: (i: number) => `Item ${i + 1}`,
			tells: {
				gradient: ['A violet-to-blue gradient on the first screen', 'One calm color from the tokens'],
				headline: ['A slogan for a headline: “Innovative solutions for your business”', 'The name and the point, from the brief'],
				sub: ['The subheading “We help you reach new heights”', 'Who it is for, specifically'],
				cta: ['A generic “Get Started” button', 'The main action from the brief'],
				cards: ['Three identical cards with emoji and the words “Innovation, Quality, Reliability”', 'The project’s real items, with no emoji'],
				stats: ['Invented numbers: “10k+ clients, 99.9%”', 'Real evidence from the project'],
				font: ['The default font (Inter) and everything centered', 'A font of your own and left alignment'],
				round: ['Everything rounded the same way, with a big shadow', 'Thin lines and one radius from a token']
			} as Record<string, string[]>,
			page: { headline: 'Innovative solutions for your business', sub: 'We help you reach new heights. Your trusted partner in the world of technology.', cta: 'Get Started', forLabel: 'For:', cards: [['Innovation', 'Modern approaches'], ['Quality', 'High standards'], ['Reliability', 'Always by your side']], stats: '10k+ happy clients · 99.9% · 24/7', proofs: 'Your evidence will go here: documents, work, people' },
			caption: 'One page, eight template decisions',
			legend: 'Replace with your own',
			label: 'A template page',
			replaced: 'Replaced:',
			of: 'of',
			done: 'The page is now about your project, not about “any business”. It isn’t that it wasn’t made by an AI: it now has what a template never has, your words and your decisions.'
		}
	});

	let b = $state({ ...W.fallback });
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			b = {
				title: p.title,
				who: p.who,
				forWhom: p.forWhom,
				action: p.mainAction.label,
				items: (p.items ?? []).map((x: { title: string }) => x.title).slice(0, 3).concat(['', '', '']).slice(0, 3).map((x: string, i: number) => x || W.itemN(i)),
				proofs: (p.proofs ?? []).map((x: { title: string }) => x.title).slice(0, 3)
			};
		} catch {
			/* the example words stay */
		}
	});

	const ids = ['gradient', 'headline', 'sub', 'cta', 'cards', 'stats', 'font', 'round'] as const;
	const tells = ids.map((id) => ({ id, name: W.tells[id][0], fix: W.tells[id][1] }));
	type Id = (typeof ids)[number];
	let on = $state<Record<Id, boolean>>({ gradient: false, headline: false, sub: false, cta: false, cards: false, stats: false, font: false, round: false });
	const count = $derived(Object.values(on).filter(Boolean).length);

	const stage = $derived(
		on.gradient
			? 'background:#faf9f7;color:#1c1b19'
			: 'background:linear-gradient(135deg,#6d28d9,#2563eb);color:#fff'
	);
	const fam = $derived(on.font ? 'font-family:Literata,Georgia,serif;text-align:left' : 'font-family:Inter,system-ui,sans-serif;text-align:center');
	const card = $derived(
		on.round
			? `border-top:2px solid ${on.gradient ? '#c9c4ba' : 'rgba(255,255,255,.5)'};padding:10px 2px`
			: 'border-radius:24px;box-shadow:0 12px 30px rgba(0,0,0,.28);background:rgba(255,255,255,.14);padding:16px;backdrop-filter:blur(6px)'
	);
	const btn = $derived(
		on.gradient
			? 'background:#0b5cad;color:#fff;border-radius:6px'
			: 'background:#fff;color:#4c1d95;border-radius:999px;box-shadow:0 8px 20px rgba(0,0,0,.3)'
	);
	const cards = $derived(on.cards ? b.items.map((t) => ({ icon: '', t, d: '' })) : [{ icon: '🚀', t: W.page.cards[0][0], d: W.page.cards[0][1] }, { icon: '⚡', t: W.page.cards[1][0], d: W.page.cards[1][1] }, { icon: '✨', t: W.page.cards[2][0], d: W.page.cards[2][1] }]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="cols">
		<fieldset class="sw">
			<legend>{W.legend}</legend>
			{#each tells as t (t.id)}
				<label>
					<input type="checkbox" bind:checked={on[t.id]} />
					<span><strong>{t.name}</strong><br /><span class="fix">{on[t.id] ? `→ ${t.fix}` : ''}</span></span>
				</label>
			{/each}
		</fieldset>
		<div class="page" style="{stage};{fam}" role="group" aria-label={W.label}>
			<h3>{on.headline ? b.title : W.page.headline}</h3>
			<p class="sub">{on.sub ? `${b.who}. ${W.page.forLabel} ${b.forWhom}` : W.page.sub}</p>
			<span class="btn" style={btn}>{on.cta ? b.action : W.page.cta}</span>
			<div class="cards">
				{#each cards as c, i (i)}
					<div style={card}>
						{#if c.icon}<div class="ico">{c.icon}</div>{/if}
						<strong>{c.t}</strong>
						{#if c.d}<div class="d">{c.d}</div>{/if}
					</div>
				{/each}
			</div>
			<p class="stats">
				{#if on.stats}
					{b.proofs.length ? b.proofs.join(' · ') : W.page.proofs}
				{:else}
					{W.page.stats}
				{/if}
			</p>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.replaced} <strong>{count} {W.of} {tells.length}</strong>.
		{#if count === tells.length}{W.done}{/if}
	</p>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	.sw {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.sw label {
		display: flex !important;
		align-items: flex-start !important;
		gap: var(--space-2);
		min-height: auto;
	}
	.fix {
		color: var(--text-secondary);
		font-size: 0.85rem;
	}
	.page {
		padding: var(--space-4);
		display: grid;
		gap: var(--space-3);
		justify-items: stretch;
	}
	h3 {
		margin: 0;
		font-size: 1.35rem;
		line-height: 1.15;
	}
	.sub {
		margin: 0;
		opacity: 0.92;
	}
	.btn {
		justify-self: center;
		padding: 0.5rem 1.2rem;
		font-weight: 600;
		font-family: system-ui, sans-serif;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
		gap: var(--space-2);
	}
	.ico {
		font-size: 1.5rem;
	}
	.d {
		font-size: 0.85rem;
		opacity: 0.9;
	}
	.stats {
		margin: 0;
		font-size: 0.9rem;
	}
</style>
