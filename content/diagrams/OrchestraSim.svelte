<!--
	«Диспетчер аэропорта» (part 9, lesson 6). Three machines (nodes) are runways and the copies of
	the site (pods) are planes. The person states how many copies they want, and the page does what
	Kubernetes' controllers do: it keeps that number, moves the copies of a fallen node to the
	others, and replaces old copies with new ones one at a time during an update. Below, a small
	questionnaire asks about the person's own project (services, tolerated downtime, uneven load,
	people) and answers whether an orchestrator pays for itself, naming the main action of their
	brief. A model: names and timings are made up, but the behaviour (desired state, then reconcile)
	is the real idea.
-->
<script lang="ts">
	import './shared.css';
	import { onMount, onDestroy } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			wanted: (n: number, v: number) => `Нужно ${n} копии, версия ${v}.`,
			lost: (n: number) => `С упавшего узла пропало копий: ${n}. Контроллер заметил расхождение.`,
			allDown: 'Все узлы упали: копии негде запустить, ждём.',
			made: (n: number, have: number, want: number) => `Запущено новых копий: ${n}. Теперь их ${have} из ${want}.`,
			extra: (have: number, want: number) => `Лишняя копия остановлена. Теперь их ${have} из ${want}.`,
			desired: (n: number) => `Желаемое число копий: ${n}.`,
			nodeBack: (i: number) => `Узел ${i} вернулся.`,
			nodeDown: (i: number) => `Узел ${i} упал.`,
			surge: 'Пришёл поток посетителей: нагрузка выросла, число копий поднято до 6.',
			rolling: (v: number) => `Выкатываем версию ${v}: копии заменяются по одной, сайт не выключается.`,
			swapped: (left: number) => `Новая копия готова, старая остановлена. Старых осталось: ${left}.`,
			nowhere: 'Некуда выкатывать: узлы недоступны.',
			done: (v: number) => `Готово: все копии версии ${v}, простоя не было.`,
			fallback: 'Главное действие',
			vHighFew: 'Нагрузка и требования высокие, но людей мало. Начните с управляемого сервиса облака (контейнеры или Kubernetes «под ключ») и не поднимайте кластер сами.',
			vYes: 'Оркестратор имеет смысл. Берите управляемый Kubernetes у облачного провайдера: администрирование кластера лучше отдать.',
			vMid: 'Пока хватит одного VPS с Compose и автоматическим перезапуском, либо управляемого запуска контейнеров. Вернитесь к вопросу, когда сервисов станет больше десятка.',
			vNo: W.vNo,
			downs: ['нельзя вообще', 'минуты', 'до часа', 'сутки терпимо'],
			caption: 'Диспетчер: желаемое число копий и узлы, которые падают',
			needCopies: 'Нужно копий:',
			killNode: (i: number) => `Уронить узел ${i}`,
			restoreNode: (i: number) => `Вернуть узел ${i}`,
			surgeBtn: 'Поток посетителей',
			rollBtn: 'Выкатить новую версию',
			resetBtn: 'Сначала',
			node: 'Узел',
			fell: '(упал)',
			copy: 'копия',
			starting: ' (запускается)',
			running: 'Работает копий:',
			of: 'из',
			versions: 'Версии:',
			none: 'нет',
			doYouNeed: 'А вам он нужен?',
			servicesIn: 'Сервисов в проекте:',
			downtimeOk: 'Простой допустим:',
			uneven: 'Нагрузка очень неровная (то пусто, то наплыв)',
			people: 'Людей, которые могут вести кластер:',
			forAction: (a: string) => `Для действия «${a}»:`
		},
		en: {
			wanted: (n: number, v: number) => `${n} ${n === 1 ? 'copy is' : 'copies are'} wanted, version ${v}.`,
			lost: (n: number) => `Copies lost with the fallen node: ${n}. The controller noticed the gap.`,
			allDown: 'All the nodes are down: there is nowhere to start copies, so we wait.',
			made: (n: number, have: number, want: number) => `New copies started: ${n}. Now there are ${have} of ${want}.`,
			extra: (have: number, want: number) => `An extra copy was stopped. Now there are ${have} of ${want}.`,
			desired: (n: number) => `The desired number of copies: ${n}.`,
			nodeBack: (i: number) => `Node ${i} came back.`,
			nodeDown: (i: number) => `Node ${i} went down.`,
			surge: 'A rush of visitors arrived: the load grew, and the number of copies was raised to 6.',
			rolling: (v: number) => `Rolling out version ${v}: copies are replaced one at a time, and the site is never switched off.`,
			swapped: (left: number) => `The new copy is ready and the old one stopped. Old copies left: ${left}.`,
			nowhere: 'Nowhere to roll out: the nodes are unavailable.',
			done: (v: number) => `Done: all the copies are version ${v}, and there was no downtime.`,
			fallback: 'Main action',
			vHighFew: 'The load and the demands are high, but there are few people. Start with a managed cloud service (containers, or Kubernetes “turnkey”) and don’t run a cluster yourself.',
			vYes: 'An orchestrator makes sense. Take managed Kubernetes from a cloud provider: it is better to hand off the administration of the cluster.',
			vMid: 'For now a single VPS with Compose and automatic restarts will do, or a managed way to run containers. Come back to the question when there are more than about ten services.',
			vNo: 'You don’t need an orchestrator. Static hosting or one server is cheaper and more reliable, and it isn’t laziness: you have none of the problems it solves.',
			downs: ['none at all', 'minutes', 'up to an hour', 'a day is fine'],
			caption: 'The dispatcher: the desired number of copies, and nodes that fall',
			needCopies: 'Copies wanted:',
			killNode: (i: number) => `Take down node ${i}`,
			restoreNode: (i: number) => `Bring back node ${i}`,
			surgeBtn: 'A rush of visitors',
			rollBtn: 'Roll out a new version',
			resetBtn: 'Start over',
			node: 'Node',
			fell: '(down)',
			copy: 'copy',
			starting: ' (starting)',
			running: 'Copies running:',
			of: 'of',
			versions: 'Versions:',
			none: 'none',
			doYouNeed: 'Do you need one?',
			servicesIn: 'Services in the project:',
			downtimeOk: 'Downtime you can accept:',
			uneven: 'The load is very uneven (empty, then a rush)',
			people: 'People who can run a cluster:',
			forAction: (a: string) => `For the action “${a}”:`
		}
	});

	type Pod = { id: number; node: number; ver: number; ready: boolean };
	let nodes = $state([true, true, true]);
	let desired = $state(3);
	let ver = $state(1);
	let pods = $state<Pod[]>([]);
	let log = $state<string[]>([W.wanted(3, 1)]);
	let seq = 0;
	let timer = $state<ReturnType<typeof setInterval> | undefined>();

	const say = (s: string) => (log = [s, ...log].slice(0, 6));
	const upNodes = () => nodes.map((u, i) => (u ? i : -1)).filter((i) => i >= 0);
	const place = (v: number, ready: boolean) => {
		const ups = upNodes();
		if (!ups.length) return false;
		const node = ups.sort((a, b) => pods.filter((p) => p.node === a).length - pods.filter((p) => p.node === b).length)[0];
		pods.push({ id: ++seq, node, ver: v, ready });
		return true;
	};
	function reconcile() {
		const before = pods.length;
		pods = pods.filter((p) => nodes[p.node]);
		const lost = before - pods.length;
		if (lost) say(W.lost(lost));
		let made = 0;
		while (pods.length < desired) {
			if (!place(ver, true)) {
				say(W.allDown);
				break;
			}
			made++;
		}
		if (made) say(W.made(made, pods.length, desired));
		while (pods.length > desired) {
			pods.pop();
			say(W.extra(pods.length, desired));
		}
	}
	onMount(reconcile);
	onDestroy(() => timer && clearInterval(timer));

	function setDesired(n: number) {
		desired = n;
		say(W.desired(n));
		reconcile();
	}
	function toggle(i: number) {
		nodes[i] = !nodes[i];
		say(nodes[i] ? W.nodeBack(i + 1) : W.nodeDown(i + 1));
		reconcile();
	}
	function surge() {
		say(W.surge);
		setDesired(6);
	}
	function update() {
		if (timer) return;
		ver += 1;
		say(W.rolling(ver));
		timer = setInterval(() => {
			const old = pods.find((p) => p.ver < ver);
			const fresh = pods.find((p) => p.ver === ver && !p.ready);
			if (fresh) {
				fresh.ready = true;
				const o = pods.find((p) => p.ver < ver);
				if (o) pods = pods.filter((p) => p !== o);
				say(W.swapped(pods.filter((p) => p.ver < ver).length));
			} else if (old) {
				if (!place(ver, false)) say(W.nowhere);
			} else {
				say(W.done(ver));
				clearInterval(timer);
				timer = undefined;
			}
		}, 700);
	}
	function reset() {
		if (timer) clearInterval(timer);
		timer = undefined;
		nodes = [true, true, true];
		desired = 3;
		ver = 1;
		pods = [];
		seq = 0;
		log = [W.wanted(3, 1)];
		reconcile();
	}

	// --- does the project need it?
	let services = $state(2);
	let downtime = $state(2); // 0 none, 1 minutes, 2 up to an hour, 3 a day
	let uneven = $state(false);
	let people = $state(1);
	let action = $state(W.fallback);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			action = p.mainAction?.label ?? action;
		} catch {
			/* the example stays */
		}
	});
	const score = $derived((services >= 10 ? 3 : services >= 5 ? 2 : services >= 3 ? 1 : 0) + (downtime === 0 ? 3 : downtime === 1 ? 2 : 0) + (uneven ? 1 : 0));
	const verdict = $derived(
		people < 2 && score >= 4
			? W.vHighFew
			: score >= 5 && people >= 2
				? W.vYes
				: score >= 3
					? W.vMid
					: W.vNo
	);
	const downs = W.downs;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.needCopies} <input type="range" min="1" max="6" bind:value={desired} onchange={() => setDesired(desired)} /> <strong>{desired}</strong></label>
	</div>
	<div class="dg-ctl">
		{#each nodes as up, i (i)}<button type="button" aria-pressed={!up} onclick={() => toggle(i)}>{up ? W.killNode(i + 1) : W.restoreNode(i + 1)}</button>{/each}
		<button type="button" onclick={surge}>{W.surgeBtn}</button>
		<button type="button" onclick={update} disabled={!!timer}>{W.rollBtn}</button>
		<button type="button" onclick={reset}>{W.resetBtn}</button>
	</div>
	<div class="runways">
		{#each nodes as up, i (i)}
			<div class="runway" class:down={!up}>
				<p class="head"><strong>{W.node} {i + 1}</strong> {up ? '' : W.fell}</p>
				<ul>
					{#each pods.filter((p) => p.node === i) as p (p.id)}<li class:starting={!p.ready}>{W.copy} v{p.ver}{p.ready ? '' : W.starting}</li>{/each}
				</ul>
			</div>
		{/each}
	</div>
	<p class="dg-out">{W.running} <strong>{pods.filter((p) => p.ready).length}</strong> {W.of} {desired}. {W.versions} {[...new Set(pods.map((p) => 'v' + p.ver))].join(', ') || W.none}.</p>
	<ol class="log" aria-live="polite">{#each log as l, i (i)}<li>{l}</li>{/each}</ol>

	<div class="dh">{W.doYouNeed}</div>
	<div class="dg-ctl">
		<label>{W.servicesIn} <input type="range" min="1" max="30" bind:value={services} /> <strong>{services}</strong></label>
		<label>{W.downtimeOk}
			<select bind:value={downtime}>{#each downs as d, i (i)}<option value={i}>{d}</option>{/each}</select>
		</label>
	</div>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={uneven} /> {W.uneven}</label>
		<label>{W.people} <input type="range" min="0" max="5" bind:value={people} /> <strong>{people}</strong></label>
	</div>
	<p class="dg-out" aria-live="polite">{W.forAction(action)} <strong>{verdict}</strong></p>
</figure>

<style>
	.runways {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.runway {
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		min-height: 8rem;
	}
	.runway.down {
		opacity: 0.55;
		border-style: dashed;
	}
	.runway p {
		margin: 0 0 var(--space-2);
	}
	.runway ul {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.runway li {
		padding: var(--space-1) var(--space-2);
		border-left: 4px solid var(--accent-measure);
		background: var(--surface-body);
	}
	.runway li.starting {
		border-left-color: var(--border-brass);
		opacity: 0.7;
	}
	.log {
		color: var(--text-secondary);
		margin: 0;
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
