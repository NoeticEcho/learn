<!--
	«Реестр данных» (part 7, lesson 7). Nine candidate fields of a request form (the purpose is the
	person's own main action). The person switches each on or off and sees what they would be holding:
	how many fields, how many are personal data, special categories, high-risk, and which collected
	fields the purpose does not need. A retention slider and a place of storage show the two other
	questions of a data register. The classification is the lesson's teaching simplification, not
	legal advice.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let action = $state('оставить заявку');
	onMount(async () => {
		try {
			const a = (await (await import('#lib/learner.ts')).persona()).mainAction?.label;
			if (a) action = a.toLowerCase();
		} catch {
			/* the example stays */
		}
	});

	type Class = 'none' | 'pd' | 'risk' | 'special';
	type Field = { id: string; name: string; cls: Class; needed: boolean; note: string; on: boolean };
	let fields = $state<Field[]>([
		{ id: 'name', name: 'Имя', cls: 'pd', needed: true, note: 'Чтобы знать, как обращаться.', on: true },
		{ id: 'phone', name: 'Телефон', cls: 'pd', needed: true, note: 'Чтобы связаться по заявке.', on: true },
		{ id: 'email', name: 'Электронная почта', cls: 'pd', needed: false, note: 'Нужна, только если вы отвечаете письмом. Для звонка лишняя.', on: false },
		{ id: 'city', name: 'Город', cls: 'pd', needed: false, note: 'Нужен, если от города зависит услуга.', on: false },
		{ id: 'comment', name: 'Комментарий (свободный текст)', cls: 'risk', needed: false, note: 'Люди пишут туда что угодно, в том числе то, что вы не просили: подробности о здоровье, о семье.', on: true },
		{ id: 'birth', name: 'Дата рождения', cls: 'pd', needed: false, note: 'Для заявки не нужна: «на всякий случай» это не цель.', on: true },
		{ id: 'passport', name: 'Номер паспорта', cls: 'risk', needed: false, note: 'Высокий риск: по нему можно совершать действия от имени человека. Для заявки не нужен.', on: true },
		{ id: 'health', name: 'Состояние здоровья', cls: 'special', needed: false, note: 'Специальная категория: строгие правила обработки. Если не нужна, не просите.', on: false },
		{ id: 'service', name: 'Какая услуга интересует', cls: 'none', needed: true, note: 'Не персональные данные сами по себе, но вместе с именем становятся частью заявки.', on: true }
	]);

	const keepOptions = [
		{ label: '1 месяц', months: 1 },
		{ label: '1 год', months: 12 },
		{ label: '3 года', months: 36 },
		{ label: '5 лет', months: 60 },
		{ label: 'без срока', months: Infinity }
	];
	let keepAt = $state(2);
	let place = $state<'ru' | 'abroad' | 'unknown'>('ru');

	const collected = $derived(fields.filter((f) => f.on));
	const personal = $derived(collected.filter((f) => f.cls !== 'none'));
	const special = $derived(collected.filter((f) => f.cls === 'special'));
	const risky = $derived(collected.filter((f) => f.cls === 'risk'));
	const extra = $derived(collected.filter((f) => !f.needed));
	const missing = $derived(fields.filter((f) => f.needed && !f.on));
	const keep = $derived(keepOptions[keepAt]);
	const placeNote = {
		ru: 'Первичная запись данных идёт на сервер в России: так требует закон для данных граждан РФ.',
		abroad: 'Для данных граждан РФ первичная запись и хранение должны быть в базе на территории России. Зарубежный сервер может быть лишь дополнительной копией и при соблюдении порядка передачи за границу. Обсудите с юристом.',
		unknown: 'Если неизвестно, где лежит база (облако без указания страны), вы не можете ответить ни посетителю, ни проверяющему. Узнайте у провайдера, в какой стране сервер.'
	};
</script>

<figure class="dg">
	<figcaption>Реестр данных: что вы собираете и держите</figcaption>
	<p class="dg-out">Цель сбора: <strong>{action}</strong>. Включите поля, которые собирала бы ваша форма. Отметки в схеме это упрощение для урока, а не юридическая консультация.</p>

	<ul class="fields" aria-label="Поля формы">
		{#each fields as f (f.id)}
			<li class:extra={f.on && !f.needed}>
				<label>
					<input type="checkbox" bind:checked={f.on} />
					<span><strong>{f.name}</strong>
						<span class="tag">{f.cls === 'none' ? 'не персональные' : f.cls === 'pd' ? 'персональные' : f.cls === 'risk' ? 'высокий риск' : 'специальная категория'}</span>
						{#if f.on}<br /><span class="dim">{f.note}</span>{/if}
					</span>
				</label>
			</li>
		{/each}
	</ul>

	<div class="sum" aria-live="polite">
		<div><span class="n">{collected.length}</span> полей собираем</div>
		<div><span class="n">{personal.length}</span> персональных</div>
		<div><span class="n">{risky.length}</span> высокого риска</div>
		<div><span class="n">{special.length}</span> специальных категорий</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if extra.length}<strong>Лишнее для цели:</strong> {extra.map((f) => f.name).join(', ')}. Что не собрано, то не утечёт и не придётся защищать, хранить и удалять.{:else}<strong>Собрано только нужное для цели.</strong> Это и есть принцип минимума.{/if}
		{#if missing.length} Не хватает нужного: {missing.map((f) => f.name).join(', ')}.{/if}
	</p>

	<div class="two">
		<label>Срок хранения заявок: <strong>{keep.label}</strong>
			<input type="range" min="0" max={keepOptions.length - 1} step="1" bind:value={keepAt} aria-valuetext={keep.label} />
		</label>
		<fieldset>
			<legend>Где лежит база</legend>
			<label><input type="radio" bind:group={place} value="ru" /> Сервер в России</label>
			<label><input type="radio" bind:group={place} value="abroad" /> Сервер за рубежом</label>
			<label><input type="radio" bind:group={place} value="unknown" /> Облако, страна неизвестна</label>
		</fieldset>
	</div>
	<p class="dg-out" aria-live="polite">
		<strong>Срок:</strong>
		{#if keep.months === Infinity}Без срока данные копятся вечно: цель давно исчерпана, а ответственность осталась. Срок нужен всегда, и вместе с ним условие удаления.{:else if keep.months <= 12}Короткий срок: данные удаляются или обезличиваются вскоре после обращения. Удобно, если заявки не нужны для отчётности.{:else}Срок должен следовать из цели: например, пока идёт работа по заявке и пока возможны споры. Запишите его и то, что произойдёт по его истечении.{/if}
		<br /><strong>Место:</strong> {placeNote[place]}
	</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> схема показывает, что каждое лишнее поле формы (дата рождения, паспорт, свободный комментарий) увеличивает число персональных данных и риск, не помогая цели. Для каждой группы данных нужны срок хранения с условием удаления и место хранения: первичная запись данных граждан РФ должна идти на сервер в России.</p>
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
