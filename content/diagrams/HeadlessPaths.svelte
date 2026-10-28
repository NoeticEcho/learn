<!--
	«Где живёт headless CMS» (part 8, lesson 6). Three columns: content as files in Git (Decap),
	a database on your own server (Strapi, Directus), a cloud service (Sanity, Contentful). The
	person picks one and presses «Редактор сохраняет правку»; the path of the change (editor, store,
	API or build, site) lights up step by step, with what each choice means for the data and the
	money. The service names are real; the judgements are the lesson's, and prices are not stated.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Id = 'git' | 'own' | 'cloud';
	type Opt = { title: string; tools: string; store: string; steps: string[]; plus: string[]; minus: string[] };
	const W = pick({
		ru: {
			caption: 'Куда уходит содержание, пока вы его правите',
			group: 'Где хранится содержание',
			examples: 'Примеры:',
			path: 'Путь правки',
			next: 'Дальше по пути правки',
			again: 'Сначала',
			plus: 'Что хорошо',
			minus: 'Чем платим',
			alt: 'Текстовая альтернатива:',
			altText:
				'Headless CMS хранит содержание в одном из трёх мест: файлы в Git (Decap), база на вашем сервере (Strapi, Directus), облако провайдера (Sanity, Contentful). Правка редактора проходит путь от админки через хранилище к API или сборке и до сайта. Чем ближе к вам хранилище, тем больше контроль над данными и работы по обслуживанию.',
			opts: {
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
			} as Record<Id, Opt>
		},
		en: {
			caption: 'Where the content goes while you edit it',
			group: 'Where the content is stored',
			examples: 'Examples:',
			path: 'The path of an edit',
			next: 'Next step of the edit',
			again: 'Start over',
			plus: 'What is good',
			minus: 'What it costs',
			alt: 'Text alternative:',
			altText:
				'A headless CMS keeps its content in one of three places: files in Git (Decap CMS), a database on your own server (Strapi, Directus), or a provider’s cloud (Sanity, Contentful). An editor’s change travels from the admin through the store to the API or the build, and on to the site. The closer the store is to you, the more control you have over the data and the more upkeep you do.',
			opts: {
				git: {
					title: 'Files in Git',
					tools: 'Decap CMS (formerly Netlify CMS)',
					store: 'The texts sit as Markdown and JSON files in the repository next to the site.',
					steps: ['The editor changes an entry in the Decap admin', 'Decap makes a commit in the repository', 'The build sees the commit and rebuilds the site', 'The new version is live'],
					plus: ['No server and no database: nothing to maintain or break into', 'The whole history of edits is in Git', 'Free, or nearly'],
					minus: ['The editor has to sign in through a Git service', 'Complex links between entries are awkward', 'Every edit is a rebuild of the site']
				},
				own: {
					title: 'A database on your own server',
					tools: 'Strapi, Directus',
					store: 'The content sits in your own database, and the admin and the API run on your own server.',
					steps: ['The editor changes an entry in the admin', 'The entry is saved in the database', 'The API serves it to the site (on request or at build time)', 'The site shows the new version'],
					plus: ['Full control, and the data stays where you decide (a region you choose, say)', 'Complex types, relations and roles', 'No fee per editor or per request'],
					minus: ['The server, updates, backups and security are yours', 'A developer has to install and configure it', 'Some of the work doubles: the CMS and the site']
				},
				cloud: {
					title: 'A cloud service',
					tools: 'Sanity, Contentful',
					store: 'The content sits with the provider, the admin runs in the browser, and access is by API.',
					steps: ['The editor changes an entry in the service’s admin', 'The service saves it and sends a webhook', 'The build asks the API for the content and rebuilds the site', 'The new version is live'],
					plus: ['A quick start with no servers', 'Pleasant editors, several people at once, previews', 'Scales by itself'],
					minus: ['The data sits with a third party: questions of where it is stored and of personal data', 'The price grows with editors and requests', 'Lock-in: moving away is work']
				}
			} as Record<Id, Opt>
		}
	});
	const opts = W.opts;
	let sel = $state<Id>('git');
	let step = $state(0);
	const cur = $derived(opts[sel]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each Object.entries(opts) as [id, o] (id)}
			<button type="button" aria-pressed={sel === id} onclick={() => ((sel = id as Id), (step = 0))}>{o.title}</button>
		{/each}
	</div>
	<p class="dg-out"><strong>{W.examples}</strong> {cur.tools}. {cur.store}</p>
	<ol class="path" aria-label={W.path}>
		{#each cur.steps as s, i (i)}
			<li class:on={i <= step} class:now={i === step}>{s}</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" class="on" onclick={() => (step = Math.min(cur.steps.length - 1, step + 1))} disabled={step >= cur.steps.length - 1}>{W.next}</button>
		<button type="button" onclick={() => (step = 0)} disabled={step === 0}>{W.again}</button>
	</div>
	<div class="two">
		<div>
			<div class="dh">{W.plus}</div>
			<ul>{#each cur.plus as p, i (i)}<li>{p}</li>{/each}</ul>
		</div>
		<div>
			<div class="dh">{W.minus}</div>
			<ul>{#each cur.minus as p, i (i)}<li>{p}</li>{/each}</ul>
		</div>
	</div>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
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
