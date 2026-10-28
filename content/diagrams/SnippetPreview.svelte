<!--
	«Три превью одной страницы» (part 2, lesson 7). The person edits title, description and the
	Open Graph fields; the diagram shows how the same page appears on a browser tab, in a search
	result and as a link card in a messenger. The cut-off lengths are rules of thumb: search engines
	and messengers cut by width in pixels, and this diagram cuts by characters.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			site: 'zarechye.example',
			title: 'Название проекта — чем вы занимаетесь',
			description: 'Кто вы, для кого и что человек получит. Одна-две фразы, в которых есть то, что ищут.',
			caption: 'Одна страница, три превью',
			ogTitle: 'og:title (если пусто, берётся title)',
			ogDescription: 'og:description (если пусто, берётся description)',
			tab: 'Вкладка браузера',
			serp: 'Поисковая выдача',
			lengths: (t: number, d: number) => `Длина: title ${t} (около 60 видно), description ${d} (около 155–160).`,
			messenger: 'Ссылка в мессенджере',
			image: 'картинка',
			noImage: 'нет картинки',
			absolute: 'Адрес картинки должен быть полным, с https://: мессенджер сам по относительному адресу её не найдёт.'
		},
		en: {
			site: 'riverbend.example',
			title: 'Project name: what you do',
			description: 'Who you are, who it is for and what a person gets. One or two sentences with the words people search for.',
			caption: 'One page, three previews',
			ogTitle: 'og:title (if empty, title is used)',
			ogDescription: 'og:description (if empty, description is used)',
			tab: 'Browser tab',
			serp: 'Search result',
			lengths: (t: number, d: number) => `Length: title ${t} (about 60 show), description ${d} (about 155 to 160).`,
			messenger: 'Link in a messenger',
			image: 'image',
			noImage: 'no image',
			absolute: 'The image address must be complete, starting with https://. A messenger cannot find the image from a relative address.'
		}
	});

	let title = $state(W.title);
	let description = $state(W.description);
	let ogTitle = $state('');
	let ogDescription = $state('');
	let image = $state(`https://${W.site}/og.png`);
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
	<figcaption>{W.caption}</figcaption>
	<div class="fields">
		<label>title <input type="text" bind:value={title} /></label>
		<label>description <textarea rows="2" bind:value={description}></textarea></label>
		<label>{W.ogTitle} <input type="text" bind:value={ogTitle} /></label>
		<label>{W.ogDescription} <textarea rows="2" bind:value={ogDescription}></textarea></label>
		<label>og:image <input type="text" bind:value={image} spellcheck="false" /></label>
	</div>
	<div class="previews">
		<div>
			<div class="dh">{W.tab}</div>
			<p class="tab">{cut(title, 24)}</p>
		</div>
		<div>
			<div class="dh">{W.serp}</div>
			<div class="serp">
				<p class="url">{W.site}</p>
				<p class="t">{cut(title, 60)}</p>
				<p class="d">{cut(description, 160)}</p>
			</div>
			<p class="note">{W.lengths(title.length, description.length)}</p>
		</div>
		<div>
			<div class="dh">{W.messenger}</div>
			<div class="card">
				<div class="img">{absolute ? W.image : W.noImage}</div>
				<p class="url">{W.site}</p>
				<p class="t">{cut(card.title, 70)}</p>
				<p class="d">{cut(card.description, 110)}</p>
			</div>
			{#if !absolute}<p class="note" role="status">{W.absolute}</p>{/if}
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
	.dh {
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
		color: var(--text-primary);
	}
	.note {
		margin-top: var(--space-2);
		font-size: 0.82rem;
		color: var(--text-secondary);
	}
</style>
