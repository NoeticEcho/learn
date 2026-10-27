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
	const steps: Step[] = [
		{ id: 'static', name: 'Статический хостинг', example: 'GitHub Pages, Cloudflare Pages, Netlify, Vercel; в России — раздача файлов из хранилища облака', cost: 'от 0 до нескольких сотен ₽/мес', you: ['файлы сайта', 'домен'], provider: ['сервер, система, обновления', 'HTTPS', 'раздача по сети'], upTo: 0, limit: 5_000_000, hours: 1 },
		{ id: 'shared', name: 'Виртуальный (shared) хостинг', example: 'Timeweb, Beget, REG.RU и другие: панель, PHP, MySQL, почта', cost: 'сотни ₽/мес', you: ['файлы и база сайта', 'обновления самой CMS и плагинов', 'пароли'], provider: ['сервер и система', 'веб-сервер, PHP, MySQL', 'резервные копии (проверьте условия)'], upTo: 1, limit: 100_000, hours: 3 },
		{ id: 'vps', name: 'VPS / VDS', example: 'виртуальный сервер у любого российского или зарубежного провайдера, вы — администратор', cost: 'от нескольких сотен до тысяч ₽/мес', you: ['система и её обновления', 'веб-сервер, база, HTTPS-сертификат', 'защита (файрвол, ключи)', 'резервные копии'], provider: ['железо и сеть', 'питание и охлаждение'], upTo: 2, limit: 500_000, hours: 10 },
		{ id: 'dedicated', name: 'Выделенный сервер', example: 'целая физическая машина в дата-центре', cost: 'от тысяч ₽/мес', you: ['всё, что на VPS', 'замену диска и железа вместе с провайдером'], provider: ['место, питание, канал'], upTo: 2, limit: 5_000_000, hours: 15 },
		{ id: 'cloud', name: 'Облако (IaaS / PaaS)', example: 'Yandex Cloud, VK Cloud, Cloud.ru, Selectel; за рубежом AWS, Google Cloud, Azure', cost: 'платите за использование: от копеек до очень много', you: ['что включить и как это соединить', 'бюджет и лимиты', 'безопасность настроек'], provider: ['железо, сеть, готовые службы (управляемая база, хранилище, балансировщик)'], upTo: 2, limit: Infinity, hours: 8 }
	];

	let kind = $state<'static' | 'cms' | 'app'>('static');
	let visitors = $state(2);
	let hours = $state(2);
	let action = $state('Главное действие');
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

	const verdicts = $derived(
		steps.map((s) => {
			if (s.upTo < need) return { s, level: 'no', why: need === 1 ? 'здесь нельзя запустить готовую CMS с базой данных' : 'здесь нельзя запустить своё приложение с базой данных' };
			if (visits > s.limit) return { s, level: 'no', why: 'при таком числе посетителей эта ступень уже тесна' };
			if (hours < s.hours && s.id !== 'static' && s.id !== 'cloud') return { s, level: 'tight', why: `на вас лежит администрирование: обычно нужно около ${s.hours} ч в месяц, а вы даёте ${hours}` };
			if (s.id === 'cloud' && hours < s.hours) return { s, level: 'tight', why: 'облако гибкое, но разобраться в нём и в счёте тоже время' };
			if (s.id === 'static' && receives && need === 0) return { s, level: 'tight', why: `страницы отдаются легко, но для «${action}» нужно ещё принимать данные: форма-сервис или функция (урок про serverless)` };
			if (s.id === 'dedicated' && visits < 100_000) return { s, level: 'tight', why: 'мощности намного больше, чем нужно' };
			return { s, level: 'ok', why: 'подходит по возможностям и по вашему времени' };
		})
	);
	const label = { ok: 'подходит', tight: 'с оговорками', no: 'не подходит' } as const;
</script>

<figure class="dg">
	<figcaption>Куда поселить сайт: что делаете вы, а что провайдер</figcaption>
	<div class="dg-ctl" role="group" aria-label="Какой у вас сайт">
		<button type="button" aria-pressed={kind === 'static'} onclick={() => (kind = 'static')}>Только страницы</button>
		<button type="button" aria-pressed={kind === 'cms'} onclick={() => (kind = 'cms')}>Готовая CMS (WordPress и подобные)</button>
		<button type="button" aria-pressed={kind === 'app'} onclick={() => (kind = 'app')}>Своё приложение с базой</button>
	</div>
	<div class="dg-ctl">
		<label>Посетителей в месяц: <input type="range" min="0" max="4" step="0.25" bind:value={visitors} /> <strong>около {visits.toLocaleString('ru-RU')}</strong></label>
	</div>
	<div class="dg-ctl">
		<label>Часов в месяц на сервер: <input type="range" min="0" max="20" step="1" bind:value={hours} /> <strong>{hours}</strong></label>
	</div>
	<p class="dg-out">Главное действие вашего проекта: <strong>{action}</strong>{receives ? '. Его надо принять и сохранить, то есть сайт не только показывает страницы.' : '. Для него достаточно показывать страницы.'}</p>

	<ol class="ladder">
		{#each verdicts as v, i (i)}
			<li class={v.level}>
				<p class="head"><strong>{v.s.name}</strong> <span class="tag">{label[v.level as 'ok' | 'tight' | 'no']}</span></p>
				<p class="why">{v.why}</p>
				<p class="meta">{v.s.example}. Порядок цены: {v.s.cost}.</p>
				<div class="two">
					<div class="dg-box"><h4>Вы обслуживаете</h4><ul>{#each v.s.you as x, j (j)}<li>{x}</li>{/each}</ul></div>
					<div class="dg-box"><h4>Провайдер</h4><ul>{#each v.s.provider as x, j (j)}<li>{x}</li>{/each}</ul></div>
				</div>
			</li>
		{/each}
	</ol>
	<p class="dg-out">Цены даны порядком величины для России осенью 2026 года, это не тарифы: сверяйтесь с сайтом провайдера. Важна пропорция: чем выше ступень, тем больше свободы и тем больше обязанностей у вас.</p>
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
	h4 {
		margin: 0 0 var(--space-1);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
