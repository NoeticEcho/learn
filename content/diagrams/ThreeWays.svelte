<!--
	«Три пути: Tilda, Битрикс, WordPress» (part 8, lesson 4). Four questions about the person's
	project (budget, 1С, who edits, a shop) and the typical limits of each path. A few simple rules
	add points to each path and show their reasons; the rules are the lesson's simplification, not a
	benchmark, and the answer is a starting point for a conversation, not a verdict.
-->
<script lang="ts">
	import './shared.css';
	import { pick, getLocale } from '#lib/i18n/index.ts';

	type Id = 'tilda' | 'bitrix' | 'wp';
	let budget = $state<'low' | 'mid' | 'high'>('low');
	let onec = $state(false);
	let who = $state<'owner' | 'team'>('owner');
	let shop = $state<'none' | 'small' | 'big'>('none');
	let custom = $state(false);

	// The words, one entry per edition (docs/content-plan/README.md, «English edition»). The three
	// paths are Tilda, 1С-Битрикс and WordPress for the Russian edition; for the English one a
	// website builder (Wix, Squarespace, Webflow), a store platform (Shopify, with 1C-Bitrix as the
	// Russian case) and WordPress. The ids stay the same.
	const W = pick({
		ru: {
			names: { tilda: 'Tilda', bitrix: '1С-Битрикс', wp: 'WordPress' } as Record<Id, string>,
			limits: {
				tilda: ['Сайт живёт на платформе; выйти можно, но экспорт кода зависит от тарифа, а формы и корзина работают через её сервисы.', 'Серверной логики своей не напишешь: только то, что платформа позволяет.', 'Подписка платится, пока сайт нужен.'],
				bitrix: ['Лицензия платная, и нужны хостинг и разработчик, который знает систему.', 'Обновления и защита на вас: у старых версий бывают массовые взломы.', 'Интеграция с 1С это отдельная работа, а не кнопка.'],
				wp: ['Всё на вас: хостинг, обновления, защита, копии (урок 3).', 'Качество сайта зависит от выбранных тем и плагинов.', 'Интеграции с российскими сервисами идут плагинами разной свежести.']
			} as Record<Id, string[]>,
			ownerT: 'правит сам владелец без технических знаний',
			ownerW: 'владелец справится с редактором',
			ownerB: 'без разработчика Битрикс не потянуть',
			teamB: 'правит и обслуживает команда',
			teamW: 'команда справится с обслуживанием',
			lowT: 'небольшой бюджет: быстрый старт и подписка',
			lowB: 'лицензия и разработчик дороги',
			lowW: 'бесплатное ядро и недорогой хостинг',
			highB: 'бюджет позволяет лицензию и разработчика',
			highW: 'можно заказать доработку',
			erpB: 'нужен обмен с 1С: у Битрикса он готов',
			erpT: 'с 1С Tilda напрямую не дружит',
			erpW: 'с 1С только плагинами',
			smallT: 'простой магазин на встроенной корзине',
			smallW: 'простой магазин плагином',
			smallB: 'магазин в комплекте',
			bigB: 'большой магазин: каталог, склады, заказы',
			bigW: 'магазин на плагине, но с ростом сложнее',
			bigT: 'большой каталог тесен для блоков',
			customW: 'нужна своя логика: плагины и код',
			customB: 'свой код возможен',
			customT: 'своей серверной логики нет',
			neutral: 'ни за, ни против',
			caption: 'Три пути для вашего проекта',
			intro: 'Правила упрощены, и ответ это повод для разговора, а не приговор.',
			budgetL: 'Бюджет',
			low: 'небольшой',
			mid: 'средний',
			high: 'большой',
			whoL: 'Кто правит',
			owner: 'владелец сам',
			team: 'команда',
			shopL: 'Магазин',
			none: 'не нужен',
			small: 'небольшой',
			big: 'большой каталог',
			more: 'Ещё',
			erp: 'нужна интеграция с 1С',
			custom: 'нужна своя логика',
			tie: 'Ничья: решают детали вашего проекта.',
			best: (n: string) => `Сильнее всего подходит: ${n}.`,
			limitsOf: (n: string) => `Типичные ограничения ${n}:`,
			alt: 'Текстовая альтернатива:',
			altText: 'Tilda подходит, когда сайт правит сам владелец при небольшом бюджете. 1С-Битрикс подходит, когда нужны интеграция с 1С, большой магазин и есть разработчик. WordPress занимает середину и выигрывает, когда нужна своя логика. У каждого пути есть типичные ограничения: у Tilda платформа, у Битрикса цена и обслуживание, у WordPress всё обслуживание на вас.'
		},
		en: {
			names: { tilda: 'A website builder (Wix, Squarespace, Webflow)', bitrix: 'A store platform (Shopify, 1C-Bitrix)', wp: 'WordPress' } as Record<Id, string>,
			limits: {
				tilda: [
					'The site lives on the platform and your plan: you can leave, but code export depends on the builder and the plan, and forms and the store work through its services.',
					'You can’t write your own server logic, only what the platform allows.',
					'You pay a subscription for as long as the site is needed.'
				],
				bitrix: [
					'You pay a monthly plan (Shopify) or a license (1C-Bitrix), plus apps or a developer who knows the system.',
					'Your store, checkout and customer data live on the platform; moving means rebuilding the theme and reconnecting the apps.',
					'A self-hosted system such as 1C-Bitrix leaves updates and security to you, and old versions get mass-hacked.'
				],
				wp: ['Everything is on you: hosting, updates, protection, backups (lesson 3).', 'The quality of the site depends on the themes and plugins you choose.', 'Links to payment and accounting services come as plugins of varying freshness.']
			} as Record<Id, string[]>,
			ownerT: 'the owner edits without technical skills',
			ownerW: 'an owner can manage the editor',
			ownerB: 'a store admin an owner can run',
			teamB: 'a team can run the store and its apps',
			teamW: 'a team can handle the upkeep and the plugins',
			lowT: 'a small budget: a quick start and a monthly plan',
			lowB: 'plans, apps and fees add up',
			lowW: 'a free core and cheap hosting',
			highB: 'the budget covers a plan with apps or a developer',
			highW: 'you can pay for customization',
			erpB: 'stock and orders must sync with accounting software: store platforms have apps and APIs for it (1C-Bitrix has a ready exchange with 1C)',
			erpT: 'builders don’t sync with accounting software directly',
			erpW: 'only through plugins',
			smallT: 'a simple store on the built-in checkout',
			smallW: 'a simple store with a plugin',
			smallB: 'the store comes in the box',
			bigB: 'a big store: catalog, stock, orders',
			bigW: 'a store on a plugin, but harder as it grows',
			bigT: 'a big catalog is cramped for blocks',
			customW: 'you need your own logic: plugins and code',
			customB: 'custom code is possible (apps, themes)',
			customT: 'there is no server logic of your own',
			neutral: 'neither for nor against',
			caption: 'Three paths for your project',
			intro: 'The rules are simplified, and the answer is a reason to talk, not a verdict.',
			budgetL: 'Budget',
			low: 'small',
			mid: 'medium',
			high: 'large',
			whoL: 'Who edits',
			owner: 'the owner alone',
			team: 'a team',
			shopL: 'Store',
			none: 'not needed',
			small: 'small',
			big: 'a big catalog',
			more: 'Also',
			erp: 'must link to accounting or stock software',
			custom: 'needs logic of its own',
			tie: 'A tie: the details of your project decide.',
			best: (n: string) => `The best fit: ${n}.`,
			limitsOf: (n: string) => `Typical limits of ${n}:`,
			alt: 'Text alternative:',
			altText: 'A website builder fits when the owner edits alone on a small budget. A store platform fits when you need a big store or a link to accounting software, and have a developer or can pay for apps. WordPress sits in the middle and wins when you need logic of your own. Each path has typical limits: for a builder it is the platform, for a store platform the price and the upkeep, for WordPress all the upkeep is on you.'
		}
	});

	const scored = $derived.by(() => {
		const s: Record<Id, { n: number; why: string[] }> = { tilda: { n: 0, why: [] }, bitrix: { n: 0, why: [] }, wp: { n: 0, why: [] } };
		const add = (id: Id, n: number, why: string) => {
			s[id].n += n;
			s[id].why.push(`${n > 0 ? '+' : ''}${n} ${why}`);
		};
		const en = getLocale() === 'en';
		if (who === 'owner') (add('tilda', 3, W.ownerT), add('wp', 1, W.ownerW), add('bitrix', en ? 1 : -1, W.ownerB));
		else (add('bitrix', en ? 1 : 2, W.teamB), add('wp', en ? 2 : 1, W.teamW));
		if (budget === 'low') (add('tilda', 2, W.lowT), add('bitrix', en ? -1 : -2, W.lowB), add('wp', 1, W.lowW));
		if (budget === 'high') (add('bitrix', 2, W.highB), add('wp', 1, W.highW));
		if (onec) (add('bitrix', en ? 3 : 4, W.erpB), add('tilda', -3, W.erpT), add('wp', -1, W.erpW));
		if (shop === 'small') (add('tilda', 1, W.smallT), add('wp', 1, W.smallW), add('bitrix', en ? 2 : 1, W.smallB));
		if (shop === 'big') (add('bitrix', 3, W.bigB), add('wp', 1, W.bigW), add('tilda', -2, W.bigT));
		if (custom) (add('wp', 2, W.customW), add('bitrix', 1, W.customB), add('tilda', -2, W.customT));
		return s;
	});
	const order = $derived((Object.keys(scored) as Id[]).sort((a, b) => scored[b].n - scored[a].n));
	const best = $derived(order[0]);
	const tie = $derived(scored[order[0]].n === scored[order[1]].n);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>
	<div class="ctl">
		<fieldset><legend>{W.budgetL}</legend>
			<label><input type="radio" bind:group={budget} value="low" /> {W.low}</label>
			<label><input type="radio" bind:group={budget} value="mid" /> {W.mid}</label>
			<label><input type="radio" bind:group={budget} value="high" /> {W.high}</label>
		</fieldset>
		<fieldset><legend>{W.whoL}</legend>
			<label><input type="radio" bind:group={who} value="owner" /> {W.owner}</label>
			<label><input type="radio" bind:group={who} value="team" /> {W.team}</label>
		</fieldset>
		<fieldset><legend>{W.shopL}</legend>
			<label><input type="radio" bind:group={shop} value="none" /> {W.none}</label>
			<label><input type="radio" bind:group={shop} value="small" /> {W.small}</label>
			<label><input type="radio" bind:group={shop} value="big" /> {W.big}</label>
		</fieldset>
		<fieldset><legend>{W.more}</legend>
			<label><input type="checkbox" bind:checked={onec} /> {W.erp}</label>
			<label><input type="checkbox" bind:checked={custom} /> {W.custom}</label>
		</fieldset>
	</div>
	<ol class="rank" aria-live="polite">
		{#each order as id, i (id)}
			<li class:top={i === 0}>
				<div class="h"><strong>{W.names[id]}</strong><span class="n">{scored[id].n}</span></div>
				<div class="dim">{scored[id].why.join('; ') || W.neutral}</div>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>{tie ? W.tie : W.best(W.names[best])}</strong> {W.limitsOf(W.names[best])}</p>
	<ul class="lim">
		{#each W.limits[best] as l, i (i)}<li>{l}</li>{/each}
	</ul>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.ctl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		display: grid;
		align-content: start;
	}
	legend {
		padding: 0;
		color: var(--text-primary);
	}
	.rank {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.rank li {
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.rank li.top {
		border-color: var(--accent-measure);
	}
	.h {
		display: flex;
		justify-content: space-between;
	}
	.n {
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.dim {
		color: var(--text-secondary);
	}
	.lim {
		margin: 0 0 var(--space-3);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
