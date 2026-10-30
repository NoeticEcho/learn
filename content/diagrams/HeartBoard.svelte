<!--
	«Матрица HEART» (part 14, lesson 8). Five rows (счастье, вовлечённость, принятие, удержание, успех
	задач) for six kinds of project; each row gives a goal, a signal and a metric, with a switch that
	replaces every metric by the vanity number people usually reach for instead. Below, ten candidate
	numbers for a panel; the reader picks at most five and the page says how many of them are
	vanity, since a panel that is mostly vanity numbers is a decoration. Example rows are the author's
	teaching examples, not data. HEART is the framework of Rodden, Hutchinson and Fu (Google, 2010).
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			names: { expert: 'Эксперт', shop: 'Магазин', venue: 'Кафе, салон', community: 'Сообщество', event: 'Событие', saas: 'Сервис' },
			dims: ['Happiness: счастье', 'Engagement: вовлечённость', 'Adoption: принятие', 'Retention: удержание', 'Task success: успех задач'],
			data: {
		expert: [
			{ goal: 'Человек уходит с ощущением, что ему ответили', signal: 'оценка в письме после консультации', metric: 'доля оценивших на 4 и 5 из 5', vanity: 'число лайков' },
			{ goal: 'Человек читает, а не пролистывает', signal: 'дочитал статью', metric: 'доля визитов с прокруткой до 75%', vanity: 'просмотры страниц' },
			{ goal: 'Новый человек делает первый шаг', signal: 'открыл цены или скачал чек-лист', metric: 'доля новых посетителей, дошедших до цен', vanity: 'число посетителей' },
			{ goal: 'Человек остаётся на связи', signal: 'открывает письма, читает канал', metric: 'доля подписчиков, нажавших ссылку за 30 дней', vanity: 'подписчиков за всё время' },
			{ goal: 'Запись проходит без трудностей', signal: 'отправил форму', metric: 'доля начавших форму, которые её отправили', vanity: 'заявки без разбора' }
		],
		shop: [
			{ goal: 'Покупатель доволен заказом', signal: 'оценка товара после доставки', metric: 'доля оценок 4 и 5', vanity: 'число отзывов' },
			{ goal: 'Покупатель смотрит товары', signal: 'открыл три карточки и больше', metric: 'доля визитов с тремя карточками', vanity: 'просмотры' },
			{ goal: 'Новый покупатель кладёт в корзину', signal: 'добавил товар в корзину', metric: 'доля новых посетителей с корзиной', vanity: 'число посетителей' },
			{ goal: 'Покупатель возвращается', signal: 'второй заказ', metric: 'доля покупателей со вторым заказом за 90 дней', vanity: 'подписчиков всего' },
			{ goal: 'Оформление не мешает', signal: 'оплатил заказ', metric: 'доля начавших оформление, которые оплатили', vanity: 'число корзин' }
		],
		venue: [
			{ goal: 'Гость доволен', signal: 'отзыв на карте', metric: 'средняя оценка за квартал и доля ответов на отзывы', vanity: 'число отзывов' },
			{ goal: 'Человек изучает меню и часы', signal: 'открыл меню и «как добраться»', metric: 'доля визитов с меню и адресом', vanity: 'просмотры' },
			{ goal: 'Новый гость делает бронь', signal: 'нажал «забронировать»', metric: 'доля новых посетителей, нажавших бронь', vanity: 'число посетителей' },
			{ goal: 'Гость приходит снова', signal: 'повторная бронь', metric: 'доля гостей с повторной бронью за 60 дней', vanity: 'подписчиков всего' },
			{ goal: 'Бронь проходит легко', signal: 'подтверждённая бронь', metric: 'доля начатых броней, подтверждённых', vanity: 'число нажатий' }
		],
		community: [
			{ goal: 'Участник чувствует себя своим', signal: 'ответ на вопрос «останетесь ли вы»', metric: 'доля ответивших «да»', vanity: 'число лайков' },
			{ goal: 'Участник приходит на встречи', signal: 'был на мероприятии', metric: 'доля участников, пришедших хотя бы на одну встречу в месяц', vanity: 'просмотры анонсов' },
			{ goal: 'Новый человек вступает', signal: 'подал заявку', metric: 'доля новых посетителей, подавших заявку', vanity: 'число посетителей' },
			{ goal: 'Участник остаётся', signal: 'активен в третий месяц', metric: 'доля вступивших, активных через три месяца', vanity: 'участников всего' },
			{ goal: 'Вступить просто', signal: 'заявка отправлена', metric: 'доля начавших заявку, которые её отправили', vanity: 'число нажатий' }
		],
		event: [
			{ goal: 'Гость доволен событием', signal: 'оценка после события', metric: 'доля оценок 4 и 5', vanity: 'охват анонсов' },
			{ goal: 'Человек изучает программу', signal: 'открыл программу и участников', metric: 'доля визитов с программой', vanity: 'просмотры' },
			{ goal: 'Новый человек идёт за билетом', signal: 'нажал «купить билет»', metric: 'доля новых посетителей, нажавших на билет', vanity: 'число посетителей' },
			{ goal: 'Гость возвращается в следующем году', signal: 'подписан на новости', metric: 'доля купивших, оставшихся подписанными', vanity: 'подписчиков всего' },
			{ goal: 'Покупка билета проходит легко', signal: 'оплаченный билет', metric: 'доля начавших покупку, которые оплатили', vanity: 'число нажатий' }
		],
		saas: [
			{ goal: 'Пользователь доволен', signal: 'ответ на вопрос «порекомендуете ли»', metric: 'доля тех, кто порекомендовал бы', vanity: 'число лайков' },
			{ goal: 'Пользователь работает в сервисе', signal: 'составил смету', metric: 'доля пользователей с хотя бы одной сметой за неделю', vanity: 'число входов' },
			{ goal: 'Новый человек пробует', signal: 'создал первую смету', metric: 'доля зарегистрировавшихся с первой сметой за три дня', vanity: 'число регистраций' },
			{ goal: 'Пользователь остаётся', signal: 'вернулся на четвёртой неделе', metric: 'доля вернувшихся на четвёртой неделе от когорты', vanity: 'зарегистрированных всего' },
			{ goal: 'Задача решается без трудностей', signal: 'экспортировал смету', metric: 'доля начатых смет, доведённых до экспорта', vanity: 'число кликов' }
		]
	},
			pool: [
		{ t: 'Просмотры страниц за месяц', vain: true },
		{ t: 'Посетители за всё время', vain: true },
		{ t: 'Подписчики канала за всё время', vain: true },
		{ t: 'Число лайков', vain: true },
		{ t: 'Среднее время на сайте', vain: true },
		{ t: 'Заявки в месяц от нужного сегмента', vain: false },
		{ t: 'Доля начавших форму, отправивших её', vain: false },
		{ t: 'Доля заявок, дошедших до разговора', vain: false },
		{ t: 'Доля вернувшихся через месяц из тех, кто оставил почту', vain: false },
		{ t: 'Доля посетителей из поиска, дошедших до формы', vain: false }
	],
			caption: 'HEART: пять сторон здоровья проекта',
			group: 'Тип проекта',
			vanityLabel: 'показать тщеславные подмены',
			head: ['Сторона', 'Цель', 'Сигнал', 'Метрика'],
			panel: 'Панель из пяти показателей',
			choose: 'Выберите не больше пяти. Какие из них будут вести к решениям?',
			tagVain: 'тщеславная или двусмысленная',
			tagWork: 'рабочая',
			chosen: 'Выбрано',
			of5: 'из 5',
			start: 'Начните с того, что поддерживает решения.',
			most: 'Больше половины панели тщеславные: она украшает отчёт и ничего не подсказывает.',
			some: 'Среди выбранных есть тщеславные: оставьте их, только если можете назвать решение, которое они поддерживают.',
			good: 'Панель собрана из рабочих показателей.',
			note: 'Строки таблицы примеры автора, а не данные. Рамка HEART описана Роденом, Хатчинсоном и Фу из Google в 2010 году.'
		},
		en: {
			names: { expert: 'Expert', shop: 'Shop', venue: 'Café, salon', community: 'Community', event: 'Event', saas: 'Service' },
			dims: ['Happiness', 'Engagement', 'Adoption', 'Retention', 'Task success'],
			data: {
		expert: [
			{ goal: 'The person leaves feeling they got an answer', signal: 'a rating in the email after the consultation', metric: 'the share who rate 4 or 5 out of 5', vanity: 'the number of likes' },
			{ goal: 'The person reads instead of skimming', signal: 'read an article to the end', metric: 'the share of visits that scroll to 75%', vanity: 'page views' },
			{ goal: 'A new person takes the first step', signal: 'opened the prices or downloaded a checklist', metric: 'the share of new visitors who reached the prices', vanity: 'the number of visitors' },
			{ goal: 'The person stays in touch', signal: 'opens the emails, reads the channel', metric: 'the share of subscribers who clicked a link in 30 days', vanity: 'followers of all time' },
			{ goal: 'Booking goes through without difficulty', signal: 'sent the form', metric: 'the share who started the form and sent it', vanity: 'requests without sorting' }
		],
		shop: [
			{ goal: 'The buyer is pleased with the order', signal: 'a product rating after delivery', metric: 'the share of ratings of 4 and 5', vanity: 'the number of reviews' },
			{ goal: 'The buyer looks at products', signal: 'opened three product pages or more', metric: 'the share of visits with three product pages', vanity: 'views' },
			{ goal: 'A new buyer puts something in the cart', signal: 'added a product to the cart', metric: 'the share of new visitors with a cart', vanity: 'the number of visitors' },
			{ goal: 'The buyer comes back', signal: 'a second order', metric: 'the share of buyers with a second order in 90 days', vanity: 'total followers' },
			{ goal: 'Checkout doesn’t get in the way', signal: 'paid for the order', metric: 'the share who started checkout and paid', vanity: 'the number of carts' }
		],
		venue: [
			{ goal: 'The guest is pleased', signal: 'a review on the map', metric: 'the average rating over a quarter and the share of reviews answered', vanity: 'the number of reviews' },
			{ goal: 'The person studies the menu and the hours', signal: 'opened the menu and “how to find us”', metric: 'the share of visits with the menu and the address', vanity: 'views' },
			{ goal: 'A new guest makes a booking', signal: 'pressed “book a table”', metric: 'the share of new visitors who pressed book', vanity: 'the number of visitors' },
			{ goal: 'The guest comes again', signal: 'a repeat booking', metric: 'the share of guests with a repeat booking in 60 days', vanity: 'total followers' },
			{ goal: 'Booking goes through easily', signal: 'a confirmed booking', metric: 'the share of started bookings that were confirmed', vanity: 'the number of presses' }
		],
		community: [
			{ goal: 'The member feels they belong', signal: 'an answer to “will you stay”', metric: 'the share who answered yes', vanity: 'the number of likes' },
			{ goal: 'The member comes to meetings', signal: 'attended an event', metric: 'the share of members who came to at least one meeting a month', vanity: 'views of announcements' },
			{ goal: 'A new person joins', signal: 'sent an application', metric: 'the share of new visitors who applied', vanity: 'the number of visitors' },
			{ goal: 'The member stays', signal: 'active in the third month', metric: 'the share of joiners still active after three months', vanity: 'total members' },
			{ goal: 'Joining is simple', signal: 'application sent', metric: 'the share who started the application and sent it', vanity: 'the number of presses' }
		],
		event: [
			{ goal: 'The guest is pleased with the event', signal: 'a rating after the event', metric: 'the share of ratings of 4 and 5', vanity: 'reach of announcements' },
			{ goal: 'The person studies the program', signal: 'opened the program and the speakers', metric: 'the share of visits with the program', vanity: 'views' },
			{ goal: 'A new person goes for a ticket', signal: 'pressed “buy a ticket”', metric: 'the share of new visitors who pressed the ticket button', vanity: 'the number of visitors' },
			{ goal: 'The guest comes back next year', signal: 'subscribed to the news', metric: 'the share of buyers who stayed subscribed', vanity: 'total followers' },
			{ goal: 'Buying a ticket goes through easily', signal: 'a paid ticket', metric: 'the share who started the purchase and paid', vanity: 'the number of presses' }
		],
		saas: [
			{ goal: 'The user is pleased', signal: 'an answer to “would you recommend us”', metric: 'the share who would recommend', vanity: 'the number of likes' },
			{ goal: 'The user works in the service', signal: 'made an estimate', metric: 'the share of users with at least one estimate a week', vanity: 'the number of sign-ins' },
			{ goal: 'A new person tries it', signal: 'created a first estimate', metric: 'the share of sign-ups with a first estimate in three days', vanity: 'the number of sign-ups' },
			{ goal: 'The user stays', signal: 'came back in the fourth week', metric: 'the share of a cohort that came back in the fourth week', vanity: 'total registered' },
			{ goal: 'The task is solved without difficulty', signal: 'exported an estimate', metric: 'the share of started estimates taken to export', vanity: 'the number of clicks' }
		]
	},
			pool: [
		{ t: 'Page views per month', vain: true },
		{ t: 'Visitors of all time', vain: true },
		{ t: 'Channel followers of all time', vain: true },
		{ t: 'The number of likes', vain: true },
		{ t: 'Average time on the site', vain: true },
		{ t: 'Leads a month from the right segment', vain: false },
		{ t: 'The share who started the form and sent it', vain: false },
		{ t: 'The share of leads that reached a conversation', vain: false },
		{ t: 'The share of those who left an email who came back after a month', vain: false },
		{ t: 'The share of search visitors who reached the form', vain: false }
	],
			caption: 'HEART: five sides of a project’s health',
			group: 'Type of project',
			vanityLabel: 'show the vanity substitutes',
			head: ['Side', 'Goal', 'Signal', 'Metric'],
			panel: 'A panel of five measures',
			choose: 'Choose no more than five. Which of them will lead to decisions?',
			tagVain: 'vanity or ambiguous',
			tagWork: 'actionable',
			chosen: 'Chosen',
			of5: 'of 5',
			start: 'Start with what supports decisions.',
			most: 'More than half of the panel is vanity: it decorates the report and suggests nothing.',
			some: 'There are vanity measures among those chosen: keep them only if you can name the decision they support.',
			good: 'The panel is made of actionable measures.',
			note: 'The rows of the table are the author’s examples, not data. The HEART framework was described by Rodden, Hutchinson and Fu of Google in 2010.'
		}
	});

	type Row = { dim: string; goal: string; signal: string; metric: string; vanity: string };
	const kinds = ['expert', 'shop', 'venue', 'community', 'event', 'saas'] as const;
	type Kind = (typeof kinds)[number];
	const names: Record<Kind, string> = W.names;
	const dims = W.dims;
	const data: Record<Kind, Omit<Row, 'dim'>[]> = W.data;

	let kind = $state<Kind>('expert');
	let showVanity = $state(false);
	const rows = $derived(data[kind].map((r, i) => ({ dim: dims[i], ...r })));

	const pool = W.pool;
	let picked = $state<boolean[]>(pool.map(() => false));
	const count = $derived(picked.filter(Boolean).length);
	const vain = $derived(picked.filter((p, i) => p && pool[i].vain).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each kinds as k (k)}
			<button type="button" aria-pressed={kind === k} onclick={() => (kind = k)}>{names[k]}</button>
		{/each}
		<label><input type="checkbox" bind:checked={showVanity} /> {W.vanityLabel}</label>
	</div>
	<div class="wrap">
		<table>
			<thead>
				<tr><th scope="col">{W.head[0]}</th><th scope="col">{W.head[1]}</th><th scope="col">{W.head[2]}</th><th scope="col">{W.head[3]}</th></tr>
			</thead>
			<tbody>
				{#each rows as r (r.dim)}
					<tr>
						<th scope="row">{r.dim}</th>
						<td>{r.goal}</td>
						<td>{r.signal}</td>
						<td class:v={showVanity}>{showVanity ? r.vanity : r.metric}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="dh">{W.panel}</div>
	<p class="dg-out">{W.choose}</p>
	<ul class="pool">
		{#each pool as p, i (i)}
			<li>
				<label><input type="checkbox" bind:checked={picked[i]} disabled={!picked[i] && count >= 5} /> {p.t}</label>
				{#if picked[i]}<span class="tag">{p.vain ? W.tagVain : W.tagWork}</span>{/if}
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		{W.chosen} {count} {W.of5}. {#if count === 0}{W.start}{:else if vain > count / 2}{W.most}{:else if vain > 0}{W.some}{:else}{W.good}{/if}
	</p>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.wrap {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th,
	td {
		padding: var(--space-2) var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
		text-align: left;
		vertical-align: top;
	}
	td.v {
		color: var(--text-secondary);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}
	.dh {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.pool {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.tag {
		font-size: 0.82em;
		color: var(--text-secondary);
	}
</style>
