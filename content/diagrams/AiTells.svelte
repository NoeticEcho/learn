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

	let b = $state({
		title: 'Ваш проект',
		who: 'Что вы делаете',
		forWhom: 'Для кого',
		action: 'Главное действие',
		items: ['Первый пункт', 'Второй пункт', 'Третий пункт'],
		proofs: [] as string[]
	});
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			b = {
				title: p.title,
				who: p.who,
				forWhom: p.forWhom,
				action: p.mainAction.label,
				items: (p.items ?? []).map((x: { title: string }) => x.title).slice(0, 3).concat(['', '', '']).slice(0, 3).map((x: string, i: number) => x || `Пункт ${i + 1}`),
				proofs: (p.proofs ?? []).map((x: { title: string }) => x.title).slice(0, 3)
			};
		} catch {
			/* the example words stay */
		}
	});

	const tells = [
		{ id: 'gradient', name: 'Фиолетово-синий градиент на первом экране', fix: 'Один спокойный цвет из токенов' },
		{ id: 'headline', name: 'Заголовок-лозунг: «Инновационные решения для вашего бизнеса»', fix: 'Название и суть из брифа' },
		{ id: 'sub', name: 'Подзаголовок «Мы поможем достичь новых высот»', fix: 'Для кого это, конкретно' },
		{ id: 'cta', name: 'Кнопка «Get Started» на русской странице', fix: 'Главное действие из брифа' },
		{ id: 'cards', name: 'Три одинаковые карточки с эмодзи и словами «Качество, Надёжность, Инновации»', fix: 'Настоящие пункты проекта, без эмодзи' },
		{ id: 'stats', name: 'Выдуманные цифры: «10k+ клиентов, 99.9 %»', fix: 'Реальные подтверждения из проекта' },
		{ id: 'font', name: 'Шрифт по умолчанию (Inter) и всё по центру', fix: 'Свой шрифт и выравнивание по левому краю' },
		{ id: 'round', name: 'Всё скруглено одинаково и с большой тенью', fix: 'Тонкие линии и одно скругление из токена' }
	] as const;
	type Id = (typeof tells)[number]['id'];
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
	const cards = $derived(on.cards ? b.items.map((t) => ({ icon: '', t, d: '' })) : [{ icon: '🚀', t: 'Инновации', d: 'Современные подходы' }, { icon: '⚡', t: 'Качество', d: 'Высокие стандарты' }, { icon: '✨', t: 'Надёжность', d: 'Мы всегда рядом' }]);
</script>

<figure class="dg">
	<figcaption>Одна страница, восемь шаблонных решений</figcaption>
	<div class="cols">
		<fieldset class="sw">
			<legend>Заменить на своё</legend>
			{#each tells as t (t.id)}
				<label>
					<input type="checkbox" bind:checked={on[t.id]} />
					<span><strong>{t.name}</strong><br /><span class="fix">{on[t.id] ? `→ ${t.fix}` : ''}</span></span>
				</label>
			{/each}
		</fieldset>
		<div class="page" style="{stage};{fam}" role="group" aria-label="Шаблонная страница">
			<h3>{on.headline ? b.title : 'Инновационные решения для вашего бизнеса'}</h3>
			<p class="sub">{on.sub ? `${b.who}. Для: ${b.forWhom}` : 'Мы поможем вам достичь новых высот. Ваш надёжный партнёр в мире технологий.'}</p>
			<span class="btn" style={btn}>{on.cta ? b.action : 'Get Started'}</span>
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
					{b.proofs.length ? b.proofs.join(' · ') : 'Здесь будут ваши подтверждения: документы, работы, люди'}
				{:else}
					10k+ довольных клиентов · 99.9 % · 24/7
				{/if}
			</p>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		Заменено: <strong>{count} из {tells.length}</strong>.
		{#if count === tells.length}Страница стала про ваш проект, а не про «любой бизнес». Дело не в том, что её сделал не ИИ, а в том, что в ней теперь есть то, чего не бывает в шаблоне: ваши слова и ваши решения.{/if}
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
