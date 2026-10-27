<!--
	«Что где хранится» (part 0, lesson 5). Every kind of data the textbook holds, and where each
	goes: it stays in the browser, it goes into the export file when the person saves one, or it
	goes to the model they chose, and only when they ask it a question. Three switches change
	the answers, so the person can see that «off» means off.
-->
<script lang="ts">
	import './shared.css';
	let model = $state(false);
	let sendBrief = $state(false);
	let keyInFile = $state(false);

	type Row = { what: string; stays: string; file: string; llm: string };
	const rows = $derived<Row[]>([
		{
			what: 'Прогресс: пройденные уроки, ответы, карточки',
			stays: 'в этом браузере',
			file: 'в файл, когда вы нажали «Сохранить прогресс»',
			llm: 'никогда'
		},
		{
			what: 'Бриф: ваш проект и ваши данные',
			stays: 'в этом браузере',
			file: 'в файл, вместе с прогрессом',
			llm: model && sendBrief ? 'уходит выбранному вами сервису, вместе с вопросом' : 'нет'
		},
		{
			what: 'Ваш код из практики',
			stays: 'в этом браузере',
			file: 'в файл, вместе с прогрессом',
			llm: model ? 'уходит с вопросом, чтобы Эхо видело, что вы пишете' : 'нет'
		},
		{
			what: 'Текст урока, который вы сейчас читаете',
			stays: 'это текст учебника, не ваш',
			file: 'нет',
			llm: model ? 'уходит с вопросом, чтобы Эхо отвечало по теме' : 'нет'
		},
		{
			what: 'Ваш ключ от ИИ-сервиса',
			stays: 'в этом браузере',
			file: keyInFile ? 'в файл: вы поставили галочку, храните файл как пароль' : 'нет, по умолчанию его в файле нет',
			llm: model ? 'уходит только тому сервису, который вы выбрали, как подпись запроса' : 'нет'
		},
		{
			what: 'Ваш вопрос Эхо, написанный своими словами',
			stays: 'не сохраняется',
			file: 'нет',
			llm: model ? 'уходит выбранному вами сервису' : 'без ключа вопросов своими словами нет, Эхо отвечает заготовками'
		},
		{
			what: 'Всё перечисленное: серверу учебника',
			stays: '—',
			file: '—',
			llm: 'никогда: у учебника нет сервера для ваших данных'
		}
	]);
	const leaves = $derived(rows.filter((r) => r.llm.startsWith('уходит')).length);
</script>

<figure class="dg">
	<figcaption>Что где хранится и что куда может уйти</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={model} /> Режим модели включён (вы вписали свой ключ и задаёте вопрос)</label>
		<label><input type="checkbox" bind:checked={sendBrief} disabled={!model} /> Я разрешил отправлять бриф с вопросом</label>
		<label><input type="checkbox" bind:checked={keyInFile} /> Включить ключ в файл прогресса</label>
	</div>
	<div class="wrap">
		<table>
			<thead>
				<tr><th scope="col">Что</th><th scope="col">Где лежит</th><th scope="col">В файл прогресса</th><th scope="col">Выбранной вами модели</th></tr>
			</thead>
			<tbody>
				{#each rows as r (r.what)}
					<tr>
						<th scope="row">{r.what}</th>
						<td data-label="Где лежит">{r.stays}</td>
						<td data-label="В файл прогресса">{r.file}</td>
						<td data-label="Выбранной вами модели" class:go={r.llm.startsWith('уходит')}>{r.llm}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if model}Модель включена: из строк таблицы {leaves} {leaves === 1 ? 'уходит' : 'уходят'} тому сервису, чей ключ вы вписали, и только в момент вопроса.{:else}Модель выключена: ничего не уходит никуда. Всё лежит на вашем устройстве.{/if}
	</p>
</figure>

<style>
	.wrap {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th,
	td {
		text-align: left;
		vertical-align: top;
		padding: var(--space-2) var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	thead th {
		color: var(--text-secondary);
		font-weight: var(--weight-medium);
	}
	tbody th {
		color: var(--text-primary);
		font-weight: var(--weight-regular);
	}
	.go {
		color: var(--text-primary);
		border-left: 3px solid var(--accent-measure);
	}
	@media (max-width: 42rem) {
		thead {
			position: absolute;
			left: -9999px;
		}
		table,
		tbody,
		tr,
		th,
		td {
			display: block;
		}
		tr {
			padding: var(--space-3) 0;
			border-bottom: var(--line) solid var(--border-rule);
		}
		th,
		td {
			border: 0;
			padding: var(--space-1) 0;
		}
		td::before {
			content: attr(data-label) ': ';
			color: var(--text-secondary);
		}
		.go {
			border-left: 0;
			font-weight: var(--weight-medium);
		}
	}
</style>
