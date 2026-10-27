<!--
	«Юридически и по-человечески» (part 10, lesson 6), two tabs.
	1. A short privacy policy of a made-up site, point by point: the legal wording, the plain one,
	   and a tick for each point to keep. Wording may be simplified; what the text must say may not
	   be dropped, and the page says which points are required and what is lost without them.
	2. A tape of statements about an expert: allowed, needs a source, or not allowed. The person
	   sorts each one and is told why. These are teaching judgements, not legal advice.
-->
<script lang="ts">
	import './shared.css';

	type Point = { id: string; name: string; legal: string; plain: string; required: boolean; lost?: string };
	const points: Point[] = [
		{ id: 'op', name: 'Кто обрабатывает', required: true, lost: 'человек не знает, кому отдаёт данные и кому писать', legal: 'Оператором персональных данных является [владелец сайта: ИП или самозанятый, ФИО], далее «Оператор».', plain: 'Ваши данные обрабатывает [владелец сайта: ФИО, ИП или самозанятый].' },
		{ id: 'data', name: 'Какие данные', required: true, lost: 'непонятно, на что человек соглашается', legal: 'К персональным данным относятся фамилия, имя, номер телефона и адрес электронной почты, предоставляемые субъектом посредством заполнения формы на сайте.', plain: 'Мы получаем то, что вы вписываете в форму: имя, телефон и почту.' },
		{ id: 'goal', name: 'Зачем', required: true, lost: 'без цели нет согласия: цель должна быть названа, и данные нельзя использовать для чего-то другого', legal: 'Обработка осуществляется в целях рассмотрения обращения субъекта и связи с ним.', plain: 'Чтобы ответить на вашу заявку и связаться с вами. Больше ни для чего.' },
		{ id: 'act', name: 'Что делаем и кому передаём', required: true, lost: 'человек не знает, кто ещё увидит его данные', legal: 'Оператор осуществляет сбор, запись, хранение и удаление данных; хранение осуществляется с привлечением хостинг-провайдера [название] на территории Российской Федерации.', plain: 'Мы записываем и храним данные, а потом удаляем. Хранит их хостинг-компания [название], серверы в России.' },
		{ id: 'term', name: 'Сколько хранится', required: true, lost: 'срок это обязательная часть согласия: бессрочное хранение без объяснений недопустимо', legal: 'Обработка осуществляется в течение срока, необходимого для достижения целей, но не более трёх лет с даты обращения.', plain: 'Храним не дольше трёх лет после вашей заявки. Срок вы выбираете сами, когда пишете свой текст.' },
		{ id: 'off', name: 'Как отозвать согласие', required: true, lost: 'право отозвать согласие есть у человека всегда, и текст обязан сказать, как это сделать', legal: 'Согласие может быть отозвано субъектом путём направления письменного заявления Оператору на адрес электронной почты [адрес].', plain: 'Чтобы отозвать согласие, напишите на [адрес]. Мы удалим данные.' },
		{ id: 'hist', name: 'История политики', required: false, legal: 'Настоящая политика является общедоступным документом и подлежит изменению Оператором в одностороннем порядке.', plain: 'Мы можем менять этот текст и публиковать новую версию здесь.' }
	];
	let keep = $state<Record<string, boolean>>(Object.fromEntries(points.map((p) => [p.id, true])));
	let simple = $state<Record<string, boolean>>(Object.fromEntries(points.map((p) => [p.id, true])));
	const missing = $derived(points.filter((p) => p.required && !keep[p.id]));
	const composed = $derived(points.filter((p) => keep[p.id]).map((p) => (simple[p.id] ? p.plain : p.legal)).join(' '));

	type Verdict = 'ok' | 'source' | 'no';
	type Claim = { text: string; right: Verdict; why: string };
	const claims: Claim[] = [
		{ text: 'Аттестат кадастрового инженера № 00-00-00, ссылка на запись в реестре', right: 'ok', why: 'Документ с номером и ссылкой на реестр: любой может проверить.' },
		{ text: 'Работаю с земельными спорами с 2011 года', right: 'source', why: 'Факт, но проверяемый только документами (трудовая, договоры, членство). Положите источник рядом.' },
		{ text: 'Лучший эксперт в городе', right: 'no', why: 'Превосходная степень без критерия и без подтверждения: риск по закону о рекламе, а для эксперта ещё и вопрос этики.' },
		{ text: 'Выиграли 95% дел', right: 'no', why: 'Эксперт и адвокат не «выигрывают» дело: решает суд. Статистика не проверяется, и клиенты и дела защищены тайной. Для этих профессий такие обещания ещё и запрещены своими правилами.' },
		{ text: 'Гарантируем результат', right: 'no', why: 'Результат зависит от суда и документов. Гарантия заведомо недостоверна, а эксперт к тому же обязан быть независим.' },
		{ text: 'Первая консультация бесплатна', right: 'source', why: 'Условия нужно назвать: сколько длится, что входит и что нет. Умолчание об условиях делает рекламу недостоверной.' },
		{ text: 'Принимаю по записи, будни с 9 до 18', right: 'ok', why: 'Простой проверяемый факт.' },
		{ text: 'Работаю быстрее всех конкурентов', right: 'no', why: 'Сравнение без критерия и данных. Лучше назвать свой срок числом.' }
	];
	const labels: Record<Verdict, string> = { ok: 'Допустимо', source: 'Нужен источник', no: 'Нельзя' };
	let tab = $state<'plain' | 'tape'>('plain');
	let answer = $state<(Verdict | null)[]>(claims.map(() => null));
	const right = $derived(claims.filter((c, i) => answer[i] === c.right).length);
</script>

<figure class="dg">
	<figcaption>{tab === 'plain' ? 'Политика: упростить, не потеряв главного' : 'Лента утверждений'}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Что показать">
		<button type="button" role="tab" aria-selected={tab === 'plain'} onclick={() => (tab = 'plain')}>Политика</button>
		<button type="button" role="tab" aria-selected={tab === 'tape'} onclick={() => (tab = 'tape')}>Утверждения</button>
	</div>

	{#if tab === 'plain'}
		<p class="dg-out">Учебная политика вымышленного сайта (не юридическая консультация). У каждого пункта два варианта слов. Оставьте пункт в тексте или уберите его, и посмотрите, чего не хватит.</p>
		<ul class="pts">
			{#each points as p (p.id)}
				<li>
					<label class="keep"><input type="checkbox" bind:checked={keep[p.id]} /> <strong>{p.name}</strong>{p.required ? ' (обязательно)' : ' (можно сократить)'}</label>
					{#if keep[p.id]}
						<div class="dg-ctl">
							<button type="button" aria-pressed={simple[p.id]} onclick={() => (simple[p.id] = true)}>Простыми словами</button>
							<button type="button" aria-pressed={!simple[p.id]} onclick={() => (simple[p.id] = false)}>Юридической формулой</button>
						</div>
						<p class="txt">{simple[p.id] ? p.plain : p.legal}</p>
					{/if}
				</li>
			{/each}
		</ul>
		<p class="dg-out" aria-live="polite">
			{#if missing.length}
				Не хватает: {#each missing as m, i (m.id)}<strong>{m.name.toLowerCase()}</strong> ({m.lost}){i < missing.length - 1 ? '; ' : '.'}{/each}
			{:else}
				Все обязательные пункты на месте. Простые слова заменили формулы, а смысл остался.
			{/if}
		</p>
		<div class="dg-box"><p class="k">Получившийся текст</p>{composed}</div>
	{:else}
		<p class="dg-out">Для каждого утверждения об эксперте выберите: допустимо, нужен источник или нельзя. Ответ покажет причину.</p>
		<ol class="cl">
			{#each claims as c, i (i)}
				<li>
					<p class="c">«{c.text}»</p>
					<div class="dg-ctl" role="group" aria-label="Оценка утверждения {i + 1}">
						{#each Object.keys(labels) as v (v)}
							<button type="button" aria-pressed={answer[i] === v} onclick={() => (answer[i] = v as Verdict)}>{labels[v as Verdict]}</button>
						{/each}
					</div>
					{#if answer[i]}
						<p class="fb" class:ok={answer[i] === c.right} role="status">{answer[i] === c.right ? 'Верно.' : `Не совсем: здесь «${labels[c.right].toLowerCase()}».`} {c.why}</p>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">Верно: <strong>{right}</strong> из {claims.length}.</p>
	{/if}
</figure>

<style>
	.pts,
	.cl {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.keep {
		display: flex;
	}
	.txt {
		margin: 0;
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
	}
	.c {
		margin: 0 0 var(--space-2);
		color: var(--text-primary);
	}
	.fb {
		margin: 0;
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
		color: var(--text-secondary);
	}
	.fb.ok {
		border-left-color: var(--accent-state-text);
	}
	.k {
		margin: 0 0 var(--space-2);
		color: var(--text-secondary);
	}
</style>
