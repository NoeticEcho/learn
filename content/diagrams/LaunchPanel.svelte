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
	import { pick } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, «English edition»): the Russian stays as written. */
	const t = (ru: string, en: string) => pick({ ru, en });

	type State = 'none' | 'ok' | 'bad';
	type Check = { id: string; text: string; blocker?: boolean; from: string };
	type Block = { id: string; name: string; checks: Check[] };
	const blocksRu: Block[] = [
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
	const blocksEn: Block[] = [
		{ id: 'speed', name: 'Speed and reliability', checks: [
			{ id: 's1', text: 'LCP, INP and CLS in the green zone on a mobile network', from: 'lesson 1' },
			{ id: 's2', text: 'Images compressed, with sizes, and the main one not lazy', from: 'lesson 1' },
			{ id: 's3', text: 'A budget is written down and the page is within it', from: 'lesson 1' },
			{ id: 's4', text: 'There is a backup and its restoration has been tested', blocker: true, from: 'part 9' },
			{ id: 's5', text: 'There is a way to roll back a deploy, and uptime monitoring', blocker: true, from: 'part 9' }
		] },
		{ id: 'a11y', name: 'Accessibility', checks: [
			{ id: 'a1', text: 'An automated check with no serious errors', from: 'lesson 2' },
			{ id: 'a2', text: 'The whole site can be used with a keyboard, and focus is visible', blocker: true, from: 'lesson 2' },
			{ id: 'a3', text: 'Contrast at least 4.5 to 1, touch targets at least 24 pixels', from: 'lesson 2' },
			{ id: 'a4', text: 'The main action works with a screen reader', from: 'lesson 3' },
			{ id: 'a5', text: 'An accessibility statement is published and honest', from: 'lesson 13' }
		] },
		{ id: 'sec', name: 'Security', checks: [
			{ id: 'c1', text: 'HTTPS everywhere, HSTS on', blocker: true, from: 'lesson 5' },
			{ id: 'c2', text: 'CSP and security headers set, the Observatory grade recorded', from: 'lesson 5' },
			{ id: 'c3', text: 'A second factor on email, domain, hosting and repository', blocker: true, from: 'lesson 5' },
			{ id: 'c4', text: 'No keys or passwords in the repository', blocker: true, from: 'lesson 5' },
			{ id: 'c5', text: 'The form is checked on the server, and spam is stopped without a CAPTCHA', from: 'lesson 6' }
		] },
		{ id: 'law', name: 'Law', checks: [
			{ id: 'l1', text: 'A record of processing is written, and you know where the data is stored and whether it leaves the UK or EEA', blocker: true, from: 'lesson 7' },
			{ id: 'l2', text: 'A separate empty consent where you rely on consent, and a privacy notice with a date and a version', blocker: true, from: 'lesson 8' },
			{ id: 'l3', text: 'A cookie table and an honest banner; the counter sleeps until the choice, and GPC is honored', from: 'lesson 9' },
			{ id: 'l4', text: 'A register of materials with licenses, and written consent for photos of people', from: 'lesson 10' },
			{ id: 'l5', text: 'Texts checked against advertising law and your profession’s rules; a terms page if you sell', blocker: true, from: 'lessons 11 and 12' }
		] },
		{ id: 'seo', name: 'Search and analytics', checks: [
			{ id: 'e1', text: 'Titles, descriptions and page addresses are set', from: 'part 13' },
			{ id: 'e2', text: 'robots.txt, sitemap and canonical addresses are set up', from: 'part 13' },
			{ id: 'e3', text: 'The link preview (Open Graph) looks right', from: 'part 2' },
			{ id: 'e4', text: 'A counter is installed, goals are set and UTM tags are kept', from: 'part 14' },
			{ id: 'e5', text: 'The site is added to the search engines’ webmaster tools', from: 'part 13' }
		] },
		{ id: 'action', name: 'The main action and content', checks: [
			{ id: 'm1', text: 'The main action works on a phone from start to finish', blocker: true, from: 'lesson 4' },
			{ id: 'm2', text: 'It works even where the script did not load', from: 'part 5' },
			{ id: 'm3', text: 'Phone, email and address match on every page', blocker: true, from: 'practice' },
			{ id: 'm4', text: 'End-to-end tests are green', from: 'lesson 4' },
			{ id: 'm5', text: 'No links to a 404, and the texts are proofread', from: 'practice' }
		] }
	];
	const blocks = pick({ ru: blocksRu, en: blocksEn });
	let st = $state<Record<string, State>>({});
	const label: Record<State, string> = { none: t('не проверено', 'not checked'), ok: t('в порядке', 'OK'), bad: t('проблема', 'problem') };
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
	const word = { green: t('● зелёный', '● green'), yellow: t('▲ жёлтый', '▲ yellow'), red: t('■ красный', '■ red') } as const;
	const ready = $derived(blockers.length === 0);
</script>

<figure class="dg">
	<figcaption>{t('Панель запуска: шесть блоков, тридцать проверок', 'The launch panel: six blocks, thirty checks')}</figcaption>
	<p class="dg-out">{t('Нажимайте на проверку, чтобы менять её состояние: не проверено, в порядке, проблема. Проверки с пометкой «блокер» нельзя оставлять неисправленными. Какие считать блокерами в вашем проекте, решаете вы.', 'Press a check to change its state: not checked, OK, problem. Checks marked “blocker” must not be left unfixed. Which ones count as blockers in your project is for you to decide.')}</p>

	{#each blocks as b (b.id)}
		<section class="blk {colour(b)}">
			<div class="dh">{b.name} <span class="col">{word[colour(b)]}</span></div>
			<ul>
				{#each b.checks as c (c.id)}
					<li>
						<button type="button" class="chk {st[c.id] ?? 'none'}" aria-label="{c.text}: {label[st[c.id] ?? 'none']}" onclick={() => (st[c.id] = next(st[c.id]))}>{st[c.id] === 'ok' ? '✓' : st[c.id] === 'bad' ? '✕' : '·'}</button>
						<span>{c.text}{#if c.blocker} <span class="tag">{t('блокер', 'blocker')}</span>{/if} <span class="dim">({c.from})</span></span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<div class="sum" aria-live="polite">
		<p class="dg-out"><strong>{t('Готовность:', 'Readiness:')} {okN} {t('из', 'of')} {all.length}.</strong> <strong>{ready ? t('Готов к запуску: блокеров нет.', 'Ready to launch: no blockers.') : t(`Не готов: блокеров ${blockers.length}.`, `Not ready: ${blockers.length} blockers.`)}</strong></p>
		{#if !ready}<ul class="bl">{#each blockers as c (c.id)}<li>{c.text} ({label[st[c.id] ?? 'none']})</li>{/each}</ul>{/if}
	</div>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('панель из тридцати проверок в шести блоках: скорость и надёжность, доступность, безопасность, право, поиск и аналитика, главное действие и содержимое. У каждой три состояния. Блок красный, если есть проблема с блокером или две проблемы, зелёный, если всё в порядке, иначе жёлтый. Запуск разрешён, когда все проверки с пометкой блокер в порядке.', 'a panel of thirty checks in six blocks: speed and reliability, accessibility, security, law, search and analytics, and the main action and content. Each check has three states. A block is red if a blocker has a problem or two checks have problems, green if everything is OK, and yellow otherwise. The launch is allowed when every check marked as a blocker is OK.')}</p>
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
