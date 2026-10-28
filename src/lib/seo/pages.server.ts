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
import { ogFile, type Mood, type OgCard } from './og.server.ts';

const ECHO: Record<Locale, string> = {
	ru: 'Эхо, проводник курса, в капюшоне, с кольцом эпох',
	en: 'Echo, the course’s guide, in a hood, with a ring of eras'
};
// Russian cards keep the names they had before there were editions; English ones are prefixed.
const stem = (s: string, l: Locale) => (l === 'ru' ? s : `${l}-${s}`);
const edition = (l: Locale) => (l === 'ru' ? {} : { lang: l });

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
				? `«${l.title}», урок ${l.order} части ${part.number} «${part.title}» учебника «${t('app.title', {}, lang)}». ${ECHO.ru}.`
				: `“${l.title}”, lesson ${l.order} of part ${part.number}, “${part.title}”, of the textbook “${t('app.title', {}, lang)}”. ${ECHO.en}.`,
		...edition(lang)
	};
}

export function homeCard(lang: Locale = 'ru'): OgCard {
	const n = loadContent().lessons.length;
	const lessons = `${n} ${pl(n, 'lesson.forms', lang)}`;
	return {
		stem: stem('home', lang),
		kicker: lang === 'ru' ? 'Учебник веба' : 'A textbook of the web',
		title: lang === 'ru' ? 'От первой страницы 1991 года до агентного веба' : 'From the first web page of 1991 to the agentic web',
		meta: lang === 'ru' ? `${lessons}, бесплатно и без регистрации` : `${lessons}, free, no sign-up`,
		era: 8,
		mood: 'cheer',
		alt: t('seo.home.alt', {}, lang),
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
		all.push(homeCard(lang), mapCard(lang), ...lessons.map((l) => lessonCard(l, curriculum.parts.find((p) => p.number === l.part)!, lang)));
	}
	return new Map(all.map((c) => [ogFile(c), c]));
}

/** What a page's head needs of its card: the file's path under the base, and its alt text. */
export const og = (card: OgCard) => ({ file: `og/${ogFile(card)}`, alt: card.alt });
export type Og = ReturnType<typeof og>;

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
