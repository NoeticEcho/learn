<!--
	«Интернет или веб?» (part 1, lesson 1). A timeline of eight events, 1969–1993. The person says
	for each one whether it belongs to the internet (the network) or to the web (a service on it),
	and is told why at once. Chosen, not scored: a wrong answer teaches what the right one means.
-->
<script lang="ts">
	import './shared.css';
	type Side = 'net' | 'web';
	const events: { year: string; text: string; side: Side; why: string }[] = [
		{ year: '1969', text: 'Первое соединение между компьютерами в Калифорнийском университете и в Стэнфордском институте (сеть ARPANET)', side: 'net', why: 'Это сама сеть: провода и компьютеры, которые научились обмениваться данными. Страниц ещё нет.' },
		{ year: '1971', text: 'Рэй Томлинсон отправляет первое письмо по сети', side: 'net', why: 'Электронная почта работает по интернету, но это не веб: у неё свой протокол и свои программы.' },
		{ year: '1983', text: 'Сеть переходит на протоколы TCP/IP', side: 'net', why: 'TCP/IP это правила, по которым данные ходят по сети. Веб потом использует их же.' },
		{ year: '1983', text: 'Придумана система доменных имён (DNS)', side: 'net', why: 'DNS переводит имена в адреса. Она служит и вебу, и почте, и всему остальному.' },
		{ year: '1989', text: 'Тим Бернерс-Ли пишет предложение «Управление информацией» в CERN', side: 'web', why: 'Это идея связанных документов со ссылками: первый шаг к вебу.' },
		{ year: '1990', text: 'В CERN работают первый веб-сервер, первый браузер и первая страница', side: 'web', why: 'Появились три части веба: сервер, браузер и страница со ссылками.' },
		{ year: '1993', text: 'Выходит браузер Mosaic с картинками в тексте', side: 'web', why: 'Mosaic сделал веб удобным для обычных людей: картинки рядом с текстом и ссылки по щелчку.' },
		{ year: '1993', text: 'CERN объявляет, что веб свободен и его код в общественном достоянии', side: 'web', why: 'Это решение о вебе: каждый может строить сайты и браузеры без лицензий и платы.' }
	];
	let answer = $state<(Side | null)[]>(events.map(() => null));
	const right = $derived(events.filter((e, i) => answer[i] === e.side).length);
	const done = $derived(answer.filter(Boolean).length);
	const label: Record<Side, string> = { net: 'Интернет (сеть)', web: 'Веб (страницы и ссылки)' };
</script>

<figure class="dg">
	<figcaption>Что из этого интернет, а что веб</figcaption>
	<ol class="events">
		{#each events as e, i (i)}
			<li>
				<p class="what"><strong>{e.year}.</strong> {e.text}</p>
				<div class="dg-ctl" role="group" aria-label="Это интернет или веб? {e.year}: {e.text}">
					{#each ['net', 'web'] as const as s (s)}
						<button type="button" aria-pressed={answer[i] === s} onclick={() => (answer[i] = s)}>{label[s]}</button>
					{/each}
				</div>
				{#if answer[i]}
					<p class="fb" class:ok={answer[i] === e.side} role="status">
						{answer[i] === e.side ? 'Верно.' : `Нет, это ${label[e.side].split(' ')[0].toLowerCase()}.`} {e.why}
					</p>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">Отвечено: {done} из {events.length}. Верно: <strong>{right}</strong>.</p>
</figure>

<style>
	.events {
		display: grid;
		gap: var(--space-4);
		list-style: none;
		padding: 0 !important;
		margin: 0;
	}
	.what {
		margin: 0 0 var(--space-2);
		color: var(--text-primary);
	}
	.fb {
		margin: 0;
		color: var(--text-secondary);
		border-left: 3px solid var(--border-rule);
		padding-left: var(--space-3);
	}
	.fb.ok {
		border-left-color: var(--accent-state-text);
	}
</style>
