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
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });

	const kinds = [t('Превосходная степень без критерия', 'Superlative with no criterion'), t('Гарантия результата', 'Guarantee of a result'), t('Скрытое или неполное условие', 'Hidden or incomplete condition'), t('Ложная срочность или скидка', 'False urgency or discount'), t('Непроверяемые цифры', 'Unverifiable numbers'), t('Некорректное сравнение', 'Unfair comparison'), t('Правила профессии', 'Professional rules')];
	type Claim = { id: string; text: string; kind: number; options: string[]; right: number; why: string };
	const claims: Claim[] = [
		{ id: 'best', text: t('Лучший специалист в городе', 'The best specialist in town'), kind: 0, options: [t('Один из лучших специалистов города', 'One of the best specialists in town'), t('Работаю в профессии 12 лет, выполнено более 400 работ (реестр работ в разделе «Подтверждения»)', 'I have worked in the profession for 12 years and completed more than 400 jobs (the job register is in the “Credentials” section)'), t('Лучший по мнению наших клиентов', 'The best in our clients’ opinion')], right: 1, why: t('Превосходная степень допустима, когда названы критерий и круг сравнения и это можно подтвердить. «Один из лучших» и «по мнению клиентов» ничего не проверяют. Замените оценку фактом, у которого есть подтверждение (статья 5 закона «О рекламе»: недостоверная и недобросовестная реклама).', 'A superlative is acceptable only when the criterion and the group compared are named and you can prove it. “One of the best” and “in our clients’ opinion” check nothing. Replace the rating with a fact you can back up (the FTC expects a reasonable basis before you make an objective claim, and CAP Code rule 3.7 asks for documentary evidence).') },
		{ id: 'guarantee', text: t('Гарантируем, что границы вашего участка будут установлены', 'We guarantee that your property boundaries will be established'), kind: 1, options: [t('Почти гарантируем результат', 'We almost guarantee the result'), t('После изучения документов объясню, какие у вас шансы и от чего зависит результат', 'After reviewing your documents I will explain what your chances are and what the result depends on'), t('Результат нашей работы всегда положительный', 'The result of our work is always positive')], right: 1, why: t('Исход зависит от документов, соседей, регистрирующего органа и суда, то есть не только от вас: гарантия результата вводит в заблуждение. «Почти гарантируем» то же самое мягче. Расскажите, что вы делаете и от чего зависит исход.', 'The outcome depends on documents, neighbors, the recording office and the court, that is, not only on you: a guarantee of a result misleads. “Almost guarantee” is the same, only softer. Describe what you do and what the outcome depends on.') },
		{ id: 'star', text: t('Первая консультация бесплатно*  (мелкими буквами внизу страницы: «для заявок до 12:00 по вторникам»)', 'The first consultation is free*  (in small print at the foot of the page: “for requests before 12:00 on Tuesdays”)'), kind: 2, options: [t('Первая консультация бесплатно*', 'The first consultation is free*'), t('Первая консультация до 20 минут бесплатна, по вторникам для заявок до 12:00', 'The first consultation of up to 20 minutes is free, on Tuesdays, for requests before 12:00'), t('Консультация бесплатно! Подробности по телефону', 'Free consultation! Details by phone')], right: 1, why: t('Существенные условия называют рядом с обещанием, тем же размером, а не прячут за звёздочкой: реклама без существенной части информации, искажающей смысл, не допускается (статья 5, часть 7).', 'Material conditions go beside the promise, in the same size, and are not hidden behind an asterisk: the FTC says a disclosure must be clear and conspicuous, and CAP Code rule 3.9 bars omitting significant limitations and qualifications.') },
		{ id: 'sale', text: t('Скидка 50% только сегодня!  (так написано каждый день)', '50% off today only!  (this is written every day)'), kind: 3, options: [t('Скидка 50% только сегодня!', '50% off today only!'), t('Цена на услугу с 1 по 15 ноября 2026 года: 6 000 ₽ вместо 8 000 ₽', 'The price of the service from 1 to 15 November 2026: $600 instead of $800'), t('Скидка до 50%', 'Up to 50% off')], right: 1, why: t('Скидка, которая действует всегда, вводит в заблуждение: достоверными должны быть цена, срок и условия. Называйте даты и обе цены. «До 50%» без указания, на что, повторяет проблему.', 'A discount that always applies misleads: the price, the period and the terms must be true. Give the dates and both prices. “Up to 50%” without saying on what repeats the problem. (In the EU, a false “limited time” claim is always banned.)') },
		{ id: 'trust', text: t('Нам доверяют тысячи клиентов', 'Thousands of clients trust us'), kind: 4, options: [t('Нам доверяют тысячи клиентов', 'Thousands of clients trust us'), t('С 2012 года выполнено 480 работ (число из реестра работ)', '480 jobs completed since 2012 (a figure from the job register)'), t('Нам доверяет множество людей', 'Many people trust us')], right: 1, why: t('Число, которое никто не может проверить, недостоверно, если оно не соответствует действительности. Называйте то, что можно показать: с какого года, сколько работ, откуда число. Если доказать нечем, уберите.', 'A number nobody can check is deceptive if it isn’t true. Name what you can show: since which year, how many jobs, where the number comes from. If you have no proof, take it out.') },
		{ id: 'cheaper', text: t('Дешевле, чем у конкурентов', 'Cheaper than our competitors'), kind: 5, options: [t('Дешевле, чем у большинства', 'Cheaper than most'), t('Межевание участка от 8 000 ₽; в цену входят выезд, измерения и межевой план', 'A boundary survey from $800; the price includes the site visit, the measurements and the survey plan'), t('Цены ниже рыночных', 'Prices below the market')], right: 1, why: t('Сравнение с другими допустимо только корректное: с указанием, с кем и по какому критерию, и проверяемое. Некорректные сравнения прямо названы в статье 5. Проще и надёжнее назвать свою цену и что в неё входит.', 'A comparison with others is allowed only if it is fair: it says with whom and by what measure, and it can be verified. Unfair comparisons are misleading under the FTC Act and the CAP Code. It is simpler and safer to state your price and what it includes.') },
		{ id: 'reviews', text: t('Отзывы клиентов (адвокат): «Выиграли дело за неделю!»', 'Client reviews (a lawyer): “They won my case in a week!”'), kind: 6, options: [t('Оставить отзыв, но без имени клиента', 'Leave the review up, but without the client’s name'), t('Рассказать о порядке работы по делу: этапы, документы, сроки, без исходов', 'Describe how a case is handled: the stages, the documents, the timing, with no outcomes'), t('Заменить отзыв на «Мы всегда выигрываем»', 'Replace the review with “We always win”')], right: 1, why: t('У адвокатов есть собственные ограничения (Кодекс профессиональной этики адвоката и решения палат): обычно нельзя обещать исход, хвалиться победами и раскрывать сведения о делах клиентов. Уточните правила своей профессии в палате или СРО; безопаснее показать процесс, а не результат.', 'Lawyers have rules of their own (state bar rules modeled on ABA Model Rule 7.1): you usually cannot promise an outcome, boast of wins or reveal information about clients’ cases. Check the rules of your profession with your bar or board; it is safer to show the process than the result.') }
	];
	let kindPick = $state<Record<string, number | null>>({});
	let optPick = $state<Record<string, number | null>>({});
	let shown = $state<Record<string, boolean>>({});
	const done = $derived(claims.filter((c) => shown[c.id] && kindPick[c.id] === c.kind && optPick[c.id] === c.right).length);
</script>

<figure class="dg">
	<figcaption>{t('Лупа для фраз с сайта', 'A magnifier for phrases from the site')}</figcaption>
	<p class="dg-out">{t('Для каждой фразы выберите, что с ней не так, и честную замену. Числа в заменах примерные: вы пишете только то, что подтверждают ваши документы. Учебное прочтение на 28 октября 2026 года, не консультация.', 'For each phrase, choose what is wrong with it and the honest replacement. The numbers in the replacements are examples: you write only what your documents support. A teaching reading as of 30 October 2026, not legal advice.')}</p>
	<ol class="list">
		{#each claims as c (c.id)}
			<li class:good={shown[c.id] && kindPick[c.id] === c.kind && optPick[c.id] === c.right}>
				<p class="q">«{c.text}»</p>
				<label class="sel">{t('Что не так', 'What is wrong')}
					<select bind:value={kindPick[c.id]} onchange={() => (shown[c.id] = false)}>
						<option value={null}>{t('выберите', 'choose')}</option>
						{#each kinds as k, i (k)}<option value={i}>{k}</option>{/each}
					</select>
				</label>
				<fieldset class="opts">
					<legend>{t('Честная замена', 'Honest replacement')}</legend>
					{#each c.options as o, i (i)}
						<label><input type="radio" name={`o-${c.id}`} value={i} bind:group={optPick[c.id]} onchange={() => (shown[c.id] = false)} /> {o}</label>
					{/each}
				</fieldset>
				<div class="dg-ctl"><button type="button" onclick={() => (shown[c.id] = true)}>{t('Проверить', 'Check')}</button></div>
				{#if shown[c.id]}
					<p class="why" aria-live="polite"><strong>{kindPick[c.id] === c.kind ? t('Причина названа верно.', 'The reason is named correctly.') : `Не то: здесь «${kinds[c.kind].toLowerCase()}».`} {optPick[c.id] === c.right ? t('Замена честная.', 'The replacement is honest.') : t('Другая замена честнее.', 'Another replacement is more honest.')}</strong> {c.why}</p>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>{t('Разобрано верно:', 'Taken apart correctly:')} {done} {t('из', 'of')} {claims.length}.</strong></p>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('семь фраз с сайта эксперта и честные замены: «лучший специалист» меняется на подтверждённые факты о стаже и числе работ; «гарантируем результат» на объяснение шансов; скрытое условие под звёздочкой на условие рядом с обещанием; вечная скидка на цену с датами; «тысячи клиентов» на проверяемое число; «дешевле конкурентов» на свою цену и состав; отзыв о выигранном деле у адвоката на описание порядка работы.', 'seven phrases from an expert’s site and honest replacements: “the best specialist” becomes documented facts about experience and the number of jobs; “we guarantee a result” becomes an explanation of the chances; a condition hidden under an asterisk becomes a condition beside the promise; a permanent discount becomes a price with dates; “thousands of clients” becomes a number you can check; “cheaper than competitors” becomes your own price and what it includes; a lawyer’s review of a won case becomes a description of how work proceeds.')}</p>
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
