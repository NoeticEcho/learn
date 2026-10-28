<!--
	«Устарело или современно?» (part 4, lesson 2). Eight pairs of one block in two versions. The
	person picks the version that is less dated and serves the reader better, then reads why. One
	pair is a trap: the newer-looking version is the worse one. The words come from the person's
	own brief where the pair needs a project.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Block = { t: string; s?: string };
	type Side = { stage: string; blocks: Block[] };
	type Pair = { ask: string; a: Side; b: Side; better: 'a' | 'b'; why: string };

	// The words are in `texts`, one table per edition (docs/content-plan/README.md, «English edition»);
	// the styles of each side are the same in both. A function of the brief: some blocks use its words.
	type Brief = { title: string; who: string; forWhom: string; action: string; person: string };
	type Said = { ask: string; a: string[]; b: string[]; why: string };
	const texts = pick<(b: Brief) => Said[]>({
		ru: (b) => [
			{
				ask: 'Первый экран сайта',
				a: ['◄   слайд 2 из 5   ►', 'АКЦИЯ! НОВИНКИ! МЫ ЛУЧШИЕ!', '● ○ ○ ○ ○ (листается само)'],
				b: [b.title, b.forWhom, b.action],
				why: 'Карусель сама листает то, что вы не успели прочитать, и прячет главное за слайдами; юзабилити-исследования не раз показывали, что её почти не листают, а автоматическое движение мешает читать (WCAG требует возможность его остановить). Один ясный заголовок и одно действие работают лучше.'
			},
			{
				ask: 'Основной текст',
				a: ['Основной текст набран шрифтом не меньше 16 пикселей, тёмным по светлому, с воздухом между строками.'],
				b: ['Основной текст набран мелким светло-серым шрифтом по белому: красиво на макете, трудно читать на улице и без очков.'],
				why: 'Светло-серый мелкий текст не проходит проверку контраста (нужно 4,5 к 1) и плохо читается на телефоне. Читаемость не устаревает, а её нехватка датирует страницу сразу.'
			},
			{
				ask: 'Заголовок главной страницы',
				a: ['Добро пожаловать на наш сайт!', 'Мы рады видеть вас среди наших гостей.'],
				b: [b.who, `Для: ${b.forWhom}`],
				why: 'Приветствие занимает самое видное место и ничего не сообщает. Хороший заголовок отвечает на вопросы «что это» и «для кого» с первого взгляда.'
			},
			{
				ask: 'Ширина страницы',
				a: ['Ширина следует за экраном, текст не длиннее удобной строки, колонки перестраиваются.', '▭▭▭ на телефоне; ▭▭ ▭▭ на планшете'],
				b: ['Жёсткая ширина 960 пикселей по центру, серые поля по бокам. На телефоне страницу надо двигать пальцем в стороны.'],
				why: 'Фиксированная ширина это примета эпохи настольных экранов. С тех пор большая часть посетителей приходит с телефона, и страница обязана подстраиваться.'
			},
			{
				ask: 'Заставка и анимация текста',
				a: ['П р о р е к а е т с я   п о   б у к в е . . .', '(три секунды ожидания, прокрутка двигает фон и текст)'],
				b: [b.title, 'Текст на месте сразу. Движение только там, где оно что-то объясняет.'],
				why: 'Это ловушка: левая версия выглядит новее, но заставит ждать и закружит голову. Современное не значит «новое»: эффект, который мешает читать, датирует страницу так же быстро, как заставка на Flash. Движение должно уважать настройку «уменьшить анимацию».'
			},
			{
				ask: 'Фотография',
				a: [`[фото: ${b.person} за работой]`, 'Подпись: что на снимке, где и когда.'],
				b: ['[фото: двое в костюмах пожимают руки на белом фоне]', 'Профессиональная команда'],
				why: 'Стоковое «рукопожатие» узнают мгновенно, и оно ничего не доказывает. Настоящий снимок человека или работы с подписью работает как доказательство. NN/g проверяли: люди смотрят на настоящих людей, а на декоративные снимки не смотрят.'
			},
			{
				ask: 'Кнопка главного действия',
				a: [b.action],
				b: [b.action],
				why: 'Блик и тень текста это приметы 2008 года; на цветном градиенте текст читается хуже. Сплошная кнопка с достаточным контрастом, видимым фокусом и понятным текстом решает ту же задачу тише.'
			},
			{
				ask: 'Меню',
				a: ['Главная · Услуги · Цены · Контакты · Поиск'],
				b: ['Главная | О нас | История | Миссия | Партнёры | Новости | Акции | Вакансии | Отзывы | Галерея | Статьи | Прайс | Карта сайта | Контакты'],
				why: 'Четырнадцать пунктов в строку это «меню-портал» времён каталогов. Короткое меню из четырёх–шести пунктов помогает найти главное и помещается на телефоне.'
			}
		],
		en: (b) => [
			{
				ask: 'The first screen of a site',
				a: ['◄   slide 2 of 5   ►', 'SALE! NEW! WE ARE THE BEST!', '● ○ ○ ○ ○ (turns by itself)'],
				b: [b.title, b.forWhom, b.action],
				why: 'A carousel turns by itself what you haven’t had time to read, and hides the main thing behind slides. Usability studies have shown more than once that almost nobody clicks through them, and that automatic motion gets in the way of reading (WCAG requires a way to stop it). One clear headline and one action work better.'
			},
			{
				ask: 'Body text',
				a: ['The body text is set at 16 pixels or more, dark on light, with air between the lines.'],
				b: ['The body text is set in small light gray on white: pretty on a mockup, hard to read outdoors or without glasses.'],
				why: 'Small light gray text fails the contrast check (4.5 to 1 is needed) and reads badly on a phone. Legibility doesn’t age, and a lack of it dates a page at once.'
			},
			{
				ask: 'The headline of the home page',
				a: ['Welcome to our website!', 'We are glad to see you among our guests.'],
				b: [b.who, `For: ${b.forWhom}`],
				why: 'A greeting takes the most prominent place and says nothing. A good headline answers “what is this” and “who is it for” at first glance.'
			},
			{
				ask: 'The width of the page',
				a: ['The width follows the screen, the text is no longer than a comfortable line, the columns rearrange.', '▭▭▭ on a phone; ▭▭ ▭▭ on a tablet'],
				b: ['A fixed width of 960 pixels in the center, gray margins at the sides. On a phone you have to drag the page sideways with a finger.'],
				why: 'A fixed width is a mark of the era of desktop screens. Since then most visitors have come from a phone, and a page has to adapt.'
			},
			{
				ask: 'A splash page and animated text',
				a: ['A p p e a r s   l e t t e r   b y   l e t t e r . . .', '(three seconds of waiting, scrolling moves the background and the text)'],
				b: [b.title, 'The text is there at once. Motion only where it explains something.'],
				why: 'This is the trap: the left version looks newer, but it makes you wait and makes your head spin. Modern doesn’t mean “new”: an effect that gets in the way of reading dates a page as fast as a Flash intro. Motion has to respect the “reduce motion” setting.'
			},
			{
				ask: 'A photograph',
				a: [`[photo: ${b.person} at work]`, 'Caption: what is in the picture, where and when.'],
				b: ['[photo: two people in suits shaking hands on a white background]', 'A professional team'],
				why: 'A stock “handshake” is recognized in an instant, and it proves nothing. A real picture of a person or of the work, with a caption, works as evidence. Nielsen Norman Group tested this: people look at real people, and skip decorative pictures.'
			},
			{
				ask: 'The main-action button',
				a: [b.action],
				b: [b.action],
				why: 'Gloss and a shadow under the text are marks of 2008, and on a colored gradient the text reads worse. A solid button with enough contrast, a visible focus and a clear label does the same job more quietly.'
			},
			{
				ask: 'The menu',
				a: ['Home · Services · Prices · Contact · Search'],
				b: ['Home | About us | History | Mission | Partners | News | Offers | Jobs | Reviews | Gallery | Articles | Price list | Site map | Contact'],
				why: 'Fourteen items in a row is a “portal menu” from the days of directories. A short menu of four to six items helps people find the main thing and fits on a phone.'
			}
		]
	});

	const W = pick({
		ru: {
			fallback: { title: 'Ваш проект', who: 'Что вы делаете', forWhom: 'Для кого', action: 'Что делает посетитель', person: 'Имя' },
			caption: 'Какая версия менее датирована и лучше служит читателю?',
			pairOf: (n: number, total: number, ask: string) => `Пара ${n} из ${total}: ${ask}.`,
			first: 'Сначала выберите, потом читайте разбор.',
			version: (side: 'a' | 'b') => `Версия ${side === 'a' ? 'слева' : 'справа'}`,
			choose: (side: 'a' | 'b') => (side === 'a' ? 'Левая лучше' : 'Правая лучше'),
			right: 'Верно.',
			wrong: 'Не совсем.',
			better: (side: 'a' | 'b') => `Лучше ${side === 'a' ? 'левая' : 'правая'} версия.`,
			result: 'Результат',
			nextBtn: 'Дальше',
			score: (n: number, total: number) => `Верных ответов: ${n} из ${total}.`,
			trap: 'Если вы ошиблись на ловушке (пара про заставку), это нормально: «новое» легко принять за «современное». Критерий один: служит ли приём читателю и не зависит ли он от ушедшей технологии или моды.',
			again: 'Пройти ещё раз'
		},
		en: {
			fallback: { title: 'Your project', who: 'What you do', forWhom: 'Who it is for', action: 'What the visitor does', person: 'Name' },
			caption: 'Which version is less dated and serves the reader better?',
			pairOf: (n: number, total: number, ask: string) => `Pair ${n} of ${total}: ${ask}.`,
			first: 'Choose first, then read the explanation.',
			version: (side: 'a' | 'b') => `The version on the ${side === 'a' ? 'left' : 'right'}`,
			choose: (side: 'a' | 'b') => (side === 'a' ? 'The left is better' : 'The right is better'),
			right: 'Correct.',
			wrong: 'Not quite.',
			better: (side: 'a' | 'b') => `The ${side === 'a' ? 'left' : 'right'} version is better.`,
			result: 'Result',
			nextBtn: 'Next',
			score: (n: number, total: number) => `Correct answers: ${n} of ${total}.`,
			trap: 'If you fell for the trap (the pair about the splash page), that’s normal: “new” is easy to mistake for “modern”. The test is one: does the trick serve the reader, and does it depend on a technology or a fashion that has gone?',
			again: 'Go through again'
		}
	});

	let brief = $state<Brief>({ ...W.fallback });

	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			brief = { title: p.title, who: p.who, forWhom: p.forWhom, action: p.mainAction.label, person: p.name };
		} catch {
			/* the example words stay */
		}
	});

	const calm = 'background:#faf9f7;color:#1c1b19;padding:12px;font-family:system-ui,sans-serif';
	// The styles of each side, block by block; the words come from `texts`.
	const looks: { a: { stage: string; blocks: string[] }; b: { stage: string; blocks: string[] }; better: 'a' | 'b' }[] = [
		{
			a: { stage: 'background:#ffe9a8;color:#600;padding:12px;font-family:Impact,Arial,sans-serif;text-align:center', blocks: ['font-size:11px', 'font-size:22px;margin:8px 0', 'font-size:11px'] },
			b: { stage: calm, blocks: ['font-size:22px;font-weight:600;line-height:1.15', 'font-size:14px;margin:6px 0 10px;color:#4a4742', 'display:inline-block;background:#1c1b19;color:#faf9f7;padding:8px 14px;border-radius:6px;font-size:14px'] },
			better: 'b'
		},
		{
			a: { stage: calm, blocks: ['font-size:16px;line-height:1.55'] },
			b: { stage: 'background:#fff;color:#aaa;padding:12px;font-family:Verdana,sans-serif', blocks: ['font-size:11px;line-height:1.2'] },
			better: 'a'
		},
		{
			a: { stage: 'background:#fff;color:#222;padding:12px;font-family:Georgia,serif;text-align:center', blocks: ['font-size:22px', 'font-size:14px;margin-top:6px'] },
			b: { stage: calm, blocks: ['font-size:22px;font-weight:600;line-height:1.15', 'font-size:14px;margin-top:6px;color:#4a4742'] },
			better: 'b'
		},
		{
			a: { stage: calm, blocks: ['font-size:14px;max-width:46ch', 'font-size:13px;margin-top:6px;color:#4a4742'] },
			b: { stage: 'background:#ddd;color:#222;padding:12px;font-family:Verdana,sans-serif', blocks: ['font-size:13px;background:#fff;padding:8px;border:1px solid #999'] },
			better: 'a'
		},
		{
			a: { stage: 'background:linear-gradient(135deg,#312e81,#7c3aed);color:#fff;padding:12px;font-family:Inter,sans-serif', blocks: ['font-size:18px;letter-spacing:3px;opacity:.7', 'font-size:12px;margin-top:6px'] },
			b: { stage: calm, blocks: ['font-size:22px;font-weight:600', 'font-size:14px;margin-top:6px;color:#4a4742'] },
			better: 'b'
		},
		{
			a: { stage: calm, blocks: ['background:#ddd8cf;padding:20px 8px;text-align:center;font-size:13px', 'font-size:12px;margin-top:4px;color:#4a4742'] },
			b: { stage: 'background:#e8f0fa;color:#234;padding:12px;font-family:Arial,sans-serif', blocks: ['background:#c9d9ec;padding:20px 8px;text-align:center;font-size:13px', 'font-size:12px;margin-top:4px'] },
			better: 'a'
		},
		{
			a: { stage: 'background:#dfe8f4;padding:14px;font-family:Verdana,sans-serif', blocks: ['display:inline-block;background:linear-gradient(#8fd0ff,#1f7ad6);color:#fff;border:1px solid #165ea6;border-radius:16px;padding:7px 18px;font-size:14px;font-weight:bold;text-shadow:0 -1px 0 #14538f;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)'] },
			b: { stage: calm, blocks: ['display:inline-block;background:#0b5cad;color:#fff;border-radius:6px;padding:10px 18px;font-size:15px;font-weight:600'] },
			better: 'b'
		},
		{
			a: { stage: calm, blocks: ['font-size:14px'] },
			b: { stage: 'background:#003366;color:#ff0;padding:10px;font-family:Verdana,sans-serif', blocks: ['font-size:11px'] },
			better: 'a'
		}
	];
	const pairs = $derived<Pair[]>(
		texts(brief).map((x, n) => {
			const l = looks[n];
			const side = (k: 'a' | 'b', words: string[]): Side => ({ stage: l[k].stage, blocks: words.map((t, j) => ({ t, s: l[k].blocks[j] })) });
			return { ask: x.ask, a: side('a', x.a), b: side('b', x.b), better: l.better, why: x.why };
		})
	);

	let i = $state(0);
	let chosen = $state<'a' | 'b' | null>(null);
	let right = $state(0);
	let done = $state(false);

	const pair = $derived(pairs[i]);
	const ok = $derived(chosen !== null && chosen === pair.better);

	function choose(side: 'a' | 'b') {
		if (chosen) return;
		chosen = side;
		if (side === pair.better) right += 1;
	}
	function next() {
		if (i + 1 >= pairs.length) done = true;
		else {
			i += 1;
			chosen = null;
		}
	}
	function again() {
		i = 0;
		chosen = null;
		right = 0;
		done = false;
	}
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	{#if !done}
		<p class="dg-out" style="margin-top:0"><strong>{W.pairOf(i + 1, pairs.length, pair.ask)}</strong> {W.first}</p>
		<div class="pair">
			{#each ['a', 'b'] as const as side (side)}
				{@const v = pair[side]}
				<div class="col">
					<div class="mini" style={v.stage} aria-label={W.version(side)} role="group">
						{#each v.blocks as b, k (k)}<div style={b.s}>{b.t}</div>{/each}
					</div>
					<button type="button" onclick={() => choose(side)} disabled={chosen !== null} aria-pressed={chosen === side}>
						{W.choose(side)}
					</button>
				</div>
			{/each}
		</div>
		{#if chosen}
			<div class="dg-box verdict" aria-live="polite">
				<p><strong>{ok ? W.right : W.wrong}</strong> {W.better(pair.better)}</p>
				<p>{pair.why}</p>
				<button type="button" onclick={next}>{i + 1 >= pairs.length ? W.result : W.nextBtn}</button>
			</div>
		{/if}
	{:else}
		<div class="dg-box verdict" aria-live="polite">
			<p><strong>{W.score(right, pairs.length)}</strong></p>
			<p>{W.trap}</p>
			<button type="button" onclick={again}>{W.again}</button>
		</div>
	{/if}
</figure>

<style>
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-4);
	}
	.col {
		display: grid;
		gap: var(--space-2);
		align-content: start;
	}
	.mini {
		min-height: 8rem;
		border: var(--line) solid var(--border-hairline);
		overflow: hidden;
	}
	.verdict {
		margin-top: var(--space-4);
	}
	.verdict p {
		margin: 0 0 var(--space-2);
	}
</style>
