<!--
	«Год жизни сайта на WordPress» (part 8, lesson 3). Seven things that typically happen over a year
	(an update, a plugin vulnerability, a big release, a conflict, an abandoned plugin, an old PHP, a
	spam wave), and what each costs under the settings the person chooses: automatic updates, backups,
	number of plugins. A model with invented hours, to show the shape of the cost, not to price it.
-->
<script lang="ts">
	import './shared.css';

	let auto = $state(false);
	let backups = $state(true);
	let plugins = $state(8);
	let upTo = $state(7);

	type Ev = { month: string; title: string; hours: number; note: string };
	const events = $derived<Ev[]>([
		{
			month: 'январь',
			title: 'Вышло малое обновление безопасности ядра',
			hours: auto ? 0 : 0.3,
			note: auto ? 'Поставилось само, вы не заметили.' : 'Вы вошли в админку и нажали «Обновить». Но пока вы не вошли, сайт работал с известной дырой.'
		},
		{
			month: 'март',
			title: 'В плагине формы нашли уязвимость, исправление вышло на следующий день',
			hours: auto ? 0.1 : 0.5,
			note: auto ? 'Исправление поставилось автоматически.' : 'Пока вы не заметили письмо, уязвимой оставалась форма, через которую люди пишут вам. Это самое частое окно для взлома.'
		},
		{
			month: 'май',
			title: 'Крупное обновление ядра',
			hours: 1.5 + plugins * 0.1,
			note: `Нужно проверить, что ${plugins} плагинов и тема с ним дружат. Чем плагинов больше, тем дольше проверка и тем вероятнее конфликт.`
		},
		{
			month: 'июль',
			title: plugins >= 10 ? 'Плагин кэша конфликтует с новой версией темы: сайт «белый экран»' : 'Плагин кэша просит обновить настройки',
			hours: plugins >= 10 ? (backups ? 0.7 : 8) : 0.3,
			note:
				plugins >= 10
					? backups
						? 'Вы восстановили вчерашнюю копию за полчаса и потом разобрались.'
						: 'Резервной копии нет: сайт собирали заново несколько дней. Вот цена «потом сделаю».'
					: 'При небольшом наборе плагинов конфликты редки.'
		},
		{ month: 'сентябрь', title: 'Автор плагина больше не выпускает обновлений', hours: 3, note: 'Плагин всё ещё работает, но уязвимости в нём уже никто не закроет. Его надо заменить.' },
		{ month: 'ноябрь', title: 'Хостинг снимает с поддержки старую версию PHP', hours: 2 + plugins * 0.05, note: 'Тема и плагины должны работать на новой версии. Чем они старше, тем больше работы.' },
		{ month: 'декабрь', title: 'Волна спама через форму заявок', hours: 1, note: 'Нужна защита от роботов (капча или скрытое поле). Это тоже время.' }
	]);
	const shown = $derived(events.slice(0, upTo));
	const hours = $derived(shown.reduce((s, e) => s + e.hours, 0) + upTo * 0.25 * (auto ? 0.5 : 1));
</script>

<figure class="dg">
	<figcaption>Год жизни сайта на WordPress</figcaption>
	<p class="dg-out">Это <strong>модель</strong> с придуманными часами. Она показывает форму расходов, а не точную цену.</p>
	<div class="ctl">
		<label><input type="checkbox" bind:checked={auto} /> Автообновления включены</label>
		<label><input type="checkbox" bind:checked={backups} /> Есть резервные копии вне сервера</label>
		<label>Плагинов: <strong>{plugins}</strong> <input type="range" min="3" max="25" step="1" bind:value={plugins} /></label>
		<label>Событий показано: <strong>{upTo}</strong> из 7 <input type="range" min="1" max="7" step="1" bind:value={upTo} /></label>
	</div>
	<ol class="tl" aria-live="polite">
		{#each shown as e, i (i)}
			<li>
				<span class="m">{e.month}</span>
				<div><strong>{e.title}</strong><br /><span class="dim">{e.note}</span></div>
				<span class="h">{e.hours.toFixed(1)} ч</span>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>Всего за период: около {hours.toFixed(0)} ч</strong> (вместе с ежемесячной проверкой). {#if !auto}Автообновления выключены: вы тратите больше времени и дольше живёте с известными дырами.{:else}Автообновления включены: времени уходит меньше, но редкий конфликт обновления вы заметите, только когда сайт сломается, поэтому копии обязательны.{/if}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> за год у сайта на WordPress случаются обновления ядра, уязвимости в плагинах, конфликты, брошенные плагины и снятая с поддержки версия PHP. Автообновления и резервные копии сокращают время и ущерб, а каждый лишний плагин увеличивает риск и работу.</p>
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
