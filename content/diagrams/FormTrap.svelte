<!--
	«Ловушка для ботов» (part 15, lesson 6). Four visitors (a person with a mouse, a person with a
	screen reader and a password manager, a simple bot, a smart bot) meet a contact form with defences
	the learner switches on: a hidden trap field in one of three disguises, a time check, a rate limit,
	a third-party captcha. The table says who is let through, who is stopped, and which honest person
	is stopped by mistake. The rules are the lesson's simplified model of how such defences behave.
-->
<script lang="ts">
	import './shared.css';

	type Trap = 'none' | 'colour' | 'display' | 'offscreen';
	let trap = $state<Trap>('none');
	let time = $state(false);
	let rate = $state(false);
	let captcha = $state(false);

	const traps: { id: Trap; label: string; hint: string }[] = [
		{ id: 'none', label: 'Нет ловушки', hint: '' },
		{ id: 'colour', label: 'Поле спрятано цветом (белое на белом)', hint: 'Глаз его не видит, а диктор читает и менеджер паролей заполняет.' },
		{ id: 'display', label: 'Поле спрятано через display: none', hint: 'Простой бот его заполнит, а умный пропустит.' },
		{ id: 'offscreen', label: 'Поле сдвинуто за край, с aria-hidden, tabindex="-1" и autocomplete="off"', hint: 'Человек его не найдёт ни глазами, ни Tab, ни диктором.' }
	];

	type Visitor = { id: string; name: string; honest: boolean };
	const visitors: Visitor[] = [
		{ id: 'mouse', name: 'Человек с мышью', honest: true },
		{ id: 'sr', name: 'Человек с диктором и менеджером паролей', honest: true },
		{ id: 'simple', name: 'Простой бот: заполняет все поля мгновенно, сотни раз в минуту', honest: false },
		{ id: 'smart', name: 'Умный бот: настоящий браузер, обходит скрытые поля, ждёт, но шлёт тридцать заявок в минуту с одного адреса', honest: false }
	];

	function verdict(v: Visitor): { passed: boolean; why: string } {
		const why: string[] = [];
		if (v.id === 'mouse') {
			if (captcha) return { passed: true, why: 'Проходит, но решает задачку и отдаёт данные сервису капчи.' };
			return { passed: true, why: 'Проходит: поле-ловушку не видит и не трогает, форму заполняет не мгновенно.' };
		}
		if (v.id === 'sr') {
			if (trap === 'colour') return { passed: false, why: 'Остановлен по ошибке: диктор прочёл спрятанное поле, а менеджер паролей его заполнил. Честный человек принят за бота.' };
			if (captcha) return { passed: false, why: 'Остановлен по ошибке или с трудом: часть капч нельзя пройти диктором.' };
			return { passed: true, why: trap === 'offscreen' ? 'Проходит: ловушка скрыта от диктора и от Tab, автозаполнение отключено.' : 'Проходит.' };
		}
		if (v.id === 'simple') {
			if (trap !== 'none') why.push('заполнил ловушку');
			if (time) why.push('отправил быстрее трёх секунд');
			if (rate) why.push('превысил лимит частоты');
			if (captcha) why.push('не прошёл капчу');
			return why.length ? { passed: false, why: `Остановлен: ${why.join(', ')}.` } : { passed: true, why: 'Проходит: ничто его не останавливает.' };
		}
		if (trap === 'offscreen' || trap === 'colour') why.push('заполнил ловушку, не распознав её');
		if (rate) why.push('превысил лимит частоты');
		if (captcha) why.push('не справился с капчей (часть умных ботов её проходит)');
		if (why.length) return { passed: false, why: `Остановлен: ${why.join(', ')}.` };
		return { passed: true, why: trap === 'display' ? 'Проходит: скрытое через display: none поле он не трогает, и пауза его не смущает.' : 'Проходит.' };
	}

	const rows = $derived(visitors.map((v) => ({ v, r: verdict(v) })));
	const spam = $derived(rows.filter((x) => !x.v.honest && x.r.passed).length);
	const harmed = $derived(rows.filter((x) => x.v.honest && !x.r.passed).length);
</script>

<figure class="dg">
	<figcaption>Ловушка для ботов: кто проходит, кого останавливают</figcaption>
	<p class="dg-out">Контактная форма и четверо посетителей. Включайте защиту и смотрите, пропускается ли спам и не страдают ли честные люди.</p>

	<fieldset class="traps">
		<legend>Поле-ловушка (honeypot)</legend>
		{#each traps as t (t.id)}
			<label><input type="radio" name="trap" value={t.id} bind:group={trap} /> <span>{t.label}{#if t.hint}<br /><span class="dim">{t.hint}</span>{/if}</span></label>
		{/each}
	</fieldset>
	<div class="others">
		<label><input type="checkbox" bind:checked={time} /> Проверка времени: слишком быстрая отправка отклоняется</label>
		<label><input type="checkbox" bind:checked={rate} /> Ограничение частоты: не больше пяти заявок в минуту с одного адреса</label>
		<label><input type="checkbox" bind:checked={captcha} /> Обязательная капча стороннего сервиса</label>
	</div>

	<ul class="rows" aria-live="polite">
		{#each rows as x (x.v.id)}
			<li class:ok={x.r.passed === x.v.honest}>
				<span class="mk" aria-hidden="true">{x.r.passed ? '→' : '✕'}</span>
				<span><strong>{x.v.name}</strong><br />{x.r.passed ? 'Пропущен.' : 'Не пропущен.'} {x.r.why}</span>
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite"><strong>Спам прошёл: {spam} из 2. Честных остановлено: {harmed} из 2.</strong>
		{#if spam === 0 && harmed === 0} Хорошо: бот остановлен, а люди прошли. Эта связка (скрытое поле, лимит частоты и пауза) обходится без чужой капчи.{:else if harmed > 0} Защита, которая останавливает честных людей, хуже, чем спам: проверьте, не заперт ли кто-то снаружи.{:else} Часть спама ещё проходит: у каждой меры своя слабость, поэтому их сочетают.{/if}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> схема показывает, что скрытое поле-ловушка останавливает простых ботов, но ловушка, спрятанная только цветом, ловит и человека с диктором. Скрытое за край поле с aria-hidden, tabindex=-1 и autocomplete=off безопасно для людей. Умного бота останавливает лимит частоты, а не ловушка. Обязательная капча чужого сервиса неудобна людям с ограничениями и передаёт данные третьей стороне.</p>
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
