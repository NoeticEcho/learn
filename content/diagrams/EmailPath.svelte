<!--
	«Путь письма» (part 13, lesson 2). A teaching model, not the rules of any real mail provider: the
	person switches on the pieces that decide where a made-up letter lands (the three signatures of the
	domain, a confirmed address, a one-click unsubscribe) and switches off the habits that hurt (a bought
	list, a misleading subject). A score of «доверие» moves, and the letter lands in the inbox, in spam or
	is refused. Real providers weigh far more than this and do not publish their weights.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			spf: 'SPF: домен перечислил, кому можно писать от его имени',
			dkim: 'DKIM: письмо подписано, подпись проверяется',
			dmarc: 'DMARC: домен сказал, что делать, если проверка не прошла',
			confirmed: 'Адрес подтверждён человеком (двойное согласие)',
			unsub: 'Отписаться можно одним нажатием',
			bought: 'Адреса собраны с согласия, а не куплены',
			lying: 'Тема честно описывает письмо',
			names: {
				inbox: 'Входящие',
				promo: 'Вкладка «Промоакции» или «Рассылки»',
				spam: 'Папка «Спам»',
				refused: 'Отклонено: у домена нет ни SPF, ни DKIM, письмо не прошло проверку'
			},
			caption: 'Куда попадёт письмо',
			did: 'Что вы настроили',
			confirmedLabel: 'Адрес подтверждён по ссылке из письма',
			unsubLabel: 'Отписка одним нажатием',
			didnt: 'Чего вы не сделали',
			boughtLabel: 'Купили базу адресов',
			lyingLabel: 'Тема обещает то, чего нет в письме',
			trust: (n: number) => `Доверие к письму: ${n} из 100`,
			trustWord: 'Доверие',
			of: 'из 100',
			lands: 'Письмо попадёт сюда',
			yes: 'есть',
			no: 'нет',
			note: 'Это учебная модель. Настоящие почтовые сервисы учитывают сотни признаков, включая жалобы читателей, и не публикуют, как именно. Но направление то же: подписи домена, согласие и честность.'
		},
		en: {
			spf: 'SPF: the domain listed who may send email on its behalf',
			dkim: 'DKIM: the email is signed and the signature checks out',
			dmarc: 'DMARC: the domain said what to do if the check fails',
			confirmed: 'The address was confirmed by the person (double opt-in)',
			unsub: 'Unsubscribing takes one click',
			bought: 'The addresses were collected with consent, not bought',
			lying: 'The subject honestly describes the email',
			names: {
				inbox: 'The inbox',
				promo: 'The Promotions or Updates tab',
				spam: 'The spam folder',
				refused: 'Rejected: the domain has neither SPF nor DKIM, so the email failed the check'
			},
			caption: 'Where the email will land',
			did: 'What you set up',
			confirmedLabel: 'The address was confirmed by a link in an email',
			unsubLabel: 'One-click unsubscribe',
			didnt: 'What you did not do',
			boughtLabel: 'You bought a list of addresses',
			lyingLabel: 'The subject promises what the email lacks',
			trust: (n: number) => `Trust in the email: ${n} out of 100`,
			trustWord: 'Trust',
			of: 'out of 100',
			lands: 'The email will land in',
			yes: 'yes',
			no: 'no',
			note: 'This is a teaching model. Real mail services weigh hundreds of signals, including readers’ complaints, and don’t publish exactly how. But the direction is the same: the domain’s signatures, consent and honesty.'
		}
	});

	let spf = $state(false);
	let dkim = $state(false);
	let dmarc = $state(false);
	let confirmed = $state(false);
	let unsub = $state(false);
	let bought = $state(false);
	let lying = $state(false);

	const parts = $derived([
		{ ok: spf, plus: 15, text: W.spf },
		{ ok: dkim, plus: 20, text: W.dkim },
		{ ok: dmarc, plus: 15, text: W.dmarc },
		{ ok: confirmed, plus: 20, text: W.confirmed },
		{ ok: unsub, plus: 10, text: W.unsub },
		{ ok: !bought, plus: 15, text: W.bought },
		{ ok: !lying, plus: 5, text: W.lying }
	]);
	const score = $derived(parts.reduce((s, p) => s + (p.ok ? p.plus : 0), 0));
	const verdict = $derived(!spf && !dkim ? 'refused' : score >= 70 ? 'inbox' : score >= 45 ? 'promo' : 'spam');
	const names: Record<string, string> = W.names;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="grid">
		<fieldset>
			<legend>{W.did}</legend>
			<label><input type="checkbox" bind:checked={spf} /> SPF</label>
			<label><input type="checkbox" bind:checked={dkim} /> DKIM</label>
			<label><input type="checkbox" bind:checked={dmarc} /> DMARC</label>
			<label><input type="checkbox" bind:checked={confirmed} /> {W.confirmedLabel}</label>
			<label><input type="checkbox" bind:checked={unsub} /> {W.unsubLabel}</label>
		</fieldset>
		<fieldset>
			<legend>{W.didnt}</legend>
			<label><input type="checkbox" bind:checked={bought} /> {W.boughtLabel}</label>
			<label><input type="checkbox" bind:checked={lying} /> {W.lyingLabel}</label>
		</fieldset>
	</div>

	<div class="meter" role="img" aria-label={W.trust(score)}>
		<div class="fill" style="width: {score}%"></div>
	</div>
	<p class="dg-out" aria-live="polite">{W.trustWord}: <strong>{score} {W.of}</strong>. {W.lands}: <strong>{names[verdict]}</strong>.</p>
	<ul>
		{#each parts as p, i (i)}
			<li class:no={!p.ok}>{p.ok ? W.yes : W.no}: {p.text}</li>
		{/each}
	</ul>
	<p class="dg-out">{W.note}</p>
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
