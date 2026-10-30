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
	import { pick } from '#lib/i18n/index.ts';

	type Brief = { name: string; who: string; forWhom: string; action: string; kind: string; sections: string[]; items: { title: string; text: string }[]; proofs: string[]; phone: string; email: string };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// NO MODEL RUNS HERE in either edition: each stage is a written rule.
	const W = pick({
		ru: {
			fallback: { name: 'Проект', who: 'Что делает проект', forWhom: 'Для кого', action: 'Оставить заявку', kind: 'form', sections: ['О проекте', 'Услуги', 'Контакты'], items: [{ title: 'Услуга', text: 'Что это.' }], proofs: [], phone: '', email: '' } as Brief,
			charsPerToken: 2.5,
			leak: 'В запрос попали телефон или почта. Для сайта они не нужны модели: их вписывают в готовую страницу.',
			noLeak: 'В запросе только то, что станет публичным: личных контактов нет.',
			extraSections: ['Блог', 'Отзывы клиентов'],
			mismatch: (extra: string, missing: string) => `Структура не совпала с брифом. Лишние разделы: ${extra}. Пропущены: ${missing}.`,
			none: 'нет',
			ctaMismatch: 'Подпись главной кнопки не совпала с брифом.',
			structureOk: 'JSON разобран, разделы и подпись кнопки точно совпадают с брифом.',
			notJson: 'Ответ не разобрался как JSON.',
			intro: (who: string, forWhom: string) => `${who}. Для кого: ${forWhom}.`,
			proofsText: (x: string) => `Подтверждения: ${x}.`,
			ctaText: (a: string) => `Чтобы «${a}», воспользуйтесь формой ниже.`,
			invented: ' Более 15 лет опыта и 1200 довольных клиентов, индивидуальный подход к каждому.',
			badNumber: (n: string) => `число «${n}» нет в брифе`,
			phrases: ['индивидуальный подход', 'инновацион', 'надёжный партнёр'],
			badPhrase: (w: string) => `пустая формула «${w}»`,
			factsFail: (x: string) => `Проверка фактов: ${x}.`,
			factsOk: 'Каждое число есть в брифе, пустых формул нет.',
			html: { lang: 'ru', name: 'Имя', phone: 'Телефон', consent: 'Согласен на обработку данных,', policy: 'политика', url: 'https://example.ru/leads', policyUrl: '/politika/' },
			noLang: 'нет lang',
			h1: (n: number) => `h1: ${n} вместо одного`,
			noAlt: 'картинка без alt',
			divBtn: 'кнопка из div',
			extScript: 'внешний скрипт',
			noLabels: (n: number) => `полей без подписи: ${n}`,
			codeFail: (x: string) => `Проверка кода: ${x}.`,
			codeOk: 'Один h1, есть lang, у полей подписи, нет внешних скриптов и картинок без alt.',
			caption: 'Конвейер «бриф, структура, тексты, код» с проверками',
			noModel: 'Модель здесь не запускается.',
			noModelText: 'Каждый этап собирает выход по написанному правилу из вашего брифа: так страница работает без сети и бесплатно. Настоящее здесь устройство конвейера: что входит в этап, что выходит и в каком формате, и как проверка (обычный код, а не ещё одна модель) отказывает, когда выход нарушил договор.',
			s1: '1. Бриф: что уходит модели',
			sendContacts: 'Отправить телефон и почту (не нужно)',
			passed: 'Проверка пройдена.',
			failed: 'Проверка не пройдена.',
			tokensIn: (n: number) => `Примерно ${n} токенов на входе.`,
			s2: '2. Структура (JSON)',
			err2: 'Ошибка модели: добавила лишние разделы',
			s3: '3. Тексты по разделам',
			err3: 'Ошибка модели: выдумала цифры и формулы',
			s4: '4. Код',
			err4: 'Ошибка модели: чужой скрипт, картинка без alt, «кнопка» из div',
			codeLabel: 'Код страницы',
			checkBtn: 'Проверить код',
			real: 'В настоящем запуске между этапами идёт сетевой вызов: стоимость, время и случайные сбои. В учебном режиме их нет, но форма та же.'
		},
		en: {
			fallback: { name: 'Project', who: 'What the project does', forWhom: 'For whom', action: 'Get in touch', kind: 'form', sections: ['About', 'Services', 'Contact'], items: [{ title: 'Service', text: 'What it is.' }], proofs: [], phone: '', email: '' } as Brief,
			charsPerToken: 4,
			leak: 'A phone number or an email got into the prompt. The model doesn’t need them for a site: they are written into the finished page.',
			noLeak: 'The prompt holds only what will become public: no personal contacts.',
			extraSections: ['Blog', 'Customer reviews'],
			mismatch: (extra: string, missing: string) => `The structure doesn’t match the brief. Extra sections: ${extra}. Missing: ${missing}.`,
			none: 'none',
			ctaMismatch: 'The label of the main button doesn’t match the brief.',
			structureOk: 'The JSON parsed, and the sections and the button’s label match the brief exactly.',
			notJson: 'The answer didn’t parse as JSON.',
			intro: (who: string, forWhom: string) => `${who}. For whom: ${forWhom}.`,
			proofsText: (x: string) => `Proof: ${x}.`,
			ctaText: (a: string) => `To “${a}”, use the form below.`,
			invented: ' More than 15 years of experience and 1,200 satisfied clients, a personal approach to every one.',
			badNumber: (n: string) => `the number “${n}” isn’t in the brief`,
			phrases: ['personal approach', 'innovative', 'reliable partner'],
			badPhrase: (w: string) => `an empty formula “${w}”`,
			factsFail: (x: string) => `Fact check: ${x}.`,
			factsOk: 'Every number is in the brief, and there are no empty formulas.',
			html: { lang: 'en', name: 'Name', phone: 'Phone', consent: 'I agree to the processing of my data,', policy: 'privacy notice', url: 'https://example.com/leads', policyUrl: '/privacy/' },
			noLang: 'no lang',
			h1: (n: number) => `h1: ${n} instead of one`,
			noAlt: 'an image without alt',
			divBtn: 'a button made of a div',
			extScript: 'an outside script',
			noLabels: (n: number) => `fields without a label: ${n}`,
			codeFail: (x: string) => `Code check: ${x}.`,
			codeOk: 'One h1, a lang, labels on the fields, no outside scripts and no images without alt.',
			caption: 'The pipeline “brief, structure, copy, code” with checks',
			noModel: 'No model runs here.',
			noModelText: 'Each stage assembles its output by a written rule from your brief, so the page works offline and costs nothing. What is real here is the pipeline’s design: what goes into a stage, what comes out and in what format, and how a check (ordinary code, not another model) refuses when an output has broken the contract.',
			s1: '1. The brief: what goes to the model',
			sendContacts: 'Send the phone number and email (not needed)',
			passed: 'The check passed.',
			failed: 'The check failed.',
			tokensIn: (n: number) => `About ${n} tokens go in.`,
			s2: '2. The structure (JSON)',
			err2: 'A model mistake: it added extra sections',
			s3: '3. The copy, section by section',
			err3: 'A model mistake: it invented numbers and formulas',
			s4: '4. The code',
			err4: 'A model mistake: an outside script, an image without alt, a div “button”',
			codeLabel: 'The page’s code',
			checkBtn: 'Check the code',
			real: 'In a real run there is a network call between the stages: cost, time and random failures. The teaching mode has none of those, but the shape is the same.'
		}
	});

	let b = $state<Brief>(W.fallback);
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
		return leaks.length ? { ok: false, why: W.leak } : { ok: true, why: W.noLeak };
	});

	// ---- stage 2: structure (JSON)
	let err2 = $state(false);
	const stage2 = $derived.by(() => {
		let titles = [...b.sections];
		if (err2) titles = [...titles.slice(0, -1), ...W.extraSections];
		return JSON.stringify({ sections: titles.map((t) => ({ title: t })), cta: b.action }, null, 1);
	});
	const gate2 = $derived.by(() => {
		try {
			const s = JSON.parse(stage2) as { sections: { title: string }[]; cta: string };
			const got = s.sections.map((x) => x.title);
			const extra = got.filter((t) => !b.sections.includes(t));
			const missing = b.sections.filter((t) => !got.includes(t));
			if (extra.length || missing.length) return { ok: false, why: W.mismatch(extra.join(', ') || W.none, missing.join(', ') || W.none) };
			if (s.cta !== b.action) return { ok: false, why: W.ctaMismatch };
			return { ok: true, why: W.structureOk };
		} catch {
			return { ok: false, why: W.notJson };
		}
	});

	// ---- stage 3: copy, per section
	let err3 = $state(false);
	const stage3 = $derived.by(() => {
		const out: { title: string; text: string }[] = b.sections.map((t, i) => {
			if (i === 0) return { title: t, text: W.intro(b.who, b.forWhom) };
			if (i === 1 && b.items.length) return { title: t, text: b.items.map((x) => `${x.title}: ${x.text}`).join(' ') };
			return { title: t, text: b.proofs.length && i === 2 ? W.proofsText(b.proofs.join('; ')) : W.ctaText(b.action) };
		});
		if (err3) out[0].text += W.invented;
		return out;
	});
	const brief3 = $derived(JSON.stringify(b));
	const gate3 = $derived.by(() => {
		const problems: string[] = [];
		for (const s of stage3) {
			for (const n of s.text.match(/\d[\d\s,.]*\d|\d/g) ?? []) if (!brief3.includes(n.trim())) problems.push(W.badNumber(n.trim()));
			for (const w of W.phrases) if (s.text.toLowerCase().includes(w)) problems.push(W.badPhrase(w));
		}
		return problems.length ? { ok: false, why: W.factsFail(problems.join('; ')) } : { ok: true, why: W.factsOk };
	});

	// ---- stage 4: code
	let err4 = $state(false);
	const stage4 = $derived.by(() => {
		const H = W.html;
		const data = ['form', 'book', 'signup', 'buy'].includes(b.kind);
		const secs = stage3.map((s) => `    <section>\n      <h2>${esc(s.title)}</h2>\n      <p>${esc(s.text)}</p>\n    </section>`).join('\n');
		const form = data
			? `\n    <form action="${H.url}" method="post">\n      <p><label for="n">${H.name}</label> <input id="n" name="name" required></p>\n      <p><label for="p">${H.phone}</label> <input id="p" name="phone" type="tel" required></p>\n      <p><label><input type="checkbox" required> ${H.consent} <a href="${H.policyUrl}">${H.policy}</a></label></p>\n      <button>${esc(b.action)}</button>\n    </form>`
			: '';
		const bad = err4 ? `\n    <img src="http://images.example-stock.com/team.jpg">\n    <div onclick="go()">Get Started</div>\n    <script src="https://cdn.example-cdn.com/lib.js"><\/script>` : '';
		return `<!doctype html>\n<html lang="${H.lang}">\n<head><meta charset="utf-8"><title>${esc(b.name)}</title></head>\n<body>\n  <header><h1>${esc(b.name)}</h1></header>\n  <main>\n${secs}${form}${bad}\n  </main>\n</body>\n</html>`;
	});
	let gate4 = $state<{ ok: boolean; why: string } | null>(null);
	function check4() {
		const d = new DOMParser().parseFromString(stage4, 'text/html');
		const q = (s: string) => d.querySelectorAll(s).length;
		const p: string[] = [];
		if (!d.documentElement.getAttribute('lang')) p.push(W.noLang);
		if (q('h1') !== 1) p.push(W.h1(q('h1')));
		if (q('img:not([alt])')) p.push(W.noAlt);
		if (q('div[onclick]')) p.push(W.divBtn);
		if (q('script[src]')) p.push(W.extScript);
		let un = 0;
		d.querySelectorAll('input:not([type=hidden])').forEach((i) => {
			const id = i.getAttribute('id');
			if (!i.closest('label') && !(id && d.querySelector(`label[for="${id}"]`))) un++;
		});
		if (un) p.push(W.noLabels(un));
		gate4 = p.length ? { ok: false, why: W.codeFail(p.join('; ')) } : { ok: true, why: W.codeOk };
	}
	$effect(() => {
		stage4;
		gate4 = null;
	});

	const tokens = (s: string) => Math.round(s.length / W.charsPerToken);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out"><strong>{W.noModel}</strong> {W.noModelText}</p>

	<section class="st">
		<div class="dh">{W.s1}</div>
		<label class="dg-ctl"><input type="checkbox" bind:checked={sendContacts} /> {W.sendContacts}</label>
		<pre class="dg-box dg-mono">{stage1}</pre>
		<p class="gate" class:ok={gate1.ok} aria-live="polite"><strong>{gate1.ok ? W.passed : W.failed}</strong> {gate1.why} {W.tokensIn(tokens(stage1))}</p>
	</section>

	<section class="st">
		<div class="dh">{W.s2}</div>
		<label class="dg-ctl"><input type="checkbox" bind:checked={err2} /> {W.err2}</label>
		<pre class="dg-box dg-mono">{stage2}</pre>
		<p class="gate" class:ok={gate2.ok} aria-live="polite"><strong>{gate2.ok ? W.passed : W.failed}</strong> {gate2.why}</p>
	</section>

	<section class="st">
		<div class="dh">{W.s3}</div>
		<label class="dg-ctl"><input type="checkbox" bind:checked={err3} /> {W.err3}</label>
		<ul class="copy">{#each stage3 as s, i (i)}<li><strong>{s.title}.</strong> {s.text}</li>{/each}</ul>
		<p class="gate" class:ok={gate3.ok} aria-live="polite"><strong>{gate3.ok ? W.passed : W.failed}</strong> {gate3.why}</p>
	</section>

	<section class="st">
		<div class="dh">{W.s4}</div>
		<label class="dg-ctl"><input type="checkbox" bind:checked={err4} /> {W.err4}</label>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
		<pre class="dg-box dg-mono code" tabindex="0" aria-label={W.codeLabel}>{stage4}</pre>
		<div class="dg-ctl"><button type="button" onclick={check4}>{W.checkBtn}</button></div>
		{#if gate4}<p class="gate" class:ok={gate4.ok} aria-live="polite"><strong>{gate4.ok ? W.passed : W.failed}</strong> {gate4.why}</p>{/if}
	</section>
	<p class="dg-out">{W.real}</p>
</figure>

<style>
	.st {
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	.dh {
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
