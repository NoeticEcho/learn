<!--
	«Какую версию покажут» (part 2, lesson 9). A deliberately small model of how a search engine
	uses hreflang: two versions of a page that point at each other, a visitor whose language is
	chosen, and whether the links are mutual. The rules are simplified: a search engine treats
	hreflang as a hint, not a command.
-->
<script lang="ts">
	import './shared.css';

	let visitor = $state<'ru' | 'en' | 'de'>('en');
	let link = $state<'both' | 'one' | 'none'>('both');
	let xdefault = $state(true);

	const result = $derived.by(() => {
		if (link === 'none') return { page: 'ru', why: 'Связей нет: поисковик не знает, что страницы — переводы друг друга. Он выберет сам, и скорее всего покажет русскую всем, а английскую сочтёт отдельной страницей.' };
		if (link === 'one') return { page: 'ru', why: 'Связь односторонняя: русская страница указывает на английскую, а английская на русскую не указывает. Такую ссылку поисковик игнорирует: связь должна быть взаимной.' };
		if (visitor === 'ru') return { page: 'ru', why: 'Язык посетителя русский: подходит русская версия.' };
		if (visitor === 'en') return { page: 'en', why: 'Язык посетителя английский, и есть взаимная связь: подходит английская версия.' };
		return xdefault
			? { page: 'ru', why: 'Немецкой версии нет. Для таких случаев есть запись x-default: «если ничего не подошло, показывайте эту». Здесь она указывает на русскую.' }
			: { page: 'ru', why: 'Немецкой версии нет, и записи x-default тоже нет: поисковик решает сам.' };
	});
</script>

<figure class="dg">
	<figcaption>Две версии страницы и посетитель</figcaption>
	<div class="dg-ctl" role="group" aria-label="Язык посетителя">
		<span>Язык посетителя:</span>
		{#each [['ru', 'русский'], ['en', 'английский'], ['de', 'немецкий']] as [v, name] (v)}
			<button type="button" aria-pressed={visitor === v} onclick={() => (visitor = v as typeof visitor)}>{name}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label="Связь между версиями">
		<span>Связь hreflang:</span>
		{#each [['both', 'взаимная'], ['one', 'только в одну сторону'], ['none', 'нет']] as [v, name] (v)}
			<button type="button" aria-pressed={link === v} onclick={() => (link = v as typeof link)}>{name}</button>
		{/each}
		<label><input type="checkbox" bind:checked={xdefault} /> есть x-default</label>
	</div>
	<div class="pages">
		<div class="pg" class:win={result.page === 'ru'}>
			<p class="dg-mono">/ru/</p>
			<code>&lt;html lang="ru"&gt;</code>
			<code>hreflang="ru" (сама)</code>
			{#if link !== 'none'}<code>hreflang="en" → /en/</code>{/if}
			{#if xdefault}<code>hreflang="x-default" → /ru/</code>{/if}
		</div>
		<div class="pg" class:win={result.page === 'en'}>
			<p class="dg-mono">/en/</p>
			<code>&lt;html lang="en"&gt;</code>
			<code>hreflang="en" (сама)</code>
			{#if link === 'both'}<code>hreflang="ru" → /ru/</code>{:else}<code class="miss">нет ссылки на /ru/</code>{/if}
		</div>
	</div>
	<p class="dg-out" aria-live="polite">Посетителю покажут: <strong>{result.page === 'ru' ? 'русскую версию' : 'английскую версию'}</strong>. {result.why}</p>
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
