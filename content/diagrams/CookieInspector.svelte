<!--
	«Инспектор cookie» (part 15, lesson 9). Two parts. First, seven cookies and storage entries of a
	small site: the person sorts each into necessary, preferences, analytics or advertising and checks
	the answer. Second, a cookie banner whose choices the person sets (the accept and reject buttons,
	pre-ticked switches, how hard it is to refuse), and a count of the signs of a pattern that steers
	people towards «accept». The categories are the lesson's teaching reading of the EU practice and
	of what the Russian practice recommends; neither is legal advice.
-->
<script lang="ts">
	import './shared.css';
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });

	type Cat = 'necessary' | 'prefs' | 'analytics' | 'ads';
	const cats: { id: Cat; label: string }[] = [
		{ id: 'necessary', label: t('Необходимая', 'Necessary') },
		{ id: 'prefs', label: t('Предпочтения', 'Preferences') },
		{ id: 'analytics', label: t('Аналитика', 'Analytics') },
		{ id: 'ads', label: t('Реклама', 'Advertising') }
	];
	type Item = { name: string; who: string; what: string; life: string; truth: Cat; why: string };
	const items: Item[] = [
		{ name: 'session', who: t('ваш сайт', 'your site'), what: t('Помнит, что человек вошёл или оформляет заявку', 'Remembers that the person is logged in or making an inquiry'), life: t('до закрытия браузера', 'until the browser closes'), truth: 'necessary', why: t('Без неё запрошенная человеком услуга не работает. Такие cookie не требуют согласия, но их называют в политике.', 'The service the person asked for doesn’t work without it. Such cookies need no consent, but they are named in the notice.') },
		{ name: 'csrf', who: t('ваш сайт', 'your site'), what: t('Защищает форму от подделки запроса', 'Protects the form from request forgery'), life: t('до закрытия браузера', 'until the browser closes'), truth: 'necessary', why: t('Нужна для безопасности запрошенной функции.', 'Needed for the security of a feature the person asked for.') },
		{ name: 'lang', who: t('ваш сайт', 'your site'), what: t('Запоминает выбранный язык', 'Remembers the language chosen'), life: t('1 год', '1 year'), truth: 'prefs', why: t('Удобство, а не необходимость: сайт работает и без неё. По строгому прочтению требует согласия, на практике многие относят её к функциональным и перечисляют в таблице.', 'A convenience, not a necessity: the site works without it. On a strict reading it needs consent, and in practice many sites treat it as functional and list it in the table.') },
		{ name: 'cookie_consent', who: t('ваш сайт', 'your site'), what: t('Запоминает выбор человека в баннере', 'Remembers the person’s choice in the banner'), life: t('6 месяцев', '6 months'), truth: 'necessary', why: t('Без неё баннер спрашивал бы каждый раз; это часть исполнения самого согласия.', 'Without it the banner would ask every time; it is part of carrying out the consent itself.') },
		{ name: t('_ym_uid', '_ga'), who: t('счётчик Яндекс Метрики', 'analytics counter'), what: t('Отличает нового посетителя от вернувшегося', 'Tells a new visitor from a returning one'), life: t('долго (см. справку сервиса)', 'long (see the service’s help)'), truth: 'analytics', why: t('Идентификатор посетителя для статистики. Необязателен для работы сайта: спрашивают согласие или хотя бы честно называют в политике.', 'A visitor identifier for statistics. Not needed for the site to work: ask for consent in the EU and UK, and say so in the notice everywhere.') },
		{ name: 'chat_visitor', who: t('сторонний чат-виджет', 'third-party chat widget'), what: t('Узнаёт человека при повторном визите', 'Recognizes the person on a return visit'), life: t('1 год', '1 year'), truth: 'prefs', why: t('Функция чата, но сервис сторонний и может сопоставлять посетителя между сайтами: проверьте его условия. Без согласия лучше не загружать.', 'A chat feature, but the service is third-party and may match a visitor across sites: check its terms. Better not to load it without consent.') },
		{ name: 'ad_id', who: t('рекламная сеть', 'advertising network'), what: t('Следит за интересами человека на разных сайтах', 'Follows the person’s interests across sites'), life: t('13 месяцев', '13 months'), truth: 'ads', why: t('Отслеживание между сайтами для рекламы: нужно согласие и название сервиса в политике.', 'Tracking between sites for advertising: needs consent in the EU and UK, an opt-out in California, and the service named in the notice.') }
	];
	let pick = $state<Record<string, Cat | ''>>({});
	let checked = $state(false);
	const right = $derived(items.filter((i) => pick[i.name] === i.truth).length);

	let acceptBig = $state(true);
	let rejectBuried = $state(true);
	let preTicked = $state(true);
	let wall = $state(false);
	let nag = $state(false);
	const signs = $derived([acceptBig && t('кнопка «Принять» заметнее «Отклонить»', 'the “Accept” button is more prominent than “Reject”'), rejectBuried && t('отказаться можно только через настройки или мелкую ссылку', 'you can refuse only through settings or a tiny link'), preTicked && t('необязательные переключатели включены заранее', 'optional switches are on in advance'), wall && t('без согласия сайт не открывается', 'the site doesn’t open without consent'), nag && t('баннер возвращается после каждого отказа', 'the banner returns after every refusal')].filter(Boolean) as string[]);
</script>

<figure class="dg">
	<figcaption>{t('Инспектор cookie', 'Cookie inspector')}</figcaption>
	<div class="dh h">{t('1. Разберите cookie сайта', '1. Sort the site’s cookies')}</div>
	<p class="dg-out">{t('Для каждой записи выберите категорию, затем нажмите «Проверить».', 'For each entry choose a category, then press “Check.”')}</p>
	<ul class="items">
		{#each items as i (i.name)}
			<li class:bad={checked && pick[i.name] !== i.truth} class:good={checked && pick[i.name] === i.truth}>
				<div><code class="dg-mono">{i.name}</code> <span class="dim">{t('ставит', 'set by')} {i.who}{t('; срок:', '; period:')} {i.life}</span><br />{i.what}</div>
				<label class="sel">{t('Категория', 'Category')}
					<select bind:value={pick[i.name]} onchange={() => (checked = false)}>
						<option value="">{t('выберите', 'choose')}</option>
						{#each cats as c (c.id)}<option value={c.id}>{c.label}</option>{/each}
					</select>
				</label>
				{#if checked}<p class="why" aria-live="polite">{pick[i.name] === i.truth ? t('Верно.', 'Correct.') : `Нет: ${cats.find((c) => c.id === i.truth)!.label.toLowerCase()}.`} {i.why}</p>{/if}
			</li>
		{/each}
	</ul>
	<div class="dg-ctl"><button type="button" onclick={() => (checked = true)}>{t('Проверить', 'Check')}</button>{#if checked}<span aria-live="polite">{t('Верно:', 'Correct:')} {right} {t('из', 'of')} {items.length}.</span>{/if}</div>

	<div class="dh h">{t('2. Соберите баннер и посмотрите на подталкивание', '2. Build a banner and look at the nudging')}</div>
	<div class="opts">
		<label><input type="checkbox" bind:checked={acceptBig} /> {t('Кнопка «Принять всё» крупная и яркая, «Отклонить» бледнее', 'The “Accept all” button is large and bright, “Reject” is paler')}</label>
		<label><input type="checkbox" bind:checked={rejectBuried} /> {t('Отказ спрятан в «Настройки» или мелкую ссылку', 'Refusal is hidden in “Settings” or a tiny link')}</label>
		<label><input type="checkbox" bind:checked={preTicked} /> {t('Переключатели аналитики и рекламы включены заранее', 'The analytics and advertising switches are on in advance')}</label>
		<label><input type="checkbox" bind:checked={wall} /> {t('Без согласия сайт не открывается («стена из cookie»)', 'The site doesn’t open without consent (a “cookie wall”)')}</label>
		<label><input type="checkbox" bind:checked={nag} /> {t('Баннер возвращается после каждого отказа', 'The banner returns after every refusal')}</label>
	</div>
	<div class="banner" role="group" aria-label={t('Образец баннера', 'Banner sample')}>
		<p>{t('Мы используем cookie. Необходимые работают всегда, остальные только с вашего выбора.', 'We use cookies. Necessary ones always work; the others only if you choose.')} <span class="link">{t('Подробнее', 'More')}</span></p>
		<div class="btns">
			<button type="button" class={acceptBig ? 'big' : ''}>{t('Принять всё', 'Accept all')}</button>
			{#if !rejectBuried}<button type="button">{t('Отклонить всё', 'Reject all')}</button>{:else}<span class="tiny">{t('Настройки', 'Settings')}</span>{/if}
			{#if !rejectBuried}<button type="button" class="ghost">{t('Настроить', 'Set up')}</button>{/if}
		</div>
		{#if preTicked}<p class="dim">{t('☑ Аналитика ☑ Реклама (включены заранее)', '☑ Analytics ☑ Advertising (on in advance)')}</p>{:else}<p class="dim">{t('☐ Аналитика ☐ Реклама (выбирает человек)', '☐ Analytics ☐ Advertising (the person chooses)')}</p>{/if}
	</div>
	<p class="dg-out" aria-live="polite"><strong>{t('Признаков подталкивания:', 'Signs of nudging:')} {signs.length}.</strong>
		{#if signs.length}{signs.join('; ')}{t('. Такой баннер нельзя назвать честным: выбор должен быть настоящим.', '. Such a banner can’t be called honest: the choice must be real.')}{:else} {t('Баннер честный: «Принять» и «Отклонить» равны, ничего не включено заранее, сайт открыт при любом ответе.', 'The banner is honest: “Accept” and “Reject” are equal, nothing is on in advance, and the site is open whatever the answer.')}{/if}</p>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('в первой части семь cookie (сессия, защита формы, язык, запись согласия, идентификатор Метрики, чат, рекламный идентификатор) нужно отнести к необходимым, предпочтениям, аналитике или рекламе. Во второй части баннер оценивается по пяти признакам подталкивания к согласию: заметная кнопка принятия, спрятанный отказ, предварительно включённые переключатели, стена из cookie и повторные запросы.', 'in the first part, seven cookies (a session, form protection, language, a record of consent, an analytics identifier, a chat, an advertising identifier) must be sorted into necessary, preferences, analytics or advertising. In the second part the banner is assessed on five signs of nudging toward consent: a prominent accept button, a hidden refusal, pre-ticked switches, a cookie wall and repeated prompts.')}</p>
</figure>

<style>
	.h {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-serif);
		font-weight: var(--weight-regular);
		color: var(--text-primary);
	}
	.items {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.items li {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-2) var(--space-4);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.items li.good {
		border-color: var(--accent-measure);
	}
	.items li.bad {
		border-style: dashed;
	}
	.why {
		grid-column: 1 / -1;
		margin: 0;
	}
	.sel {
		display: grid;
		gap: var(--space-1);
	}
	.dim {
		color: var(--text-secondary);
	}
	.opts {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}
	.banner {
		max-width: 36rem;
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
	.btns button.big {
		border-color: var(--accent-measure);
		color: var(--text-primary);
		font-weight: var(--weight-medium);
		padding-inline: var(--space-5);
	}
	.btns button.ghost {
		border-style: dashed;
	}
	.link {
		text-decoration: underline;
	}
	.tiny {
		font-size: 0.8em;
		color: var(--text-secondary);
	}
	@media (max-width: 40rem) {
		.items li {
			grid-template-columns: 1fr;
		}
	}
</style>
