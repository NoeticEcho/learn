<!--
	«Сцена при прокрутке» (part 12, lesson 11). A short scrolling box with four steps that appear as
	they enter view (an IntersectionObserver, so it works in every browser), a progress bar tied to the
	scroll, and a switch that imitates prefers-reduced-motion: then every step is simply there. It also
	says whether this browser supports CSS scroll-driven animations (animation-timeline).
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	const steps = [
		{ t: 'Вы рассказываете о ситуации', d: 'Звонок или заявка: пара минут.' },
		{ t: 'Мы называем срок и цену', d: 'До начала работы, письменно.' },
		{ t: 'Работа идёт по шагам', d: 'Вы знаете, на каком этапе дело.' },
		{ t: 'Вы получаете результат', d: 'И понятный следующий шаг.' }
	];
	let box: HTMLDivElement | undefined = $state();
	let seen = $state<boolean[]>(steps.map(() => false));
	let progress = $state(0);
	let still = $state(false);
	let supported = $state<boolean | null>(null);

	onMount(() => {
		supported = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
		if (!box || typeof IntersectionObserver === 'undefined') {
			seen = steps.map(() => true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					const i = Number((e.target as HTMLElement).dataset.i);
					if (e.isIntersecting) seen[i] = true;
				}
			},
			{ root: box, threshold: 0.6 }
		);
		box.querySelectorAll('li').forEach((li) => io.observe(li));
		return () => io.disconnect();
	});

	function onScroll() {
		if (!box) return;
		const max = box.scrollHeight - box.clientHeight;
		progress = max > 0 ? Math.round((box.scrollTop / max) * 100) : 0;
	}
	function reset() {
		seen = steps.map(() => false);
		if (box) box.scrollTop = 0;
	}
</script>

<figure class="dg">
	<figcaption>Шаги, которые появляются при прокрутке</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={still} /> Имитировать «уменьшить движение»</label>
		<button type="button" onclick={reset}>Сначала</button>
	</div>
	<div class="prog" role="progressbar" aria-label="Прокручено" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><span style="width: {progress}%"></span></div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
	<div class="box" bind:this={box} onscroll={onScroll} tabindex="0" role="region" aria-label="Как мы работаем: прокрутите">
		<ol>
			{#each steps as s, i (s.t)}
				<li data-i={i} class:in={seen[i] || still} class:still>
					<strong>{i + 1}. {s.t}</strong>
					<p>{s.d}</p>
				</li>
			{/each}
		</ol>
	</div>
	<p class="dg-out">
		{#if still}Включён режим без движения: шаги просто стоят на странице, прокрутка ничего не анимирует.
		{:else}Прокрутите блок: каждый шаг появляется, когда виден почти целиком.{/if}
	</p>
	<p class="dg-out">
		Прокрутка средствами CSS (<span class="dg-mono">animation-timeline</span>):
		<strong>{supported === null ? 'проверяю…' : supported ? 'ваш браузер её поддерживает' : 'ваш браузер её пока не поддерживает, поэтому в практике нужна запасная версия без анимации'}</strong>.
	</p>
</figure>

<style>
	.prog {
		height: 0.4rem;
		margin-bottom: var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.prog span {
		display: block;
		height: 100%;
		background: var(--accent-measure);
	}
	.box {
		height: 13rem;
		overflow: auto;
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: var(--space-4) var(--space-4) 8rem !important;
	}
	li {
		margin-bottom: 6rem;
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
		opacity: 0.15;
		transform: translateY(1.2rem);
		transition:
			opacity var(--dur-micro) var(--ease-stop),
			transform var(--dur-micro) var(--ease-stop);
	}
	li.in {
		opacity: 1;
		transform: none;
		border-left-color: var(--accent-measure);
	}
	li.still {
		transition: none;
	}
	li p {
		margin: var(--space-1) 0 0;
	}
	@media (prefers-reduced-motion: reduce) {
		li {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
