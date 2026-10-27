<!--
	«Устарело или современно?» (part 4, lesson 2). Eight pairs of one block in two versions. The
	person picks the version that is less dated and serves the reader better, then reads why. One
	pair is a trap: the newer-looking version is the worse one. The words come from the person's
	own brief where the pair needs a project.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Block = { t: string; s?: string };
	type Side = { stage: string; blocks: Block[] };
	type Pair = { ask: string; a: Side; b: Side; better: 'a' | 'b'; why: string };

	let brief = $state({ title: 'Ваш проект', who: 'Что вы делаете', forWhom: 'Для кого', action: 'Что делает посетитель', person: 'Имя' });

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
	const pairs = $derived<Pair[]>([
		{
			ask: 'Первый экран сайта',
			a: {
				stage: 'background:#ffe9a8;color:#600;padding:12px;font-family:Impact,Arial,sans-serif;text-align:center',
				blocks: [{ t: '◄   слайд 2 из 5   ►', s: 'font-size:11px' }, { t: 'АКЦИЯ! НОВИНКИ! МЫ ЛУЧШИЕ!', s: 'font-size:22px;margin:8px 0' }, { t: '● ○ ○ ○ ○ (листается само)', s: 'font-size:11px' }]
			},
			b: { stage: calm, blocks: [{ t: brief.title, s: 'font-size:22px;font-weight:600;line-height:1.15' }, { t: brief.forWhom, s: 'font-size:14px;margin:6px 0 10px;color:#4a4742' }, { t: brief.action, s: 'display:inline-block;background:#1c1b19;color:#faf9f7;padding:8px 14px;border-radius:6px;font-size:14px' }] },
			better: 'b',
			why: 'Карусель сама листает то, что вы не успели прочитать, и прячет главное за слайдами; юзабилити-исследования не раз показывали, что её почти не листают, а автоматическое движение мешает читать (WCAG требует возможность его остановить). Один ясный заголовок и одно действие работают лучше.'
		},
		{
			ask: 'Основной текст',
			a: { stage: calm, blocks: [{ t: 'Основной текст набран шрифтом не меньше 16 пикселей, тёмным по светлому, с воздухом между строками.', s: 'font-size:16px;line-height:1.55' }] },
			b: { stage: 'background:#fff;color:#aaa;padding:12px;font-family:Verdana,sans-serif', blocks: [{ t: 'Основной текст набран мелким светло-серым шрифтом по белому: красиво на макете, трудно читать на улице и без очков.', s: 'font-size:11px;line-height:1.2' }] },
			better: 'a',
			why: 'Светло-серый мелкий текст не проходит проверку контраста (нужно 4,5 к 1) и плохо читается на телефоне. Читаемость не устаревает, а её нехватка датирует страницу сразу.'
		},
		{
			ask: 'Заголовок главной страницы',
			a: { stage: 'background:#fff;color:#222;padding:12px;font-family:Georgia,serif;text-align:center', blocks: [{ t: 'Добро пожаловать на наш сайт!', s: 'font-size:22px' }, { t: 'Мы рады видеть вас среди наших гостей.', s: 'font-size:14px;margin-top:6px' }] },
			b: { stage: calm, blocks: [{ t: brief.who, s: 'font-size:22px;font-weight:600;line-height:1.15' }, { t: `Для: ${brief.forWhom}`, s: 'font-size:14px;margin-top:6px;color:#4a4742' }] },
			better: 'b',
			why: 'Приветствие занимает самое видное место и ничего не сообщает. Хороший заголовок отвечает на вопросы «что это» и «для кого» с первого взгляда.'
		},
		{
			ask: 'Ширина страницы',
			a: { stage: calm, blocks: [{ t: 'Ширина следует за экраном, текст не длиннее удобной строки, колонки перестраиваются.', s: 'font-size:14px;max-width:46ch' }, { t: '▭▭▭ на телефоне; ▭▭ ▭▭ на планшете', s: 'font-size:13px;margin-top:6px;color:#4a4742' }] },
			b: { stage: 'background:#ddd;color:#222;padding:12px;font-family:Verdana,sans-serif', blocks: [{ t: 'Жёсткая ширина 960 пикселей по центру, серые поля по бокам. На телефоне страницу надо двигать пальцем в стороны.', s: 'font-size:13px;background:#fff;padding:8px;border:1px solid #999' }] },
			better: 'a',
			why: 'Фиксированная ширина это примета эпохи настольных экранов. С тех пор большая часть посетителей приходит с телефона, и страница обязана подстраиваться.'
		},
		{
			ask: 'Заставка и анимация текста',
			a: { stage: 'background:linear-gradient(135deg,#312e81,#7c3aed);color:#fff;padding:12px;font-family:Inter,sans-serif', blocks: [{ t: 'П р о р е к а е т с я   п о   б у к в е . . .', s: 'font-size:18px;letter-spacing:3px;opacity:.7' }, { t: '(три секунды ожидания, прокрутка двигает фон и текст)', s: 'font-size:12px;margin-top:6px' }] },
			b: { stage: calm, blocks: [{ t: brief.title, s: 'font-size:22px;font-weight:600' }, { t: 'Текст на месте сразу. Движение только там, где оно что-то объясняет.', s: 'font-size:14px;margin-top:6px;color:#4a4742' }] },
			better: 'b',
			why: 'Это ловушка: левая версия выглядит новее, но заставит ждать и закружит голову. Современное не значит «новое»: эффект, который мешает читать, датирует страницу так же быстро, как заставка на Flash. Движение должно уважать настройку «уменьшить анимацию».'
		},
		{
			ask: 'Фотография',
			a: { stage: calm, blocks: [{ t: `[фото: ${brief.person} за работой]`, s: 'background:#ddd8cf;padding:20px 8px;text-align:center;font-size:13px' }, { t: 'Подпись: что на снимке, где и когда.', s: 'font-size:12px;margin-top:4px;color:#4a4742' }] },
			b: { stage: 'background:#e8f0fa;color:#234;padding:12px;font-family:Arial,sans-serif', blocks: [{ t: '[фото: двое в костюмах пожимают руки на белом фоне]', s: 'background:#c9d9ec;padding:20px 8px;text-align:center;font-size:13px' }, { t: 'Профессиональная команда', s: 'font-size:12px;margin-top:4px' }] },
			better: 'a',
			why: 'Стоковое «рукопожатие» узнают мгновенно, и оно ничего не доказывает. Настоящий снимок человека или работы с подписью работает как доказательство. NN/g проверяли: люди смотрят на настоящих людей, а на декоративные снимки не смотрят.'
		},
		{
			ask: 'Кнопка главного действия',
			a: { stage: 'background:#dfe8f4;padding:14px;font-family:Verdana,sans-serif', blocks: [{ t: brief.action, s: 'display:inline-block;background:linear-gradient(#8fd0ff,#1f7ad6);color:#fff;border:1px solid #165ea6;border-radius:16px;padding:7px 18px;font-size:14px;font-weight:bold;text-shadow:0 -1px 0 #14538f;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)' }] },
			b: { stage: calm, blocks: [{ t: brief.action, s: 'display:inline-block;background:#0b5cad;color:#fff;border-radius:6px;padding:10px 18px;font-size:15px;font-weight:600' }] },
			better: 'b',
			why: 'Блик и тень текста это приметы 2008 года; на цветном градиенте текст читается хуже. Сплошная кнопка с достаточным контрастом, видимым фокусом и понятным текстом решает ту же задачу тише.'
		},
		{
			ask: 'Меню',
			a: { stage: calm, blocks: [{ t: 'Главная · Услуги · Цены · Контакты · Поиск', s: 'font-size:14px' }] },
			b: { stage: 'background:#003366;color:#ff0;padding:10px;font-family:Verdana,sans-serif', blocks: [{ t: 'Главная | О нас | История | Миссия | Партнёры | Новости | Акции | Вакансии | Отзывы | Галерея | Статьи | Прайс | Карта сайта | Контакты', s: 'font-size:11px' }] },
			better: 'a',
			why: 'Четырнадцать пунктов в строку это «меню-портал» времён каталогов. Короткое меню из четырёх–шести пунктов помогает найти главное и помещается на телефоне.'
		}
	]);

	let i = $state(0);
	let pick = $state<'a' | 'b' | null>(null);
	let right = $state(0);
	let done = $state(false);

	const pair = $derived(pairs[i]);
	const ok = $derived(pick !== null && pick === pair.better);

	function choose(side: 'a' | 'b') {
		if (pick) return;
		pick = side;
		if (side === pair.better) right += 1;
	}
	function next() {
		if (i + 1 >= pairs.length) done = true;
		else {
			i += 1;
			pick = null;
		}
	}
	function again() {
		i = 0;
		pick = null;
		right = 0;
		done = false;
	}
</script>

<figure class="dg">
	<figcaption>Какая версия менее датирована и лучше служит читателю?</figcaption>
	{#if !done}
		<p class="dg-out" style="margin-top:0"><strong>Пара {i + 1} из {pairs.length}: {pair.ask}.</strong> Сначала выберите, потом читайте разбор.</p>
		<div class="pair">
			{#each ['a', 'b'] as const as side (side)}
				{@const v = pair[side]}
				<div class="col">
					<div class="mini" style={v.stage} aria-label="Версия {side === 'a' ? 'слева' : 'справа'}" role="group">
						{#each v.blocks as b, k (k)}<div style={b.s}>{b.t}</div>{/each}
					</div>
					<button type="button" onclick={() => choose(side)} disabled={pick !== null} aria-pressed={pick === side}>
						{side === 'a' ? 'Левая лучше' : 'Правая лучше'}
					</button>
				</div>
			{/each}
		</div>
		{#if pick}
			<div class="dg-box verdict" aria-live="polite">
				<p><strong>{ok ? 'Верно.' : 'Не совсем.'}</strong> Лучше {pair.better === 'a' ? 'левая' : 'правая'} версия.</p>
				<p>{pair.why}</p>
				<button type="button" onclick={next}>{i + 1 >= pairs.length ? 'Результат' : 'Дальше'}</button>
			</div>
		{/if}
	{:else}
		<div class="dg-box verdict" aria-live="polite">
			<p><strong>Верных ответов: {right} из {pairs.length}.</strong></p>
			<p>Если вы ошиблись на ловушке (пара про заставку), это нормально: «новое» легко принять за «современное». Критерий один: служит ли приём читателю и не зависит ли он от ушедшей технологии или моды.</p>
			<button type="button" onclick={again}>Пройти ещё раз</button>
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
