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

	type Pod = { id: number; node: number; ver: number; ready: boolean };
	let nodes = $state([true, true, true]);
	let desired = $state(3);
	let ver = $state(1);
	let pods = $state<Pod[]>([]);
	let log = $state<string[]>(['Нужно 3 копии, версия 1.']);
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
		if (lost) say(`С упавшего узла пропало копий: ${lost}. Контроллер заметил расхождение.`);
		let made = 0;
		while (pods.length < desired) {
			if (!place(ver, true)) {
				say('Все узлы упали: копии негде запустить, ждём.');
				break;
			}
			made++;
		}
		if (made) say(`Запущено новых копий: ${made}. Теперь их ${pods.length} из ${desired}.`);
		while (pods.length > desired) {
			pods.pop();
			say(`Лишняя копия остановлена. Теперь их ${pods.length} из ${desired}.`);
		}
	}
	onMount(reconcile);
	onDestroy(() => timer && clearInterval(timer));

	function setDesired(n: number) {
		desired = n;
		say(`Желаемое число копий: ${n}.`);
		reconcile();
	}
	function toggle(i: number) {
		nodes[i] = !nodes[i];
		say(nodes[i] ? `Узел ${i + 1} вернулся.` : `Узел ${i + 1} упал.`);
		reconcile();
	}
	function surge() {
		say('Пришёл поток посетителей: нагрузка выросла, число копий поднято до 6.');
		setDesired(6);
	}
	function update() {
		if (timer) return;
		ver += 1;
		say(`Выкатываем версию ${ver}: копии заменяются по одной, сайт не выключается.`);
		timer = setInterval(() => {
			const old = pods.find((p) => p.ver < ver);
			const fresh = pods.find((p) => p.ver === ver && !p.ready);
			if (fresh) {
				fresh.ready = true;
				const o = pods.find((p) => p.ver < ver);
				if (o) pods = pods.filter((p) => p !== o);
				say(`Новая копия готова, старая остановлена. Старых осталось: ${pods.filter((p) => p.ver < ver).length}.`);
			} else if (old) {
				if (!place(ver, false)) say('Некуда выкатывать: узлы недоступны.');
			} else {
				say(`Готово: все копии версии ${ver}, простоя не было.`);
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
		log = ['Нужно 3 копии, версия 1.'];
		reconcile();
	}

	// --- does the project need it?
	let services = $state(2);
	let downtime = $state(2); // 0 none, 1 minutes, 2 up to an hour, 3 a day
	let uneven = $state(false);
	let people = $state(1);
	let action = $state('Главное действие');
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
			? 'Нагрузка и требования высокие, но людей мало. Начните с управляемого сервиса облака (контейнеры или Kubernetes «под ключ») и не поднимайте кластер сами.'
			: score >= 5 && people >= 2
				? 'Оркестратор имеет смысл. Берите управляемый Kubernetes у облачного провайдера: администрирование кластера лучше отдать.'
				: score >= 3
					? 'Пока хватит одного VPS с Compose и автоматическим перезапуском, либо управляемого запуска контейнеров. Вернитесь к вопросу, когда сервисов станет больше десятка.'
					: 'Оркестратор не нужен. Статический хостинг или один сервер дешевле и надёжнее, и дело не в лени: у вас нет задач, которые он решает.'
	);
	const downs = ['нельзя вообще', 'минуты', 'до часа', 'сутки терпимо'];
</script>

<figure class="dg">
	<figcaption>Диспетчер: желаемое число копий и узлы, которые падают</figcaption>
	<div class="dg-ctl">
		<label>Нужно копий: <input type="range" min="1" max="6" bind:value={desired} onchange={() => setDesired(desired)} /> <strong>{desired}</strong></label>
	</div>
	<div class="dg-ctl">
		{#each nodes as up, i (i)}<button type="button" aria-pressed={!up} onclick={() => toggle(i)}>{up ? `Уронить узел ${i + 1}` : `Вернуть узел ${i + 1}`}</button>{/each}
		<button type="button" onclick={surge}>Поток посетителей</button>
		<button type="button" onclick={update} disabled={!!timer}>Выкатить новую версию</button>
		<button type="button" onclick={reset}>Сначала</button>
	</div>
	<div class="runways">
		{#each nodes as up, i (i)}
			<div class="runway" class:down={!up}>
				<p class="head"><strong>Узел {i + 1}</strong> {up ? '' : '(упал)'}</p>
				<ul>
					{#each pods.filter((p) => p.node === i) as p (p.id)}<li class:starting={!p.ready}>копия v{p.ver}{p.ready ? '' : ' (запускается)'}</li>{/each}
				</ul>
			</div>
		{/each}
	</div>
	<p class="dg-out">Работает копий: <strong>{pods.filter((p) => p.ready).length}</strong> из {desired}. Версии: {[...new Set(pods.map((p) => 'v' + p.ver))].join(', ') || 'нет'}.</p>
	<ol class="log" aria-live="polite">{#each log as l, i (i)}<li>{l}</li>{/each}</ol>

	<div class="dh">А вам он нужен?</div>
	<div class="dg-ctl">
		<label>Сервисов в проекте: <input type="range" min="1" max="30" bind:value={services} /> <strong>{services}</strong></label>
		<label>Простой допустим:
			<select bind:value={downtime}>{#each downs as d, i (i)}<option value={i}>{d}</option>{/each}</select>
		</label>
	</div>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={uneven} /> Нагрузка очень неровная (то пусто, то наплыв)</label>
		<label>Людей, которые могут вести кластер: <input type="range" min="0" max="5" bind:value={people} /> <strong>{people}</strong></label>
	</div>
	<p class="dg-out" aria-live="polite">Для действия «{action}»: <strong>{verdict}</strong></p>
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
