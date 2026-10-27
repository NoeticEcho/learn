<!--
	«Три превью одной страницы» (part 2, lesson 7). The person edits title, description and the
	Open Graph fields; the diagram shows how the same page appears on a browser tab, in a search
	result and as a link card in a messenger. The cut-off lengths are rules of thumb: search engines
	and messengers cut by width in pixels, and this diagram cuts by characters.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let title = $state('Название проекта — чем вы занимаетесь');
	let description = $state('Кто вы, для кого и что человек получит. Одна-две фразы, в которых есть то, что ищут.');
	let ogTitle = $state('');
	let ogDescription = $state('');
	let image = $state('https://zarechye.example/og.png');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			title = p.title || title;
			description = [p.who, p.forWhom].filter(Boolean).join('. ') + '.';
		} catch {
			/* the example stays */
		}
	});

	const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
	const card = $derived({ title: ogTitle || title, description: ogDescription || description });
	const absolute = $derived(/^https:\/\/\S+/.test(image));
</script>

<figure class="dg">
	<figcaption>Одна страница, три превью</figcaption>
	<div class="fields">
		<label>title <input type="text" bind:value={title} /></label>
		<label>description <textarea rows="2" bind:value={description}></textarea></label>
		<label>og:title (если пусто, берётся title) <input type="text" bind:value={ogTitle} /></label>
		<label>og:description (если пусто, берётся description) <textarea rows="2" bind:value={ogDescription}></textarea></label>
		<label>og:image <input type="text" bind:value={image} spellcheck="false" /></label>
	</div>
	<div class="previews">
		<div>
			<h4>Вкладка браузера</h4>
			<p class="tab">{cut(title, 24)}</p>
		</div>
		<div>
			<h4>Поисковая выдача</h4>
			<div class="serp">
				<p class="url">zarechye.example</p>
				<p class="t">{cut(title, 60)}</p>
				<p class="d">{cut(description, 160)}</p>
			</div>
			<p class="note">Длина: title {title.length} (около 60 видно), description {description.length} (около 155–160).</p>
		</div>
		<div>
			<h4>Ссылка в мессенджере</h4>
			<div class="card">
				<div class="img">{absolute ? 'картинка' : 'нет картинки'}</div>
				<p class="url">zarechye.example</p>
				<p class="t">{cut(card.title, 70)}</p>
				<p class="d">{cut(card.description, 110)}</p>
			</div>
			{#if !absolute}<p class="note" role="status">Адрес картинки должен быть полным, с https://: мессенджер сам по относительному адресу её не найдёт.</p>{/if}
		</div>
	</div>
</figure>

<style>
	.fields {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.fields label {
		display: grid;
		gap: var(--space-1);
	}
	input[type='text'],
	textarea {
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font: inherit;
		min-width: 0;
	}
	.previews {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-4);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	p {
		margin: 0;
	}
	.tab {
		display: inline-block;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		border-bottom: 0;
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	.serp,
	.card {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	.url {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
	.t {
		margin: var(--space-1) 0;
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.d {
		color: var(--text-body);
		overflow-wrap: anywhere;
	}
	.img {
		display: grid;
		place-items: center;
		height: 5rem;
		margin: calc(var(--space-3) * -1) calc(var(--space-3) * -1) var(--space-2);
		background: var(--border-hairline);
		color: var(--text-secondary);
	}
	.note {
		margin-top: var(--space-2);
		font-size: 0.82rem;
		color: var(--text-secondary);
	}
</style>
