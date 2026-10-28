<!--
	«Радар языков» (part 6, lesson 4). Nine server-side languages scored on six axes, two of them
	drawn at once on a radar. The scores are judgments, not measurements, and the page says so
	in its caption: they are a starting point for the person's own weighing, which is the practice.
	Each language also carries what it is typically used for and a few well-known examples.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words and the scores are in `W`,
	// one entry per edition. The English edition's fifth axis is hiring worldwide, and a switch shows
	// the Russian market beside it (`ruHire`) for comparison; the Russian edition's axis is the Russian market.
	type Lang = { id: string; name: string; s: number[]; use: string; known: string; ruHire?: number };
	const W = pick({
		ru: {
			axes: ['Старт проекта', 'Скорость работы', 'Параллельность', 'Экосистема', 'Найм в России', 'Порог входа'],
			langs: [
				{ id: 'php', name: 'PHP', s: [5, 3, 2, 5, 5, 4], use: 'сайты на движках и недорогой хостинг', known: 'WordPress, 1С-Битрикс, Википедия (MediaWiki), ВКонтакте в прошлом' },
				{ id: 'py', name: 'Python', s: [5, 2, 3, 5, 4, 5], use: 'быстрая разработка, данные, нейросети', known: 'Django (например, Instagram), научные и аналитические сервисы' },
				{ id: 'rb', name: 'Ruby', s: [5, 2, 2, 4, 2, 4], use: 'быстрое создание веб-продуктов на Rails', known: 'GitHub, Shopify, Basecamp' },
				{ id: 'java', name: 'Java', s: [2, 4, 4, 5, 5, 2], use: 'корпоративные системы, банки, большие порталы', known: 'банковские и корпоративные системы, Android-бэкенды, Spring' },
				{ id: 'cs', name: 'C#', s: [3, 4, 4, 4, 3, 3], use: 'корпоративные системы, игры (Unity), экосистема Microsoft', known: 'Stack Overflow, .NET-сервисы' },
				{ id: 'go', name: 'Go', s: [3, 5, 5, 3, 3, 3], use: 'простые быстрые сервисы и инфраструктурные инструменты', known: 'Docker, Kubernetes' },
				{ id: 'node', name: 'JavaScript (Node.js)', s: [5, 3, 4, 5, 5, 4], use: 'один язык в браузере и на сервере, прототипы, живые соединения', known: 'сервисы Netflix и PayPal, множество стартапов' },
				{ id: 'ex', name: 'Elixir', s: [3, 4, 5, 2, 1, 2], use: 'чаты, потоки событий, устойчивые системы', known: 'Discord (сообщения), Phoenix' },
				{ id: 'rs', name: 'Rust', s: [1, 5, 5, 3, 1, 1], use: 'сервисы, где нужны предельная скорость и безопасность памяти', known: 'отдельные сервисы Cloudflare и Discord' }
			] as Lang[],
			caption: 'Сравните два языка',
			first: 'Первый',
			second: 'Второй',
			market: '',
			hiringRu: '',
			markets: [] as string[],
			svg: (a: string, b: string) => `Радар: ${a} и ${b} по шести критериям`,
			summary: (n: number) => `(сумма ${n})`,
			examples: 'Известные примеры:',
			note: 'Оценки от 1 до 5, где 5 лучше для проекта (для порога входа это «легко начать»). Это суждения автора урока, а не замеры: сумма не определяет выбор, и ваш проект может весить критерии по-разному.'
		},
		en: {
			axes: ['Project start', 'Run speed', 'Concurrency', 'Ecosystem', 'Hiring', 'Entry barrier'],
			langs: [
				{ id: 'php', name: 'PHP', s: [5, 3, 2, 5, 4, 4], ruHire: 5, use: 'sites on content management systems and cheap hosting', known: 'WordPress, Drupal, Wikipedia (MediaWiki), early Facebook' },
				{ id: 'py', name: 'Python', s: [5, 2, 3, 5, 5, 5], ruHire: 4, use: 'fast development, data, neural networks', known: 'Django (Instagram, for one), scientific and analytical services' },
				{ id: 'rb', name: 'Ruby', s: [5, 2, 2, 4, 3, 4], ruHire: 2, use: 'building web products fast with Rails', known: 'GitHub, Shopify, Basecamp' },
				{ id: 'java', name: 'Java', s: [2, 4, 4, 5, 5, 2], ruHire: 5, use: 'enterprise systems, banks, big portals', known: 'banking and enterprise systems, Android backends, Spring' },
				{ id: 'cs', name: 'C#', s: [3, 4, 4, 4, 5, 3], ruHire: 3, use: 'enterprise systems, games (Unity), the Microsoft ecosystem', known: 'Stack Overflow, .NET services' },
				{ id: 'go', name: 'Go', s: [3, 5, 5, 3, 3, 3], ruHire: 3, use: 'simple fast services and infrastructure tools', known: 'Docker, Kubernetes' },
				{ id: 'node', name: 'JavaScript (Node.js)', s: [5, 3, 4, 5, 5, 4], ruHire: 5, use: 'one language in the browser and on the server, prototypes, live connections', known: 'services at Netflix and PayPal, a great many startups' },
				{ id: 'ex', name: 'Elixir', s: [3, 4, 5, 2, 1, 2], ruHire: 1, use: 'chats, event streams, resilient systems', known: 'Discord (messages), Phoenix' },
				{ id: 'rs', name: 'Rust', s: [1, 5, 5, 3, 2, 1], ruHire: 1, use: 'services that need extreme speed and memory safety', known: 'some services at Cloudflare and Discord' }
			] as Lang[],
			caption: 'Compare two languages',
			first: 'First',
			second: 'Second',
			market: 'Hiring market',
			hiringRu: 'Hiring in Russia',
			markets: ['Worldwide', 'Russia, for comparison'],
			svg: (a: string, b: string) => `Radar: ${a} and ${b} on six criteria`,
			summary: (n: number) => `(total ${n})`,
			examples: 'Well-known examples:',
			note: 'Scores run from 1 to 5, where 5 is better for a project (for the entry barrier it means “easy to start”). Hiring is judged worldwide, from what developers say they use in the Stack Overflow Developer Survey 2025, with the Russian market as an option to compare. These are the lesson author’s judgments, not measurements: the total doesn’t decide the choice, and your project may weigh the criteria differently.'
		}
	});

	const langs = W.langs;
	let a = $state('php');
	let b = $state('go');
	let market = $state(0);
	const hiring = 4;
	const scores = (l: Lang) => (market === 1 && l.ruHire !== undefined ? l.s.map((v, i) => (i === hiring ? l.ruHire! : v)) : l.s);
	const axes = $derived(market === 1 ? W.axes.map((x, i) => (i === hiring ? W.hiringRu : x)) : W.axes);
	const la = $derived(langs.find((l) => l.id === a)!);
	const lb = $derived(langs.find((l) => l.id === b)!);

	const cx = 150,
		cy = 140,
		r = 100;
	const pt = (i: number, v: number): [number, number] => {
		const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
		return [cx + Math.cos(ang) * r * (v / 5), cy + Math.sin(ang) * r * (v / 5)];
	};
	const poly = (s: number[]) => s.map((v, i) => pt(i, v).join(',')).join(' ');
	const total = (l: Lang) => scores(l).reduce((x, y) => x + y, 0);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="pick">
		<label>{W.first}
			<select bind:value={a}>{#each langs as l (l.id)}<option value={l.id}>{l.name}</option>{/each}</select>
		</label>
		<label>{W.second}
			<select bind:value={b}>{#each langs as l (l.id)}<option value={l.id}>{l.name}</option>{/each}</select>
		</label>
		{#if W.markets.length}
			<label>{W.market}
				<select bind:value={market}>{#each W.markets as m, i (m)}<option value={i}>{m}</option>{/each}</select>
			</label>
		{/if}
	</div>
	<div class="wrap">
		<svg viewBox="0 0 300 280" role="img" aria-label={W.svg(la.name, lb.name)}>
			{#each [1, 2, 3, 4, 5] as k (k)}
				<polygon points={poly(axes.map(() => k))} class="ring" />
			{/each}
			{#each axes as ax, i (i)}
				<line x1={cx} y1={cy} x2={pt(i, 5)[0]} y2={pt(i, 5)[1]} class="ring" />
				<text x={pt(i, 5.9)[0]} y={pt(i, 5.9)[1]} text-anchor="middle" font-size="9">{ax}</text>
			{/each}
			<polygon points={poly(scores(la))} class="a" />
			<polygon points={poly(scores(lb))} class="b" />
		</svg>
		<div class="info">
			<p><span class="key a"></span><strong>{la.name}</strong> {W.summary(total(la))}: {la.use}. {W.examples} {la.known}.</p>
			<p><span class="key b"></span><strong>{lb.name}</strong> {W.summary(total(lb))}: {lb.use}. {W.examples} {lb.known}.</p>
		</div>
	</div>
	<p class="note">{W.note}</p>
</figure>

<style>
	.pick {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}
	.pick label {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.wrap {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	svg {
		width: 100%;
		max-width: 22rem;
	}
	.ring {
		fill: none;
		stroke: var(--border-hairline);
	}
	polygon.a {
		fill: color-mix(in srgb, var(--accent-measure) 30%, transparent);
		stroke: var(--accent-measure);
		stroke-width: 2;
	}
	polygon.b {
		fill: color-mix(in srgb, var(--brass-300) 25%, transparent);
		stroke: var(--brass-300);
		stroke-width: 2;
	}
	.key {
		display: inline-block;
		width: 0.8rem;
		height: 0.8rem;
		margin-right: var(--space-2);
		border: 2px solid;
	}
	.key.a {
		border-color: var(--accent-measure);
	}
	.key.b {
		border-color: var(--brass-300);
	}
	.info p {
		margin: 0 0 var(--space-3);
	}
	.note {
		margin: var(--space-3) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
</style>
