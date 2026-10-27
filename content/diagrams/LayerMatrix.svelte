<!--
	«Кто что делает за вас» (part 4, lesson 9). A UI part, say a dialog, has four layers: structure,
	behaviour, accessibility and look. Each approach to a design system takes a different number of
	them off your hands. Pick an approach to see what is yours to write and what you inherit, and
	the price of that choice.
-->
<script lang="ts">
	import './shared.css';

	const layers = ['Структура', 'Поведение', 'Доступность', 'Вид'];
	type Row = { id: string; name: string; gives: [boolean, boolean, boolean, boolean]; note: string; price: string };
	const rows: Row[] = [
		{ id: 'native', name: 'Обычный HTML (dialog, details)', gives: [true, true, true, false], note: 'Браузер знает, как открыть и закрыть, как ловить фокус и что сказать диктору. Вид пишете вы.', price: 'Поведение ограничено тем, что умеет браузер.' },
		{ id: 'headless', name: 'Безстилевые компоненты (Radix, React Aria, Headless UI)', gives: [true, true, true, false], note: 'Берёте сложное поведение и доступность готовыми, вид пишете сами. Такие компоненты называют «безголовыми».', price: 'Нужен фреймворк (чаще React) и привычка собирать вид самому.' },
		{ id: 'copy', name: 'Копируемый код (shadcn/ui)', gives: [true, true, true, true], note: 'Код компонента попадает в ваш репозиторий вместе с начальным видом. Он ваш: меняйте как угодно.', price: 'Обновлять и чинить скопированное придётся вам.' },
		{ id: 'styled', name: 'Готовая система (Polaris, Primer, Material UI)', gives: [true, true, true, true], note: 'Всё готово и согласовано, включая вид. Быстрее всего начать.', price: 'Вид и устройство навязаны: чужой характер, зависимость от версий.' },
		{ id: 'utility', name: 'Утилиты (Tailwind CSS)', gives: [false, false, false, true], note: 'Даёт только словарь вида: короткие классы из ваших токенов. Структуру, поведение и доступность пишете сами.', price: 'Ответственность за доступность на вас, а разметка пухнет от классов.' }
	];
	let pick = $state('native');
	const cur = $derived(rows.find((r) => r.id === pick)!);
</script>

<figure class="dg">
	<figcaption>Кто что делает за вас: четыре слоя любой детали интерфейса</figcaption>
	<div class="dg-ctl" role="group" aria-label="Подход">
		{#each rows as r (r.id)}
			<button type="button" aria-pressed={pick === r.id} onclick={() => (pick = r.id)}>{r.name}</button>
		{/each}
	</div>
	<table class="tbl" aria-label="Что даёт выбранный подход">
		<thead>
			<tr>{#each layers as l (l)}<th>{l}</th>{/each}</tr>
		</thead>
		<tbody>
			<tr>
				{#each cur.gives as g, i (i)}
					<td class:yes={g}>{g ? 'готово' : 'пишете вы'}</td>
				{/each}
			</tr>
		</tbody>
	</table>
	<p class="dg-out" aria-live="polite"><strong>{cur.name}.</strong> {cur.note}</p>
	<p class="dg-out"><strong>Цена выбора.</strong> {cur.price}</p>
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
