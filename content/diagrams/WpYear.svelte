<!--
	«Год жизни сайта на WordPress» (part 8, lesson 3). Seven things that typically happen over a year
	(an update, a plugin vulnerability, a big release, a conflict, an abandoned plugin, an old PHP, a
	spam wave), and what each costs under the settings the person chooses: automatic updates, backups,
	number of plugins. A model with invented hours, to show the shape of the cost, not to price it.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	let auto = $state(false);
	let backups = $state(true);
	let plugins = $state(8);
	let upTo = $state(7);

	// The words, one entry per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			months: ['январь', 'март', 'май', 'июль', 'сентябрь', 'ноябрь', 'декабрь'],
			t1: 'Вышло малое обновление безопасности ядра',
			n1a: 'Поставилось само, вы не заметили.',
			n1m: 'Вы вошли в админку и нажали «Обновить». Но пока вы не вошли, сайт работал с известной дырой.',
			t2: 'В плагине формы нашли уязвимость, исправление вышло на следующий день',
			n2a: 'Исправление поставилось автоматически.',
			n2m: 'Пока вы не заметили письмо, уязвимой оставалась форма, через которую люди пишут вам. Это самое частое окно для взлома.',
			t3: 'Крупное обновление ядра',
			n3: (n: number) => `Нужно проверить, что ${n} плагинов и тема с ним дружат. Чем плагинов больше, тем дольше проверка и тем вероятнее конфликт.`,
			t4a: 'Плагин кэша конфликтует с новой версией темы: сайт «белый экран»',
			t4b: 'Плагин кэша просит обновить настройки',
			n4a: 'Вы восстановили вчерашнюю копию за полчаса и потом разобрались.',
			n4b: 'Резервной копии нет: сайт собирали заново несколько дней. Вот цена «потом сделаю».',
			n4c: 'При небольшом наборе плагинов конфликты редки.',
			t5: 'Автор плагина больше не выпускает обновлений',
			n5: 'Плагин всё ещё работает, но уязвимости в нём уже никто не закроет. Его надо заменить.',
			t6: 'Хостинг снимает с поддержки старую версию PHP',
			n6: 'Тема и плагины должны работать на новой версии. Чем они старше, тем больше работы.',
			t7: 'Волна спама через форму заявок',
			n7: 'Нужна защита от роботов (капча или скрытое поле). Это тоже время.',
			caption: 'Год жизни сайта на WordPress',
			model: 'Это <strong>модель</strong> с придуманными часами. Она показывает форму расходов, а не точную цену.',
			auto: 'Автообновления включены',
			backups: 'Есть резервные копии вне сервера',
			plugins: 'Плагинов:',
			shown: 'Событий показано:',
			of: 'из 7',
			h: 'ч',
			total: 'Всего за период: около',
			totalTail: 'ч',
			withCheck: '(вместе с ежемесячной проверкой).',
			off: 'Автообновления выключены: вы тратите больше времени и дольше живёте с известными дырами.',
			on: 'Автообновления включены: времени уходит меньше, но редкий конфликт обновления вы заметите, только когда сайт сломается, поэтому копии обязательны.',
			alt: 'Текстовая альтернатива:',
			altText: 'за год у сайта на WordPress случаются обновления ядра, уязвимости в плагинах, конфликты, брошенные плагины и снятая с поддержки версия PHP. Автообновления и резервные копии сокращают время и ущерб, а каждый лишний плагин увеличивает риск и работу.'
		},
		en: {
			months: ['January', 'March', 'May', 'July', 'September', 'November', 'December'],
			t1: 'A minor security release of the core comes out',
			n1a: 'It installed itself, and you didn’t notice.',
			n1m: 'You logged in to the admin area and pressed “Update”. Until you did, the site ran with a known hole.',
			t2: 'A vulnerability is found in the form plugin, and the fix comes out the next day',
			n2a: 'The fix was installed automatically.',
			n2m: 'Until you noticed the email, the form people write to you through stayed vulnerable. This is the most common window for a break-in.',
			t3: 'A major release of the core',
			n3: (n: number) => `You need to check that your ${n} plugins and the theme work with it. The more plugins, the longer the check and the likelier a conflict.`,
			t4a: 'The cache plugin conflicts with the new theme version: the site shows a white screen',
			t4b: 'The cache plugin asks you to update its settings',
			n4a: 'You restored yesterday’s copy in half an hour and sorted it out afterwards.',
			n4b: 'There is no backup: the site was rebuilt over several days. That is the price of “I’ll do it later”.',
			n4c: 'With a small set of plugins, conflicts are rare.',
			t5: 'The plugin’s author stops releasing updates',
			n5: 'The plugin still works, but nobody will close the holes in it any more. It has to be replaced.',
			t6: 'The host retires an old version of PHP',
			n6: 'The theme and the plugins must work on the new version. The older they are, the more work it is.',
			t7: 'A wave of spam through the inquiry form',
			n7: 'You need protection from robots (a captcha or a hidden field). That takes time too.',
			caption: 'A year in the life of a WordPress site',
			model: 'This is a <strong>model</strong> with invented hours. It shows the shape of the costs, not an exact price.',
			auto: 'Automatic updates are on',
			backups: 'There are backups away from the server',
			plugins: 'Plugins:',
			shown: 'Events shown:',
			of: 'of 7',
			h: 'h',
			total: 'In all, about',
			totalTail: 'h',
			withCheck: '(with the monthly check).',
			off: 'Automatic updates are off: you spend more time and live longer with known holes.',
			on: 'Automatic updates are on: less time goes on it, but you notice a rare update conflict only when the site breaks, so backups are a must.',
			alt: 'Text alternative:',
			altText: 'in a year a WordPress site gets core updates, vulnerabilities in plugins, conflicts, abandoned plugins and a retired version of PHP. Automatic updates and backups cut the time and the damage, and every extra plugin adds risk and work.'
		}
	});

	type Ev = { month: string; title: string; hours: number; note: string };
	const events = $derived<Ev[]>([
		{ month: W.months[0], title: W.t1, hours: auto ? 0 : 0.3, note: auto ? W.n1a : W.n1m },
		{ month: W.months[1], title: W.t2, hours: auto ? 0.1 : 0.5, note: auto ? W.n2a : W.n2m },
		{ month: W.months[2], title: W.t3, hours: 1.5 + plugins * 0.1, note: W.n3(plugins) },
		{
			month: W.months[3],
			title: plugins >= 10 ? W.t4a : W.t4b,
			hours: plugins >= 10 ? (backups ? 0.7 : 8) : 0.3,
			note: plugins >= 10 ? (backups ? W.n4a : W.n4b) : W.n4c
		},
		{ month: W.months[4], title: W.t5, hours: 3, note: W.n5 },
		{ month: W.months[5], title: W.t6, hours: 2 + plugins * 0.05, note: W.n6 },
		{ month: W.months[6], title: W.t7, hours: 1, note: W.n7 }
	]);
	const shown = $derived(events.slice(0, upTo));
	const hours = $derived(shown.reduce((s, e) => s + e.hours, 0) + upTo * 0.25 * (auto ? 0.5 : 1));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{@html W.model}</p>
	<div class="ctl">
		<label><input type="checkbox" bind:checked={auto} /> {W.auto}</label>
		<label><input type="checkbox" bind:checked={backups} /> {W.backups}</label>
		<label>{W.plugins} <strong>{plugins}</strong> <input type="range" min="3" max="25" step="1" bind:value={plugins} /></label>
		<label>{W.shown} <strong>{upTo}</strong> {W.of} <input type="range" min="1" max="7" step="1" bind:value={upTo} /></label>
	</div>
	<ol class="tl" aria-live="polite">
		{#each shown as e, i (i)}
			<li>
				<span class="m">{e.month}</span>
				<div><strong>{e.title}</strong><br /><span class="dim">{e.note}</span></div>
				<span class="h">{e.hours.toFixed(1)} {W.h}</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>{W.total} {hours.toFixed(0)} {W.totalTail}</strong> {W.withCheck} {auto ? W.on : W.off}</p>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.ctl {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	.ctl label {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
	.tl {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.tl li {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) 3.5rem;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.m {
		color: var(--text-secondary);
	}
	.h {
		text-align: right;
		color: var(--text-primary);
	}
	.dim {
		color: var(--text-secondary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 36rem) {
		.tl li {
			grid-template-columns: 1fr;
		}
		.h {
			text-align: left;
		}
	}
</style>
