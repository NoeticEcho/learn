// The English edition's narration (docs/narration.md, «English»): the same script, in its own words and
// numbers. There is no English audio and no manifest; these tests keep the script honest, and the Russian
// one unchanged (narration.test.ts is the Russian edition's).
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { cardinalEn, ordinalEn, speakDatesEn, speakNumbersEn, speakPercentsEn, speakYearsEn, yearEn } from '#lib/narration/numbers.en.ts';
import { narrate, plain, speak, speakHex, type Lexicon } from '#lib/narration/script.ts';
import { manifest, mappedWords, narration, script, sectionHash, VOICE, voiceFor } from '#lib/narration/narration.server.ts';
import { loadEdition } from '#lib/content/load.ts';

const lex = parse(readFileSync('content/narration/en.yaml', 'utf8')) as Lexicon;
const en = (s: string, say: Record<string, string> = {}) => speak(s, lex, say, 'en');

describe('English numbers', () => {
	test('cardinals and ordinals', () => {
		expect(cardinalEn(0)).toBe('zero');
		expect(cardinalEn(105)).toBe('one hundred five');
		expect(cardinalEn(2048)).toBe('two thousand forty-eight');
		expect(cardinalEn(65535)).toBe('sixty-five thousand five hundred thirty-five');
		expect(cardinalEn(1_000_000)).toBe('one million');
		expect(cardinalEn(4_294_967_296)).toBe('four billion two hundred ninety-four million nine hundred sixty-seven thousand two hundred ninety-six');
		expect(ordinalEn(1)).toBe('first');
		expect(ordinalEn(27)).toBe('twenty-seventh');
		expect(ordinalEn(20)).toBe('twentieth');
		expect(ordinalEn(100)).toBe('one hundredth');
		expect(ordinalEn(101)).toBe('one hundred first');
	});
	test('a year is read in pairs', () => {
		expect(yearEn(1995)).toBe('nineteen ninety-five');
		expect(yearEn(1905)).toBe('nineteen oh five');
		expect(yearEn(1900)).toBe('nineteen hundred');
		expect(yearEn(2000)).toBe('two thousand');
		expect(yearEn(2001)).toBe('two thousand one');
		expect(yearEn(2010)).toBe('twenty ten');
		expect(yearEn(2026)).toBe('twenty twenty-six');
	});
	test('a year needs a reason to be one', () => {
		expect(speakYearsEn('In 1995 the web grew')).toBe('In nineteen ninety-five the web grew');
		expect(speakYearsEn('since 2004, by 2010')).toBe('since two thousand four, by twenty ten');
		expect(speakYearsEn('the 1990s and the 2010s')).toBe('the nineteen nineties and the twenty tens');
		expect(speakYearsEn('from 1995–2001')).toBe('from nineteen ninety-five to two thousand one');
		expect(speakYearsEn('Mosaic (1993) was first')).toBe('Mosaic (nineteen ninety-three) was first');
		expect(speakYearsEn('1991: the first site')).toBe('nineteen ninety-one: the first site');
		expect(speakYearsEn('What was wrong with 1996')).toBe('What was wrong with nineteen ninety-six');
		// not a year
		expect(speakYearsEn('a width of 1500 pixels')).toBe('a width of 1500 pixels');
		expect(speakYearsEn('in 2048 pixels')).toBe('in 2048 pixels');
		expect(speakYearsEn('$1995')).toBe('$1995');
	});
	test('a date has its day as an ordinal', () => {
		expect(speakDatesEn('on October 27, 2026')).toBe('on October twenty-seventh, twenty twenty-six');
		expect(speakDatesEn('on 27 October 2026')).toBe('on the twenty-seventh of October, twenty twenty-six');
		expect(speakDatesEn('written 2026-10-27')).toBe('written October twenty-seventh, twenty twenty-six');
		expect(speakDatesEn('in October 2026')).toBe('in October twenty twenty-six');
		expect(speakDatesEn('May 3rd')).toBe('May third');
		expect(speakDatesEn('March 40')).toBe('March 40');
	});
	test('a decimal is read digit by digit, a version part by part', () => {
		expect(speakNumbersEn('4.5')).toBe('four point five');
		expect(speakNumbersEn('0.07')).toBe('zero point zero seven');
		expect(speakNumbersEn('line-height: 1.55')).toBe('line-height: one point five five');
		expect(speakNumbersEn('WCAG 2.2')).toBe('WCAG two point two');
		expect(speakNumbersEn('criterion 1.4.3')).toBe('criterion one point four point three');
		expect(speakNumbersEn('address 8.8.8.8')).toBe('address eight point eight point eight point eight');
	});
	test('ranges, ratios, thousands, money, percents', () => {
		expect(speakNumbersEn('45–75 characters')).toBe('forty-five to seventy-five characters');
		expect(speakNumbersEn('4.5:1 for body text')).toBe('four point five to one for body text');
		expect(speakNumbersEn('7,600 people, 1,000,000 rows')).toBe('seven thousand six hundred people, one million rows');
		expect(speakNumbersEn('$5 and $1 and €20')).toBe('five dollars and one dollar and twenty euros');
		expect(speakNumbersEn('$10 million a year')).toBe('ten million dollars a year');
		expect(speakNumbersEn('the 3rd and 21st')).toBe('the third and twenty-first');
		expect(speakNumbersEn('port 443')).toBe('port four hundred forty-three');
		expect(speakPercentsEn('90% and 4.5%')).toBe('90 percent and 4.5 percent');
	});
});

describe('English speaking', () => {
	test('an unmapped acronym is spelt with the names of its letters, a mapped one as it is mapped', () => {
		expect(en('HTML and CSS')).toBe('aitch tee em el and see ess ess');
		expect(en('The JSON format')).toBe('The Jason format');
		expect(en('Press OK')).toBe('Press okay');
		expect(en('a POST request, SELECT and NASA')).toBe('a POST request, SELECT and NASA');
		expect(en('the lesson’s map wins: DNS', { DNS: 'D N S' })).toBe('the lesson’s map wins: D N S');
	});
	test('a domain, an address and a version', () => {
		expect(en('Visit example.com today')).toBe('Visit example dot com today');
		expect(en('write to name@example.org')).toBe('write to name at example dot org');
		expect(en('HTTP/1.1 and GPT-4.5')).toBe('aitch tee tee pee one point one and gee pee tee four point five');
		expect(en('license v3.0')).toBe('license version three point zero');
	});
	test('units, keys, signs', () => {
		expect(en('a 16px gap and 200ms')).toBe('a sixteen pixels gap and two hundred milliseconds');
		expect(en('Press F12')).toBe('Press eff twelve');
		expect(en('A01 Broken Access Control')).toBe('ay zero one Broken Access Control');
		expect(en('N ≈ 16 × x ÷ d²')).toBe('N is about sixteen by x divided by d squared');
		expect(en('Code § 22')).toBe('Code section twenty-two');
	});
	test('a hex colour', () => {
		expect(speakHex('colour #0b5cad', lex.letters, 'en')).toBe('colour hash zero bee five see ay dee');
		expect(speakHex('#fff', lex.letters, 'en')).toBe('hash eff eff eff');
	});
	test('inline code is read as its words', () => {
		expect(plain('attribute `rel="noopener"`', 'en')).toBe('attribute rel equals noopener');
		expect(plain('the `</p>` tag', 'en')).toBe('the closing p tag');
	});
});

const SOURCE = `<script module>
	export const metadata = { id: 'x' };
</script>

## Why you need it

The first paragraph is about **DNS** and [a link](https://example.com/), long enough to stand alone as a sentence.

\`\`\`html
<p>code is not read</p>
\`\`\`

<details>
<summary>Check yourself: why is this all here?</summary>

Because that is how the web works, and the answer is read aloud too.

</details>

| Tone | What it feels like |
|---|---|
| Formal | focus, trust |

## Practice

The task of the practice is not read: it is on the page, beside the editor.

## What was wrong with 2010

The last section of the lesson that is read, like all the other sections in it.
`;

describe('the English script', () => {
	const lesson = { title: 'A lesson', summary: 'Why this lesson is needed, in one sentence for a person.', definition: 'A lesson is an example for a test, with a definition.' };
	const s = narrate(SOURCE, lesson, lex, 'en');
	test('sections: the practice is skipped, code and a table have their own words', () => {
		expect(s.map((x) => x.key)).toEqual(['intro', '1', '3']);
		const all = s.flatMap((x) => x.sentences).join(' | ');
		expect(all).toContain('Code example.');
		expect(all).toContain('Answer: Because that is how the web works');
		expect(all).toContain('Formal: what it feels like: focus, trust.');
		expect(all).not.toContain('beside the editor');
		expect(all).toContain('about dee en ess and a link');
	});
	test('the heading is an utterance of its own and numbers in it are spoken', () => {
		const last = s.at(-1)!;
		expect(last.heading).toBe('What was wrong with 2010');
		expect(last.sentences[0]).toBe('What was wrong with twenty ten.');
	});
});

describe('the English edition is a sample, not an edition', () => {
	const lessons = loadEdition('en').lessons;
	test('every English lesson has a script, and no digit run or object is left in it', () => {
		expect(lessons.length).toBeGreaterThan(100);
		for (const l of lessons) {
			const sections = script(l, 'en');
			expect(sections, l.id).not.toBeNull();
			for (const sec of sections!)
				for (const t of sec.sentences) {
					expect(t, `${l.id}#${sec.key}`).not.toMatch(/\[object|\d{3,}/);
					expect(t.length).toBeGreaterThan(0);
				}
		}
	});
	test('a speaker is part of the hash: a sample is never taken for an edition’s audio', () => {
		const l = lessons[0];
		const serena = script(l, 'en', 'serena')!;
		const ryan = script(l, 'en', 'ryan')!;
		expect(serena[0].sentences).toEqual(ryan[0].sentences);
		expect(serena[0].hash).not.toBe(ryan[0].hash);
		expect(serena[0].hash).toBe(sectionHash(serena[0].sentences, voiceFor('en', 'serena')));
		expect(voiceFor('en', 'ryan')).toEqual({ model: VOICE.model, speaker: 'ryan', language: 'English' });
	});
	test('the Russian voice, and so every Russian hash, is what it was', () => {
		expect(voiceFor('ru')).toEqual({ ...VOICE });
		expect(sectionHash(['x'])).toBe(sectionHash(['x'], VOICE));
		expect(voiceFor('ru').language).toBe('Russian');
	});
	test('no manifest, so no «Listen» on the English site', () => {
		expect(manifest('en')).toBeNull();
		expect(narration(lessons[0], 'en')).toBeNull();
	});
	test('the renderer’s ear skips the words Whisper writes in capitals', () => {
		const ignored = mappedWords(lessons, 'en');
		expect(ignored).toContain('jason');
		expect(ignored).toContain('json');
		expect(ignored).toContain('aitch');
	});
});
