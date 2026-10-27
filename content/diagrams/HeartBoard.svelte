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

	type Row = { dim: string; goal: string; signal: string; metric: string; vanity: string };
	const kinds = ['expert', 'shop', 'venue', 'community', 'event', 'saas'] as const;
	type Kind = (typeof kinds)[number];
	const names: Record<Kind, string> = { expert: 'Эксперт', shop: 'Магазин', venue: 'Кафе, салон', community: 'Сообщество', event: 'Событие', saas: 'Сервис' };
	const dims = ['Happiness: счастье', 'Engagement: вовлечённость', 'Adoption: принятие', 'Retention: удержание', 'Task success: успех задач'];
	const data: Record<Kind, Omit<Row, 'dim'>[]> = {
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
	};

	let kind = $state<Kind>('expert');
	let showVanity = $state(false);
	const rows = $derived(data[kind].map((r, i) => ({ dim: dims[i], ...r })));

	const pool = [
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
	];
	let picked = $state<boolean[]>(pool.map(() => false));
	const count = $derived(picked.filter(Boolean).length);
	const vain = $derived(picked.filter((p, i) => p && pool[i].vain).length);
</script>

<figure class="dg">
	<figcaption>HEART: пять сторон здоровья проекта</figcaption>
	<div class="dg-ctl" role="group" aria-label="Тип проекта">
		{#each kinds as k (k)}
			<button type="button" aria-pressed={kind === k} onclick={() => (kind = k)}>{names[k]}</button>
		{/each}
		<label><input type="checkbox" bind:checked={showVanity} /> показать тщеславные подмены</label>
	</div>
	<div class="wrap">
		<table>
			<thead>
				<tr><th scope="col">Сторона</th><th scope="col">Цель</th><th scope="col">Сигнал</th><th scope="col">Метрика</th></tr>
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

	<h4>Панель из пяти показателей</h4>
	<p class="dg-out">Выберите не больше пяти. Какие из них будут вести к решениям?</p>
	<ul class="pool">
		{#each pool as p, i (i)}
			<li>
				<label><input type="checkbox" bind:checked={picked[i]} disabled={!picked[i] && count >= 5} /> {p.t}</label>
				{#if picked[i]}<span class="tag">{p.vain ? 'тщеславная или двусмысленная' : 'рабочая'}</span>{/if}
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		Выбрано {count} из 5. {#if count === 0}Начните с того, что поддерживает решения.{:else if vain > count / 2}Больше половины панели тщеславные: она украшает отчёт и ничего не подсказывает.{:else if vain > 0}Среди выбранных есть тщеславные: оставьте их, только если можете назвать решение, которое они поддерживают.{:else}Панель собрана из рабочих показателей.{/if}
	</p>
	<p class="dg-out">Строки таблицы примеры автора, а не данные. Рамка HEART описана Роденом, Хатчинсоном и Фу из Google в 2010 году.</p>
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
	h4 {
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
