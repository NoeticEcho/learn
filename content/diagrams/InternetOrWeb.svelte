<!--
	«Интернет или веб?» (part 1, lesson 1). A timeline of eight events, 1969–1993. The person says
	for each one whether it belongs to the internet (the network) or to the web (a service on it),
	and is told why at once. Chosen, not scored: a wrong answer teaches what the right one means.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	type Side = 'net' | 'web';
	type Ev = { year: string; text: string; side: Side; why: string };
	const W = pick({
		ru: {
			caption: 'Что из этого интернет, а что веб',
			question: 'Это интернет или веб?',
			label: { net: 'Интернет (сеть)', web: 'Веб (страницы и ссылки)' } as Record<Side, string>,
			right: 'Верно.',
			wrong: (side: string) => `Нет, это ${side}.`,
			wrongSide: { net: 'интернет', web: 'веб' } as Record<Side, string>,
			tally: (done: number, total: number, right: number) => ({ a: `Отвечено: ${done} из ${total}. Верно: `, b: String(right), c: '.' }),
			events: [
				{ year: '1969', text: 'Первое соединение между компьютерами в Калифорнийском университете и в Стэнфордском институте (сеть ARPANET)', side: 'net', why: 'Это сама сеть: провода и компьютеры, которые научились обмениваться данными. Страниц ещё нет.' },
				{ year: '1971', text: 'Рэй Томлинсон отправляет первое письмо по сети', side: 'net', why: 'Электронная почта работает по интернету, но это не веб: у неё свой протокол и свои программы.' },
				{ year: '1983', text: 'Сеть переходит на протоколы TCP/IP', side: 'net', why: 'TCP/IP это правила, по которым данные ходят по сети. Веб потом использует их же.' },
				{ year: '1983', text: 'Придумана система доменных имён (DNS)', side: 'net', why: 'DNS переводит имена в адреса. Она служит и вебу, и почте, и всему остальному.' },
				{ year: '1989', text: 'Тим Бернерс-Ли пишет предложение «Управление информацией» в CERN', side: 'web', why: 'Это идея связанных документов со ссылками: первый шаг к вебу.' },
				{ year: '1990', text: 'В CERN работают первый веб-сервер, первый браузер и первая страница', side: 'web', why: 'Появились три части веба: сервер, браузер и страница со ссылками.' },
				{ year: '1993', text: 'Выходит браузер Mosaic с картинками в тексте', side: 'web', why: 'Mosaic сделал веб удобным для обычных людей: картинки рядом с текстом и ссылки по щелчку.' },
				{ year: '1993', text: 'CERN объявляет, что веб свободен и его код в общественном достоянии', side: 'web', why: 'Это решение о вебе: каждый может строить сайты и браузеры без лицензий и платы.' }
			] as Ev[]
		},
		en: {
			caption: 'Which of these is the internet, and which is the web',
			question: 'Is this the internet or the web?',
			label: { net: 'Internet (the network)', web: 'Web (pages and links)' } as Record<Side, string>,
			right: 'Correct.',
			wrong: (side: string) => `No, this is the ${side}.`,
			wrongSide: { net: 'internet', web: 'web' } as Record<Side, string>,
			tally: (done: number, total: number, right: number) => ({ a: `Answered: ${done} of ${total}. Correct: `, b: String(right), c: '.' }),
			events: [
				{ year: '1969', text: 'The first connection between computers at the University of California, Los Angeles and the Stanford Research Institute (the ARPANET)', side: 'net', why: 'This is the network itself: wires and computers that learned to exchange data. There are no pages yet.' },
				{ year: '1971', text: 'Ray Tomlinson sends the first email over the network', side: 'net', why: 'Email runs over the internet, but it isn’t the web: it has its own protocol and its own programs.' },
				{ year: '1983', text: 'The network switches to the TCP/IP protocols', side: 'net', why: 'TCP/IP is the set of rules by which data travels the network. The web later uses the same ones.' },
				{ year: '1983', text: 'The domain name system (DNS) is invented', side: 'net', why: 'DNS turns names into addresses. It serves the web, email and everything else.' },
				{ year: '1989', text: 'Tim Berners-Lee writes the proposal “Information Management: A Proposal” at CERN', side: 'web', why: 'This is the idea of linked documents with links between them: the first step toward the web.' },
				{ year: '1990', text: 'At CERN the first web server, the first browser and the first page are running', side: 'web', why: 'The three parts of the web appeared: a server, a browser and a page with links.' },
				{ year: '1993', text: 'The Mosaic browser comes out, with pictures in the text', side: 'web', why: 'Mosaic made the web easy for ordinary people: pictures beside the text, and links you follow with a click.' },
				{ year: '1993', text: 'CERN announces that the web is free and its code is in the public domain', side: 'web', why: 'This is a decision about the web: anyone can build sites and browsers without licenses or fees.' }
			] as Ev[]
		}
	});
	const events = W.events;
	const label = W.label;
	let answer = $state<(Side | null)[]>(events.map(() => null));
	const right = $derived(events.filter((e, i) => answer[i] === e.side).length);
	const done = $derived(answer.filter(Boolean).length);
	const tally = $derived(W.tally(done, events.length, right));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<ol class="events">
		{#each events as e, i (i)}
			<li>
				<p class="what"><strong>{e.year}.</strong> {e.text}</p>
				<div class="dg-ctl" role="group" aria-label="{W.question} {e.year}: {e.text}">
					{#each ['net', 'web'] as const as s (s)}
						<button type="button" aria-pressed={answer[i] === s} onclick={() => (answer[i] = s)}>{label[s]}</button>
					{/each}
				</div>
				{#if answer[i]}
					<p class="fb" class:ok={answer[i] === e.side} role="status">
						{answer[i] === e.side ? W.right : W.wrong(W.wrongSide[e.side])} {e.why}
					</p>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">{tally.a}<strong>{tally.b}</strong>{tally.c}</p>
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
