<!--
	«Что делает float» (part 3, lesson 2). Two columns floated left and right, a footer, and three
	switches: float itself, clear on the footer, and the clearfix on the container. Without clear
	the footer climbs up beside the columns and the container, which holds only floats, collapses to
	nothing: the outline around it shows the height it thinks it has. This is the old trick the
	2005 era used for columns, shown as a trap before flexbox and grid replace it.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			caption: 'Две колонки на float',
			float: 'float у колонок',
			clear: 'clear: both у подвала',
			clearfix: 'clearfix у контейнера',
			main: 'Основное: главная колонка с текстом страницы. Её высота зависит от текста.',
			side: 'Боковая: контакты',
			foot: 'Подвал',
			stacked: 'Без float блоки идут друг под другом: каждый занимает всю строку. Колонок нет.',
			collapsed:
				'Колонки встали рядом, но контейнер (пунктир) схлопнулся: float «вынимает» блок из потока, и контейнеру не на что опереться. Подвал полез наверх и обтекает колонки. Включите clear или clearfix.',
			cleared: 'Подвал получил clear: both и встал под обеими колонками. Контейнер при этом всё ещё схлопнут, и его рамка или фон не охватят колонки.',
			fixed: 'Clearfix заставляет контейнер охватить свои плавающие блоки, и подвал оказывается под ними. Это и есть старый приём: для колонок он пригождался десять лет.',
			today: 'Сегодня колонки делают flexbox и grid, где такой возни нет. А float остался для своей первой задачи: чтобы текст обтекал картинку.'
		},
		en: {
			caption: 'Two columns made with float',
			float: 'float on the columns',
			clear: 'clear: both on the footer',
			clearfix: 'clearfix on the container',
			main: 'Main: the main column with the text of the page. Its height depends on the text.',
			side: 'Side: contact details',
			foot: 'Footer',
			stacked: 'Without float the blocks sit one under another: each takes the whole line. There are no columns.',
			collapsed:
				'The columns now sit side by side, but the container (dashed) has collapsed: float takes a block out of the flow, so the container has nothing to rest on. The footer has climbed up and wraps around the columns. Turn on clear or clearfix.',
			cleared: 'The footer has clear: both and sits below both columns. The container is still collapsed, though, so its border or background will not reach around the columns.',
			fixed: 'The clearfix makes the container reach around its floated blocks, so the footer lands below them. That is the old trick, and for ten years it was how columns were made.',
			today: 'Today flexbox and grid make columns, with none of this fuss. Float stays for its first job: letting text wrap around an image.'
		}
	});
	let floated = $state(true);
	let clear = $state(false);
	let fix = $state(false);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={floated} /> {W.float}</label>
		<label><input type="checkbox" bind:checked={clear} /> {W.clear}</label>
		<label><input type="checkbox" bind:checked={fix} /> {W.clearfix}</label>
	</div>
	<div class="wrap" class:fix>
		<div class="cols" class:floated>
			<div class="a">{W.main}</div>
			<div class="b">{W.side}</div>
		</div>
		<div class="foot" class:clear>{W.foot}</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if !floated}
			{W.stacked}
		{:else if !clear && !fix}
			{W.collapsed}
		{:else if clear && !fix}
			{W.cleared}
		{:else}
			{W.fixed}
		{/if}
		{W.today}
	</p>
</figure>

<style>
	.wrap {
		padding: var(--space-2);
		background: var(--surface-canvas);
	}
	.cols {
		outline: var(--line) dashed var(--border-brass);
		margin-bottom: var(--space-2);
	}
	.wrap.fix .cols::after {
		content: '';
		display: block;
		clear: both;
	}
	.a,
	.b {
		padding: var(--space-2) var(--space-3);
		font-size: 0.85rem;
		box-sizing: border-box;
		color: var(--text-primary);
	}
	.a {
		background: color-mix(in srgb, #3b7fd1 35%, transparent);
	}
	.b {
		background: color-mix(in srgb, #3f8f5a 35%, transparent);
	}
	.cols.floated .a {
		float: left;
		width: 66%;
	}
	.cols.floated .b {
		float: right;
		width: 32%;
	}
	.foot {
		padding: var(--space-2) var(--space-3);
		background: color-mix(in srgb, #d9822b 35%, transparent);
		color: var(--text-primary);
		font-size: 0.85rem;
	}
	.foot.clear {
		clear: both;
	}
</style>
