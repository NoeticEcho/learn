<!--
	«Убеждение и его границы» (part 11, lesson 6), two tabs.
	1. Eight bits of a made-up page of the kind that deceives: the person names each pattern and is
	   told which principle of influence it abuses, what the honest version is, and which rule of
	   Russian law it comes near. The pages are invented; the patterns are the ones in Harry
	   Brignull's catalogue of deceptive design.
	2. B. J. Fogg's model: motivation and ability against an action line, and a prompt. Six things
	   that make a form harder can be taken away one by one; the point to see is that making it
	   easy usually works better than pushing harder.
-->
<script lang="ts">
	import './shared.css';

	type Pattern = 'urgency' | 'preselect' | 'shame' | 'hidden' | 'social' | 'review' | 'trap' | 'trick';
	const names: Record<Pattern, string> = {
		urgency: 'Ложная срочность или дефицит',
		preselect: 'Предвыбранное согласие',
		shame: 'Пристыживание отказа (confirmshaming)',
		hidden: 'Скрытая цена или подписка',
		social: 'Выдуманный счётчик «сейчас смотрят»',
		review: 'Выдуманные отзывы',
		trap: 'Ловушка: отказаться трудно (roach motel)',
		trick: 'Двойное отрицание (trick question)'
	};
	const cards: { show: string; right: Pattern; principle: string; honest: string; law: string }[] = [
		{ show: 'Осталось 2 места! Акция закончится через 09:59 (таймер каждый раз начинается заново)', right: 'urgency', principle: 'Дефицит (Чалдини)', honest: 'Назвать настоящий срок и причину: «запись на выезд до пятницы, в субботу бригада занята».', law: 'Недостоверные сведения об условиях: статья 5 закона о рекламе.' },
		{ show: '☑ Хочу получать новости и предложения (галочка стоит заранее)', right: 'preselect', principle: 'Последовательность: человек «уже согласился»', honest: 'Галочка пустая, рассылка отдельная, отказ одним нажатием.', law: 'Согласие должно быть сознательным и однозначным (152-ФЗ, статья 9); для рассылок нужно заранее данное согласие (38-ФЗ, статья 18).' },
		{ show: '[Да, хочу сэкономить]   [Нет, я люблю переплачивать]', right: 'shame', principle: 'Симпатия и социальное давление', honest: '[Подписаться]   [Нет, спасибо]', law: 'Прямого запрета нет, но это манипуляция вниманием; в регулируемых профессиях ещё и вопрос этики.' },
		{ show: 'Бесплатно* (мелким шрифтом: *после 7 дней 1990 ₽ в месяц, продлевается автоматически)', right: 'hidden', principle: 'Взаимность в подмене: «подарок» с условием', honest: 'Цена и автопродление рядом с кнопкой, крупно, с предупреждением перед списанием.', law: 'Потребителю нужна полная и достоверная информация об услуге и цене (закон о защите прав потребителей, статья 10).' },
		{ show: 'Сейчас эту страницу смотрят 14 человек (число случайное)', right: 'social', principle: 'Социальное доказательство', honest: 'Показывать только то, что измеряется и проверяется («за месяц записались 120 человек»), или ничего.', law: 'Выдуманные сведения это недостоверная реклама (статья 5).' },
		{ show: '«Лучший сервис в городе! Анна К.» (человека нет, дата не указана)', right: 'review', principle: 'Социальное доказательство и авторитет', honest: 'Настоящие отзывы с именем, датой и согласием автора, со ссылкой на источник.', law: 'Недостоверные сведения о результатах и признании (статья 5).' },
		{ show: 'Подписаться: один клик. Отписаться: письмом на почтовый адрес с копией паспорта', right: 'trap', principle: 'Последовательность: войти легко, выйти трудно', honest: 'Отписка одним нажатием, тем же способом, что и подписка.', law: 'Согласие можно отозвать (152-ФЗ, статья 9); рассылку по требованию прекращают немедленно (38-ФЗ, статья 18).' },
		{ show: '☐ Не отказываюсь от того, чтобы не получать наши письма', right: 'trick', principle: 'Непонятная формулировка вместо выбора', honest: 'Простая фраза: «Присылайте мне письма». Галочка пустая.', law: 'Согласие должно быть однозначным (152-ФЗ, статья 9).' }
	];
	let tab = $state<'dark' | 'fogg'>('dark');
	let pick = $state<(Pattern | null)[]>(cards.map(() => null));
	const right = $derived(cards.filter((c, i) => pick[i] === c.right).length);

	// Fogg
	const factors = ['время (ждать не надо)', 'деньги (платить сразу не надо)', 'усилие (мало полей)', 'мысль (всё понятно без объяснений)', 'социальный риск (никому не надо объяснять)', 'привычное (всё как обычно)'];
	let removed = $state<boolean[]>(factors.map(() => false));
	let motivation = $state(2);
	let prompt = $state(true);
	const ability = $derived(1 + removed.filter(Boolean).length * 0.5);
	const threshold = 4;
	const above = $derived(motivation * ability >= threshold);
	const acts = $derived(above && prompt);
	// the action line: motivation = threshold / ability, on a 0..4 by 0..4 plane
	const line = $derived(
		Array.from({ length: 33 }, (_, i) => {
			const a = 1 + (i / 32) * 3;
			return `${30 + ((a - 1) / 3) * 220},${200 - Math.min(4, threshold / a) * 45}`;
		}).join(' ')
	);
	const dot = $derived({ x: 30 + ((ability - 1) / 3) * 220, y: 200 - motivation * 45 });
</script>

<figure class="dg">
	<figcaption>{tab === 'dark' ? 'Узнайте приём' : 'Модель Фогга: мотивация, способность, подсказка'}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Что показать">
		<button type="button" role="tab" aria-selected={tab === 'dark'} onclick={() => (tab = 'dark')}>Тёмные паттерны</button>
		<button type="button" role="tab" aria-selected={tab === 'fogg'} onclick={() => (tab = 'fogg')}>Модель Фогга</button>
	</div>

	{#if tab === 'dark'}
		<p class="dg-out">Это придуманные куски страниц. Для каждого выберите название приёма из каталога Гарри Бриньюла: в ответе будут принцип, честная замена и норма закона.</p>
		<ol class="cards">
			{#each cards as c, i (i)}
				<li>
					<p class="show dg-box">{c.show}</p>
					<label class="sel">
						Что это за приём
						<select bind:value={pick[i]}>
							<option value={null}>выберите</option>
							{#each Object.keys(names) as k (k)}<option value={k}>{names[k as Pattern]}</option>{/each}
						</select>
					</label>
					{#if pick[i]}
						<div class="fb" class:ok={pick[i] === c.right} role="status">
							<p>{pick[i] === c.right ? 'Верно.' : `Нет, это «${names[c.right].toLowerCase()}».`} Использует: {c.principle}.</p>
							<p><strong>Честная версия.</strong> {c.honest}</p>
							<p><strong>Рядом с законом.</strong> {c.law}</p>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">Верно: <strong>{right}</strong> из {cards.length}. Нормы названы для ориентира, а не как юридическая оценка: в каждом деле решает юрист.</p>
	{:else}
		<div class="fogg">
			<div>
				<label class="r">Мотивация: <strong>{motivation}</strong> <input type="range" min="0" max="4" step="1" bind:value={motivation} aria-label="Мотивация от 0 до 4" /></label>
				<p class="dg-out">Способность: <strong>{ability.toFixed(1)}</strong>. Что вы убрали из формы:</p>
				<ul class="chk">
					{#each factors as f, i (i)}
						<li><label><input type="checkbox" bind:checked={removed[i]} /> {f}</label></li>
					{/each}
				</ul>
				<label class="r"><input type="checkbox" bind:checked={prompt} /> Подсказка есть: человек видит кнопку или напоминание в нужный момент</label>
			</div>
			<svg viewBox="0 0 280 240" role="img" aria-label="График: по горизонтали способность, по вертикали мотивация, кривая линия действия">
				<line x1="30" y1="200" x2="270" y2="200" stroke="currentColor" />
				<line x1="30" y1="20" x2="30" y2="200" stroke="currentColor" />
				<polyline points={line} fill="none" stroke="var(--accent-measure)" stroke-width="2" />
				<circle cx={dot.x} cy={dot.y} r="7" fill={acts ? 'var(--accent-state-text)' : 'currentColor'} />
				<text x="150" y="228" text-anchor="middle" font-size="11">способность растёт (всё проще)</text>
				<text x="12" y="110" font-size="11" transform="rotate(-90 12 110)" text-anchor="middle">мотивация</text>
				<text x="262" y="80" text-anchor="end" font-size="11">линия действия</text>
			</svg>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if acts}Действие происходит: точка выше линии, и подсказка есть.
			{:else if above}Точка выше линии, но подсказки нет: человек готов, но в нужный момент ему не напомнили, что делать.
			{:else}Точка ниже линии: либо желания мало, либо слишком трудно. Фогг советует сначала сделать проще, потом усиливать желание.{/if}
		</p>
		<p class="dg-out">Это учебная модель: числа условные, она показывает порядок, а не измеряет людей.</p>
	{/if}
</figure>

<style>
	.cards {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-4);
		margin: 0 0 var(--space-3);
	}
	.show {
		margin: 0 0 var(--space-2);
		color: var(--text-primary);
	}
	.sel {
		display: grid;
		gap: var(--space-1);
		color: var(--text-secondary);
	}
	select {
		padding: var(--space-2) var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
	}
	.fb {
		margin-top: var(--space-2);
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
		color: var(--text-secondary);
	}
	.fb.ok {
		border-left-color: var(--accent-state-text);
	}
	.fb p {
		margin: 0 0 var(--space-1);
	}
	.fogg {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	.chk {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
		margin: 0 0 var(--space-3);
	}
	.chk label,
	.r {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	svg {
		max-width: 22rem;
		color: var(--text-body);
	}
</style>
