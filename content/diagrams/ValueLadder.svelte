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
	import { pick } from '#lib/i18n/index.ts';

	type Rung = { id: string; name: string; what: string; price: number; climb: number };
	type Trick = { id: string; rung: string; name: string; honest: string; law: string };
	const W = pick({
		ru: {
			rungs: [
				{ id: 'lead', name: 'Лид-магнит', what: 'Чек-лист «Как подготовить велосипед к сезону» за почту', price: 0, climb: 12 },
				{ id: 'trip', name: 'Недорогое первое предложение (tripwire)', what: 'Осмотр велосипеда с письменным заключением', price: 300, climb: 30 },
				{ id: 'core', name: 'Основное предложение', what: 'Полное ТО с заменой расходников', price: 2500, climb: 25 },
				{ id: 'up', name: 'Допродажа (upsell)', what: 'Сезонное хранение и антикоррозийная обработка рамы', price: 1200, climb: 100 },
				{ id: 'down', name: 'Облегчённый вариант (downsell)', what: 'Регулировка и смазка без замены деталей', price: 900, climb: 100 }
			] as Rung[],
			tricks: [
				{ id: 't1', rung: 'lead', name: 'За чек-лист просят телефон и адрес', honest: 'Только то, что нужно для доставки материала: почта. Остальное спрашивайте потом и отдельно.', law: 'Объём данных должен соответствовать цели обработки (152-ФЗ, статья 5).' },
				{ id: 't2', rung: 'lead', name: 'Согласие на рассылку вшито в получение материала', honest: 'Две отдельные галочки: на обработку данных для доставки материала и на рассылку. Материал приходит и без второй.', law: 'Согласие на рекламу по почте должно быть предварительным и отдельным (38-ФЗ, статья 18); согласие свободное (152-ФЗ, статья 9).' },
				{ id: 't3', rung: 'trip', name: 'Недорогое предложение оказывается подпиской с автопродлением', honest: 'Цена и условия продления рядом с кнопкой, крупно; напоминание перед списанием.', law: 'Полная и достоверная информация о цене и условиях (закон о защите прав потребителей, статья 10).' },
				{ id: 't4', rung: 'trip', name: 'Перечёркнутая «старая цена», по которой никогда не продавали', honest: 'Показывать только цену, по которой действительно продавали, или не показывать скидку.', law: 'Недостоверные сведения о цене и скидках (38-ФЗ, статья 5).' },
				{ id: 't5', rung: 'core', name: 'Цена скрыта до заявки, а на странице «договорная»', honest: 'Назвать цену или диапазон и от чего она зависит.', law: 'Информация о цене обязательна (закон о защите прав потребителей, статья 10).' },
				{ id: 't6', rung: 'core', name: 'Обратный отсчёт до «конца акции», который начинается заново', honest: 'Назвать настоящий срок и причину или не называть срока.', law: 'Недостоверные сведения об условиях (38-ФЗ, статья 5).' },
				{ id: 't7', rung: 'up', name: 'Платное дополнение уже добавлено в заказ', honest: 'Дополнение предлагается отдельно, галочка пуста, цена видна.', law: 'Нельзя выполнять платные дополнительные услуги без согласия (закон о защите прав потребителей, статья 16).' },
				{ id: 't8', rung: 'up', name: 'Предложение «только сейчас и никогда больше», хотя вернётся завтра', honest: 'Сказать правду: «можно добавить позже по той же цене» или назвать настоящий срок.', law: 'Недостоверные сведения об условиях (38-ФЗ, статья 5).' },
				{ id: 't9', rung: 'down', name: 'Облегчённый вариант показан только тем, кто отказался, и после упрёка', honest: 'Облегчённый вариант виден сразу рядом с основным, без упрёков, как ещё один честный выбор.', law: 'Прямого запрета нет; это манипуляция выбором (см. урок о тёмных паттернах).' }
			] as Trick[],
			currency: '₽',
			locale: 'ru-RU',
			caption: 'Лестница ценности: пять ступеней',
			price: 'Цена, ₽:',
			next: 'Дойдут до следующей ступени:',
			aria: (n: string) => `Доля, которая поднимется выше с ступени ${n}`,
			took: 'Взяли:',
			of: 'из',
			visitorsWord: 'посетителей.',
			brought: 'Принесли:',
			total: 'Всего на 1000 посетителей:',
			perVisitor: 'то есть',
			perWord: 'на посетителя.',
			shares: 'Допродажу берёт часть купивших основное, облегчённый вариант часть отказавшихся (доли в модели условные).',
			spoil: 'Что может подпортить каждую ступень',
			spoilNote: 'Отметьте приём, и страница назовёт честную замену и норму закона. Деньги модель не меняет намеренно: что эти приёмы стоят доверия, посчитать честно нельзя.',
			none: 'Ни одного приёма не отмечено: так и надо, но проверьте свою лестницу по списку.',
			dark: 'Тёмный паттерн:',
			honest: 'Честная версия.',
			lawLabel: 'Рядом с законом.'
		},
		en: {
			rungs: [
				{ id: 'lead', name: 'Lead magnet', what: 'A checklist, “Getting your bike ready for the season”, for an email address', price: 0, climb: 12 },
				{ id: 'trip', name: 'A low-priced first offer (tripwire)', what: 'A bike inspection with a written report', price: 15, climb: 30 },
				{ id: 'core', name: 'The core offer', what: 'A full service with new parts where needed', price: 90, climb: 25 },
				{ id: 'up', name: 'Upsell', what: 'Seasonal storage and rust protection for the frame', price: 45, climb: 100 },
				{ id: 'down', name: 'Downsell', what: 'Adjustment and lubrication without replacing parts', price: 30, climb: 100 }
			] as Rung[],
			tricks: [
				{ id: 't1', rung: 'lead', name: 'A phone number and an address are asked for a checklist', honest: 'Only what is needed to deliver the material: an email address. Ask the rest later and separately.', law: 'Data minimization: only what the purpose needs (GDPR and UK GDPR Article 5(1)(c)); California’s regulations also require collection to be reasonably necessary.' },
				{ id: 't2', rung: 'lead', name: 'Consent to a newsletter is built into receiving the material', honest: 'Two separate boxes: one for the data needed to deliver the material and one for the newsletter. The material arrives without the second.', law: 'Consent must not be a condition of a service where it isn’t needed (GDPR Article 7(4)); in the UK, PECR requires opt-in for most marketing email to individuals; in the US, CAN-SPAM requires a working opt-out.' },
				{ id: 't3', rung: 'trip', name: 'The low-priced offer turns out to be a subscription that renews automatically', honest: 'The price and the renewal terms beside the button, in large type; a reminder before the charge.', law: 'ROSCA and state auto-renewal laws in the US require clear disclosure and consent; the EU Consumer Rights Directive requires the price and duration to be clear before ordering.' },
				{ id: 't4', rung: 'trip', name: 'A struck-through “was” price at which it was never sold', honest: 'Show only a price at which it really sold, or show no discount.', law: 'A fake “former price” is deceptive (the FTC’s Guides Against Deceptive Pricing, 16 CFR Part 233; the UK pricing guidance); in the EU a prior price must be the lowest in the 30 days before the discount.' },
				{ id: 't5', rung: 'core', name: 'The price is hidden until the request, and the page says “by arrangement”', honest: 'State the price or a range, and what it depends on.', law: 'A material price left out is a misleading omission (the UCPD in the EU, the CAP Code in the UK, Section 5 of the FTC Act in the US).' },
				{ id: 't6', rung: 'core', name: 'A countdown to the “end of the offer” that starts again', honest: 'State a real deadline and the reason, or state no deadline.', law: 'A false statement about the terms of an offer: deceptive under the FTC Act; on the EU’s list of banned practices; required to be true by the CAP Code.' },
				{ id: 't7', rung: 'up', name: 'A paid extra is already added to the order', honest: 'The extra is offered separately, the box is empty, the price is visible.', law: 'Extra payments need express consent; defaults the customer must reject are barred (EU Consumer Rights Directive Article 22; UK Consumer Contracts Regulations 2013, regulation 40).' },
				{ id: 't8', rung: 'up', name: 'An “only now and never again” offer that comes back tomorrow', honest: 'Tell the truth: “you can add it later at the same price”, or state the real deadline.', law: 'A false statement about the terms of an offer (see the countdown above).' },
				{ id: 't9', rung: 'down', name: 'The lighter option is shown only to those who declined, and after a reproach', honest: 'The lighter option is visible at once beside the main one, with no reproach, as one more honest choice.', law: 'There is no direct ban; it manipulates the choice (see the lesson on dark patterns).' }
			] as Trick[],
			currency: '$',
			locale: 'en-US',
			caption: 'The value ladder: five rungs',
			price: 'Price, $:',
			next: 'Go on to the next rung:',
			aria: (n: string) => `The share that climbs higher from the rung ${n}`,
			took: 'Took it:',
			of: 'of',
			visitorsWord: 'visitors.',
			brought: 'Brought in:',
			total: 'In all, per 1,000 visitors:',
			perVisitor: 'that is',
			perWord: 'per visitor.',
			shares: 'The upsell is taken by part of those who bought the core offer, and the downsell by part of those who declined it (the shares in the model are arbitrary).',
			spoil: 'What can spoil each rung',
			spoilNote: 'Check a technique, and the page names the honest replacement and the rule of law. The model leaves the money alone on purpose: what these techniques cost in trust can’t be counted honestly.',
			none: 'No technique checked: as it should be, but check your own ladder against the list.',
			dark: 'A dark pattern:',
			honest: 'The honest version.',
			lawLabel: 'Near the law.'
		}
	});
	let rungs = $state<Rung[]>(W.rungs.map((r) => ({ ...r })));
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

	const tricks = W.tricks;
	let on = $state<Record<string, boolean>>(Object.fromEntries(tricks.map((t) => [t.id, false])));
	const flagged = $derived(tricks.filter((t) => on[t.id]));
	const rungName = (id: string) => rungs.find((r) => r.id === id)?.name ?? id;
	const fmt = (n: number) => n.toLocaleString(W.locale);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<ol class="ladder">
		{#each rungs as r, i (r.id)}
			<li style="margin-left: {i * 0.6}rem">
				<p class="n"><strong>{i + 1}. {r.name}</strong>: {r.what}</p>
				<div class="ctl">
					<label>{W.price} <input type="number" min="0" step="50" bind:value={r.price} /></label>
					{#if i < 3}
						<label>{W.next} <strong>{r.climb}%</strong> <input type="range" min="1" max="100" step="1" bind:value={r.climb} aria-label={W.aria(r.name)} /></label>
					{/if}
				</div>
				<p class="res">{W.took} <strong>{buyers[i]}</strong> {W.of} {visitors} {W.visitorsWord} {W.brought} <strong>{fmt(money[i])} {W.currency}</strong>.</p>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">{W.total} <strong>{fmt(total)} {W.currency}</strong>, {W.perVisitor} <strong>{fmt(Math.round(total / visitors))} {W.currency}</strong> {W.perWord} {W.shares}</p>

	<div class="dh">{W.spoil}</div>
	<p class="dg-out">{W.spoilNote}</p>
	<ul class="tricks">
		{#each tricks as t (t.id)}
			<li><label class="tk"><input type="checkbox" bind:checked={on[t.id]} /> <span><strong>{rungName(t.rung)}:</strong> {t.name}</span></label></li>
		{/each}
	</ul>
	<div class="flags" aria-live="polite">
		{#if flagged.length === 0}
			<p class="dg-out">{W.none}</p>
		{/if}
		{#each flagged as t (t.id)}
			<div class="flag">
				<p><strong>{W.dark}</strong> {t.name}</p>
				<p><strong>{W.honest}</strong> {t.honest}</p>
				<p><strong>{W.lawLabel}</strong> {t.law}</p>
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
