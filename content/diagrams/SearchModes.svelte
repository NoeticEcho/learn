<!--
	«Поиск по словам и по смыслу» (part 7, lesson 6). Words: the person's own services searched with
	a teaching stemmer (it cuts common endings: Russian ones, or English ones in the English edition; real
	search engines use fuller dictionaries), showing the tokens, stems and a ranking, and what LIKE would do
	without morphology. Meaning: nine invented questions of visitors on a 2D map whose coordinates were
	placed by hand, because real embeddings have hundreds of dimensions and come from a model; the nearest
	three to a chosen query are lit, beside what a word search would have found.

	Bilingual (docs/content-plan/README.md, «English edition»): the words, the stemmer, the stop words and
	the invented questions are in `W`, one entry per edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	let tab = $state<'words' | 'meaning'>('words');

	/* ---------- words ---------- */
	const ENDINGS_RU = 'ыми ими ого его ому ему ией иям иях ами ями ов ев ей ий ый ой ом ем ам ям ах ях ия ие ые ых их ая яя ое ее ую юю ью ию а я о е у ю ы и ь й'.split(' ').sort((a, b) => b.length - a.length);
	// English: one inflection off, then a final y or e folded away, so survey, surveys, surveyed and surveying meet.
	const ENDINGS_EN = 'ingly edly ings ing ies ied ers er ed es ly s'.split(' ').sort((a, b) => b.length - a.length);
	const stemRu = (w: string): string => {
		for (const e of ENDINGS_RU) if (w.length - e.length >= 3 && w.endsWith(e)) return w.slice(0, -e.length);
		return w;
	};
	const stemEn = (w: string): string => {
		let r = w;
		for (const e of ENDINGS_EN) {
			if (w.length - e.length < 3 || !w.endsWith(e) || (e === 's' && w.endsWith('ss'))) continue;
			r = w.slice(0, -e.length) + (e === 'ies' || e === 'ied' ? 'y' : '');
			if (/(.)\1$/.test(r) && !/(ll|ss|zz)$/.test(r) && ['ed', 'ing', 'er', 'ers', 'ings', 'ingly', 'edly'].includes(e)) r = r.slice(0, -1);
			break;
		}
		return r.replace(/y$/, 'i').replace(/e$/, '');
	};
	const W = pick({
		ru: {
			stop: new Set('и в во на с со по к о об от до за из для не что как а но или же ли бы это при у то'.split(' ')),
			stem: stemRu,
			word: /[а-яёa-z0-9]+/g,
			docs: [
				{ title: 'Первая услуга', text: 'Короткое описание первой услуги.' },
				{ title: 'Вторая услуга', text: 'Описание второй услуги и её цена.' },
				{ title: 'Консультация', text: 'Разговор о вашей задаче.' }
			],
			query: 'услуги',
			otherForm: (w: string) => {
				const map: Record<string, string> = { а: 'у', я: 'ю', ь: 'и', е: 'я', й: 'я', и: 'ей', ы: 'ам', у: 'ы', ю: 'и', о: 'а' };
				const last = w.slice(-1);
				return map[last] ? w.slice(0, -1) + map[last] : w + 'а';
			},
			faq: [
				{ t: 'Как записаться на приём', x: 80, y: 70 },
				{ t: 'Режим работы', x: 135, y: 112 },
				{ t: 'Как добраться', x: 385, y: 68 },
				{ t: 'Адрес и парковка', x: 425, y: 112 },
				{ t: 'Цены и оплата', x: 90, y: 232 },
				{ t: 'Способы оплаты', x: 145, y: 262 },
				{ t: 'Условия возврата', x: 305, y: 232 },
				{ t: 'Как расторгнуть договор', x: 355, y: 264 },
				{ t: 'Политика конфиденциальности', x: 245, y: 160 }
			],
			queries: [
				{ q: 'сколько это стоит', x: 112, y: 238 },
				{ q: 'можно ли вернуть деньги', x: 322, y: 240 },
				{ q: 'где вы находитесь', x: 402, y: 88 },
				{ q: 'хочу прийти завтра', x: 100, y: 92 },
				{ q: 'как вы храните мои данные', x: 252, y: 168 }
			],
			wordsCaption: 'Поиск по словам на ваших услугах',
			meaningCaption: 'Поиск по смыслу: вопросы посетителей на карте',
			kind: 'Вид поиска',
			byWords: 'По словам',
			byMeaning: 'По смыслу',
			model: 'Упрощённая модель: она срезает типичные русские окончания и считает совпадения (заголовок весит вдвое больше текста). Настоящий движок использует полные словари.',
			queryLabel: 'Запрос',
			otherFormBtn: 'Другая форма слова',
			morphLabel: 'Учитывать формы слов',
			stemsPre: 'Из запроса получились основы: ',
			empty: '(пусто)',
			stemsPost: '. Служебные слова (и, в, на…) отброшены.',
			results: 'Результаты по релевантности',
			titleStems: 'основы заголовка: ',
			noMorph: (found: number, n: number) => `<strong>Без форм слов</strong> (как LIKE '%…%') найдено: ${found} из ${n}. Нажмите «Другая форма слова»: запрос перестаёт находить то, что находил.`,
			withMorph: (found: number, n: number) => `<strong>С формами слов</strong> найдено: ${found} из ${n}. Попробуйте «Другая форма слова»: основа та же, результат тот же.`,
			handMade: 'Координаты на карте <strong>нарисованы вручную</strong>: настоящие эмбеддинги состоят из сотен чисел и считаются моделью. Вопросы и ответы придуманы.',
			visitorQ: 'Вопрос посетителя:',
			mapLabel: 'Карта смыслов: близкие по смыслу вопросы рядом',
			nearest: (q: string) => `<strong>Ближайшие по смыслу к «${q}»:</strong>`,
			wordFound: 'Поиск по словам нашёл бы:',
			nothing: 'ничего: у вопроса нет общих основ ни с одним заголовком',
			alt: 'Текстовая альтернатива: поиск по словам сводит слова запроса и текстов к основам, строит указатель и ранжирует по числу совпадений; он находит разные формы слова, но не синонимы. Поиск по смыслу сравнивает числовые «координаты смысла» и находит ближайшие по значению тексты, даже если слова разные, но плохо находит точные коды и номера.'
		},
		en: {
			stop: new Set('a an and the of to in on at for from by with is are was be do does did you your i my me we our it its this that these those or but not as how what when where who which can get'.split(' ')),
			stem: stemEn,
			word: /[a-z0-9]+/g,
			docs: [
				{ title: 'First service', text: 'A short description of the first service.' },
				{ title: 'Second service', text: 'A description of the second service and its price.' },
				{ title: 'Consultation', text: 'A talk about your project.' }
			],
			query: 'services',
			otherForm: (w: string) => (/ies$/.test(w) ? w.slice(0, -3) + 'y' : /[^s]s$/.test(w) ? w.slice(0, -1) : /y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'),
			faq: [
				{ t: 'How to book an appointment', x: 80, y: 70 },
				{ t: 'Opening hours', x: 135, y: 112 },
				{ t: 'How to find us', x: 385, y: 68 },
				{ t: 'Address and parking', x: 425, y: 112 },
				{ t: 'Prices and billing', x: 90, y: 232 },
				{ t: 'Payment methods', x: 145, y: 262 },
				{ t: 'Refund policy', x: 305, y: 232 },
				{ t: 'Ending your contract', x: 355, y: 264 },
				{ t: 'Privacy policy', x: 245, y: 160 }
			],
			queries: [
				{ q: 'how much does it cost', x: 112, y: 238 },
				{ q: 'can I get my money back', x: 322, y: 240 },
				{ q: 'where are you located', x: 402, y: 88 },
				{ q: 'I want to come tomorrow', x: 100, y: 92 },
				{ q: 'how do you store my data', x: 252, y: 168 }
			],
			wordsCaption: 'Word search on your services',
			meaningCaption: 'Search by meaning: visitors’ questions on a map',
			kind: 'Kind of search',
			byWords: 'By words',
			byMeaning: 'By meaning',
			model: 'A simplified model: it cuts common English endings and counts matches (a title counts double). A real engine uses full dictionaries.',
			queryLabel: 'Query',
			otherFormBtn: 'Another form of the word',
			morphLabel: 'Match word forms',
			stemsPre: 'The query became these stems: ',
			empty: '(empty)',
			stemsPost: '. Function words (the, of, and…) were dropped.',
			results: 'Results by relevance',
			titleStems: 'title stems: ',
			noMorph: (found: number, n: number) => `<strong>Without word forms</strong> (like LIKE '%…%') found: ${found} of ${n}. Press “Another form of the word”: the query stops finding what it found.`,
			withMorph: (found: number, n: number) => `<strong>With word forms</strong> found: ${found} of ${n}. Try “Another form of the word”: the stem is the same, so the result is the same.`,
			handMade: 'The coordinates on the map were <strong>placed by hand</strong>: real embeddings are hundreds of numbers worked out by a model. The questions and answers are invented.',
			visitorQ: 'A visitor’s question:',
			mapLabel: 'Meaning map: questions close in meaning sit close together',
			nearest: (q: string) => `<strong>Closest in meaning to “${q}”:</strong>`,
			wordFound: 'A word search would have found:',
			nothing: 'nothing: the question shares no stem with any title',
			alt: 'Text alternative: word search reduces the words of the query and of the texts to stems, builds an index and ranks by the number of matches; it finds different forms of a word but not synonyms. Search by meaning compares numeric “coordinates of meaning” and finds the texts closest in meaning even when the words differ, but it is poor at exact codes and numbers.'
		}
	});

	const STOP = W.stop;
	const stem = W.stem;
	const tokens = (s: string) => (s.toLowerCase().match(W.word) ?? []).filter((t) => !STOP.has(t));

	type Doc = { title: string; text: string };
	let docs = $state<Doc[]>(W.docs);
	let query = $state(W.query);
	onMount(async () => {
		try {
			const it = (await (await import('#lib/learner.ts')).persona()).items?.filter((i) => i.title);
			if (it?.length) {
				docs = it.slice(0, 6).map((i) => ({ title: i.title, text: i.text ?? '' }));
				query = tokens(it[0].title)[0] ?? query;
			}
		} catch {
			/* the example stays */
		}
	});

	let morph = $state(true);
	const qStems = $derived(tokens(query).map(stem));
	const rows = $derived(
		docs
			.map((d, i) => {
				const tt = tokens(d.title).map(stem);
				const tx = tokens(d.text).map(stem);
				let score = 0;
				if (morph) for (const q of qStems) score += 2 * tt.filter((x) => x === q).length + tx.filter((x) => x === q).length;
				else {
					const q = query.trim().toLowerCase();
					if (q) score = (d.title.toLowerCase().includes(q) ? 2 : 0) + (d.text.toLowerCase().includes(q) ? 1 : 0);
				}
				return { d, i, score, tt };
			})
			.sort((a, b) => b.score - a.score || a.i - b.i)
	);
	const found = $derived(rows.filter((r) => r.score > 0).length);

	const otherForm = () => {
		const ws = query.trim().split(/\s+/);
		ws[0] = W.otherForm(ws[0] ?? '');
		query = ws.join(' ');
	};

	/* ---------- meaning ---------- */
	const faq = W.faq;
	const queries = W.queries;
	let qi = $state(0);
	const qq = $derived(queries[qi]);
	const near = $derived(
		faq
			.map((f, i) => ({ ...f, i, d: Math.hypot(f.x - qq.x, f.y - qq.y) }))
			.sort((a, b) => a.d - b.d)
			.slice(0, 3)
	);
	const closeness = (d: number) => Math.max(0, Math.round(100 - d / 3.2));
	const wordHits = $derived.by(() => {
		const q = tokens(qq.q).map(stem);
		return faq.filter((f) => tokens(f.t).map(stem).some((s) => q.includes(s))).map((f) => f.t);
	});
</script>

<figure class="dg">
	<figcaption>{tab === 'words' ? W.wordsCaption : W.meaningCaption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.kind}>
		<button type="button" aria-pressed={tab === 'words'} onclick={() => (tab = 'words')}>{W.byWords}</button>
		<button type="button" aria-pressed={tab === 'meaning'} onclick={() => (tab = 'meaning')}>{W.byMeaning}</button>
	</div>

	{#if tab === 'words'}
		<p class="dg-out">{W.model}</p>
		<div class="dg-ctl">
			<label>{W.queryLabel} <input type="search" bind:value={query} autocomplete="off" /></label>
			<button type="button" onclick={otherForm}>{W.otherFormBtn}</button>
			<label><input type="checkbox" bind:checked={morph} /> {W.morphLabel}</label>
		</div>
		<p class="dg-out">{W.stemsPre}<span class="dg-mono">{qStems.length ? qStems.join(', ') : W.empty}</span>{W.stemsPost}</p>
		<ol class="res" aria-live="polite" aria-label={W.results}>
			{#each rows as r (r.i)}
				<li class:zero={r.score === 0}>
					<span class="sc">{r.score}</span>
					<span><strong>{r.d.title}</strong><br /><span class="dim">{W.titleStems}{r.tt.join(', ') || '—'}</span></span>
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">
			{@html morph ? W.withMorph(found, docs.length) : W.noMorph(found, docs.length)}
		</p>
	{:else}
		<p class="dg-out">{@html W.handMade}</p>
		<label class="qsel">{W.visitorQ}
			<select bind:value={qi}>
				{#each queries as q, i (i)}<option value={i}>{q.q}</option>{/each}
			</select>
		</label>
		<svg viewBox="0 0 480 300" role="img" aria-label={W.mapLabel}>
			{#each near as n (n.i)}
				<line x1={qq.x} y1={qq.y} x2={n.x} y2={n.y} class="ln" />
			{/each}
			<circle cx={qq.x} cy={qq.y} r={Math.max(...near.map((n) => n.d)) + 8} class="halo" />
			{#each faq as f, i (i)}
				<circle cx={f.x} cy={f.y} r="6" class="pt" class:hit={near.some((n) => n.i === i)} />
				<text x={f.x} y={f.y + 20} text-anchor="middle" class="tx">{f.t.length > 18 ? f.t.slice(0, 17) + '…' : f.t}</text>
			{/each}
			<circle cx={qq.x} cy={qq.y} r="7" class="q" />
		</svg>
		<p class="dg-out" aria-live="polite">{@html W.nearest(qq.q)}</p>
		<ol class="res">
			{#each near as n (n.i)}<li><span class="sc">{closeness(n.d)}%</span><span>{n.t}</span></li>{/each}
		</ol>
		<p class="dg-out">
			<strong>{W.wordFound}</strong> {wordHits.length ? wordHits.join(', ') : W.nothing}.
		</p>
	{/if}
	<p class="dg-out alt"><strong>{W.alt.split(':')[0]}:</strong>{W.alt.slice(W.alt.indexOf(':') + 1)}</p>
</figure>

<style>
	.res {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.res li {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr);
		gap: var(--space-2);
		align-items: baseline;
		padding: var(--space-1) var(--space-2);
		border: var(--line) solid var(--border-hairline);
	}
	.res li.zero {
		color: var(--text-secondary);
	}
	.sc {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		text-align: center;
	}
	.dim {
		color: var(--text-secondary);
	}
	input[type='search'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	.qsel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}
	svg {
		display: block;
		width: 100%;
		max-width: 34rem;
		margin: 0 0 var(--space-3);
	}
	.pt {
		fill: var(--border-rule);
	}
	.pt.hit {
		fill: var(--accent-measure);
	}
	.q {
		fill: var(--text-primary);
	}
	.halo {
		fill: none;
		stroke: var(--accent-measure);
		stroke-dasharray: 3 4;
		opacity: 0.6;
	}
	.ln {
		stroke: var(--accent-measure);
		stroke-width: 1.2;
	}
	.tx {
		font-size: 10px;
		fill: var(--text-secondary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
