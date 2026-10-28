<!--
	«Какую версию покажут» (part 2, lesson 9). A deliberately small model of how a search engine
	uses hreflang: two versions of a page that point at each other, a visitor whose language is
	chosen, and whether the links are mutual. The rules are simplified: a search engine treats
	hreflang as a hint, not a command.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	// `main` is the site's default version, `second` its translation, `third` a visitor's language the site lacks.
	const W = pick({
		ru: {
			main: 'ru',
			second: 'en',
			third: 'de',
			names: { ru: 'русский', en: 'английский', de: 'немецкий' } as Record<string, string>,
			versions: { ru: 'русскую версию', en: 'английскую версию' } as Record<string, string>,
			none: 'Связей нет: поисковик не знает, что страницы переводят друг друга. Он выберет сам, и скорее всего покажет русскую всем, а английскую сочтёт отдельной страницей.',
			one: 'Связь односторонняя: русская страница указывает на английскую, а английская на русскую не указывает. Такую ссылку поисковик игнорирует: связь должна быть взаимной.',
			mainVisitor: 'Язык посетителя русский: подходит русская версия.',
			secondVisitor: 'Язык посетителя английский, и есть взаимная связь: подходит английская версия.',
			withDefault: 'Немецкой версии нет. Для таких случаев есть запись x-default: «если ничего не подошло, показывайте эту». Здесь она указывает на русскую.',
			noDefault: 'Немецкой версии нет, и записи x-default тоже нет: поисковик решает сам.',
			caption: 'Две версии страницы и посетитель',
			visitorGroup: 'Язык посетителя',
			visitor: 'Язык посетителя:',
			linkGroup: 'Связь между версиями',
			link: 'Связь hreflang:',
			links: { both: 'взаимная', one: 'только в одну сторону', none: 'нет' },
			hasDefault: 'есть x-default',
			itself: '(сама)',
			missing: 'нет ссылки на /ru/',
			shown: 'Посетителю покажут:'
		},
		en: {
			main: 'en',
			second: 'fr',
			third: 'de',
			names: { en: 'English', fr: 'French', de: 'German' } as Record<string, string>,
			versions: { en: 'the English version', fr: 'the French version' } as Record<string, string>,
			none: 'There are no links: the search engine does not know the pages translate each other. It chooses for itself, and will probably show the English page to everyone and treat the French one as a separate page.',
			one: 'The link goes one way: the English page points to the French one, but the French page does not point back. A search engine ignores such a link, because the connection must be mutual.',
			mainVisitor: 'The visitor’s language is English: the English version fits.',
			secondVisitor: 'The visitor’s language is French, and the connection is mutual: the French version fits.',
			withDefault: 'There is no German version. For cases like this there is an x-default entry: “if nothing fits, show this one.” Here it points to the English page.',
			noDefault: 'There is no German version and no x-default entry either, so the search engine decides.',
			caption: 'Two versions of a page and a visitor',
			visitorGroup: 'Visitor’s language',
			visitor: 'Visitor’s language:',
			linkGroup: 'Connection between the versions',
			link: 'hreflang connection:',
			links: { both: 'mutual', one: 'one way only', none: 'none' },
			hasDefault: 'x-default present',
			itself: '(itself)',
			missing: 'no link to /en/',
			shown: 'The visitor will be shown:'
		}
	});
	const A = W.main,
		B = W.second,
		C = W.third;

	let visitor = $state<string>(B);
	let link = $state<'both' | 'one' | 'none'>('both');
	let xdefault = $state(true);

	const result = $derived.by(() => {
		if (link === 'none') return { page: A, why: W.none };
		if (link === 'one') return { page: A, why: W.one };
		if (visitor === A) return { page: A, why: W.mainVisitor };
		if (visitor === B) return { page: B, why: W.secondVisitor };
		return xdefault ? { page: A, why: W.withDefault } : { page: A, why: W.noDefault };
	});
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.visitorGroup}>
		<span>{W.visitor}</span>
		{#each [A, B, C] as v (v)}
			<button type="button" aria-pressed={visitor === v} onclick={() => (visitor = v)}>{W.names[v]}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label={W.linkGroup}>
		<span>{W.link}</span>
		{#each ['both', 'one', 'none'] as v (v)}
			<button type="button" aria-pressed={link === v} onclick={() => (link = v as typeof link)}>{W.links[v as 'both']}</button>
		{/each}
		<label><input type="checkbox" bind:checked={xdefault} /> {W.hasDefault}</label>
	</div>
	<div class="pages">
		<div class="pg" class:win={result.page === A}>
			<p class="dg-mono">/{A}/</p>
			<code>&lt;html lang="{A}"&gt;</code>
			<code>hreflang="{A}" {W.itself}</code>
			{#if link !== 'none'}<code>hreflang="{B}" → /{B}/</code>{/if}
			{#if xdefault}<code>hreflang="x-default" → /{A}/</code>{/if}
		</div>
		<div class="pg" class:win={result.page === B}>
			<p class="dg-mono">/{B}/</p>
			<code>&lt;html lang="{B}"&gt;</code>
			<code>hreflang="{B}" {W.itself}</code>
			{#if link === 'both'}<code>hreflang="{A}" → /{A}/</code>{:else}<code class="miss">{W.missing}</code>{/if}
		</div>
	</div>
	<p class="dg-out" aria-live="polite">{W.shown} <strong>{W.versions[result.page]}</strong>. {result.why}</p>
</figure>

<style>
	.pages {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-3);
	}
	.pg {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
		font-size: 0.85rem;
	}
	.pg.win {
		border-color: var(--accent-measure);
	}
	.pg p {
		margin: 0;
	}
	code {
		overflow-wrap: anywhere;
	}
	.miss {
		color: var(--text-secondary);
		text-decoration: line-through;
	}
</style>
