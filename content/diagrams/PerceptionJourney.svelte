<!--
	«Карта восприятия и путь клиента» (part 11, lesson 7), two tabs.
	1. A perception map: three points (the person's project and two competitors) on two axes the
	   person picks. The axes «цена» and «качество» are offered on purpose, and the page says why
	   they teach nothing. A point that lands on a competitor's is flagged.
	2. A customer journey of a made-up bicycle workshop: six stages, a touchpoint and a mood for
	   each (drawn as a curve) and a mark where people drop out. The lowest point and the exits are
	   named, since that is where the work is.
-->
<script lang="ts">
	import './shared.css';

	type Axes = { id: string; x: [string, string]; y: [string, string]; bad?: boolean };
	const presets: Axes[] = [
		{ id: 'scope', x: ['разово', 'сопровождение'], y: ['быстро', 'глубоко'] },
		{ id: 'who', x: ['для частных лиц', 'для компаний'], y: ['типовое решение', 'индивидуальное'] },
		{ id: 'bad', x: ['дёшево', 'дорого'], y: ['хуже', 'качественнее'], bad: true }
	];
	let preset = $state('scope');
	const axes = $derived(presets.find((p) => p.id === preset)!);
	let pts = $state([
		{ name: 'Мой проект', x: 7, y: 6 },
		{ name: 'Конкурент А', x: 2, y: 3 },
		{ name: 'Конкурент Б', x: 8, y: 8 }
	]);
	const close = $derived(
		pts
			.slice(1)
			.filter((p) => Math.hypot(p.x - pts[0].x, p.y - pts[0].y) < 1.6)
			.map((p) => p.name)
	);
	const px = (v: number) => 40 + (v / 10) * 220;
	const py = (v: number) => 220 - (v / 10) * 200;

	// journey
	let tab = $state<'map' | 'journey'>('map');
	type Stage = { name: string; touch: string; mood: number; exit: boolean };
	let stages = $state<Stage[]>([
		{ name: 'Заметил проблему', touch: 'Спустило колесо', mood: -2, exit: false },
		{ name: 'Ищет', touch: 'Поиск «ремонт велосипедов»', mood: -1, exit: false },
		{ name: 'Сравнивает', touch: 'Страница с ценами', mood: 0, exit: true },
		{ name: 'Обращается', touch: 'Форма записи', mood: 0, exit: true },
		{ name: 'Получает услугу', touch: 'Приёмка в мастерской', mood: 1, exit: false },
		{ name: 'После', touch: 'Звонок «всё ли хорошо»', mood: 2, exit: false }
	]);
	const sx = (i: number) => 40 + (i / (stages.length - 1)) * 220;
	const sy = (m: number) => 120 - m * 40;
	const curve = $derived(stages.map((s, i) => `${sx(i)},${sy(s.mood)}`).join(' '));
	const low = $derived(stages.reduce((a, s, i) => (s.mood < stages[a].mood ? i : a), 0));
	const exits = $derived(stages.filter((s) => s.exit).map((s) => s.name.toLowerCase()));
</script>

<figure class="dg">
	<figcaption>{tab === 'map' ? 'Карта восприятия' : 'Путь клиента'}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Что показать">
		<button type="button" role="tab" aria-selected={tab === 'map'} onclick={() => (tab = 'map')}>Карта восприятия</button>
		<button type="button" role="tab" aria-selected={tab === 'journey'} onclick={() => (tab = 'journey')}>Путь клиента</button>
	</div>

	{#if tab === 'map'}
		<div class="dg-ctl" role="group" aria-label="Оси">
			{#each presets as p (p.id)}
				<button type="button" aria-pressed={preset === p.id} onclick={() => (preset = p.id)}>{p.x[0]}–{p.x[1]} и {p.y[0]}–{p.y[1]}</button>
			{/each}
		</div>
		<div class="two">
			<svg viewBox="0 0 280 250" role="img" aria-label="Карта восприятия с тремя точками">
				<line x1="40" y1="220" x2="260" y2="220" stroke="currentColor" />
				<line x1="40" y1="20" x2="40" y2="220" stroke="currentColor" />
				<text x="40" y="240" font-size="10">{axes.x[0]}</text>
				<text x="260" y="240" font-size="10" text-anchor="end">{axes.x[1]}</text>
				<text x="36" y="216" font-size="10" text-anchor="end">{axes.y[0]}</text>
				<text x="36" y="28" font-size="10" text-anchor="end">{axes.y[1]}</text>
				{#each pts as p, i (i)}
					<circle cx={px(p.x)} cy={py(p.y)} r="8" fill={i === 0 ? 'var(--accent-measure)' : 'none'} stroke="currentColor" stroke-width="2" />
					<text x={px(p.x) + 11} y={py(p.y) + 4} font-size="11">{p.name}</text>
				{/each}
			</svg>
			<div class="sl">
				{#each pts as p, i (i)}
					<fieldset>
						<legend>{p.name}</legend>
						<label>{axes.x[0]} … {axes.x[1]}: <strong>{p.x}</strong> <input type="range" min="0" max="10" step="1" bind:value={p.x} aria-label="{p.name}: {axes.x[0]} или {axes.x[1]}" /></label>
						<label>{axes.y[0]} … {axes.y[1]}: <strong>{p.y}</strong> <input type="range" min="0" max="10" step="1" bind:value={p.y} aria-label="{p.name}: {axes.y[0]} или {axes.y[1]}" /></label>
					</fieldset>
				{/each}
			</div>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if axes.bad}Эти оси ничему не учат: все хотят дешевле и лучше, и каждый скажет, что он «в правом верхнем углу». Выберите оси, по которым клиенты действительно выбирают и по которым вы и конкуренты правда различаетесь.{/if}
			{#if close.length}Ваша точка почти совпала с точкой «{close.join('», «')}»: чем вы отличаетесь от него по этим осям?{:else if !axes.bad}Вы стоите отдельно от конкурентов. Проверьте, что это правда, а не желание: поставьте точки по фактам с их сайтов и отзывов.{/if}
		</p>
	{:else}
		<svg viewBox="0 0 300 180" role="img" aria-label="Кривая настроения клиента по этапам пути">
			<line x1="40" y1="120" x2="260" y2="120" stroke="currentColor" stroke-dasharray="3 3" />
			<polyline points={curve} fill="none" stroke="var(--accent-measure)" stroke-width="2" />
			{#each stages as s, i (i)}
				<circle cx={sx(i)} cy={sy(s.mood)} r="6" fill={s.exit ? '#d9534f' : 'currentColor'} />
				<text x={sx(i)} y="168" font-size="8" text-anchor="middle">{i + 1}</text>
			{/each}
		</svg>
		<ol class="stages">
			{#each stages as s, i (i)}
				<li>
					<strong>{i + 1}. {s.name}</strong>
					<label>Касание <input type="text" bind:value={s.touch} /></label>
					<label>Настроение: <strong>{s.mood}</strong> <input type="range" min="-2" max="2" step="1" bind:value={s.mood} aria-label="Настроение на этапе {s.name}" /></label>
					<label class="row"><input type="checkbox" bind:checked={s.exit} /> Здесь люди уходят</label>
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">Самая низкая точка: «{stages[low].name.toLowerCase()}». {exits.length ? `Места, где люди уходят: ${exits.join(', ')}.` : 'Мест ухода вы не отметили: так не бывает, подумайте ещё.'} Работать нужно там.</p>
	{/if}
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	svg {
		max-width: 26rem;
		width: 100%;
		color: var(--text-body);
	}
	.sl {
		display: grid;
		gap: var(--space-2);
	}
	fieldset {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-2) var(--space-3);
		display: grid;
		gap: var(--space-1);
	}
	legend {
		color: var(--text-primary);
	}
	.stages {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.stages li {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.stages input[type='text'] {
		padding: var(--space-2) var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
		width: 100%;
	}
	.row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
</style>
