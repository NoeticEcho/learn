<!--
	«Что на мне лежит» (part 15, lesson 7). Bilingual: the English edition teaches GDPR, UK GDPR and the US state laws, so it has its own list of duties (dutiesEn), not a translation of Russia’s. Ten things a site may do with people's data (a request
	form, a counter, session recording, a foreign chat widget, a newsletter, an account, a payment, a
	third-party form handler, free text where people describe their case, photographs of people).
	The person switches the ones their site has, and the map lights up the duties of an operator of
	personal data that follow, each with its article of Federal Law 152-FZ (or 38-FZ for the
	newsletter). It is a teaching map of what to ask, dated 27.10.2026, not legal advice; the laws
	change, and every line says so by pointing to the current text.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, «English edition»): the Russian stays as written. */
	const t = (ru: string, en: string) => pick({ ru, en });

	type Feature = { id: string; label: string };
	const featuresRu: Feature[] = [
		{ id: 'form', label: 'Форма заявки (имя, телефон)' },
		{ id: 'counter', label: 'Счётчик посещений (Яндекс Метрика)' },
		{ id: 'replay', label: 'Запись действий посетителей (Вебвизор)' },
		{ id: 'chat', label: 'Иностранный чат-виджет' },
		{ id: 'mail', label: 'Рассылка новостей' },
		{ id: 'account', label: 'Личный кабинет или вход' },
		{ id: 'pay', label: 'Оплата на сайте' },
		{ id: 'handler', label: 'Заявки принимает сторонний сервис форм или CRM' },
		{ id: 'free', label: 'В поле «Сообщение» люди описывают своё дело, здоровье, семью' },
		{ id: 'photo', label: 'На сайте фотографии людей' }
	];
	let on = $state<Record<string, boolean>>({});

	type Duty = { id: string; name: string; art: string; when: (f: Record<string, boolean>) => boolean; what: string; lesson: string };
	const dutiesRu: Duty[] = [
		{ id: 'basis', name: 'Определить цель, основание и срок для каждого поля', art: 'ст. 5, 6', when: (f) => !!(f.form || f.account || f.mail || f.pay || f.counter || f.replay || f.chat), what: 'Цель называют заранее, собирают не больше нужного, хранят не дольше, чем нужна цель.', lesson: 'этот урок' },
		{ id: 'consent', name: 'Взять согласие отдельным действием и отдельным документом', art: 'ст. 9', when: (f) => !!(f.form || f.account || f.mail || f.chat || f.replay || f.photo || f.free), what: 'Свободное, конкретное, информированное, сознательное, однозначное; с 1 сентября 2025 оформляется отдельно от других документов и условий. Для договора и закона согласие не всегда нужно.', lesson: 'следующий урок' },
		{ id: 'policy', name: 'Опубликовать политику обработки', art: 'ст. 18.1', when: (f) => !!(f.form || f.account || f.mail || f.pay || f.chat || f.counter || f.replay), what: 'Документ о политике должен быть доступен на сайте, где данные собираются через интернет.', lesson: 'следующий урок' },
		{ id: 'notify', name: 'Уведомить Роскомнадзор о начале обработки (или проверить исключения)', art: 'ст. 22', when: (f) => !!(f.form || f.account || f.mail || f.pay || f.chat || f.replay || f.handler), what: 'По общему правилу оператор уведомляет до начала обработки. Исключения есть, но узкие: решите с юристом.', lesson: 'этот урок' },
		{ id: 'local', name: 'Хранить первичную запись данных граждан РФ в базе в России', art: 'ст. 18, ч. 5', when: (f) => !!(f.form || f.account || f.mail || f.pay || f.handler || f.free), what: 'Первичная запись и накопление данных граждан РФ идут в базе на территории России.', lesson: 'урок о данных и урок об инфраструктуре' },
		{ id: 'border', name: 'Разобраться с передачей данных за границу', art: 'ст. 12', when: (f) => !!f.chat, what: 'Иностранный сервис получает данные: нужно знать страну, уведомить Роскомнадзор до передачи и выбрать, на каком основании передаёте. Перечень стран с адекватной защитой и критерии менялись в 2026 году.', lesson: 'этот урок' },
		{ id: 'processor', name: 'Оформить поручение лицу, которое обрабатывает данные за вас', art: 'ст. 6, ч. 3', when: (f) => !!(f.handler || f.chat || f.mail || f.pay || f.replay), what: 'С сервисом форм, рассылки, CRM, платёжным сервисом нужен договор или условия, где записаны цели, меры защиты и ответственность. Вы остаётесь ответственным перед человеком.', lesson: 'этот урок' },
		{ id: 'mailconsent', name: 'Взять отдельное согласие на рассылку', art: '38-ФЗ, ст. 18', when: (f) => !!f.mail, what: 'Согласие на обработку заявки не равно согласию получать рекламу. Нужна отдельная пустая галочка и простая отписка.', lesson: 'урок о почте и урок о рекламе' },
		{ id: 'special', name: 'Особые категории: здоровье, политика, религия, судимость', art: 'ст. 10', when: (f) => !!f.free, what: 'Если люди присылают такое, действуют строгие правила. Лучше не собирать: подскажите в форме, что писать не нужно. Для адвоката и эксперта добавляется профессиональная тайна.', lesson: 'этот урок и урок об экспертной этике' },
		{ id: 'cookies', name: 'Сказать о счётчиках и записях в политике, не запускать их тайком', art: 'ст. 6, 9, 18.1', when: (f) => !!(f.counter || f.replay || f.chat), what: 'Отдельного закона о cookie нет, но идентификаторы посетителя могут быть персональными данными.', lesson: 'урок о cookie' },
		{ id: 'photo', name: 'Согласие человека на публикацию его изображения', art: 'ГК, ст. 152.1', when: (f) => !!f.photo, what: 'Изображение гражданина публикуют с его согласия, кроме особых случаев. Это не 152-ФЗ, а Гражданский кодекс.', lesson: 'урок об авторском праве' },
		{ id: 'leak', name: 'Быть готовым к утечке: журнал, ответственный, сроки сообщения', art: 'ст. 21', when: (f) => Object.values(f).some(Boolean), what: 'При утечке персональных данных оператор сообщает Роскомнадзору в короткие сроки (первое сообщение в течение суток), поэтому план нужен заранее.', lesson: 'этот урок' }
	];

	const featuresEn: Feature[] = [
		{ id: 'form', label: 'Inquiry form (name, phone)' },
		{ id: 'counter', label: 'Analytics counter (for example Google Analytics)' },
		{ id: 'replay', label: 'Session recording (for example Hotjar or Microsoft Clarity)' },
		{ id: 'chat', label: 'Third-party chat widget hosted abroad' },
		{ id: 'mail', label: 'Newsletter' },
		{ id: 'account', label: 'Customer account or login' },
		{ id: 'pay', label: 'Payment on the site' },
		{ id: 'handler', label: 'A third-party form service or CRM receives the inquiries' },
		{ id: 'free', label: 'In the “Message” field people describe their case, health or family' },
		{ id: 'photo', label: 'Photos of people on the site' }
	];
	const dutiesEn: Duty[] = [
		{ id: 'basis', name: 'Decide a purpose, a lawful basis and a retention period for each field', art: 'GDPR Arts. 5, 6', when: dutiesRu[0].when, what: 'The purpose is named in advance, you collect no more than is needed and keep it no longer than the purpose requires.', lesson: 'this lesson' },
		{ id: 'consent', name: 'Where you rely on consent, get it by a clear action and keep proof', art: 'GDPR Arts. 4(11), 7', when: dutiesRu[1].when, what: 'Freely given, specific, informed and unambiguous; presented apart from other matters; as easy to withdraw as to give. For a contract or a legal duty, consent is not always needed.', lesson: 'the next lesson' },
		{ id: 'policy', name: 'Publish a privacy notice', art: 'GDPR Arts. 13, 14; CCPA notice at collection', when: dutiesRu[2].when, what: 'Say who you are, why you process the data, on what basis, who receives it, how long you keep it and what the person’s rights are.', lesson: 'the next lesson' },
		{ id: 'notify', name: 'Check registration: the UK ICO fee, an EU representative', art: 'UK fee regulations 2018; GDPR Art. 27', when: dutiesRu[3].when, what: 'The GDPR has no general duty to notify before processing. In the UK most controllers pay a yearly fee to the ICO, and a non-EU controller covered by Article 3(2) may need a representative in the EU. Decide with a lawyer.', lesson: 'this lesson' },
		{ id: 'local', name: 'Know where the data is stored and whether it leaves the UK or EEA', art: 'GDPR Chapter V', when: dutiesRu[4].when, what: 'The GDPR lets data be stored anywhere but regulates transfers out of the EEA. Know the country of every server that holds your data.', lesson: 'this lesson and the lesson on infrastructure' },
		{ id: 'border', name: 'Put a transfer mechanism in place for a recipient abroad', art: 'GDPR Arts. 45, 46', when: dutiesRu[5].when, what: 'A chat widget hosted abroad receives data: know the country and rely on an adequacy decision (for example the EU–US Data Privacy Framework for certified firms) or standard contractual clauses.', lesson: 'this lesson' },
		{ id: 'processor', name: 'Sign a contract with each processor that handles data for you', art: 'GDPR Art. 28', when: dutiesRu[6].when, what: 'With a form service, a mailing service, a CRM or a payment service you need a contract or accepted terms that record the purposes, the security measures and the duties. You stay answerable to the person.', lesson: 'this lesson' },
		{ id: 'mailconsent', name: 'Get separate consent for marketing email', art: 'PECR and ePrivacy; CAN-SPAM', when: dutiesRu[7].when, what: 'Consent to an inquiry is not consent to promotional email. In the UK and EU marketing email generally needs opt-in consent; in the US, CAN-SPAM works by opt-out. Either way, make unsubscribing easy.', lesson: 'the email lesson and the lesson on advertising' },
		{ id: 'special', name: 'Special category data: health, beliefs, criminal records', art: 'GDPR Arts. 9, 10', when: dutiesRu[8].when, what: 'If people send this, strict rules apply. Better not to collect it: say in the form that it isn’t needed. Lawyers and experts add professional confidentiality.', lesson: 'this lesson and the lesson on professional ethics' },
		{ id: 'cookies', name: 'Tell people about counters and recordings, and ask first where the law requires', art: 'ePrivacy Directive Art. 5(3); PECR reg. 6', when: dutiesRu[9].when, what: 'Non-essential cookies and similar technologies need consent in the EU and UK. In California a visitor can opt out of the sale or sharing of their data.', lesson: 'the lesson on cookies' },
		{ id: 'photo', name: 'Permission to publish a person’s image', art: 'GDPR; US state right of publicity', when: dutiesRu[10].when, what: 'A photo of an identifiable person is personal data, so you need a basis such as their consent. In the US, using someone’s likeness to promote a business can breach state law, so get a signed release.', lesson: 'the lesson on copyright' },
		{ id: 'leak', name: 'Be ready for a breach: a log, an owner, a deadline', art: 'GDPR Arts. 33, 34', when: dutiesRu[11].when, what: 'Tell the supervisory authority within 72 hours of becoming aware, unless the breach is unlikely to cause risk, and tell the people if the risk is high. US states have breach laws of their own, so have a plan in advance.', lesson: 'this lesson' },
		{ id: 'ccpa', name: 'If California’s CCPA applies: a notice at collection and a way to opt out', art: 'CCPA, Civil Code § 1798.100 et seq.', when: (f) => !!(f.form || f.account || f.mail || f.pay || f.counter || f.replay || f.chat), what: 'The CCPA covers only businesses above its thresholds (see the lesson text). If it covers you, tell Californians what you collect and why, and let them opt out of the sale or sharing of their information.', lesson: 'this lesson and the lesson on cookies' }
	];
	const features = pick({ ru: featuresRu, en: featuresEn });
	const duties = pick({ ru: dutiesRu, en: dutiesEn });

	const active = $derived(duties.filter((d) => d.when(on)));
	const any = $derived(Object.values(on).some(Boolean));
</script>

<figure class="dg">
	<figcaption>{t('Что на мне лежит: от возможностей сайта к обязанностям', 'What rests on me: from what a site does to what the law asks')}</figcaption>
	<p class="dg-out">{t('Отметьте, что есть на вашем сайте. Карта покажет, какие обязанности оператора персональных данных из этого следуют. Это учебная карта на 28 октября 2026 года, а не консультация: законы меняются.', 'Check what your site has. The map shows which duties of a controller of personal data follow. This is a teaching map as of 30 October 2026, not legal advice: the laws change.')}</p>

	<ul class="fs" aria-label={t('Возможности сайта', 'What the site does')}>
		{#each features as f (f.id)}
			<li><label><input type="checkbox" bind:checked={on[f.id]} /> {f.label}</label></li>
		{/each}
	</ul>

	<p class="dg-out" aria-live="polite"><strong>{any ? t(`Обязанностей, которые стоит проверить: ${active.length}.`, `Duties worth checking: ${active.length}.`) : t('Ничего не отмечено: сайт ничего не знает о людях, и обязанностей по персональным данным нет.', 'Nothing checked: the site knows nothing about people, so there are no personal data duties.')}</strong></p>
	<ol class="duties" aria-live="polite">
		{#each active as d (d.id)}
			<li>
				<strong>{d.name}</strong> <span class="art">{d.art}</span>
				<br /><span class="dim">{d.what} {t('Подробнее:', 'More:')} {d.lesson}.</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('схема связывает десять возможностей сайта (форма, счётчик, запись сессий, иностранный чат, рассылка, кабинет, оплата, сторонний приёмник заявок, свободный текст о деле, фотографии) с обязанностями оператора: определить цели и основания, взять отдельное согласие, опубликовать политику, уведомить Роскомнадзор, хранить данные в России, разобраться с передачей за границу, оформить поручение сервису, отдельное согласие на рассылку, особые категории, готовность к утечке.', 'the diagram links ten things a site may do (a form, an analytics counter, session recording, a chat hosted abroad, a newsletter, an account, payment, a third-party form receiver, free text about a case, photographs) with the duties of a controller: decide purposes and bases, get consent where needed, publish a privacy notice, check registration, know where data is stored, handle transfers abroad, sign processor contracts, get separate consent for marketing email, treat special categories with care, and be ready for a breach.')}</p>
</figure>

<style>
	.fs {
		list-style: none;
		margin: 0 0 var(--space-4);
		padding: 0 !important;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-1);
	}
	.fs li {
		border: var(--line) solid var(--border-hairline);
		padding: 0 var(--space-3);
	}
	.duties {
		margin: 0;
		padding-left: var(--space-5) !important;
		display: grid;
		gap: var(--space-2);
	}
	.art {
		margin-left: var(--space-2);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-brass);
		font-family: var(--font-mono);
		font-size: 0.85em;
	}
	.dim {
		color: var(--text-secondary);
	}
</style>
