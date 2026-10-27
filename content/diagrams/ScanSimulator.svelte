<!--
	«Что успевает заметить посетитель» (part 10, lesson 1). One page about a made-up bicycle workshop,
	written twice: as a wall of text and as a page built for scanning. A slider says how many
	seconds the visitor looks; the words they would catch in that time are lit, the rest are dim.
	This is a teaching model, not an eye-tracker: the order follows what eye-tracking studies found
	(the first lines and the starts of lines, headings and numbers first), the seconds are rounded.
-->
<script lang="ts">
	import './shared.css';

	type Question = 'what' | 'who' | 'price' | 'action';
	type Line = { kind: 'h1' | 'h2' | 'p' | 'li' | 'btn' | 'sub'; text: string; seenAt: number; words?: number; gives?: Question };

	const wall: Line[] = [
		{ kind: 'h1', text: 'Добро пожаловать на сайт нашей мастерской!', seenAt: 1 },
		{ kind: 'p', text: 'Мы рады приветствовать вас и предлагаем вам ознакомиться с', seenAt: 2, words: 6 },
		{ kind: 'p', text: 'нашими услугами. Наша компания уже много лет', seenAt: 4, words: 2 },
		{ kind: 'p', text: 'работает на рынке и стремится предоставлять', seenAt: 5, words: 2 },
		{ kind: 'p', text: 'высококачественный сервис по доступным ценам', seenAt: 6, words: 2 },
		{ kind: 'p', text: 'для каждого клиента. Мы используем только лучшие', seenAt: 8, words: 1 },
		{ kind: 'p', text: 'запчасти и индивидуальный подход к каждому. Звоните', seenAt: 10, words: 1 },
		{ kind: 'p', text: 'нам, и мы будем рады вам помочь.', seenAt: 12, words: 1, gives: 'action' }
	];
	const scan: Line[] = [
		{ kind: 'h1', text: 'Ремонт велосипедов за один день', seenAt: 1, gives: 'what' },
		{ kind: 'sub', text: 'Мастерская «Рейка», Заречье. Чиним городские и дорожные велосипеды.', seenAt: 2, words: 4, gives: 'who' },
		{ kind: 'btn', text: 'Записать велосипед на ремонт', seenAt: 2, gives: 'action' },
		{ kind: 'h2', text: 'Что делаем и сколько стоит', seenAt: 3 },
		{ kind: 'li', text: 'Замена камеры: 400 ₽, 20 минут', seenAt: 4, gives: 'price' },
		{ kind: 'li', text: 'Регулировка тормозов и скоростей: 600 ₽', seenAt: 5 },
		{ kind: 'li', text: 'Полное ТО: 2 500 ₽, за день', seenAt: 6 },
		{ kind: 'h2', text: 'Как это работает', seenAt: 7 },
		{ kind: 'p', text: 'Вы оставляете заявку, мы звоним и называем время.', seenAt: 9, words: 3 }
	];
	const questions: Record<Question, string> = {
		what: 'Что здесь делают?',
		who: 'Кто и где?',
		price: 'Сколько это стоит?',
		action: 'Что мне сделать?'
	};

	let mode = $state<'wall' | 'scan'>('wall');
	let seconds = $state(5);
	const lines = $derived(mode === 'wall' ? wall : scan);
	const seen = (l: Line) => l.seenAt <= seconds;
	const answered = $derived(new Set(lines.filter((l) => l.gives && seen(l) && (l.words === undefined || l.words >= 1)).map((l) => l.gives)));
	const caught = $derived(lines.reduce((n, l) => n + (seen(l) ? (l.words ?? l.text.split(/\s+/).length) : 0), 0));
	const total = $derived(lines.reduce((n, l) => n + l.text.split(/\s+/).length, 0));
</script>

<figure class="dg">
	<figcaption>Пять секунд на страницу</figcaption>
	<div class="dg-ctl" role="group" aria-label="Какой вариант страницы">
		<button type="button" aria-pressed={mode === 'wall'} onclick={() => (mode = 'wall')}>Стена текста</button>
		<button type="button" aria-pressed={mode === 'scan'} onclick={() => (mode = 'scan')}>Страница для сканирования</button>
	</div>
	<div class="dg-ctl">
		<label>
			Посетитель смотрит, секунд: <strong>{seconds}</strong>
			<input type="range" min="1" max="12" step="1" bind:value={seconds} aria-label="Сколько секунд посетитель смотрит на страницу" />
		</label>
	</div>

	<div class="page dg-box" aria-label="Макет страницы">
		{#each lines as l, i (mode + i)}
			{@const on = seen(l)}
			{@const k = l.words ?? l.text.split(/\s+/).length}
			<div class="ln {l.kind}" class:dimmed={!on}>
				{#if l.kind === 'btn'}
					<span class="btn-mock" class:lit={on}>{l.text}</span>
				{:else}
					{#each l.text.split(/\s+/) as w, j (j)}<span class:lit={on && j < k}>{w}</span>{' '}{/each}
				{/if}
			</div>
		{/each}
	</div>

	<p class="dg-out" aria-live="polite">
		Замечено слов: <strong>{caught}</strong> из {total}. По увиденному можно ответить на вопросы:
	</p>
	<ul class="qs">
		{#each Object.entries(questions) as [q, text] (q)}
			<li class:ok={answered.has(q as Question)}>{answered.has(q as Question) ? '✓' : '·'} {text}</li>
		{/each}
	</ul>
</figure>

<style>
	.page {
		display: grid;
		gap: var(--space-2);
		max-width: 34rem;
	}
	.ln {
		line-height: 1.5;
	}
	.ln.dimmed {
		color: var(--text-secondary);
	}
	.h1 {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.h2 {
		font-weight: var(--weight-medium);
		color: var(--text-primary);
		margin-top: var(--space-2);
	}
	.li {
		padding-left: var(--space-4);
		position: relative;
	}
	.li::before {
		content: '–';
		position: absolute;
		left: 0;
	}
	.lit {
		background: color-mix(in srgb, var(--accent-measure) 26%, transparent);
	}
	.btn-mock {
		display: inline-block;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
	}
	.btn-mock.lit {
		border-color: var(--accent-measure);
	}
	.qs {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.qs li {
		color: var(--text-secondary);
	}
	.qs li.ok {
		color: var(--text-primary);
	}
</style>
