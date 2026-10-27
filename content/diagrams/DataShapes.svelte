<!--
	«Одни данные, четыре формы» (part 7, lesson 5). The person's own services and people shown as
	tables, as a JSON document, as key-value pairs and as a graph, with a question picker: for each
	question the diagram says whether that shape answers it naturally, possibly, or awkwardly, and
	why. The ratings are the lesson's judgement, not a benchmark. Sessions and counters are invented.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let items = $state(['Первая услуга', 'Вторая услуга', 'Третья услуга']);
	let people = $state(['Человек А', 'Человек Б']);
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
	const shapes: { id: Shape; name: string }[] = [
		{ id: 'table', name: 'Таблицы' },
		{ id: 'doc', name: 'Документ' },
		{ id: 'kv', name: 'Ключ — значение' },
		{ id: 'graph', name: 'Граф' }
	];
	let shape = $state<Shape>('table');

	type Fit = 'good' | 'ok' | 'bad';
	const fitName: Record<Fit, string> = { good: 'Естественно', ok: 'Можно', bad: 'Неудобно' };
	const questions: { q: string; fit: Record<Shape, [Fit, string]> }[] = [
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
	];
	let qi = $state(0);
	const cur = $derived(questions[qi].fit[shape]);
</script>

<figure class="dg">
	<figcaption>Одни данные, четыре формы</figcaption>
	<div class="dg-ctl" role="group" aria-label="Форма хранения">
		{#each shapes as s (s.id)}
			<button type="button" aria-pressed={shape === s.id} onclick={() => (shape = s.id)}>{s.name}</button>
		{/each}
	</div>

	<div class="view">
		{#if shape === 'table'}
			<table class="t" aria-label="Данные в таблицах">
				<thead><tr><th>id</th><th>title</th><th>category_id</th></tr></thead>
				<tbody>
					{#each items as t, i (i)}<tr><td>{i + 1}</td><td>{t}</td><td>{i < 2 ? 1 : 2}</td></tr>{/each}
				</tbody>
			</table>
			<p class="dg-out">Одна таблица на вид «вещей», связи через ключи (<span class="dg-mono">category_id</span>).</p>
		{:else if shape === 'doc'}
			<pre class="dg-box dg-mono">{`{ "_id": 1,
  "title": "${items[0]}",
  "category": "основное",
  "ведёт": ["${people[0]}"],
  "подтверждения": [
    { "title": "документ №00-00-00" }
  ] }`}</pre>
			<p class="dg-out">Один документ содержит услугу вместе со вложенным. У другой услуги поля могут быть другими.</p>
		{:else if shape === 'kv'}
			<pre class="dg-box dg-mono">{`service:1          → { title: "${items[0]}", … }
session:a1b2c3     → { user: 7 }        срок: 30 мин
visits:today       → 128
rate:ip:203.0.113.5 → 4                 срок: 1 мин`}</pre>
			<p class="dg-out">Словарь «ключ → значение». Найти по ключу мгновенно, а искать по содержимому значения нельзя. У записи может быть срок жизни.</p>
		{:else}
			<svg viewBox="0 0 480 190" role="img" aria-label="Граф: люди связаны с услугами рёбрами «ведёт»">
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
			<p class="dg-out">Вершины (люди, услуги) и рёбра между ними («ведёт»). Связи хранятся как первоклассные данные, и обход по ним быстр.</p>
		{/if}
	</div>

	<label class="q">Вопрос к данным:
		<select bind:value={qi}>
			{#each questions as q, i (i)}<option value={i}>{q.q}</option>{/each}
		</select>
	</label>
	<p class="dg-out verdict" aria-live="polite"><strong>{shapes.find((s) => s.id === shape)?.name}: {fitName[cur[0]]}.</strong> {cur[1]}</p>

	<table class="t m" aria-label="Все формы для этого вопроса">
		<thead><tr><th>Форма</th><th>Оценка</th></tr></thead>
		<tbody>
			{#each shapes as s (s.id)}
				<tr><td>{s.name}</td><td class:best={questions[qi].fit[s.id][0] === 'good'}>{fitName[questions[qi].fit[s.id][0]]}</td></tr>
			{/each}
		</tbody>
	</table>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> для каждого из шести вопросов (отбор по категории, связи через несколько шагов, сессия по токену, счётчик, документ с произвольными полями, заявки с отчётом) схема называет, какая форма хранения подходит естественно, какая терпимо, а какая неудобно. Оценки это суждение автора урока, а не замер.</p>
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
