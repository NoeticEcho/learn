<!--
	«Сравни эпохи» (part 0, lesson 2). The prologue's own era frames, driven by a slider, with the
	person's own words in them. Nothing is copied: the frames are the prologue's components.
-->
<script lang="ts">
	import './shared.css';
	import { onMount, type Component } from 'svelte';
	import type { FrameProps } from '#lib/prologue/types.ts';
	import type { EraId } from '#lib/prologue/sequence.ts';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			caption: 'Один и тот же проект, шесть эпох',
			label: 'Эпоха:',
			stage: (year: string) => `Страница вашего проекта в ${year} году`,
			wait: 'Собираю страницы…',
			project: 'Ваш проект',
			forWhom: 'Для кого он',
			action: 'Что делает посетитель',
			tools: {
				'1991': 'Чистый HTML, написанный вручную: заголовки, абзацы, ссылки.',
				'1996': 'Таблицы для раскладки, тег font, фоновая плитка и счётчик посетителей в виде картинки.',
				'2000': 'Flash: анимированная заставка и кнопка «пропустить».',
				'2005': 'Отдельный CSS, градиенты и скруглённые углы: «веб 2.0».',
				'2014': 'Адаптивная вёрстка: один сайт перестраивается под ширину экрана.',
				'2025': 'ИИ-конструктор: сайт собирается по описанию словами.'
			} as Record<string, string>
		},
		en: {
			caption: 'One project, six eras',
			label: 'Era:',
			stage: (year: string) => `Your project’s page in ${year}`,
			wait: 'Building the pages…',
			project: 'Your project',
			forWhom: 'Who it’s for',
			action: 'What a visitor does',
			tools: {
				'1991': 'Plain HTML written by hand: headings, paragraphs, links.',
				'1996': 'Tables for layout, the font tag, a tiled background and a visitor counter made of images.',
				'2000': 'Flash: an animated intro and a “skip” button.',
				'2005': 'A separate CSS file, gradients and rounded corners: “web 2.0”.',
				'2014': 'Responsive layout: one site rearranges itself to the width of the screen.',
				'2025': 'An AI builder: the site is built from a description in words.'
			} as Record<string, string>
		}
	});

	const eras: { id: EraId; year: string; tool: string }[] = (['1991', '1996', '2000', '2005', '2014', '2025'] as const).map((id) => ({
		id,
		year: id,
		tool: W.tools[id]
	}));

	let i = $state(0);
	let frames = $state.raw<Record<string, Component<FrameProps>> | null>(null);
	let brief = $state({ title: W.project, forWhom: W.forWhom, action: W.action });
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
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.label}
			<input type="range" min="0" max={eras.length - 1} step="1" bind:value={i} aria-valuetext={eras[i].year} />
		</label>
		<span class="years" aria-hidden="true">
			{#each eras as e, k (e.id)}<button type="button" class:on={k === i} onclick={() => (i = k)} tabindex="-1">{e.year}</button>{/each}
		</span>
	</div>
	<div class="stage" role="img" aria-label={W.stage(eras[i].year)}>
		{#if Frame}<Frame {brief} {still} />{:else}<p class="wait">{W.wait}</p>{/if}
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
