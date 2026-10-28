<!--
	«Три способа сделать кнопку» (part 2, lesson 8). Three real controls: a native button, a div
	with a click handler, and a div that was given role="button" and tabindex="0" and still nothing
	else. The person tries them with the Tab key, Enter, Space and the mouse, and a table records
	what each did. The point is not told but found: the native element works everywhere, the others
	only where someone wrote the missing parts by hand.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			names: ['Нативный button', 'div с обработчиком клика', 'div с role="button" и tabindex="0"'],
			said: ['«кнопка»', 'ничего: для диктора это не кнопка, а обычный текст', '«кнопка», но руками ничего не делает с клавиатуры'],
			label: 'Записаться',
			focusOn: (n: string) => `Фокус пришёл на «${n}»`,
			fired: (n: string, key: boolean) => `«${n}» сработал ${key ? 'от клавиатуры' : 'от мыши'}`,
			yes: 'да',
			no: 'не было',
			never: 'не получит никогда',
			caption: 'Попробуйте нажать каждую «кнопку» с клавиатуры',
			intro: 'Нажмите Tab несколько раз, пока фокус не пройдёт по трём кнопкам, и на каждой нажмите Enter или Пробел. Потом нажмите их мышью. Ниже таблица запишет, что получилось.',
			nothing: 'Пока ничего не нажато.',
			cols: ['Что это', 'Получил фокус', 'Сработал с клавиатуры', 'Сработал мышью', 'Что скажет диктор'],
			reset: 'Сбросить',
			outro: [
				'Нативный ',
				' получает фокус от Tab, нажимается и Enter, и Пробелом, и диктор знает, что это кнопка. Всё это у него есть «из коробки». Остальные придётся доделывать вручную: добавить фокус, обработчик клавиш, роль. Поэтому первое правило ARIA: если есть подходящий нативный элемент, берите его.'
			]
		},
		en: {
			names: ['Native button', 'div with a click handler', 'div with role="button" and tabindex="0"'],
			said: ['“button”', 'nothing: to a screen reader this is plain text, not a button', '“button”, but it does nothing from the keyboard'],
			label: 'Book now',
			focusOn: (n: string) => `Focus arrived on “${n}”`,
			fired: (n: string, key: boolean) => `“${n}” fired from the ${key ? 'keyboard' : 'mouse'}`,
			yes: 'yes',
			no: 'no',
			never: 'will never get it',
			caption: 'Try pressing each “button” from the keyboard',
			intro: 'Press Tab a few times until focus has passed over all three buttons, and on each one press Enter or Space. Then click them with the mouse. The table below records what happened.',
			nothing: 'Nothing has been pressed yet.',
			cols: ['What it is', 'Got focus', 'Fired from the keyboard', 'Fired by the mouse', 'What a screen reader says'],
			reset: 'Reset',
			outro: [
				'A native ',
				' gets focus from Tab, fires on both Enter and Space, and a screen reader knows it is a button. It has all of that out of the box. The others have to be finished by hand: add focus, a key handler, a role. That is why the first rule of ARIA is to use the right native element if there is one.'
			]
		}
	});

	type Rec = { focus: boolean; key: boolean; mouse: boolean };
	const names = W.names;
	const said = W.said;
	let rec = $state<Rec[]>(names.map(() => ({ focus: false, key: false, mouse: false })));
	let last = $state('');

	const focus = (i: number) => {
		rec[i].focus = true;
		last = W.focusOn(names[i]);
	};
	const click = (i: number, e: MouseEvent) => {
		// a click made by Enter or Space has detail 0; a mouse click has 1 or more
		if (e.detail === 0) rec[i].key = true;
		else rec[i].mouse = true;
		last = W.fired(names[i], e.detail === 0);
	};
	const reset = () => {
		rec = names.map(() => ({ focus: false, key: false, mouse: false }));
		last = '';
	};
	const yes = (b: boolean) => (b ? W.yes : W.no);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>
	<div class="row">
		<button type="button" onfocus={() => focus(0)} onclick={(e) => click(0, e)}>{W.label}</button>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="fake" onclick={(e) => click(1, e)}>{W.label}</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fake" role="button" tabindex="0" onfocus={() => focus(2)} onclick={(e) => click(2, e)}>{W.label}</div>
	</div>
	<p class="dg-out" role="status">{last || W.nothing}</p>
	<table>
		<thead>
			<tr>
				{#each W.cols as c (c)}<th scope="col">{c}</th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each names as n, i (n)}
				<tr>
					<th scope="row">{n}</th>
					<td>{i === 1 ? W.never : yes(rec[i].focus)}</td>
					<td>{yes(rec[i].key)}</td>
					<td>{yes(rec[i].mouse)}</td>
					<td>{said[i]}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="dg-ctl"><button type="button" onclick={reset}>{W.reset}</button></div>
	<p class="dg-out">{W.outro[0]}<span class="dg-mono">button</span>{W.outro[1]}</p>
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
