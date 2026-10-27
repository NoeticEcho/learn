<!--
	«Можно ли это использовать» (part 15, lesson 10). Eleven materials a small commercial site might
	want: photographs, fonts, icons, a quotation, a competitor's text, a picture of a person, a
	generated image. For each the person decides: allowed, allowed with conditions, or not allowed,
	and reads why, with the article of the Civil Code or the licence's own condition. The answers
	are the lesson's teaching reading as of 28.10.2026 (a commercial site; Russian law), not legal
	advice; the licence text of the actual file always decides.
-->
<script lang="ts">
	import './shared.css';

	type Ans = 'ok' | 'cond' | 'no';
	const labels: Record<Ans, string> = { ok: 'Можно', cond: 'Можно с условиями', no: 'Нельзя' };
	type Item = { id: string; what: string; right: Ans; why: string; row: string };
	const items: Item[] = [
		{ id: 'search', what: 'Фото из выдачи картинок поисковика, у которого не указан автор и лицензия', right: 'no', why: 'Найти в выдаче не значит получить право. Если лицензии нет, права принадлежат автору: нужно разрешение. Замените на фото с понятной лицензией.', row: 'неизвестна, заменить' },
		{ id: 'unsplash', what: 'Фото с Unsplash', right: 'ok', why: 'По лицензии Unsplash его можно использовать бесплатно, в том числе коммерчески, и не указывать автора (хотя указать приятно). Нельзя продавать фото как есть. Права людей и товарных знаков на снимке это не снимает.', row: 'Unsplash License' },
		{ id: 'ccbysa', what: 'Фото из Википедии с лицензией CC BY-SA 4.0', right: 'cond', why: 'Можно, если указать автора, название, источник и лицензию со ссылкой и сказать об изменениях. Производная работа выходит под той же лицензией (SA).', row: 'CC BY-SA 4.0, подпись автора' },
		{ id: 'ccnc', what: 'Фото с лицензией CC BY-NC (некоммерческое использование)', right: 'no', why: 'Сайт, который продаёт услуги, использует материал коммерчески, даже если вы ничего не берёте за само фото. NC материалы подходят только некоммерческим проектам.', row: 'CC BY-NC, заменить' },
		{ id: 'ofl', what: 'Шрифт из Google Fonts (лицензия SIL OFL)', right: 'cond', why: 'Лицензия свободная, шрифт можно использовать в коммерческом проекте. Условие: лицензия сопровождает файл. Лучше разместить шрифт у себя, чтобы не передавать адреса посетителей.', row: 'SIL OFL 1.1, файл у себя' },
		{ id: 'pirate', what: 'Платный шрифт, скачанный из «бесплатного» набора на сомнительном сайте', right: 'no', why: 'Шрифт это программа или произведение с лицензией. Из пиратской копии права у вас нет: это нарушение, за него могут потребовать компенсацию.', row: 'нет прав, заменить' },
		{ id: 'icons', what: 'Набор иконок с лицензией MIT', right: 'cond', why: 'Использование свободное; условие: сохранить текст лицензии и уведомление об авторских правах вместе с кодом.', row: 'MIT, текст лицензии в репозитории' },
		{ id: 'quote', what: 'Цитата из статьи в два предложения, с именем автора и ссылкой на источник, в рассказе о вашей теме', right: 'cond', why: 'Цитирование допускается без согласия (ГК РФ, статья 1274) в научных, полемических, критических и информационных целях, в объёме, оправданном целью, с указанием автора и источника. Цитата для украшения под это не подпадает.', row: 'цитата, ст. 1274' },
		{ id: 'copy', what: 'Текст услуги, скопированный у конкурента с заменой нескольких слов', right: 'no', why: 'Переработка чужого произведения без согласия остаётся нарушением. К тому же дубли вредят поиску. Пишите своё: факты и идеи не охраняются, а форма их изложения охраняется.', row: 'заменить своим текстом' },
		{ id: 'person', what: 'Фотография сотрудника или клиента на странице «О нас»', right: 'cond', why: 'Изображение гражданина публикуют только с его согласия (ГК РФ, статья 152.1); фото это ещё и персональные данные. Нужно письменное согласие и право фотографа (или собственная съёмка).', row: 'письменное согласие' },
		{ id: 'ai', what: 'Картинка, созданная нейросетью', right: 'cond', why: 'Право зависит от условий сервиса и закона: автором по российскому закону признаётся человек, чьим творческим трудом создано произведение, поэтому судьба прав на результат неоднозначна, а картинка может напоминать чужие работы. Прочтите условия сервиса и не выдавайте её за снимок реального человека или объекта.', row: 'нейросеть, условия сервиса' }
	];
	let pick = $state<Record<string, Ans | ''>>({});
	let shown = $state(false);
	const score = $derived(items.filter((i) => pick[i.id] === i.right).length);
	const rows = $derived(items.filter((i) => pick[i.id]));
</script>

<figure class="dg">
	<figcaption>Можно ли это использовать на коммерческом сайте?</figcaption>
	<p class="dg-out">Сайт продаёт услуги, значит использование коммерческое. Для каждого материала выберите ответ, потом нажмите «Проверить». Учебное прочтение на 28 октября 2026 года; настоящий ответ даёт лицензия на конкретный файл.</p>
	<ol class="list">
		{#each items as i (i.id)}
			<li class:good={shown && pick[i.id] === i.right} class:bad={shown && pick[i.id] !== i.right}>
				<p>{i.what}</p>
				<div class="dg-ctl" role="radiogroup" aria-label={i.what}>
					{#each Object.keys(labels) as a (a)}
						<button type="button" role="radio" aria-checked={pick[i.id] === a} class:on={pick[i.id] === a} onclick={() => { pick[i.id] = a as Ans; shown = false; }}>{labels[a as Ans]}</button>
					{/each}
				</div>
				{#if shown}<p class="why" aria-live="polite">{pick[i.id] === i.right ? 'Верно.' : `Правильно: ${labels[i.right].toLowerCase()}.`} {i.why}</p>{/if}
			</li>
		{/each}
	</ol>
	<div class="dg-ctl"><button type="button" onclick={() => (shown = true)}>Проверить</button>{#if shown}<span aria-live="polite">Верно: {score} из {items.length}.</span>{/if}</div>
	{#if rows.length}
		<p class="dg-out"><strong>Реестр, который получился:</strong></p>
		<table class="reg">
			<thead><tr><th>Материал</th><th>Запись в реестре</th></tr></thead>
			<tbody>{#each rows as i (i.id)}<tr><td>{i.what}</td><td>{i.row}</td></tr>{/each}</tbody>
		</table>
	{/if}
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> одиннадцать материалов для коммерческого сайта и верные ответы. Нельзя: фото без понятной лицензии, фото CC BY-NC, шрифт из пиратского набора, переписанный чужой текст. Можно: фото Unsplash. Можно с условиями: фото CC BY-SA (автор, лицензия, ссылка), шрифт OFL (лицензия при файле, лучше у себя), иконки MIT (сохранить лицензию), цитата по статье 1274 ГК РФ, фото человека (письменное согласие), изображение нейросети (условия сервиса, неопределённость прав).</p>
</figure>

<style>
	.list {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-5) !important;
		display: grid;
		gap: var(--space-3);
	}
	.list li {
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.list li p {
		margin: 0 0 var(--space-2);
	}
	.list li.good {
		border-color: var(--accent-measure);
	}
	.list li.bad {
		border-style: dashed;
	}
	.why {
		margin: var(--space-2) 0 0 !important;
	}
	.reg {
		border-collapse: collapse;
		width: 100%;
	}
	.reg th,
	.reg td {
		text-align: left;
		padding: var(--space-1) var(--space-2);
		border-bottom: var(--line) solid var(--border-hairline);
	}
</style>
