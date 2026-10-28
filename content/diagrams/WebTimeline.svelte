<!--
	«Сравни эпохи» (part 1, lesson 2): a slider over eleven moments, 1993–2025. Each shows three
	things side by side: what the web was doing, what the browsers were doing, and what the
	Russian web (Рунет) was doing. Only claims a source states are here; figures are quoted with
	the year they belong to.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	type Stage = { year: string; web: string; browsers: string; runet: string };
	const W = pick({
		ru: {
			caption: 'Веб, браузеры и Рунет: 1993–2025',
			year: 'Год:',
			earlier: 'Раньше',
			later: 'Позже',
			web: 'Веб',
			browsers: 'Браузеры',
			runet: 'Рунет',
			stages: [] = [
		{ year: '1993', web: 'Mosaic ставит картинки рядом с текстом, веб выходит за пределы науки.', browsers: 'Mosaic.', runet: 'Сеть в стране только растёт: в 1990 году «Релком» зарегистрировал домен .su.' },
		{ year: '1995', web: 'Netscape выходит на биржу, Amazon открывает интернет-магазин.', browsers: 'Netscape Navigator: около 75% рынка в первые месяцы. 24 августа Internet Explorer 1.0 выходит в пакете для Windows 95.', runet: 'Зона .ru создана годом раньше, в 1994-м: появляются первые сайты.' },
		{ year: '1998', web: 'Основан Google. Идёт судебное дело о том, не злоупотребляет ли Microsoft встроенным браузером.', browsers: 'Internet Explorer 4 вышел в 1997-м, он встроен в Windows. Netscape теряет рынок.', runet: 'Рамблер (1996), Яндекс (1997), в 1997-м придумано слово «Рунет».' },
		{ year: '2000', web: 'Пик пузыря доткомов: весной индекс Nasdaq достигает максимума, затем начинается обвал.', browsers: 'Internet Explorer почти один на рынке. В 2001-м у него больше 90%.', runet: 'Поисковики и первые порталы, почта, форумы.' },
		{ year: '2004', web: 'Facebook, Flickr, Gmail. Появляется слово «веб 2.0»: сайты, где контент делают пользователи.', browsers: 'В ноябре выходит Firefox 1.0, наследник кода Netscape.', runet: 'Блог-платформы вроде ЖЖ собирают сообщества.' },
		{ year: '2007', web: 'iPhone: полноценный веб в кармане. YouTube и Twitter уже работают.', browsers: 'Safari на iPhone. Страницы, сделанные для экрана компьютера, на телефоне неудобны.', runet: 'В 2006-м открылись Одноклассники и ВКонтакте.' },
		{ year: '2010', web: 'Итан Маркотт называет подход «адаптивный веб-дизайн»: один сайт под все экраны.', browsers: 'Доля Internet Explorer впервые падает ниже 50% (по данным StatCounter, октябрь).', runet: 'Соцсети и мобильный интернет растут вместе.' },
		{ year: '2012', web: 'Мобильный трафик заметно растёт: сайты начинают проектировать «сначала для телефона».', browsers: 'Chrome (2008) обгоняет Internet Explorer и Firefox и становится самым используемым браузером мира.', runet: 'Яндекс, Mail.ru и соцсети борются за внимание. Telegram запустят в 2013-м.' },
		{ year: '2017', web: 'Платформы (соцсети, маркетплейсы, магазины приложений) собирают аудиторию, а сайт становится одной из точек входа.', browsers: 'Chrome: больше 60% мира. Остальное делят Safari, Edge, Firefox.', runet: 'В Рунете укрепились свои платформы: поисковик Яндекс, соцсети ВКонтакте и Одноклассники, мессенджер Telegram.' },
		{ year: '2022', web: 'Платформы решают, что и кому показывать; переезд аудитории между ними занимает месяцы.', browsers: 'Почти весь мир сидит на трёх движках браузеров: Blink, WebKit и Gecko.', runet: 'Весной в России блокируют Facebook и Instagram, аудитория смещается к ВКонтакте и Telegram.' },
		{ year: '2025', web: 'ИИ-помощники отвечают на вопросы вместо списка ссылок, а конструкторы собирают сайты по описанию.', browsers: 'Браузеры встраивают ИИ-подсказки и поиск по странице.', runet: 'Рядом с Telegram развивается государственный мессенджер Max.' }
	] as Stage[]
		},
		en: {
			caption: 'The web, browsers and the Runet: 1993 to 2025',
			year: 'Year:',
			earlier: 'Earlier',
			later: 'Later',
			web: 'Web',
			browsers: 'Browsers',
			runet: 'Runet',
			stages: [
		{ year: '1993', web: 'Mosaic puts pictures beside the text, and the web steps beyond science.', browsers: 'Mosaic.', runet: 'The network in the country is only starting to grow: in 1990 Relcom registered the .su domain.' },
		{ year: '1995', web: 'Netscape goes public, and Amazon opens its online store.', browsers: 'Netscape Navigator: about 75% of the market in its first months. On 24 August Internet Explorer 1.0 arrives in the package for Windows 95.', runet: 'The .ru zone was created a year earlier, in 1994: the first sites appear.' },
		{ year: '1998', web: 'Google is founded. A court case is under way over whether Microsoft abuses its built-in browser.', browsers: 'Internet Explorer 4 came out in 1997 and is built into Windows. Netscape loses the market.', runet: 'Rambler (1996) and Yandex (1997); in 1997 the word “Runet” is coined.' },
		{ year: '2000', web: 'The dot-com bubble peaks: in the spring the Nasdaq index reaches its maximum, then the crash begins.', browsers: 'Internet Explorer is almost alone on the market. In 2001 it has over 90%.', runet: 'Search engines and the first portals, email, forums.' },
		{ year: '2004', web: 'Facebook, Flickr, Gmail. The word “web 2.0” appears: sites where users make the content.', browsers: 'In November Firefox 1.0 comes out, heir to Netscape’s code.', runet: 'Blog platforms such as LiveJournal gather communities.' },
		{ year: '2007', web: 'The iPhone: a full web in your pocket. YouTube and Twitter are already running.', browsers: 'Safari on the iPhone. Pages made for a computer screen are awkward on a phone.', runet: 'In 2006 Odnoklassniki and VK opened.' },
		{ year: '2010', web: 'Ethan Marcotte names the approach “responsive web design”: one site for all screens.', browsers: 'Internet Explorer’s share falls below 50% for the first time (StatCounter, October).', runet: 'Social networks and mobile internet grow together.' },
		{ year: '2012', web: 'Mobile traffic grows markedly: sites begin to be designed “mobile first”.', browsers: 'Chrome (2008) overtakes Internet Explorer and Firefox and becomes the most used browser in the world.', runet: 'Yandex, Mail.ru and the social networks fight for attention. Telegram will launch in 2013.' },
		{ year: '2017', web: 'Platforms (social networks, marketplaces, app stores) gather the audience, and a website becomes one of several entrances.', browsers: 'Chrome: over 60% of the world. Safari, Edge and Firefox share the rest.', runet: 'The Runet has platforms of its own: the Yandex search engine, the VK and Odnoklassniki networks, the Telegram messenger.' },
		{ year: '2022', web: 'Platforms decide what to show and to whom; an audience moving between them takes months.', browsers: 'Almost the whole world runs on three browser engines: Blink, WebKit and Gecko.', runet: 'In spring Russia blocks Facebook and Instagram, and the audience shifts to VK and Telegram.' },
		{ year: '2025', web: 'AI assistants answer questions instead of giving a list of links, and builders make sites from a description.', browsers: 'Browsers build in AI suggestions and search within the page.', runet: 'Alongside Telegram, a state-backed messenger, Max, develops.' }
	] as Stage[]
		}
	});
	const stages = W.stages;
	let i = $state(0);
	const s = $derived(stages[i]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.year}
			<input type="range" min="0" max={stages.length - 1} step="1" bind:value={i} aria-valuetext={s.year} />
		</label>
		<button type="button" onclick={() => (i = Math.max(0, i - 1))} disabled={i === 0}>{W.earlier}</button>
		<button type="button" onclick={() => (i = Math.min(stages.length - 1, i + 1))} disabled={i === stages.length - 1}>{W.later}</button>
	</div>
	<p class="year" aria-hidden="true">{s.year}</p>
	<div class="cols" aria-live="polite">
		<section aria-label={W.web}>
			<div class="dh">{W.web}</div>
			<p>{s.web}</p>
		</section>
		<section aria-label={W.browsers}>
			<div class="dh">{W.browsers}</div>
			<p>{s.browsers}</p>
		</section>
		<section aria-label={W.runet}>
			<div class="dh">{W.runet}</div>
			<p>{s.runet}</p>
		</section>
	</div>
</figure>

<style>
	.year {
		margin: 0 0 var(--space-3);
		font-family: var(--font-serif);
		font-size: var(--text-display-sm);
		color: var(--text-primary);
		line-height: 1;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-4);
	}
	section {
		border-top: 2px solid var(--border-rule);
		padding-top: var(--space-2);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	p {
		margin: 0;
	}
</style>
