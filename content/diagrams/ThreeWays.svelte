<!--
	«Три пути: Tilda, Битрикс, WordPress» (part 8, lesson 4). Four questions about the person's
	project (budget, 1С, who edits, a shop) and the typical limits of each path. A few simple rules
	add points to each path and show their reasons; the rules are the lesson's simplification, not a
	benchmark, and the answer is a starting point for a conversation, not a verdict.
-->
<script lang="ts">
	import './shared.css';

	type Id = 'tilda' | 'bitrix' | 'wp';
	let budget = $state<'low' | 'mid' | 'high'>('low');
	let onec = $state(false);
	let who = $state<'owner' | 'team'>('owner');
	let shop = $state<'none' | 'small' | 'big'>('none');
	let custom = $state(false);

	const names: Record<Id, string> = { tilda: 'Tilda', bitrix: '1С-Битрикс', wp: 'WordPress' };
	const limits: Record<Id, string[]> = {
		tilda: ['Сайт живёт на платформе; выйти можно, но экспорт кода зависит от тарифа, а формы и корзина работают через её сервисы.', 'Серверной логики своей не напишешь: только то, что платформа позволяет.', 'Подписка платится, пока сайт нужен.'],
		bitrix: ['Лицензия платная, и нужны хостинг и разработчик, который знает систему.', 'Обновления и защита на вас: у старых версий бывают массовые взломы.', 'Интеграция с 1С это отдельная работа, а не кнопка.'],
		wp: ['Всё на вас: хостинг, обновления, защита, копии (урок 3).', 'Качество сайта зависит от выбранных тем и плагинов.', 'Интеграции с российскими сервисами идут плагинами разной свежести.']
	};
	const scored = $derived.by(() => {
		const s: Record<Id, { n: number; why: string[] }> = { tilda: { n: 0, why: [] }, bitrix: { n: 0, why: [] }, wp: { n: 0, why: [] } };
		const add = (id: Id, n: number, why: string) => {
			s[id].n += n;
			s[id].why.push(`${n > 0 ? '+' : ''}${n} ${why}`);
		};
		if (who === 'owner') (add('tilda', 3, 'правит сам владелец без технических знаний'), add('wp', 1, 'владелец справится с редактором'), add('bitrix', -1, 'без разработчика Битрикс не потянуть'));
		else (add('bitrix', 2, 'правит и обслуживает команда'), add('wp', 1, 'команда справится с обслуживанием'));
		if (budget === 'low') (add('tilda', 2, 'небольшой бюджет: быстрый старт и подписка'), add('bitrix', -2, 'лицензия и разработчик дороги'), add('wp', 1, 'бесплатное ядро и недорогой хостинг'));
		if (budget === 'high') (add('bitrix', 2, 'бюджет позволяет лицензию и разработчика'), add('wp', 1, 'можно заказать доработку'));
		if (onec) (add('bitrix', 4, 'нужен обмен с 1С: у Битрикса он готов'), add('tilda', -3, 'с 1С Tilda напрямую не дружит'), add('wp', -1, 'с 1С только плагинами'));
		if (shop === 'small') (add('tilda', 1, 'простой магазин на встроенной корзине'), add('wp', 1, 'простой магазин плагином'), add('bitrix', 1, 'магазин в комплекте'));
		if (shop === 'big') (add('bitrix', 3, 'большой магазин: каталог, склады, заказы'), add('wp', 1, 'магазин на плагине, но с ростом сложнее'), add('tilda', -2, 'большой каталог тесен для блоков'));
		if (custom) (add('wp', 2, 'нужна своя логика: плагины и код'), add('bitrix', 1, 'свой код возможен'), add('tilda', -2, 'своей серверной логики нет'));
		return s;
	});
	const order = $derived((Object.keys(scored) as Id[]).sort((a, b) => scored[b].n - scored[a].n));
	const best = $derived(order[0]);
	const tie = $derived(scored[order[0]].n === scored[order[1]].n);
</script>

<figure class="dg">
	<figcaption>Три пути для вашего проекта</figcaption>
	<p class="dg-out">Правила упрощены, и ответ это повод для разговора, а не приговор.</p>
	<div class="ctl">
		<fieldset><legend>Бюджет</legend>
			<label><input type="radio" bind:group={budget} value="low" /> небольшой</label>
			<label><input type="radio" bind:group={budget} value="mid" /> средний</label>
			<label><input type="radio" bind:group={budget} value="high" /> большой</label>
		</fieldset>
		<fieldset><legend>Кто правит</legend>
			<label><input type="radio" bind:group={who} value="owner" /> владелец сам</label>
			<label><input type="radio" bind:group={who} value="team" /> команда</label>
		</fieldset>
		<fieldset><legend>Магазин</legend>
			<label><input type="radio" bind:group={shop} value="none" /> не нужен</label>
			<label><input type="radio" bind:group={shop} value="small" /> небольшой</label>
			<label><input type="radio" bind:group={shop} value="big" /> большой каталог</label>
		</fieldset>
		<fieldset><legend>Ещё</legend>
			<label><input type="checkbox" bind:checked={onec} /> нужна интеграция с 1С</label>
			<label><input type="checkbox" bind:checked={custom} /> нужна своя логика</label>
		</fieldset>
	</div>
	<ol class="rank" aria-live="polite">
		{#each order as id, i (id)}
			<li class:top={i === 0}>
				<div class="h"><strong>{names[id]}</strong><span class="n">{scored[id].n}</span></div>
				<div class="dim">{scored[id].why.join('; ') || 'ни за, ни против'}</div>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>{tie ? 'Ничья: решают детали вашего проекта.' : `Сильнее всего подходит: ${names[best]}.`}</strong> Типичные ограничения {names[best]}:</p>
	<ul class="lim">
		{#each limits[best] as l, i (i)}<li>{l}</li>{/each}
	</ul>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> Tilda подходит, когда сайт правит сам владелец при небольшом бюджете. 1С-Битрикс подходит, когда нужны интеграция с 1С, большой магазин и есть разработчик. WordPress занимает середину и выигрывает, когда нужна своя логика. У каждого пути есть типичные ограничения: у Tilda платформа, у Битрикса цена и обслуживание, у WordPress всё обслуживание на вас.</p>
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
