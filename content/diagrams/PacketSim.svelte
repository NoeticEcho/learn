<!--
	«Пакеты» (part 1, lesson 3). The person's own words are cut into numbered packets and sent over
	a network that loses some. The receiver reassembles them by number and asks again for the
	missing ones: that is all TCP does, and the person sees it round by round. The loss is
	pseudo-random from a seed, so a given press is repeatable and a new press differs.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick as byLocale } from '#lib/i18n/index.ts';

	const W = byLocale({
		ru: {
			sample: 'Кадастровый инженер и судебный эксперт: помогаю владельцам участков отстоять границы.',
			caption: 'Ваш текст путешествует кусками',
			loss: 'Потери в сети:',
			again: 'Отправить снова',
			none: 'Без потерь',
			cut: 'Отправитель режет текст на пронумерованные пакеты (нажмите на пакет)',
			no: '№',
			q: ['«', '»'],
			from: 'откуда',
			to: 'куда',
			packet: 'пакет',
			of: 'из',
			data: 'данные:',
			legend: '203.0.113.7 и 198.51.100.20 это адреса узлов (так принято писать примеры). Число после двоеточия это порт: порт 443 принимает защищённый веб-трафик (HTTPS), а порт отправителя выбирает ваш компьютер.',
			round: 'Круг',
			prev: 'Предыдущий круг',
			next: 'Следующий круг',
			sent: 'Отправлено в этом круге: пакеты',
			arrived: 'Дошли, в порядке прибытия:',
			nothing: 'ни одного',
			lost: 'Потеряны:',
			askAgain: 'Получатель сообщает, каких номеров нет, и отправитель шлёт их снова.',
			allArrived: 'Все недостающие дошли.',
			assembled: 'Что собрал получатель: ',
			notYet: (n: number) => `пакет №${n} ещё не дошёл`,
			total: 'Всего отправлено пакетов:',
			inText: 'при',
			inTextEnd: 'в тексте. Лишняя работа из-за потерь:'
		},
		en: {
			sample: 'Land surveyor and expert witness: I help landowners settle their boundaries.',
			caption: 'Your text travels in pieces',
			loss: 'Network loss:',
			again: 'Send again',
			none: 'No loss',
			cut: 'The sender cuts the text into numbered packets (press a packet)',
			no: '#',
			q: ['“', '”'],
			from: 'from',
			to: 'to',
			packet: 'packet',
			of: 'of',
			data: 'data:',
			legend: '203.0.113.7 and 198.51.100.20 are the addresses of the nodes (the usual way to write examples). The number after the colon is the port: port 443 takes secure web traffic (HTTPS), and your computer chooses the sender’s port.',
			round: 'Round',
			prev: 'Previous round',
			next: 'Next round',
			sent: 'Sent in this round: packets',
			arrived: 'Arrived, in order of arrival:',
			nothing: 'none',
			lost: 'Lost:',
			askAgain: 'The receiver reports which numbers are missing, and the sender sends them again.',
			allArrived: 'All the missing ones arrived.',
			assembled: 'What the receiver has put together: ',
			notYet: (n: number) => `packet #${n} hasn’t arrived yet`,
			total: 'Packets sent in all:',
			inText: 'for',
			inTextEnd: 'in the text. Extra work caused by loss:'
		}
	});

	let text = $state(W.sample);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			text = `${p.title}. ${p.who}`;
		} catch {
			/* the example stays */
		}
	});

	const N = 10;
	let loss = $state(30);
	let seed = $state(7);
	let view = $state(0);

	const rng = (s: number) => () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	const chunks = $derived.by(() => {
		const size = Math.ceil(text.length / N);
		return Array.from({ length: N }, (_, i) => text.slice(i * size, (i + 1) * size)).filter((c) => c.length);
	});

	const rounds = $derived.by(() => {
		const r = rng(seed * 1000 + loss);
		let missing = chunks.map((_, i) => i);
		const out: { sent: number[]; arrived: number[]; lost: number[] }[] = [];
		while (missing.length && out.length < 12) {
			const survived = missing.filter(() => r() * 100 >= loss);
			// the network may deliver packets in another order than they were sent
			const arrived = survived
				.map((i) => [r(), i] as const)
				.sort((a, b) => a[0] - b[0])
				.map((x) => x[1]);
			out.push({ sent: missing, arrived, lost: missing.filter((i) => !survived.includes(i)) });
			missing = out[out.length - 1].lost;
		}
		return out;
	});
	const k = $derived(Math.min(view, rounds.length - 1));
	const have = $derived(new Set(rounds.slice(0, k + 1).flatMap((x) => x.arrived)));
	const sentTotal = $derived(rounds.reduce((s, x) => s + x.sent.length, 0));
	const resend = (n: number) => () => {
		view = 0;
		loss = n;
	};
	let pick = $state(2);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.loss} {loss}%
			<input type="range" min="0" max="60" step="5" bind:value={loss} oninput={() => (view = 0)} />
		</label>
		<button type="button" onclick={() => ((seed = seed + 1), (view = 0))}>{W.again}</button>
		<button type="button" onclick={resend(0)}>{W.none}</button>
	</div>

	<div class="dh">{W.cut}</div>
	<ol class="pk">
		{#each chunks as c, i (i)}
			<li><button type="button" class:on={pick === i} aria-pressed={pick === i} onclick={() => (pick = i)}><b>{W.no}{i + 1}</b> {c}</button></li>
		{/each}
	</ol>
	<p class="dg-box dg-mono hdr" aria-live="polite">
		{W.from} 203.0.113.7:51514 → {W.to} 198.51.100.20:443 | {W.packet} {W.no}{pick + 1} {W.of} {chunks.length} | {W.data} {W.q[0]}{chunks[pick]}{W.q[1]}
	</p>
	<p class="legend">{W.legend}</p>

	<div class="dh">{W.round} {k + 1} {W.of} {rounds.length}</div>
	<div class="dg-ctl">
		<button type="button" disabled={k === 0} onclick={() => (view = k - 1)}>{W.prev}</button>
		<button type="button" disabled={k >= rounds.length - 1} onclick={() => (view = k + 1)}>{W.next}</button>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.sent} {rounds[k].sent.map((i) => i + 1).join(', ')}.
		{W.arrived} {rounds[k].arrived.length ? rounds[k].arrived.map((i) => i + 1).join(', ') : W.nothing}.
		{#if rounds[k].lost.length}{W.lost} {rounds[k].lost.map((i) => i + 1).join(', ')}. {W.askAgain}{:else}{W.allArrived}{/if}
	</p>
	<p class="asm">
		<span class="visually-hidden">{W.assembled}</span>{#each chunks as c, i (i)}{#if have.has(i)}<span>{c}</span>{:else}<span class="gap" title={W.notYet(i + 1)}>▒▒</span>{/if}{/each}
	</p>
	<p class="dg-out">
		{W.total} <strong>{sentTotal}</strong> {W.inText} {chunks.length} {W.inTextEnd} <strong>{sentTotal - chunks.length}</strong>.
	</p>
</figure>

<style>
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.pk {
		list-style: none;
		padding: 0 !important;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.pk button {
		text-align: left;
		min-height: var(--hit-min);
	}
	.hdr {
		margin: var(--space-3) 0 0;
	}
	.legend {
		margin: var(--space-2) 0 0;
		color: var(--text-secondary);
		max-width: var(--measure);
	}
	.asm {
		margin: var(--space-3) 0 0;
		padding: var(--space-3);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}
	.gap {
		color: var(--text-secondary);
	}
</style>
