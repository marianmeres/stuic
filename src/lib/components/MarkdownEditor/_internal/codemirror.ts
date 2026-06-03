/**
 * Raw markdown source backend, built on CodeMirror 6.
 *
 * This module statically imports all `@codemirror/*` packages — that is fine
 * because `MarkdownEditor.svelte` only ever reaches it via a dynamic
 * `import()` inside a client-only `$effect`, so the code is both code-split and
 * never evaluated during SSR. CodeMirror ships no CSS file; all theming is done
 * here via `EditorView.theme` plus `[data-size]` rules in the component's
 * `index.css`.
 */
import { defaultKeymap, history, historyKeymap, redo, undo } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import type { EditorHandle, MountOptions, PromptFn } from "./types.js";

/** Theme that inherits STUIC look via CSS vars rather than hard-coded values. */
const stuicTheme = EditorView.theme({
	"&": {
		fontSize: "var(--stuic-markdown-editor-font-size, 0.9375rem)",
		color: "inherit",
		backgroundColor: "transparent",
	},
	".cm-content": {
		fontFamily:
			"var(--stuic-markdown-editor-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
		padding: "0",
		caretColor: "currentColor",
	},
	"&.cm-focused": { outline: "none" },
	".cm-line": { padding: "0" },
	".cm-gutters": { display: "none" },
	".cm-scroller": { fontFamily: "inherit", lineHeight: "1.6" },
	".cm-placeholder": {
		color: "var(--stuic-input-placeholder, currentColor)",
		opacity: "0.5",
	},
});

/** Wrap the current selection with `before`/`after` markers (e.g. `**bold**`). */
function wrapSelection(view: EditorView, before: string, after = before): void {
	const { from, to } = view.state.selection.main;
	const selected = view.state.sliceDoc(from, to);
	view.dispatch({
		changes: { from, to, insert: `${before}${selected}${after}` },
		selection: {
			anchor: from + before.length,
			head: to + before.length + selected.length,
		},
	});
	view.focus();
}

/** Toggle an ATX heading of `level` on the cursor's line: add it, switch level,
 *  or strip it when the same level is already present. */
function toggleHeadingLine(view: EditorView, level: number): void {
	const { from } = view.state.selection.main;
	const line = view.state.doc.lineAt(from);
	const m = line.text.match(/^(#{1,6}) /);
	const curLevel = m ? m[1].length : 0;
	const delLen = m ? m[0].length : 0;
	const insert = curLevel === level ? "" : `${"#".repeat(level)} `;
	view.dispatch({ changes: { from: line.from, to: line.from + delLen, insert } });
	view.focus();
}

/** Insert a markdown link, prompting for the URL (parity with the WYSIWYG link). */
async function insertLink(view: EditorView, prompt: PromptFn): Promise<void> {
	// Capture the selection before the (possibly async) prompt — a modal dialog
	// blocks editing, so these positions stay valid.
	const { from, to } = view.state.selection.main;
	const text = view.state.sliceDoc(from, to) || "link";
	const href = await prompt("Link URL", "https://");
	if (href === null) return view.focus();
	const url = href.trim() || "url";
	view.dispatch({
		changes: { from, to, insert: `[${text}](${url})` },
		selection: { anchor: from + 1, head: from + 1 + text.length },
	});
	view.focus();
}

/**
 * Toggle a line prefix (list marker, blockquote `> `, …) across the selected
 * lines. If every non-empty line already matches `marker`, the marker is
 * stripped (toggle off); otherwise it is added — so repeated clicks behave like
 * a real toggle instead of stacking `- - ` / `> > ` prefixes.
 */
function toggleLinePrefix(view: EditorView, add: string, marker: RegExp): void {
	const { from, to } = view.state.selection.main;
	const startLine = view.state.doc.lineAt(from).number;
	const endLine = view.state.doc.lineAt(to).number;
	const lines = [];
	let allMarked = true;
	for (let n = startLine; n <= endLine; n++) {
		const line = view.state.doc.line(n);
		lines.push(line);
		if (line.text.trim() !== "" && !marker.test(line.text)) allMarked = false;
	}
	const changes = [];
	for (const line of lines) {
		const isBlank = line.text.trim() === "";
		if (allMarked) {
			const m = line.text.match(marker);
			if (m) changes.push({ from: line.from, to: line.from + m[0].length, insert: "" });
		} else if (!isBlank || lines.length === 1) {
			changes.push({ from: line.from, insert: add });
		}
	}
	view.dispatch({ changes });
	view.focus();
}

/** Insert a markdown image, prompting for the URL (parity with WYSIWYG). */
async function insertImage(view: EditorView, prompt: PromptFn): Promise<void> {
	const { from, to } = view.state.selection.main;
	const alt = view.state.sliceDoc(from, to) || "alt";
	const src = await prompt("Image URL", "https://");
	if (src === null) return view.focus();
	const url = src.trim() || "url";
	view.dispatch({
		changes: { from, to, insert: `![${alt}](${url})` },
		selection: { anchor: from + 2, head: from + 2 + alt.length },
	});
	view.focus();
}

/** Wrap the selection in a fenced code block (or insert an empty one). */
function insertCodeBlock(view: EditorView): void {
	const { from, to } = view.state.selection.main;
	const sel = view.state.sliceDoc(from, to);
	const insert = `\`\`\`\n${sel}\n\`\`\`\n`;
	view.dispatch({
		changes: { from, to, insert },
		selection: { anchor: from + 4 }, // just inside the opening fence
	});
	view.focus();
}

/** Insert a thematic break (horizontal rule) after the current line. */
function insertHorizontalRule(view: EditorView): void {
	const at = view.state.doc.lineAt(view.state.selection.main.from).to;
	const insert = "\n\n---\n";
	view.dispatch({
		changes: { from: at, insert },
		selection: { anchor: at + insert.length },
	});
	view.focus();
}

/** Insert a markdown hard line break at the cursor. */
function insertHardBreak(view: EditorView): void {
	const { from, to } = view.state.selection.main;
	view.dispatch({
		changes: { from, to, insert: "\\\n" },
		selection: { anchor: from + 2 },
	});
	view.focus();
}

export function mountCodeMirror(host: HTMLElement, opts: MountOptions): EditorHandle {
	const view = new EditorView({
		parent: host,
		state: EditorState.create({
			doc: opts.value ?? "",
			extensions: [
				history(),
				keymap.of([...defaultKeymap, ...historyKeymap]),
				markdown({ codeLanguages: languages }),
				EditorView.lineWrapping,
				EditorView.editable.of(!opts.disabled),
				EditorState.readOnly.of(!!opts.disabled),
				...(opts.placeholder ? [cmPlaceholder(opts.placeholder)] : []),
				stuicTheme,
				EditorView.updateListener.of((u) => {
					if (u.docChanged) opts.onChange(u.state.doc.toString());
				}),
			],
		}),
	});

	return {
		destroy: () => view.destroy(),
		getMarkdown: () => view.state.doc.toString(),
		setMarkdown: (md) => {
			if (md === view.state.doc.toString()) return;
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: md } });
		},
		focus: () => view.focus(),
		commands: {
			bold: () => wrapSelection(view, "**"),
			italic: () => wrapSelection(view, "_"),
			heading: (level) => toggleHeadingLine(view, Math.min(6, Math.max(1, level))),
			link: () => insertLink(view, opts.prompt),
			image: () => insertImage(view, opts.prompt),
			bulletList: () => toggleLinePrefix(view, "- ", /^\s*[-*+] /),
			orderedList: () => toggleLinePrefix(view, "1. ", /^\s*\d+\. /),
			blockquote: () => toggleLinePrefix(view, "> ", /^\s*> /),
			codeBlock: () => insertCodeBlock(view),
			hr: () => insertHorizontalRule(view),
			hardBreak: () => insertHardBreak(view),
			undo: () => undo(view),
			redo: () => redo(view),
		},
	};
}
