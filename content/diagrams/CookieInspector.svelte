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

	type Cat = 'necessary' | 'prefs' | 'analytics' | 'ads';
	const cats: { id: Cat; label: string }[] = [
		{ id: 'necessary', label: 'Необходимая' },
		{ id: 'prefs', label: 'Предпочтения' },
		{ id: 'analytics', label: 'Аналитика' },
		{ id: 'ads', label: 'Реклама' }
	];
	type Item = { name: string; who: string; what: string; life: string; truth: Cat; why: string };
	const items: Item[] = [
		{ name: 'session', who: 'ваш сайт', what: 'Помнит, что человек вошёл или оформляет заявку', life: 'до закрытия браузера', truth: 'necessary', why: 'Без неё запрошенная человеком услуга не работает. Такие cookie не требуют согласия, но их называют в политике.' },
		{ name: 'csrf', who: 'ваш сайт', what: 'Защищает форму от подделки запроса', life: 'до закрытия браузера', truth: 'necessary', why: 'Нужна для безопасности запрошенной функции.' },
		{ name: 'lang', who: 'ваш сайт', what: 'Запоминает выбранный язык', life: '1 год', truth: 'prefs', why: 'Удобство, а не необходимость: сайт работает и без неё. По строгому прочтению требует согласия, на практике многие относят её к функциональным и перечисляют в таблице.' },
		{ name: 'cookie_consent', who: 'ваш сайт', what: 'Запоминает выбор человека в баннере', life: '6 месяцев', truth: 'necessary', why: 'Без неё баннер спрашивал бы каждый раз; это часть исполнения самого согласия.' },
		{ name: '_ym_uid', who: 'счётчик Яндекс Метрики', what: 'Отличает нового посетителя от вернувшегося', life: 'долго (см. справку сервиса)', truth: 'analytics', why: 'Идентификатор посетителя для статистики. Необязателен для работы сайта: спрашивают согласие или хотя бы честно называют в политике.' },
		{ name: 'chat_visitor', who: 'сторонний чат-виджет', what: 'Узнаёт человека при повторном визите', life: '1 год', truth: 'prefs', why: 'Функция чата, но сервис сторонний и может сопоставлять посетителя между сайтами: проверьте его условия. Без согласия лучше не загружать.' },
		{ name: 'ad_id', who: 'рекламная сеть', what: 'Следит за интересами человека на разных сайтах', life: '13 месяцев', truth: 'ads', why: 'Отслеживание между сайтами для рекламы: нужно согласие и название сервиса в политике.' }
	];
	let pick = $state<Record<string, Cat | ''>>({});
	let checked = $state(false);
	const right = $derived(items.filter((i) => pick[i.name] === i.truth).length);

	let acceptBig = $state(true);
	let rejectBuried = $state(true);
	let preTicked = $state(true);
	let wall = $state(false);
	let nag = $state(false);
	const signs = $derived([acceptBig && 'кнопка «Принять» заметнее «Отклонить»', rejectBuried && 'отказаться можно только через настройки или мелкую ссылку', preTicked && 'необязательные переключатели включены заранее', wall && 'без согласия сайт не открывается', nag && 'баннер возвращается после каждого отказа'].filter(Boolean) as string[]);
</script>

<figure class="dg">
	<figcaption>Инспектор cookie</figcaption>
	<h4 class="h">1. Разберите cookie сайта</h4>
	<p class="dg-out">Для каждой записи выберите категорию, затем нажмите «Проверить».</p>
	<ul class="items">
		{#each items as i (i.name)}
			<li class:bad={checked && pick[i.name] !== i.truth} class:good={checked && pick[i.name] === i.truth}>
				<div><code class="dg-mono">{i.name}</code> <span class="dim">ставит {i.who}; срок: {i.life}</span><br />{i.what}</div>
				<label class="sel">Категория
					<select bind:value={pick[i.name]} onchange={() => (checked = false)}>
						<option value="">выберите</option>
						{#each cats as c (c.id)}<option value={c.id}>{c.label}</option>{/each}
					</select>
				</label>
				{#if checked}<p class="why" aria-live="polite">{pick[i.name] === i.truth ? 'Верно.' : `Нет: ${cats.find((c) => c.id === i.truth)!.label.toLowerCase()}.`} {i.why}</p>{/if}
			</li>
		{/each}
	</ul>
	<div class="dg-ctl"><button type="button" onclick={() => (checked = true)}>Проверить</button>{#if checked}<span aria-live="polite">Верно: {right} из {items.length}.</span>{/if}</div>

	<h4 class="h">2. Соберите баннер и посмотрите на подталкивание</h4>
	<div class="opts">
		<label><input type="checkbox" bind:checked={acceptBig} /> Кнопка «Принять всё» крупная и яркая, «Отклонить» бледнее</label>
		<label><input type="checkbox" bind:checked={rejectBuried} /> Отказ спрятан в «Настройки» или мелкую ссылку</label>
		<label><input type="checkbox" bind:checked={preTicked} /> Переключатели аналитики и рекламы включены заранее</label>
		<label><input type="checkbox" bind:checked={wall} /> Без согласия сайт не открывается («стена из cookie»)</label>
		<label><input type="checkbox" bind:checked={nag} /> Баннер возвращается после каждого отказа</label>
	</div>
	<div class="banner" role="group" aria-label="Образец баннера">
		<p>Мы используем cookie. Необходимые работают всегда, остальные только с вашего выбора. <a href="#cookie-policy" onclick={(e) => e.preventDefault()}>Подробнее</a></p>
		<div class="btns">
			<button type="button" class={acceptBig ? 'big' : ''}>Принять всё</button>
			{#if !rejectBuried}<button type="button">Отклонить всё</button>{:else}<a href="#cookie-settings" class="tiny" onclick={(e) => e.preventDefault()}>Настройки</a>{/if}
			{#if !rejectBuried}<button type="button" class="ghost">Настроить</button>{/if}
		</div>
		{#if preTicked}<p class="dim">☑ Аналитика ☑ Реклама (включены заранее)</p>{:else}<p class="dim">☐ Аналитика ☐ Реклама (выбирает человек)</p>{/if}
	</div>
	<p class="dg-out" aria-live="polite"><strong>Признаков подталкивания: {signs.length}.</strong>
		{#if signs.length}{signs.join('; ')}. Такой баннер нельзя назвать честным: выбор должен быть настоящим.{:else} Баннер честный: «Принять» и «Отклонить» равны, ничего не включено заранее, сайт открыт при любом ответе.{/if}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> в первой части семь cookie (сессия, защита формы, язык, запись согласия, идентификатор Метрики, чат, рекламный идентификатор) нужно отнести к необходимым, предпочтениям, аналитике или рекламе. Во второй части баннер оценивается по пяти признакам подталкивания к согласию: заметная кнопка принятия, спрятанный отказ, предварительно включённые переключатели, стена из cookie и повторные запросы.</p>
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
