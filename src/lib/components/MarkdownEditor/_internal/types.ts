/**
 * Shared contract between the two editor backends (Milkdown WYSIWYG and
 * CodeMirror raw source). `MarkdownEditor.svelte` only ever talks to an
 * `EditorHandle`, so the two `_internal` modules are fully interchangeable and
 * the heavy library code stays behind the dynamic-`import()` boundary.
 */

/** Imperative toolbar commands. Each backend implements them in its own way. */
export interface EditorCommands {
	bold: () => void;
	italic: () => void;
	/** Toggle a heading of the given level (1-6) on the current block/line. */
	heading: (level: number) => void;
	link: () => void;
	image: () => void;
	bulletList: () => void;
	orderedList: () => void;
	blockquote: () => void;
	codeBlock: () => void;
	/** Insert a horizontal rule / thematic break. */
	hr: () => void;
	/** Insert a hard line break. */
	hardBreak: () => void;
	undo: () => void;
	redo: () => void;
}

/** Handle returned by a backend mount fn. The single source of truth is the
 *  markdown string `value` in the host component — the handle just lets it
 *  read, write, focus, and destroy whichever editor is currently active. */
export interface EditorHandle {
	/** Tear down the editor and release DOM/resources. */
	destroy: () => void;
	/** Current document serialized to markdown. Read this before destroying. */
	getMarkdown: () => string;
	/** Replace the whole document with `md` (used on external `value` change). */
	setMarkdown: (md: string) => void;
	/** Focus the editable surface. */
	focus: () => void;
	/** Toolbar command map. */
	commands: EditorCommands;
}

/**
 * A `window.prompt`-compatible function used for the link/image URL inputs. May
 * be async — e.g. STUIC's ACP dialog via `createPrompt(acpStack)`. Resolves to
 * the entered string, or `null` if cancelled.
 */
export type PromptFn = (
	message: string,
	defaultValue?: string
) => string | null | Promise<string | null>;

export interface MountOptions {
	/** Initial markdown content. */
	value: string;
	/** Called whenever the user edits. Backend echoes from `setMarkdown` are the
	 *  caller's responsibility to guard (see the sync logic in the component). */
	onChange: (markdown: string) => void;
	/** Prompt used for link/image URLs (defaults to `window.prompt`). */
	prompt: PromptFn;
	disabled?: boolean;
	placeholder?: string;
}
