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

	let { mode = 'values' }: { mode?: 'values' | 'pipeline' } = $props();

	type Snippet = { code: string; result: string; type: string; why: string };
	const snippets: Snippet[] = [
		{ code: "typeof 42", result: "'number'", type: 'string', why: 'typeof называет тип значения. У целых и дробных чисел он один: number.' },
		{ code: "'5' + 3", result: "'53'", type: 'string', why: 'Одна из сторон строка, поэтому плюс склеивает текст, а не складывает числа.' },
		{ code: "'5' - 3", result: '2', type: 'number', why: 'У минуса нет смысла «склеить», и строка превращается в число. Один и тот же символ ведёт себя по-разному.' },
		{ code: "Number('42') + 1", result: '43', type: 'number', why: 'Number превращает строку в число. Значения из полей формы приходят строками, и так их приводят в порядок.' },
		{ code: "0 == ''", result: 'true', type: 'boolean', why: 'Двойное равенство приводит типы и считает ноль и пустую строку равными. Сюрприз, ради которого пишут ===.' },
		{ code: "0 === ''", result: 'false', type: 'boolean', why: 'Тройное равенство сравнивает ещё и тип: число и строка разные вещи.' },
		{ code: 'typeof null', result: "'object'", type: 'string', why: 'Старая ошибка языка 1995 года, которую оставили ради совместимости: null не объект, но typeof говорит так.' },
		{ code: '0.1 + 0.2', result: '0.30000000000000004', type: 'number', why: 'Числа хранятся в двоичном виде, и десятичные дроби неточны. Деньги потому считают целыми числами копеек.' },
		{ code: '[1, 2, 3].length', result: '3', type: 'number', why: 'length это длина массива. Номера элементов идут с нуля: последний имеет номер length - 1.' },
		{ code: 'const price = 100;\nprice = 200;', result: 'TypeError: Assignment to constant variable.', type: 'ошибка', why: 'const нельзя присвоить заново. Если значение должно меняться, объявляйте через let.' },
		{ code: 'const items = [1, 2, 3];\nitems[10].title', result: "TypeError: Cannot read properties of undefined (reading 'title')", type: 'ошибка', why: 'items[10] нет, там undefined, а у undefined не бывает полей. Самая частая ошибка начинающих.' },
		{ code: 'function f() { const secret = 1; }\nf();\nsecret', result: 'ReferenceError: secret is not defined', type: 'ошибка', why: 'Переменная живёт в своей функции. Снаружи такого имени нет.' }
	];
	let pick = $state(0);
	const current = $derived(snippets[pick]);

	// the pipeline works on the person's own list
	type Item = { title: string; price?: string };
	let items = $state<Item[]>([
		{ title: 'Первая услуга', price: '0 000 ₽' },
		{ title: 'Вторая услуга', price: '' },
		{ title: 'Третья услуга', price: '0 000 ₽' }
	]);
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
		<figcaption>Что даст эта строка?</figcaption>
		<div class="dg-ctl" role="group" aria-label="Примеры">
			{#each snippets as s, i (s.code)}
				<button type="button" class="dg-mono" aria-pressed={pick === i} onclick={() => (pick = i)}>{s.code.split('\n')[0]}{s.code.includes('\n') ? ' …' : ''}</button>
			{/each}
		</div>
		<div class="two">
			<section aria-label="Код">
				<h4>Код</h4>
				<pre class="dg-box dg-mono">{current.code}</pre>
			</section>
			<section aria-label="Результат" aria-live="polite">
				<h4>Результат</h4>
				<pre class="dg-box dg-mono res" class:err={current.type === 'ошибка'}>{current.result}</pre>
			</section>
		</div>
		<p class="dg-out"><strong>Тип результата: {current.type}.</strong> {current.why}</p>
		<p class="note">Ответы здесь записаны заранее: страница не запускает введённый текст как код. Попробуйте те же строки в консоли браузера.</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>Соберите конвейер на своём списке</figcaption>
		<div class="dg-ctl" role="group" aria-label="Шаги конвейера">
			<label><input type="checkbox" bind:checked={useFilter} /> filter: только с ценой</label>
			<label><input type="checkbox" bind:checked={useMap} /> map: взять названия</label>
			<label><input type="checkbox" bind:checked={useJoin} disabled={!useMap} /> join: склеить в строку</label>
		</div>
		<div class="two">
			<section aria-label="Код конвейера">
				<h4>Код</h4>
				<pre class="dg-box dg-mono">{code}</pre>
			</section>
			<section aria-label="Результат конвейера" aria-live="polite">
				<h4>Что получилось</h4>
				<pre class="dg-box dg-mono res">{typeof afterJoin === 'string' ? show(afterJoin) : afterJoin.length ? '[\n  ' + afterJoin.map(show).join(',\n  ') + '\n]' : '[]'}</pre>
			</section>
		</div>
		<section aria-label="Исходный список">
			<h4>А исходный список items после этого</h4>
			<pre class="dg-box dg-mono">[{items.length ? '\n  ' + items.map(show).join(',\n  ') + '\n' : ''}]</pre>
		</section>
		<p class="dg-out"><strong>Исходный массив остался как был.</strong> map и filter каждый раз делают новый массив, а старый не трогают. Поэтому их можно соединять в цепочку, не боясь что-нибудь испортить.</p>
	</figure>
{/if}

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		margin: var(--space-3) 0;
	}
	h4 {
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
