<!--
	«Значения и конвейер» (part 5, lesson 1). Two small labs in one component. In `values` mode the
	person picks a line of JavaScript and sees what it gives, its type and why; the answers are
	written down here, because the page never runs a person's text as code. In `pipeline` mode the
	person's own list from the brief goes through filter, map and join, each stage shown, and the
	original list is shown unchanged at the end, which is the point of map and filter.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	let { mode = 'values' }: { mode?: 'values' | 'pipeline' } = $props();

	// The words, one table per edition (docs/content-plan/README.md, «English edition»). The code
	// and its results are JavaScript and stay the same; what `why` says and the labels are the edition's.
	type Snippet = { code: string; result: string; type: string; why: string; err?: true };
	const W = pick({
		ru: {
			snippets: [
				{ code: "typeof 42", result: "'number'", type: 'string', why: 'typeof называет тип значения. У целых и дробных чисел он один: number.' },
				{ code: "'5' + 3", result: "'53'", type: 'string', why: 'Одна из сторон строка, поэтому плюс склеивает текст, а не складывает числа.' },
				{ code: "'5' - 3", result: '2', type: 'number', why: 'У минуса нет смысла «склеить», и строка превращается в число. Один и тот же символ ведёт себя по-разному.' },
				{ code: "Number('42') + 1", result: '43', type: 'number', why: 'Number превращает строку в число. Значения из полей формы приходят строками, и так их приводят в порядок.' },
				{ code: "0 == ''", result: 'true', type: 'boolean', why: 'Двойное равенство приводит типы и считает ноль и пустую строку равными. Сюрприз, ради которого пишут ===.' },
				{ code: "0 === ''", result: 'false', type: 'boolean', why: 'Тройное равенство сравнивает ещё и тип: число и строка разные вещи.' },
				{ code: 'typeof null', result: "'object'", type: 'string', why: 'Старая ошибка языка 1995 года, которую оставили ради совместимости: null не объект, но typeof говорит так.' },
				{ code: '0.1 + 0.2', result: '0.30000000000000004', type: 'number', why: 'Числа хранятся в двоичном виде, и десятичные дроби неточны. Деньги потому считают целыми числами копеек.' },
				{ code: '[1, 2, 3].length', result: '3', type: 'number', why: 'length это длина массива. Номера элементов идут с нуля: последний имеет номер length - 1.' },
				{ code: 'const price = 100;\nprice = 200;', result: 'TypeError: Assignment to constant variable.', type: 'ошибка', err: true, why: 'const нельзя присвоить заново. Если значение должно меняться, объявляйте через let.' },
				{ code: 'const items = [1, 2, 3];\nitems[10].title', result: "TypeError: Cannot read properties of undefined (reading 'title')", type: 'ошибка', err: true, why: 'items[10] нет, там undefined, а у undefined не бывает полей. Самая частая ошибка начинающих.' },
				{ code: 'function f() { const secret = 1; }\nf();\nsecret', result: 'ReferenceError: secret is not defined', type: 'ошибка', err: true, why: 'Переменная живёт в своей функции. Снаружи такого имени нет.' }
			] as Snippet[],
			firstItems: [
				{ title: 'Первая услуга', price: '0 000 ₽' },
				{ title: 'Вторая услуга', price: '' },
				{ title: 'Третья услуга', price: '0 000 ₽' }
			],
			question: 'Что даст эта строка?',
			examples: 'Примеры',
			code: 'Код',
			result: 'Результат',
			typeOf: (t: string) => `Тип результата: ${t}.`,
			note: 'Ответы здесь записаны заранее: страница не запускает введённый текст как код. Попробуйте те же строки в консоли браузера.',
			build: 'Соберите конвейер на своём списке',
			steps: 'Шаги конвейера',
			filter: 'filter: только с ценой',
			map: 'map: взять названия',
			join: 'join: склеить в строку',
			pipeCode: 'Код конвейера',
			pipeResult: 'Результат конвейера',
			got: 'Что получилось',
			original: 'Исходный список',
			originalAfter: 'А исходный список items после этого',
			keptTitle: 'Исходный массив остался как был.',
			kept: ' map и filter каждый раз делают новый массив, а старый не трогают. Поэтому их можно соединять в цепочку, не боясь что-нибудь испортить.'
		},
		en: {
			snippets: [
				{ code: "typeof 42", result: "'number'", type: 'string', why: 'typeof names the type of a value. Whole numbers and fractions share one type: number.' },
				{ code: "'5' + 3", result: "'53'", type: 'string', why: 'One side is a string, so plus glues text together instead of adding numbers.' },
				{ code: "'5' - 3", result: '2', type: 'number', why: 'Minus has no meaning for “glue”, so the string is turned into a number. The same symbol behaves differently.' },
				{ code: "Number('42') + 1", result: '43', type: 'number', why: 'Number turns a string into a number. Values from form fields arrive as strings, and this is how you tidy them.' },
				{ code: "0 == ''", result: 'true', type: 'boolean', why: 'Double equals converts types and treats zero and an empty string as equal. A surprise, and the reason people write ===.' },
				{ code: "0 === ''", result: 'false', type: 'boolean', why: 'Triple equals compares the type too: a number and a string are different things.' },
				{ code: 'typeof null', result: "'object'", type: 'string', why: 'An old mistake from the language’s first days in 1995, kept for compatibility: null is not an object, but typeof says so.' },
				{ code: '0.1 + 0.2', result: '0.30000000000000004', type: 'number', why: 'Numbers are stored in binary, and decimal fractions are inexact. That is why money is counted in whole pence or cents.' },
				{ code: '[1, 2, 3].length', result: '3', type: 'number', why: 'length is the length of the array. Element numbers start at zero: the last one is length - 1.' },
				{ code: 'const price = 100;\nprice = 200;', result: 'TypeError: Assignment to constant variable.', type: 'error', err: true, why: 'A const cannot be assigned again. If the value has to change, declare it with let.' },
				{ code: 'const items = [1, 2, 3];\nitems[10].title', result: "TypeError: Cannot read properties of undefined (reading 'title')", type: 'error', err: true, why: 'There is no items[10], so it is undefined, and undefined has no fields. The most common beginner error.' },
				{ code: 'function f() { const secret = 1; }\nf();\nsecret', result: 'ReferenceError: secret is not defined', type: 'error', err: true, why: 'The variable lives inside its function. Outside, there is no such name.' }
			] as Snippet[],
			firstItems: [
				{ title: 'First service', price: '£000' },
				{ title: 'Second service', price: '' },
				{ title: 'Third service', price: '£000' }
			],
			question: 'What does this line give?',
			examples: 'Examples',
			code: 'Code',
			result: 'Result',
			typeOf: (t: string) => `Type of the result: ${t}.`,
			note: 'The answers are written in advance: the page never runs typed text as code. Try the same lines in the browser’s console.',
			build: 'Build a pipeline on your own list',
			steps: 'Pipeline steps',
			filter: 'filter: only those with a price',
			map: 'map: take the titles',
			join: 'join: glue into a string',
			pipeCode: 'Pipeline code',
			pipeResult: 'Pipeline result',
			got: 'What came out',
			original: 'The original list',
			originalAfter: 'And the original items list afterwards',
			keptTitle: 'The original array is unchanged.',
			kept: ' map and filter make a new array every time and leave the old one alone. That is why you can chain them without fear of breaking anything.'
		}
	});
	const snippets = W.snippets;
	let sel = $state(0);
	const current = $derived(snippets[sel]);

	// the pipeline works on the person's own list
	type Item = { title: string; price?: string };
	let items = $state<Item[]>(W.firstItems);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.length) items = p.items.map((i) => ({ title: i.title, price: i.price ?? '' }));
		} catch {
			/* the example stays */
		}
	});

	let useFilter = $state(true);
	let useMap = $state(true);
	let useJoin = $state(false);
	const afterFilter = $derived(useFilter ? items.filter((i) => (i.price ?? '') !== '') : items);
	const afterMap = $derived(useMap ? afterFilter.map((i) => i.title) : afterFilter);
	const afterJoin = $derived(useJoin && useMap ? afterMap.join(', ') : afterMap);
	const show = (v: unknown): string => (typeof v === 'string' ? `'${v}'` : Array.isArray(v) ? '[' + v.map(show).join(', ') + ']' : `{ title: '${(v as Item).title}', price: '${(v as Item).price ?? ''}' }`);
	const code = $derived(
		['items', useFilter ? "  .filter((item) => item.price !== '')" : '', useMap ? '  .map((item) => item.title)' : '', useJoin && useMap ? "  .join(', ')" : '']
			.filter(Boolean)
			.join('\n') + ';'
	);
</script>

{#if mode === 'values'}
	<figure class="dg">
		<figcaption>{W.question}</figcaption>
		<div class="dg-ctl" role="group" aria-label={W.examples}>
			{#each snippets as s, i (s.code)}
				<button type="button" class="dg-mono" aria-pressed={sel === i} onclick={() => (sel = i)}>{s.code.split('\n')[0]}{s.code.includes('\n') ? ' …' : ''}</button>
			{/each}
		</div>
		<div class="two">
			<section aria-label={W.code}>
				<div class="dh">{W.code}</div>
				<pre class="dg-box dg-mono">{current.code}</pre>
			</section>
			<section aria-label={W.result} aria-live="polite">
				<div class="dh">{W.result}</div>
				<pre class="dg-box dg-mono res" class:err={current.err}>{current.result}</pre>
			</section>
		</div>
		<p class="dg-out"><strong>{W.typeOf(current.type)}</strong> {current.why}</p>
		<p class="note">{W.note}</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>{W.build}</figcaption>
		<div class="dg-ctl" role="group" aria-label={W.steps}>
			<label><input type="checkbox" bind:checked={useFilter} /> {W.filter}</label>
			<label><input type="checkbox" bind:checked={useMap} /> {W.map}</label>
			<label><input type="checkbox" bind:checked={useJoin} disabled={!useMap} /> {W.join}</label>
		</div>
		<div class="two">
			<section aria-label={W.pipeCode}>
				<div class="dh">{W.code}</div>
				<pre class="dg-box dg-mono">{code}</pre>
			</section>
			<section aria-label={W.pipeResult} aria-live="polite">
				<div class="dh">{W.got}</div>
				<pre class="dg-box dg-mono res">{typeof afterJoin === 'string' ? show(afterJoin) : afterJoin.length ? '[\n  ' + afterJoin.map(show).join(',\n  ') + '\n]' : '[]'}</pre>
			</section>
		</div>
		<section aria-label={W.original}>
			<div class="dh">{W.originalAfter}</div>
			<pre class="dg-box dg-mono">[{items.length ? '\n  ' + items.map(show).join(',\n  ') + '\n' : ''}]</pre>
		</section>
		<p class="dg-out"><strong>{W.keptTitle}</strong>{W.kept}</p>
	</figure>
{/if}

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		margin: var(--space-3) 0;
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		min-height: 3.5rem;
		font-size: 0.85rem;
	}
	.res.err {
		color: var(--brass-300);
	}
	.note {
		margin: var(--space-3) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
</style>
