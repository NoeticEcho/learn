import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['./', './map/', './lesson/02-html/01-first-page/', './lesson/00-start/01-how-to-learn/', './lesson/00-start/04-brief/', './review/', './gallery/', './settings/'];

for (const scheme of ['dark', 'light'] as const)
	for (const route of routes)
		test(`${route} has no serious accessibility problems (${scheme})`, async ({ page }) => {
			await page.emulateMedia({ colorScheme: scheme });
			await page.goto(route);
			await page.waitForLoadState('networkidle');
			const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
			const bad = result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
			expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
		});
