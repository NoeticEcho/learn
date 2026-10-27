/**
 * Builds the preview's document (spec §4.4): the person's HTML, CSS and JS, a CSP that blocks
 * the network, and a runner that evaluates the step's checks and posts the results to the app.
 *
 * The iframe that shows it is `sandbox="allow-scripts"` with no `allow-same-origin`, so the page
 * runs in an opaque origin: it cannot read the app, its storage or the person's key. The CSP
 * comes first in <head>, before anything the person wrote, so even an <img> they put at the top
 * cannot reach the network. The app's own CSP (app.html) also applies here, because a srcdoc
 * document inherits it; its frame-src keeps the frame from navigating away to another site.
 *
 * Every element this file adds (the CSP, the error reporter, the person's styles.css and
 * script.js, the check runner) carries `data-learn-sandbox`, and the checks skip such elements:
 * a check sees the page the person wrote in index.html, so `noTag` with `script` or `style`, or
 * a count of `meta`, is not failed by the sandbox's own parts.
 */
import { evaluate, facts, type Check } from './checks.ts';
import type { PracticeFiles } from '#lib/content/schema.ts';

/** The marker on what the sandbox adds; `checks.ts` spells the same literal, since it cannot import. */
export const SANDBOX_MARK = 'data-learn-sandbox';

export const SANDBOX_CSP =
	"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:";

export type SandboxMessage =
	| { type: 'learn:checks'; results: { id: string; ok: boolean; detail?: string }[] }
	| { type: 'learn:error'; message: string };

/** JSON safe inside a <script>: no `</script>`, no `<!--`. */
const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');
/** Text safe inside a raw-text element. */
const raw = (s: string, tag: 'script' | 'style') => s.replace(new RegExp(`</(${tag})`, 'gi'), '<\\/$1');

const report = `function(m){try{parent.postMessage({type:'learn:error',message:String(m)},'*')}catch(_){}}`;

export function buildSrcdoc(
	files: Partial<PracticeFiles> & { 'index.html': string },
	checks: Check[],
	persona: Record<string, unknown>
): string {
	// The person's doctype goes; ours is first, so their page is never in quirks mode.
	const html = files['index.html'].replace(/^\s*<!doctype[^>]*>/i, '');
	const css = files['styles.css'] ?? '';
	const js = files['script.js'] ?? '';
	return [
		'<!doctype html>',
		`<meta ${SANDBOX_MARK} http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}">`,
		`<script ${SANDBOX_MARK}>(function(){var r=${report};addEventListener('error',function(e){r(e.message)});addEventListener('unhandledrejection',function(e){r(e.reason&&e.reason.message||e.reason)})})();</script>`,
		css ? `<style ${SANDBOX_MARK}>${raw(css, 'style')}</style>` : '',
		html,
		js ? `<script ${SANDBOX_MARK}>try{${raw(js, 'script')}\n}catch(e){(${report})(e&&e.message||e)}</script>` : '',
		`<script ${SANDBOX_MARK}>(function(){var evaluate=(${evaluate.toString()});var checks=${json(checks)};var facts=${json(facts(checks, persona))};` +
			`function run(){var results;try{results=evaluate(document,window,checks,facts)}catch(e){(${report})(e&&e.message||e);return}` +
			`parent.postMessage({type:'learn:checks',results:results},'*')}` +
			`if(document.readyState==='complete')run();else addEventListener('load',run)})();</script>`
	].join('\n');
}
