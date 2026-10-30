<!--
	«Что где хранится» (part 0, lesson 5). Every kind of data the textbook holds, and where each
	goes: it stays in the browser, it goes into the export file when the person saves one, or it
	goes to the model they chose, and only when they ask it a question. Three switches change
	the answers, so the person can see that «off» means off.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	let model = $state(false);
	let sendBrief = $state(false);
	let keyInFile = $state(false);

	type Row = { what: string; stays: string; file: string; llm: string; go?: boolean };
	const W = pick({
		ru: {
			caption: 'Что где хранится и что куда может уйти',
			model: 'Режим модели включён (вы вписали свой ключ и задаёте вопрос)',
			sendBrief: 'Я разрешил отправлять бриф с вопросом',
			keyInFile: 'Включить ключ в файл прогресса',
			head: { what: 'Что', stays: 'Где лежит', file: 'В файл прогресса', llm: 'Выбранной вами модели' },
			rows: (st: { model: boolean; sendBrief: boolean; keyInFile: boolean }): Row[] => [
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
					llm: st.model && st.sendBrief ? 'уходит выбранному вами сервису, вместе с вопросом' : 'нет',
					go: st.model && st.sendBrief
				},
				{
					what: 'Ваш код из практики',
					stays: 'в этом браузере',
					file: 'в файл, вместе с прогрессом',
					llm: st.model ? 'уходит с вопросом, чтобы Эхо видело, что вы пишете' : 'нет',
					go: st.model
				},
				{
					what: 'Текст урока, который вы сейчас читаете',
					stays: 'это текст учебника, не ваш',
					file: 'нет',
					llm: st.model ? 'уходит с вопросом, чтобы Эхо отвечало по теме' : 'нет',
					go: st.model
				},
				{
					what: 'Ваш ключ от ИИ-сервиса',
					stays: 'в этом браузере',
					file: st.keyInFile ? 'в файл: вы поставили галочку, храните файл как пароль' : 'нет, по умолчанию его в файле нет',
					llm: st.model ? 'уходит только тому сервису, который вы выбрали, как подпись запроса' : 'нет',
					go: st.model
				},
				{
					what: 'Ваш вопрос Эхо, написанный своими словами',
					stays: 'не сохраняется',
					file: 'нет',
					llm: st.model ? 'уходит выбранному вами сервису' : 'без ключа вопросов своими словами нет, Эхо отвечает заготовками',
					go: st.model
				},
				{
					what: 'Всё перечисленное: серверу учебника',
					stays: '—',
					file: '—',
					llm: 'никогда: у учебника нет сервера для ваших данных'
				}
			],
			out: (on: boolean, n: number) =>
				on
					? `Модель включена: из строк таблицы ${n} ${n === 1 ? 'уходит' : 'уходят'} тому сервису, чей ключ вы вписали, и только в момент вопроса.`
					: 'Модель выключена: ничего не уходит никуда. Всё лежит на вашем устройстве.'
		},
		en: {
			caption: 'What is kept where, and what can go where',
			model: 'Model mode is on (you entered your own key and are asking a question)',
			sendBrief: 'I allowed the brief to be sent with the question',
			keyInFile: 'Include the key in the progress file',
			head: { what: 'What', stays: 'Where it lives', file: 'In the progress file', llm: 'To the model you chose' },
			rows: (st: { model: boolean; sendBrief: boolean; keyInFile: boolean }): Row[] => [
				{
					what: 'Progress: finished lessons, answers, cards',
					stays: 'in this browser',
					file: 'into the file, when you press “Save progress”',
					llm: 'never'
				},
				{
					what: 'The brief: your project and your details',
					stays: 'in this browser',
					file: 'into the file, with the progress',
					llm: st.model && st.sendBrief ? 'goes to the service you chose, with the question' : 'no',
					go: st.model && st.sendBrief
				},
				{
					what: 'Your code from the practice',
					stays: 'in this browser',
					file: 'into the file, with the progress',
					llm: st.model ? 'goes with the question, so Echo can see what you are writing' : 'no',
					go: st.model
				},
				{
					what: 'The text of the lesson you are reading',
					stays: 'it is the textbook’s text, not yours',
					file: 'no',
					llm: st.model ? 'goes with the question, so Echo answers on topic' : 'no',
					go: st.model
				},
				{
					what: 'Your key for an AI service',
					stays: 'in this browser',
					file: st.keyInFile ? 'into the file: you checked the box, so keep the file like a password' : 'no, by default it is not in the file',
					llm: st.model ? 'goes only to the service you chose, as the request’s signature' : 'no',
					go: st.model
				},
				{
					what: 'Your question to Echo, written in your own words',
					stays: 'not saved',
					file: 'no',
					llm: st.model ? 'goes to the service you chose' : 'without a key there are no questions in your own words: Echo answers with prepared hints',
					go: st.model
				},
				{
					what: 'Everything listed: to the textbook’s server',
					stays: '—',
					file: '—',
					llm: 'never: the textbook has no server for your data'
				}
			],
			out: (on: boolean, n: number) =>
				on
					? `Model mode is on: ${n} of the table’s rows go to the service whose key you entered, and only at the moment you ask.`
					: 'Model mode is off: nothing goes anywhere. Everything stays on your device.'
		}
	});
	const rows = $derived(W.rows({ model, sendBrief, keyInFile }));
	const leaves = $derived(rows.filter((r) => r.go).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={model} /> {W.model}</label>
		<label><input type="checkbox" bind:checked={sendBrief} disabled={!model} /> {W.sendBrief}</label>
		<label><input type="checkbox" bind:checked={keyInFile} /> {W.keyInFile}</label>
	</div>
	<div class="wrap">
		<table>
			<thead>
				<tr><th scope="col">{W.head.what}</th><th scope="col">{W.head.stays}</th><th scope="col">{W.head.file}</th><th scope="col">{W.head.llm}</th></tr>
			</thead>
			<tbody>
				{#each rows as r (r.what)}
					<tr>
						<th scope="row">{r.what}</th>
						<td data-label={W.head.stays}>{r.stays}</td>
						<td data-label={W.head.file}>{r.file}</td>
						<td data-label={W.head.llm} class:go={r.go}>{r.llm}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.out(model, leaves)}
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
