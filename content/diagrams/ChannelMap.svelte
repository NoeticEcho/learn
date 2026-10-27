<!--
	«Карта каналов» (part 13, lesson 4). Five channels (Telegram, ВКонтакте, Дзен, видео, e-mail) and six
	kinds of project. For the chosen kind the diagram shows the author's teaching estimate of how
	well the channel reaches that audience and how much work it asks, and suggests two channels to
	start with. The estimates are a way to practise the reasoning, not a market statistic: audiences
	and platform rules in Russia have changed several times since 2022 and will change again.
-->
<script lang="ts">
	import './shared.css';

	const kinds = ['expert', 'shop', 'venue', 'community', 'event', 'saas'] as const;
	type Kind = (typeof kinds)[number];
	const kindName: Record<Kind, string> = {
		expert: 'Эксперт с услугами',
		shop: 'Небольшой магазин',
		venue: 'Кафе, салон, место',
		community: 'Сообщество, НКО',
		event: 'Событие',
		saas: 'Сервис, приложение'
	};
	type Channel = { name: string; effort: number; why: string; reach: Record<Kind, number> };
	const channels: Channel[] = [
		{ name: 'Telegram-канал', effort: 2, why: 'короткие заметки, быстрая связь, боты для записи и вопросов', reach: { expert: 5, shop: 3, venue: 3, community: 5, event: 4, saas: 4 } },
		{ name: 'ВКонтакте', effort: 3, why: 'сообщество с витриной, события, местная аудитория, реклама внутри', reach: { expert: 3, shop: 5, venue: 5, community: 5, event: 5, saas: 2 } },
		{ name: 'Дзен и статьи', effort: 4, why: 'длинные тексты, находятся поиском, работают месяцами', reach: { expert: 4, shop: 2, venue: 1, community: 2, event: 1, saas: 3 } },
		{ name: 'Видео (VK Видео, RuTube, YouTube)', effort: 5, why: 'показать процесс и лицо; дорого по времени; доступность зависит от региона и года', reach: { expert: 2, shop: 3, venue: 3, community: 2, event: 3, saas: 4 } },
		{ name: 'E-mail', effort: 2, why: 'ваш собственный список: не зависит от платформы', reach: { expert: 4, shop: 4, venue: 2, community: 3, event: 3, saas: 5 } }
	];

	let kind = $state<Kind>('expert');
	const rows = $derived(
		channels
			.map((c) => ({ ...c, r: c.reach[kind], score: c.reach[kind] - c.effort / 2 }))
			.sort((a, b) => b.score - a.score)
	);
	const bar = (n: number) => '■'.repeat(n) + '□'.repeat(5 - n);
</script>

<figure class="dg">
	<figcaption>Где искать своих людей</figcaption>
	<div class="dg-ctl" role="group" aria-label="Тип проекта">
		{#each kinds as k (k)}
			<button type="button" aria-pressed={kind === k} onclick={() => (kind = k)}>{kindName[k]}</button>
		{/each}
	</div>
	<ol>
		{#each rows as c, i (c.name)}
			<li class:pick={i < 2}>
				<strong>{c.name}</strong>{#if i < 2} <span class="tag">начать с этого</span>{/if}
				<span class="dg-mono">охват {bar(c.r)}, усилие {bar(c.effort)}</span>
				<span class="why">{c.why}</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		Для проекта «{kindName[kind].toLowerCase()}» разумно начать с двух каналов: <strong>{rows[0].name}</strong> и <strong>{rows[1].name}</strong>. Сайт и почта остаются вашими при любой смене правил платформ.
	</p>
	<p class="dg-out">Оценки учебные, это не статистика рынка. Аудитории и ограничения площадок в России менялись с 2022 года несколько раз, поэтому перед запуском проверьте, что канал сегодня открывается у ваших людей.</p>
</figure>

<style>
	ol {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
	}
	li {
		display: grid;
		gap: 2px;
		padding: var(--space-2) var(--space-3);
		border-left: 3px solid var(--border-rule);
	}
	li.pick {
		border-left-color: var(--accent-measure);
	}
	.tag {
		font-size: 0.82em;
		color: var(--text-secondary);
	}
	.why {
		color: var(--text-secondary);
	}
</style>
