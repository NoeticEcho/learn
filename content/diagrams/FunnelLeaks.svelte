<!--
	«Воронка с утечками» (part 11, lesson 8). Five stages of a made-up bicycle workshop's site, from
	«пришли» to «стали клиентами», with a conversion slider between each pair. The bars show who is
	left; the biggest loss is named. Four buttons paint the same funnel in the words of TOFU/MOFU/BOFU,
	See–Think–Do–Care and RACE, to show that they are three vocabularies for one path. The numbers are
	made up; the person's own come from analytics (part 14).
-->
<script lang="ts">
	import './shared.css';

	const stages = ['Пришли на сайт', 'Прочли материал', 'Открыли цены и условия', 'Оставили заявку', 'Стали клиентами'];
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

	type Scheme = 'none' | 'tofu' | 'stdc' | 'race';
	let scheme = $state<Scheme>('tofu');
	const labels: Record<Scheme, (string | null)[]> = {
		none: [null, null, null, null, null],
		tofu: ['TOFU: верх воронки, внимание', 'TOFU: верх воронки, внимание', 'MOFU: середина, выбор', 'BOFU: низ, решение', 'BOFU: низ, решение'],
		stdc: ['See: видят, самая широкая аудитория', 'Think: думают, есть интерес', 'Do: делают, намерение купить', 'Do: делают, намерение купить', 'Care: заботимся о тех, кто уже клиент'],
		race: ['Reach: охват', 'Act: действие, вовлечение', 'Act: действие, вовлечение', 'Convert: превращение в клиентов', 'Engage: связь после покупки']
	};
	const names: Record<Scheme, string> = { none: 'Без разметки', tofu: 'TOFU, MOFU, BOFU', stdc: 'See–Think–Do–Care', race: 'RACE' };
</script>

<figure class="dg">
	<figcaption>Одна воронка, три словаря</figcaption>
	<div class="dg-ctl" role="group" aria-label="Словарь">
		{#each Object.keys(names) as k (k)}
			<button type="button" aria-pressed={scheme === k} onclick={() => (scheme = k as Scheme)}>{names[k as Scheme]}</button>
		{/each}
	</div>

	<ol class="bars">
		{#each stages as s, i (i)}
			<li>
				<div class="row">
					<span class="n">{s}</span>
					<span class="v"><strong>{counts[i]}</strong> из {start}</span>
				</div>
				<div class="bar" style="width: {Math.max(2, (counts[i] / start) * 100)}%" aria-hidden="true"></div>
				{#if labels[scheme][i]}<p class="tag">{labels[scheme][i]}</p>{/if}
				{#if i < stages.length - 1}
					<label class="c">
						Переходят дальше: <strong>{conv[i]}%</strong>
						<input type="range" min="1" max="100" step="1" bind:value={conv[i]} aria-label="Доля, переходящая с этапа «{s}» на следующий" />
					</label>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		Больше всего людей теряется между «{stages[worst].toLowerCase()}» и «{stages[worst + 1].toLowerCase()}»: ушло {lost[worst]}. Самый низкий процент перехода у этапа «{stages[weakest].toLowerCase()}» ({conv[weakest]}%). Спросите себя: что человек видел перед уходом и чего ему не хватило?
	</p>
	<p class="dg-out">Числа придуманы для примера. Свои вы получите из счётчика посещений, когда подключите его в части про метрики.</p>
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
