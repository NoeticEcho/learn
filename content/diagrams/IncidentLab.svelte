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

	const incidents = [
		{ id: 'disk', label: 'Умер диск сервера' },
		{ id: 'hack', label: 'Сервер взломан, всё зашифровано' },
		{ id: 'oops', label: 'Файл удалили по ошибке' },
		{ id: 'dc', label: 'Дата-центр недоступен' }
	];
	const plans = [
		{ id: 'none', label: 'Копий нет' },
		{ id: 'same', label: 'Копия на том же сервере' },
		{ id: 'two-dc', label: 'Две копии в одном дата-центре' },
		{ id: 'two-reg', label: 'Копии в двух местах, одна в другом регионе' }
	];
	const intervals = [
		{ v: 1, label: 'раз в час' },
		{ v: 24, label: 'раз в сутки' },
		{ v: 168, label: 'раз в неделю' }
	];
	let incident = $state('disk');
	let plan = $state('same');
	let interval = $state(24);
	let tested = $state(false);

	const human = (h: number) => (h >= 168 ? 'до недели' : h >= 24 ? 'до суток' : 'до часа');
	const result = $derived.by(() => {
		const lost = human(interval);
		const slow = tested ? 'около часа' : 'неизвестно: копию ни разу не открывали, и она может оказаться пустой или битой';
		if (plan === 'none') return { ok: false, text: incident === 'dc' ? 'Копий нет. Когда дата-центр вернётся, данные, возможно, окажутся на месте, но гарантий нет, и срок вам неизвестен.' : 'Копий нет: данные потеряны безвозвратно. Остаётся собрать сайт заново из того, что сохранилось в репозитории.' };
		if (plan === 'same') {
			if (incident === 'oops') return { ok: true, text: `Вернётся: копия лежит рядом. Потери: ${lost}. Восстановление: ${slow}.` };
			return { ok: false, text: incident === 'disk' ? 'Копия лежала на том же диске и умерла вместе с ним. Это не копия, а второй экземпляр на том же риске.' : incident === 'hack' ? 'Злоумышленник зашифровал и копию: она лежала там же. Копию, до которой достаёт тот, кто взломал сервер, нельзя считать копией.' : 'Копия в том же дата-центре, и он недоступен: до неё не добраться, пока не вернётся.' };
		}
		if (plan === 'two-dc' && incident === 'dc') return { ok: false, text: 'Обе копии в том же дата-центре, и обе недоступны вместе с ним. Одно место на карте остаётся одним риском.' };
		return { ok: true, text: `Вернётся из копии вне сервера. Потери: ${lost} (всё, что произошло после последней копии). Восстановление: ${slow}.` };
	});

	// --- how soon you find out
	let check = $state(5);
	let what = $state<'home' | 'action'>('home');
	let action = $state('Главное действие');
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
	<figcaption>Авария: что вернётся и когда вы узнаете</figcaption>
	<div class="dg-ctl">
		<label>Что случилось
			<select bind:value={incident}>{#each incidents as o (o.id)}<option value={o.id}>{o.label}</option>{/each}</select>
		</label>
		<label>План копий
			<select bind:value={plan}>{#each plans as o (o.id)}<option value={o.id}>{o.label}</option>{/each}</select>
		</label>
	</div>
	<div class="dg-ctl">
		<label>Копия
			<select bind:value={interval}>{#each intervals as o (o.v)}<option value={o.v}>{o.label}</option>{/each}</select>
		</label>
		<label><input type="checkbox" bind:checked={tested} /> Восстановление проверяли</label>
	</div>
	<div class="dg-box" aria-live="polite" class:good={result.ok}>
		<p><strong>{result.ok ? 'Данные вернутся.' : 'Данные не вернутся.'}</strong> {result.text}</p>
	</div>

	<div class="dh">Когда вы узнаете об аварии</div>
	<div class="dg-ctl">
		<label>Проверка каждые
			<select bind:value={check}><option value={1}>1 минуту</option><option value={5}>5 минут</option><option value={30}>30 минут</option><option value={0}>вообще нет (узнаете от посетителя)</option></select>
		</label>
		<div role="group" aria-label="Что проверяется" class="dg-ctl">
			<button type="button" aria-pressed={what === 'home'} onclick={() => (what = 'home')}>Только главная страница</button>
			<button type="button" aria-pressed={what === 'action'} onclick={() => (what = 'action')}>Главная и страница действия</button>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		Допустим, у вас остановилась обработка действия «{action}», а главная страница открывается.
		{#if check === 0}Об этом вы узнаете, когда посетитель напишет или перестанут приходить заявки: возможно, через дни.
		{:else if what === 'home'}Проверка видит, что главная жива, и молчит: <strong>вы не узнаете</strong>, пока кто-нибудь не пожалуется. Проверять надо то, ради чего приходят.
		{:else}Проверка заметит это не позже чем через <strong>{check} {check === 1 ? 'минуту' : 'минут'}</strong> и напишет вам.{/if}
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
