<!--
	«Часы возврата» (part 15, lesson 12). A distance purchase or a paid service: the person sets the
	dates (order, delivery) and three facts (goods or service; whether the seller gave the return
	procedure in writing at delivery; whether the goods were made to the buyer's own specification),
	and the diagram says until when the buyer may withdraw and what the seller owes. The periods are
	those of article 26.1 and article 32 of the Law on Consumer Protection as the lesson reads them on
	28.10.2026 (7 days, 3 months, 10 days for the refund; a service at any time, paying real
	expenses). A teaching calculator, not legal advice.
-->
<script lang="ts">
	import './shared.css';

	type Kind = 'goods' | 'service';
	let kind = $state<Kind>('goods');
	let order = $state('2026-11-02');
	let delivered = $state('2026-11-06');
	let informed = $state(true);
	let custom = $state(false);
	let requestDay = $state('2026-11-10');

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
</script>

<figure class="dg">
	<figcaption>Часы возврата: до какого дня можно отказаться</figcaption>
	<p class="dg-out">Выберите вид покупки и даты. Сроки взяты из закона «О защите прав потребителей» в учебном прочтении на 28 октября 2026 года; не консультация.</p>

	<div class="dg-ctl" role="radiogroup" aria-label="Вид покупки">
		<button type="button" role="radio" aria-checked={kind === 'goods'} class:on={kind === 'goods'} onclick={() => (kind = 'goods')}>Товар через сайт</button>
		<button type="button" role="radio" aria-checked={kind === 'service'} class:on={kind === 'service'} onclick={() => (kind = 'service')}>Платная услуга</button>
	</div>

	{#if kind === 'goods'}
		<div class="grid">
			<label>Дата заказа <input type="date" bind:value={order} /></label>
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
