<!--
	«Кто что делает за вас» (part 4, lesson 9). A UI part, say a dialog, has four layers: structure,
	behaviour, accessibility and look. Each approach to a design system takes a different number of
	them off your hands. Pick an approach to see what is yours to write and what you inherit, and
	the price of that choice.
-->
<script lang="ts">
	import './shared.css';
	import { pick as byLocale } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = byLocale({
		ru: {
			layers: ['Структура', 'Поведение', 'Доступность', 'Вид'],
			rows: {
				native: ['Обычный HTML (dialog, details)', 'Браузер знает, как открыть и закрыть, как ловить фокус и что сказать диктору. Вид пишете вы.', 'Поведение ограничено тем, что умеет браузер.'],
				headless: ['Безстилевые компоненты (Radix, React Aria, Headless UI)', 'Берёте сложное поведение и доступность готовыми, вид пишете сами. Такие компоненты называют «безголовыми».', 'Нужен фреймворк (чаще React) и привычка собирать вид самому.'],
				copy: ['Копируемый код (shadcn/ui)', 'Код компонента попадает в ваш репозиторий вместе с начальным видом. Он ваш: меняйте как угодно.', 'Обновлять и чинить скопированное придётся вам.'],
				styled: ['Готовая система (Polaris, Primer, Material UI)', 'Всё готово и согласовано, включая вид. Быстрее всего начать.', 'Вид и устройство навязаны: чужой характер, зависимость от версий.'],
				utility: ['Утилиты (Tailwind CSS)', 'Даёт только словарь вида: короткие классы из ваших токенов. Структуру, поведение и доступность пишете сами.', 'Ответственность за доступность на вас, а разметка пухнет от классов.']
			} as Record<string, string[]>,
			caption: 'Кто что делает за вас: четыре слоя любой детали интерфейса',
			approach: 'Подход',
			table: 'Что даёт выбранный подход',
			done: 'готово',
			yours: 'пишете вы',
			price: 'Цена выбора.'
		},
		en: {
			layers: ['Structure', 'Behavior', 'Accessibility', 'Look'],
			rows: {
				native: ['Plain HTML (dialog, details)', 'The browser knows how to open and close, how to trap focus and what to tell a screen reader. You write the look.', 'The behavior is limited to what the browser can do.'],
				headless: ['Unstyled components (Radix, React Aria, Headless UI)', 'You take complex behavior and accessibility ready-made and write the look yourself. Such components are called “headless”.', 'You need a framework (most often React) and the habit of building the look yourself.'],
				copy: ['Copied code (shadcn/ui)', 'The component’s code lands in your repository along with a starting look. It is yours: change it however you like.', 'You will have to update and fix what you copied.'],
				styled: ['A ready-made system (Polaris, Primer, Material UI)', 'Everything is ready and consistent, the look included. The quickest way to start.', 'The look and the structure are imposed: someone else’s character, and a dependence on versions.'],
				utility: ['Utilities (Tailwind CSS)', 'Gives only a vocabulary for the look: short classes from your tokens. You write the structure, behavior and accessibility yourself.', 'Accessibility is your responsibility, and the markup swells with classes.']
			} as Record<string, string[]>,
			caption: 'Who does what for you: the four layers of any interface part',
			approach: 'Approach',
			table: 'What the chosen approach gives',
			done: 'ready',
			yours: 'you write it',
			price: 'The price of the choice.'
		}
	});
	const layers = W.layers;
	type Row = { id: string; gives: [boolean, boolean, boolean, boolean] };
	const rows: Row[] = [
		{ id: 'native', gives: [true, true, true, false] },
		{ id: 'headless', gives: [true, true, true, false] },
		{ id: 'copy', gives: [true, true, true, true] },
		{ id: 'styled', gives: [true, true, true, true] },
		{ id: 'utility', gives: [false, false, false, true] }
	];
	let picked = $state('native');
	const cur = $derived(rows.find((r) => r.id === picked)!);
	const text = (id: string) => W.rows[id];
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.approach}>
		{#each rows as r (r.id)}
			<button type="button" aria-pressed={picked === r.id} onclick={() => (picked = r.id)}>{text(r.id)[0]}</button>
		{/each}
	</div>
	<table class="tbl" aria-label={W.table}>
		<thead>
			<tr>{#each layers as l (l)}<th>{l}</th>{/each}</tr>
		</thead>
		<tbody>
			<tr>
				{#each cur.gives as g, i (i)}
					<td class:yes={g}>{g ? W.done : W.yours}</td>
				{/each}
			</tr>
		</tbody>
	</table>
	<p class="dg-out" aria-live="polite"><strong>{text(cur.id)[0]}.</strong> {text(cur.id)[1]}</p>
	<p class="dg-out"><strong>{W.price}</strong> {text(cur.id)[2]}</p>
</figure>

<style>
	.tbl {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		margin-top: var(--space-3);
	}
	.tbl th,
	.tbl td {
		padding: var(--space-3);
		text-align: center;
		border: var(--line) solid var(--border-hairline);
	}
	.tbl td {
		color: var(--text-secondary);
	}
	.tbl td.yes {
		color: var(--text-primary);
		background: var(--surface-canvas);
		border-color: var(--border-brass);
	}
</style>
