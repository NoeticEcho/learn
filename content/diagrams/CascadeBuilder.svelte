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
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			visitors: [
				{ name: 'Анна', story: 'прочла первое письмо и записалась на следующий день' },
				{ name: 'Борис', story: 'прочёл первое письмо, но пока думает' },
				{ name: 'Вера', story: 'не открыла письмо; согласие дала только на почту' }
			],
			kinds: ['Приветствие: что вы получили и что дальше', 'Пример: как это выглядело у других (доказать)', 'Предложение: записаться (предложить)'],
			email: 'e-mail',
			second: 'Telegram',
			blocked: 'нет согласия на этот канал, сообщение отправлять нельзя',
			skip: 'пропущено: человек уже записался',
			extra: 'лишнее: просим сделать то, что человек уже сделал',
			burst: 'всё в один день: похоже на спам',
			mark: { ok: 'отправлено', skip: 'не отправлено', blocked: 'ошибка', extra: 'ошибка', burst: 'ошибка' },
			caption: 'Один каскад, три человека',
			group: 'Правила каскада',
			pause: 'пауза между сообщениями (0, 2 и 5 день)',
			exit: 'условие выхода: записался, остановить',
			tg: 'не открыл письмо: второе сообщение в Telegram',
			day: 'день',
			none: 'Ни одной ошибки: никого не завалили сообщениями, никому не написали лишнего и ни одно сообщение не ушло по каналу без согласия.',
			errors: 'Ошибок',
			errorsAfter: 'Каждая означает, что в сценарии не хватает одного правила: паузы, условия выхода или проверки согласия на канал.',
			made: 'Люди и письма выдуманы. Сообщения не отправляются: схема показывает только логику сценария.'
		},
		en: {
			visitors: [
				{ name: 'Anna', story: 'read the first email and booked the next day' },
				{ name: 'Ben', story: 'read the first email but is still thinking' },
				{ name: 'Vera', story: 'did not open the email; agreed to email only' }
			],
			kinds: ['Welcome: what you got and what comes next', 'Example: how it went for others (prove)', 'Offer: book a consultation (offer)'],
			email: 'email',
			second: 'Text message',
			blocked: 'no consent for this channel, the message must not be sent',
			skip: 'skipped: the person has already booked',
			extra: 'redundant: asks the person to do what they already did',
			burst: 'all on one day: looks like spam',
			mark: { ok: 'sent', skip: 'not sent', blocked: 'mistake', extra: 'mistake', burst: 'mistake' },
			caption: 'One cascade, three people',
			group: 'Cascade rules',
			pause: 'a pause between messages (day 0, 2 and 5)',
			exit: 'exit condition: booked, so stop',
			tg: 'did not open the email: a second message by text',
			day: 'day',
			none: 'No mistakes: nobody was buried in messages, nobody got a redundant one, and no message went through a channel without consent.',
			errors: 'Mistakes',
			errorsAfter: 'Each one means the flow is missing a rule: a pause, an exit condition or a check of consent for the channel.',
			made: 'The people and emails are invented. Nothing is sent: the diagram shows only the logic of the flow.'
		}
	});

	let pause = $state(true);
	let exitOnBook = $state(true);
	let telegramForSilent = $state(false);

	type Visitor = { name: string; story: string; opens: boolean; bookDay: number | null; telegram: boolean };
	const rules = [
		{ opens: true, bookDay: 1, telegram: true },
		{ opens: true, bookDay: null, telegram: true },
		{ opens: false, bookDay: null, telegram: false }
	];
	const visitors: Visitor[] = rules.map((r, i) => ({ ...W.visitors[i], ...r }));

	type Line = { day: number; text: string; status: 'ok' | 'skip' | 'blocked' | 'extra' | 'burst'; note: string };

	function run(v: Visitor): Line[] {
		const days = pause ? [0, 2, 5] : [0, 0, 0];
		const kinds = W.kinds;
		return days.map((day, i) => {
			let channel = W.email;
			if (i === 1 && telegramForSilent && !v.opens) channel = W.second;
			const text = `${channel}: ${kinds[i]}`;
			if (channel === W.second && !v.telegram) return { day, text, status: 'blocked', note: W.blocked };
			if (v.bookDay !== null && day >= v.bookDay) {
				return exitOnBook
					? { day, text, status: 'skip', note: W.skip }
					: { day, text, status: 'extra', note: W.extra };
			}
			if (!pause && i > 0) return { day, text, status: 'burst', note: W.burst };
			return { day, text, status: 'ok', note: '' };
		});
	}
	const result = $derived(visitors.map((v) => ({ v, lines: run(v) })));
	const problems = $derived(result.flatMap((r) => r.lines).filter((l) => ['blocked', 'extra', 'burst'].includes(l.status)).length);
	const mark: Record<Line['status'], string> = W.mark;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		<label><input type="checkbox" bind:checked={pause} /> {W.pause}</label>
		<label><input type="checkbox" bind:checked={exitOnBook} /> {W.exit}</label>
		<label><input type="checkbox" bind:checked={telegramForSilent} /> {W.tg}</label>
	</div>

	<div class="people">
		{#each result as r (r.v.name)}
			<div class="dg-box">
				<div class="dh">{r.v.name}</div>
				<p class="story">{r.v.story}</p>
				<ol>
					{#each r.lines as l, i (i)}
						<li class={l.status}>
							<span class="d">{W.day} {l.day}</span> <span>{l.text}</span>
							<span class="st">{mark[l.status]}{l.note ? `: ${l.note}` : ''}</span>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		{#if problems === 0}
			{W.none}
		{:else}
			<strong>{W.errors}: {problems}.</strong> {W.errorsAfter}
		{/if}
	</p>
	<p class="dg-out">{W.made}</p>
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
