<!--
	«Ловушка для ботов» (part 15, lesson 6). Four visitors (a person with a mouse, a person with a
	screen reader and a password manager, a simple bot, a smart bot) meet a contact form with defences
	the learner switches on: a hidden trap field in one of three disguises, a time check, a rate limit,
	a third-party captcha. The table says who is let through, who is stopped, and which honest person
	is stopped by mistake. The rules are the lesson's simplified model of how such defences behave.
-->
<script lang="ts">
	import './shared.css';
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });

	type Trap = 'none' | 'colour' | 'display' | 'offscreen';
	let trap = $state<Trap>('none');
	let time = $state(false);
	let rate = $state(false);
	let captcha = $state(false);

	const traps: { id: Trap; label: string; hint: string }[] = [
		{ id: 'none', label: t('Нет ловушки', 'No trap'), hint: '' },
		{ id: 'colour', label: t('Поле спрятано цветом (белое на белом)', 'The field is hidden by color (white on white)'), hint: t('Глаз его не видит, а диктор читает и менеджер паролей заполняет.', 'The eye doesn’t see it, but a screen reader reads it and a password manager fills it in.') },
		{ id: 'display', label: t('Поле спрятано через display: none', 'The field is hidden with display: none'), hint: t('Простой бот его заполнит, а умный пропустит.', 'A simple bot will fill it in, and a clever one will skip it.') },
		{ id: 'offscreen', label: t('Поле сдвинуто за край, с aria-hidden, tabindex="-1" и autocomplete="off"', 'The field is shifted off the edge, with aria-hidden, tabindex=-1 and autocomplete=off'), hint: t('Человек его не найдёт ни глазами, ни Tab, ни диктором.', 'A person won’t find it by eye, by Tab or by screen reader.') }
	];

	type Visitor = { id: string; name: string; honest: boolean };
	const visitors: Visitor[] = [
		{ id: 'mouse', name: t('Человек с мышью', 'A person with a mouse'), honest: true },
		{ id: 'sr', name: t('Человек с диктором и менеджером паролей', 'A person with a screen reader and a password manager'), honest: true },
		{ id: 'simple', name: t('Простой бот: заполняет все поля мгновенно, сотни раз в минуту', 'A simple bot: fills in every field instantly, hundreds of times a minute'), honest: false },
		{ id: 'smart', name: t('Умный бот: настоящий браузер, обходит скрытые поля, ждёт, но шлёт тридцать заявок в минуту с одного адреса', 'A clever bot: a real browser, skips hidden fields, waits, but sends thirty inquiries a minute from one address'), honest: false }
	];

	function verdict(v: Visitor): { passed: boolean; why: string } {
		const why: string[] = [];
		if (v.id === 'mouse') {
			if (captcha) return { passed: true, why: t('Проходит, но решает задачку и отдаёт данные сервису капчи.', 'Gets through, but solves a puzzle and hands data to the CAPTCHA service.') };
			return { passed: true, why: t('Проходит: поле-ловушку не видит и не трогает, форму заполняет не мгновенно.', 'Gets through: doesn’t see or touch the trap field, and doesn’t fill in the form instantly.') };
		}
		if (v.id === 'sr') {
			if (trap === 'colour') return { passed: false, why: t('Остановлен по ошибке: диктор прочёл спрятанное поле, а менеджер паролей его заполнил. Честный человек принят за бота.', 'Stopped by mistake: the screen reader read the hidden field and the password manager filled it in. An honest person is taken for a bot.') };
			if (captcha) return { passed: false, why: t('Остановлен по ошибке или с трудом: часть капч нельзя пройти диктором.', 'Stopped by mistake or with difficulty: some CAPTCHAs can’t be passed with a screen reader.') };
			return { passed: true, why: trap === 'offscreen' ? t('Проходит: ловушка скрыта от диктора и от Tab, автозаполнение отключено.', 'Gets through: the trap is hidden from the screen reader and from Tab, and autofill is off.') : t('Проходит.', 'Gets through.') };
		}
		if (v.id === 'simple') {
			if (trap !== 'none') why.push(t('заполнил ловушку', 'filled in the trap'));
			if (time) why.push(t('отправил быстрее трёх секунд', 'submitted in under three seconds'));
			if (rate) why.push(t('превысил лимит частоты', 'exceeded the rate limit'));
			if (captcha) why.push(t('не прошёл капчу', 'failed the CAPTCHA'));
			return why.length ? { passed: false, why: t(`Остановлен: ${why.join(', ')}.`, `Stopped: ${why.join(', ')}.`) } : { passed: true, why: t('Проходит: ничто его не останавливает.', 'Gets through: nothing stops it.') };
		}
		if (trap === 'offscreen' || trap === 'colour') why.push(t('заполнил ловушку, не распознав её', 'filled in the trap without recognizing it'));
		if (rate) why.push(t('превысил лимит частоты', 'exceeded the rate limit'));
		if (captcha) why.push(t('не справился с капчей (часть умных ботов её проходит)', 'couldn’t handle the CAPTCHA (some clever bots pass it)'));
		if (why.length) return { passed: false, why: t(`Остановлен: ${why.join(', ')}.`, `Stopped: ${why.join(', ')}.`) };
		return { passed: true, why: trap === 'display' ? t('Проходит: скрытое через display: none поле он не трогает, и пауза его не смущает.', 'Gets through: it doesn’t touch a field hidden with display: none, and the pause doesn’t bother it.') : t('Проходит.', 'Gets through.') };
	}

	const rows = $derived(visitors.map((v) => ({ v, r: verdict(v) })));
	const spam = $derived(rows.filter((x) => !x.v.honest && x.r.passed).length);
	const harmed = $derived(rows.filter((x) => x.v.honest && !x.r.passed).length);
</script>

<figure class="dg">
	<figcaption>{t('Ловушка для ботов: кто проходит, кого останавливают', 'A trap for bots: who gets through, who is stopped')}</figcaption>
	<p class="dg-out">{t('Контактная форма и четверо посетителей. Включайте защиту и смотрите, пропускается ли спам и не страдают ли честные люди.', 'A contact form and four visitors. Switch protections on and see whether spam is let through and whether honest people suffer.')}</p>

	<fieldset class="traps">
		<legend>{t('Поле-ловушка (honeypot)', 'Trap field (honeypot)')}</legend>
		{#each traps as t (t.id)}
			<label><input type="radio" name="trap" value={t.id} bind:group={trap} /> <span>{t.label}{#if t.hint}<br /><span class="dim">{t.hint}</span>{/if}</span></label>
		{/each}
	</fieldset>
	<div class="others">
		<label><input type="checkbox" bind:checked={time} /> {t('Проверка времени: слишком быстрая отправка отклоняется', 'Timing check: a submission that is too fast is rejected')}</label>
		<label><input type="checkbox" bind:checked={rate} /> {t('Ограничение частоты: не больше пяти заявок в минуту с одного адреса', 'Rate limit: no more than five inquiries a minute from one address')}</label>
		<label><input type="checkbox" bind:checked={captcha} /> {t('Обязательная капча стороннего сервиса', 'A mandatory third-party CAPTCHA')}</label>
	</div>

	<ul class="rows" aria-live="polite">
		{#each rows as x (x.v.id)}
			<li class:ok={x.r.passed === x.v.honest}>
				<span class="mk" aria-hidden="true">{x.r.passed ? '→' : '✕'}</span>
				<span><strong>{x.v.name}</strong><br />{x.r.passed ? t('Пропущен.', 'Let through.') : t('Не пропущен.', 'Not let through.')} {x.r.why}</span>
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite"><strong>{t('Спам прошёл:', 'Spam got through:')} {spam} {t('из 2. Честных остановлено:', 'of 2. Honest people stopped:')} {harmed} {t('из 2.', 'of 2.')}</strong>
		{#if spam === 0 && harmed === 0} {t('Хорошо: бот остановлен, а люди прошли. Эта связка (скрытое поле, лимит частоты и пауза) обходится без чужой капчи.', 'Good: the bot is stopped and the people get through. This combination (a hidden field, a rate limit and a pause) does without someone else’s CAPTCHA.')}{:else if harmed > 0} {t('Защита, которая останавливает честных людей, хуже, чем спам: проверьте, не заперт ли кто-то снаружи.', 'A protection that stops honest people is worse than spam: check whether anyone is locked outside.')}{:else} {t('Часть спама ещё проходит: у каждой меры своя слабость, поэтому их сочетают.', 'Some spam still gets through: each measure has its own weakness, which is why they are combined.')}{/if}</p>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('схема показывает, что скрытое поле-ловушка останавливает простых ботов, но ловушка, спрятанная только цветом, ловит и человека с диктором. Скрытое за край поле с aria-hidden, tabindex=-1 и autocomplete=off безопасно для людей. Умного бота останавливает лимит частоты, а не ловушка. Обязательная капча чужого сервиса неудобна людям с ограничениями и передаёт данные третьей стороне.', 'the diagram shows that a hidden trap field stops simple bots, but a trap hidden by color alone also catches a person with a screen reader. A field shifted off the edge, with aria-hidden, tabindex=-1 and autocomplete=off, is safe for people. A clever bot is stopped by a rate limit, not by the trap. A mandatory CAPTCHA from someone else’s service is inconvenient for people with disabilities and passes data to a third party.')}</p>
</figure>

<style>
	.traps {
		display: grid;
		gap: var(--space-2);
		margin: 0 0 var(--space-3);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.traps legend {
		padding: 0 var(--space-2);
		color: var(--text-primary);
	}
	.traps label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: start;
		min-height: var(--hit-min);
	}
	.dim {
		color: var(--text-secondary);
	}
	.others {
		display: grid;
		gap: var(--space-1);
		margin: 0 0 var(--space-4);
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.rows li {
		display: grid;
		grid-template-columns: 1.5rem 1fr;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: var(--line) dashed var(--border-rule);
	}
	.rows li.ok {
		border-style: solid;
		border-color: var(--accent-measure);
	}
	.mk {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}
</style>
