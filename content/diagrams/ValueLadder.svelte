<!--
	«Лестница ценности» (part 11, lesson 10). Five rungs of a made-up bicycle workshop: a free
	lead magnet, a small first paid offer, the core offer, an upsell and a downsell. The person sets
	a price on each rung and the share of people who climb to the next, and sees how many arrive
	and what a visitor brings in. Under each rung sit the pressure tricks that go with it: tick one
	and the page names it, gives the honest version and the rule it comes near. The model counts
	money only, on purpose: what a trick costs in trust has no honest number.
-->
<script lang="ts">
	import './shared.css';

	type Rung = { id: string; name: string; what: string; price: number; climb: number };
	let rungs = $state<Rung[]>([
		{ id: 'lead', name: 'Лид-магнит', what: 'Чек-лист «Как подготовить велосипед к сезону» за почту', price: 0, climb: 12 },
		{ id: 'trip', name: 'Недорогое первое предложение (tripwire)', what: 'Осмотр велосипеда с письменным заключением', price: 300, climb: 30 },
		{ id: 'core', name: 'Основное предложение', what: 'Полное ТО с заменой расходников', price: 2500, climb: 25 },
		{ id: 'up', name: 'Допродажа (upsell)', what: 'Сезонное хранение и антикоррозийная обработка рамы', price: 1200, climb: 100 },
		{ id: 'down', name: 'Облегчённый вариант (downsell)', what: 'Регулировка и смазка без замены деталей', price: 900, climb: 100 }
	]);
	const visitors = 1000;
	// lead -> trip -> core; upsell is offered to those who bought the core; downsell to those who declined it
	const lead = $derived(Math.round(visitors * (rungs[0].climb / 100)));
	const trip = $derived(Math.round(lead * (rungs[1].climb / 100)));
	const core = $derived(Math.round(trip * (rungs[2].climb / 100)));
	const declined = $derived(trip - core);
	const upBuyers = $derived(Math.round(core * 0.3));
	const downBuyers = $derived(Math.round(declined * 0.2));
	const buyers = $derived([lead, trip, core, upBuyers, downBuyers]);
	const money = $derived(buyers.map((b, i) => b * rungs[i].price));
	const total = $derived(money.reduce((a, b) => a + b, 0));

	type Trick = { id: string; rung: string; name: string; honest: string; law: string };
	const tricks: Trick[] = [
		{ id: 't1', rung: 'lead', name: 'За чек-лист просят телефон и адрес', honest: 'Только то, что нужно для доставки материала: почта. Остальное спрашивайте потом и отдельно.', law: 'Объём данных должен соответствовать цели обработки (152-ФЗ, статья 5).' },
		{ id: 't2', rung: 'lead', name: 'Согласие на рассылку вшито в получение материала', honest: 'Две отдельные галочки: на обработку данных для доставки материала и на рассылку. Материал приходит и без второй.', law: 'Согласие на рекламу по почте должно быть предварительным и отдельным (38-ФЗ, статья 18); согласие свободное (152-ФЗ, статья 9).' },
		{ id: 't3', rung: 'trip', name: 'Недорогое предложение оказывается подпиской с автопродлением', honest: 'Цена и условия продления рядом с кнопкой, крупно; напоминание перед списанием.', law: 'Полная и достоверная информация о цене и условиях (закон о защите прав потребителей, статья 10).' },
		{ id: 't4', rung: 'trip', name: 'Перечёркнутая «старая цена», по которой никогда не продавали', honest: 'Показывать только цену, по которой действительно продавали, или не показывать скидку.', law: 'Недостоверные сведения о цене и скидках (38-ФЗ, статья 5).' },
		{ id: 't5', rung: 'core', name: 'Цена скрыта до заявки, а на странице «договорная»', honest: 'Назвать цену или диапазон и от чего она зависит.', law: 'Информация о цене обязательна (закон о защите прав потребителей, статья 10).' },
		{ id: 't6', rung: 'core', name: 'Обратный отсчёт до «конца акции», который начинается заново', honest: 'Назвать настоящий срок и причину или не называть срока.', law: 'Недостоверные сведения об условиях (38-ФЗ, статья 5).' },
		{ id: 't7', rung: 'up', name: 'Платное дополнение уже добавлено в заказ', honest: 'Дополнение предлагается отдельно, галочка пуста, цена видна.', law: 'Нельзя выполнять платные дополнительные услуги без согласия (закон о защите прав потребителей, статья 16).' },
		{ id: 't8', rung: 'up', name: 'Предложение «только сейчас и никогда больше», хотя вернётся завтра', honest: 'Сказать правду: «можно добавить позже по той же цене» или назвать настоящий срок.', law: 'Недостоверные сведения об условиях (38-ФЗ, статья 5).' },
		{ id: 't9', rung: 'down', name: 'Облегчённый вариант показан только тем, кто отказался, и после упрёка', honest: 'Облегчённый вариант виден сразу рядом с основным, без упрёков, как ещё один честный выбор.', law: 'Прямого запрета нет; это манипуляция выбором (см. урок о тёмных паттернах).' }
	];
	let on = $state<Record<string, boolean>>(Object.fromEntries(tricks.map((t) => [t.id, false])));
	const flagged = $derived(tricks.filter((t) => on[t.id]));
	const rungName = (id: string) => rungs.find((r) => r.id === id)?.name ?? id;
	const fmt = (n: number) => n.toLocaleString('ru-RU');
</script>

<figure class="dg">
	<figcaption>Лестница ценности: пять ступеней</figcaption>
	<ol class="ladder">
		{#each rungs as r, i (r.id)}
			<li style="margin-left: {i * 0.6}rem">
				<p class="n"><strong>{i + 1}. {r.name}</strong>: {r.what}</p>
				<div class="ctl">
					<label>Цена, ₽: <input type="number" min="0" step="50" bind:value={r.price} /></label>
					{#if i < 3}
						<label>Дойдут до следующей ступени: <strong>{r.climb}%</strong> <input type="range" min="1" max="100" step="1" bind:value={r.climb} aria-label="Доля, которая поднимется выше с ступени {r.name}" /></label>
					{/if}
				</div>
				<p class="res">Взяли: <strong>{buyers[i]}</strong> из {visitors} посетителей. Принесли: <strong>{fmt(money[i])} ₽</strong>.</p>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">Всего на 1000 посетителей: <strong>{fmt(total)} ₽</strong>, то есть <strong>{fmt(Math.round(total / visitors))} ₽</strong> на посетителя. Допродажу берёт часть купивших основное, облегчённый вариант часть отказавшихся (доли в модели условные).</p>

	<div class="dh">Что может подпортить каждую ступень</div>
	<p class="dg-out">Отметьте приём, и страница назовёт честную замену и норму закона. Деньги модель не меняет намеренно: что эти приёмы стоят доверия, посчитать честно нельзя.</p>
	<ul class="tricks">
		{#each tricks as t (t.id)}
			<li><label class="tk"><input type="checkbox" bind:checked={on[t.id]} /> <span><strong>{rungName(t.rung)}:</strong> {t.name}</span></label></li>
		{/each}
	</ul>
	<div class="flags" aria-live="polite">
		{#if flagged.length === 0}
			<p class="dg-out">Ни одного приёма не отмечено: так и надо, но проверьте свою лестницу по списку.</p>
		{/if}
		{#each flagged as t (t.id)}
			<div class="flag">
				<p><strong>Тёмный паттерн:</strong> {t.name}</p>
				<p><strong>Честная версия.</strong> {t.honest}</p>
				<p><strong>Рядом с законом.</strong> {t.law}</p>
			</div>
		{/each}
	</div>
</figure>

<style>
	.ladder {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0 0 var(--space-4);
	}
	.ladder li {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-2);
	}
	.ladder p {
		margin: 0;
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: center;
	}
	input[type='number'] {
		width: 6rem;
		padding: var(--space-1) var(--space-2);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.tricks {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
		margin: 0 0 var(--space-3);
	}
	.tk {
		display: flex;
		gap: var(--space-2);
		align-items: flex-start;
	}
	.flag {
		padding: var(--space-3);
		border-left: 3px solid #d9534f;
		background: var(--surface-canvas);
		margin-bottom: var(--space-3);
	}
	.flag p {
		margin: 0 0 var(--space-1);
	}
</style>
