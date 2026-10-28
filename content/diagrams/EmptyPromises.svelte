<!--
	«Пустые обещания» (part 12, lesson 8). A text box with a sample «О нас», which the reader can
	replace with their own. Stock phrases that fit any competitor's site are marked; sentences with
	no number, date or place are counted. It is a crude detector on purpose: the lesson says it
	finds candidates for the «swap test», not verdicts.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			text: 'Мы команда профессионалов с богатым опытом. Мы предлагаем индивидуальный подход к каждому клиенту и гарантируем качественный результат. С 2012 года мы помогли владельцам 140 участков в Заречье уточнить границы. Мы заботимся о вас.',
			stock: ['команда профессионалов', 'профессионал', 'богатый опыт', 'индивидуальный подход', 'качественн', 'заботимся', 'лучш', 'уникальн', 'широкий спектр', 'клиентоориентирован', 'гарантируем'],
			pre: '',
			tail: '[а-яё]',
			caption: 'Найдите фразы, которые подойдут любому конкуренту',
			label: 'Текст («О нас» или «Обо мне»; свой можно вставить)',
			sentences: 'Предложений: ',
			withFact: ', с числом или датой: ',
			stockCount: '. Стандартных оборотов: ',
			note: 'Отмеченное это кандидаты на «проверку заменой»: можно ли поставить это же предложение на сайт конкурента, и ничего не изменится? Тогда оно пустое. Программа ничего не доказывает: она лишь подсказывает, куда смотреть.'
		},
		en: {
			text: 'We are a team of dedicated professionals with a wealth of experience. We offer a personalized approach to every client and guarantee a high-quality result. Since 2012 we have helped the owners of 140 lots in Riverbend confirm their boundaries. We care about you.',
			stock: ['team of (?:dedicated |passionate |experienced )?professional', 'professional', 'wealth of experience', 'years of experience', '(?:personali[sz]ed|individual|tailored|bespoke) (?:approach|service|solution)', 'high[- ]quality', 'quality', 'we care', 'best', 'unique', 'wide range', 'customer[- ](?:focused|centric)', 'client[- ]focused', 'we guarantee', 'guarantee', 'dedicated', 'passionate', 'cutting[- ]edge', 'world[- ]class', 'innovative', 'state[- ]of[- ]the[- ]art'],
			pre: '\\b',
			tail: '[a-z’]',
			caption: 'Find the phrases that would fit any competitor',
			label: 'Text (an “About us” or “About me”; you can paste your own)',
			sentences: 'Sentences: ',
			withFact: ', with a number or a date: ',
			stockCount: '. Stock phrases: ',
			note: 'What is marked is a candidate for the swap test: could the same sentence go on a competitor’s site with nothing changed? Then it is empty. The program proves nothing: it only suggests where to look.'
		}
	});
	let text = $state(W.text);

	const re = new RegExp(`${W.pre}(${W.stock.join('|')})${W.tail}*`, 'giu');

	const parts = $derived.by(() => {
		const out: { t: string; hit: boolean }[] = [];
		let last = 0;
		for (const m of text.matchAll(re)) {
			const i = m.index ?? 0;
			if (i > last) out.push({ t: text.slice(last, i), hit: false });
			out.push({ t: m[0], hit: true });
			last = i + m[0].length;
		}
		if (last < text.length) out.push({ t: text.slice(last), hit: false });
		return out;
	});
	const sentences = $derived(text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean));
	const withFact = $derived(sentences.filter((s) => /\d/.test(s)).length);
	const hits = $derived(parts.filter((p) => p.hit).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<label class="area">{W.label}
		<textarea rows="5" bind:value={text}></textarea>
	</label>
	<p class="dg-out" aria-live="polite">
		{W.sentences}<strong>{sentences.length}</strong>{W.withFact}<strong>{withFact}</strong>{W.stockCount}<strong>{hits}</strong>.
	</p>
	<p class="marked">
		{#each parts as p, i (i)}{#if p.hit}<mark>{p.t}</mark>{:else}{p.t}{/if}{/each}
	</p>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.area {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	textarea {
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
		font: inherit;
		max-width: var(--measure);
	}
	.marked {
		max-width: var(--measure);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	mark {
		background: none;
		color: var(--text-primary);
		text-decoration: underline wavy;
		text-underline-offset: 3px;
	}
</style>
