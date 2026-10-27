<!--
	«Пакеты» (part 1, lesson 3). The person's own words are cut into numbered packets and sent over
	a network that loses some. The receiver reassembles them by number and asks again for the
	missing ones: that is all TCP does, and the person sees it round by round. The loss is
	pseudo-random from a seed, so a given press is repeatable and a new press differs.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let text = $state('Кадастровый инженер и судебный эксперт: помогаю владельцам участков отстоять границы.');
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
	<figcaption>Ваш текст путешествует кусками</figcaption>
	<div class="dg-ctl">
		<label>
			Потери в сети: {loss}%
			<input type="range" min="0" max="60" step="5" bind:value={loss} oninput={() => (view = 0)} />
		</label>
		<button type="button" onclick={() => ((seed = seed + 1), (view = 0))}>Отправить снова</button>
		<button type="button" onclick={resend(0)}>Без потерь</button>
	</div>

	<div class="dh">Отправитель режет текст на пронумерованные пакеты (нажмите на пакет)</div>
	<ol class="pk">
		{#each chunks as c, i (i)}
			<li><button type="button" class:on={pick === i} aria-pressed={pick === i} onclick={() => (pick = i)}><b>№{i + 1}</b> {c}</button></li>
		{/each}
	</ol>
	<p class="dg-box dg-mono hdr" aria-live="polite">
		откуда 203.0.113.7:51514 → куда 198.51.100.20:443 | пакет №{pick + 1} из {chunks.length} | данные: «{chunks[pick]}»
	</p>
	<p class="legend">203.0.113.7 и 198.51.100.20 это адреса узлов (так принято писать примеры). Число после двоеточия это порт: порт 443 принимает защищённый веб-трафик (HTTPS), а порт отправителя выбирает ваш компьютер.</p>

	<div class="dh">Круг {k + 1} из {rounds.length}</div>
	<div class="dg-ctl">
		<button type="button" disabled={k === 0} onclick={() => (view = k - 1)}>Предыдущий круг</button>
		<button type="button" disabled={k >= rounds.length - 1} onclick={() => (view = k + 1)}>Следующий круг</button>
	</div>
	<p class="dg-out" aria-live="polite">
		Отправлено в этом круге: пакеты {rounds[k].sent.map((i) => i + 1).join(', ')}.
		Дошли, в порядке прибытия: {rounds[k].arrived.length ? rounds[k].arrived.map((i) => i + 1).join(', ') : 'ни одного'}.
		{#if rounds[k].lost.length}Потеряны: {rounds[k].lost.map((i) => i + 1).join(', ')}. Получатель сообщает, каких номеров нет, и отправитель шлёт их снова.{:else}Все недостающие дошли.{/if}
	</p>
	<p class="asm">
		<span class="visually-hidden">Что собрал получатель: </span>{#each chunks as c, i (i)}{#if have.has(i)}<span>{c}</span>{:else}<span class="gap" title="пакет №{i + 1} ещё не дошёл">▒▒</span>{/if}{/each}
	</p>
	<p class="dg-out">
		Всего отправлено пакетов: <strong>{sentTotal}</strong> при {chunks.length} в тексте. Лишняя работа из-за потерь: <strong>{sentTotal - chunks.length}</strong>.
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
