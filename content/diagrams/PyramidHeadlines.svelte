<!--
	«Пирамида и заголовок» (part 10, lesson 3), two tabs.
	1. The inverted pyramid: six paragraphs of a made-up bicycle workshop's page, in the wrong
	   order. The person moves them up and down, then cuts the text from the bottom, as a reader
	   who leaves early would, and is told which facts that reader never got.
	2. The headline in four places: tab, search result, social card and e-mail subject, each
	   cutting the text at its own (rounded, illustrative) length. Starts from the person's brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Fact = 'does' | 'prices' | 'booking' | 'limits' | 'who' | 'story';
	type Block = { id: string; text: string; fact: Fact };
	const W = pick({
		ru: {
			facts: { does: 'делаем', prices: 'цены', booking: 'запись', limits: 'границы', who: 'кто мы', story: 'история' } as Record<Fact, string>,
			texts: {
				f: 'Идея мастерской появилась, когда в городе закрылась последняя велосипедная лавка, а чинить колесо стало негде.',
				e: 'Мастерская работает с 2019 года; механики прошли обучение у производителя тормозных систем.',
				d: 'Мы не берём карбоновые рамы с трещинами и электровелосипеды: для них нужен другой инструмент.',
				c: 'Записаться можно по телефону или в форме. Привезти велосипед без записи можно по будням с 9 до 18.',
				b: 'Замена камеры: 400 ₽, 20 минут. Тормоза и скорости: 600 ₽. Полное ТО: 2 500 ₽.',
				a: 'Заменим камеру, отрегулируем тормоза и скорости, сделаем полное ТО за один день, если привезёте велосипед до полудня.'
			} as Record<string, string>,
			title: 'Ремонт велосипедов за один день: мастерская «Рейка», Заречье',
			desc: 'Заменим камеру за 20 минут, отрегулируем тормоза, сделаем полное ТО за день. Цены на странице, запись по телефону.',
			signs: (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'знак' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'знака' : 'знаков'),
			tab: 'Вкладка браузера',
			serpTitle: 'Результат поиска: заголовок',
			serpDesc: 'Результат поиска: описание',
			card: 'Карточка в соцсети',
			subject: 'Тема письма на телефоне',
			capPyramid: 'Перевёрнутая пирамида',
			capHeads: 'Заголовок в четырёх местах',
			show: 'Что показать',
			tabPyramid: 'Пирамида',
			tabHeads: 'Заголовок',
			hint: 'Расставьте абзацы от самого важного к второстепенному, потом двигайте ползунок: читатель уходит там, где текст обрывается.',
			up: (n: number) => `Поднять абзац ${n}`,
			down: (n: number) => `Опустить абзац ${n}`,
			readTo: 'Читатель дочитал абзацев:',
			knows: 'Читатель, который остановился здесь, знает главное: что делают, сколько стоит и как записаться.',
			missed: 'Этот читатель не узнал:',
			good: 'Порядок хорош: главное в первых трёх абзацах.',
			titleLabel: 'Заголовок страницы (title)',
			descLabel: 'Описание (description)',
			upto: 'примерно до',
			limits: 'Пределы условные: поисковики и соцсети обрезают по ширине в пикселях, у каждого своя и она меняется. Смысл в другом: заголовок, оборванный на полуслове, должен остаться понятным.'
		},
		en: {
			facts: { does: 'what we do', prices: 'prices', booking: 'booking', limits: 'limits', who: 'who we are', story: 'the story' } as Record<Fact, string>,
			texts: {
				f: 'The workshop began when the last bicycle shop in town closed and there was nowhere left to get a wheel fixed.',
				e: 'The workshop has been open since 2019, and its mechanics trained with a maker of brake systems.',
				d: 'We don’t take cracked carbon frames or e-bikes: they need different tools.',
				c: 'Book by phone or online. Without a booking you can bring a bike in on weekdays from 9 to 6.',
				b: 'Inner tube replaced: $12, 20 minutes. Brakes and gears: $25. Full service: $90.',
				a: 'We replace tubes, adjust brakes and gears and give a full service in one day, if you bring the bike in before noon.'
			} as Record<string, string>,
			title: 'Bicycle repair in one day: Spoke & Tube workshop, Riverbend',
			desc: 'We replace an inner tube in 20 minutes, adjust brakes and gears, and give a full service in a day. Prices on the page, booking by phone.',
			signs: (n: number) => (n === 1 ? 'character' : 'characters'),
			tab: 'Browser tab',
			serpTitle: 'Search result: headline',
			serpDesc: 'Search result: description',
			card: 'Social media card',
			subject: 'Email subject on a phone',
			capPyramid: 'The inverted pyramid',
			capHeads: 'A headline in four places',
			show: 'What to show',
			tabPyramid: 'Pyramid',
			tabHeads: 'Headline',
			hint: 'Put the paragraphs in order from the most important to the least, then move the slider: the reader leaves where the text breaks off.',
			up: (n: number) => `Move paragraph ${n} up`,
			down: (n: number) => `Move paragraph ${n} down`,
			readTo: 'Paragraphs the reader finished:',
			knows: 'A reader who stopped here knows the main things: what is done, what it costs and how to book.',
			missed: 'This reader never found out:',
			good: 'Good order: the main things are in the first three paragraphs.',
			titleLabel: 'Page title (title)',
			descLabel: 'Description (description)',
			upto: 'up to about',
			limits: 'The limits are approximate: search engines and social networks cut by width in pixels, each has its own, and it changes. The point is another: a headline cut off mid-word should still make sense.'
		}
	});
	const F = W.facts;
	const T = W.texts;
	const start: Block[] = [
		{ id: 'f', fact: 'story', text: T.f },
		{ id: 'e', fact: 'who', text: T.e },
		{ id: 'd', fact: 'limits', text: T.d },
		{ id: 'c', fact: 'booking', text: T.c },
		{ id: 'b', fact: 'prices', text: T.b },
		{ id: 'a', fact: 'does', text: T.a }
	];
	const must: Fact[] = ['does', 'prices', 'booking'];

	let tab = $state<'pyramid' | 'heads'>('pyramid');
	let blocks = $state<Block[]>(start.map((b) => ({ ...b })));
	let read = $state(6);
	const move = (i: number, d: -1 | 1) => {
		const j = i + d;
		if (j < 0 || j >= blocks.length) return;
		[blocks[i], blocks[j]] = [blocks[j], blocks[i]];
	};
	const got = $derived(new Set(blocks.slice(0, read).map((b) => b.fact)));
	const lost = $derived(must.filter((f) => !got.has(f)));
	const ordered = $derived(must.every((f) => blocks.slice(0, 3).some((b) => b.fact === f)));

	// the headline tab
	let title = $state(W.title);
	let desc = $state(W.desc);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			title = p.title;
			desc = `${p.who}. ${p.mainAction.label}.`;
		} catch {
			/* the example stays */
		}
	});
	const signs = W.signs;
	const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
	const places = $derived([
		{ name: W.tab, text: cut(title, 28), n: 28 },
		{ name: W.serpTitle, text: cut(title, 60), n: 60 },
		{ name: W.serpDesc, text: cut(desc, 160), n: 160 },
		{ name: W.card, text: cut(title, 70), n: 70 },
		{ name: W.subject, text: cut(title, 38), n: 38 }
	]);
</script>

<figure class="dg">
	<figcaption>{tab === 'pyramid' ? W.capPyramid : W.capHeads}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.show}>
		<button type="button" role="tab" aria-selected={tab === 'pyramid'} onclick={() => (tab = 'pyramid')}>{W.tabPyramid}</button>
		<button type="button" role="tab" aria-selected={tab === 'heads'} onclick={() => (tab = 'heads')}>{W.tabHeads}</button>
	</div>

	{#if tab === 'pyramid'}
		<p class="dg-out">{W.hint}</p>
		<ol class="blocks">
			{#each blocks as b, i (b.id)}
				<li class:gone={i >= read}>
					<div class="ctl">
						<button type="button" onclick={() => move(i, -1)} disabled={i === 0} aria-label={W.up(i + 1)}>↑</button>
						<button type="button" onclick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label={W.down(i + 1)}>↓</button>
					</div>
					<span>{b.text}</span>
				</li>
			{/each}
		</ol>
		<div class="dg-ctl">
			<label>
				{W.readTo} <strong>{read}</strong>
				<input type="range" min="1" max="6" step="1" bind:value={read} />
			</label>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if lost.length === 0}
				{W.knows}
			{:else}
				{W.missed} <strong>{lost.map((f) => F[f]).join(', ')}</strong>.
			{/if}
			{#if ordered}{W.good}{/if}
		</p>
	{:else}
		<label class="f">
			{W.titleLabel}
			<input type="text" bind:value={title} />
			<span class="n">{title.length} {signs(title.length)}</span>
		</label>
		<label class="f">
			{W.descLabel}
			<textarea rows="3" bind:value={desc}></textarea>
			<span class="n">{desc.length} {signs(desc.length)}</span>
		</label>
		<ul class="places">
			{#each places as p (p.name)}
				<li>
					<span class="pn">{p.name}, {W.upto} {p.n}</span>
					<span class="pt dg-box">{p.text}</span>
				</li>
			{/each}
		</ul>
		<p class="dg-out">{W.limits}</p>
	{/if}
</figure>

<style>
	.blocks {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	.blocks li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-3);
		align-items: start;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.blocks li.gone {
		color: var(--text-secondary);
		border-style: dashed;
	}
	.ctl {
		display: flex;
		gap: var(--space-1);
	}
	.ctl button {
		min-width: var(--hit-min);
	}
	.f {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}
	.f input,
	.f textarea {
		padding: var(--space-2) var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
	}
	.n {
		color: var(--text-secondary);
	}
	.places {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
	}
	.pn {
		display: block;
		color: var(--text-secondary);
		margin-bottom: var(--space-1);
	}
</style>
