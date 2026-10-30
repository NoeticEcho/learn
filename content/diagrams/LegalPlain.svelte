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
	import { pick } from '#lib/i18n/index.ts';

	type Point = { id: string; name: string; legal: string; plain: string; required: boolean; lost?: string };
	type Verdict = 'ok' | 'source' | 'no';
	type Claim = { text: string; right: Verdict; why: string };
	const W = pick({
		ru: {
			points: [
					{ id: 'op', name: 'Кто обрабатывает', required: true, lost: 'человек не знает, кому отдаёт данные и кому писать', legal: 'Оператором персональных данных является [владелец сайта: ИП или самозанятый, ФИО], далее «Оператор».', plain: 'Ваши данные обрабатывает [владелец сайта: ФИО, ИП или самозанятый].' },
					{ id: 'data', name: 'Какие данные', required: true, lost: 'непонятно, на что человек соглашается', legal: 'К персональным данным относятся фамилия, имя, номер телефона и адрес электронной почты, предоставляемые субъектом посредством заполнения формы на сайте.', plain: 'Мы получаем то, что вы вписываете в форму: имя, телефон и почту.' },
					{ id: 'goal', name: 'Зачем', required: true, lost: 'без цели нет согласия: цель должна быть названа, и данные нельзя использовать для чего-то другого', legal: 'Обработка осуществляется в целях рассмотрения обращения субъекта и связи с ним.', plain: 'Чтобы ответить на вашу заявку и связаться с вами. Больше ни для чего.' },
					{ id: 'act', name: 'Что делаем и кому передаём', required: true, lost: 'человек не знает, кто ещё увидит его данные', legal: 'Оператор осуществляет сбор, запись, хранение и удаление данных; хранение осуществляется с привлечением хостинг-провайдера [название] на территории Российской Федерации.', plain: 'Мы записываем и храним данные, а потом удаляем. Хранит их хостинг-компания [название], серверы в России.' },
					{ id: 'term', name: 'Сколько хранится', required: true, lost: 'срок это обязательная часть согласия: бессрочное хранение без объяснений недопустимо', legal: 'Обработка осуществляется в течение срока, необходимого для достижения целей, но не более трёх лет с даты обращения.', plain: 'Храним не дольше трёх лет после вашей заявки. Срок вы выбираете сами, когда пишете свой текст.' },
					{ id: 'off', name: 'Как отозвать согласие', required: true, lost: 'право отозвать согласие есть у человека всегда, и текст обязан сказать, как это сделать', legal: 'Согласие может быть отозвано субъектом путём направления письменного заявления Оператору на адрес электронной почты [адрес].', plain: 'Чтобы отозвать согласие, напишите на [адрес]. Мы удалим данные.' },
					{ id: 'hist', name: 'История политики', required: false, legal: 'Настоящая политика является общедоступным документом и подлежит изменению Оператором в одностороннем порядке.', plain: 'Мы можем менять этот текст и публиковать новую версию здесь.' }
				] as Point[],
			claims: [
					{ text: 'Аттестат кадастрового инженера № 00-00-00, ссылка на запись в реестре', right: 'ok', why: 'Документ с номером и ссылкой на реестр: любой может проверить.' },
					{ text: 'Работаю с земельными спорами с 2011 года', right: 'source', why: 'Факт, но проверяемый только документами (трудовая, договоры, членство). Положите источник рядом.' },
					{ text: 'Лучший эксперт в городе', right: 'no', why: 'Превосходная степень без критерия и без подтверждения: риск по закону о рекламе, а для эксперта ещё и вопрос этики.' },
					{ text: 'Выиграли 95% дел', right: 'no', why: 'Эксперт и адвокат не «выигрывают» дело: решает суд. Статистика не проверяется, и клиенты и дела защищены тайной. Для этих профессий такие обещания ещё и запрещены своими правилами.' },
					{ text: 'Гарантируем результат', right: 'no', why: 'Результат зависит от суда и документов. Гарантия заведомо недостоверна, а эксперт к тому же обязан быть независим.' },
					{ text: 'Первая консультация бесплатна', right: 'source', why: 'Условия нужно назвать: сколько длится, что входит и что нет. Умолчание об условиях делает рекламу недостоверной.' },
					{ text: 'Принимаю по записи, будни с 9 до 18', right: 'ok', why: 'Простой проверяемый факт.' },
					{ text: 'Работаю быстрее всех конкурентов', right: 'no', why: 'Сравнение без критерия и данных. Лучше назвать свой срок числом.' }
				] as Claim[],
			labels: { ok: 'Допустимо', source: 'Нужен источник', no: 'Нельзя' } as Record<Verdict, string>,
			capPlain: 'Политика: упростить, не потеряв главного',
			capTape: 'Лента утверждений',
			show: 'Что показать',
			tabPlain: 'Политика',
			tabTape: 'Утверждения',
			introPlain: 'Учебная политика вымышленного сайта (не юридическая консультация). У каждого пункта два варианта слов. Оставьте пункт в тексте или уберите его, и посмотрите, чего не хватит.',
			required: ' (обязательно)',
			optional: ' (можно сократить)',
			plainBtn: 'Простыми словами',
			legalBtn: 'Юридической формулой',
			missing: 'Не хватает:',
			allThere: 'Все обязательные пункты на месте. Простые слова заменили формулы, а смысл остался.',
			result: 'Получившийся текст',
			introTape: 'Для каждого утверждения об эксперте выберите: допустимо, нужен источник или нельзя. Ответ покажет причину.',
			rate: (n: number) => `Оценка утверждения ${n}`,
			quote: (t: string) => `«${t}»`,
			right: 'Верно.',
			notQuite: (l: string) => `Не совсем: здесь «${l}».`,
			correct: 'Верно:',
			of: 'из'
		},
		en: {
			points: [
				{ id: 'op', name: 'Who handles the data', required: true, lost: 'the person doesn’t know who they are giving their data to, or whom to write to', legal: 'The controller of the personal data is [site owner: name, sole proprietor or company], hereinafter “the Controller”.', plain: 'Your data is handled by [site owner: name, sole proprietor or company].' },
				{ id: 'data', name: 'Which data', required: true, lost: 'it isn’t clear what the person is agreeing to', legal: 'The personal data comprises the surname, forename, telephone number and email address provided by the data subject by completing the form on the website.', plain: 'We receive what you type into the form: your name, phone number and email.' },
				{ id: 'goal', name: 'What for', required: true, lost: 'without a purpose there is no valid consent: the purpose must be named, and the data may not be used for anything else', legal: 'The data is processed for the purposes of considering the data subject’s inquiry and communicating with the data subject.', plain: 'To answer your request and get in touch with you. Nothing else.' },
				{ id: 'act', name: 'What we do and who gets it', required: true, lost: 'the person doesn’t know who else will see their data', legal: 'The Controller collects, records, stores and erases the data; storage is carried out by the hosting provider [name], whose servers are located in [country].', plain: 'We record and store the data, and later delete it. A hosting company, [name], keeps it on servers in [country].' },
				{ id: 'term', name: 'How long it is kept', required: true, lost: 'a retention period is a required part of the notice: keeping data indefinitely with no explanation is not acceptable', legal: 'The data is retained for the period necessary to achieve the purposes, and in any event for no longer than three years from the date of the inquiry.', plain: 'We keep it for no more than three years after your request. You choose the period when you write your own text.' },
				{ id: 'off', name: 'How to withdraw consent and complain', required: true, lost: 'a person can always withdraw consent and complain to the regulator, and the text has to say how', legal: 'Consent may be withdrawn by the data subject at any time by sending a written notice to the Controller at [address]. The data subject has the right to lodge a complaint with a supervisory authority.', plain: 'To withdraw your consent, write to [address]. We will delete the data. You can also complain to the data protection authority.' },
				{ id: 'hist', name: 'History of the notice', required: false, legal: 'This notice is a publicly available document and may be amended by the Controller at its sole discretion.', plain: 'We may change this text and will publish the new version here.' }
			] as Point[],
			claims: [
				{ text: 'Licensed surveyor, license no. 00-00-00, with a link to the state board’s register', right: 'ok', why: 'A document with a number and a link to a register: anyone can check it.' },
				{ text: 'I’ve worked on boundary disputes since 2011', right: 'source', why: 'A fact, but one that only documents can prove (employment records, contracts, membership). Put the source beside it.' },
				{ text: 'The best expert in town', right: 'no', why: 'A superlative with no criterion and no proof: a risk under advertising rules (the FTC in the US, the ASA in the UK), and for an expert an ethics question as well.' },
				{ text: 'We win 95% of our cases', right: 'no', why: 'An expert or attorney doesn’t “win” a case: a court decides. The statistic can’t be checked, and clients and cases are protected by confidentiality. Professional rules in these fields often restrict such claims too.' },
				{ text: 'We guarantee the result', right: 'no', why: 'The result depends on the court and the documents. A guarantee is untrue from the start, and an expert is also bound to be independent.' },
				{ text: 'The first consultation is free', right: 'source', why: 'The terms must be stated: how long it lasts, what it includes and what it doesn’t. Leaving the terms out makes an advertisement misleading.' },
				{ text: 'By appointment, weekdays 9 to 5', right: 'ok', why: 'A plain, checkable fact.' },
				{ text: 'We work faster than any competitor', right: 'no', why: 'A comparison with no criterion and no data. Better to give your own turnaround as a number.' }
			] as Claim[],
			labels: { ok: 'Allowed', source: 'Needs a source', no: 'Not allowed' } as Record<Verdict, string>,
			capPlain: 'The notice: simplified without losing the essentials',
			capTape: 'A tape of statements',
			show: 'What to show',
			tabPlain: 'Notice',
			tabTape: 'Statements',
			introPlain: 'A teaching privacy notice for an invented site (not legal advice). Each point has two versions of the words. Keep a point in the text or remove it, and see what is missing.',
			required: ' (required)',
			optional: ' (can be cut)',
			plainBtn: 'In plain words',
			legalBtn: 'As a legal formula',
			missing: 'Missing:',
			allThere: 'All the required points are in place. Plain words replaced the formulas, and the meaning stayed.',
			result: 'The resulting text',
			introTape: 'For each statement about an expert choose: allowed, needs a source, or not allowed. The answer shows the reason.',
			rate: (n: number) => `Verdict on statement ${n}`,
			quote: (t: string) => `“${t}”`,
			right: 'Right.',
			notQuite: (l: string) => `Not quite: this one is “${l}”.`,
			correct: 'Right:',
			of: 'of'
		}
	});
	const points = W.points;
	const claims = W.claims;
	let keep = $state<Record<string, boolean>>(Object.fromEntries(points.map((p) => [p.id, true])));
	let simple = $state<Record<string, boolean>>(Object.fromEntries(points.map((p) => [p.id, true])));
	const missing = $derived(points.filter((p) => p.required && !keep[p.id]));
	const composed = $derived(points.filter((p) => keep[p.id]).map((p) => (simple[p.id] ? p.plain : p.legal)).join(' '));

	const labels = W.labels;
	let tab = $state<'plain' | 'tape'>('plain');
	let answer = $state<(Verdict | null)[]>(claims.map(() => null));
	const right = $derived(claims.filter((c, i) => answer[i] === c.right).length);
</script>

<figure class="dg">
	<figcaption>{tab === 'plain' ? W.capPlain : W.capTape}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.show}>
		<button type="button" role="tab" aria-selected={tab === 'plain'} onclick={() => (tab = 'plain')}>{W.tabPlain}</button>
		<button type="button" role="tab" aria-selected={tab === 'tape'} onclick={() => (tab = 'tape')}>{W.tabTape}</button>
	</div>

	{#if tab === 'plain'}
		<p class="dg-out">{W.introPlain}</p>
		<ul class="pts">
			{#each points as p (p.id)}
				<li>
					<label class="keep"><input type="checkbox" bind:checked={keep[p.id]} /> <strong>{p.name}</strong>{p.required ? W.required : W.optional}</label>
					{#if keep[p.id]}
						<div class="dg-ctl">
							<button type="button" aria-pressed={simple[p.id]} onclick={() => (simple[p.id] = true)}>{W.plainBtn}</button>
							<button type="button" aria-pressed={!simple[p.id]} onclick={() => (simple[p.id] = false)}>{W.legalBtn}</button>
						</div>
						<p class="txt">{simple[p.id] ? p.plain : p.legal}</p>
					{/if}
				</li>
			{/each}
		</ul>
		<p class="dg-out" aria-live="polite">
			{#if missing.length}
				{W.missing} {#each missing as m, i (m.id)}<strong>{m.name.toLowerCase()}</strong> ({m.lost}){i < missing.length - 1 ? '; ' : '.'}{/each}
			{:else}
				{W.allThere}
			{/if}
		</p>
		<div class="dg-box"><p class="k">{W.result}</p>{composed}</div>
	{:else}
		<p class="dg-out">{W.introTape}</p>
		<ol class="cl">
			{#each claims as c, i (i)}
				<li>
					<p class="c">{W.quote(c.text)}</p>
					<div class="dg-ctl" role="group" aria-label={W.rate(i + 1)}>
						{#each Object.keys(labels) as v (v)}
							<button type="button" aria-pressed={answer[i] === v} onclick={() => (answer[i] = v as Verdict)}>{labels[v as Verdict]}</button>
						{/each}
					</div>
					{#if answer[i]}
						<p class="fb" class:ok={answer[i] === c.right} role="status">{answer[i] === c.right ? W.right : W.notQuite(labels[c.right].toLowerCase())} {c.why}</p>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">{W.correct} <strong>{right}</strong> {W.of} {claims.length}.</p>
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
