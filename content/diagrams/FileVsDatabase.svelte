<!--
	«Двое правят одно и то же» (part 7, lesson 1). The same two edits twice: once in a plain file,
	once in a database. Step by step, the person sees the file lose an edit (both editors read the old
	value) and the database make the second editor wait for the first. The numbers are invented; the
	item's name comes from the person's own brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			item: 'вашу услугу',
			quote: (t: string) => `«${t}»`,
			title: 'Двое правят одно и то же',
			groupLabel: 'Где хранятся данные',
			fileBtn: 'Файл на диске',
			dbBtn: 'База данных',
			editorA: 'Редактор A',
			editorB: 'Редактор B',
			file: 'Файл',
			table: 'Таблица',
			seats: 'свободных мест',
			step: (n: number, of: number) => `Шаг ${n} из ${of}.`,
			back: 'Назад',
			next: 'Дальше',
			restart: 'Сначала',
			alt: 'Текстовая альтернатива:',
			altText: 'в файле два редактора прочитали 10, оба записали 9, и одна заявка потерялась. В базе данных второй редактор ждёт, пока первый подтвердит правку, читает уже 9 и записывает 8: обе правки сохранены. Числа в схеме придуманы.',
			steps: (item: string): Record<Mode, Step[]> => ({
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
			})
		},
		en: {
			item: 'your service',
			quote: (t: string) => `“${t}”`,
			title: 'Two people edit the same thing',
			groupLabel: 'Where the data is stored',
			fileBtn: 'A file on disk',
			dbBtn: 'A database',
			editorA: 'Editor A',
			editorB: 'Editor B',
			file: 'File',
			table: 'Table',
			seats: 'seats left',
			step: (n: number, of: number) => `Step ${n} of ${of}.`,
			back: 'Back',
			next: 'Next',
			restart: 'Start over',
			alt: 'Text alternative:',
			altText: 'in the file, two editors read 10 and both write 9, so one booking is lost. In the database, the second editor waits until the first has confirmed the edit, then reads 9 and writes 8: both edits are kept. The numbers in the diagram are invented.',
			steps: (item: string): Record<Mode, Step[]> => ({
				file: [
					{ who: '—', what: `The file says: seats left for ${item}: 10.`, a: 'hasn’t read yet', b: 'hasn’t read yet', store: 10, note: 'The file just sits on a disk. It doesn’t know two people will edit it.' },
					{ who: 'A', what: 'Editor A opened the file and read: 10.', a: 'sees 10', b: 'hasn’t read yet', store: 10, note: 'A is about to record that one seat is taken: it should become 9.' },
					{ who: 'B', what: 'Editor B opened the same file and also read: 10.', a: 'sees 10', b: 'sees 10', store: 10, note: 'The file stopped nobody: reading at the same time is allowed.' },
					{ who: 'A', what: 'A wrote 9 into the file.', a: 'wrote 9', b: 'sees 10', store: 9, note: 'All is well. For now.' },
					{ who: 'B', what: 'B wrote 9 into the file: after all, B counted from the 10 it had read.', a: 'wrote 9', b: 'wrote 9', store: 9, note: 'Two seats were taken, yet the file says 9 instead of 8. A’s edit is lost, and nobody got an error. This is a “lost update”.' }
				],
				db: [
					{ who: '—', what: `The table says: seats left for ${item}: 10.`, a: 'hasn’t started', b: 'hasn’t started', store: 10, note: 'The database itself keeps track of who changes what.' },
					{ who: 'A', what: 'A started a transaction and read the row: 10. The row is now “held” by A for writing.', a: 'sees 10, holds the row', b: 'hasn’t started', store: 10, note: 'The lock is set automatically once an edit has begun.' },
					{ who: 'B', what: 'B also wants to change this row and… waits.', a: 'sees 10, holds the row', b: 'waits', store: 10, note: 'The database won’t let the second one start until the first has finished. That is what “isolation” means.' },
					{ who: 'A', what: 'A wrote 9 and confirmed it (COMMIT). The lock is released.', a: 'done: 9', b: 'waits', store: 9, note: 'A’s edit is now final and visible to everyone.' },
					{ who: 'B', what: 'B got the row, read the fresh value 9 and wrote 8.', a: 'done: 9', b: 'done: 8', store: 8, note: 'Two seats were taken, and the table says 8. Both edits are there, because the second came after the first, not alongside it.' }
				]
			})
		}
	});

	let item = $state(W.item);
	onMount(async () => {
		try {
			const t = (await (await import('#lib/learner.ts')).persona()).items?.[0]?.title;
			if (t) item = W.quote(t);
		} catch {
			/* the example stays */
		}
	});

	type Mode = 'file' | 'db';
	type Step = { who: 'A' | 'B' | '—'; what: string; a: string; b: string; store: number; note: string };

	const steps = $derived<Record<Mode, Step[]>>(W.steps(item));

	let mode = $state<Mode>('file');
	let at = $state(0);
	const list = $derived(steps[mode]);
	const cur = $derived(list[at]);
	const last = $derived(at === list.length - 1);
	const wrong = $derived(mode === 'file' && last);
</script>

<figure class="dg">
	<figcaption>{W.title}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.groupLabel}>
		<button type="button" aria-pressed={mode === 'file'} onclick={() => ((mode = 'file'), (at = 0))}>{W.fileBtn}</button>
		<button type="button" aria-pressed={mode === 'db'} onclick={() => ((mode = 'db'), (at = 0))}>{W.dbBtn}</button>
	</div>

	<div class="row" aria-live="polite">
		<div class="who" class:act={cur.who === 'A'}>
			<strong>{W.editorA}</strong>
			<span>{cur.a}</span>
		</div>
		<div class="store" class:bad={wrong}>
			<strong>{mode === 'file' ? W.file : W.table}</strong>
			<span class="num">{cur.store}</span>
			<span>{W.seats}</span>
		</div>
		<div class="who" class:act={cur.who === 'B'}>
			<strong>{W.editorB}</strong>
			<span>{cur.b}</span>
		</div>
	</div>

	<p class="dg-out" aria-live="polite"><strong>{W.step(at + 1, list.length)}</strong> {cur.what}</p>
	<p class="dg-out" class:bad-note={wrong}>{cur.note}</p>

	<div class="dg-ctl nav">
		<button type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0}>{W.back}</button>
		<button type="button" onclick={() => (at = Math.min(list.length - 1, at + 1))} disabled={last}>{W.next}</button>
		<button type="button" onclick={() => (at = 0)} disabled={at === 0}>{W.restart}</button>
	</div>

	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
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
