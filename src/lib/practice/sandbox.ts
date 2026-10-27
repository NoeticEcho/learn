/**
 * Builds the preview's document (spec §4.4): the person's HTML, CSS and JS, a CSP that blocks
 * the network, and a runner that evaluates the step's checks and posts the results to the app.
 *
 * The iframe that shows it is `sandbox="allow-scripts"` with no `allow-same-origin`, so the page
 * runs in an opaque origin: it cannot read the app, its storage or the person's key. The CSP
 * comes first in <head>, before anything the person wrote, so even an <img> they put at the top
 * cannot reach the network. The app's own CSP (app.html) also applies here, because a srcdoc
 * document inherits it; its frame-src keeps the frame from navigating away to another site.
 */
import { evaluate, type Check } from './checks.ts';
import type { PracticeFiles } from '#lib/content/schema.ts';

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
		`<meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}">`,
		`<script>(function(){var r=${report};addEventListener('error',function(e){r(e.message)});addEventListener('unhandledrejection',function(e){r(e.reason&&e.reason.message||e.reason)})})();</script>`,
		css ? `<style>${raw(css, 'style')}</style>` : '',
		html,
		js ? `<script>try{${raw(js, 'script')}\n}catch(e){(${report})(e&&e.message||e)}</script>` : '',
		`<script>(function(){var evaluate=(${evaluate.toString()});var checks=${json(checks)};var persona=${json(persona)};` +
			`function run(){var results;try{results=evaluate(document,window,checks,persona)}catch(e){(${report})(e&&e.message||e);return}` +
			`parent.postMessage({type:'learn:checks',results:results},'*')}` +
			`if(document.readyState==='complete')run();else addEventListener('load',run)})();</script>`
	].join('\n');
}
