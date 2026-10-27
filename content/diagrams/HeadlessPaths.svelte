<!--
	«Где живёт headless-CMS» (part 8, lesson 6). Three columns: content as files in Git (Decap),
	a database on your own server (Strapi, Directus), a cloud service (Sanity, Contentful). The
	person picks one and presses «Редактор сохраняет правку»; the path of the change (editor, store,
	API or build, site) lights up step by step, with what each choice means for the data and the
	money. The service names are real; the judgements are the lesson's, and prices are not stated.
-->
<script lang="ts">
	import './shared.css';

	type Id = 'git' | 'own' | 'cloud';
	const opts: Record<Id, { title: string; tools: string; store: string; steps: string[]; plus: string[]; minus: string[] }> = {
		git: {
			title: 'Файлы в Git',
			tools: 'Decap CMS (прежде Netlify CMS)',
			store: 'Тексты лежат файлами Markdown и JSON в репозитории рядом с сайтом.',
			steps: ['Редактор правит запись в админке Decap', 'Decap делает коммит в репозиторий', 'Сборка видит коммит и пересобирает сайт', 'Новая версия выложена'],
			plus: ['Нет ни сервера, ни базы: нечего обслуживать и взламывать', 'Вся история правок в Git', 'Бесплатно или почти'],
			minus: ['Редактору нужен вход через Git-сервис', 'Сложные связи между записями неудобны', 'Каждая правка это пересборка сайта']
		},
		own: {
			title: 'База на своём сервере',
			tools: 'Strapi, Directus',
			store: 'Содержание лежит в вашей базе данных, админка и API работают на вашем сервере.',
			steps: ['Редактор правит запись в админке', 'Запись сохраняется в базе', 'API отдаёт её сайту (по запросу или при сборке)', 'Сайт показывает новую версию'],
			plus: ['Полный контроль и данные там, где решили вы (например, в России)', 'Сложные типы, связи и роли', 'Нет платы за каждого редактора или запрос'],
			minus: ['Сервер, обновления, копии и защита на вас', 'Нужен разработчик, который развернёт и настроит', 'Часть работы по сайту удваивается: CMS и сайт']
		},
		cloud: {
			title: 'Облачный сервис',
			tools: 'Sanity, Contentful',
			store: 'Содержание лежит у провайдера, админка в браузере, доступ по API.',
			steps: ['Редактор правит запись в админке сервиса', 'Сервис сохраняет и отправляет вебхук', 'Сборка запрашивает содержание по API и пересобирает сайт', 'Новая версия выложена'],
			plus: ['Быстрый старт без серверов', 'Удобные редакторы и работа нескольких людей, предпросмотр', 'Масштабируется сам'],
			minus: ['Данные у стороннего провайдера: вопросы локализации и персональных данных', 'Цена растёт с числом редакторов и запросов', 'Привязка к сервису: переезд это работа']
		}
	};
	let sel = $state<Id>('git');
	let step = $state(0);
	const cur = $derived(opts[sel]);
</script>

<figure class="dg">
	<figcaption>Куда уходит содержание, пока вы его правите</figcaption>
	<div class="dg-ctl" role="group" aria-label="Где хранится содержание">
		{#each Object.entries(opts) as [id, o] (id)}
			<button type="button" aria-pressed={sel === id} onclick={() => ((sel = id as Id), (step = 0))}>{o.title}</button>
		{/each}
	</div>
	<p class="dg-out"><strong>Примеры:</strong> {cur.tools}. {cur.store}</p>
	<ol class="path" aria-label="Путь правки">
		{#each cur.steps as s, i (i)}
			<li class:on={i <= step} class:now={i === step}>{s}</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" class="on" onclick={() => (step = Math.min(cur.steps.length - 1, step + 1))} disabled={step >= cur.steps.length - 1}>Дальше по пути правки</button>
		<button type="button" onclick={() => (step = 0)} disabled={step === 0}>Сначала</button>
	</div>
	<div class="two">
		<div>
			<div class="dh">Что хорошо</div>
			<ul>{#each cur.plus as p, i (i)}<li>{p}</li>{/each}</ul>
		</div>
		<div>
			<div class="dh">Чем платим</div>
			<ul>{#each cur.minus as p, i (i)}<li>{p}</li>{/each}</ul>
		</div>
	</div>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> Headless CMS хранит содержание в одном из трёх мест: файлы в Git (Decap), база на вашем сервере (Strapi, Directus), облако провайдера (Sanity, Contentful). Правка редактора проходит путь от админки через хранилище к API или сборке и до сайта. Чем ближе к вам хранилище, тем больше контроль над данными и работы по обслуживанию.</p>
</figure>

<style>
	.path {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
		counter-reset: s;
	}
	.path li {
		counter-increment: s;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
		color: var(--text-secondary);
	}
	.path li::before {
		content: counter(s) '. ';
	}
	.path li.on {
		color: var(--text-primary);
		border-color: var(--border-rule);
	}
	.path li.now {
		border-color: var(--accent-measure);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.two ul {
		margin: 0;
		padding-left: var(--space-5);
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
