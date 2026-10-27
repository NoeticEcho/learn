<!--
	«Мини-конструктор» (part 16, lesson 5). A pipeline of four stages, brief to structure to copy to
	code, with a check between the stages. NO MODEL RUNS HERE: each stage is a written rule that
	assembles its output from the person's own brief, so that the page works offline and costs
	nothing, and the page says so. What it shows is real: what goes into a stage, what comes out and
	in what format, and how a gate (a few lines of ordinary code, not another model) refuses an
	output that breaks the contract. Each stage can be told to «make a model mistake» (an extra
	section, an invented number, an external script and an image without alt) to watch its gate
	catch it. The gate on stage 4 parses the HTML in the browser, so it runs only after a click.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Brief = { name: string; who: string; forWhom: string; action: string; kind: string; sections: string[]; items: { title: string; text: string }[]; proofs: string[]; phone: string; email: string };
	let b = $state<Brief>({ name: 'Проект', who: 'Что делает проект', forWhom: 'Для кого', action: 'Оставить заявку', kind: 'form', sections: ['О проекте', 'Услуги', 'Контакты'], items: [{ title: 'Услуга', text: 'Что это.' }], proofs: [], phone: '', email: '' });
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			b = {
				name: p.name || b.name,
				who: p.who || b.who,
				forWhom: p.forWhom || b.forWhom,
				action: p.mainAction?.label || b.action,
				kind: p.mainAction?.kind || b.kind,
				sections: p.sections?.length ? p.sections : b.sections,
				items: (p.items ?? []).map((i) => ({ title: i.title, text: i.text })),
				proofs: (p.proofs ?? []).map((i) => i.title),
				phone: p.phone || '',
				email: p.email || ''
			};
		} catch {
			/* the example stays */
		}
	});

	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	// ---- what leaves the machine at stage 1
	let sendContacts = $state(false);
	const stage1 = $derived(
		JSON.stringify(
			{ who: b.who, forWhom: b.forWhom, mainAction: b.action, sections: b.sections, items: b.items.map((i) => i.title), proofs: b.proofs, ...(sendContacts ? { phone: b.phone, email: b.email } : {}) },
			null,
			1
		)
	);
	const gate1 = $derived.by(() => {
		const leaks = [b.phone, b.email].filter((x) => x && stage1.includes(x));
		return leaks.length ? { ok: false, why: 'В запрос попали телефон или почта. Для сайта они не нужны модели: их вписывают в готовую страницу.' } : { ok: true, why: 'В запросе только то, что станет публичным: личных контактов нет.' };
	});

	// ---- stage 2: structure (JSON)
	let err2 = $state(false);
	const stage2 = $derived.by(() => {
		let titles = [...b.sections];
		if (err2) titles = [...titles.slice(0, -1), 'Блог', 'Отзывы клиентов'];
		return JSON.stringify({ sections: titles.map((t) => ({ title: t })), cta: b.action }, null, 1);
	});
	const gate2 = $derived.by(() => {
		try {
			const s = JSON.parse(stage2) as { sections: { title: string }[]; cta: string };
			const got = s.sections.map((x) => x.title);
			const extra = got.filter((t) => !b.sections.includes(t));
			const missing = b.sections.filter((t) => !got.includes(t));
			if (extra.length || missing.length) return { ok: false, why: `Структура не совпала с брифом. Лишние разделы: ${extra.join(', ') || 'нет'}. Пропущены: ${missing.join(', ') || 'нет'}.` };
			if (s.cta !== b.action) return { ok: false, why: 'Подпись главной кнопки не совпала с брифом.' };
			return { ok: true, why: 'JSON разобран, разделы и подпись кнопки точно совпадают с брифом.' };
		} catch {
			return { ok: false, why: 'Ответ не разобрался как JSON.' };
		}
	});

	// ---- stage 3: copy, per section
	let err3 = $state(false);
	const stage3 = $derived.by(() => {
		const out: { title: string; text: string }[] = b.sections.map((t, i) => {
			if (i === 0) return { title: t, text: `${b.who}. Для кого: ${b.forWhom}.` };
			if (i === 1 && b.items.length) return { title: t, text: b.items.map((x) => `${x.title}: ${x.text}`).join(' ') };
			return { title: t, text: b.proofs.length && i === 2 ? `Подтверждения: ${b.proofs.join('; ')}.` : `Чтобы «${b.action}», воспользуйтесь формой ниже.` };
		});
		if (err3) out[0].text += ' Более 15 лет опыта и 1200 довольных клиентов, индивидуальный подход к каждому.';
		return out;
	});
	const brief3 = $derived(JSON.stringify(b));
	const gate3 = $derived.by(() => {
		const problems: string[] = [];
		for (const s of stage3) {
			for (const n of s.text.match(/\d[\d\s,.]*\d|\d/g) ?? []) if (!brief3.includes(n.trim())) problems.push(`число «${n.trim()}» нет в брифе`);
			for (const w of ['индивидуальный подход', 'инновацион', 'надёжный партнёр']) if (s.text.toLowerCase().includes(w)) problems.push(`пустая формула «${w}»`);
		}
		return problems.length ? { ok: false, why: `Проверка фактов: ${problems.join('; ')}.` } : { ok: true, why: 'Каждое число есть в брифе, пустых формул нет.' };
	});

	// ---- stage 4: code
	let err4 = $state(false);
	const stage4 = $derived.by(() => {
		const data = ['form', 'book', 'signup', 'buy'].includes(b.kind);
		const secs = stage3.map((s) => `    <section>\n      <h2>${esc(s.title)}</h2>\n      <p>${esc(s.text)}</p>\n    </section>`).join('\n');
		const form = data
			? `\n    <form action="https://example.ru/leads" method="post">\n      <p><label for="n">Имя</label> <input id="n" name="name" required></p>\n      <p><label for="p">Телефон</label> <input id="p" name="phone" type="tel" required></p>\n      <p><label><input type="checkbox" required> Согласен на обработку данных, <a href="/politika/">политика</a></label></p>\n      <button>${esc(b.action)}</button>\n    </form>`
			: '';
		const bad = err4 ? `\n    <img src="http://images.example-stock.com/team.jpg">\n    <div onclick="go()">Get Started</div>\n    <script src="https://cdn.example-cdn.com/lib.js"><\/script>` : '';
		return `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>${esc(b.name)}</title></head>\n<body>\n  <header><h1>${esc(b.name)}</h1></header>\n  <main>\n${secs}${form}${bad}\n  </main>\n</body>\n</html>`;
	});
	let gate4 = $state<{ ok: boolean; why: string } | null>(null);
	function check4() {
		const d = new DOMParser().parseFromString(stage4, 'text/html');
		const q = (s: string) => d.querySelectorAll(s).length;
		const p: string[] = [];
		if (!d.documentElement.getAttribute('lang')) p.push('нет lang');
		if (q('h1') !== 1) p.push(`h1: ${q('h1')} вместо одного`);
		if (q('img:not([alt])')) p.push('картинка без alt');
		if (q('div[onclick]')) p.push('кнопка из div');
		if (q('script[src]')) p.push('внешний скрипт');
		let un = 0;
		d.querySelectorAll('input:not([type=hidden])').forEach((i) => {
			const id = i.getAttribute('id');
			if (!i.closest('label') && !(id && d.querySelector(`label[for="${id}"]`))) un++;
		});
		if (un) p.push(`полей без подписи: ${un}`);
		gate4 = p.length ? { ok: false, why: `Проверка кода: ${p.join('; ')}.` } : { ok: true, why: 'Один h1, есть lang, у полей подписи, нет внешних скриптов и картинок без alt.' };
	}
	$effect(() => {
		stage4;
		gate4 = null;
	});

	const tokens = (s: string) => Math.round(s.length / 2.5);
</script>

<figure class="dg">
	<figcaption>Конвейер «бриф, структура, тексты, код» с проверками</figcaption>
	<p class="dg-out"><strong>Модель здесь не запускается.</strong> Каждый этап собирает выход по написанному правилу из вашего брифа: так страница работает без сети и бесплатно. Настоящее здесь устройство конвейера: что входит в этап, что выходит и в каком формате, и как проверка (обычный код, а не ещё одна модель) отказывает, когда выход нарушил договор.</p>

	<section class="st">
		<h4>1. Бриф: что уходит модели</h4>
		<label class="dg-ctl"><input type="checkbox" bind:checked={sendContacts} /> Отправить телефон и почту (не нужно)</label>
		<pre class="dg-box dg-mono">{stage1}</pre>
		<p class="gate" class:ok={gate1.ok} aria-live="polite"><strong>{gate1.ok ? 'Проверка пройдена.' : 'Проверка не пройдена.'}</strong> {gate1.why} Примерно {tokens(stage1)} токенов на входе.</p>
	</section>

	<section class="st">
		<h4>2. Структура (JSON)</h4>
		<label class="dg-ctl"><input type="checkbox" bind:checked={err2} /> Ошибка модели: добавила лишние разделы</label>
		<pre class="dg-box dg-mono">{stage2}</pre>
		<p class="gate" class:ok={gate2.ok} aria-live="polite"><strong>{gate2.ok ? 'Проверка пройдена.' : 'Проверка не пройдена.'}</strong> {gate2.why}</p>
	</section>

	<section class="st">
		<h4>3. Тексты по разделам</h4>
		<label class="dg-ctl"><input type="checkbox" bind:checked={err3} /> Ошибка модели: выдумала цифры и формулы</label>
		<ul class="copy">{#each stage3 as s, i (i)}<li><strong>{s.title}.</strong> {s.text}</li>{/each}</ul>
		<p class="gate" class:ok={gate3.ok} aria-live="polite"><strong>{gate3.ok ? 'Проверка пройдена.' : 'Проверка не пройдена.'}</strong> {gate3.why}</p>
	</section>

	<section class="st">
		<h4>4. Код</h4>
		<label class="dg-ctl"><input type="checkbox" bind:checked={err4} /> Ошибка модели: чужой скрипт, картинка без alt, «кнопка» из div</label>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
		<pre class="dg-box dg-mono code" tabindex="0" aria-label="Код страницы">{stage4}</pre>
		<div class="dg-ctl"><button type="button" onclick={check4}>Проверить код</button></div>
		{#if gate4}<p class="gate" class:ok={gate4.ok} aria-live="polite"><strong>{gate4.ok ? 'Проверка пройдена.' : 'Проверка не пройдена.'}</strong> {gate4.why}</p>{/if}
	</section>
	<p class="dg-out">В настоящем запуске между этапами идёт сетевой вызов: стоимость, время и случайные сбои. В учебном режиме их нет, но форма та же.</p>
</figure>

<style>
	.st {
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-body);
		color: var(--text-primary);
	}
	pre {
		margin: 0 0 var(--space-2);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.code {
		max-height: 16rem;
		overflow: auto;
		font-size: 0.8em;
	}
	.copy {
		margin: 0 0 var(--space-2);
	}
	.gate {
		margin: 0;
		padding-left: var(--space-3);
		border-left: 4px solid var(--text-primary);
	}
	.gate.ok {
		border-left-color: var(--accent-measure);
	}
</style>
