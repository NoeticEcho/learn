<!--
	«Лупа для фраз» (part 15, lesson 11). Seven phrases that sites of experts often carry. For each the
	person names what is wrong with it (a superlative without a criterion, a guarantee of result, a
	hidden condition, false urgency, a figure no one can check, an unfair comparison, a promise the
	profession's rules forbid) and chooses the honest rewrite among three. The explanation names the
	rule it rests on: the Law on Advertising (38-FZ, article 5), or the profession's own rules. A
	teaching reading as of 28.10.2026, not legal advice. The numbers in the rewrites are examples:
	the person writes only what their own documents confirm.
-->
<script lang="ts">
	import './shared.css';

	const kinds = ['Превосходная степень без критерия', 'Гарантия результата', 'Скрытое или неполное условие', 'Ложная срочность или скидка', 'Непроверяемые цифры', 'Некорректное сравнение', 'Правила профессии'];
	type Claim = { id: string; text: string; kind: number; options: string[]; right: number; why: string };
	const claims: Claim[] = [
		{ id: 'best', text: 'Лучший специалист в городе', kind: 0, options: ['Один из лучших специалистов города', 'Работаю в профессии 12 лет, выполнено более 400 работ (реестр работ в разделе «Подтверждения»)', 'Лучший по мнению наших клиентов'], right: 1, why: 'Превосходная степень допустима, когда названы критерий и круг сравнения и это можно подтвердить. «Один из лучших» и «по мнению клиентов» ничего не проверяют. Замените оценку фактом, у которого есть подтверждение (статья 5 закона «О рекламе»: недостоверная и недобросовестная реклама).' },
		{ id: 'guarantee', text: 'Гарантируем, что границы вашего участка будут установлены', kind: 1, options: ['Почти гарантируем результат', 'После изучения документов объясню, какие у вас шансы и от чего зависит результат', 'Результат нашей работы всегда положительный'], right: 1, why: 'Исход зависит от документов, соседей, регистрирующего органа и суда, то есть не только от вас: гарантия результата вводит в заблуждение. «Почти гарантируем» то же самое мягче. Расскажите, что вы делаете и от чего зависит исход.' },
		{ id: 'star', text: 'Первая консультация бесплатно*  (мелкими буквами внизу страницы: «для заявок до 12:00 по вторникам»)', kind: 2, options: ['Первая консультация бесплатно*', 'Первая консультация до 20 минут бесплатна, по вторникам для заявок до 12:00', 'Консультация бесплатно! Подробности по телефону'], right: 1, why: 'Существенные условия называют рядом с обещанием, тем же размером, а не прячут за звёздочкой: реклама без существенной части информации, искажающей смысл, не допускается (статья 5, часть 7).' },
		{ id: 'sale', text: 'Скидка 50% только сегодня!  (так написано каждый день)', kind: 3, options: ['Скидка 50% только сегодня!', 'Цена на услугу с 1 по 15 ноября 2026 года: 6 000 ₽ вместо 8 000 ₽', 'Скидка до 50%'], right: 1, why: 'Скидка, которая действует всегда, вводит в заблуждение: достоверными должны быть цена, срок и условия. Называйте даты и обе цены. «До 50%» без указания, на что, повторяет проблему.' },
		{ id: 'trust', text: 'Нам доверяют тысячи клиентов', kind: 4, options: ['Нам доверяют тысячи клиентов', 'С 2012 года выполнено 480 работ (число из реестра работ)', 'Нам доверяет множество людей'], right: 1, why: 'Число, которое никто не может проверить, недостоверно, если оно не соответствует действительности. Называйте то, что можно показать: с какого года, сколько работ, откуда число. Если доказать нечем, уберите.' },
		{ id: 'cheaper', text: 'Дешевле, чем у конкурентов', kind: 5, options: ['Дешевле, чем у большинства', 'Межевание участка от 8 000 ₽; в цену входят выезд, измерения и межевой план', 'Цены ниже рыночных'], right: 1, why: 'Сравнение с другими допустимо только корректное: с указанием, с кем и по какому критерию, и проверяемое. Некорректные сравнения прямо названы в статье 5. Проще и надёжнее назвать свою цену и что в неё входит.' },
		{ id: 'reviews', text: 'Отзывы клиентов (адвокат): «Выиграли дело за неделю!»', kind: 6, options: ['Оставить отзыв, но без имени клиента', 'Рассказать о порядке работы по делу: этапы, документы, сроки, без исходов', 'Заменить отзыв на «Мы всегда выигрываем»'], right: 1, why: 'У адвокатов есть собственные ограничения (Кодекс профессиональной этики адвоката и решения палат): обычно нельзя обещать исход, хвалиться победами и раскрывать сведения о делах клиентов. Уточните правила своей профессии в палате или СРО; безопаснее показать процесс, а не результат.' }
	];
	let kindPick = $state<Record<string, number | null>>({});
	let optPick = $state<Record<string, number | null>>({});
	let shown = $state<Record<string, boolean>>({});
	const done = $derived(claims.filter((c) => shown[c.id] && kindPick[c.id] === c.kind && optPick[c.id] === c.right).length);
</script>

<figure class="dg">
	<figcaption>Лупа для фраз с сайта</figcaption>
	<p class="dg-out">Для каждой фразы выберите, что с ней не так, и честную замену. Числа в заменах примерные: вы пишете только то, что подтверждают ваши документы. Учебное прочтение на 28 октября 2026 года, не консультация.</p>
	<ol class="list">
		{#each claims as c (c.id)}
			<li class:good={shown[c.id] && kindPick[c.id] === c.kind && optPick[c.id] === c.right}>
				<p class="q">«{c.text}»</p>
				<label class="sel">Что не так
					<select bind:value={kindPick[c.id]} onchange={() => (shown[c.id] = false)}>
						<option value={null}>выберите</option>
						{#each kinds as k, i (k)}<option value={i}>{k}</option>{/each}
					</select>
				</label>
				<fieldset class="opts">
					<legend>Честная замена</legend>
					{#each c.options as o, i (i)}
						<label><input type="radio" name={`o-${c.id}`} value={i} bind:group={optPick[c.id]} onchange={() => (shown[c.id] = false)} /> {o}</label>
					{/each}
				</fieldset>
				<div class="dg-ctl"><button type="button" onclick={() => (shown[c.id] = true)}>Проверить</button></div>
				{#if shown[c.id]}
					<p class="why" aria-live="polite"><strong>{kindPick[c.id] === c.kind ? 'Причина названа верно.' : `Не то: здесь «${kinds[c.kind].toLowerCase()}».`} {optPick[c.id] === c.right ? 'Замена честная.' : 'Другая замена честнее.'}</strong> {c.why}</p>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>Разобрано верно: {done} из {claims.length}.</strong></p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> семь фраз с сайта эксперта и честные замены: «лучший специалист» меняется на подтверждённые факты о стаже и числе работ; «гарантируем результат» на объяснение шансов; скрытое условие под звёздочкой на условие рядом с обещанием; вечная скидка на цену с датами; «тысячи клиентов» на проверяемое число; «дешевле конкурентов» на свою цену и состав; отзыв о выигранном деле у адвоката на описание порядка работы.</p>
</figure>

<style>
	.list {
		margin: 0;
		padding-left: var(--space-5) !important;
		display: grid;
		gap: var(--space-3);
	}
	.list li {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-2);
	}
	.list li.good {
		border-color: var(--accent-measure);
	}
	.q {
		margin: 0;
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.sel {
		display: grid;
		gap: var(--space-1);
	}
	.opts {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.opts label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: start;
		min-height: var(--hit-min);
	}
	.why {
		margin: 0;
	}
</style>
