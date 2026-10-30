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
	import { pick } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, «English edition»): the Russian stays as written. */
	const t = (ru: string, en: string) => pick({ ru, en });

	const whereRu = [
		{ id: 'ru', label: 'Россия' },
		{ id: 'eu', label: 'Страны Европейского союза' },
		{ id: 'us', label: 'США' }
	];
	const doesRu = [
		{ id: 'data', label: 'Собирает данные через форму' },
		{ id: 'cookies', label: 'Ставит аналитику и рекламные cookie' },
		{ id: 'sell', label: 'Продаёт онлайн людям (товары или услуги)' },
		{ id: 'public', label: 'Коммерческий сайт, открытый всем' }
	];
	let w = $state<Record<string, boolean>>(pick<Record<string, boolean>>({ ru: { ru: true }, en: { us: true } }));
	let d = $state<Record<string, boolean>>({});

	type Regime = { id: string; name: string; when: () => boolean; what: string; do: string; risk: string };
	const regimesRu: Regime[] = [
		{ id: '152', name: '152-ФЗ «О персональных данных» (Россия)', when: () => !!(w.ru && d.data), what: 'Оператор, согласие, политика, уведомление, хранение в России.', do: 'Реестр обработки, отдельное согласие, политика, уведомление Роскомнадзора, база в России.', risk: 'административные штрафы, жалобы, блокировка при систематических нарушениях' },
		{ id: 'ad', name: 'Закон «О рекламе» (Россия)', when: () => !!(w.ru && d.public), what: 'Достоверность, сравнения, маркировка рекламы в интернете.', do: 'Факты вместо оценок, условия рядом с обещанием, маркировка платной рекламы.', risk: 'предписание ФАС и административные штрафы' },
		{ id: 'zpp', name: 'Закон «О защите прав потребителей» (Россия)', when: () => !!(w.ru && d.sell), what: 'Сведения о продавце, цена в рублях, отказ и возврат, оферта.', do: 'Страница условий, сроки возврата, чек.', risk: 'претензии, иски, штрафы' },
		{ id: 'gdpr', name: 'GDPR (Европейский союз)', when: () => !!(w.eu && d.data), what: 'Действует для данных людей в ЕС, если вы им предлагаете товары или услуги или следите за их поведением, где бы вы ни находились. Основания, права, 72 часа на сообщение об утечке.', do: 'Политика на английском, основание обработки, права человека, при необходимости представитель в ЕС.', risk: 'штрафы до 20 млн евро или 4 процентов оборота' },
		{ id: 'eprivacy', name: 'ePrivacy (директива о cookie, ЕС)', when: () => !!(w.eu && d.cookies), what: 'Согласие до установки необязательных cookie.', do: 'Баннер с равным выбором, блокировка аналитики до согласия.', risk: 'штрафы национальных регуляторов' },
		{ id: 'eaa', name: 'European Accessibility Act (ЕС)', when: () => !!(w.eu && d.sell), what: 'С 28 июня 2025 года электронная торговля для потребителей в ЕС должна быть доступной (ориентир: WCAG 2.1 AA через стандарт EN 301 549); для микропредприятий есть исключение.', do: 'Проверить, подпадаете ли вы, довести сайт до WCAG AA, опубликовать заявление о доступности.', risk: 'меры национальных регуляторов, штрафы по законам стран' },
		{ id: 'ada', name: 'ADA, закон об американцах с инвалидностью (США)', when: () => !!(w.us && d.public), what: 'Суды США по-разному решают, распространяется ли он на сайты бизнеса; иски по недоступным сайтам идут каждый год. Ориентир: WCAG.', do: 'Довести сайт до WCAG 2.1 или 2.2 AA, иметь канал обратной связи.', risk: 'иски и компенсации' },
		{ id: 'usstates', name: 'Законы штатов о данных (например, Калифорния)', when: () => !!(w.us && (d.data || d.cookies)), what: 'В США нет единого закона о персональных данных, но есть законы штатов с порогами по размеру бизнеса.', do: 'Проверить пороги и права жителей штатов, дать возможность отказаться от продажи и передачи данных.', risk: 'штрафы регуляторов штатов и иски' }
	];
	const whereEn = [
		{ id: 'us', label: 'United States' },
		{ id: 'uk', label: 'United Kingdom' },
		{ id: 'eu', label: 'European Union countries' },
		{ id: 'ru', label: 'Russia (for comparison)' }
	];
	const doesEn = [
		{ id: 'data', label: 'Collects data through a form' },
		{ id: 'cookies', label: 'Sets analytics and advertising cookies' },
		{ id: 'sell', label: 'Sells online to people (goods or services)' },
		{ id: 'public', label: 'A commercial site open to everyone' }
	];
	const regimesEn: Regime[] = [
		{ id: 'usstates', name: 'State privacy laws, for example California’s CCPA (United States)', when: () => !!(w.us && (d.data || d.cookies)), what: 'The US has no single privacy law for ordinary sites, but states do, with thresholds by size and by number of residents. California gives consumers the right to know, delete, correct and opt out of the sale or sharing of their data, including through Global Privacy Control.', do: 'Check the thresholds, give a notice at collection and a way to opt out, and honor the GPC signal.', risk: 'fines by state regulators (in California up to $2,663 per violation, $7,988 if intentional) and lawsuits' },
		{ id: 'ftc', name: 'FTC Act section 5 and state consumer protection laws (United States)', when: () => !!(w.us && (d.public || d.sell)), what: 'Advertising claims must be truthful and substantiated. Online sales are also covered by FTC rules on shipping times, reviews and subscriptions (ROSCA).', do: 'Claims with proof, terms beside the promises, clear return and cancellation terms.', risk: 'FTC orders, refunds, civil penalties for rule violations, and actions by state attorneys general' },
		{ id: 'ada', name: 'ADA Title III (United States)', when: () => !!(w.us && d.public), what: 'It bars discrimination by businesses open to the public. Courts disagree on how far it reaches websites, but accessibility lawsuits are filed every year. There is no federal technical standard for private sites; WCAG is the benchmark.', do: 'Bring the site to WCAG 2.2 AA, keep a feedback channel and publish an accessibility statement.', risk: 'lawsuits, settlements and demand letters' },
		{ id: 'ukgdpr', name: 'UK GDPR and the Data Protection Act 2018 (United Kingdom)', when: () => !!(w.uk && d.data), what: 'A lawful basis, a privacy notice, people’s rights and a breach notice within 72 hours. Most controllers pay the ICO a yearly data protection fee.', do: 'A record of processing, a privacy notice, processor contracts, the ICO fee.', risk: 'fines up to £17.5 million or 4 percent of worldwide turnover' },
		{ id: 'pecr', name: 'PECR, regulation 6 (United Kingdom)', when: () => !!(w.uk && d.cookies), what: 'Consent before non-essential cookies and similar technologies, with narrow exceptions.', do: 'A banner with an equal choice and analytics blocked until the choice is made.', risk: 'ICO enforcement; penalties are raised to the UK GDPR level by the Data (Use and Access) Act 2025' },
		{ id: 'ukcons', name: 'Consumer Contracts Regulations 2013 and Consumer Rights Act 2015 (United Kingdom)', when: () => !!(w.uk && d.sell), what: 'A 14-day right to cancel online orders, pre-contract information, and statutory rights for faulty goods.', do: 'A terms page, cancellation information and a refund process.', risk: 'a longer cancellation period, refunds, and action by the CMA or trading standards' },
		{ id: 'equality', name: 'Equality Act 2010 and advertising rules (United Kingdom)', when: () => !!(w.uk && d.public), what: 'A service provider must make reasonable adjustments for disabled people (sections 20 and 29). Advertising must follow the CAP Code and the Digital Markets, Competition and Consumers Act 2024.', do: 'Bring the site to WCAG 2.2 AA and back every claim with evidence.', risk: 'discrimination claims in court, ASA rulings, and CMA fines of up to 10 percent of global turnover' },
		{ id: 'gdpr', name: 'GDPR (European Union)', when: () => !!(w.eu && d.data), what: 'It applies to the data of people in the EU if you offer them goods or services or monitor their behavior there (Article 3(2)), wherever you are. A lawful basis, people’s rights, a 72-hour breach notice.', do: 'A privacy notice in a language they read, a lawful basis, processor contracts, safeguards for transfers, and an EU representative if required (Article 27).', risk: 'fines up to €20 million or 4 percent of worldwide turnover' },
		{ id: 'eprivacy', name: 'ePrivacy Directive, Article 5(3) (European Union)', when: () => !!(w.eu && d.cookies), what: 'Consent before non-essential cookies.', do: 'A banner with an equal choice and analytics blocked until the choice is made.', risk: 'fines by national regulators (the CNIL fined Google €150 million in 2022)' },
		{ id: 'eaa', name: 'European Accessibility Act (European Union)', when: () => !!(w.eu && d.sell), what: 'Since 28 June 2025, e-commerce services for consumers in the EU must be accessible (benchmark: WCAG 2.1 AA through EN 301 549). Services provided by microenterprises are exempt.', do: 'Check whether you are covered, bring the site to WCAG AA and publish an accessibility statement.', risk: 'measures and fines under each country’s law' },
		{ id: 'eucons', name: 'Consumer Rights Directive (European Union)', when: () => !!(w.eu && d.sell), what: 'A 14-day right of withdrawal, pre-contract information, an order button that states the duty to pay, and, from 19 June 2026, an online withdrawal function.', do: 'A terms page, withdrawal information and a form, and a refund process.', risk: 'a longer withdrawal period and national enforcement' },
		{ id: '152', name: '152-FZ “On Personal Data” (Russia)', when: () => !!(w.ru && d.data), what: 'The operator, consent, a policy, notifying the regulator, and storage of Russian citizens’ data in Russia.', do: 'A record of processing, separate consent, a policy, notification of Roskomnadzor, a database in Russia.', risk: 'administrative fines, complaints, blocking for systematic breaches' },
		{ id: 'ad', name: 'Law “On Advertising” (Russia)', when: () => !!(w.ru && d.public), what: 'Truthfulness, comparisons and the labeling of internet advertising.', do: 'Facts instead of ratings, terms beside promises, labels on paid advertising.', risk: 'an order from the antimonopoly service and administrative fines' },
		{ id: 'zpp', name: 'Law “On Protection of Consumer Rights” (Russia)', when: () => !!(w.ru && d.sell), what: 'Seller information, prices in rubles, cancellation and returns, the offer.', do: 'A terms page, return periods, a receipt.', risk: 'claims, lawsuits, fines' }
	];
	const where = pick({ ru: whereRu, en: whereEn });
	const does = pick({ ru: doesRu, en: doesEn });
	const regimes = pick({ ru: regimesRu, en: regimesEn });

	const active = $derived(regimes.filter((r) => r.when()));
	const anyWhere = $derived(Object.values(w).some(Boolean));
</script>

<figure class="dg">
	<figcaption>{t('Какие правила могут быть рядом с вашим сайтом', 'Which rules may sit beside your site')}</figcaption>
	<p class="dg-out">{t('Отметьте, откуда ваши посетители и что делает сайт. Карта подскажет, о каких правилах спросить юриста. Это ориентир на 28 октября 2026 года, а не определение того, что применимо.', 'Tick where your visitors come from and what the site does. The map suggests which rules to ask a lawyer about. This is a guide as of 30 October 2026, not a ruling on what applies.')}</p>

	<div class="cols">
		<fieldset>
			<legend>{t('Откуда посетители', 'Where visitors come from')}</legend>
			{#each where as x (x.id)}<label><input type="checkbox" bind:checked={w[x.id]} /> {x.label}</label>{/each}
		</fieldset>
		<fieldset>
			<legend>{t('Что делает сайт', 'What the site does')}</legend>
			{#each does as x (x.id)}<label><input type="checkbox" bind:checked={d[x.id]} /> {x.label}</label>{/each}
		</fieldset>
	</div>

	<p class="dg-out" aria-live="polite"><strong>{!anyWhere ? t('Отметьте хотя бы одну страну.', 'Tick at least one country.') : active.length ? t(`Правил, которые стоит проверить: ${active.length}.`, `Rules worth checking: ${active.length}.`) : t('Отметьте, что делает сайт.', 'Tick what the site does.')}</strong></p>
	<ol class="regs" aria-live="polite">
		{#each active as r (r.id)}
			<li>
				<strong>{r.name}</strong>
				<br />{r.what}
				<br /><span class="dim"><strong>{t('Что делать:', 'What to do:')}</strong> {r.do} <strong>{t('Чем грозит:', 'Risk:')}</strong> {r.risk}.</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('по двум наборам отметок (откуда посетители и что делает сайт) схема показывает правила, о которых нужно спросить юриста: 152-ФЗ, закон о рекламе и закон о защите прав потребителей в России; GDPR, директиву ePrivacy и European Accessibility Act для посетителей из Европейского союза; ADA и законы штатов для посетителей из США.', 'from two sets of ticks (where visitors come from and what the site does) the diagram shows the rules to ask a lawyer about: for the United States, state privacy laws, the FTC Act and the ADA; for the United Kingdom, the UK GDPR, PECR, the Consumer Contracts Regulations and the Equality Act; for the European Union, the GDPR, the ePrivacy Directive, the Consumer Rights Directive and the European Accessibility Act; and for Russia, 152-FZ, the advertising law and the consumer law.')}</p>
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
