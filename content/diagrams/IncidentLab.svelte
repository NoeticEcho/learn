<!--
	«Авария: что вернётся» (part 9, lesson 9). Two small models. First: an incident (a dead disk,
	a hacked server, a file deleted by mistake, a data centre that is unreachable), a backup plan
	(none, on the same server, two places in one data centre, two places in two regions), how often
	copies are made and whether a restore was ever tried; the page says what is recovered, how much
	is lost at worst (up to one interval) and how long it takes. Second: how quickly an outage is
	noticed, by how often it is checked and by what: a check of the home page alone does not see
	that the person's own main action has stopped working. Both are teaching models with rounded
	orders of magnitude, not promises about any provider.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			incidents: [
				{ id: 'disk', label: 'Умер диск сервера' },
				{ id: 'hack', label: 'Сервер взломан, всё зашифровано' },
				{ id: 'oops', label: 'Файл удалили по ошибке' },
				{ id: 'dc', label: 'Дата-центр недоступен' }
			],
			plans: [
				{ id: 'none', label: 'Копий нет' },
				{ id: 'same', label: 'Копия на том же сервере' },
				{ id: 'two-dc', label: 'Две копии в одном дата-центре' },
				{ id: 'two-reg', label: 'Копии в двух местах, одна в другом регионе' }
			],
			intervals: [
				{ v: 1, label: 'раз в час' },
				{ v: 24, label: 'раз в сутки' },
				{ v: 168, label: 'раз в неделю' }
			],
			upToWeek: 'до недели',
			upToDay: 'до суток',
			upToHour: 'до часа',
			aboutHour: 'около часа',
			unknown: 'неизвестно: копию ни разу не открывали, и она может оказаться пустой или битой',
			noneDc: 'Копий нет. Когда дата-центр вернётся, данные, возможно, окажутся на месте, но гарантий нет, и срок вам неизвестен.',
			noneLost: 'Копий нет: данные потеряны безвозвратно. Остаётся собрать сайт заново из того, что сохранилось в репозитории.',
			sameOops: (lost: string, slow: string) => `Вернётся: копия лежит рядом. Потери: ${lost}. Восстановление: ${slow}.`,
			sameDisk: 'Копия лежала на том же диске и умерла вместе с ним. Это не копия, а второй экземпляр на том же риске.',
			sameHack: 'Злоумышленник зашифровал и копию: она лежала там же. Копию, до которой достаёт тот, кто взломал сервер, нельзя считать копией.',
			sameDc: 'Копия в том же дата-центре, и он недоступен: до неё не добраться, пока не вернётся.',
			twoDc: 'Обе копии в том же дата-центре, и обе недоступны вместе с ним. Одно место на карте остаётся одним риском.',
			back: (lost: string, slow: string) => `Вернётся из копии вне сервера. Потери: ${lost} (всё, что произошло после последней копии). Восстановление: ${slow}.`,
			fallback: 'Главное действие',
			caption: 'Авария: что вернётся и когда вы узнаете',
			whatHappened: 'Что случилось',
			planLabel: 'План копий',
			copy: 'Копия',
			tested: 'Восстановление проверяли',
			yes: 'Данные вернутся.',
			no: 'Данные не вернутся.',
			whenKnow: 'Когда вы узнаете об аварии',
			checkEvery: 'Проверка каждые',
			min1: '1 минуту', min5: '5 минут', min30: '30 минут', never: 'вообще нет (узнаете от посетителя)',
			whatChecked: 'Что проверяется',
			homeOnly: 'Только главная страница',
			homeAction: 'Главная и страница действия',
			suppose: (a: string) => `Допустим, у вас остановилась обработка действия «${a}», а главная страница открывается.`,
			neverText: 'Об этом вы узнаете, когда посетитель напишет или перестанут приходить заявки: возможно, через дни.',
			homeText1: 'Проверка видит, что главная жива, и молчит:',
			homeText2: 'вы не узнаете',
			homeText3: ', пока кто-нибудь не пожалуется. Проверять надо то, ради чего приходят.',
			actionText1: 'Проверка заметит это не позже чем через',
			minute: 'минуту', minutes: 'минут',
			actionText2: 'и напишет вам.'
		},
		en: {
			incidents: [
				{ id: 'disk', label: 'The server’s disk died' },
				{ id: 'hack', label: 'The server was hacked and everything encrypted' },
				{ id: 'oops', label: 'A file was deleted by mistake' },
				{ id: 'dc', label: 'The data center is unreachable' }
			],
			plans: [
				{ id: 'none', label: 'No copies' },
				{ id: 'same', label: 'A copy on the same server' },
				{ id: 'two-dc', label: 'Two copies in one data center' },
				{ id: 'two-reg', label: 'Copies in two places, one in another region' }
			],
			intervals: [
				{ v: 1, label: 'every hour' },
				{ v: 24, label: 'every day' },
				{ v: 168, label: 'every week' }
			],
			upToWeek: 'up to a week',
			upToDay: 'up to a day',
			upToHour: 'up to an hour',
			aboutHour: 'about an hour',
			unknown: 'unknown: the copy was never opened, and it may turn out to be empty or broken',
			noneDc: 'There are no copies. When the data center comes back the data may well be there, but there is no guarantee, and you don’t know how long it will take.',
			noneLost: 'There are no copies: the data is lost for good. All that is left is to rebuild the site from what survived in the repository.',
			sameOops: (lost: string, slow: string) => `It comes back: the copy lies next to it. Loss: ${lost}. Restoring: ${slow}.`,
			sameDisk: 'The copy was on the same disk and died with it. That is not a copy but a second instance on the same risk.',
			sameHack: 'The attacker encrypted the copy too: it was in the same place. A copy that whoever broke into the server can reach is not a copy.',
			sameDc: 'The copy is in the same data center, and it is unreachable: you can’t get to it until it comes back.',
			twoDc: 'Both copies are in the same data center, and both are unreachable along with it. One place on the map is still one risk.',
			back: (lost: string, slow: string) => `It comes back from a copy outside the server. Loss: ${lost} (everything since the last copy). Restoring: ${slow}.`,
			fallback: 'Main action',
			caption: 'An incident: what comes back, and when you find out',
			whatHappened: 'What happened',
			planLabel: 'The backup plan',
			copy: 'A copy',
			tested: 'The restore was tested',
			yes: 'The data comes back.',
			no: 'The data does not come back.',
			whenKnow: 'When you find out about an incident',
			checkEvery: 'A check every',
			min1: '1 minute', min5: '5 minutes', min30: '30 minutes', never: 'none at all (you hear from a visitor)',
			whatChecked: 'What is checked',
			homeOnly: 'The home page only',
			homeAction: 'The home page and the action page',
			suppose: (a: string) => `Say the handling of the action “${a}” has stopped, while the home page opens.`,
			neverText: 'You will find out when a visitor writes, or requests stop coming in: possibly days later.',
			homeText1: 'The check sees that the home page is alive, and stays quiet:',
			homeText2: 'you won’t find out',
			homeText3: ' until somebody complains. Check what people come for.',
			actionText1: 'The check will notice this within',
			minute: 'minute', minutes: 'minutes',
			actionText2: 'and write to you.'
		}
	});

	const incidents = W.incidents;
	const plans = W.plans;
	const intervals = W.intervals;
	let incident = $state('disk');
	let plan = $state('same');
	let interval = $state(24);
	let tested = $state(false);

	const human = (h: number) => (h >= 168 ? W.upToWeek : h >= 24 ? W.upToDay : W.upToHour);
	const result = $derived.by(() => {
		const lost = human(interval);
		const slow = tested ? W.aboutHour : W.unknown;
		if (plan === 'none') return { ok: false, text: incident === 'dc' ? W.noneDc : W.noneLost };
		if (plan === 'same') {
			if (incident === 'oops') return { ok: true, text: W.sameOops(lost, slow) };
			return { ok: false, text: incident === 'disk' ? W.sameDisk : incident === 'hack' ? W.sameHack : W.sameDc };
		}
		if (plan === 'two-dc' && incident === 'dc') return { ok: false, text: W.twoDc };
		return { ok: true, text: W.back(lost, slow) };
	});

	// --- how soon you find out
	let check = $state(5);
	let what = $state<'home' | 'action'>('home');
	let action = $state(W.fallback);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			action = p.mainAction?.label ?? action;
		} catch {
			/* the example stays */
		}
	});
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.whatHappened}
			<select bind:value={incident}>{#each incidents as o (o.id)}<option value={o.id}>{o.label}</option>{/each}</select>
		</label>
		<label>{W.planLabel}
			<select bind:value={plan}>{#each plans as o (o.id)}<option value={o.id}>{o.label}</option>{/each}</select>
		</label>
	</div>
	<div class="dg-ctl">
		<label>{W.copy}
			<select bind:value={interval}>{#each intervals as o (o.v)}<option value={o.v}>{o.label}</option>{/each}</select>
		</label>
		<label><input type="checkbox" bind:checked={tested} /> {W.tested}</label>
	</div>
	<div class="dg-box" aria-live="polite" class:good={result.ok}>
		<p><strong>{result.ok ? W.yes : W.no}</strong> {result.text}</p>
	</div>

	<div class="dh">{W.whenKnow}</div>
	<div class="dg-ctl">
		<label>{W.checkEvery}
			<select bind:value={check}><option value={1}>{W.min1}</option><option value={5}>{W.min5}</option><option value={30}>{W.min30}</option><option value={0}>{W.never}</option></select>
		</label>
		<div role="group" aria-label={W.whatChecked} class="dg-ctl">
			<button type="button" aria-pressed={what === 'home'} onclick={() => (what = 'home')}>{W.homeOnly}</button>
			<button type="button" aria-pressed={what === 'action'} onclick={() => (what = 'action')}>{W.homeAction}</button>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.suppose(action)}
		{#if check === 0}{W.neverText}
		{:else if what === 'home'}{W.homeText1} <strong>{W.homeText2}</strong>{W.homeText3}
		{:else}{W.actionText1} <strong>{check} {check === 1 ? W.minute : W.minutes}</strong> {W.actionText2}{/if}
	</p>
</figure>

<style>
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.dg-box {
		border-left: 4px solid var(--text-primary);
	}
	.dg-box.good {
		border-left-color: var(--accent-measure);
	}
	.dg-box p {
		margin: 0;
	}
</style>
