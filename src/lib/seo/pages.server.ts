/**
 * What the build knows about each indexable page that a page's own data does not carry: its
 * Open Graph card and when its content last changed. Build-time only.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { loadContent, loadEdition } from '#lib/content/load.ts';
import type { LessonMeta, Part } from '#lib/content/schema.ts';
import '#lib/i18n/all.server.ts';
import { pl, t, type Locale } from '#lib/i18n/index.ts';
import { loadCourses } from '#lib/courses/load.ts';
import { counts } from '#lib/courses/view.server.ts';
import { isPlanned, type Course } from '#lib/courses/schema.ts';
import { ogFile, type Mood, type OgCard } from './og.server.ts';

const ECHO: Record<Locale, string> = {
	ru: 'Эхо, проводник курса, в капюшоне, с кольцом эпох',
	en: 'Echo, the course’s guide, in a hood, with a ring of eras'
};
// Russian cards keep the names they had before there were editions; English ones are prefixed.
const stem = (s: string, l: Locale) => (l === 'ru' ? s : `${l}-${s}`);
const edition = (l: Locale) => (l === 'ru' ? {} : { lang: l });

const webTitle = (lang: Locale) => loadCourses().courses.find((c) => c.id === 'web')!.title[lang];

export function lessonCard(l: LessonMeta, part: Part, lang: Locale = 'ru'): OgCard {
	const kicker = `${t('map.part', { n: part.number }, lang)}. ${part.title}`;
	const minutes = `${l.minutes} ${pl(l.minutes, 'minute.forms', lang)}`;
	return {
		stem: stem(`lesson-${l.id.replace('/', '-')}`, lang),
		kicker,
		title: l.title,
		meta: lang === 'ru' ? `Урок ${l.order}, ${minutes}` : `Lesson ${l.order}, ${minutes}`,
		era: l.practice?.era ?? part.era ?? null,
		mood: (l.comic?.panels[0]?.mood as Mood | undefined) ?? 'explain',
		alt:
			lang === 'ru'
				? `«${l.title}», урок ${l.order} части ${part.number} «${part.title}» курса «${webTitle('ru')}». ${ECHO.ru}.`
				: `“${l.title}”, lesson ${l.order} of part ${part.number}, “${part.title}”, of the course “${webTitle('en')}”. ${ECHO.en}.`,
		...edition(lang)
	};
}

/**
 * The web course's card. It is the card the home used to have, drawn from exactly the same text
 * under the same stem, so `og/home-<hash>.png`, which every old share names, stays where it was
 * (tests/fixtures/published-urls.txt). Do not change its text without keeping the old file.
 */
export function webCard(lang: Locale = 'ru'): OgCard {
	const n = loadContent().lessons.length;
	const lessons = `${n} ${pl(n, 'lesson.forms', lang)}`;
	return {
		stem: stem('home', lang),
		kicker: lang === 'ru' ? 'Учебник веба' : 'A textbook of the web',
		title: lang === 'ru' ? 'От первой страницы 1991 года до агентного веба' : 'From the first web page of 1991 to the agentic web',
		meta: lang === 'ru' ? `${lessons}, бесплатно и без регистрации` : `${lessons}, free, no sign-up`,
		era: 8,
		mood: 'cheer',
		alt: t('seo.web.alt', {}, lang),
		...edition(lang)
	};
}

/** The platform's card, for the catalog. */
export function catalogCard(lang: Locale = 'ru'): OgCard {
	const n = loadCourses().courses.length;
	return {
		stem: stem('catalog', lang),
		kicker: lang === 'ru' ? 'Открытые курсы NoeticEcho' : 'Open courses by NoeticEcho',
		title: lang === 'ru' ? 'Как устроен ИИ, как с ним работать и как не разучиться думать самому' : 'How AI works, how to work with it and how to keep thinking for yourself',
		meta: lang === 'ru' ? `${n} ${pl(n, 'course.forms', lang)}, бесплатно и без регистрации` : `${n} ${pl(n, 'course.forms', lang)}, free, no sign-up`,
		era: 8,
		mood: 'cheer',
		alt: t('seo.catalog.alt', {}, lang),
		...edition(lang)
	};
}

/** A planned course's card; the web course's is webCard. */
export function courseCard(c: Course, lang: Locale = 'ru'): OgCard {
	if (!isPlanned(c)) return webCard(lang);
	const { lessons } = counts(c, lang);
	return {
		stem: stem(`course-${c.id}`, lang),
		kicker: lang === 'ru' ? 'Курс платформы «Сквозь время»' : 'A course on Through Time',
		title: c.title[lang],
		meta: lang === 'ru' ? `${lessons} ${pl(lessons, 'lesson.forms', lang)} в плане, бесплатно` : `${lessons} ${pl(lessons, 'lesson.forms', lang)} planned, free`,
		era: null,
		mood: 'explain',
		alt: t('seo.course.alt', { title: c.title[lang] }, lang),
		...edition(lang)
	};
}

export function mapCard(lang: Locale = 'ru'): OgCard {
	const { lessons, curriculum } = loadContent();
	const n = `${lessons.length} ${pl(lessons.length, 'lesson.forms', lang)}`;
	return {
		stem: stem('map', lang),
		kicker: t('map.title', {}, lang),
		title: lang === 'ru' ? 'Семнадцать частей: от того, как устроен интернет, до агентного веба' : 'Seventeen parts, from how the internet works to the agentic web',
		meta: lang === 'ru' ? `${n} в ${curriculum.parts.length} частях` : `${n} in ${curriculum.parts.length} parts`,
		era: 1,
		mood: 'explain',
		alt: t('seo.map.alt', {}, lang),
		...edition(lang)
	};
}

/** Every card the build draws, by file name (routes/og serves them): both editions'. */
export function cards(): Map<string, OgCard> {
	const all: OgCard[] = [];
	for (const lang of ['ru', 'en'] as const) {
		const { lessons, curriculum } = loadEdition(lang);
		all.push(catalogCard(lang), mapCard(lang), ...loadCourses().courses.map((c) => courseCard(c, lang)), ...lessons.map((l) => lessonCard(l, curriculum.parts.find((p) => p.number === l.part)!, lang)));
	}
	return new Map(all.map((c) => [ogFile(c), c]));
}

/** What a page's head needs of its card: the file's path under the base, and its alt text. */
export const og = (card: OgCard) => ({ file: `og/${ogFile(card)}`, alt: card.alt });
export type Og = ReturnType<typeof og>;

/** When a course's own file last changed, from git, else its modification time. */
export function courseFileLastmod(id: string): string {
	const file = `content/courses/${id}.yaml`;
	try {
		const date = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8' }).trim();
		if (date) return date.slice(0, 10);
	} catch {
		// not a git checkout: the modification time below
	}
	return statSync(file).mtime.toISOString().slice(0, 10);
}

let dates: Map<string, string> | undefined;

/**
 * When each lesson file last changed, from git: one `git log` over content/, newest first, so
 * the first date a file appears under is its last change. A file git does not know (new, not
 * committed) has its modification time. The Pages build checks out the whole history
 * (`fetch-depth: 0`); a shallow clone would give every lesson the same date.
 */
export function lastmod(lessonId: string, lang: Locale = 'ru'): string {
	if (!dates) {
		dates = new Map();
		try {
			const log = execFileSync('git', ['log', '--format=%x00%cI', '--name-only', '--', 'content/ru', 'content/en'], { encoding: 'utf8', maxBuffer: 64 << 20 });
			let date = '';
			for (const line of log.split('\n')) {
				if (line.startsWith('\0')) date = line.slice(1);
				else if (line.endsWith('.svx') && !dates.has(line)) dates.set(line, date);
			}
		} catch {
			// not a git checkout: modification times below
		}
	}
	const file = `content/${lang}/${lessonId}.svx`;
	return (dates.get(file) ?? statSync(file).mtime.toISOString()).slice(0, 10);
}

/** The newest of an edition's lesson dates: its home's and its map's, whose content is the course. */
export const courseLastmod = (lang: Locale = 'ru'): string =>
	loadEdition(lang)
		.lessons.map((l) => lastmod(l.id, lang))
		.sort()
		.at(-1) ?? courseLastmod('ru');
