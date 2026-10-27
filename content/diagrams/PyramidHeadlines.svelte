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

	type Fact = 'делаем' | 'цены' | 'запись' | 'границы' | 'кто мы' | 'история';
	type Block = { id: string; text: string; fact: Fact };
	const start: Block[] = [
		{ id: 'f', fact: 'история', text: 'Идея мастерской появилась, когда в городе закрылась последняя велосипедная лавка, а чинить колесо стало негде.' },
		{ id: 'e', fact: 'кто мы', text: 'Мастерская работает с 2019 года; механики прошли обучение у производителя тормозных систем.' },
		{ id: 'd', fact: 'границы', text: 'Мы не берём карбоновые рамы с трещинами и электровелосипеды: для них нужен другой инструмент.' },
		{ id: 'c', fact: 'запись', text: 'Записаться можно по телефону или в форме. Привезти велосипед без записи можно по будням с 9 до 18.' },
		{ id: 'b', fact: 'цены', text: 'Замена камеры: 400 ₽, 20 минут. Тормоза и скорости: 600 ₽. Полное ТО: 2 500 ₽.' },
		{ id: 'a', fact: 'делаем', text: 'Заменим камеру, отрегулируем тормоза и скорости, сделаем полное ТО за один день, если привезёте велосипед до полудня.' }
	];
	const must: Fact[] = ['делаем', 'цены', 'запись'];

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
	let title = $state('Ремонт велосипедов за один день: мастерская «Рейка», Заречье');
	let desc = $state('Заменим камеру за 20 минут, отрегулируем тормоза, сделаем полное ТО за день. Цены на странице, запись по телефону.');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			title = p.title;
			desc = `${p.who}. ${p.mainAction.label}.`;
		} catch {
			/* the example stays */
		}
	});
	const signs = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'знак' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'знака' : 'знаков');
	const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
	const places = $derived([
		{ name: 'Вкладка браузера', text: cut(title, 28), n: 28 },
		{ name: 'Результат поиска: заголовок', text: cut(title, 60), n: 60 },
		{ name: 'Результат поиска: описание', text: cut(desc, 160), n: 160 },
		{ name: 'Карточка в соцсети', text: cut(title, 70), n: 70 },
		{ name: 'Тема письма на телефоне', text: cut(title, 38), n: 38 }
	]);
</script>

<figure class="dg">
	<figcaption>{tab === 'pyramid' ? 'Перевёрнутая пирамида' : 'Заголовок в четырёх местах'}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Что показать">
		<button type="button" role="tab" aria-selected={tab === 'pyramid'} onclick={() => (tab = 'pyramid')}>Пирамида</button>
		<button type="button" role="tab" aria-selected={tab === 'heads'} onclick={() => (tab = 'heads')}>Заголовок</button>
	</div>

	{#if tab === 'pyramid'}
		<p class="dg-out">Расставьте абзацы от самого важного к второстепенному, потом двигайте ползунок: читатель уходит там, где текст обрывается.</p>
		<ol class="blocks">
			{#each blocks as b, i (b.id)}
				<li class:gone={i >= read}>
					<div class="ctl">
						<button type="button" onclick={() => move(i, -1)} disabled={i === 0} aria-label="Поднять абзац {i + 1}">↑</button>
						<button type="button" onclick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Опустить абзац {i + 1}">↓</button>
					</div>
					<span>{b.text}</span>
				</li>
			{/each}
		</ol>
		<div class="dg-ctl">
			<label>
				Читатель дочитал абзацев: <strong>{read}</strong>
				<input type="range" min="1" max="6" step="1" bind:value={read} />
			</label>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if lost.length === 0}
				Читатель, который остановился здесь, знает главное: что делают, сколько стоит и как записаться.
			{:else}
				Этот читатель не узнал: <strong>{lost.join(', ')}</strong>.
			{/if}
			{#if ordered}Порядок хорош: главное в первых трёх абзацах.{/if}
		</p>
	{:else}
		<label class="f">
			Заголовок страницы (title)
			<input type="text" bind:value={title} />
			<span class="n">{title.length} {signs(title.length)}</span>
		</label>
		<label class="f">
			Описание (description)
			<textarea rows="3" bind:value={desc}></textarea>
			<span class="n">{desc.length} {signs(desc.length)}</span>
		</label>
		<ul class="places">
			{#each places as p (p.name)}
				<li>
					<span class="pn">{p.name}, примерно до {p.n}</span>
					<span class="pt dg-box">{p.text}</span>
				</li>
			{/each}
		</ul>
		<p class="dg-out">Пределы условные: поисковики и соцсети обрезают по ширине в пикселях, у каждого своя и она меняется. Смысл в другом: заголовок, оборванный на полуслове, должен остаться понятным.</p>
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
