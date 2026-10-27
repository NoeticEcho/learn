<!--
	«Лупа для стоп-слов» (part 10, lesson 2). A text is read by six small dictionaries and the words
	that carry no information are marked by kind: an appraisal with no fact behind it, an amplifier,
	officialese, an empty phrase, a cliché, a noun chain. The dictionaries are the textbook's own,
	short on purpose: they find candidates, and only a person can decide whether a flagged word
	stands for a fact. Nothing leaves the page: the text is read here, in the browser.
-->
<script lang="ts">
	import './shared.css';

	type Cat = 'appraisal' | 'amplifier' | 'officialese' | 'empty' | 'cliche' | 'chain';
	const L = '[\\p{L}]*';
	const start = '(?<![\\p{L}])';
	const dict: Record<Cat, { label: string; ask: string; words: string[] }> = {
		appraisal: {
			label: 'Оценка без факта',
			ask: 'Что за этим стоит? Число, срок, документ, пример?',
			words: ['лучш' + L, 'качествен' + L, 'уникальн' + L, 'профессиональн' + L, 'высококвалифицирован' + L, 'надёжн' + L, 'эффективн' + L, 'современн' + L, 'индивидуальн' + L + ' подход' + L, 'оптимальн' + L, 'комфортн' + L]
		},
		amplifier: {
			label: 'Усилитель или вводное слово',
			ask: 'Что изменится, если слово убрать? Обычно ничего.',
			words: ['очень', 'действительно', 'безусловно', 'разумеется', 'конечно', 'несомненно', 'как известно', 'на самом деле', 'максимально', 'абсолютно', 'крайне']
		},
		officialese: {
			label: 'Канцелярит',
			ask: 'Какой глагол спрятан в этом слове? Скажите его.',
			words: ['осуществля' + L, 'является', 'являются', 'в целях', 'в рамках', 'предоставля' + L, 'обеспечива' + L, 'оказыва' + L, 'данн' + L, 'в соответствии с', 'посредством', 'в случае необходимости']
		},
		empty: {
			label: 'Пустой оборот',
			ask: 'Это слово несёт сведения? Если нет, уберите.',
			words: ['на сегодняшний день', 'в настоящее время', 'в наши дни', 'так называемый', 'своего рода', 'в сфере', 'в области', 'на рынке']
		},
		cliche: {
			label: 'Штамп',
			ask: 'Скажите то же простыми словами или назовите факт.',
			words: ['команд' + L + ' профессионалов', 'богат' + L + ' опыт' + L, 'широк' + L + ' спектр' + L, 'полный комплекс', 'динамично развива' + L, 'ваш надёжный партнёр', 'мы рады приветствовать', 'добро пожаловать', 'клиентоориентирован' + L]
		},
		chain: {
			label: 'Цепочка существительных',
			ask: 'Верните глагол: не «осуществление проверки», а «проверяем».',
			words: ['осуществлени' + L + ' \\p{L}+ни' + L, 'проведени' + L + ' \\p{L}+ни' + L, 'производств' + L + ' \\p{L}+ни' + L, 'обеспечени' + L + ' \\p{L}+ни' + L]
		}
	};
	const cats = Object.keys(dict) as Cat[];
	const re = Object.fromEntries(cats.map((c) => [c, new RegExp(start + '(?:' + dict[c].words.join('|') + ')', 'giu')])) as Record<Cat, RegExp>;

	const before =
		'Добро пожаловать в нашу мастерскую! Мы — команда профессионалов с богатым опытом. На сегодняшний день мы осуществляем качественный ремонт велосипедов и предоставляем широкий спектр услуг. Мы гарантируем индивидуальный подход к каждому клиенту и очень высокое качество. Осуществление проведения диагностики является бесплатным.';
	const after =
		'Чиним городские и дорожные велосипеды. Заменим камеру за 20 минут, 400 ₽. Отрегулируем тормоза и скорости за 600 ₽. Полное ТО делаем за день, 2 500 ₽. Диагностика бесплатна: скажем, что сломано и сколько это стоит, прежде чем начать.';

	let text = $state(before);

	type Seg = { text: string; cat?: Cat };
	const segs = $derived.by<Seg[]>(() => {
		const hits: { s: number; e: number; cat: Cat }[] = [];
		for (const c of cats) for (const m of text.matchAll(re[c])) hits.push({ s: m.index, e: m.index + m[0].length, cat: c });
		hits.sort((a, b) => a.s - b.s || b.e - a.e);
		const out: Seg[] = [];
		let at = 0;
		for (const h of hits) {
			if (h.s < at) continue;
			if (h.s > at) out.push({ text: text.slice(at, h.s) });
			out.push({ text: text.slice(h.s, h.e), cat: h.cat });
			at = h.e;
		}
		if (at < text.length) out.push({ text: text.slice(at) });
		return out;
	});
	const words = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
	const total = $derived(words(text));
	const flagged = $derived(segs.filter((s) => s.cat).reduce((n, s) => n + words(s.text), 0));
	const count = (c: Cat) => segs.filter((s) => s.cat === c).length;
	const digits = $derived((text.match(/\d+/g) ?? []).length);
	const share = $derived(total ? Math.round((flagged / total) * 100) : 0);
</script>

<figure class="dg">
	<figcaption>Лупа для стоп-слов</figcaption>
	<div class="dg-ctl">
		<button type="button" onclick={() => (text = before)}>Подставить «было»</button>
		<button type="button" onclick={() => (text = after)}>Подставить «стало»</button>
	</div>
	<label class="area">
		Текст (можно вставить свой; он остаётся в этом браузере)
		<textarea bind:value={text} rows="6"></textarea>
	</label>

	<p class="dg-out" aria-live="polite">
		Слов: <strong>{total}</strong>. Помечено: <strong>{flagged}</strong> ({share}%). Чисел в тексте: <strong>{digits}</strong>.
	</p>
	<div class="marked dg-box" aria-label="Текст с пометками">
		{#each segs as s, i (i)}{#if s.cat}<mark class="m-{s.cat}" title={dict[s.cat].label}>{s.text}</mark>{:else}{s.text}{/if}{/each}
	</div>

	<ul class="legend">
		{#each cats as c (c)}
			<li class:zero={count(c) === 0}>
				<mark class="m-{c}">{dict[c].label}</mark>: {count(c)}. <span class="ask">{dict[c].ask}</span>
			</li>
		{/each}
	</ul>
	<p class="dg-out">Лупа ищет кандидатов по короткому словарю. Решаете вы: «лучший» с ссылкой на премию года уже не оценка, а факт.</p>
</figure>

<style>
	.area {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	textarea {
		width: 100%;
		padding: var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
		resize: vertical;
	}
	.marked {
		white-space: pre-wrap;
		line-height: 1.7;
	}
	mark {
		color: var(--text-primary);
		padding: 0 2px;
		border-bottom: 2px solid currentColor;
	}
	.m-appraisal {
		background: color-mix(in srgb, #d9534f 28%, transparent);
	}
	.m-amplifier {
		background: color-mix(in srgb, #e0a030 30%, transparent);
	}
	.m-officialese {
		background: color-mix(in srgb, #4a8fd9 28%, transparent);
	}
	.m-empty {
		background: color-mix(in srgb, #9b6bd1 26%, transparent);
	}
	.m-cliche {
		background: color-mix(in srgb, #3aa17e 28%, transparent);
	}
	.m-chain {
		background: color-mix(in srgb, #888 32%, transparent);
	}
	.legend {
		list-style: none;
		padding: 0 !important;
		margin: var(--space-4) 0 0;
		display: grid;
		gap: var(--space-2);
	}
	.legend .ask {
		color: var(--text-secondary);
	}
	.zero {
		opacity: 0.55;
	}
</style>
