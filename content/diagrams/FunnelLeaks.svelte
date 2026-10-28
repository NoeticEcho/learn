<!--
	«Воронка с утечками» (part 11, lesson 8). Five stages of a made-up bicycle workshop's site, from
	«пришли» to «стали клиентами», with a conversion slider between each pair. The bars show who is
	left; the biggest loss is named. Four buttons paint the same funnel in the words of TOFU/MOFU/BOFU,
	See–Think–Do–Care and RACE, to show that they are three vocabularies for one path. The numbers are
	made up; the person's own come from analytics (part 14).
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Scheme = 'none' | 'tofu' | 'stdc' | 'race';
	const W = pick({
		ru: {
			stages: ['Пришли на сайт', 'Прочли материал', 'Открыли цены и условия', 'Оставили заявку', 'Стали клиентами'],
			labels: {
				none: [null, null, null, null, null],
				tofu: ['TOFU: верх воронки, внимание', 'TOFU: верх воронки, внимание', 'MOFU: середина, выбор', 'BOFU: низ, решение', 'BOFU: низ, решение'],
				stdc: ['See: видят, самая широкая аудитория', 'Think: думают, есть интерес', 'Do: делают, намерение купить', 'Do: делают, намерение купить', 'Care: заботимся о тех, кто уже клиент'],
				race: ['Reach: охват', 'Act: действие, вовлечение', 'Act: действие, вовлечение', 'Convert: превращение в клиентов', 'Engage: связь после покупки']
			} as Record<Scheme, (string | null)[]>,
			names: { none: 'Без разметки', tofu: 'TOFU, MOFU, BOFU', stdc: 'See–Think–Do–Care', race: 'RACE' } as Record<Scheme, string>,
			caption: 'Одна воронка, три словаря',
			vocab: 'Словарь',
			of: 'из',
			goOn: 'Переходят дальше:',
			aria: (s: string) => `Доля, переходящая с этапа «${s}» на следующий`,
			biggest: (a: string, b: string, n: number) => `Больше всего людей теряется между «${a}» и «${b}»: ушло ${n}.`,
			lowest: (s: string, p: number) => `Самый низкий процент перехода у этапа «${s}» (${p}%).`,
			ask: 'Спросите себя: что человек видел перед уходом и чего ему не хватило?',
			note: 'Числа придуманы для примера. Свои вы получите из счётчика посещений, когда подключите его в части про метрики.'
		},
		en: {
			stages: ['Came to the site', 'Read some material', 'Opened prices and terms', 'Made a request', 'Became customers'],
			labels: {
				none: [null, null, null, null, null],
				tofu: ['TOFU: top of the funnel, attention', 'TOFU: top of the funnel, attention', 'MOFU: middle, choosing', 'BOFU: bottom, deciding', 'BOFU: bottom, deciding'],
				stdc: ['See: they see, the widest audience', 'Think: they think, there is interest', 'Do: they do, the intent to buy', 'Do: they do, the intent to buy', 'Care: we care for those who are already customers'],
				race: ['Reach: reach', 'Act: action, engagement', 'Act: action, engagement', 'Convert: turning into customers', 'Engage: staying in touch after the purchase']
			} as Record<Scheme, (string | null)[]>,
			names: { none: 'No labels', tofu: 'TOFU, MOFU, BOFU', stdc: 'See–Think–Do–Care', race: 'RACE' } as Record<Scheme, string>,
			caption: 'One funnel, three vocabularies',
			vocab: 'Vocabulary',
			of: 'of',
			goOn: 'Go on to the next step:',
			aria: (s: string) => `The share that goes on from the step “${s}” to the next`,
			biggest: (a: string, b: string, n: number) => `Most people are lost between “${a}” and “${b}”: ${n} left.`,
			lowest: (s: string, p: number) => `The lowest rate of moving on is at the step “${s}” (${p}%).`,
			ask: 'Ask yourself: what did the person see before leaving, and what was missing for them?',
			note: 'The numbers are made up for the example. You’ll get your own from a visit counter, when you connect one in the part on metrics.'
		}
	});
	const stages = W.stages;
	let conv = $state([60, 35, 12, 40]);
	const start = 1000;
	const counts = $derived(
		stages.reduce<number[]>((acc, _, i) => {
			acc.push(i === 0 ? start : Math.round((acc[i - 1] * conv[i - 1]) / 100));
			return acc;
		}, [])
	);
	const lost = $derived(counts.slice(0, -1).map((c, i) => c - counts[i + 1]));
	const worst = $derived(lost.reduce((a, l, i) => (l > lost[a] ? i : a), 0));
	const weakest = $derived(conv.reduce((a, c, i) => (c < conv[a] ? i : a), 0));

	let scheme = $state<Scheme>('tofu');
	const labels = W.labels;
	const names = W.names;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.vocab}>
		{#each Object.keys(names) as k (k)}
			<button type="button" aria-pressed={scheme === k} onclick={() => (scheme = k as Scheme)}>{names[k as Scheme]}</button>
		{/each}
	</div>

	<ol class="bars">
		{#each stages as s, i (i)}
			<li>
				<div class="row">
					<span class="n">{s}</span>
					<span class="v"><strong>{counts[i]}</strong> {W.of} {start}</span>
				</div>
				<div class="bar" style="width: {Math.max(2, (counts[i] / start) * 100)}%" aria-hidden="true"></div>
				{#if labels[scheme][i]}<p class="tag">{labels[scheme][i]}</p>{/if}
				{#if i < stages.length - 1}
					<label class="c">
						{W.goOn} <strong>{conv[i]}%</strong>
						<input type="range" min="1" max="100" step="1" bind:value={conv[i]} aria-label={W.aria(s)} />
					</label>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{W.biggest(stages[worst].toLowerCase(), stages[worst + 1].toLowerCase(), lost[worst])} {W.lowest(stages[weakest].toLowerCase(), conv[weakest])} {W.ask}
	</p>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.bars {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.bar {
		height: 0.9rem;
		background: var(--accent-measure);
		margin: var(--space-1) 0;
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.tag {
		margin: 0;
		color: var(--text-secondary);
	}
	.c {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
		color: var(--text-secondary);
	}
</style>
