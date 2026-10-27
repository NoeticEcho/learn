/**
 * The structured data (schema.org, as JSON-LD): a `Course` and a `WebSite` on the home page, a
 * `LearningResource` per lesson that is part of that course, and a `BreadcrumbList` on every
 * page below home. Built from data the page already has, so it costs the page no extra data;
 * the head writes it as `<script type="application/ld+json">` (Seo.svelte).
 *
 * The course is one node with an `@id` (`<home>#course`), and each lesson's `isPartOf` names
 * that id, so a reader of the graph joins them without guessing. The field set follows
 * schema.org's types and what Google's Course and Breadcrumb documentation requires (`name`,
 * `description`, `provider`; `itemListElement` with `position`, `name`, `item`);
 * tests/unit/seo.test.ts holds every page to it.
 */
import type { LessonMeta, Part, Source } from '#lib/content/schema.ts';
import { LANG, LICENCE_URL, PUBLISHER, SITE_NAME } from './site.ts';

type Thing = Record<string, unknown>;

const publisher = { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url };
/** ISO 8601 duration: 25 → PT25M, 150 → PT2H30M. */
export const duration = (minutes: number) => {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `PT${h ? `${h}H` : ''}${m || !h ? `${m}M` : ''}`;
};

export const courseId = (homeUrl: string) => `${homeUrl}#course`;

export function course(o: { homeUrl: string; description: string; image?: string; minutes: number; parts?: Part[] }): Thing {
	return {
		'@context': 'https://schema.org',
		'@type': 'Course',
		'@id': courseId(o.homeUrl),
		name: SITE_NAME,
		description: o.description,
		url: o.homeUrl,
		...(o.image ? { image: o.image } : {}),
		inLanguage: LANG,
		educationalLevel: 'beginner',
		isAccessibleForFree: true,
		license: LICENCE_URL,
		provider: publisher,
		publisher,
		...(o.parts ? { syllabusSections: o.parts.map((p) => ({ '@type': 'Syllabus', name: p.title, description: p.summary })) } : {}),
		hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: duration(o.minutes) },
		offers: { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'RUB' }
	};
}

export function website(homeUrl: string, description: string): Thing {
	return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: homeUrl, inLanguage: LANG, description, publisher };
}

const citation = (s: Source) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, inLanguage: s.lang });

export function learningResource(o: {
	lesson: LessonMeta;
	url: string;
	homeUrl: string;
	image?: string;
	teaches: string[];
	requires?: string[];
	dateModified?: string;
}): Thing {
	const l = o.lesson;
	return {
		'@context': 'https://schema.org',
		'@type': 'LearningResource',
		'@id': `${o.url}#lesson`,
		name: l.title,
		description: l.definition,
		abstract: l.summary,
		url: o.url,
		...(o.image ? { image: o.image } : {}),
		inLanguage: LANG,
		learningResourceType: 'lesson',
		educationalLevel: 'beginner',
		isPartOf: { '@type': 'Course', '@id': courseId(o.homeUrl), name: SITE_NAME, url: o.homeUrl },
		teaches: o.teaches,
		...(o.requires?.length ? { competencyRequired: o.requires } : {}),
		timeRequired: duration(l.minutes),
		isAccessibleForFree: true,
		license: LICENCE_URL,
		...(o.dateModified ? { dateModified: o.dateModified } : {}),
		author: publisher,
		publisher,
		citation: l.sources.map(citation)
	};
}

/** The trail from home; the last item is the page itself and carries no link. */
export function breadcrumbs(items: { name: string; url?: string }[]): Thing {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.url ? { item: it.url } : {}) }))
	};
}

/** JSON for inside a `<script>`: a `<` is escaped, so no text in it can close the element. */
export const ldJson = (data: Thing) => JSON.stringify(data).replace(/</g, '\\u003c');
