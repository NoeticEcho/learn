<!--
	«Лестница хостинга» (part 9, lesson 1). Five ways to keep a site on someone else's always-on
	computer, from a static host to a cloud. The person says what kind of site it is, how many
	visitors a month, and how many hours a month they can give to the machine; the page says, for
	every step, what the person looks after and what the provider does, a rough price band, and
	whether it fits. The price bands are orders of magnitude for the Russian market in autumn
	2026, not quotes: the point is the questions, not the prices. The main action of the
	person's own brief decides whether the site only shows pages or must also receive something.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick, getLocale } from '#lib/i18n/index.ts';

	type Step = {
		id: string;
		name: string;
		example: string;
		cost: string;
		you: string[];
		provider: string[];
		/** 0 static pages only, 1 a ready CMS, 2 own application and database */
		upTo: 0 | 1 | 2;
		/** visitors per month where it stops being comfortable */
		limit: number;
		hours: number;
	};
	const limits = {
		static: { upTo: 0, limit: 5_000_000, hours: 1 },
		shared: { upTo: 1, limit: 100_000, hours: 3 },
		vps: { upTo: 2, limit: 500_000, hours: 10 },
		dedicated: { upTo: 2, limit: 5_000_000, hours: 15 },
		cloud: { upTo: 2, limit: Infinity, hours: 8 }
	} as const;
	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The English prices are orders of magnitude for October 2026, in dollars, like the Russian ones in rubles.
	const W = pick({
		ru: {
			fallbackAction: 'Главное действие',
			names: { static: 'Статический хостинг', shared: 'Виртуальный (shared) хостинг', vps: 'VPS / VDS', dedicated: 'Выделенный сервер', cloud: 'Облако (IaaS / PaaS)' },
			examples: {
				static: 'GitHub Pages, Cloudflare Pages, Netlify, Vercel; в России это раздача файлов из хранилища облака',
				shared: 'Timeweb, Beget, REG.RU и другие: панель, PHP, MySQL, почта',
				vps: 'виртуальный сервер у любого российского или зарубежного провайдера, администратор вы',
				dedicated: 'целая физическая машина в дата-центре',
				cloud: 'Yandex Cloud, VK Cloud, Cloud.ru, Selectel; за рубежом AWS, Google Cloud, Azure'
			},
			costs: {
				static: 'от 0 до нескольких сотен ₽/мес',
				shared: 'сотни ₽/мес',
				vps: 'от нескольких сотен до тысяч ₽/мес',
				dedicated: 'от тысяч ₽/мес',
				cloud: 'платите за использование: от копеек до очень много'
			},
			you: {
				static: ['файлы сайта', 'домен'],
				shared: ['файлы и база сайта', 'обновления самой CMS и плагинов', 'пароли'],
				vps: ['система и её обновления', 'веб-сервер, база, HTTPS-сертификат', 'защита (файрвол, ключи)', 'резервные копии'],
				dedicated: ['всё, что на VPS', 'замену диска и железа вместе с провайдером'],
				cloud: ['что включить и как это соединить', 'бюджет и лимиты', 'безопасность настроек']
			},
			provider: {
				static: ['сервер, система, обновления', 'HTTPS', 'раздача по сети'],
				shared: ['сервер и система', 'веб-сервер, PHP, MySQL', 'резервные копии (проверьте условия)'],
				vps: ['железо и сеть', 'питание и охлаждение'],
				dedicated: ['место, питание, канал'],
				cloud: ['железо, сеть, готовые службы (управляемая база, хранилище, балансировщик)']
			},
			kindStatic: 'Только страницы',
			kindCms: 'Готовая CMS (WordPress и подобные)',
			kindApp: 'Своё приложение с базой',
			caption: 'Куда поселить сайт: что делаете вы, а что провайдер',
			kindLabel: 'Какой у вас сайт',
			visitorsLabel: 'Посетителей в месяц:',
			about: 'около',
			hoursLabel: 'Часов в месяц на сервер:',
			actionIs: 'Главное действие вашего проекта:',
			receives: '. Его надо принять и сохранить, то есть сайт не только показывает страницы.',
			shows: '. Для него достаточно показывать страницы.',
			priceNote: 'Порядок цены:',
			youDo: 'Вы обслуживаете',
			providerDoes: 'Провайдер',
			footnote: 'Цены даны порядком величины для России осенью 2026 года, это не тарифы: сверяйтесь с сайтом провайдера. Важна пропорция: чем выше ступень, тем больше свободы и тем больше обязанностей у вас.',
			label: { ok: 'подходит', tight: 'с оговорками', no: 'не подходит' },
			noCms: 'здесь нельзя запустить готовую CMS с базой данных',
			noApp: 'здесь нельзя запустить своё приложение с базой данных',
			crowded: 'при таком числе посетителей эта ступень уже тесна',
			admin: (n: number, h: number) => `на вас лежит администрирование: обычно нужно около ${n} ч в месяц, а вы даёте ${h}`,
			cloudTime: 'облако гибкое, но разобраться в нём и в счёте тоже время',
			staticForm: (a: string) => `страницы отдаются легко, но для «${a}» нужно ещё принимать данные: форма-сервис или функция (урок про serverless)`,
			overkill: 'мощности намного больше, чем нужно',
			fits: 'подходит по возможностям и по вашему времени'
		},
		en: {
			fallbackAction: 'Main action',
			names: { static: 'Static hosting', shared: 'Shared hosting', vps: 'VPS', dedicated: 'Dedicated server', cloud: 'The cloud (IaaS / PaaS)' },
			examples: {
				static: 'GitHub Pages, Cloudflare Pages, Netlify, Vercel; or files served from a cloud storage bucket',
				shared: 'a control panel, PHP, MySQL and mail from an ordinary web host',
				vps: 'a virtual server from DigitalOcean, Hetzner or any other provider; you are the administrator',
				dedicated: 'a whole physical machine in a data center',
				cloud: 'AWS, Google Cloud, Microsoft Azure'
			},
			costs: {
				static: 'from $0 to a few dollars a month',
				shared: 'a few dollars a month',
				vps: 'from about $4 to a few dozen dollars a month',
				dedicated: 'from tens of dollars a month',
				cloud: 'you pay for use: from pennies to a great deal'
			},
			you: {
				static: ['the site’s files', 'the domain'],
				shared: ['the site’s files and database', 'updates of the CMS and plugins themselves', 'passwords'],
				vps: ['the system and its updates', 'the web server, the database, the HTTPS certificate', 'security (firewall, keys)', 'backups'],
				dedicated: ['everything a VPS needs', 'replacing disks and hardware together with the provider'],
				cloud: ['what to switch on and how to connect it', 'the budget and the limits', 'the security of the settings']
			},
			provider: {
				static: ['the server, the system, updates', 'HTTPS', 'serving over the network'],
				shared: ['the server and the system', 'the web server, PHP, MySQL', 'backups (check the terms)'],
				vps: ['hardware and network', 'power and cooling'],
				dedicated: ['room, power, the connection'],
				cloud: ['hardware, network, ready-made services (a managed database, storage, a load balancer)']
			},
			kindStatic: 'Pages only',
			kindCms: 'A ready-made CMS (WordPress and the like)',
			kindApp: 'My own application with a database',
			caption: 'Where to house a site: what you do and what the provider does',
			kindLabel: 'What kind of site you have',
			visitorsLabel: 'Visitors a month:',
			about: 'about',
			hoursLabel: 'Hours a month for the server:',
			actionIs: 'Your project’s main action:',
			receives: '. It has to be received and saved, so the site does more than show pages.',
			shows: '. Showing pages is enough for it.',
			priceNote: 'Order of price:',
			youDo: 'You look after',
			providerDoes: 'The provider',
			footnote: 'The prices are orders of magnitude for October 2026, not price lists: check the provider’s own page. What matters is the proportion: the higher the step, the more freedom and the more duties for you.',
			label: { ok: 'fits', tight: 'with reservations', no: 'doesn’t fit' },
			noCms: 'a ready-made CMS with a database can’t run here',
			noApp: 'your own application with a database can’t run here',
			crowded: 'with this many visitors this step is already too tight',
			admin: (n: number, h: number) => `administration falls on you: it usually takes about ${n} hours a month, and you’re giving ${h}`,
			cloudTime: 'the cloud is flexible, but learning it and its bill takes time too',
			staticForm: (a: string) => `pages are easy to serve, but “${a}” also needs data received: a form service or a function (the serverless lesson)`,
			overkill: 'far more power than you need',
			fits: 'fits what it can do and the time you have'
		}
	});

	const ids = ['static', 'shared', 'vps', 'dedicated', 'cloud'] as const;
	const steps: Step[] = ids.map((id) => ({
		id,
		name: W.names[id],
		example: W.examples[id],
		cost: W.costs[id],
		you: W.you[id],
		provider: W.provider[id],
		...limits[id]
	}));

	let kind = $state<'static' | 'cms' | 'app'>('static');
	let visitors = $state(2);
	let hours = $state(2);
	let action = $state(W.fallbackAction);
	let actionKind = $state('form');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			action = p.mainAction?.label ?? action;
			actionKind = p.mainAction?.kind ?? actionKind;
		} catch {
			/* the example stays */
		}
	});

	const visits = $derived(Math.round(Math.pow(10, 2 + visitors * 0.75)));
	const need = $derived(kind === 'static' ? 0 : kind === 'cms' ? 1 : 2);
	const receives = $derived(['form', 'buy', 'book', 'signup'].includes(actionKind));
	const loc = getLocale() === 'ru' ? 'ru-RU' : 'en-US';

	const verdicts = $derived(
		steps.map((s) => {
			if (s.upTo < need) return { s, level: 'no', why: need === 1 ? W.noCms : W.noApp };
			if (visits > s.limit) return { s, level: 'no', why: W.crowded };
			if (hours < s.hours && s.id !== 'static' && s.id !== 'cloud') return { s, level: 'tight', why: W.admin(s.hours, hours) };
			if (s.id === 'cloud' && hours < s.hours) return { s, level: 'tight', why: W.cloudTime };
			if (s.id === 'static' && receives && need === 0) return { s, level: 'tight', why: W.staticForm(action) };
			if (s.id === 'dedicated' && visits < 100_000) return { s, level: 'tight', why: W.overkill };
			return { s, level: 'ok', why: W.fits };
		})
	);
	const label = W.label;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.kindLabel}>
		<button type="button" aria-pressed={kind === 'static'} onclick={() => (kind = 'static')}>{W.kindStatic}</button>
		<button type="button" aria-pressed={kind === 'cms'} onclick={() => (kind = 'cms')}>{W.kindCms}</button>
		<button type="button" aria-pressed={kind === 'app'} onclick={() => (kind = 'app')}>{W.kindApp}</button>
	</div>
	<div class="dg-ctl">
		<label>{W.visitorsLabel} <input type="range" min="0" max="4" step="0.25" bind:value={visitors} /> <strong>{W.about} {visits.toLocaleString(loc)}</strong></label>
	</div>
	<div class="dg-ctl">
		<label>{W.hoursLabel} <input type="range" min="0" max="20" step="1" bind:value={hours} /> <strong>{hours}</strong></label>
	</div>
	<p class="dg-out">{W.actionIs} <strong>{action}</strong>{receives ? W.receives : W.shows}</p>

	<ol class="ladder">
		{#each verdicts as v, i (i)}
			<li class={v.level}>
				<p class="head"><strong>{v.s.name}</strong> <span class="tag">{label[v.level as 'ok' | 'tight' | 'no']}</span></p>
				<p class="why">{v.why}</p>
				<p class="meta">{v.s.example}. {W.priceNote} {v.s.cost}.</p>
				<div class="two">
					<div class="dg-box"><div class="dh">{W.youDo}</div><ul>{#each v.s.you as x, j (j)}<li>{x}</li>{/each}</ul></div>
					<div class="dg-box"><div class="dh">{W.providerDoes}</div><ul>{#each v.s.provider as x, j (j)}<li>{x}</li>{/each}</ul></div>
				</div>
			</li>
		{/each}
	</ol>
	<p class="dg-out">{W.footnote}</p>
</figure>

<style>
	.ladder {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
	}
	.ladder > li {
		padding: var(--space-3);
		border-left: 4px solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.ladder > li.ok {
		border-left-color: var(--accent-measure);
	}
	.ladder > li.tight {
		border-left-color: var(--border-brass);
	}
	.ladder > li.no {
		opacity: 0.7;
	}
	p {
		margin: 0 0 var(--space-1);
	}
	.tag {
		margin-left: var(--space-2);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		color: var(--text-secondary);
	}
	.meta,
	.why {
		color: var(--text-secondary);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	.dh {
		margin: 0 0 var(--space-1);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
