<!--
	«Сравни эпохи» (part 1, lesson 2): a slider over eleven moments, 1993–2025. Each shows three
	things side by side: what the web was doing, what the browsers were doing, and what the
	Russian web (Рунет) was doing. Only claims a source states are here; figures are quoted with
	the year they belong to.
-->
<script lang="ts">
	import './shared.css';
	const stages: { year: string; web: string; browsers: string; runet: string }[] = [
		{ year: '1993', web: 'Mosaic ставит картинки рядом с текстом, веб выходит за пределы науки.', browsers: 'Mosaic.', runet: 'Сеть в стране только растёт: в 1990 году «Релком» зарегистрировал домен .su.' },
		{ year: '1995', web: 'Netscape выходит на биржу, Amazon открывает онлайн-магазин.', browsers: 'Netscape Navigator: около 75% рынка в первые месяцы. 24 августа Internet Explorer 1.0 выходит в пакете для Windows 95.', runet: 'Зона .ru создана годом раньше, в 1994-м: появляются первые сайты.' },
		{ year: '1998', web: 'Основан Google. Идёт судебное дело о том, не злоупотребляет ли Microsoft встроенным браузером.', browsers: 'Internet Explorer 4 вышел в 1997-м, он встроен в Windows. Netscape теряет рынок.', runet: 'Рамблер (1996), Яндекс (1997), в 1997-м придумано слово «Рунет».' },
		{ year: '2000', web: 'Пик пузыря доткомов: весной индекс Nasdaq достигает максимума, затем начинается обвал.', browsers: 'Internet Explorer почти один на рынке. В 2001-м у него больше 90%.', runet: 'Поисковики и первые порталы, почта, форумы.' },
		{ year: '2004', web: 'Facebook, Flickr, Gmail. Появляется слово «веб 2.0»: сайты, где контент делают пользователи.', browsers: 'В ноябре выходит Firefox 1.0, наследник кода Netscape.', runet: 'Блог-платформы вроде ЖЖ собирают сообщества.' },
		{ year: '2007', web: 'iPhone: полноценный веб в кармане. YouTube и Twitter уже работают.', browsers: 'Safari на iPhone. Страницы, сделанные для экрана компьютера, на телефоне неудобны.', runet: 'В 2006-м открылись Одноклассники и ВКонтакте.' },
		{ year: '2010', web: 'Этан Маркотт называет подход «адаптивный веб-дизайн»: один сайт под все экраны.', browsers: 'Доля Internet Explorer впервые падает ниже 50% (по данным StatCounter, октябрь).', runet: 'Соцсети и мобильный интернет растут вместе.' },
		{ year: '2012', web: 'Мобильный трафик заметно растёт: сайты начинают проектировать «сначала для телефона».', browsers: 'Chrome (2008) обгоняет Internet Explorer и Firefox и становится самым используемым браузером мира.', runet: 'Яндекс, Mail.ru и соцсети борются за внимание. Telegram запустят в 2013-м.' },
		{ year: '2017', web: 'Платформы (соцсети, маркетплейсы, магазины приложений) собирают аудиторию, а сайт становится одной из точек входа.', browsers: 'Chrome: больше 60% мира. Остальное делят Safari, Edge, Firefox.', runet: 'В Рунете укрепились свои платформы: поисковик Яндекс, соцсети ВКонтакте и Одноклассники, мессенджер Telegram.' },
		{ year: '2022', web: 'Платформы решают, что и кому показывать; переезд аудитории между ними занимает месяцы.', browsers: 'Почти весь мир сидит на трёх движках браузеров: Blink, WebKit и Gecko.', runet: 'Весной в России блокируют Facebook и Instagram, аудитория смещается к ВКонтакте и Telegram.' },
		{ year: '2025', web: 'ИИ-помощники отвечают на вопросы вместо списка ссылок, а конструкторы собирают сайты по описанию.', browsers: 'Браузеры встраивают ИИ-подсказки и поиск по странице.', runet: 'Рядом с Telegram развивается государственный мессенджер Max.' }
	];
	let i = $state(0);
	const s = $derived(stages[i]);
</script>

<figure class="dg">
	<figcaption>Веб, браузеры и Рунет: 1993–2025</figcaption>
	<div class="dg-ctl">
		<label>
			Год:
			<input type="range" min="0" max={stages.length - 1} step="1" bind:value={i} aria-valuetext={s.year} />
		</label>
		<button type="button" onclick={() => (i = Math.max(0, i - 1))} disabled={i === 0}>Раньше</button>
		<button type="button" onclick={() => (i = Math.min(stages.length - 1, i + 1))} disabled={i === stages.length - 1}>Позже</button>
	</div>
	<p class="year" aria-hidden="true">{s.year}</p>
	<div class="cols" aria-live="polite">
		<section aria-label="Веб">
			<div class="dh">Веб</div>
			<p>{s.web}</p>
		</section>
		<section aria-label="Браузеры">
			<div class="dh">Браузеры</div>
			<p>{s.browsers}</p>
		</section>
		<section aria-label="Рунет">
			<div class="dh">Рунет</div>
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
