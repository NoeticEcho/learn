<!--
	«Двое правят одно и то же» (part 7, lesson 1). The same two edits twice: once in a plain file,
	once in a database. Step by step, the person sees the file lose an edit (both editors read the old
	value) and the database make the second editor wait for the first. The numbers are invented; the
	item's name comes from the person's own brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let item = $state('вашу услугу');
	onMount(async () => {
		try {
			const t = (await (await import('#lib/learner.ts')).persona()).items?.[0]?.title;
			if (t) item = `«${t}»`;
		} catch {
			/* the example stays */
		}
	});

	type Mode = 'file' | 'db';
	type Step = { who: 'A' | 'B' | '—'; what: string; a: string; b: string; store: number; note: string };

	const steps = $derived<Record<Mode, Step[]>>({
		file: [
			{ who: '—', what: `В файле написано: свободных мест на ${item} — 10.`, a: 'ещё не читал', b: 'ещё не читал', store: 10, note: 'Файл просто лежит на диске. Он не знает, что его будут править двое.' },
			{ who: 'A', what: 'Редактор A открыл файл и прочитал: 10.', a: 'видит 10', b: 'ещё не читал', store: 10, note: 'A собирается записать, что одно место занято: должно стать 9.' },
			{ who: 'B', what: 'Редактор B открыл тот же файл и тоже прочитал: 10.', a: 'видит 10', b: 'видит 10', store: 10, note: 'Файл никого не остановил: читать одновременно можно.' },
			{ who: 'A', what: 'A записал в файл 9.', a: 'записал 9', b: 'видит 10', store: 9, note: 'Всё в порядке. Пока.' },
			{ who: 'B', what: 'B записал в файл 9: он ведь считал от своих 10.', a: 'записал 9', b: 'записал 9', store: 9, note: 'Заняли два места, а в файле стало 9 вместо 8. Правка A потеряна, и никто не получил ошибку. Это «потерянное обновление».' }
		],
		db: [
			{ who: '—', what: `В таблице: свободных мест на ${item} — 10.`, a: 'ещё не начинал', b: 'ещё не начинал', store: 10, note: 'База данных сама следит за тем, кто и что в ней меняет.' },
			{ who: 'A', what: 'A начал транзакцию и прочитал строку: 10. Строка теперь «занята» им для записи.', a: 'видит 10, держит строку', b: 'ещё не начинал', store: 10, note: 'Блокировка ставится автоматически, когда правка начата.' },
			{ who: 'B', what: 'B тоже хочет изменить эту строку и… ждёт.', a: 'видит 10, держит строку', b: 'ждёт', store: 10, note: 'База не даёт второму начать, пока первый не закончил. Вот что значит «изолированность».' },
			{ who: 'A', what: 'A записал 9 и подтвердил (COMMIT). Блокировка снята.', a: 'готово: 9', b: 'ждёт', store: 9, note: 'Правка A теперь окончательная и видна всем.' },
			{ who: 'B', what: 'B получил строку, прочитал свежее значение 9 и записал 8.', a: 'готово: 9', b: 'готово: 8', store: 8, note: 'Заняли два места, и в таблице 8. Обе правки на месте, потому что вторая шла после первой, а не параллельно.' }
		]
	});

	let mode = $state<Mode>('file');
	let at = $state(0);
	const list = $derived(steps[mode]);
	const cur = $derived(list[at]);
	const last = $derived(at === list.length - 1);
	const wrong = $derived(mode === 'file' && last);
</script>

<figure class="dg">
	<figcaption>Двое правят одно и то же</figcaption>
	<div class="dg-ctl" role="group" aria-label="Где хранятся данные">
		<button type="button" aria-pressed={mode === 'file'} onclick={() => ((mode = 'file'), (at = 0))}>Файл на диске</button>
		<button type="button" aria-pressed={mode === 'db'} onclick={() => ((mode = 'db'), (at = 0))}>База данных</button>
	</div>

	<div class="row" aria-live="polite">
		<div class="who" class:act={cur.who === 'A'}>
			<strong>Редактор A</strong>
			<span>{cur.a}</span>
		</div>
		<div class="store" class:bad={wrong}>
			<strong>{mode === 'file' ? 'Файл' : 'Таблица'}</strong>
			<span class="num">{cur.store}</span>
			<span>свободных мест</span>
		</div>
		<div class="who" class:act={cur.who === 'B'}>
			<strong>Редактор B</strong>
			<span>{cur.b}</span>
		</div>
	</div>

	<p class="dg-out" aria-live="polite"><strong>Шаг {at + 1} из {list.length}.</strong> {cur.what}</p>
	<p class="dg-out" class:bad-note={wrong}>{cur.note}</p>

	<div class="dg-ctl nav">
		<button type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0}>Назад</button>
		<button type="button" onclick={() => (at = Math.min(list.length - 1, at + 1))} disabled={last}>Дальше</button>
		<button type="button" onclick={() => (at = 0)} disabled={at === 0}>Сначала</button>
	</div>

	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> в файле два редактора прочитали 10, оба записали 9, и одна заявка потерялась. В базе данных второй редактор ждёт, пока первый подтвердит правку, читает уже 9 и записывает 8: обе правки сохранены. Числа в схеме придуманы.</p>
</figure>

<style>
	.row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.who,
	.store {
		display: grid;
		gap: var(--space-1);
		align-content: start;
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	.who.act {
		border-color: var(--accent-measure);
	}
	.store {
		text-align: center;
	}
	.store.bad {
		border-color: var(--accent-measure);
	}
	.num {
		font-family: var(--font-serif);
		font-size: 2rem;
		color: var(--text-primary);
	}
	.bad-note {
		color: var(--text-primary);
	}
	.nav {
		margin-top: var(--space-4);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 36rem) {
		.row {
			grid-template-columns: 1fr;
		}
	}
</style>
