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
	import { pick } from '#lib/i18n/index.ts';

	type Axes = { id: string; x: [string, string]; y: [string, string]; bad?: boolean };
	type Stage = { name: string; touch: string; mood: number; exit: boolean };
	const W = pick({
		ru: {
			presets: [
				{ id: 'scope', x: ['разово', 'сопровождение'], y: ['быстро', 'глубоко'] },
				{ id: 'who', x: ['для частных лиц', 'для компаний'], y: ['типовое решение', 'индивидуальное'] },
				{ id: 'bad', x: ['дёшево', 'дорого'], y: ['хуже', 'качественнее'], bad: true }
			] as Axes[],
			names: ['Мой проект', 'Конкурент А', 'Конкурент Б'],
			stages: [
				{ name: 'Заметил проблему', touch: 'Спустило колесо', mood: -2, exit: false },
				{ name: 'Ищет', touch: 'Поиск «ремонт велосипедов»', mood: -1, exit: false },
				{ name: 'Сравнивает', touch: 'Страница с ценами', mood: 0, exit: true },
				{ name: 'Обращается', touch: 'Форма записи', mood: 0, exit: true },
				{ name: 'Получает услугу', touch: 'Приёмка в мастерской', mood: 1, exit: false },
				{ name: 'После', touch: 'Звонок «всё ли хорошо»', mood: 2, exit: false }
			] as Stage[],
			capMap: 'Карта восприятия',
			capJourney: 'Путь клиента',
			show: 'Что показать',
			tabMap: 'Карта восприятия',
			tabJourney: 'Путь клиента',
			axesLabel: 'Оси',
			and: 'и',
			mapAria: 'Карта восприятия с тремя точками',
			axisAria: (n: string, a: string, b: string) => `${n}: ${a} или ${b}`,
			bad: 'Эти оси ничему не учат: все хотят дешевле и лучше, и каждый скажет, что он «в правом верхнем углу». Выберите оси, по которым клиенты действительно выбирают и по которым вы и конкуренты правда различаетесь.',
			close: (names: string[]) => `Ваша точка почти совпала с точкой «${names.join('», «')}»: чем вы отличаетесь от него по этим осям?`,
			apart: 'Вы стоите отдельно от конкурентов. Проверьте, что это правда, а не желание: поставьте точки по фактам с их сайтов и отзывов.',
			moodAria: 'Кривая настроения клиента по этапам пути',
			touch: 'Касание',
			mood: 'Настроение:',
			moodAt: (n: string) => `Настроение на этапе ${n}`,
			exitHere: 'Здесь люди уходят',
			lowest: (n: string) => `Самая низкая точка: «${n}».`,
			exits: (e: string[]) => `Места, где люди уходят: ${e.join(', ')}.`,
			noExits: 'Мест ухода вы не отметили: так не бывает, подумайте ещё.',
			work: 'Работать нужно там.'
		},
		en: {
			presets: [
				{ id: 'scope', x: ['one-off', 'ongoing support'], y: ['fast', 'in depth'] },
				{ id: 'who', x: ['for individuals', 'for companies'], y: ['standard solution', 'tailored'] },
				{ id: 'bad', x: ['cheap', 'expensive'], y: ['worse', 'better quality'], bad: true }
			] as Axes[],
			names: ['My project', 'Competitor A', 'Competitor B'],
			stages: [
				{ name: 'Notices the problem', touch: 'A flat tire', mood: -2, exit: false },
				{ name: 'Searches', touch: 'A search for “bike repair”', mood: -1, exit: false },
				{ name: 'Compares', touch: 'A page of prices', mood: 0, exit: true },
				{ name: 'Gets in touch', touch: 'A booking form', mood: 0, exit: true },
				{ name: 'Gets the service', touch: 'Drop-off at the workshop', mood: 1, exit: false },
				{ name: 'Afterwards', touch: 'A “was everything all right?” call', mood: 2, exit: false }
			] as Stage[],
			capMap: 'A perception map',
			capJourney: 'A customer journey',
			show: 'What to show',
			tabMap: 'Perception map',
			tabJourney: 'Customer journey',
			axesLabel: 'Axes',
			and: 'and',
			mapAria: 'A perception map with three points',
			axisAria: (n: string, a: string, b: string) => `${n}: ${a} or ${b}`,
			bad: 'These axes teach nothing: everyone wants cheaper and better, and everyone will say they are “in the top right corner”. Choose axes by which customers really choose and by which you and your competitors really differ.',
			close: (names: string[]) => `Your point almost coincides with “${names.join('”, “')}”: how do you differ from them on these axes?`,
			apart: 'You stand apart from your competitors. Check that it is true and not a wish: place the points by facts from their sites and reviews.',
			moodAria: 'The customer’s mood curve across the stages of the journey',
			touch: 'Touchpoint',
			mood: 'Mood:',
			moodAt: (n: string) => `Mood at the stage ${n}`,
			exitHere: 'People leave here',
			lowest: (n: string) => `The lowest point: “${n}”.`,
			exits: (e: string[]) => `Where people leave: ${e.join(', ')}.`,
			noExits: 'You marked no place where people leave: that never happens, think again.',
			work: 'That is where to work.'
		}
	});
	const presets = W.presets;
	let preset = $state('scope');
	const axes = $derived(presets.find((p) => p.id === preset)!);
	let pts = $state([
		{ name: W.names[0], x: 7, y: 6 },
		{ name: W.names[1], x: 2, y: 3 },
		{ name: W.names[2], x: 8, y: 8 }
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
	let stages = $state<Stage[]>(W.stages.map((s) => ({ ...s })));
	const sx = (i: number) => 40 + (i / (stages.length - 1)) * 220;
	const sy = (m: number) => 120 - m * 40;
	const curve = $derived(stages.map((s, i) => `${sx(i)},${sy(s.mood)}`).join(' '));
	const low = $derived(stages.reduce((a, s, i) => (s.mood < stages[a].mood ? i : a), 0));
	const exits = $derived(stages.filter((s) => s.exit).map((s) => s.name.toLowerCase()));
</script>

<figure class="dg">
	<figcaption>{tab === 'map' ? W.capMap : W.capJourney}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.show}>
		<button type="button" role="tab" aria-selected={tab === 'map'} onclick={() => (tab = 'map')}>{W.tabMap}</button>
		<button type="button" role="tab" aria-selected={tab === 'journey'} onclick={() => (tab = 'journey')}>{W.tabJourney}</button>
	</div>

	{#if tab === 'map'}
		<div class="dg-ctl" role="group" aria-label={W.axesLabel}>
			{#each presets as p (p.id)}
				<button type="button" aria-pressed={preset === p.id} onclick={() => (preset = p.id)}>{p.x[0]}–{p.x[1]} {W.and} {p.y[0]}–{p.y[1]}</button>
			{/each}
		</div>
		<div class="two">
			<svg viewBox="0 0 280 250" role="img" aria-label={W.mapAria}>
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
						<label>{axes.x[0]} … {axes.x[1]}: <strong>{p.x}</strong> <input type="range" min="0" max="10" step="1" bind:value={p.x} aria-label={W.axisAria(p.name, axes.x[0], axes.x[1])} /></label>
						<label>{axes.y[0]} … {axes.y[1]}: <strong>{p.y}</strong> <input type="range" min="0" max="10" step="1" bind:value={p.y} aria-label={W.axisAria(p.name, axes.y[0], axes.y[1])} /></label>
					</fieldset>
				{/each}
			</div>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if axes.bad}{W.bad}{/if}
			{#if close.length}{W.close(close)}{:else if !axes.bad}{W.apart}{/if}
		</p>
	{:else}
		<svg viewBox="0 0 300 180" role="img" aria-label={W.moodAria}>
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
					<label>{W.touch} <input type="text" bind:value={s.touch} /></label>
					<label>{W.mood} <strong>{s.mood}</strong> <input type="range" min="-2" max="2" step="1" bind:value={s.mood} aria-label={W.moodAt(s.name)} /></label>
					<label class="row"><input type="checkbox" bind:checked={s.exit} /> {W.exitHere}</label>
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">{W.lowest(stages[low].name.toLowerCase())} {exits.length ? W.exits(exits) : W.noExits} {W.work}</p>
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
