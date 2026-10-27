<!--
	«Два конвейера» (part 6, lesson 2). The same visitor count sent through a static page (a file,
	maybe from a cache) and a dynamic one (code, then a database, then HTML), with and without a
	cache in front of the dynamic one. The numbers are illustrative, not measured: a small model
	(a constant for the file, a base time plus a queue once the server is saturated for the code)
	to show the shape, which is flat for the file and bends for the code, and what a cache does.
-->
<script lang="ts">
	import './shared.css';

	let visitors = $state(200); // per minute
	let cache = $state(false);

	const staticMs = 40;
	const capacity = 400; // visits per minute one small server answers without a queue
	const dynamicMs = $derived.by(() => {
		const base = cache ? 70 : 220;
		const cap = cache ? capacity * 8 : capacity;
		const over = Math.max(0, visitors - cap);
		return Math.round(base + over * (cache ? 0.2 : 0.9));
	});
	const servers = $derived(Math.max(1, Math.ceil(visitors / (cache ? capacity * 8 : capacity))));
	const rub = $derived({ static: 0, dynamic: servers * 1500 + (cache ? 500 : 0) });
	const pct = (ms: number) => Math.min(100, Math.round((ms / 1500) * 100));
</script>

<figure class="dg">
	<figcaption>Тот же поток посетителей, два способа</figcaption>
	<div class="dg-ctl">
		<label>Посетителей в минуту: {visitors}
			<input type="range" min="10" max="4000" step="10" bind:value={visitors} />
		</label>
		<label><input type="checkbox" bind:checked={cache} /> перед динамической страницей стоит кэш</label>
	</div>
	<div class="two">
		<section aria-label="Статическая страница">
			<div class="dh">Статика: файл, часто из кэша</div>
			<p class="flow">запрос → <b>файл</b> → ответ</p>
			<div class="bar"><span class="fill" style="width:{pct(staticMs)}%"></span></div>
			<p class="num">≈ {staticMs} мс · серверов: 0 (раздаёт хостинг или CDN) · ≈ {rub.static} ₽ в месяц сверх хостинга</p>
		</section>
		<section aria-label="Динамическая страница">
			<div class="dh">Динамика: код и база</div>
			<p class="flow">запрос → код → <b>база</b> → HTML → ответ</p>
			<div class="bar"><span class="fill dyn" style="width:{pct(dynamicMs)}%"></span></div>
			<p class="num">на одном сервере ≈ {dynamicMs} мс · чтобы держать нагрузку без очереди, нужно серверов: {servers} (≈ {rub.dynamic.toLocaleString('ru-RU')} ₽ в месяц)</p>
		</section>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if dynamicMs > 600}Один сервер уже не справляется: очередь запросов растёт, посетители ждут. Нужны кэш или больше серверов (а значит, и больше денег).
		{:else if cache}Кэш делает динамическую страницу почти такой же быстрой: большая часть ответов отдаётся готовой.
		{:else}При небольшом потоке разница заметна, но терпима. Она растёт вместе с числом посетителей.{/if}
	</p>
	<p class="note">Цифры условные: они показывают форму кривой, а не замер. В жизни всё зависит от кода, базы и железа.</p>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.flow {
		margin: 0 0 var(--space-2);
	}
	.bar {
		height: 0.9rem;
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.fill.dyn {
		background: var(--brass-300);
	}
	.num,
	.note {
		margin: var(--space-2) 0 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
