<!--
	«Четыре оси тона» (part 10, lesson 5). The four dimensions Nielsen Norman Group found people
	notice (formal–casual, serious–funny, respectful–irreverent, matter-of-fact–enthusiastic), as
	four sliders. Three small texts (a line under the title, a button, an error) are assembled from
	the sliders by plain rules, so that the same message is heard in many voices. A button reads the
	person's tone from the brief and sets the sliders to a starting point.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Axis = { key: 'formal' | 'funny' | 'bold' | 'hot'; left: string; right: string };
	const axes: Axis[] = [
		{ key: 'formal', left: 'формальный', right: 'разговорный' },
		{ key: 'funny', left: 'серьёзный', right: 'шутливый' },
		{ key: 'bold', left: 'уважительный', right: 'дерзкий' },
		{ key: 'hot', left: 'сдержанный', right: 'восторженный' }
	];
	// starting points for the four tones of the brief, each axis from 1 to 5
	const starts: Record<string, [number, number, number, number]> = {
		formal: [1, 1, 1, 2],
		warm: [4, 2, 1, 4],
		bold: [4, 4, 4, 5],
		calm: [2, 1, 1, 1]
	};
	const names: Record<string, string> = { formal: 'деловой', warm: 'тёплый', bold: 'смелый', calm: 'спокойный' };

	let v = $state<number[]>([2, 1, 1, 1]);
	let fromBrief = $state<string | null>(null);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			fromBrief = p.tone;
		} catch {
			/* the sliders keep their start */
		}
	});

	const hero = $derived.by(() => {
		const [f, j, b, h] = v;
		const open = h >= 4 ? 'Рады познакомиться!' : h <= 2 ? 'Консультация.' : 'Расскажем, как проходит консультация.';
		const body =
			f <= 2
				? 'Для записи заполните форму. Мы свяжемся с вами в течение рабочего дня.'
				: f >= 4
					? 'Оставьте телефон, и мы вам позвоним, обычно в тот же день.'
					: 'Оставьте заявку, мы свяжемся с вами в течение рабочего дня.';
		const jab = b >= 4 ? ' Без очередей и пропавших заявок.' : '';
		const joke = j >= 4 ? ' Обещаем не звонить по воскресеньям.' : '';
		return `${open} ${body}${jab}${joke}`;
	});
	const button = $derived(v[0] >= 4 ? (v[3] >= 4 ? 'Хочу записаться!' : 'Хочу записаться') : 'Записаться на консультацию');
	const error = $derived.by(() => {
		const [f, j, , h] = v;
		const sorry = f >= 4 ? 'Ой, ' : f <= 2 ? 'К сожалению, ' : '';
		const what = f >= 4 ? 'в номере не хватает цифр.' : 'в номере телефона не хватает цифр.';
		const fix = h >= 4 ? ' Допишите, и всё получится!' : ' Допишите номер и нажмите кнопку ещё раз.';
		const light = j >= 4 ? ' Цифры иногда разбегаются.' : '';
		const s = sorry + what;
		return s.charAt(0).toUpperCase() + s.slice(1) + light + fix;
	});
	const apply = () => {
		if (fromBrief && starts[fromBrief]) v = [...starts[fromBrief]];
	};
</script>

<figure class="dg">
	<figcaption>Один и тот же текст разными голосами</figcaption>
	{#each axes as a, i (a.key)}
		<div class="row">
			<span class="l">{a.left}</span>
			<input type="range" min="1" max="5" step="1" bind:value={v[i]} aria-label="{a.left} или {a.right}: {v[i]} из 5" />
			<span class="r">{a.right}</span>
		</div>
	{/each}
	<div class="dg-ctl">
		<button type="button" onclick={apply} disabled={!fromBrief}>Тон из моего брифа{fromBrief ? `: ${names[fromBrief]}` : ''}</button>
		<span class="dg-out">Положение: {v.join(' · ')}</span>
	</div>

	<div class="sample dg-box" aria-live="polite">
		<p class="k">Под заголовком</p>
		<p>{hero}</p>
		<p class="k">Кнопка</p>
		<p><span class="btn">{button}</span></p>
		<p class="k">Ошибка в телефоне</p>
		<p>{error}</p>
	</div>
	<p class="dg-out">Факты во всех вариантах те же. Меняется только то, как автор к ним относится. Ни одно положение не лучше другого: подходит то, что подходит вашим людям и моменту.</p>
</figure>

<style>
	.row {
		display: grid;
		grid-template-columns: 7rem 1fr 7rem;
		gap: var(--space-3);
		align-items: center;
		margin-bottom: var(--space-2);
	}
	.l {
		text-align: right;
		color: var(--text-secondary);
	}
	.r {
		color: var(--text-secondary);
	}
	.sample p {
		margin: 0 0 var(--space-2);
	}
	.k {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		margin-top: var(--space-2) !important;
	}
	.btn {
		display: inline-block;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--accent-measure);
		color: var(--text-primary);
	}
	@media (max-width: 36rem) {
		.row {
			grid-template-columns: 1fr;
		}
		.l {
			text-align: left;
		}
	}
</style>
