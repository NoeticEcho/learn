/**
 * Runs checks against some code in a hidden sandboxed frame, for the quiz's code questions.
 * The same sandbox as the practice preview: `allow-scripts`, no `allow-same-origin`, the CSP of
 * sandbox.ts, and a result trusted only by its source window.
 */
import { buildSrcdoc } from './sandbox.ts';
import type { Check, CheckResult } from './checks.ts';
import type { PracticeFiles } from '#lib/content/schema.ts';

export function runChecks(
	files: Partial<PracticeFiles> & { 'index.html': string },
	checks: Check[],
	persona: Record<string, unknown> = {},
	timeoutMs = 4000
): Promise<CheckResult[]> {
	return new Promise((resolve) => {
		const frame = document.createElement('iframe');
		frame.setAttribute('sandbox', 'allow-scripts');
		frame.setAttribute('aria-hidden', 'true');
		frame.tabIndex = -1;
		frame.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0';
		const finish = (r: CheckResult[]) => {
			clearTimeout(timer);
			removeEventListener('message', onMessage);
			frame.remove();
			resolve(r);
		};
		const onMessage = (e: MessageEvent) => {
			if (e.source !== frame.contentWindow) return;
			if (e.data?.type === 'learn:checks' && Array.isArray(e.data.results)) finish(e.data.results);
		};
		const timer = setTimeout(() => finish(checks.map((c) => ({ id: c.id, ok: false, detail: 'timeout' }))), timeoutMs);
		addEventListener('message', onMessage);
		frame.srcdoc = buildSrcdoc(files, checks, persona);
		document.body.append(frame);
	});
}
