<!--
	«Путь письма» (part 13, lesson 2). A teaching model, not the rules of any real mail provider: the
	person switches on the pieces that decide where a made-up letter lands (the three signatures of the
	domain, a confirmed address, a one-click unsubscribe) and switches off the habits that hurt (a bought
	list, a misleading subject). A score of «доверие» moves, and the letter lands in the inbox, in spam or
	is refused. Real providers weigh far more than this and do not publish their weights.
-->
<script lang="ts">
	import './shared.css';

	let spf = $state(false);
	let dkim = $state(false);
	let dmarc = $state(false);
	let confirmed = $state(false);
	let unsub = $state(false);
	let bought = $state(false);
	let lying = $state(false);

	const parts = $derived([
		{ ok: spf, plus: 15, text: 'SPF: домен перечислил, кому можно писать от его имени' },
		{ ok: dkim, plus: 20, text: 'DKIM: письмо подписано, подпись проверяется' },
		{ ok: dmarc, plus: 15, text: 'DMARC: домен сказал, что делать, если проверка не прошла' },
		{ ok: confirmed, plus: 20, text: 'Адрес подтверждён человеком (двойное согласие)' },
		{ ok: unsub, plus: 10, text: 'Отписаться можно одним нажатием' },
		{ ok: !bought, plus: 15, text: 'Адреса собраны с согласия, а не куплены' },
		{ ok: !lying, plus: 5, text: 'Тема честно описывает письмо' }
	]);
	const score = $derived(parts.reduce((s, p) => s + (p.ok ? p.plus : 0), 0));
	const verdict = $derived(!spf && !dkim ? 'refused' : score >= 70 ? 'inbox' : score >= 45 ? 'promo' : 'spam');
	const names: Record<string, string> = {
		inbox: 'Входящие',
		promo: 'Вкладка «Промоакции» или «Рассылки»',
		spam: 'Папка «Спам»',
		refused: 'Отклонено: у домена нет ни SPF, ни DKIM, письмо не прошло проверку'
	};
</script>

<figure class="dg">
	<figcaption>Куда попадёт письмо</figcaption>
	<div class="grid">
		<fieldset>
			<legend>Что вы настроили</legend>
			<label><input type="checkbox" bind:checked={spf} /> SPF</label>
			<label><input type="checkbox" bind:checked={dkim} /> DKIM</label>
			<label><input type="checkbox" bind:checked={dmarc} /> DMARC</label>
			<label><input type="checkbox" bind:checked={confirmed} /> Адрес подтверждён по ссылке из письма</label>
			<label><input type="checkbox" bind:checked={unsub} /> Отписка одним нажатием</label>
		</fieldset>
		<fieldset>
			<legend>Чего вы не сделали</legend>
			<label><input type="checkbox" bind:checked={bought} /> Купили базу адресов</label>
			<label><input type="checkbox" bind:checked={lying} /> Тема обещает то, чего нет в письме</label>
		</fieldset>
	</div>

	<div class="meter" role="img" aria-label="Доверие к письму: {score} из 100">
		<div class="fill" style="width: {score}%"></div>
	</div>
	<p class="dg-out" aria-live="polite">Доверие: <strong>{score} из 100</strong>. Письмо попадёт сюда: <strong>{names[verdict]}</strong>.</p>
	<ul>
		{#each parts as p, i (i)}
			<li class:no={!p.ok}>{p.ok ? 'есть' : 'нет'}: {p.text}</li>
		{/each}
	</ul>
	<p class="dg-out">Это учебная модель. Настоящие почтовые сервисы учитывают сотни признаков, включая жалобы читателей, и не публикуют, как именно. Но направление то же: подписи домена, согласие и честность.</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	fieldset {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-1);
	}
	legend {
		padding: 0 var(--space-2);
		color: var(--text-secondary);
	}
	.meter {
		height: 0.9rem;
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.fill {
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
	ul {
		list-style: none;
		padding: 0 !important;
		margin: var(--space-3) 0 0;
		display: grid;
		gap: var(--space-1);
		color: var(--text-secondary);
	}
	li.no {
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}
</style>
