<!--
	«Каскад сообщений» (part 13, lesson 1). A made-up cascade of three messages after a sign-up, three
	made-up visitors, and three switches: a pause between messages, an exit condition («записался,
	остановить») and a second channel for those who did not open the first letter. The simulator
	prints what each visitor receives, day by day, and marks the three mistakes automation makes
	when a rule is missing: a burst on one day, a message to someone who has already acted, and a
	message through a channel the person never agreed to. Nothing is sent; everything is made up.
-->
<script lang="ts">
	import './shared.css';

	let pause = $state(true);
	let exitOnBook = $state(true);
	let telegramForSilent = $state(false);

	type Visitor = { name: string; story: string; opens: boolean; bookDay: number | null; telegram: boolean };
	const visitors: Visitor[] = [
		{ name: 'Анна', story: 'прочла первое письмо и записалась на следующий день', opens: true, bookDay: 1, telegram: true },
		{ name: 'Борис', story: 'прочёл первое письмо, но пока думает', opens: true, bookDay: null, telegram: true },
		{ name: 'Вера', story: 'не открыла письмо; согласие дала только на почту', opens: false, bookDay: null, telegram: false }
	];

	type Line = { day: number; text: string; status: 'ok' | 'skip' | 'blocked' | 'extra' | 'burst'; note: string };

	function run(v: Visitor): Line[] {
		const days = pause ? [0, 2, 5] : [0, 0, 0];
		const kinds = ['Приветствие: что вы получили и что дальше', 'Пример: как это выглядело у других (доказать)', 'Предложение: записаться (предложить)'];
		return days.map((day, i) => {
			let channel = 'e-mail';
			if (i === 1 && telegramForSilent && !v.opens) channel = 'Telegram';
			const text = `${channel}: ${kinds[i]}`;
			if (channel === 'Telegram' && !v.telegram) return { day, text, status: 'blocked', note: 'нет согласия на этот канал, сообщение отправлять нельзя' };
			if (v.bookDay !== null && day >= v.bookDay) {
				return exitOnBook
					? { day, text, status: 'skip', note: 'пропущено: человек уже записался' }
					: { day, text, status: 'extra', note: 'лишнее: просим сделать то, что человек уже сделал' };
			}
			if (!pause && i > 0) return { day, text, status: 'burst', note: 'всё в один день: похоже на спам' };
			return { day, text, status: 'ok', note: '' };
		});
	}
	const result = $derived(visitors.map((v) => ({ v, lines: run(v) })));
	const problems = $derived(result.flatMap((r) => r.lines).filter((l) => ['blocked', 'extra', 'burst'].includes(l.status)).length);
	const mark: Record<Line['status'], string> = { ok: 'отправлено', skip: 'не отправлено', blocked: 'ошибка', extra: 'ошибка', burst: 'ошибка' };
</script>

<figure class="dg">
	<figcaption>Один каскад, три человека</figcaption>
	<div class="dg-ctl" role="group" aria-label="Правила каскада">
		<label><input type="checkbox" bind:checked={pause} /> пауза между сообщениями (0, 2 и 5 день)</label>
		<label><input type="checkbox" bind:checked={exitOnBook} /> условие выхода: записался, остановить</label>
		<label><input type="checkbox" bind:checked={telegramForSilent} /> не открыл письмо: второе сообщение в Telegram</label>
	</div>

	<div class="people">
		{#each result as r (r.v.name)}
			<div class="dg-box">
				<div class="dh">{r.v.name}</div>
				<p class="story">{r.v.story}</p>
				<ol>
					{#each r.lines as l, i (i)}
						<li class={l.status}>
							<span class="d">день {l.day}</span> <span>{l.text}</span>
							<span class="st">{mark[l.status]}{l.note ? `: ${l.note}` : ''}</span>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		{#if problems === 0}
			Ни одной ошибки: никого не завалили сообщениями, никому не написали лишнего и ни одно сообщение не ушло по каналу без согласия.
		{:else}
			<strong>Ошибок: {problems}.</strong> Каждая означает, что в сценарии не хватает одного правила: паузы, условия выхода или проверки согласия на канал.
		{/if}
	</p>
	<p class="dg-out">Люди и письма выдуманы. Сообщения не отправляются: схема показывает только логику сценария.</p>
</figure>

<style>
	.people {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-3);
	}
	.dh {
		margin: 0;
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.story {
		margin: var(--space-1) 0 var(--space-3);
		color: var(--text-secondary);
	}
	ol {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	li {
		display: grid;
		gap: 2px;
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
	}
	li.ok {
		border-left-color: var(--accent-measure);
	}
	li.blocked,
	li.extra,
	li.burst {
		border-left-color: currentColor;
		font-weight: var(--weight-medium);
	}
	.d {
		font-family: var(--font-mono);
		font-size: 0.85em;
		color: var(--text-secondary);
	}
	.st {
		font-size: 0.85em;
		color: var(--text-secondary);
	}
</style>
