<!--
	«Что делает float» (part 3, lesson 2). Two columns floated left and right, a footer, and three
	switches: float itself, clear on the footer, and the clearfix on the container. Without clear
	the footer climbs up beside the columns and the container, which holds only floats, collapses to
	nothing: the outline around it shows the height it thinks it has. This is the old trick the
	2005 era used for columns, shown as a trap before flexbox and grid replace it.
-->
<script lang="ts">
	import './shared.css';
	let floated = $state(true);
	let clear = $state(false);
	let fix = $state(false);
</script>

<figure class="dg">
	<figcaption>Две колонки на float</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={floated} /> float у колонок</label>
		<label><input type="checkbox" bind:checked={clear} /> clear: both у подвала</label>
		<label><input type="checkbox" bind:checked={fix} /> clearfix у контейнера</label>
	</div>
	<div class="wrap" class:fix>
		<div class="cols" class:floated>
			<div class="a">Основное: главная колонка с текстом страницы. Её высота зависит от текста.</div>
			<div class="b">Боковая: контакты</div>
		</div>
		<div class="foot" class:clear>Подвал</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if !floated}
			Без float блоки идут друг под другом: каждый занимает всю строку. Колонок нет.
		{:else if !clear && !fix}
			Колонки встали рядом, но контейнер (пунктир) схлопнулся: float «вынимает» блок из потока, и контейнеру не на что опереться. Подвал полез наверх и обтекает колонки. Включите clear или clearfix.
		{:else if clear && !fix}
			Подвал получил clear: both и встал под обеими колонками. Контейнер при этом всё ещё схлопнут, и его рамка или фон не охватят колонки.
		{:else}
			Clearfix заставляет контейнер охватить свои плавающие блоки, и подвал оказывается под ними. Это и есть старый приём: для колонок он пригождался десять лет.
		{/if}
		Сегодня колонки делают flexbox и grid, где такой возни нет. А float остался для своей первой задачи: чтобы текст обтекал картинку.
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
		font-size: 0.85rem;
	}
	.foot.clear {
		clear: both;
	}
</style>
