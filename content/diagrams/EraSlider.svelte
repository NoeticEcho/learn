<!--
	«Сравни эпохи» (part 0, lesson 2). The prologue's own era frames, driven by a slider, with the
	person's own words in them. Nothing is copied: the frames are the prologue's components.
-->
<script lang="ts">
	import './shared.css';
	import { onMount, type Component } from 'svelte';
	import type { FrameProps } from '#lib/prologue/types.ts';
	import type { EraId } from '#lib/prologue/sequence.ts';

	const eras: { id: EraId; year: string; tool: string }[] = [
		{ id: '1991', year: '1991', tool: 'Чистый HTML, написанный вручную: заголовки, абзацы, ссылки.' },
		{ id: '1996', year: '1996', tool: 'Таблицы для раскладки, тег font, фоновая плитка и счётчик посетителей в виде картинки.' },
		{ id: '2000', year: '2000', tool: 'Flash: анимированная заставка и кнопка «пропустить».' },
		{ id: '2005', year: '2005', tool: 'Отдельный CSS, градиенты и скруглённые углы: «веб 2.0».' },
		{ id: '2014', year: '2014', tool: 'Адаптивная вёрстка: один сайт перестраивается под ширину экрана.' },
		{ id: '2025', year: '2025', tool: 'ИИ-конструктор: сайт собирается по описанию словами.' }
	];

	let i = $state(0);
	let frames = $state.raw<Record<string, Component<FrameProps>> | null>(null);
	let brief = $state({ title: 'Ваш проект', forWhom: 'Для кого он', action: 'Что делает посетитель' });
	let still = $state(true);

	onMount(async () => {
		still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const [f, learner] = await Promise.all([import('#lib/prologue/frames.ts'), import('#lib/learner.ts')]);
		frames = f.FRAMES;
		try {
			const p = await learner.persona();
			brief = { title: p.title, forWhom: p.forWhom, action: p.mainAction.label };
		} catch {
			/* the example words stay */
		}
	});

	const Frame = $derived(frames ? frames[eras[i].id] : null);
</script>

<figure class="dg">
	<figcaption>Один и тот же проект, шесть эпох</figcaption>
	<div class="dg-ctl">
		<label>
			Эпоха:
			<input type="range" min="0" max={eras.length - 1} step="1" bind:value={i} aria-valuetext={eras[i].year} />
		</label>
		<span class="years" aria-hidden="true">
			{#each eras as e, k (e.id)}<button type="button" class:on={k === i} onclick={() => (i = k)} tabindex="-1">{e.year}</button>{/each}
		</span>
	</div>
	<div class="stage" role="img" aria-label="Страница вашего проекта в {eras[i].year} году">
		{#if Frame}<Frame {brief} {still} />{:else}<p class="wait">Собираю страницы…</p>{/if}
	</div>
	<p class="dg-out" aria-live="polite"><strong>{eras[i].year}.</strong> {eras[i].tool}</p>
</figure>

<style>
	.years {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}
	.stage {
		container: prologue / inline-size;
		height: min(60dvh, 30rem);
		border: var(--line) solid var(--border-hairline);
		overflow: hidden;
	}
	.wait {
		margin: var(--space-5);
	}
</style>
