// The English edition's player (docs/narration.md): the same player, in English, on the page's own
// /learn/en/ routes. The audio is not part of this build, so it is answered with the same fixture as
// the Russian spec's. A lesson whose English audio is not rendered yet offers no button.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('content/narration/en.json', 'utf8')) as { lessons: Record<string, { sections: unknown[] }> };
const fixture = readFileSync('tests/fixtures/narration.opus');
const candidates = Object.keys(manifest.lessons).sort();
const lessons = readdirSync('content/en', { recursive: true, encoding: 'utf8' })
	.filter((f) => f.endsWith('.svx'))
	.map((f) => f.replace(/\.svx$/, ''))
	.sort();

async function audioRoute(page: Page) {
	const asked: string[] = [];
	await page.route('**/learn-audio/**', (route) => {
		asked.push(new URL(route.request().url()).pathname);
		return route.fulfill({ status: 200, body: fixture, contentType: 'audio/ogg', headers: { 'accept-ranges': 'none' } });
	});
	return asked;
}

test.describe('narration (English)', () => {
	test('plays, in English, from the English files', async ({ page }) => {
		test.skip(!candidates.length, 'the English manifest narrates no lesson yet');
		const asked = await audioRoute(page);
		let id = '';
		for (const c of candidates) {
			await page.goto(`./en/lesson/${c}/`);
			if (await page.locator('[data-narration]').count()) {
				id = c;
				break;
			}
		}
		expect(id, 'no English lesson offers «Listen»: render the narration or check the manifest').not.toBe('');
		await expect(page.getByText('Read by speech synthesis (Qwen3-TTS); the voice is not a person’s.')).toBeVisible();
		await page.getByRole('button', { name: /^Listen/ }).click();
		const player = page.getByRole('region', { name: 'Lesson audio' });
		await expect(player).toBeVisible();
		await expect(player.getByText(/^Section 1 of \d+$/)).toBeVisible();
		await expect.poll(() => asked.length).toBeGreaterThan(0);
		expect(asked[0]).toMatch(new RegExp(`^/learn-audio/en/${id}/intro-[0-9a-f]{16}\\.opus$`));
		await player.getByRole('button', { name: 'Next section' }).click();
		await expect(player.getByText(/^Section 2 of \d+$/)).toBeVisible();
		await page.getByRole('button', { name: 'Close the audio' }).click();
		await expect(page.getByRole('region', { name: 'Lesson audio' })).toHaveCount(0);
	});

	test('a lesson without English audio offers none', async ({ page }) => {
		const bare = lessons.find((l) => !candidates.includes(l));
		test.skip(!bare, 'every English lesson has audio');
		await page.goto(`./en/lesson/${bare}/`);
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('[data-narration]')).toHaveCount(0);
	});
});
