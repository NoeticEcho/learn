<!--
	«Одни данные, четыре формы» (part 7, lesson 5). The person's own services and people shown as
	tables, as a JSON document, as key-value pairs and as a graph, with a question picker: for each
	question the diagram says whether that shape answers it naturally, possibly, or awkwardly, and
	why. The ratings are the lesson's judgement, not a benchmark. Sessions and counters are invented.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	/* The words of the diagram, one entry per edition (docs/content-plan/README.md, «English edition»). */
	const W = pick({
		ru: {
			items: ['Первая услуга', 'Вторая услуга', 'Третья услуга'],
			people: ['Человек А', 'Человек Б'],
			shapes: ['Таблицы', 'Документ', 'Ключ — значение', 'Граф'],
			fit: ['Естественно', 'Можно', 'Неудобно'],
			category: 'основное',
			leads: 'ведёт',
			proofs: 'подтверждения',
			doc: 'документ №00-00-00',
			expires: (m: number) => `срок: ${m} мин`,
			caption: 'Одни данные, четыре формы',
			group: 'Форма хранения',
			tableLabel: 'Данные в таблицах',
			tableText: 'Одна таблица на вид «вещей», связи через ключи (<span class="dg-mono">category_id</span>).',
			docText: 'Один документ содержит услугу вместе со вложенным. У другой услуги поля могут быть другими.',
			kvText: 'Словарь «ключ → значение». Найти по ключу мгновенно, а искать по содержимому значения нельзя. У записи может быть срок жизни.',
			graphLabel: 'Граф: люди связаны с услугами рёбрами «ведёт»',
			graphText: 'Вершины (люди, услуги) и рёбра между ними («ведёт»). Связи хранятся как первоклассные данные, и обход по ним быстр.',
			ask: 'Вопрос к данным:',
			allShapes: 'Все формы для этого вопроса',
			headShape: 'Форма',
			headFit: 'Оценка',
			alt: 'Текстовая альтернатива:',
			altText: 'для каждого из шести вопросов (отбор по категории, связи через несколько шагов, сессия по токену, счётчик, документ с произвольными полями, заявки с отчётом) схема называет, какая форма хранения подходит естественно, какая терпимо, а какая неудобно. Оценки это суждение автора урока, а не замер.',
			questions: [
				{
					q: 'Все услуги одной категории',
					fit: {
						table: ['good', 'Это WHERE category_id = … Для такого вопроса таблицы и созданы.'],
						doc: ['ok', 'Услуги лежат отдельными документами, и по полю можно отобрать. Но если категория вложена внутрь документа, искать придётся осторожнее.'],
						kv: ['bad', 'Ключ даёт одно значение за раз. Чтобы собрать «все», пришлось бы перебирать ключи.'],
						graph: ['ok', 'Услуга связана ребром «в категории», и обход найдёт все. Но для такого вопроса граф избыточен.']
					}
				},
				{
					q: 'Кто связан с кем через общие услуги, и через два, три шага',
					fit: {
						table: ['ok', 'Один-два шага это JOIN. Цепочки из многих шагов превращаются в громоздкий рекурсивный запрос.'],
						doc: ['bad', 'Связи внутри документов не обходятся: приходится читать документы и самому гулять по ссылкам.'],
						kv: ['bad', 'Значение по ключу не знает, кто на него ссылается.'],
						graph: ['good', 'Связи здесь главные: «друзья друзей» это обычный обход рёбер на несколько шагов.']
					}
				},
				{
					q: 'Найти сессию вошедшего посетителя по токену из cookie',
					fit: {
						table: ['ok', 'Таблица сессий с индексом по токену работает, но устаревшие сессии придётся чистить самим.'],
						doc: ['ok', 'Документ сессии по токену находится легко. Срок жизни настраивается, но это уже усилия.'],
						kv: ['good', 'Ключ это токен, значение это сессия, и у записи есть срок жизни: протухла сама. Вот для чего Redis.'],
						graph: ['bad', 'Сессии не про связи, графу тут нечего делать.']
					}
				},
				{
					q: 'Счётчик посетителей за сегодня: +1 при каждом заходе',
					fit: {
						table: ['ok', 'UPDATE counter = counter + 1 работает, но тысячи одновременных правок одной строки будут ждать друг друга.'],
						doc: ['ok', 'Увеличить число в документе можно, но тот же узкий вход в одну запись.'],
						kv: ['good', 'У хранилищ в памяти для этого есть готовая атомарная команда (INCR в Redis), и она очень быстрая.'],
						graph: ['bad', 'Счётчик не вершина и не ребро.']
					}
				},
				{
					q: 'Каждая услуга со своим набором полей, читается целиком одним куском',
					fit: {
						table: ['ok', 'Либо много столбцов с пустыми значениями, либо отдельный столбец JSON. Таблицы сопротивляются.'],
						doc: ['good', 'Документ как раз и есть «кусок с любыми полями». Страница читает его одним запросом.'],
						kv: ['ok', 'Можно положить весь документ под одним ключом, но искать внутри него уже нельзя.'],
						graph: ['bad', 'Свойства у вершин есть, но для хранения «кусков с любыми полями» граф не нужен.']
					}
				},
				{
					q: 'Заявки со ссылкой на услугу и контактами, плюс отчёт за месяц',
					fit: {
						table: ['good', 'Заявки, услуги и контакты связаны ключами, отчёт это GROUP BY. Целостность и транзакции на месте.'],
						doc: ['bad', 'Связи и отчёты по ним в документных базах делают вручную, а услугу, вложенную в каждую заявку, приходится дублировать.'],
						kv: ['bad', 'Для отчётов по значениям ключ-значение не приспособлено.'],
						graph: ['ok', 'Связи отразить можно, но обычные отчёты с суммами и датами в графах менее удобны.']
					}
				}
			]
		},
		en: {
			items: ['First service', 'Second service', 'Third service'],
			people: ['Alex Doe', 'Sam Roe'],
			shapes: ['Tables', 'Document', 'Key-value', 'Graph'],
			fit: ['Natural', 'Possible', 'Awkward'],
			category: 'core',
			leads: 'leads',
			proofs: 'credentials',
			doc: 'document no. 00-00-00',
			expires: (m: number) => `expires: ${m} min`,
			caption: 'The same data in four shapes',
			group: 'Storage shape',
			tableLabel: 'Data in tables',
			tableText: 'One table for each kind of “thing”, with links through keys (<span class="dg-mono">category_id</span>).',
			docText: 'One document holds a service together with what is nested in it. Another service can have different fields.',
			kvText: 'A dictionary of “key → value”. Finding by key is instant, but you cannot search by what is inside a value. An entry can have a lifetime.',
			graphLabel: 'Graph: people are joined to services by “leads” edges',
			graphText: 'Nodes (people, services) and the edges between them (“leads”). Links are stored as first-class data, and walking them is fast.',
			ask: 'A question for the data:',
			allShapes: 'Every shape for this question',
			headShape: 'Shape',
			headFit: 'Rating',
			alt: 'Text alternative:',
			altText: 'for each of the six questions (selecting by category, links several steps deep, a session by token, a counter, a document with arbitrary fields, inquiries with a report) the diagram says which storage shape fits naturally, which tolerably and which awkwardly. The ratings are the lesson author’s judgment, not a measurement.',
			questions: [
				{
					q: 'All the services in one category',
					fit: {
						table: ['good', 'This is WHERE category_id = … Tables were made for a question like this.'],
						doc: ['ok', 'The services sit in separate documents, and you can select by a field. But if the category is nested inside the document, searching needs more care.'],
						kv: ['bad', 'A key gives one value at a time. To collect “all of them” you would have to loop over the keys.'],
						graph: ['ok', 'A service is joined to its category by an “in category” edge, and a traversal finds them all. But a graph is overkill for a question like this.']
					}
				},
				{
					q: 'Who is connected to whom through shared services, two or three steps away',
					fit: {
						table: ['ok', 'One or two steps is a JOIN. Chains of many steps turn into a clumsy recursive query.'],
						doc: ['bad', 'Links inside documents cannot be walked: you read the documents and follow the references yourself.'],
						kv: ['bad', 'A value looked up by key does not know who refers to it.'],
						graph: ['good', 'Here the links are the main thing: “friends of friends” is an ordinary walk along edges for several steps.']
					}
				},
				{
					q: 'Find the session of a signed-in visitor by the token in a cookie',
					fit: {
						table: ['ok', 'A sessions table with an index on the token works, but you have to clean out expired sessions yourself.'],
						doc: ['ok', 'A session document is easy to find by token. A lifetime can be set, but that takes extra effort.'],
						kv: ['good', 'The key is the token, the value is the session, and the entry has a lifetime: it expires by itself. This is what Redis is for.'],
						graph: ['bad', 'Sessions are not about links, so a graph has nothing to do here.']
					}
				},
				{
					q: 'A visitor counter for today: +1 on every visit',
					fit: {
						table: ['ok', 'UPDATE counter = counter + 1 works, but thousands of simultaneous changes to one row will queue behind each other.'],
						doc: ['ok', 'A number in a document can be incremented, but it is the same narrow gate into one record.'],
						kv: ['good', 'In-memory stores have a ready-made atomic command for this (INCR in Redis), and it is very fast.'],
						graph: ['bad', 'A counter is neither a node nor an edge.']
					}
				},
				{
					q: 'Every service has its own set of fields, read whole in one piece',
					fit: {
						table: ['ok', 'Either many columns full of empty values, or a separate JSON column. Tables resist this.'],
						doc: ['good', 'A document is exactly “a piece with any fields”. The page reads it in one query.'],
						kv: ['ok', 'You can put the whole document under one key, but you can no longer search inside it.'],
						graph: ['bad', 'Nodes can have properties, but you do not need a graph to store “pieces with any fields”.']
					}
				},
				{
					q: 'Inquiries that point to a service and contact details, plus a monthly report',
					fit: {
						table: ['good', 'Inquiries, services and contacts are tied by keys, and the report is a GROUP BY. Integrity and transactions are in place.'],
						doc: ['bad', 'Links and reports over them are done by hand in document databases, and the service nested in each inquiry has to be duplicated.'],
						kv: ['bad', 'Key-value stores are not built for reports over values.'],
						graph: ['ok', 'Links can be shown, but ordinary reports with sums and dates are less convenient in graphs.']
					}
				}
			]
		}
	});

	let items = $state(W.items);
	let people = $state(W.people);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			const t = p.items?.map((i) => i.title).filter(Boolean);
			if (t?.length) items = [...t, ...items].slice(0, 3);
			const n = p.people?.map((x) => x.name).filter(Boolean);
			if (n?.length) people = [...n, ...people].slice(0, 2);
		} catch {
			/* the example stays */
		}
	});

	type Shape = 'table' | 'doc' | 'kv' | 'graph';
	type Fit = 'good' | 'ok' | 'bad';
	const shapes: { id: Shape; name: string }[] = [
		{ id: 'table', name: W.shapes[0] },
		{ id: 'doc', name: W.shapes[1] },
		{ id: 'kv', name: W.shapes[2] },
		{ id: 'graph', name: W.shapes[3] }
	];
	let shape = $state<Shape>('table');

	const fitName: Record<Fit, string> = { good: W.fit[0], ok: W.fit[1], bad: W.fit[2] };
	const questions: { q: string; fit: Record<Shape, [Fit, string]> }[] = W.questions as unknown as { q: string; fit: Record<Shape, [Fit, string]> }[];
	let qi = $state(0);
	const cur = $derived(questions[qi].fit[shape]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each shapes as s (s.id)}
			<button type="button" aria-pressed={shape === s.id} onclick={() => (shape = s.id)}>{s.name}</button>
		{/each}
	</div>

	<div class="view">
		{#if shape === 'table'}
			<table class="t" aria-label={W.tableLabel}>
				<thead><tr><th>id</th><th>title</th><th>category_id</th></tr></thead>
				<tbody>
					{#each items as t, i (i)}<tr><td>{i + 1}</td><td>{t}</td><td>{i < 2 ? 1 : 2}</td></tr>{/each}
				</tbody>
			</table>
			<p class="dg-out">{@html W.tableText}</p>
		{:else if shape === 'doc'}
			<pre class="dg-box dg-mono">{`{ "_id": 1,
  "title": "${items[0]}",
  "category": "${W.category}",
  "${W.leads}": ["${people[0]}"],
  "${W.proofs}": [
    { "title": "${W.doc}" }
  ] }`}</pre>
			<p class="dg-out">{W.docText}</p>
		{:else if shape === 'kv'}
			<pre class="dg-box dg-mono">{`service:1          → { title: "${items[0]}", … }
session:a1b2c3     → { user: 7 }        ${W.expires(30)}
visits:today       → 128
rate:ip:203.0.113.5 → 4                 ${W.expires(1)}`}</pre>
			<p class="dg-out">{W.kvText}</p>
		{:else}
			<svg viewBox="0 0 480 190" role="img" aria-label={W.graphLabel}>
				<g class="edges">
					<line x1="90" y1="45" x2="240" y2="140" />
					<line x1="90" y1="45" x2="390" y2="45" />
					<line x1="90" y1="145" x2="240" y2="140" />
					<line x1="90" y1="145" x2="390" y2="45" />
					<line x1="240" y1="140" x2="390" y2="140" />
				</g>
				<g class="nodes">
					<circle cx="90" cy="45" r="26" /><circle cx="90" cy="145" r="26" />
					<rect x="205" y="122" width="70" height="36" rx="4" /><rect x="355" y="27" width="70" height="36" rx="4" /><rect x="355" y="122" width="70" height="36" rx="4" />
				</g>
				<g class="labels" text-anchor="middle">
					<text x="90" y="49">{people[0].split(' ')[0]}</text>
					<text x="90" y="149">{people[1].split(' ')[0]}</text>
					<text x="240" y="144">{items[0].split(' ')[0]}</text>
					<text x="390" y="49">{items[1].split(' ')[0]}</text>
					<text x="390" y="144">{items[2].split(' ')[0]}</text>
				</g>
			</svg>
			<p class="dg-out">{W.graphText}</p>
		{/if}
	</div>

	<label class="q">{W.ask}
		<select bind:value={qi}>
			{#each questions as q, i (i)}<option value={i}>{q.q}</option>{/each}
		</select>
	</label>
	<p class="dg-out verdict" aria-live="polite"><strong>{shapes.find((s) => s.id === shape)?.name}: {fitName[cur[0]]}.</strong> {cur[1]}</p>

	<table class="t m" aria-label={W.allShapes}>
		<thead><tr><th>{W.headShape}</th><th>{W.headFit}</th></tr></thead>
		<tbody>
			{#each shapes as s (s.id)}
				<tr><td>{s.name}</td><td class:best={questions[qi].fit[s.id][0] === 'good'}>{fitName[questions[qi].fit[s.id][0]]}</td></tr>
			{/each}
		</tbody>
	</table>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.view {
		margin: 0 0 var(--space-3);
	}
	.t {
		width: 100%;
		border-collapse: collapse;
	}
	.t th,
	.t td {
		padding: var(--space-1) var(--space-2);
		border: var(--line) solid var(--border-hairline);
		text-align: left;
		vertical-align: top;
	}
	.t th {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.t.m {
		max-width: 24rem;
		margin-top: var(--space-3);
	}
	td.best {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
		border-color: var(--accent-measure);
	}
	pre {
		margin: 0;
		overflow-x: auto;
		white-space: pre;
	}
	.q {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		margin-top: var(--space-2);
	}
	.q select {
		max-width: 100%;
	}
	svg {
		display: block;
		width: 100%;
		max-width: 30rem;
	}
	.edges line {
		stroke: var(--border-rule);
		stroke-width: 1.5;
	}
	.nodes circle,
	.nodes rect {
		fill: var(--surface-canvas);
		stroke: var(--accent-measure);
		stroke-width: 1.5;
	}
	.labels text {
		font-size: 12px;
		fill: var(--text-primary);
	}
	.verdict strong {
		color: var(--text-primary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
