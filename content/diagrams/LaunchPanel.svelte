<!--
	«Панель запуска» (part 15, lesson 14). Thirty checks in six blocks (speed and reliability,
	accessibility, security, law, search and analytics, the main action and content). The person sets
	each check to «не проверено», «в порядке» or «проблема». The panel shows each block's colour and
	the readiness of the whole site, and lists what blocks the launch: a check marked as a blocker
	that is not «в порядке». The blockers are the lesson's judgement of what must not ship broken,
	and the person's own project may rank them differently.
-->
<script lang="ts">
	import './shared.css';

	type State = 'none' | 'ok' | 'bad';
	type Check = { id: string; text: string; blocker?: boolean; from: string };
	type Block = { id: string; name: string; checks: Check[] };
	const blocks: Block[] = [
		{ id: 'speed', name: 'Скорость и надёжность', checks: [
			{ id: 's1', text: 'LCP, INP и CLS в зелёной зоне на мобильной сети', from: 'урок 1' },
			{ id: 's2', text: 'Картинки сжаты, с размерами, главная не ленивая', from: 'урок 1' },
			{ id: 's3', text: 'Записан бюджет, страница в его рамках', from: 'урок 1' },
			{ id: 's4', text: 'Есть резервная копия и проверено её восстановление', blocker: true, from: 'часть 9' },
			{ id: 's5', text: 'Есть способ откатить выкладку и мониторинг доступности', blocker: true, from: 'часть 9' }
		] },
		{ id: 'a11y', name: 'Доступность', checks: [
			{ id: 'a1', text: 'Автоматическая проверка без серьёзных ошибок', from: 'урок 2' },
			{ id: 'a2', text: 'Весь сайт проходится клавиатурой, фокус виден', blocker: true, from: 'урок 2' },
			{ id: 'a3', text: 'Контраст не ниже 4,5 к 1, цели касания от 24 пикселей', from: 'урок 2' },
			{ id: 'a4', text: 'Главное действие пройдено диктором', from: 'урок 3' },
			{ id: 'a5', text: 'Заявление о доступности опубликовано и честно', from: 'урок 13' }
		] },
		{ id: 'sec', name: 'Безопасность', checks: [
			{ id: 'c1', text: 'HTTPS везде, HSTS включён', blocker: true, from: 'урок 5' },
			{ id: 'c2', text: 'CSP и заголовки безопасности заданы, оценка Observatory записана', from: 'урок 5' },
			{ id: 'c3', text: 'Второй фактор на почте, домене, хостинге, репозитории', blocker: true, from: 'урок 5' },
			{ id: 'c4', text: 'Нет ключей и паролей в репозитории', blocker: true, from: 'урок 5' },
			{ id: 'c5', text: 'Форма проверяется на сервере, спам остановлен без капчи', from: 'урок 6' }
		] },
		{ id: 'law', name: 'Право', checks: [
			{ id: 'l1', text: 'Реестр обработки данных составлен, данные граждан РФ в России', blocker: true, from: 'урок 7' },
			{ id: 'l2', text: 'Отдельное пустое согласие и политика с датой и версией', blocker: true, from: 'урок 8' },
			{ id: 'l3', text: 'Таблица cookie и честный баннер, счётчик спит до выбора', from: 'урок 9' },
			{ id: 'l4', text: 'Реестр материалов с лицензиями, согласия на фото людей', from: 'урок 10' },
			{ id: 'l5', text: 'Тексты проверены на закон о рекламе и правила профессии; страница условий, если продаёте', blocker: true, from: 'уроки 11 и 12' }
		] },
		{ id: 'seo', name: 'Поиск и аналитика', checks: [
			{ id: 'e1', text: 'Заголовки, описания и адреса страниц заданы', from: 'часть 13' },
			{ id: 'e2', text: 'robots.txt, sitemap и канонические адреса настроены', from: 'часть 13' },
			{ id: 'e3', text: 'Превью ссылки (Open Graph) выглядит правильно', from: 'часть 2' },
			{ id: 'e4', text: 'Счётчик установлен, цели настроены, метки UTM ведутся', from: 'часть 14' },
			{ id: 'e5', text: 'Сайт добавлен в вебмастера поисковиков', from: 'часть 13' }
		] },
		{ id: 'action', name: 'Главное действие и содержимое', checks: [
			{ id: 'm1', text: 'Главное действие выполняется на телефоне от начала до конца', blocker: true, from: 'урок 4' },
			{ id: 'm2', text: 'Оно работает и там, где скрипт не загрузился', from: 'часть 5' },
			{ id: 'm3', text: 'Телефон, почта и адрес совпадают на всех страницах', blocker: true, from: 'практика' },
			{ id: 'm4', text: 'Сквозные тесты зелёные', from: 'урок 4' },
			{ id: 'm5', text: 'Нет ссылок на 404, тексты вычитаны', from: 'практика' }
		] }
	];
	let st = $state<Record<string, State>>({});
	const label: Record<State, string> = { none: 'не проверено', ok: 'в порядке', bad: 'проблема' };
	const next = (s: State | undefined): State => (s === 'ok' ? 'bad' : s === 'bad' ? 'none' : 'ok');

	const all = blocks.flatMap((b) => b.checks);
	const okN = $derived(all.filter((c) => st[c.id] === 'ok').length);
	const blockers = $derived(all.filter((c) => c.blocker && st[c.id] !== 'ok'));
	function colour(b: Block): 'green' | 'yellow' | 'red' {
		const s = b.checks.map((c) => st[c.id] ?? 'none');
		if (s.some((x, i) => x === 'bad' && b.checks[i].blocker) || s.filter((x) => x === 'bad').length >= 2) return 'red';
		if (s.every((x) => x === 'ok')) return 'green';
		return 'yellow';
	}
	const word = { green: '● зелёный', yellow: '▲ жёлтый', red: '■ красный' } as const;
	const ready = $derived(blockers.length === 0);
</script>

<figure class="dg">
	<figcaption>Панель запуска: шесть блоков, тридцать проверок</figcaption>
	<p class="dg-out">Нажимайте на проверку, чтобы менять её состояние: не проверено, в порядке, проблема. Проверки с пометкой «блокер» нельзя оставлять неисправленными. Какие считать блокерами в вашем проекте, решаете вы.</p>

	{#each blocks as b (b.id)}
		<section class="blk {colour(b)}">
			<div class="dh">{b.name} <span class="col">{word[colour(b)]}</span></div>
			<ul>
				{#each b.checks as c (c.id)}
					<li>
						<button type="button" class="chk {st[c.id] ?? 'none'}" aria-label="{c.text}: {label[st[c.id] ?? 'none']}" onclick={() => (st[c.id] = next(st[c.id]))}>{st[c.id] === 'ok' ? '✓' : st[c.id] === 'bad' ? '✕' : '·'}</button>
						<span>{c.text}{#if c.blocker} <span class="tag">блокер</span>{/if} <span class="dim">({c.from})</span></span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<div class="sum" aria-live="polite">
		<p class="dg-out"><strong>Готовность: {okN} из {all.length}.</strong> <strong>{ready ? 'Готов к запуску: блокеров нет.' : `Не готов: блокеров ${blockers.length}.`}</strong></p>
		{#if !ready}<ul class="bl">{#each blockers as c (c.id)}<li>{c.text} ({label[st[c.id] ?? 'none']})</li>{/each}</ul>{/if}
	</div>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> панель из тридцати проверок в шести блоках: скорость и надёжность, доступность, безопасность, право, поиск и аналитика, главное действие и содержимое. У каждой три состояния. Блок красный, если есть проблема с блокером или две проблемы, зелёный, если всё в порядке, иначе жёлтый. Запуск разрешён, когда все проверки с пометкой блокер в порядке.</p>
</figure>

<style>
	.blk {
		margin: 0 0 var(--space-3);
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
	}
	.blk.green {
		border-color: var(--accent-measure);
	}
	.blk.yellow {
		border-style: dashed;
		border-color: var(--border-brass);
	}
	.blk.red {
		border-style: dotted;
		border-width: 2px;
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		font-weight: var(--weight-regular);
		color: var(--text-primary);
	}
	.col {
		margin-left: var(--space-2);
		font-family: var(--font-sans);
		font-size: 0.85em;
		color: var(--text-secondary);
	}
	.blk ul {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.blk li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: center;
	}
	.chk {
		width: var(--hit-min);
		padding: 0 !important;
		font-family: var(--font-mono);
	}
	.chk.ok {
		border-color: var(--accent-measure) !important;
	}
	.chk.bad {
		border-style: dashed !important;
	}
	.tag {
		margin-left: var(--space-1);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-brass);
		font-size: 0.8em;
	}
	.dim {
		color: var(--text-secondary);
	}
	.bl {
		margin: 0;
		padding-left: var(--space-5) !important;
	}
</style>
