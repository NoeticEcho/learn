<!--
	«Реестр данных» (part 7, lesson 7). Nine candidate fields of a request form (the purpose is the
	person's own main action). The person switches each on or off and sees what they would be holding:
	how many fields, how many are personal data, special categories, high-risk, and which collected
	fields the purpose does not need. A retention slider and a place of storage show the two other
	questions of a data register. The classification is the lesson's teaching simplification, not
	legal advice.

	Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per
	edition. The Russian edition's place of storage is the 152-FZ rule (primary database in Russia); the
	English edition's is GDPR's rule on transfers, with Russia's rule named as the strict case.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Class = 'none' | 'pd' | 'risk' | 'special';
	type F = { id: string; name: string; cls: Class; needed: boolean; note: string; on: boolean };
	type Place = 'ru' | 'abroad' | 'unknown';
	const W = pick({
		ru: {
			action: 'оставить заявку',
			caption: 'Реестр данных: что вы собираете и держите',
			purpose: 'Цель сбора:',
			intro: 'Включите поля, которые собирала бы ваша форма. Отметки в схеме это упрощение для урока, а не юридическая консультация.',
			list: 'Поля формы',
			tags: { none: 'не персональные', pd: 'персональные', risk: 'высокий риск', special: 'специальная категория' },
			fields: [
				{ id: 'name', name: 'Имя', cls: 'pd', needed: true, note: 'Чтобы знать, как обращаться.', on: true },
				{ id: 'phone', name: 'Телефон', cls: 'pd', needed: true, note: 'Чтобы связаться по заявке.', on: true },
				{ id: 'email', name: 'Электронная почта', cls: 'pd', needed: false, note: 'Нужна, только если вы отвечаете письмом. Для звонка лишняя.', on: false },
				{ id: 'city', name: 'Город', cls: 'pd', needed: false, note: 'Нужен, если от города зависит услуга.', on: false },
				{ id: 'comment', name: 'Комментарий (свободный текст)', cls: 'risk', needed: false, note: 'Люди пишут туда что угодно, в том числе то, что вы не просили: подробности о здоровье, о семье.', on: true },
				{ id: 'birth', name: 'Дата рождения', cls: 'pd', needed: false, note: 'Для заявки не нужна: «на всякий случай» это не цель.', on: true },
				{ id: 'passport', name: 'Номер паспорта', cls: 'risk', needed: false, note: 'Высокий риск: по нему можно совершать действия от имени человека. Для заявки не нужен.', on: true },
				{ id: 'health', name: 'Состояние здоровья', cls: 'special', needed: false, note: 'Специальная категория: строгие правила обработки. Если не нужна, не просите.', on: false },
				{ id: 'service', name: 'Какая услуга интересует', cls: 'none', needed: true, note: 'Не персональные данные сами по себе, но вместе с именем становятся частью заявки.', on: true }
			] as F[],
			keep: [
				{ label: '1 месяц', months: 1 },
				{ label: '1 год', months: 12 },
				{ label: '3 года', months: 36 },
				{ label: '5 лет', months: 60 },
				{ label: 'без срока', months: Infinity }
			],
			sumFields: 'полей собираем',
			sumPd: 'персональных',
			sumRisk: 'высокого риска',
			sumSpecial: 'специальных категорий',
			extra: 'Лишнее для цели:',
			extraTail: 'Что не собрано, то не утечёт и не придётся защищать, хранить и удалять.',
			onlyNeeded: 'Собрано только нужное для цели.',
			minimum: 'Это и есть принцип минимума.',
			missing: 'Не хватает нужного:',
			retention: 'Срок хранения заявок:',
			where: 'Где лежит база',
			places: { ru: 'Сервер в России', abroad: 'Сервер за рубежом', unknown: 'Облако, страна неизвестна' },
			term: 'Срок:',
			forever: 'Без срока данные копятся вечно: цель давно исчерпана, а ответственность осталась. Срок нужен всегда, и вместе с ним условие удаления.',
			short: 'Короткий срок: данные удаляются или обезличиваются вскоре после обращения. Удобно, если заявки не нужны для отчётности.',
			long: 'Срок должен следовать из цели: например, пока идёт работа по заявке и пока возможны споры. Запишите его и то, что произойдёт по его истечении.',
			place: 'Место:',
			placeNote: {
				ru: 'Первичная запись данных идёт на сервер в России: так требует закон для данных граждан РФ.',
				abroad: 'Для данных граждан РФ первичная запись и хранение должны быть в базе на территории России. Зарубежный сервер может быть лишь дополнительной копией и при соблюдении порядка передачи за границу. Обсудите с юристом.',
				unknown: 'Если неизвестно, где лежит база (облако без указания страны), вы не можете ответить ни посетителю, ни проверяющему. Узнайте у провайдера, в какой стране сервер.'
			} as Record<Place, string>,
			alt: 'Текстовая альтернатива:',
			altText: 'схема показывает, что каждое лишнее поле формы (дата рождения, паспорт, свободный комментарий) увеличивает число персональных данных и риск, не помогая цели. Для каждой группы данных нужны срок хранения с условием удаления и место хранения: первичная запись данных граждан РФ должна идти на сервер в России.'
		},
		en: {
			action: 'book a consultation',
			caption: 'A data register: what you collect and hold',
			purpose: 'Purpose of collecting:',
			intro: 'Switch on the fields your form would collect. The labels in the diagram are a simplification for the lesson, not legal advice.',
			list: 'Form fields',
			tags: { none: 'not personal', pd: 'personal data', risk: 'high risk', special: 'special category' },
			fields: [
				{ id: 'name', name: 'Name', cls: 'pd', needed: true, note: 'To know how to address the person.', on: true },
				{ id: 'phone', name: 'Phone', cls: 'pd', needed: true, note: 'To get in touch about the request.', on: true },
				{ id: 'email', name: 'Email address', cls: 'pd', needed: false, note: 'Needed only if you reply by email. Not needed if you call.', on: false },
				{ id: 'city', name: 'City', cls: 'pd', needed: false, note: 'Needed only if the service depends on the city.', on: false },
				{ id: 'comment', name: 'Comment (free text)', cls: 'risk', needed: false, note: 'People write anything there, including what you did not ask for: details about their health or family.', on: true },
				{ id: 'birth', name: 'Date of birth', cls: 'pd', needed: false, note: 'A request does not need it. “Just in case” is not a purpose.', on: true },
				{ id: 'passport', name: 'Social Security or passport number', cls: 'risk', needed: false, note: 'High risk: with it someone can act in the person’s name. A request does not need it.', on: true },
				{ id: 'health', name: 'Health condition', cls: 'special', needed: false, note: 'A special category with strict rules. If you do not need it, do not ask.', on: false },
				{ id: 'service', name: 'Which service they want', cls: 'none', needed: true, note: 'Not personal data on its own, but next to a name it becomes part of the request.', on: true }
			] as F[],
			keep: [
				{ label: '1 month', months: 1 },
				{ label: '1 year', months: 12 },
				{ label: '3 years', months: 36 },
				{ label: '5 years', months: 60 },
				{ label: 'no limit', months: Infinity }
			],
			sumFields: 'fields collected',
			sumPd: 'personal',
			sumRisk: 'high risk',
			sumSpecial: 'special categories',
			extra: 'More than the purpose needs:',
			extraTail: 'What you do not collect cannot leak, and you will not have to protect, keep or delete it.',
			onlyNeeded: 'Only what the purpose needs is collected.',
			minimum: 'That is the principle of data minimization.',
			missing: 'Something needed is missing:',
			retention: 'How long requests are kept:',
			where: 'Where the database lives',
			places: { ru: 'A server in my visitors’ own country or region', abroad: 'A server in another country', unknown: 'A cloud, country unknown' },
			term: 'Retention:',
			forever: 'With no limit the data piles up forever: the purpose ended long ago, but the responsibility stayed. A retention period is always needed, and with it the condition for deleting.',
			short: 'A short period: the data is deleted or anonymized soon after the request. Handy if requests are not needed for accounting.',
			long: 'The period should follow from the purpose: for example, while the request is being worked on and while a dispute is still possible. Write it down, and what happens when it ends.',
			place: 'Place:',
			placeNote: {
				ru: 'The simplest case: the data stays under the law that protects it. Even so, the host is your processor, so keep a contract with it (GDPR Article 28).',
				abroad: 'Under GDPR, personal data of people in the EU or UK can leave only with a safeguard: an adequacy decision, standard contractual clauses or another transfer tool (Chapter V). US state laws have no localization rule, but your privacy notice should say who receives the data. Russia is the strict case: its law wants the primary database of Russian citizens’ data to sit in Russia. Ask a privacy attorney.',
				unknown: 'If you do not know which country holds the database (a cloud with no region named), you cannot answer a visitor, a regulator or a customer. Ask your host where the server is.'
			} as Record<Place, string>,
			alt: 'Text alternative:',
			altText: 'the diagram shows that every extra form field (date of birth, an ID number, a free comment) adds personal data and risk without helping the purpose. Each group of data needs a retention period with a condition for deleting, and a place of storage: under GDPR a transfer abroad needs a safeguard, and Russia requires the primary database of its citizens’ data to be in Russia.'
		}
	});

	let action = $state(W.action);
	onMount(async () => {
		try {
			const a = (await (await import('#lib/learner.ts')).persona()).mainAction?.label;
			if (a) action = a.toLowerCase();
		} catch {
			/* the example stays */
		}
	});

	let fields = $state<F[]>(W.fields);

	const keepOptions = W.keep;
	let keepAt = $state(2);
	let place = $state<Place>('ru');

	const collected = $derived(fields.filter((f) => f.on));
	const personal = $derived(collected.filter((f) => f.cls !== 'none'));
	const special = $derived(collected.filter((f) => f.cls === 'special'));
	const risky = $derived(collected.filter((f) => f.cls === 'risk'));
	const extra = $derived(collected.filter((f) => !f.needed));
	const missing = $derived(fields.filter((f) => f.needed && !f.on));
	const keep = $derived(keepOptions[keepAt]);
	const placeNote = W.placeNote;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.purpose} <strong>{action}</strong>. {W.intro}</p>

	<ul class="fields" aria-label={W.list}>
		{#each fields as f (f.id)}
			<li class:extra={f.on && !f.needed}>
				<label>
					<input type="checkbox" bind:checked={f.on} />
					<span><strong>{f.name}</strong>
						<span class="tag">{W.tags[f.cls]}</span>
						{#if f.on}<br /><span class="dim">{f.note}</span>{/if}
					</span>
				</label>
			</li>
		{/each}
	</ul>

	<div class="sum" aria-live="polite">
		<div><span class="n">{collected.length}</span> {W.sumFields}</div>
		<div><span class="n">{personal.length}</span> {W.sumPd}</div>
		<div><span class="n">{risky.length}</span> {W.sumRisk}</div>
		<div><span class="n">{special.length}</span> {W.sumSpecial}</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if extra.length}<strong>{W.extra}</strong> {extra.map((f) => f.name).join(', ')}. {W.extraTail}{:else}<strong>{W.onlyNeeded}</strong> {W.minimum}{/if}
		{#if missing.length} {W.missing} {missing.map((f) => f.name).join(', ')}.{/if}
	</p>

	<div class="two">
		<label>{W.retention} <strong>{keep.label}</strong>
			<input type="range" min="0" max={keepOptions.length - 1} step="1" bind:value={keepAt} aria-valuetext={keep.label} />
		</label>
		<fieldset>
			<legend>{W.where}</legend>
			<label><input type="radio" bind:group={place} value="ru" /> {W.places.ru}</label>
			<label><input type="radio" bind:group={place} value="abroad" /> {W.places.abroad}</label>
			<label><input type="radio" bind:group={place} value="unknown" /> {W.places.unknown}</label>
		</fieldset>
	</div>
	<p class="dg-out" aria-live="polite">
		<strong>{W.term}</strong>
		{#if keep.months === Infinity}{W.forever}{:else if keep.months <= 12}{W.short}{:else}{W.long}{/if}
		<br /><strong>{W.place}</strong> {placeNote[place]}
	</p>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.fields {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.fields li {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-1) var(--space-3);
	}
	.fields li.extra {
		border-color: var(--accent-measure);
	}
	.fields label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: start;
		min-height: var(--hit-min);
	}
	.tag {
		margin-left: var(--space-2);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		color: var(--text-secondary);
		font-size: 0.85em;
	}
	.dim {
		color: var(--text-secondary);
	}
	.sum {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin: 0 0 var(--space-2);
	}
	.n {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		margin-bottom: var(--space-2);
	}
	.two label {
		display: grid;
		gap: var(--space-1);
		min-height: 0;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		display: grid;
	}
	fieldset label {
		display: flex;
	}
	legend {
		padding: 0;
		color: var(--text-primary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 40rem) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
