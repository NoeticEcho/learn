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
	import { pick as pickW } from '#lib/i18n/index.ts';

	type Pattern = 'urgency' | 'preselect' | 'shame' | 'hidden' | 'social' | 'review' | 'trap' | 'trick';
	type Card = { show: string; right: Pattern; principle: string; honest: string; law: string };
	const W = pickW({
		ru: {
			names: {
				urgency: 'Ложная срочность или дефицит',
				preselect: 'Предвыбранное согласие',
				shame: 'Пристыживание отказа (confirmshaming)',
				hidden: 'Скрытая цена или подписка',
				social: 'Выдуманный счётчик «сейчас смотрят»',
				review: 'Выдуманные отзывы',
				trap: 'Ловушка: отказаться трудно (roach motel)',
				trick: 'Двойное отрицание (trick question)'
			} as Record<Pattern, string>,
			cards: [
				{ show: 'Осталось 2 места! Акция закончится через 09:59 (таймер каждый раз начинается заново)', right: 'urgency', principle: 'Дефицит (Чалдини)', honest: 'Назвать настоящий срок и причину: «запись на выезд до пятницы, в субботу бригада занята».', law: 'Недостоверные сведения об условиях: статья 5 закона о рекламе.' },
				{ show: '☑ Хочу получать новости и предложения (галочка стоит заранее)', right: 'preselect', principle: 'Последовательность: человек «уже согласился»', honest: 'Галочка пустая, рассылка отдельная, отказ одним нажатием.', law: 'Согласие должно быть сознательным и однозначным (152-ФЗ, статья 9); для рассылок нужно заранее данное согласие (38-ФЗ, статья 18).' },
				{ show: '[Да, хочу сэкономить]   [Нет, я люблю переплачивать]', right: 'shame', principle: 'Симпатия и социальное давление', honest: '[Подписаться]   [Нет, спасибо]', law: 'Прямого запрета нет, но это манипуляция вниманием; в регулируемых профессиях ещё и вопрос этики.' },
				{ show: 'Бесплатно* (мелким шрифтом: *после 7 дней 1990 ₽ в месяц, продлевается автоматически)', right: 'hidden', principle: 'Взаимность в подмене: «подарок» с условием', honest: 'Цена и автопродление рядом с кнопкой, крупно, с предупреждением перед списанием.', law: 'Потребителю нужна полная и достоверная информация об услуге и цене (закон о защите прав потребителей, статья 10).' },
				{ show: 'Сейчас эту страницу смотрят 14 человек (число случайное)', right: 'social', principle: 'Социальное доказательство', honest: 'Показывать только то, что измеряется и проверяется («за месяц записались 120 человек»), или ничего.', law: 'Выдуманные сведения это недостоверная реклама (статья 5).' },
				{ show: '«Лучший сервис в городе! Анна К.» (человека нет, дата не указана)', right: 'review', principle: 'Социальное доказательство и авторитет', honest: 'Настоящие отзывы с именем, датой и согласием автора, со ссылкой на источник.', law: 'Недостоверные сведения о результатах и признании (статья 5).' },
				{ show: 'Подписаться: один клик. Отписаться: письмом на почтовый адрес с копией паспорта', right: 'trap', principle: 'Последовательность: войти легко, выйти трудно', honest: 'Отписка одним нажатием, тем же способом, что и подписка.', law: 'Согласие можно отозвать (152-ФЗ, статья 9); рассылку по требованию прекращают немедленно (38-ФЗ, статья 18).' },
				{ show: '☐ Не отказываюсь от того, чтобы не получать наши письма', right: 'trick', principle: 'Непонятная формулировка вместо выбора', honest: 'Простая фраза: «Присылайте мне письма». Галочка пустая.', law: 'Согласие должно быть однозначным (152-ФЗ, статья 9).' }
			] as Card[],
			factors: ['время (ждать не надо)', 'деньги (платить сразу не надо)', 'усилие (мало полей)', 'мысль (всё понятно без объяснений)', 'социальный риск (никому не надо объяснять)', 'привычное (всё как обычно)'] as string[],
			capDark: 'Узнайте приём',
			capFogg: 'Модель Фогга: мотивация, способность, подсказка',
			show: 'Что показать',
			tabDark: 'Тёмные паттерны',
			tabFogg: 'Модель Фогга',
			introDark: 'Это придуманные куски страниц. Для каждого выберите название приёма из каталога Гарри Бриньюла: в ответе будут принцип, честная замена и норма закона.',
			whichPattern: 'Что это за приём',
			choose: 'выберите',
			right: 'Верно.',
			no: (n: string) => `Нет, это «${n}».`,
			uses: 'Использует:',
			honest: 'Честная версия.',
			lawLabel: 'Рядом с законом.',
			score: 'Верно:',
			of: 'из',
			scoreNote: 'Нормы названы для ориентира, а не как юридическая оценка: в каждом деле решает юрист.',
			motivation: 'Мотивация:',
			motivationAria: 'Мотивация от 0 до 4',
			ability: 'Способность:',
			removedLabel: 'Что вы убрали из формы:',
			prompt: 'Подсказка есть: человек видит кнопку или напоминание в нужный момент',
			chart: 'График: по горизонтали способность, по вертикали мотивация, кривая линия действия',
			xAxis: 'способность растёт (всё проще)',
			yAxis: 'мотивация',
			line: 'линия действия',
			acts: 'Действие происходит: точка выше линии, и подсказка есть.',
			noPrompt: 'Точка выше линии, но подсказки нет: человек готов, но в нужный момент ему не напомнили, что делать.',
			below: 'Точка ниже линии: либо желания мало, либо слишком трудно. Фогг советует сначала сделать проще, потом усиливать желание.',
			foggNote: 'Это учебная модель: числа условные, она показывает порядок, а не измеряет людей.'
		},
		en: {
			names: {
				urgency: 'False urgency or scarcity',
				preselect: 'Pre-ticked consent',
				shame: 'Shaming the decline (confirmshaming)',
				hidden: 'Hidden price or subscription',
				social: 'A made-up “people viewing now” counter',
				review: 'Made-up reviews',
				trap: 'A trap: hard to cancel (roach motel)',
				trick: 'A double negative (trick question)'
			} as Record<Pattern, string>,
			cards: [
				{ show: 'Only 2 spots left! The offer ends in 09:59 (the timer starts over every visit)', right: 'urgency', principle: 'Scarcity (Cialdini)', honest: 'State a real deadline and the reason: “book a site visit by Friday, on Saturday the crew is busy”.', law: 'A false statement about the terms of an offer. In the US it is a deceptive practice under Section 5 of the FTC Act; the EU’s list of always-banned practices names falsely saying that an offer is available only for a very short time; and the UK’s CAP Code requires such claims to be true.' },
				{ show: '☑ I want to receive news and offers (the box is ticked in advance)', right: 'preselect', principle: 'Commitment: the person has “already agreed”', honest: 'An empty box, the newsletter kept separate, and one click to opt out.', law: 'Under the GDPR consent needs a clear affirmative act, and Recital 32 says pre-ticked boxes are not consent (the EU’s top court said so in Planet49, 2019). In the US, CAN-SPAM requires a working opt-out for marketing email, and California’s regulations bar pre-selected consent choices.' },
				{ show: '[Yes, I want to save]   [No, I like paying full price]', right: 'shame', principle: 'Liking and social pressure', honest: '[Subscribe]   [No, thanks]', law: 'There is no ban on the joke as such, but California’s privacy regulations treat guilt-tripping wording on a choice as a violation, and the EU data protection regulators call it “emotional steering”. In a regulated profession it is also an ethics question.' },
				{ show: 'Free* (in small print: *after 7 days $19.99 a month, renews automatically)', right: 'hidden', principle: 'Reciprocity in disguise: a “gift” with a condition', honest: 'The price and the automatic renewal beside the button, in large type, with a reminder before the charge.', law: 'In the US the Restore Online Shoppers’ Confidence Act (ROSCA) and state auto-renewal laws require clear disclosure of the material terms and a simple way to cancel; the EU’s Consumer Rights Directive requires the total price and the obligation to pay to be clear before ordering.' },
				{ show: 'Right now 14 people are looking at this page (the number is random)', right: 'social', principle: 'Social proof', honest: 'Show only what is measured and checkable (“120 people booked this month”), or nothing.', law: 'A made-up figure is a false statement. The FTC’s 2024 rule on consumer reviews and testimonials also bans selling or buying fake indicators of social-media influence, such as followers and views.' },
				{ show: '“Best service in town! Anna K.” (there is no such person and no date)', right: 'review', principle: 'Social proof and authority', honest: 'Real reviews with a name, a date and the author’s consent, with a link to the source.', law: 'Fake reviews and testimonials are banned by the FTC’s rule (16 CFR Part 465, in force since 21 October 2024), by the UK’s Digital Markets, Competition and Consumers Act 2024, and by the EU’s list of banned practices.' },
				{ show: 'Subscribe: one click. Unsubscribe: by letter to a postal address, with a copy of your ID', right: 'trap', principle: 'Commitment: easy in, hard out', honest: 'Unsubscribe in one click, the same way you subscribed.', law: 'CAN-SPAM requires a working opt-out and bars charging a fee or asking for more than an email address to honor it. The GDPR says withdrawing consent must be as easy as giving it (Article 7(3)). ROSCA covers the subscription cancellation.' },
				{ show: '☐ Do not uncheck this box if you do not want to stop not receiving our emails', right: 'trick', principle: 'A confusing wording in place of a choice', honest: 'A plain sentence: “Send me your emails”. An empty box.', law: 'Consent must be unambiguous under the GDPR. California’s regulations ask for plain wording and say to avoid double negatives.' }
			] as Card[],
			factors: ['time (no waiting)', 'money (no payment up front)', 'effort (few fields)', 'thought (clear without explanation)', 'social risk (no one to explain it to)', 'familiarity (it works as usual)'],
			capDark: 'Spot the technique',
			capFogg: 'The Fogg model: motivation, ability, prompt',
			show: 'What to show',
			tabDark: 'Dark patterns',
			tabFogg: 'The Fogg model',
			introDark: 'These are invented bits of pages. For each, choose the name of the technique from Harry Brignull’s catalogue: the answer gives the principle, the honest replacement and the rule of law.',
			whichPattern: 'Which technique is this',
			choose: 'choose',
			right: 'Right.',
			no: (n: string) => `No, this is “${n}”.`,
			uses: 'It uses:',
			honest: 'The honest version.',
			lawLabel: 'Near the law.',
			score: 'Right:',
			of: 'of',
			scoreNote: 'The rules are named for orientation, not as a legal assessment: in every case a lawyer decides.',
			motivation: 'Motivation:',
			motivationAria: 'Motivation from 0 to 4',
			ability: 'Ability:',
			removedLabel: 'What you took out of the form:',
			prompt: 'A prompt is there: the person sees the button or a reminder at the right moment',
			chart: 'Chart: ability along the bottom, motivation up the side, and a curved action line',
			xAxis: 'ability grows (everything easier)',
			yAxis: 'motivation',
			line: 'action line',
			acts: 'The action happens: the point is above the line, and there is a prompt.',
			noPrompt: 'The point is above the line, but there is no prompt: the person is ready, but nobody reminded them at the right moment what to do.',
			below: 'The point is below the line: either there is too little desire or it is too hard. Fogg advises making it easier first, and only then strengthening the desire.',
			foggNote: 'This is a teaching model: the numbers are arbitrary, it shows an order and does not measure people.'
		}
	});
	const names = W.names;
	const cards = W.cards;
	let tab = $state<'dark' | 'fogg'>('dark');
	let pick = $state<(Pattern | null)[]>(cards.map(() => null));
	const right = $derived(cards.filter((c, i) => pick[i] === c.right).length);

	// Fogg
	const factors = W.factors;
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
	<figcaption>{tab === 'dark' ? W.capDark : W.capFogg}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.show}>
		<button type="button" role="tab" aria-selected={tab === 'dark'} onclick={() => (tab = 'dark')}>{W.tabDark}</button>
		<button type="button" role="tab" aria-selected={tab === 'fogg'} onclick={() => (tab = 'fogg')}>{W.tabFogg}</button>
	</div>

	{#if tab === 'dark'}
		<p class="dg-out">{W.introDark}</p>
		<ol class="cards">
			{#each cards as c, i (i)}
				<li>
					<p class="show dg-box">{c.show}</p>
					<label class="sel">
						{W.whichPattern}
						<select bind:value={pick[i]}>
							<option value={null}>{W.choose}</option>
							{#each Object.keys(names) as k (k)}<option value={k}>{names[k as Pattern]}</option>{/each}
						</select>
					</label>
					{#if pick[i]}
						<div class="fb" class:ok={pick[i] === c.right} role="status">
							<p>{pick[i] === c.right ? W.right : W.no(names[c.right].toLowerCase())} {W.uses} {c.principle}.</p>
							<p><strong>{W.honest}</strong> {c.honest}</p>
							<p><strong>{W.lawLabel}</strong> {c.law}</p>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">{W.score} <strong>{right}</strong> {W.of} {cards.length}. {W.scoreNote}</p>
	{:else}
		<div class="fogg">
			<div>
				<label class="r">{W.motivation} <strong>{motivation}</strong> <input type="range" min="0" max="4" step="1" bind:value={motivation} aria-label={W.motivationAria} /></label>
				<p class="dg-out">{W.ability} <strong>{ability.toFixed(1)}</strong>. {W.removedLabel}</p>
				<ul class="chk">
					{#each factors as f, i (i)}
						<li><label><input type="checkbox" bind:checked={removed[i]} /> {f}</label></li>
					{/each}
				</ul>
				<label class="r"><input type="checkbox" bind:checked={prompt} /> {W.prompt}</label>
			</div>
			<svg viewBox="0 0 280 240" role="img" aria-label={W.chart}>
				<line x1="30" y1="200" x2="270" y2="200" stroke="currentColor" />
				<line x1="30" y1="20" x2="30" y2="200" stroke="currentColor" />
				<polyline points={line} fill="none" stroke="var(--accent-measure)" stroke-width="2" />
				<circle cx={dot.x} cy={dot.y} r="7" fill={acts ? 'var(--accent-state-text)' : 'currentColor'} />
				<text x="150" y="228" text-anchor="middle" font-size="11">{W.xAxis}</text>
				<text x="12" y="110" font-size="11" transform="rotate(-90 12 110)" text-anchor="middle">{W.yAxis}</text>
				<text x="262" y="80" text-anchor="end" font-size="11">{W.line}</text>
			</svg>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if acts}{W.acts}
			{:else if above}{W.noPrompt}
			{:else}{W.below}{/if}
		</p>
		<p class="dg-out">{W.foggNote}</p>
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
