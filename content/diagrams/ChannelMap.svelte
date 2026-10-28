<!--
	«Карта каналов» (part 13, lesson 4). Five channels (Telegram, ВКонтакте, Дзен, видео, e-mail) and six
	kinds of project. For the chosen kind the diagram shows the author's teaching estimate of how
	well the channel reaches that audience and how much work it asks, and suggests two channels to
	start with. The estimates are a way to practise the reasoning, not a market statistic: audiences
	and platform rules in Russia have changed several times since 2022 and will change again.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			kinds: { expert: 'Эксперт с услугами', shop: 'Небольшой магазин', venue: 'Кафе, салон, место', community: 'Сообщество, НКО', event: 'Событие', saas: 'Сервис, приложение' },
			channels: [
				{ name: 'Telegram-канал', why: 'короткие заметки, быстрая связь, боты для записи и вопросов' },
				{ name: 'ВКонтакте', why: 'сообщество с витриной, события, местная аудитория, реклама внутри' },
				{ name: 'Дзен и статьи', why: 'длинные тексты, находятся поиском, работают месяцами' },
				{ name: 'Видео (VK Видео, RuTube, YouTube)', why: 'показать процесс и лицо; дорого по времени; доступность зависит от региона и года' },
				{ name: 'E-mail', why: 'ваш собственный список: не зависит от платформы' }
			],
			rec: (k: string) => `Для проекта «${k}» разумно начать с двух каналов:`,
			and: 'и',
			rec2: 'Сайт и почта остаются вашими при любой смене правил платформ.',
			caption: 'Где искать своих людей',
			group: 'Тип проекта',
			start: 'начать с этого',
			reach: 'охват',
			effort: 'усилие',
			out: 'Оценки учебные: это способ потренировать рассуждение, а не статистика рынка. Аудитории и правила площадок в России с 2022 года менялись не раз и ещё изменятся, поэтому на день запуска проверьте, где ваши люди на самом деле.'
		},
		en: {
			kinds: { expert: 'An expert with services', shop: 'A small shop', venue: 'A café, a salon, a venue', community: 'A community, a nonprofit', event: 'An event', saas: 'A service, an app' },
			channels: [
				{ name: 'LinkedIn', why: 'short professional posts, direct messages to clients and colleagues' },
				{ name: 'Facebook and Instagram', why: 'a page with a shop window, events, local audiences, ads built in' },
				{ name: 'Articles and search', why: 'long texts that search finds, working for months' },
				{ name: 'Video (YouTube, TikTok, Reels)', why: 'show the process and the face; expensive in time' },
				{ name: 'Email', why: 'your own list: it does not depend on a platform' }
			],
			rec: (k: string) => `For “${k}” it makes sense to start with two channels:`,
			and: 'and',
			rec2: 'The site and the email list stay yours whatever the platforms’ rules do.',
			caption: 'Where to find your people',
			group: 'Type of project',
			start: 'start here',
			reach: 'reach',
			effort: 'effort',
			out: 'The scores are for teaching: a way to practice the reasoning, not market statistics. Audiences and platform rules keep changing, so on the day you launch check where your people really are.'
		}
	});

	const kinds = ['expert', 'shop', 'venue', 'community', 'event', 'saas'] as const;
	type Kind = (typeof kinds)[number];
	const kindName: Record<Kind, string> = W.kinds;
	type Channel = { name: string; effort: number; why: string; reach: Record<Kind, number> };
	const data = [
		{ effort: 2, reach: { expert: 5, shop: 1, venue: 1, community: 3, event: 3, saas: 4 } },
		{ effort: 3, reach: { expert: 3, shop: 5, venue: 5, community: 5, event: 5, saas: 2 } },
		{ effort: 4, reach: { expert: 4, shop: 2, venue: 1, community: 2, event: 1, saas: 3 } },
		{ effort: 5, reach: { expert: 2, shop: 3, venue: 3, community: 2, event: 3, saas: 4 } },
		{ effort: 2, reach: { expert: 4, shop: 4, venue: 2, community: 3, event: 3, saas: 5 } }
	];
	const channels: Channel[] = data.map((d, i) => ({ ...W.channels[i], ...d }));

	let kind = $state<Kind>('expert');
	const rows = $derived(
		channels
			.map((c) => ({ ...c, r: c.reach[kind], score: c.reach[kind] - c.effort / 2 }))
			.sort((a, b) => b.score - a.score)
	);
	const bar = (n: number) => '■'.repeat(n) + '□'.repeat(5 - n);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each kinds as k (k)}
			<button type="button" aria-pressed={kind === k} onclick={() => (kind = k)}>{kindName[k]}</button>
		{/each}
	</div>
	<ol>
		{#each rows as c, i (c.name)}
			<li class:pick={i < 2}>
				<strong>{c.name}</strong>{#if i < 2} <span class="tag">{W.start}</span>{/if}
				<span class="dg-mono">{W.reach} {bar(c.r)}, {W.effort} {bar(c.effort)}</span>
				<span class="why">{c.why}</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{W.rec(kindName[kind].toLowerCase())} <strong>{rows[0].name}</strong> {W.and} <strong>{rows[1].name}</strong>. {W.rec2}
	</p>
	<p class="dg-out">{W.out}</p>
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
