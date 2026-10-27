<!--
	«Три способа сделать кнопку» (part 2, lesson 8). Three real controls: a native button, a div
	with a click handler, and a div that was given role="button" and tabindex="0" and still nothing
	else. The person tries them with the Tab key, Enter, Space and the mouse, and a table records
	what each did. The point is not told but found: the native element works everywhere, the others
	only where someone wrote the missing parts by hand.
-->
<script lang="ts">
	import './shared.css';

	type Rec = { focus: boolean; key: boolean; mouse: boolean };
	const names = ['Нативный button', 'div с обработчиком клика', 'div с role="button" и tabindex="0"'] as const;
	const said = ['«кнопка»', 'ничего: для диктора это не кнопка, а обычный текст', '«кнопка», но руками ничего не делает с клавиатуры'] as const;
	let rec = $state<Rec[]>(names.map(() => ({ focus: false, key: false, mouse: false })));
	let last = $state('');

	const focus = (i: number) => {
		rec[i].focus = true;
		last = `Фокус пришёл на «${names[i]}»`;
	};
	const click = (i: number, e: MouseEvent) => {
		// a click made by Enter or Space has detail 0; a mouse click has 1 or more
		if (e.detail === 0) rec[i].key = true;
		else rec[i].mouse = true;
		last = `«${names[i]}» сработал ${e.detail === 0 ? 'от клавиатуры' : 'от мыши'}`;
	};
	const reset = () => {
		rec = names.map(() => ({ focus: false, key: false, mouse: false }));
		last = '';
	};
	const yes = (b: boolean) => (b ? 'да' : 'не было');
</script>

<figure class="dg">
	<figcaption>Попробуйте нажать каждую «кнопку» с клавиатуры</figcaption>
	<p class="dg-out">
		Нажмите Tab несколько раз, пока фокус не пройдёт по трём кнопкам, и на каждой нажмите Enter или Пробел. Потом нажмите их мышью. Ниже таблица запишет, что получилось.
	</p>
	<div class="row">
		<button type="button" onfocus={() => focus(0)} onclick={(e) => click(0, e)}>Записаться</button>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="fake" onclick={(e) => click(1, e)}>Записаться</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fake" role="button" tabindex="0" onfocus={() => focus(2)} onclick={(e) => click(2, e)}>Записаться</div>
	</div>
	<p class="dg-out" role="status">{last || 'Пока ничего не нажато.'}</p>
	<table>
		<thead>
			<tr><th scope="col">Что это</th><th scope="col">Получил фокус</th><th scope="col">Сработал с клавиатуры</th><th scope="col">Сработал мышью</th><th scope="col">Что скажет диктор</th></tr>
		</thead>
		<tbody>
			{#each names as n, i (n)}
				<tr>
					<th scope="row">{n}</th>
					<td>{i === 1 ? 'не получит никогда' : yes(rec[i].focus)}</td>
					<td>{yes(rec[i].key)}</td>
					<td>{yes(rec[i].mouse)}</td>
					<td>{said[i]}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="dg-ctl"><button type="button" onclick={reset}>Сбросить</button></div>
	<p class="dg-out">
		Нативный <span class="dg-mono">button</span> получает фокус от Tab, нажимается и Enter, и Пробелом, и диктор знает, что это кнопка. Всё это у него есть «из коробки». Остальные придётся доделывать вручную: добавить фокус, обработчик клавиш, роль. Поэтому первое правило ARIA: если есть подходящий нативный элемент, берите его.
	</p>
</figure>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.fake {
		display: inline-flex;
		align-items: center;
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		color: var(--text-body);
		cursor: pointer;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: var(--text-body-sm);
		display: block;
		overflow-x: auto;
	}
	th,
	td {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		vertical-align: top;
	}
	thead th {
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
</style>
