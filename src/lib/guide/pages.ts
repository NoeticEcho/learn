/**
 * What Эхо knows about the page it is on, and what it says there with no key and no network
 * (docs/specs/2026-11-01-platform-design.md §5.3). Scripted: it never improvises. A lesson brings
 * its own line; every other kind of page has its line here. It lives in the panel's lazy chunk, so
 * these words are not paid for by a page where nobody opens Эхо.
 *
 * `tests/unit/dock.test.ts` walks src/routes, so a new route with no line here fails.
 */
import { pick, type Locale } from '#lib/i18n/index.ts';
import type { Mood } from './script.ts';
import type { CatalogView, CourseNav, CourseView } from '#lib/courses/types.ts';
import * as links from '#lib/links.ts';

export type PageKind = 'catalog' | 'course' | 'lesson' | 'map' | 'review' | 'gallery' | 'settings' | 'prologue' | 'error';

/** The kind of a page, from its route. Nothing else needs to change when a page's data does. */
export function pageKind(routeId: string | null, status: number): PageKind | null {
	if (status >= 400 || routeId === null) return 'error';
	const r = routeId.replace(/^\/\[\[lang=lang\]\]/, '') || '/';
	if (r === '/') return 'catalog';
	if (r === '/course/web/prologue') return 'prologue';
	if (r === '/course/[course]/[part]/[lesson]') return 'lesson';
	if (r.startsWith('/course/')) return 'course';
	if (r.startsWith('/lesson/')) return 'lesson';
	if (r === '/map' || r === '/review' || r === '/gallery' || r === '/settings') return r.slice(1) as PageKind;
	return null;
}

export type DockLink = { href: string; label: string };
export type DockScript = {
	kind: PageKind;
	courseId: string | null;
	line: string;
	mood: Mood;
	links: DockLink[];
	/** What a model is told about this page, in model mode only. */
	context: { label: string; text: string };
};

const WEB: Record<Locale, string> = { ru: 'Сеть насквозь', en: 'The Web, End to End' };

type PageData = {
	catalog?: CatalogView;
	lesson?: { title: string; summary: string; definition: string; part?: number; guide: { intro: string } };
	/** A lesson of a course other than the web one: its course, part and place (spec 2026-11-01 §5.4). */
	course?: CourseView | CourseNav;
	part?: { number: number; title: string };
	untranslated?: { title: string };
};

const L = (ru: string, en: string) => ({ ru, en });

/** The script for a page. `status` and `routeId` are SvelteKit's; `data` is the page's own. */
export function script(routeId: string | null, status: number, data: PageData, lang: Locale): DockScript {
	const say = (s: { ru: string; en: string }) => pick(s, lang);
	const web = WEB[lang];
	const to = {
		catalog: { href: links.home(lang), label: say(L('Каталог курсов', 'Course catalog')) },
		webCourse: { href: links.course('web', lang), label: say(L(`Курс «${web}»`, `The course “${web}”`)) },
		map: { href: links.map(lang), label: say(L('Карта курса о вебе', 'Map of the web course')) },
		review: { href: links.review(lang), label: say(L('Повторение', 'Review')) },
		settings: { href: links.settings(lang), label: say(L('Настройки', 'Settings')) },
		feed: { href: links.feed(lang), label: say(L('Лента новых уроков', 'Feed of new lessons')) }
	};
	const kind = pageKind(routeId, status) ?? 'catalog';
	const base = { kind, courseId: null as string | null, mood: 'explain' as Mood };

	switch (kind) {
		case 'catalog': {
			const rows = data.catalog?.strands.flatMap((s) => s.courses) ?? [];
			// a course with its first lessons out is named, so the line stays true as lessons open
			const partly = rows.filter((c) => c.state === 'partly').map((c) => (lang === 'ru' ? `«${c.title}»` : `“${c.title}”`));
			const opening = partly.length
				? say(L(`Уроки уже выходят в курсе ${partly.join(', ')}. `, `Lessons are already coming out in ${partly.join(', ')}. `))
				: '';
			return {
				...base,
				line: say(
					L(
						`Здесь все курсы платформы. Целиком открыт пока один, о вебе. ${opening}У остальных есть оглавления, а уроки появляются по одному. Скажите, что вас привело, и я подскажу, с чего начать.`,
						`Here are all the courses. One is open in full so far, on the web. ${opening}The others have tables of contents, and lessons appear one at a time. Tell me what brought you here and I will suggest where to start.`
					)
				),
				links: [to.webCourse, to.feed],
				context: { label: say(L('Каталог курсов', 'The course catalog')), text: rows.map((c) => `${c.title} (${c.state}): ${c.tagline}`).join('\n') }
			};
		}
		case 'course': {
			const c = data.course && !('place' in data.course) ? data.course : undefined;
			if (c?.kind === 'web')
				return {
					...base,
					courseId: 'web',
					line: say(
						L(
							`Это курс «${web}», первый открытый на платформе. Он начинается со вступления, где ваш сайт собирается на глазах, а дальше можно идти по порядку или по карте.`,
							`This is “${web}”, the first open course here. It starts with a prologue in which your own site assembles itself, and after that you can go in order or by the map.`
						)
					),
					links: [{ href: links.prologue(lang), label: say(L('Вступление', 'The prologue')) }, to.map, to.review],
					context: { label: say(L('Курс', 'Course')), text: `${c.title}\n${c.about}\n${c.parts.map((p) => p.title).join('\n')}` }
				};
			const title = c?.title ?? '';
			if (c?.kind === 'planned' && c.open > 0) {
				const first = c.parts.flatMap((p) => p.lessons.map((l) => ({ ...l, part: p.id }))).find((l) => l.open)!;
				return {
					...base,
					courseId: c.id,
					line: say(
						L(
							`Это курс «${title}». Открыто ${c.open} из ${c.lessons} уроков, остальные выходят по одному, и сроков мы не обещаем. Начните с первого урока, а о следующих узнавайте из ленты.`,
							`This is “${title}”. ${c.open} of its ${c.lessons} lessons are open, the rest come out one at a time, and we promise no dates. Start with the first lesson, and hear about the next ones from the feed.`
						)
					),
					links: [{ href: links.lesson(`${c.id}/${first.part}/${first.id}`, lang), label: first.title }, to.feed, to.catalog],
					context: {
						label: say(L('Оглавление курса', 'The course’s table of contents')),
						text: `${c.title}\n${c.about}\n${c.parts.flatMap((p) => [p.title, ...p.lessons.map((l) => `- ${l.title}${l.open ? '' : ` (${say(DOCK_WORDS.soon)})`}: ${l.summary}`)]).join('\n')}`
					}
				};
			}
			return {
				...base,
				courseId: c?.id ?? null,
				line: say(
					L(
						`Это курс «${title}». Пока здесь только оглавление: уроки появляются по одному, и сроков мы не обещаем. Чтобы узнать о новом уроке, не оставляя адреса, подпишитесь на ленту.`,
						`This is “${title}”. So far there is only its table of contents: lessons appear one at a time, and we promise no dates. To hear about a new lesson without giving an address, subscribe to the feed.`
					)
				),
				links: [to.feed, to.catalog, to.webCourse],
				context: {
					label: say(L('Оглавление курса', 'The course’s table of contents')),
					text: c?.kind === 'planned' ? `${c.title}\n${c.about}\n${c.parts.flatMap((p) => [p.title, ...p.lessons.map((l) => `- ${l.title}: ${l.summary}`)]).join('\n')}` : ''
				}
			};
		}
		case 'lesson': {
			if (data.untranslated)
				return {
					...base,
					courseId: 'web',
					line: say(L('Этого урока на этом языке пока нет.', 'This lesson isn’t in this language yet. The page has a link to the Russian one.')),
					links: [to.map],
					context: { label: say(L('Урок', 'Lesson')), text: data.untranslated.title }
				};
			const l = data.lesson;
			const nav = data.course && 'place' in data.course ? (data.course as CourseNav) : null;
			if (nav)
				return {
					...base,
					courseId: nav.id,
					line: `${say(L(`Мы в курсе «${nav.title}», часть ${nav.part.number}, «${nav.part.title}».`, `We are in “${nav.title}”, part ${nav.part.number}, “${nav.part.title}”.`))} ${l?.guide.intro ?? ''}`,
					links: [{ href: links.course(nav.id, lang), label: say(L(`Курс «${nav.title}»`, `The course “${nav.title}”`)) }, to.review, to.catalog],
					context: { label: say(L('Урок', 'Lesson')), text: l ? `${l.title}\n${l.definition}\n${l.summary}` : '' }
				};
			const where = say(L(`Мы в курсе «${web}», часть ${data.part?.number ?? ''}, «${data.part?.title ?? ''}».`, `We are in “${web}”, part ${data.part?.number ?? ''}, “${data.part?.title ?? ''}”.`));
			return {
				...base,
				courseId: 'web',
				line: `${where} ${l?.guide.intro ?? ''}`,
				links: [to.map, to.review, to.webCourse],
				context: { label: say(L('Урок', 'Lesson')), text: l ? `${l.title}\n${l.definition}\n${l.summary}` : '' }
			};
		}
		case 'map':
			return {
				...base,
				courseId: 'web',
				line: say(
					L(
						`Это карта курса «${web}». Каждый урок учит одним понятиям и опирается на другие. Наведите на урок, и видно, что ему нужно и что он откроет. Идти можно в любом порядке, если всё нужное пройдено.`,
						`This is the map of “${web}”. Each lesson teaches some concepts and relies on others. Point at a lesson to see what it needs and what it opens. You can go in any order once what a lesson needs is done.`
					)
				),
				links: [to.webCourse, to.review],
				context: { label: say(L('Страница', 'Page')), text: say(L(`Карта курса «${web}»`, `The map of “${web}”`)) }
			};
		case 'review':
			return {
				...base,
				line: say(
					L(
						'Здесь карточки всех ваших курсов, которым пора на повторение. Сначала вспомните ответ сами, а потом откройте его: память укрепляет именно попытка вспомнить.',
						'Here are the cards from all your courses that are due. Recall the answer yourself before you reveal it: it is the attempt to recall that strengthens memory.'
					)
				),
				links: [to.webCourse, to.catalog],
				context: { label: say(L('Страница', 'Page')), text: say(L('Повторение карточек', 'Reviewing cards')) }
			};
		case 'gallery':
			return {
				...base,
				courseId: 'web',
				line: say(
					L(
						`Здесь ваш сайт во всех эпохах курса «${web}»: каждая версия появляется, когда вы доходите до её практики. Всё это хранится только в этом браузере.`,
						`Here is your site in every era of “${web}”: each version appears when you reach its practice. All of it is kept only in this browser.`
					)
				),
				links: [to.map, to.webCourse],
				context: { label: say(L('Страница', 'Page')), text: say(L('Галерея сайта ученика по эпохам', 'A gallery of the learner’s site by era')) }
			};
		case 'settings':
			return {
				...base,
				line: say(
					L(
						'Здесь всё, что знает о вас этот браузер: прогресс, ваш проект и ключ модели. На сервер ничего не уходит, потому что сервера нет, так что сохраняйте прогресс файлом. Ключ нужен, только если хотите спрашивать меня своими словами.',
						'Here is everything this browser knows about you: your progress, your project and your model key. None of it goes to a server, because there is none, so save your progress to a file. A key is needed only if you want to ask me in your own words.'
					)
				),
				links: [to.catalog],
				context: { label: say(L('Страница', 'Page')), text: say(L('Настройки', 'Settings')) }
			};
		case 'prologue':
			return {
				...base,
				courseId: 'web',
				line: say(
					L(
						`Это вступление к курсу «${web}». Ответьте на три вопроса, и ваш сайт соберётся на глазах, эпоха за эпохой. Можно пропустить и сразу открыть карту.`,
						`This is the prologue of “${web}”. Answer three questions and your own site assembles itself, era by era. You can skip it and go straight to the map.`
					)
				),
				links: [to.map, to.webCourse],
				context: { label: say(L('Страница', 'Page')), text: say(L('Вступление к курсу о вебе', 'The prologue of the web course')) }
			};
		case 'error':
			return {
				...base,
				mood: 'hmm',
				line:
					status === 404
						? say(L('Такой страницы здесь нет. Возможно, адрес набран с ошибкой. Все курсы есть в каталоге.', 'There is no such page here. Perhaps the address has a typo. All the courses are in the catalog.'))
						: say(L('Что-то сломалось на этой странице. Попробуйте обновить её или вернитесь в каталог.', 'Something broke on this page. Try reloading it, or go back to the catalog.')),
				links: [to.catalog, to.map],
				context: { label: say(L('Страница', 'Page')), text: say(L('Страница ошибки', 'An error page')) }
			};
	}
}

/** The words of the panel itself, in the chunk with the rest. */
export const DOCK_WORDS = {
	title: L('Эхо, ваш проводник', 'Echo, your guide'),
	close: L('Закрыть', 'Close'),
	choose: L('С чего начать?', 'Where to start?'),
	open: L('открыт', 'open'),
	soon: L('скоро', 'coming soon'),
	settings: L('Настройки', 'Settings'),
	noKey: L(
		'Это заготовленные реплики: они работают без сети и без ключа. Чтобы спрашивать своими словами, добавьте свой ключ модели в настройках. По умолчанию это выключено.',
		'These are scripted lines: they work with no network and no key. To ask in your own words, add your own model key in settings. It is off by default.'
	)
};
