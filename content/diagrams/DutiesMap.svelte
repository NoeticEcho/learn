<!--
	«Что на мне лежит» (part 15, lesson 7). Ten things a site may do with people's data (a request
	form, a counter, session recording, a foreign chat widget, a newsletter, an account, a payment, a
	third-party form handler, free text where people describe their case, photographs of people).
	The person switches the ones their site has, and the map lights up the duties of an operator of
	personal data that follow, each with its article of Federal Law 152-FZ (or 38-FZ for the
	newsletter). It is a teaching map of what to ask, dated 27.10.2026, not legal advice; the laws
	change, and every line says so by pointing to the current text.
-->
<script lang="ts">
	import './shared.css';

	type Feature = { id: string; label: string };
	const features: Feature[] = [
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
	const duties: Duty[] = [
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

	const active = $derived(duties.filter((d) => d.when(on)));
	const any = $derived(Object.values(on).some(Boolean));
</script>

<figure class="dg">
	<figcaption>Что на мне лежит: от возможностей сайта к обязанностям</figcaption>
	<p class="dg-out">Отметьте, что есть на вашем сайте. Карта покажет, какие обязанности оператора персональных данных из этого следуют. Это учебная карта на 28 октября 2026 года, а не консультация: законы меняются.</p>

	<ul class="fs" aria-label="Возможности сайта">
		{#each features as f (f.id)}
			<li><label><input type="checkbox" bind:checked={on[f.id]} /> {f.label}</label></li>
		{/each}
	</ul>

	<p class="dg-out" aria-live="polite"><strong>{any ? `Обязанностей, которые стоит проверить: ${active.length}.` : 'Ничего не отмечено: сайт ничего не знает о людях, и обязанностей по персональным данным нет.'}</strong></p>
	<ol class="duties" aria-live="polite">
		{#each active as d (d.id)}
			<li>
				<strong>{d.name}</strong> <span class="art">{d.art}</span>
				<br /><span class="dim">{d.what} Подробнее: {d.lesson}.</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> схема связывает десять возможностей сайта (форма, счётчик, запись сессий, иностранный чат, рассылка, кабинет, оплата, сторонний приёмник заявок, свободный текст о деле, фотографии) с обязанностями оператора: определить цели и основания, взять отдельное согласие, опубликовать политику, уведомить Роскомнадзор, хранить данные в России, разобраться с передачей за границу, оформить поручение сервису, отдельное согласие на рассылку, особые категории, готовность к утечке.</p>
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
