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
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });

	type Ans = 'ok' | 'cond' | 'no';
	const labels: Record<Ans, string> = { ok: t('Можно', 'Yes'), cond: t('Можно с условиями', 'Yes, with conditions'), no: t('Нельзя', 'No') };
	type Item = { id: string; what: string; right: Ans; why: string; row: string };
	const items: Item[] = [
		{ id: 'search', what: t('Фото из выдачи картинок поисковика, у которого не указан автор и лицензия', 'A photo from a search engine’s image results, with no author or license stated'), right: 'no', why: t('Найти в выдаче не значит получить право. Если лицензии нет, права принадлежат автору: нужно разрешение. Замените на фото с понятной лицензией.', 'Finding it in the results does not give you the right to use it. With no license, the rights belong to the author, and you need permission. Replace it with a photo under a clear license.'), row: t('неизвестна, заменить', 'unknown, replace') },
		{ id: 'unsplash', what: t('Фото с Unsplash', 'A photo from Unsplash'), right: 'ok', why: t('По лицензии Unsplash его можно использовать бесплатно, в том числе коммерчески, и не указывать автора (хотя указать приятно). Нельзя продавать фото как есть. Права людей и товарных знаков на снимке это не снимает.', 'Under the Unsplash License you may use it free of charge, commercially too, and you needn’t credit the author (though it is kind to). You may not sell the photo as it is, or compile photos to build a competing service. This does not lift the rights of people or trademarks shown in the picture.'), row: 'Unsplash License' },
		{ id: 'ccbysa', what: t('Фото из Википедии с лицензией CC BY-SA 4.0', 'A photo from Wikipedia under CC BY-SA 4.0'), right: 'cond', why: t('Можно, если указать автора, название, источник и лицензию со ссылкой и сказать об изменениях. Производная работа выходит под той же лицензией (SA).', 'You can, if you give the author, the title, the source and the license with a link, and say whether you changed it. A derivative work comes out under the same license (SA).'), row: t('CC BY-SA 4.0, подпись автора', 'CC BY-SA 4.0, the author’s credit') },
		{ id: 'ccnc', what: t('Фото с лицензией CC BY-NC (некоммерческое использование)', 'A photo under CC BY-NC (non-commercial use only)'), right: 'no', why: t('Сайт, который продаёт услуги, использует материал коммерчески, даже если вы ничего не берёте за само фото. NC материалы подходят только некоммерческим проектам.', 'A site that sells services uses material commercially, even if you charge nothing for the photo itself. NC material suits only non-commercial projects.'), row: t('CC BY-NC, заменить', 'CC BY-NC, replace') },
		{ id: 'ofl', what: t('Шрифт из Google Fonts (лицензия SIL OFL)', 'A font from Google Fonts (SIL OFL license)'), right: 'cond', why: t('Лицензия свободная, шрифт можно использовать в коммерческом проекте. Условие: лицензия сопровождает файл. Лучше разместить шрифт у себя, чтобы не передавать адреса посетителей.', 'The license is free and the font may be used in a commercial project. The condition: the license travels with the file. Better to host the font yourself, so as not to hand your visitors’ addresses to someone else.'), row: t('SIL OFL 1.1, файл у себя', 'SIL OFL 1.1, the file hosted by you') },
		{ id: 'pirate', what: t('Платный шрифт, скачанный из «бесплатного» набора на сомнительном сайте', 'A paid font downloaded from a “free” pack on a doubtful site'), right: 'no', why: t('Шрифт это программа или произведение с лицензией. Из пиратской копии права у вас нет: это нарушение, за него могут потребовать компенсацию.', 'A font is software or a work with a license. From a pirated copy you have no right: it is infringement, and the owner may seek damages (in the US, statutory damages of up to $150,000 per work if willful).'), row: t('нет прав, заменить', 'no rights, replace') },
		{ id: 'icons', what: t('Набор иконок с лицензией MIT', 'An icon set under the MIT license'), right: 'cond', why: t('Использование свободное; условие: сохранить текст лицензии и уведомление об авторских правах вместе с кодом.', 'Free use; the condition is to keep the text of the license and the copyright notice with the code.'), row: t('MIT, текст лицензии в репозитории', 'MIT, license text in the repository') },
		{ id: 'quote', what: t('Цитата из статьи в два предложения, с именем автора и ссылкой на источник, в рассказе о вашей теме', 'A two-sentence quotation from an article, with the author’s name and a link to the source, in a discussion of your topic'), right: 'cond', why: t('Цитирование допускается без согласия (ГК РФ, статья 1274) в научных, полемических, критических и информационных целях, в объёме, оправданном целью, с указанием автора и источника. Цитата для украшения под это не подпадает.', 'Quotation without permission can be allowed: in the US as fair use (17 U.S.C. § 107, judged case by case on four factors), in the UK as fair dealing for quotation (CDPA section 30, no longer than the purpose needs, with sufficient acknowledgement). A quotation used as decoration does not qualify.'), row: t('цитата, ст. 1274', 'a quotation, fair use') },
		{ id: 'copy', what: t('Текст услуги, скопированный у конкурента с заменой нескольких слов', 'Text for a service, copied from a competitor with a few words changed'), right: 'no', why: t('Переработка чужого произведения без согласия остаётся нарушением. К тому же дубли вредят поиску. Пишите своё: факты и идеи не охраняются, а форма их изложения охраняется.', 'Reworking someone else’s work without permission remains infringement. Copies also harm you in search. Write your own: facts and ideas are not protected, but the way they are expressed is.'), row: t('заменить своим текстом', 'replace with your own text') },
		{ id: 'person', what: t('Фотография сотрудника или клиента на странице «О нас»', 'A photograph of an employee or client on the “About” page'), right: 'cond', why: t('Изображение гражданина публикуют только с его согласия (ГК РФ, статья 152.1); фото это ещё и персональные данные. Нужно письменное согласие и право фотографа (или собственная съёмка).', 'You need the right to the photograph itself (your own shot or a photographer’s license) and the person’s permission. In the US, using someone’s likeness to promote a business can breach state right-of-publicity law, so get a signed release; in the UK and EU a photo is also personal data. Get written consent.'), row: t('письменное согласие', 'written consent') },
		{ id: 'ai', what: t('Картинка, созданная нейросетью', 'A picture made by an AI tool'), right: 'cond', why: t('Право зависит от условий сервиса и закона: автором по российскому закону признаётся человек, чьим творческим трудом создано произведение, поэтому судьба прав на результат неоднозначна, а картинка может напоминать чужие работы. Прочтите условия сервиса и не выдавайте её за снимок реального человека или объекта.', 'The right depends on the service’s terms and on the law. In the US the Copyright Office takes the view that copyright needs human authorship, so purely machine-made output may not be protected at all, and a picture may resemble other people’s work. Read the service’s terms and do not pass it off as a photo of a real person or object.'), row: t('нейросеть, условия сервиса', 'AI tool, service terms') }
	];
	let pick = $state<Record<string, Ans | ''>>({});
	let shown = $state(false);
	const score = $derived(items.filter((i) => pick[i.id] === i.right).length);
	const rows = $derived(items.filter((i) => pick[i.id]));
</script>

<figure class="dg">
	<figcaption>{t('Можно ли это использовать на коммерческом сайте?', 'Can you use this on a commercial site?')}</figcaption>
	<p class="dg-out">{t('Сайт продаёт услуги, значит использование коммерческое. Для каждого материала выберите ответ, потом нажмите «Проверить». Учебное прочтение на 28 октября 2026 года; настоящий ответ даёт лицензия на конкретный файл.', 'The site sells services, so its use is commercial. For each material choose an answer, then press “Check.” A teaching reading as of 30 October 2026; the real answer is the license on the particular file.')}</p>
	<ol class="list">
		{#each items as i (i.id)}
			<li class:good={shown && pick[i.id] === i.right} class:bad={shown && pick[i.id] !== i.right}>
				<p>{i.what}</p>
				<div class="dg-ctl" role="radiogroup" aria-label={i.what}>
					{#each Object.keys(labels) as a (a)}
						<button type="button" role="radio" aria-checked={pick[i.id] === a} class:on={pick[i.id] === a} onclick={() => { pick[i.id] = a as Ans; shown = false; }}>{labels[a as Ans]}</button>
					{/each}
				</div>
				{#if shown}<p class="why" aria-live="polite">{pick[i.id] === i.right ? t('Верно.', 'Correct.') : `Правильно: ${labels[i.right].toLowerCase()}.`} {i.why}</p>{/if}
			</li>
		{/each}
	</ol>
	<div class="dg-ctl"><button type="button" onclick={() => (shown = true)}>{t('Проверить', 'Check')}</button>{#if shown}<span aria-live="polite">{t('Верно:', 'Correct:')} {score} {t('из', 'of')} {items.length}.</span>{/if}</div>
	{#if rows.length}
		<p class="dg-out"><strong>{t('Реестр, который получился:', 'The register that results:')}</strong></p>
		<table class="reg">
			<thead><tr><th>{t('Материал', 'Material')}</th><th>{t('Запись в реестре', 'Register entry')}</th></tr></thead>
			<tbody>{#each rows as i (i.id)}<tr><td>{i.what}</td><td>{i.row}</td></tr>{/each}</tbody>
		</table>
	{/if}
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('одиннадцать материалов для коммерческого сайта и верные ответы. Нельзя: фото без понятной лицензии, фото CC BY-NC, шрифт из пиратского набора, переписанный чужой текст. Можно: фото Unsplash. Можно с условиями: фото CC BY-SA (автор, лицензия, ссылка), шрифт OFL (лицензия при файле, лучше у себя), иконки MIT (сохранить лицензию), цитата по статье 1274 ГК РФ, фото человека (письменное согласие), изображение нейросети (условия сервиса, неопределённость прав).', 'eleven materials for a commercial site and the right answers. No: a photo without a clear license, a CC BY-NC photo, a font from a pirated pack, a rewritten competitor text. Yes: an Unsplash photo. Yes with conditions: a CC BY-SA photo (author, license, link), an OFL font (license with the file, better hosted by you), MIT icons (keep the license), a quotation under fair use or fair dealing, a photo of a person (written consent), an AI picture (service terms, uncertain rights).')}</p>
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
