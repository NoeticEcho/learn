<!--
	«Какие правила рядом» (part 15, lesson 13). The person ticks where the visitors come from (Russia,
	the EU, the USA) and what the site does (collects data by a form, sets analytics cookies, sells
	online, is a commercial site open to the public). The diagram lists the regimes that may apply
	and what a small site does about each, with the sanctions in a word and the date of the reading
	(28.10.2026). It is an orientation map for a conversation with a lawyer, not a determination of
	what applies to a real site.
-->
<script lang="ts">
	import './shared.css';

	const where = [
		{ id: 'ru', label: 'Россия' },
		{ id: 'eu', label: 'Страны Европейского союза' },
		{ id: 'us', label: 'США' }
	];
	const does = [
		{ id: 'data', label: 'Собирает данные через форму' },
		{ id: 'cookies', label: 'Ставит аналитику и рекламные cookie' },
		{ id: 'sell', label: 'Продаёт онлайн людям (товары или услуги)' },
		{ id: 'public', label: 'Коммерческий сайт, открытый всем' }
	];
	let w = $state<Record<string, boolean>>({ ru: true });
	let d = $state<Record<string, boolean>>({});

	type Regime = { id: string; name: string; when: () => boolean; what: string; do: string; risk: string };
	const regimes: Regime[] = [
		{ id: '152', name: '152-ФЗ «О персональных данных» (Россия)', when: () => !!(w.ru && d.data), what: 'Оператор, согласие, политика, уведомление, хранение в России.', do: 'Реестр обработки, отдельное согласие, политика, уведомление Роскомнадзора, база в России.', risk: 'административные штрафы, жалобы, блокировка при систематических нарушениях' },
		{ id: 'ad', name: 'Закон «О рекламе» (Россия)', when: () => !!(w.ru && d.public), what: 'Достоверность, сравнения, маркировка рекламы в интернете.', do: 'Факты вместо оценок, условия рядом с обещанием, маркировка платной рекламы.', risk: 'предписание ФАС и административные штрафы' },
		{ id: 'zpp', name: 'Закон «О защите прав потребителей» (Россия)', when: () => !!(w.ru && d.sell), what: 'Сведения о продавце, цена в рублях, отказ и возврат, оферта.', do: 'Страница условий, сроки возврата, чек.', risk: 'претензии, иски, штрафы' },
		{ id: 'gdpr', name: 'GDPR (Европейский союз)', when: () => !!(w.eu && d.data), what: 'Действует для данных людей в ЕС, если вы им предлагаете товары или услуги или следите за их поведением, где бы вы ни находились. Основания, права, 72 часа на сообщение об утечке.', do: 'Политика на английском, основание обработки, права человека, при необходимости представитель в ЕС.', risk: 'штрафы до 20 млн евро или 4 процентов оборота' },
		{ id: 'eprivacy', name: 'ePrivacy (директива о cookie, ЕС)', when: () => !!(w.eu && d.cookies), what: 'Согласие до установки необязательных cookie.', do: 'Баннер с равным выбором, блокировка аналитики до согласия.', risk: 'штрафы национальных регуляторов' },
		{ id: 'eaa', name: 'European Accessibility Act (ЕС)', when: () => !!(w.eu && d.sell), what: 'С 28 июня 2025 года электронная торговля для потребителей в ЕС должна быть доступной (ориентир: WCAG 2.1 AA через стандарт EN 301 549); для микропредприятий есть исключение.', do: 'Проверить, подпадаете ли вы, довести сайт до WCAG AA, опубликовать заявление о доступности.', risk: 'меры национальных регуляторов, штрафы по законам стран' },
		{ id: 'ada', name: 'ADA, закон об американцах с инвалидностью (США)', when: () => !!(w.us && d.public), what: 'Суды США по-разному решают, распространяется ли он на сайты бизнеса; иски по недоступным сайтам идут каждый год. Ориентир: WCAG.', do: 'Довести сайт до WCAG 2.1 или 2.2 AA, иметь канал обратной связи.', risk: 'иски и компенсации' },
		{ id: 'usstates', name: 'Законы штатов о данных (например, Калифорния)', when: () => !!(w.us && (d.data || d.cookies)), what: 'В США нет единого закона о персональных данных, но есть законы штатов с порогами по размеру бизнеса.', do: 'Проверить пороги и права жителей штатов, дать возможность отказаться от продажи и передачи данных.', risk: 'штрафы регуляторов штатов и иски' }
	];
	const active = $derived(regimes.filter((r) => r.when()));
	const anyWhere = $derived(Object.values(w).some(Boolean));
</script>

<figure class="dg">
	<figcaption>Какие правила могут быть рядом с вашим сайтом</figcaption>
	<p class="dg-out">Отметьте, откуда ваши посетители и что делает сайт. Карта подскажет, о каких правилах спросить юриста. Это ориентир на 28 октября 2026 года, а не определение того, что применимо.</p>

	<div class="cols">
		<fieldset>
			<legend>Откуда посетители</legend>
			{#each where as x (x.id)}<label><input type="checkbox" bind:checked={w[x.id]} /> {x.label}</label>{/each}
		</fieldset>
		<fieldset>
			<legend>Что делает сайт</legend>
			{#each does as x (x.id)}<label><input type="checkbox" bind:checked={d[x.id]} /> {x.label}</label>{/each}
		</fieldset>
	</div>

	<p class="dg-out" aria-live="polite"><strong>{!anyWhere ? 'Отметьте хотя бы одну страну.' : active.length ? `Правил, которые стоит проверить: ${active.length}.` : 'Отметьте, что делает сайт.'}</strong></p>
	<ol class="regs" aria-live="polite">
		{#each active as r (r.id)}
			<li>
				<strong>{r.name}</strong>
				<br />{r.what}
				<br /><span class="dim"><strong>Что делать:</strong> {r.do} <strong>Чем грозит:</strong> {r.risk}.</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> по двум наборам отметок (откуда посетители и что делает сайт) схема показывает правила, о которых нужно спросить юриста: 152-ФЗ, закон о рекламе и закон о защите прав потребителей в России; GDPR, директиву ePrivacy и European Accessibility Act для посетителей из Европейского союза; ADA и законы штатов для посетителей из США.</p>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	fieldset {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	legend {
		padding: 0 var(--space-2);
		color: var(--text-primary);
	}
	.regs {
		margin: 0;
		padding-left: var(--space-5) !important;
		display: grid;
		gap: var(--space-3);
	}
	.dim {
		color: var(--text-secondary);
	}
</style>
