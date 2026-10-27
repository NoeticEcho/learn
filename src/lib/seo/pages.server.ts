/**
 * What the build knows about each indexable page that a page's own data does not carry: its
 * Open Graph card and when its content last changed. Build-time only.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { loadContent } from '#lib/content/load.ts';
import type { LessonMeta, Part } from '#lib/content/schema.ts';
import { pl, t } from '#lib/i18n/index.ts';
import { ogFile, type Mood, type OgCard } from './og.server.ts';

const ECHO = 'Эхо, проводник курса, в капюшоне, с кольцом эпох';

export function lessonCard(l: LessonMeta, part: Part): OgCard {
	const kicker = `${t('map.part', { n: part.number })}. ${part.title}`;
	return {
		stem: `lesson-${l.id.replace('/', '-')}`,
		kicker,
		title: l.title,
		meta: `Урок ${l.order}, ${l.minutes} ${pl(l.minutes, 'minute.forms')}`,
		era: l.practice?.era ?? part.era ?? null,
		mood: (l.comic?.panels[0]?.mood as Mood | undefined) ?? 'explain',
		alt: `«${l.title}», урок ${l.order} части ${part.number} «${part.title}» учебника «${t('app.title')}». ${ECHO}.`
	};
}

export function homeCard(): OgCard {
	const n = loadContent().lessons.length;
	return {
		stem: 'home',
		kicker: 'Учебник веба',
		title: 'От первой страницы 1991 года до агентного веба',
		meta: `${n} ${pl(n, 'lesson.forms')}, бесплатно и без регистрации`,
		era: 8,
		mood: 'cheer',
		alt: t('seo.home.alt')
	};
}

export function mapCard(): OgCard {
	const { lessons, curriculum } = loadContent();
	return {
		stem: 'map',
		kicker: t('map.title'),
		title: 'Семнадцать частей: от того, как устроен интернет, до агентного веба',
		meta: `${lessons.length} ${pl(lessons.length, 'lesson.forms')} в ${curriculum.parts.length} частях`,
		era: 1,
		mood: 'explain',
		alt: t('seo.map.alt')
	};
}

/** Every card the build draws, by file name (routes/og serves them). */
export function cards(): Map<string, OgCard> {
	const { lessons, curriculum } = loadContent();
	const all = [homeCard(), mapCard(), ...lessons.map((l) => lessonCard(l, curriculum.parts.find((p) => p.number === l.part)!))];
	return new Map(all.map((c) => [ogFile(c), c]));
}

/** What a page's head needs of its card: the file's path under the base, and its alt text. */
export const og = (card: OgCard) => ({ file: `og/${ogFile(card)}`, alt: card.alt });
export type Og = ReturnType<typeof og>;

let dates: Map<string, string> | undefined;

/**
 * When each lesson file last changed, from git: one `git log` over content/ru, newest first, so
 * the first date a file appears under is its last change. A file git does not know (new, not
 * committed) has its modification time. The Pages build checks out the whole history
 * (`fetch-depth: 0`); a shallow clone would give every lesson the same date.
 */
export function lastmod(lessonId: string): string {
	if (!dates) {
		dates = new Map();
		try {
			const log = execFileSync('git', ['log', '--format=%x00%cI', '--name-only', '--', 'content/ru'], { encoding: 'utf8', maxBuffer: 64 << 20 });
			let date = '';
			for (const line of log.split('\n')) {
				if (line.startsWith('\0')) date = line.slice(1);
				else if (line.endsWith('.svx') && !dates.has(line)) dates.set(line, date);
			}
		} catch {
			// not a git checkout: modification times below
		}
	}
	const file = `content/ru/${lessonId}.svx`;
	return (dates.get(file) ?? statSync(file).mtime.toISOString()).slice(0, 10);
}

/** The newest of the lessons' dates: the home's and the map's, whose content is the course. */
export const courseLastmod = () =>
	loadContent()
		.lessons.map((l) => lastmod(l.id))
		.sort()
		.at(-1)!;
