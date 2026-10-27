<!--
	«Радар языков» (part 6, lesson 4). Nine server-side languages scored on six axes, two of them
	drawn at once on a radar. The scores are judgements, not measurements, and the page says so
	in its caption: they are a starting point for the person's own weighing, which is the practice.
	Each language also carries what it is typically used for and a few well-known examples.
-->
<script lang="ts">
	import './shared.css';

	const axes = ['Старт проекта', 'Скорость работы', 'Параллельность', 'Экосистема', 'Найм в России', 'Порог входа'];
	type Lang = { id: string; name: string; s: number[]; use: string; known: string };
	const langs: Lang[] = [
		{ id: 'php', name: 'PHP', s: [5, 3, 2, 5, 5, 4], use: 'сайты на движках и недорогой хостинг', known: 'WordPress, 1С-Битрикс, Википедия (MediaWiki), ВКонтакте в прошлом' },
		{ id: 'py', name: 'Python', s: [5, 2, 3, 5, 4, 5], use: 'быстрая разработка, данные, нейросети', known: 'Django (например, Instagram), научные и аналитические сервисы' },
		{ id: 'rb', name: 'Ruby', s: [5, 2, 2, 4, 2, 4], use: 'быстрое создание веб-продуктов на Rails', known: 'GitHub, Shopify, Basecamp' },
		{ id: 'java', name: 'Java', s: [2, 4, 4, 5, 5, 2], use: 'корпоративные системы, банки, большие порталы', known: 'банковские и корпоративные системы, Android-бэкенды, Spring' },
		{ id: 'cs', name: 'C#', s: [3, 4, 4, 4, 3, 3], use: 'корпоративные системы, игры (Unity), экосистема Microsoft', known: 'Stack Overflow, .NET-сервисы' },
		{ id: 'go', name: 'Go', s: [3, 5, 5, 3, 3, 3], use: 'простые быстрые сервисы и инфраструктурные инструменты', known: 'Docker, Kubernetes' },
		{ id: 'node', name: 'JavaScript (Node.js)', s: [5, 3, 4, 5, 5, 4], use: 'один язык в браузере и на сервере, прототипы, живые соединения', known: 'сервисы Netflix и PayPal, множество стартапов' },
		{ id: 'ex', name: 'Elixir', s: [3, 4, 5, 2, 1, 2], use: 'чаты, потоки событий, устойчивые системы', known: 'Discord (сообщения), Phoenix' },
		{ id: 'rs', name: 'Rust', s: [1, 5, 5, 3, 1, 1], use: 'сервисы, где нужны предельная скорость и безопасность памяти', known: 'отдельные сервисы Cloudflare и Discord' }
	];
	let a = $state('php');
	let b = $state('go');
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
	const total = (l: Lang) => l.s.reduce((x, y) => x + y, 0);
</script>

<figure class="dg">
	<figcaption>Сравните два языка</figcaption>
	<div class="pick">
		<label>Первый
			<select bind:value={a}>{#each langs as l (l.id)}<option value={l.id}>{l.name}</option>{/each}</select>
		</label>
		<label>Второй
			<select bind:value={b}>{#each langs as l (l.id)}<option value={l.id}>{l.name}</option>{/each}</select>
		</label>
	</div>
	<div class="wrap">
		<svg viewBox="0 0 300 280" role="img" aria-label="Радар: {la.name} и {lb.name} по шести критериям">
			{#each [1, 2, 3, 4, 5] as k (k)}
				<polygon points={poly(axes.map(() => k))} class="ring" />
			{/each}
			{#each axes as ax, i (ax)}
				<line x1={cx} y1={cy} x2={pt(i, 5)[0]} y2={pt(i, 5)[1]} class="ring" />
				<text x={pt(i, 5.9)[0]} y={pt(i, 5.9)[1]} text-anchor="middle" font-size="9">{ax}</text>
			{/each}
			<polygon points={poly(la.s)} class="a" />
			<polygon points={poly(lb.s)} class="b" />
		</svg>
		<div class="info">
			<p><span class="key a"></span><strong>{la.name}</strong> (сумма {total(la)}): {la.use}. Известные примеры: {la.known}.</p>
			<p><span class="key b"></span><strong>{lb.name}</strong> (сумма {total(lb)}): {lb.use}. Известные примеры: {lb.known}.</p>
		</div>
	</div>
	<p class="note">Оценки от 1 до 5, где 5 лучше для проекта (для порога входа это «легко начать»). Это суждения автора урока, а не замеры: сумма не определяет выбор, и ваш проект может весить критерии по-разному.</p>
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
