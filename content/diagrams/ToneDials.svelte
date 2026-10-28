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
	import { pick } from '#lib/i18n/index.ts';

	type Axis = { key: 'formal' | 'funny' | 'bold' | 'hot'; left: string; right: string };
	const W = pick({
		ru: {
			axes: [
				{ key: 'formal', left: 'формальный', right: 'разговорный' },
				{ key: 'funny', left: 'серьёзный', right: 'шутливый' },
				{ key: 'bold', left: 'уважительный', right: 'дерзкий' },
				{ key: 'hot', left: 'сдержанный', right: 'восторженный' }
			] as Axis[],
			names: { formal: 'деловой', warm: 'тёплый', bold: 'смелый', calm: 'спокойный' } as Record<string, string>,
			hero: (f: number, j: number, b: number, h: number) => {
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
			},
			button: (f: number, h: number) => (f >= 4 ? (h >= 4 ? 'Хочу записаться!' : 'Хочу записаться') : 'Записаться на консультацию'),
			error: (f: number, j: number, h: number) => {
				const sorry = f >= 4 ? 'Ой, ' : f <= 2 ? 'К сожалению, ' : '';
				const what = f >= 4 ? 'в номере не хватает цифр.' : 'в номере телефона не хватает цифр.';
				const fix = h >= 4 ? ' Допишите, и всё получится!' : ' Допишите номер и нажмите кнопку ещё раз.';
				const light = j >= 4 ? ' Цифры иногда разбегаются.' : '';
				return [sorry + what, light + fix] as const;
			},
			caption: 'Один и тот же текст разными голосами',
			position: 'Положение:',
			fromBrief: 'Тон из моего брифа',
			under: 'Под заголовком',
			btn: 'Кнопка',
			err: 'Ошибка в телефоне',
			note: 'Факты во всех вариантах те же. Меняется только то, как автор к ним относится. Ни одно положение не лучше другого: подходит то, что подходит вашим людям и моменту.',
			aria: (l: string, r: string, n: number) => `${l} или ${r}: ${n} из 5`
		},
		en: {
			axes: [
				{ key: 'formal', left: 'formal', right: 'casual' },
				{ key: 'funny', left: 'serious', right: 'funny' },
				{ key: 'bold', left: 'respectful', right: 'irreverent' },
				{ key: 'hot', left: 'matter-of-fact', right: 'enthusiastic' }
			] as Axis[],
			names: { formal: 'formal', warm: 'warm', bold: 'bold', calm: 'calm' } as Record<string, string>,
			hero: (f: number, j: number, b: number, h: number) => {
				const open = h >= 4 ? 'Great to meet you!' : h <= 2 ? 'Consultation.' : 'Here is how a consultation works.';
				const body =
					f <= 2
						? 'To book, please fill in the form. We will contact you within one business day.'
						: f >= 4
							? 'Leave your number and we’ll call you, usually the same day.'
							: 'Leave a request and we’ll contact you within one business day.';
				const jab = b >= 4 ? ' No queues, no lost requests.' : '';
				const joke = j >= 4 ? ' We promise not to call on Sundays.' : '';
				return `${open} ${body}${jab}${joke}`;
			},
			button: (f: number, h: number) => (f >= 4 ? (h >= 4 ? 'I want to book!' : 'I want to book') : 'Book a consultation'),
			error: (f: number, j: number, h: number) => {
				const sorry = f >= 4 ? 'Oops, ' : f <= 2 ? 'Sorry, ' : '';
				const what = f >= 4 ? 'the number is missing some digits.' : 'the phone number is missing some digits.';
				const fix = h >= 4 ? ' Add them and you’re all set!' : ' Add the rest and press the button again.';
				const light = j >= 4 ? ' Digits wander off sometimes.' : '';
				return [sorry + what, light + fix] as const;
			},
			caption: 'One text in different voices',
			position: 'Position:',
			fromBrief: 'Tone from my brief',
			under: 'Under the headline',
			btn: 'Button',
			err: 'Error in the phone',
			note: 'The facts are the same in every version. Only the author’s attitude to them changes. No position is better than another: what suits your people and the moment is right.',
			aria: (l: string, r: string, n: number) => `${l} or ${r}: ${n} of 5`
		}
	});
	const axes = W.axes;
	// starting points for the four tones of the brief, each axis from 1 to 5
	const starts: Record<string, [number, number, number, number]> = {
		formal: [1, 1, 1, 2],
		warm: [4, 2, 1, 4],
		bold: [4, 4, 4, 5],
		calm: [2, 1, 1, 1]
	};
	const names = W.names;

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

	const hero = $derived(W.hero(v[0], v[1], v[2], v[3]));
	const button = $derived(W.button(v[0], v[3]));
	const error = $derived.by(() => {
		const [head, rest] = W.error(v[0], v[1], v[3]);
		return head.charAt(0).toUpperCase() + head.slice(1) + rest;
	});
	const apply = () => {
		if (fromBrief && starts[fromBrief]) v = [...starts[fromBrief]];
	};
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	{#each axes as a, i (a.key)}
		<div class="row">
			<span class="l">{a.left}</span>
			<input type="range" min="1" max="5" step="1" bind:value={v[i]} aria-label={W.aria(a.left, a.right, v[i])} />
			<span class="r">{a.right}</span>
		</div>
	{/each}
	<div class="dg-ctl">
		<button type="button" onclick={apply} disabled={!fromBrief}>{W.fromBrief}{fromBrief ? `: ${names[fromBrief]}` : ''}</button>
		<span class="dg-out">{W.position} {v.join(' · ')}</span>
	</div>

	<div class="sample dg-box" aria-live="polite">
		<p class="k">{W.under}</p>
		<p>{hero}</p>
		<p class="k">{W.btn}</p>
		<p><span class="btn">{button}</span></p>
		<p class="k">{W.err}</p>
		<p>{error}</p>
	</div>
	<p class="dg-out">{W.note}</p>
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
