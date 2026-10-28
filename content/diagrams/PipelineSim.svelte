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
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			sections: ['Главная', 'Услуги', 'Контакты'],
			names: ['Изменение', 'Проверки', 'Сборка', 'Предпросмотр', 'Выкладка', 'Уведомление'],
			commit: 'Вы сохранили правку и отправили её в основную ветку (push).',
			commitJam: 'Нечего запускать: изменение не дошло до репозитория.',
			check: (data: boolean) => `Ссылки, разметка${data ? ', страница согласия на обработку данных' : ''}.`,
			checkJam: (data: boolean) => (data ? 'Битая ссылка или нет страницы политики и согласия: конвейер остановлен, на сайт ничего не ушло.' : 'Битая ссылка: конвейер остановлен, на сайт ничего не ушло.'),
			build: (list: string) => `Собирает страницы: ${list}.`,
			buildJam: 'Сборка упала: какая-то страница не собралась, и старый сайт остался на месте.',
			preview: 'Выкладывает черновик по временному адресу, чтобы посмотреть глазами.',
			previewJam: 'Предпросмотр не поднялся: смотреть нечего, выкладка не запущена.',
			deploy: 'Заменяет живой сайт новой версией, когда всё выше прошло.',
			deployJam: 'Выкладка не прошла: токен доступа истёк. Сайт остался прежним, а в чат пришло сообщение.',
			notice: 'Пишет в чат или на почту: что выложено или что упало.',
			noticeJam: 'Уведомление не ушло: выкладка прошла, но вы об этом не узнаете (проверьте адрес чата).',
			liveOld: 'На живом сайте осталась прежняя версия: ничего не сломано.',
			liveSilent: 'Версия выложена, но в ней ошибка, которую проверки не поймали. Нажмите «Откатить».',
			liveRolled: 'Предыдущая версия возвращена за минуту: достаточно выложить прошлый коммит ещё раз.',
			liveOk: W.liveOk,
			handJam: 'Вручную выложили сразу: битая ссылка или упавшая сборка попали на живой сайт, и никто не остановил.',
			handSilent: 'Выложено вручную, и ошибка на сайте. Прежней версии под рукой нет: вспоминаете, что было.',
			handRolled: 'Предыдущая версия найдена на старом компьютере и снова залита. Это заняло много времени.',
			handOk: W.handOk,
			caption: 'Конвейер выкладки: где он останавливается',
			way: 'Способ выкладки',
			byCommit: 'Конвейер по коммиту',
			byHand: 'Вручную, по FTP',
			silent: 'Ошибка, которую проверки не видят',
			jamHint: 'Нажмите на станцию, чтобы «заклинить» её, потом запустите.',
			jammed: ' (заклинило)',
			run: 'Запустить изменение',
			rollback: 'Откатить',
			stoppedAt: (n: string) => `Остановилось на станции «${n}».`,
			chat: 'В чат пришло: «выкладка прошла, сборка зелёная».',
			after: 'Результат появится после запуска.'
		},
		en: {
			sections: ['Home', 'Services', 'Contact'],
			names: ['Change', 'Checks', 'Build', 'Preview', 'Deploy', 'Notice'],
			commit: 'You saved an edit and pushed it to the main branch.',
			commitJam: 'There is nothing to run: the change never reached the repository.',
			check: (data: boolean) => `Links, markup${data ? ', the privacy policy and consent page' : ''}.`,
			checkJam: (data: boolean) => (data ? 'A broken link, or no privacy policy and consent page: the pipeline is stopped, and nothing reached the site.' : 'A broken link: the pipeline is stopped, and nothing reached the site.'),
			build: (list: string) => `Builds the pages: ${list}.`,
			buildJam: 'The build failed: some page didn’t build, and the old site stayed in place.',
			preview: 'Publishes a draft at a temporary address so you can look at it.',
			previewJam: 'The preview didn’t come up: there is nothing to look at, and the deploy isn’t started.',
			deploy: 'Replaces the live site with the new version, once everything above has passed.',
			deployJam: 'The deploy failed: the access token has expired. The site stayed as it was, and a message came to the chat.',
			notice: 'Writes to the chat or by email: what was published or what failed.',
			noticeJam: 'The notice didn’t go out: the deploy passed, but you won’t find out (check the chat address).',
			liveOld: 'The old version is still on the live site: nothing is broken.',
			liveSilent: 'The version is published, but it has a mistake the checks didn’t catch. Press “Roll back”.',
			liveRolled: 'The previous version is back in a minute: it is enough to publish the previous commit again.',
			liveOk: 'The new version is published.',
			handJam: 'Uploaded by hand straight away: a broken link or a failed build reached the live site, and nobody stopped it.',
			handSilent: 'Uploaded by hand, and the mistake is on the site. The previous version isn’t at hand: you try to remember what it was.',
			handRolled: 'The previous version was found on an old computer and uploaded again. It took a long time.',
			handOk: 'Uploaded by hand: the site is updated, but nobody checked anything.',
			caption: 'The deploy pipeline: where it stops',
			way: 'Way of deploying',
			byCommit: 'A pipeline on commit',
			byHand: 'By hand, over FTP',
			silent: 'A mistake the checks can’t see',
			jamHint: 'Press a station to jam it, then run.',
			jammed: ' (jammed)',
			run: 'Run the change',
			rollback: 'Roll back',
			stoppedAt: (n: string) => `It stopped at the station “${n}”.`,
			chat: 'The chat got: “the deploy passed, the build is green”.',
			after: 'The result appears after the run.'
		}
	});

	type St = { id: string; name: string; detail: string; jam: string };
	let sections = $state<string[]>(W.sections);
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
		{ id: 'commit', name: W.names[0], detail: W.commit, jam: W.commitJam },
		{ id: 'check', name: W.names[1], detail: W.check(takesData), jam: W.checkJam(takesData) },
		{ id: 'build', name: W.names[2], detail: W.build(sections.join(', ')), jam: W.buildJam },
		{ id: 'preview', name: W.names[3], detail: W.preview, jam: W.previewJam },
		{ id: 'deploy', name: W.names[4], detail: W.deploy, jam: W.deployJam },
		{ id: 'notice', name: W.names[5], detail: W.notice, jam: W.noticeJam }
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
					? W.liveOld
					: silent && !rolled
						? W.liveSilent
						: rolled
							? W.liveRolled
							: W.liveOk
				: jammed !== null && jammed <= 2
					? W.handJam
					: silent && !rolled
						? W.handSilent
						: rolled
							? W.handRolled
							: W.handOk
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.way}>
		<button type="button" aria-pressed={pipeline} onclick={() => ((pipeline = true), (done = false), (at = -1))}>{W.byCommit}</button>
		<button type="button" aria-pressed={!pipeline} onclick={() => ((pipeline = false), (done = false), (at = -1))}>{W.byHand}</button>
		<label><input type="checkbox" bind:checked={silent} onchange={() => ((done = false), (at = -1))} /> {W.silent}</label>
	</div>
	<p class="dg-out">{W.jamHint}</p>
	<ol class="line">
		{#each stations as s, i (i)}
			<li class:ran={at >= i && (!pipeline ? i === 0 : true)} class:stop={pipeline && jammed === i && at >= i - 1 && done} class:skipped={pipeline && jammed !== null && i > jammed && done}>
				<button type="button" aria-pressed={jammed === i} disabled={!pipeline} onclick={() => ((jammed = jammed === i ? null : i), (done = false), (at = -1))}>{i + 1}. {s.name}{jammed === i ? W.jammed : ''}</button>
				<p>{s.detail}</p>
			</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" onclick={run}>{W.run}</button>
		<button type="button" disabled={!done || !silent || rolled} onclick={() => (rolled = true)}>{W.rollback}</button>
	</div>
	<div class="dg-box" aria-live="polite">
		{#if done}
			{#if pipeline && jammed !== null}<p><strong>{W.stoppedAt(stations[jammed].name)}</strong> {stations[jammed].jam}</p>{/if}
			<p>{live}</p>
			{#if pipeline && jammed === null}<p>{W.chat}</p>{/if}
		{:else}<p class="dg-out">{W.after}</p>{/if}
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
