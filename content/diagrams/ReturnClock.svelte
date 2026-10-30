<!--
	«Часы возврата» (part 15, lesson 12). A distance purchase or a paid service: the person sets the
	dates (delivery and the day of the request) and three facts (goods or service; whether the seller gave the return
	procedure in writing at delivery; whether the goods were made to the buyer's own specification),
	and the diagram says until when the buyer may withdraw and what the seller owes. The periods are
	those of article 26.1 and article 32 of the Law on Consumer Protection as the lesson reads them on
	28.10.2026 (7 days, 3 months, 10 days for the refund; a service at any time, paying real
	expenses). A teaching calculator, not legal advice.

	Bilingual (docs/content-plan/README.md, «English edition»): the English edition does not translate Russia's
	periods but teaches the UK/EU 14-day right to cancel (Consumer Contracts Regulations 2013; Consumer Rights
	Directive 2011/83/EU) and the US position, where there is no general right and the seller's policy decides.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	/** True in the English edition, which has its own rules to teach. */
	const EN = pick({ ru: false, en: true });

	type Kind = 'goods' | 'service';
	let kind = $state<Kind>('goods');
	let delivered = $state('2026-11-06');
	let informed = $state(true);
	let custom = $state(false);
	let requestDay = $state('2026-11-10');
	type Region = 'eu' | 'us';
	let region = $state<Region>('eu');
	let policyDays = $state(30);

	const fmt = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
	const add = (s: string, days: number, months = 0) => {
		const d = new Date(s + 'T12:00:00');
		d.setMonth(d.getMonth() + months);
		d.setDate(d.getDate() + days);
		return d;
	};

	const result = $derived.by(() => {
		if (kind === 'service') {
			return {
				lines: ['Покупатель вправе отказаться от услуги в любое время.', 'Он оплачивает исполнителю фактически понесённые им расходы (статья 32 закона «О защите прав потребителей»).', 'Условие договора, лишающее этого права или требующее штраф за отказ, ущемляет права потребителя и недействительно (статья 16).'],
				ok: true
			};
		}
		if (custom) {
			return { lines: ['Товар изготовлен по индивидуальному заказу (с индивидуально-определёнными свойствами): вернуть его только из-за того, что «передумал», нельзя (статья 26.1, пункт 4).', 'Если товар ненадлежащего качества, права покупателя сохраняются.'], ok: false };
		}
		const limit = informed ? add(delivered, 7) : add(delivered, 0, 3);
		const refund = add(requestDay, 10);
		const inTime = new Date(requestDay + 'T12:00:00') <= limit;
		return {
			lines: [
				'До получения товара отказаться можно в любое время, оплатив продавцу только фактические расходы на доставку.',
				informed ? `После получения: семь дней, то есть до ${fmt(limit)} включительно.` : `Письменной информации о порядке и сроках возврата при доставке не было: срок три месяца, до ${fmt(limit)}.`,
				inTime ? `Требование от ${fmt(new Date(requestDay + 'T12:00:00'))} подано вовремя. Продавец возвращает деньги не позднее ${fmt(refund)} (десять дней со дня требования), кроме стоимости доставки до покупателя.` : `Требование от ${fmt(new Date(requestDay + 'T12:00:00'))} подано после срока: отказаться по этому основанию уже нельзя (права при ненадлежащем качестве остаются).`,
				'Некоторые товары надлежащего качества возврату не подлежат: перечень утверждает Правительство.'
			],
			ok: inTime
		};
	});

	const fmtEn = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
	const at = (s: string) => new Date(s + 'T12:00:00');
	const resultEn = $derived.by((): { lines: string[]; ok: boolean } => {
		if (region === 'eu') {
			if (kind === 'service') {
				const end = add(delivered, 14);
				return {
					lines: [
						`The cancellation period for a service ends 14 days after the day the contract is made: until ${fmtEn(end)} (UK Consumer Contracts Regulations 2013, regulation 30; EU Consumer Rights Directive, Article 9).`,
						'If the customer asked for the service to start within that period, they pay a proportionate amount for what was done before they canceled.',
						'If the service is fully performed within the period after the customer expressly agreed to that and acknowledged losing the right, the right to cancel is lost.',
						'If the trader did not give the right-to-cancel information, the period is extended by up to 12 months.'
					],
					ok: true
				};
			}
			if (custom) {
				return {
					lines: ['Goods made to the buyer’s specification or clearly personalized are exempt from the 14-day right to cancel (UK regulation 28; EU Article 16).', 'If the goods are faulty or not as described, the buyer’s rights under the Consumer Rights Act 2015 or the EU guarantee rules remain.'],
					ok: false
				};
			}
			const first = add(delivered, 14);
			const limit = informed ? first : add(first.toISOString().slice(0, 10), 0, 12);
			const inTime = at(requestDay) <= limit;
			return {
				lines: [
					'Before the goods arrive, the buyer may cancel at any time after the order.',
					informed ? `After they arrive: 14 days, that is, until ${fmtEn(limit)} inclusive.` : `The trader did not give the right-to-cancel information: the period is extended by 12 months, until ${fmtEn(limit)} (UK regulation 31; EU Article 10).`,
					inTime ? `A cancellation on ${fmtEn(at(requestDay))} is in time. The trader refunds without undue delay and within 14 days of getting the goods back (or proof they were sent), including the standard delivery cost.` : `A cancellation on ${fmtEn(at(requestDay))} comes after the period: the right to cancel has ended (rights for faulty goods remain).`,
					'The buyer usually pays the cost of returning the goods if the trader told them so before the purchase.'
				],
				ok: inTime
			};
		}
		if (kind === 'service') {
			return {
				lines: [
					'There is no general US right to cancel a paid service. The contract you offered decides, so state the cancellation and refund terms before the person pays.',
					'Sales made at the buyer’s home or another off-premises place get a 3-business-day right to cancel under the FTC Cooling-Off Rule (16 CFR Part 429), which does not cover ordinary online orders.',
					'A subscription or free trial is different: the Restore Online Shoppers’ Confidence Act (ROSCA) requires clear terms before billing, express consent, and a simple way to stop recurring charges, and many states have auto-renewal laws.'
				],
				ok: true
			};
		}
		if (custom) {
			return { lines: ['Custom and personalized goods are usually final sale under the seller’s published policy. Say so before the purchase.', 'If the goods are defective or not as described, implied warranties and the seller’s promises apply whatever the policy says.'], ok: false };
		}
		const limit = add(delivered, policyDays);
		const inTime = at(requestDay) <= limit;
		return {
			lines: [
				'There is no general US right to cancel or return an online purchase. The seller’s published return policy decides.',
				informed ? `This seller’s policy gives ${policyDays} days from receipt: until ${fmtEn(limit)}.` : 'No return policy was shown before the purchase. Some states, for example California, require a policy to be posted and give the buyer a default window if it is not, so check the state’s law.',
				informed ? (inTime ? `A request on ${fmtEn(at(requestDay))} is within the policy.` : `A request on ${fmtEn(at(requestDay))} comes after the policy window: the seller may refuse, unless the goods are defective.`) : 'Without a policy, expect disputes, card chargebacks and complaints to the state attorney general.',
				'If the goods are defective or not as described, implied warranties and the seller’s promises apply whatever the policy says.',
				'Shipping: the FTC’s Mail, Internet, or Telephone Order Merchandise Rule (16 CFR Part 435) requires you to ship within the time you state or, if you state none, within 30 days, and to offer a prompt refund if you cannot.'
			],
			ok: informed ? inTime : false
		};
	});
</script>

{#if EN}
<figure class="dg">
	<figcaption>The return clock: until which day a buyer may cancel</figcaption>
	<p class="dg-out">Choose the place, the kind of purchase and the dates. The periods are a teaching reading of the UK Consumer Contracts Regulations 2013, the EU Consumer Rights Directive and the US position as of 30 October 2026; not legal advice.</p>

	<div class="dg-ctl" role="radiogroup" aria-label="Where the buyer is">
		<button type="button" role="radio" aria-checked={region === 'eu'} class:on={region === 'eu'} onclick={() => (region = 'eu')}>UK or EU buyer</button>
		<button type="button" role="radio" aria-checked={region === 'us'} class:on={region === 'us'} onclick={() => (region = 'us')}>US buyer</button>
	</div>
	<div class="dg-ctl" role="radiogroup" aria-label="Kind of purchase">
		<button type="button" role="radio" aria-checked={kind === 'goods'} class:on={kind === 'goods'} onclick={() => (kind = 'goods')}>Goods bought on the site</button>
		<button type="button" role="radio" aria-checked={kind === 'service'} class:on={kind === 'service'} onclick={() => (kind = 'service')}>Paid service</button>
	</div>

	{#if kind === 'goods'}
		<div class="grid">
			<label>Date received <input type="date" bind:value={delivered} /></label>
			<label>Date of the cancellation or return request <input type="date" bind:value={requestDay} /></label>
			{#if region === 'us'}<label>Days the seller’s policy allows <input type="number" min="0" max="365" bind:value={policyDays} /></label>{/if}
		</div>
		<label class="chk"><input type="checkbox" bind:checked={informed} /> {region === 'eu' ? 'The trader told the buyer about the right to cancel before the purchase' : 'The return policy was shown before the purchase'}</label>
		<label class="chk"><input type="checkbox" bind:checked={custom} /> The goods were made to the buyer’s own specification</label>
	{:else}
		<div class="grid">
			<label>Date the contract is made <input type="date" bind:value={delivered} /></label>
		</div>
	{/if}

	<ul class="res" aria-live="polite">
		{#each resultEn.lines as l (l)}<li>{l}</li>{/each}
	</ul>
	<p class="dg-out alt"><strong>Text alternative:</strong> a calculator of cancellation periods. In the UK and EU a buyer who orders online may cancel within 14 days of receiving the goods (or 14 days from the contract for a service), extended by up to 12 months if the trader did not give the information, and the trader refunds within 14 days of getting the goods back; custom goods are exempt. In the US there is no general right to cancel an online purchase: the seller’s published policy decides, defective goods carry implied warranties, shipping must follow the FTC’s mail-order rule, and subscriptions are covered by ROSCA.</p>
</figure>
{:else}
<figure class="dg">
	<figcaption>Часы возврата: до какого дня можно отказаться</figcaption>
	<p class="dg-out">Выберите вид покупки и даты. Сроки взяты из закона «О защите прав потребителей» в учебном прочтении на 28 октября 2026 года; не консультация.</p>

	<div class="dg-ctl" role="radiogroup" aria-label="Вид покупки">
		<button type="button" role="radio" aria-checked={kind === 'goods'} class:on={kind === 'goods'} onclick={() => (kind = 'goods')}>Товар через сайт</button>
		<button type="button" role="radio" aria-checked={kind === 'service'} class:on={kind === 'service'} onclick={() => (kind = 'service')}>Платная услуга</button>
	</div>

	{#if kind === 'goods'}
		<div class="grid">
			<label>Дата получения <input type="date" bind:value={delivered} /></label>
			<label>Дата требования о возврате <input type="date" bind:value={requestDay} /></label>
		</div>
		<label class="chk"><input type="checkbox" bind:checked={informed} /> При получении продавец письменно сообщил порядок и сроки возврата</label>
		<label class="chk"><input type="checkbox" bind:checked={custom} /> Товар изготовлен по индивидуальным размерам или заказу покупателя</label>
	{/if}

	<ul class="res" aria-live="polite">
		{#each result.lines as l (l)}<li>{l}</li>{/each}
	</ul>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> калькулятор сроков. Товар, купленный через сайт, можно вернуть до получения в любое время, после получения в течение семи дней, а если продавец не дал письменную информацию о возврате, то в течение трёх месяцев; деньги возвращают в течение десяти дней со дня требования. Товар по индивидуальному заказу вернуть нельзя. От платной услуги можно отказаться в любое время, оплатив фактические расходы исполнителя.</p>
</figure>
{/if}

<style>
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}
	.grid label {
		display: grid;
		gap: var(--space-1);
	}
	.grid input {
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: none;
		color: var(--text-body);
	}
	.chk {
		display: flex;
	}
	.res {
		margin: var(--space-3) 0 0;
		padding-left: var(--space-5) !important;
		display: grid;
		gap: var(--space-2);
	}
</style>
