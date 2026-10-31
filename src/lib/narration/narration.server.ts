/**
 * Narration at build time: each lesson's script (script.ts), each section's hash, and the audio
 * the manifest says exists for it (docs/narration.md).
 *
 * A section's hash covers what is said and who says it: the sentences, the voice, and the
 * script's version. So a lesson whose text changes keeps the audio of every section it did not
 * change, and a section whose words changed has no audio until it is rendered again. A lesson is
 * offered to listen to only when every one of its sections has audio of its current text: half a
 * lesson read aloud, or a voice saying words the page no longer has, is worse than none.
 */
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import type { Locale } from '#lib/i18n/index.ts';
import type { LessonMeta } from '#lib/content/schema.ts';
import type { Narration } from './types.ts';
import { narrate, speak, type Lexicon, type Section } from './script.ts';
import lexiconRu from '../../../content/narration/ru.yaml?raw';
import lexiconEn from '../../../content/narration/en.yaml?raw';
import manifestRu from '../../../content/narration/ru.json';

/** Bumped when the script's rules change in a way that should re-render everything. */
export const SCRIPT_VERSION = 1;
export const VOICE = { model: 'Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice', speaker: 'serena', language: 'Russian' } as const;

/**
 * The voice of an edition. Russian's is `VOICE` exactly: a section's hash covers it, so the files of the
 * published edition stay what they are. The English edition has no voice chosen yet: `serena` and the
 * model's English-native presets (`ryan`, `aiden`) are samples, and a speaker is part of the hash, so
 * a sample is never taken for the edition's audio.
 */
export function voiceFor(lang: Locale, speaker?: string): Record<string, string> {
	return lang === 'ru' ? { ...VOICE } : { model: VOICE.model, speaker: speaker ?? 'serena', language: 'English' };
}

export type ManifestSection = { key: string; hash: string; file: string; duration: number; starts?: number[] };
export type Manifest = {
	version: number;
	voice: typeof VOICE | Record<string, string>;
	/** Where the files are served from, relative to the site's origin. */
	base: string;
	lessons: Record<string, { sections: ManifestSection[] }>;
};

export type { Narration };

export type HashedSection = Section & { hash: string };

const sources: Record<Locale, Record<string, string>> = {
	ru: import.meta.glob<string>('/content/ru/**/*.svx', { query: '?raw', import: 'default', eager: true }),
	en: import.meta.glob<string>('/content/en/**/*.svx', { query: '?raw', import: 'default', eager: true })
};
const lexicons: Partial<Record<Locale, Lexicon>> = { ru: parse(lexiconRu) as Lexicon, en: parse(lexiconEn) as Lexicon };
const manifests: Partial<Record<Locale, Manifest>> = { ru: manifestRu as Manifest };

export function sectionHash(sentences: string[], voice: Record<string, string> = VOICE): string {
	const h = createHash('sha256');
	h.update(JSON.stringify({ v: SCRIPT_VERSION, voice, sentences }));
	return h.digest('hex').slice(0, 16);
}

/** The lesson's script with each section's hash, or null when the edition is not narrated. */
export function script(lesson: Pick<LessonMeta, 'id' | 'title' | 'summary' | 'definition' | 'say'>, lang: Locale, speaker?: string): HashedSection[] | null {
	const lex = lexicons[lang];
	const source = sources[lang][`/content/${lang}/${lesson.id}.svx`];
	if (!lex || !source) return null;
	const voice = lang === 'ru' ? VOICE : voiceFor(lang, speaker);
	return narrate(source, lesson, lex, lang).map((s) => ({ ...s, hash: sectionHash(s.sentences, voice) }));
}

/** Any text in the spoken form the lesson's narration uses: how the WER check reads Whisper. */
export function spoken(text: string, lesson: Pick<LessonMeta, 'say'>, lang: Locale): string {
	const lex = lexicons[lang];
	return lex ? speak(text, lex, lesson.say ?? {}, lang) : text;
}

/**
 * What Whisper heard, with the maps' written forms found however it spelt them («content type»,
 * «certbot», «Let's encrypt»), then in spoken form. For measuring only: it changes no audio.
 */
export function heardAs(text: string, lesson: Pick<LessonMeta, 'say'>, lang: Locale): string {
	const lex = lexicons[lang];
	if (!lex) return text;
	const say = lesson.say ?? {};
	const map = { ...lex.words, ...say };
	const keys = Object.keys(map)
		.filter((k) => /\p{Script=Latin}/u.test(k) && k.length > 2)
		.sort((a, b) => b.length - a.length);
	const esc = (k: string) => k.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&').replace(/[-\s]+/g, '[-\\s]?');
	const rx = new RegExp(`(?<![\\p{L}\\p{N}])(?:${keys.map(esc).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
	const norm = (s: string) => s.toLowerCase().replace(/[-\s]+/g, '');
	const byNorm = new Map(keys.map((k) => [norm(k), map[k]]));
	return speak(text.replace(rx, (m) => byNorm.get(norm(m)) ?? m), lex, say, lang);
}

/**
 * Every word the maps can put in a sentence: Whisper writes these in Latin, so the renderer's ear skips them.
 * In English the spoken form and the written one are both Latin («jason» was said, «JSON» is heard), so the
 * written forms are skipped as well.
 */
export function mappedWords(lessons: Pick<LessonMeta, 'say'>[], lang: Locale): string[] {
	const lex = lexicons[lang];
	const maps = [lex?.words ?? {}, ...lessons.map((l) => l.say ?? {})];
	const values = [...Object.values(lex?.letters ?? {}), ...maps.flatMap((m) => Object.values(m))];
	if (lang === 'en') {
		const keys = [...Object.keys(lex?.letters ?? {}), ...maps.flatMap((m) => Object.keys(m))];
		return [...new Set([...values, ...keys].flatMap((v) => v.toLowerCase().split(/[^a-z]+/).filter(Boolean)))].sort();
	}
	return [...new Set(values.flatMap((v) => v.toLowerCase().replace(/ё/g, 'е').split(/[^а-я]+/).filter(Boolean)))].sort();
}

export function manifest(lang: Locale): Manifest | null {
	return manifests[lang] ?? null;
}

/** The lesson's audio, when every section of its current text has some; otherwise null. */
export function narration(lesson: Pick<LessonMeta, 'id' | 'title' | 'summary' | 'definition' | 'say'>, lang: Locale): Narration | null {
	const m = manifests[lang];
	const sections = script(lesson, lang);
	return m && sections ? match(lesson.id, sections, m) : null;
}

/** The manifest's audio for these sections, matched by hash; null unless every section has some. */
export function match(id: string, sections: HashedSection[], m: Manifest): Narration | null {
	const byHash = new Map((m.lessons[id]?.sections ?? []).map((s) => [s.hash, s]));
	const out: Narration['sections'] = [];
	for (const s of sections) {
		const audio = byHash.get(s.hash);
		if (!audio) return null;
		out.push({ key: s.key, heading: s.heading, file: audio.file, duration: audio.duration });
	}
	return out.length ? { base: m.base, sections: out, duration: Math.round(out.reduce((a, s) => a + s.duration, 0)) } : null;
}
