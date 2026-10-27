<!--
	«Конвейер выкладки» (part 9, lesson 7). Stations in a row: change, checks, build, preview,
	deploy, notice. The person runs a change through it, jams any station (a broken link, a red
	test, a failing build, an expired token), and sees that the line stops there and that nothing
	after it runs, and what the notice says. A switch compares it with the old way: uploading by
	hand, where nothing stops a bad change. A second switch makes the mistake the checks cannot
	see; then the button «Откатить» puts the previous version back. The build station lists the
	sections of the person's own brief, and if their main action takes data from a visitor a check
	for the consent page appears. Keyed by index, since sections come from the brief. A model.
-->
<script lang="ts">
	import './shared.css';
	import { onMount, onDestroy } from 'svelte';

	type St = { id: string; name: string; detail: string; jam: string };
	let sections = $state<string[]>(['Главная', 'Услуги', 'Контакты']);
	let takesData = $state(true);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.sections?.length) sections = p.sections;
			takesData = ['form', 'book', 'signup', 'buy'].includes(p.mainAction?.kind ?? 'form');
		} catch {
			/* the example stays */
		}
	});

	const stations = $derived<St[]>([
		{ id: 'commit', name: 'Изменение', detail: 'Вы сохранили правку и отправили её в основную ветку (push).', jam: 'Нечего запускать: изменение не дошло до репозитория.' },
		{ id: 'check', name: 'Проверки', detail: `Ссылки, разметка${takesData ? ', страница согласия на обработку данных' : ''}.`, jam: takesData ? 'Битая ссылка или нет страницы политики и согласия: конвейер остановлен, на сайт ничего не ушло.' : 'Битая ссылка: конвейер остановлен, на сайт ничего не ушло.' },
		{ id: 'build', name: 'Сборка', detail: `Собирает страницы: ${sections.join(', ')}.`, jam: 'Сборка упала: какая-то страница не собралась, и старый сайт остался на месте.' },
		{ id: 'preview', name: 'Предпросмотр', detail: 'Выкладывает черновик по временному адресу, чтобы посмотреть глазами.', jam: 'Предпросмотр не поднялся: смотреть нечего, выкладка не запущена.' },
		{ id: 'deploy', name: 'Выкладка', detail: 'Заменяет живой сайт новой версией, когда всё выше прошло.', jam: 'Выкладка не прошла: токен доступа истёк. Сайт остался прежним, а в чат пришло сообщение.' },
		{ id: 'notice', name: 'Уведомление', detail: 'Пишет в чат или на почту: что выложено или что упало.', jam: 'Уведомление не ушло: выкладка прошла, но вы об этом не узнаете (проверьте адрес чата).' }
	]);

	let jammed = $state<number | null>(null);
	let pipeline = $state(true);
	let silent = $state(false); // a mistake the checks cannot see
	let at = $state(-1);
	let done = $state(false);
	let rolled = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	onDestroy(() => timer && clearInterval(timer));

	const run = () => {
		if (timer) clearInterval(timer);
		at = -1;
		done = false;
		rolled = false;
		timer = setInterval(() => {
			const next = at + 1;
			const limit = pipeline ? (jammed ?? stations.length) : 0;
			if (next >= stations.length || (pipeline && jammed !== null && next >= limit)) {
				done = true;
				clearInterval(timer);
				timer = undefined;
				return;
			}
			at = next;
			if (!pipeline && next >= 0) {
				done = true;
				clearInterval(timer);
				timer = undefined;
			}
		}, 450);
	};
	const reached = $derived(pipeline ? (jammed === null ? stations.length : jammed) : 0);
	const live = $derived(
		!done
			? ''
			: pipeline
				? jammed !== null && jammed <= 4
					? 'На живом сайте осталась прежняя версия: ничего не сломано.'
					: silent && !rolled
						? 'Версия выложена, но в ней ошибка, которую проверки не поймали. Нажмите «Откатить».'
						: rolled
							? 'Предыдущая версия возвращена за минуту: достаточно выложить прошлый коммит ещё раз.'
							: 'Новая версия выложена.'
				: jammed !== null && jammed <= 2
					? 'Вручную выложили сразу: битая ссылка или упавшая сборка попали на живой сайт, и никто не остановил.'
					: silent && !rolled
						? 'Выложено вручную, и ошибка на сайте. Прежней версии под рукой нет: вспоминаете, что было.'
						: rolled
							? 'Предыдущая версия найдена на старом компьютере и снова залита. Это заняло много времени.'
							: 'Выложено вручную: сайт обновлён, но никто ничего не проверял.'
	);
</script>

<figure class="dg">
	<figcaption>Конвейер выкладки: где он останавливается</figcaption>
	<div class="dg-ctl" role="group" aria-label="Способ выкладки">
		<button type="button" aria-pressed={pipeline} onclick={() => ((pipeline = true), (done = false), (at = -1))}>Конвейер по коммиту</button>
		<button type="button" aria-pressed={!pipeline} onclick={() => ((pipeline = false), (done = false), (at = -1))}>Вручную, по FTP</button>
		<label><input type="checkbox" bind:checked={silent} onchange={() => ((done = false), (at = -1))} /> Ошибка, которую проверки не видят</label>
	</div>
	<p class="dg-out">Нажмите на станцию, чтобы «заклинить» её, потом запустите.</p>
	<ol class="line">
		{#each stations as s, i (i)}
			<li class:ran={at >= i && (!pipeline ? i === 0 : true)} class:stop={pipeline && jammed === i && at >= i - 1 && done} class:skipped={pipeline && jammed !== null && i > jammed && done}>
				<button type="button" aria-pressed={jammed === i} disabled={!pipeline} onclick={() => ((jammed = jammed === i ? null : i), (done = false), (at = -1))}>{i + 1}. {s.name}{jammed === i ? ' (заклинило)' : ''}</button>
				<p>{s.detail}</p>
			</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" onclick={run}>Запустить изменение</button>
		<button type="button" disabled={!done || !silent || rolled} onclick={() => (rolled = true)}>Откатить</button>
	</div>
	<div class="dg-box" aria-live="polite">
		{#if done}
			{#if pipeline && jammed !== null}<p><strong>Остановилось на станции «{stations[jammed].name}».</strong> {stations[jammed].jam}</p>{/if}
			<p>{live}</p>
			{#if pipeline && jammed === null}<p>В чат пришло: «выкладка прошла, сборка зелёная».</p>{/if}
		{:else}<p class="dg-out">Результат появится после запуска.</p>{/if}
	</div>
</figure>

<style>
	.line {
		list-style: none;
		padding: 0 !important;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
		gap: var(--space-2);
	}
	.line li {
		padding: var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.line li.ran {
		border-color: var(--accent-measure);
	}
	.line li.stop {
		border-color: var(--text-primary);
		border-width: 3px;
	}
	.line li.skipped {
		opacity: 0.45;
	}
	.line p {
		margin: var(--space-2) 0 0;
		font-size: 0.9em;
		color: var(--text-secondary);
	}
	.line button {
		width: 100%;
		text-align: left;
	}
</style>
