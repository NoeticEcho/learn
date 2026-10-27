/**
 * CodeMirror 6, set up in NoeticEcho's tokens. Imported dynamically by Editor.svelte, so the
 * editor costs nothing until a practice step is on screen (spec §6: CodeMirror is lazy).
 */
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

export type Lang = 'html' | 'css' | 'js';

const theme = EditorView.theme({
	'&': {
		color: 'var(--text-primary)',
		backgroundColor: 'var(--surface-inset)',
		fontSize: 'var(--text-body-sm)',
		height: '100%'
	},
	'.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
	'.cm-content': { caretColor: 'var(--brass-300)', padding: 'var(--space-3) 0' },
	'.cm-gutters': {
		backgroundColor: 'transparent',
		color: 'var(--text-muted)',
		border: 'none',
		borderRight: '1px solid var(--border-hairline)'
	},
	'.cm-activeLine': { backgroundColor: 'rgba(201, 166, 107, 0.06)' },
	'.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text-secondary)' },
	'&.cm-focused': { outline: '2px solid var(--border-focus)', outlineOffset: '-2px' },
	'.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
		backgroundColor: 'rgba(201, 166, 107, 0.28) !important'
	},
	'.cm-cursor': { borderLeftColor: 'var(--brass-300)' },
	'.cm-matchingBracket': { backgroundColor: 'rgba(143, 183, 214, 0.18)', outline: 'none' }
});

const highlight = HighlightStyle.define([
	{ tag: [tags.tagName, tags.keyword], color: 'var(--brass-300)' },
	{ tag: [tags.attributeName, tags.propertyName], color: 'var(--echo-400)' },
	{ tag: [tags.string, tags.attributeValue], color: 'var(--accent-state-text)' },
	{ tag: [tags.number, tags.bool, tags.atom], color: 'var(--saffron)' },
	{ tag: [tags.comment], color: 'var(--text-muted)', fontStyle: 'italic' },
	{ tag: [tags.angleBracket, tags.punctuation, tags.bracket], color: 'var(--text-secondary)' },
	{ tag: [tags.function(tags.variableName), tags.className], color: 'var(--paper-100)' },
	{ tag: tags.invalid, color: 'var(--accent-command-text)' }
]);

const language = (l: Lang) => (l === 'html' ? html() : l === 'css' ? css() : javascript());

export function createEditor(opts: {
	parent: HTMLElement;
	doc: string;
	lang: Lang;
	label: string;
	readonly?: boolean;
	onchange?: (text: string) => void;
}): EditorView {
	return new EditorView({
		parent: opts.parent,
		state: EditorState.create({
			doc: opts.doc,
			extensions: [
				lineNumbers(),
				history(),
				drawSelection(),
				highlightActiveLine(),
				indentOnInput(),
				bracketMatching(),
				keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
				language(opts.lang),
				syntaxHighlighting(highlight),
				theme,
				EditorView.lineWrapping,
				EditorState.readOnly.of(!!opts.readonly),
				EditorView.contentAttributes.of({ 'aria-label': opts.label }),
				EditorView.updateListener.of((u) => {
					if (u.docChanged) opts.onchange?.(u.state.doc.toString());
				})
			]
		})
	});
}

export function replace(view: EditorView, text: string): void {
	view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
}
