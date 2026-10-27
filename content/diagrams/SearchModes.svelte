<!--
	«Поиск по словам и по смыслу» (part 7, lesson 6). Words: the person's own services searched with
	a teaching stemmer (it cuts common Russian endings; real search engines use fuller dictionaries),
	showing the tokens, stems and a ranking, and what LIKE would do without morphology. Meaning:
	nine invented questions of visitors on a 2D map whose coordinates were placed by hand, because
	real embeddings have hundreds of dimensions and come from a model; the nearest three to a chosen
	query are lit, beside what a word search would have found.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let tab = $state<'words' | 'meaning'>('words');

	/* ---------- words ---------- */
	const STOP = new Set('и в во на с со по к о об от до за из для не что как а но или же ли бы это при у то'.split(' '));
	const ENDINGS = 'ыми ими ого его ому ему ией иям иях ами ями ов ев ей ий ый ой ом ем ам ям ах ях ия ие ые ых их ая яя ое ее ую юю ью ию а я о е у ю ы и ь й'.split(' ').sort((a, b) => b.length - a.length);
	function stem(w: string): string {
		for (const e of ENDINGS) if (w.length - e.length >= 3 && w.endsWith(e)) return w.slice(0, -e.length);
		return w;
	}
	const tokens = (s: string) => (s.toLowerCase().match(/[а-яёa-z0-9]+/g) ?? []).filter((t) => !STOP.has(t));

	type Doc = { title: string; text: string };
	let docs = $state<Doc[]>([
		{ title: 'Первая услуга', text: 'Короткое описание первой услуги.' },
		{ title: 'Вторая услуга', text: 'Описание второй услуги и её цена.' },
		{ title: 'Консультация', text: 'Разговор о вашей задаче.' }
	]);
	let query = $state('услуги');
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
		const w = ws[0] ?? '';
		const last = w.slice(-1);
		const map: Record<string, string> = { а: 'у', я: 'ю', ь: 'и', е: 'я', й: 'я', и: 'ей', ы: 'ам', у: 'ы', ю: 'и', о: 'а' };
		ws[0] = map[last] ? w.slice(0, -1) + map[last] : w + 'а';
		query = ws.join(' ');
	};

	/* ---------- meaning ---------- */
	const faq = [
		{ t: 'Как записаться на приём', x: 80, y: 70 },
		{ t: 'Режим работы', x: 135, y: 112 },
		{ t: 'Как добраться', x: 385, y: 68 },
		{ t: 'Адрес и парковка', x: 425, y: 112 },
		{ t: 'Цены и оплата', x: 90, y: 232 },
		{ t: 'Способы оплаты', x: 145, y: 262 },
		{ t: 'Условия возврата', x: 305, y: 232 },
		{ t: 'Как расторгнуть договор', x: 355, y: 264 },
		{ t: 'Политика конфиденциальности', x: 245, y: 160 }
	];
	const queries = [
		{ q: 'сколько это стоит', x: 112, y: 238 },
		{ q: 'можно ли вернуть деньги', x: 322, y: 240 },
		{ q: 'где вы находитесь', x: 402, y: 88 },
		{ q: 'хочу прийти завтра', x: 100, y: 92 },
		{ q: 'как вы храните мои данные', x: 252, y: 168 }
	];
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
	<figcaption>{tab === 'words' ? 'Поиск по словам на ваших услугах' : 'Поиск по смыслу: вопросы посетителей на карте'}</figcaption>
	<div class="dg-ctl" role="group" aria-label="Вид поиска">
		<button type="button" aria-pressed={tab === 'words'} onclick={() => (tab = 'words')}>По словам</button>
		<button type="button" aria-pressed={tab === 'meaning'} onclick={() => (tab = 'meaning')}>По смыслу</button>
	</div>

	{#if tab === 'words'}
		<p class="dg-out">Упрощённая модель: она срезает типичные русские окончания и считает совпадения (заголовок весит вдвое больше текста). Настоящий движок использует полные словари.</p>
		<div class="dg-ctl">
			<label>Запрос <input type="search" bind:value={query} autocomplete="off" /></label>
			<button type="button" onclick={otherForm}>Другая форма слова</button>
			<label><input type="checkbox" bind:checked={morph} /> Учитывать формы слов</label>
		</div>
		<p class="dg-out">Из запроса получились основы: <span class="dg-mono">{qStems.length ? qStems.join(', ') : '(пусто)'}</span>. Служебные слова (и, в, на…) отброшены.</p>
		<ol class="res" aria-live="polite" aria-label="Результаты по релевантности">
			{#each rows as r (r.i)}
				<li class:zero={r.score === 0}>
					<span class="sc">{r.score}</span>
					<span><strong>{r.d.title}</strong><br /><span class="dim">основы заголовка: {r.tt.join(', ') || '—'}</span></span>
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">
			{#if !morph}<strong>Без форм слов</strong> (как LIKE '%…%') найдено: {found} из {docs.length}. Нажмите «Другая форма слова»: запрос перестаёт находить то, что находил.{:else}<strong>С формами слов</strong> найдено: {found} из {docs.length}. Попробуйте «Другая форма слова»: основа та же, результат тот же.{/if}
		</p>
	{:else}
		<p class="dg-out">Координаты на карте <strong>нарисованы вручную</strong>: настоящие эмбеддинги состоят из сотен чисел и считаются моделью. Вопросы и ответы придуманы.</p>
		<label class="qsel">Вопрос посетителя:
			<select bind:value={qi}>
				{#each queries as q, i (i)}<option value={i}>{q.q}</option>{/each}
			</select>
		</label>
		<svg viewBox="0 0 480 300" role="img" aria-label="Карта смыслов: близкие по смыслу вопросы рядом">
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
		<p class="dg-out" aria-live="polite"><strong>Ближайшие по смыслу к «{qq.q}»:</strong></p>
		<ol class="res">
			{#each near as n (n.i)}<li><span class="sc">{closeness(n.d)}%</span><span>{n.t}</span></li>{/each}
		</ol>
		<p class="dg-out">
			<strong>Поиск по словам нашёл бы:</strong> {wordHits.length ? wordHits.join(', ') : 'ничего: у вопроса нет общих основ ни с одним заголовком'}.
		</p>
	{/if}
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> поиск по словам сводит слова запроса и текстов к основам, строит указатель и ранжирует по числу совпадений; он находит разные формы слова, но не синонимы. Поиск по смыслу сравнивает числовые «координаты смысла» и находит ближайшие по значению тексты, даже если слова разные, но плохо находит точные коды и номера.</p>
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
