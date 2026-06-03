/**
 * WYSIWYG backend, built on Milkdown (the markdown-first ProseMirror
 * distribution + remark). Headless: Milkdown ships no CSS, so all visuals come
 * from the component's `index.css` styling `.milkdown .ProseMirror`.
 *
 * Like the CodeMirror backend, the heavy `@milkdown/*` imports are static here
 * but only reached via a dynamic `import()` from the component, keeping them out
 * of SSR and the main bundle.
 *
 * IMPORTANT: never recreate the Editor when `value` changes — only `replaceAll`
 * (Milkdown #598 double-instance trap). The host component enforces this.
 */
import {
	Editor,
	defaultValueCtx,
	editorViewCtx,
	editorViewOptionsCtx,
	rootCtx,
} from "@milkdown/core";
import { history, redoCommand, undoCommand } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import {
	commonmark,
	createCodeBlockCommand,
	insertHardbreakCommand,
	insertHrCommand,
	insertImageCommand,
	liftListItemCommand,
	toggleEmphasisCommand,
	toggleStrongCommand,
	turnIntoTextCommand,
	wrapInBlockquoteCommand,
	wrapInBulletListCommand,
	wrapInHeadingCommand,
	wrapInOrderedListCommand,
} from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { lift } from "@milkdown/prose/commands";
import type { EditorState } from "@milkdown/prose/state";
import { callCommand, getMarkdown, replaceAll } from "@milkdown/utils";
import type { EditorHandle, MountOptions } from "./types.js";

// List node type names differ by Milkdown internals (snake vs camel) — match
// both so list detection is robust regardless of the registered schema name.
const BULLET_LIST_NAMES = new Set(["bullet_list", "bulletList"]);
const ORDERED_LIST_NAMES = new Set(["ordered_list", "orderedList"]);

/** Which kind of list the selection sits inside, if any. */
function currentListType(state: EditorState): "bullet" | "ordered" | null {
	const { $from } = state.selection;
	for (let d = $from.depth; d > 0; d--) {
		const name = $from.node(d).type.name;
		if (BULLET_LIST_NAMES.has(name)) return "bullet";
		if (ORDERED_LIST_NAMES.has(name)) return "ordered";
	}
	return null;
}

/** Heading level of the block the cursor is in, or null if it's not a heading. */
function currentHeadingLevel(state: EditorState): number | null {
	const node = state.selection.$from.parent;
	if (node?.type.name === "heading") return node.attrs.level ?? null;
	return null;
}

/** Whether the selection sits anywhere inside a blockquote. */
function inBlockquote(state: EditorState): boolean {
	const { $from } = state.selection;
	for (let d = $from.depth; d > 0; d--) {
		if ($from.node(d).type.name === "blockquote") return true;
	}
	return false;
}

export async function mountMilkdown(
	host: HTMLElement,
	opts: MountOptions
): Promise<EditorHandle> {
	const editor = await Editor.make()
		.config((ctx) => {
			ctx.set(rootCtx, host);
			ctx.set(defaultValueCtx, opts.value ?? "");
			ctx.update(editorViewOptionsCtx, (prev) => ({
				...prev,
				editable: () => !opts.disabled,
				attributes: { class: "stuic-markdown-prose", spellcheck: "true" },
			}));
			ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
				opts.onChange(markdown);
			});
		})
		.use(commonmark)
		.use(gfm)
		.use(history)
		.use(listener)
		.create();

	// Real list toggle: `wrapIn*` only wraps non-list content, so a second click
	// while already in a list is a no-op. Instead, lift out when already in the
	// same list kind, and lift-then-wrap to switch kinds.
	const toggleList = (kind: "bullet" | "ordered") => {
		editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const wrapKey =
				kind === "bullet" ? wrapInBulletListCommand.key : wrapInOrderedListCommand.key;
			const current = currentListType(view.state);
			if (current === kind) {
				callCommand(liftListItemCommand.key)(ctx); // toggle off
			} else if (current) {
				callCommand(liftListItemCommand.key)(ctx); // switch kind
				callCommand(wrapKey)(ctx);
			} else {
				callCommand(wrapKey)(ctx); // wrap fresh content
			}
			view.focus();
		});
	};

	// Heading toggle: `wrapInHeadingCommand` sets the block type (level < 1 means
	// paragraph) but does NOT toggle, so a second click on the same level is a
	// no-op. Detect the current level and pass 0 to turn it back into a paragraph.
	const toggleHeading = (level: number) => {
		editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const next = currentHeadingLevel(view.state) === level ? 0 : level;
			callCommand(wrapInHeadingCommand.key, next)(ctx);
			view.focus();
		});
	};

	// Link: `toggleLinkCommand` requires an `href` payload (the link mark has no
	// default href, so calling it bare throws "No value supplied for attribute
	// href"). Prompt for a URL and add/update/remove the link mark directly.
	// The prompt may be async (e.g. STUIC's ACP dialog); selection positions are
	// captured up front and stay valid because a modal blocks editing.
	const applyLink = async () => {
		const view = editor.action((ctx) => ctx.get(editorViewCtx));
		const linkMark = view.state.schema.marks.link;
		if (!linkMark) return;
		const { from, to, empty } = view.state.selection;

		let existingHref: string | null = null;
		const scanTo = empty ? Math.min(from + 1, view.state.doc.content.size) : to;
		view.state.doc.nodesBetween(from, scanTo, (node) => {
			const m = node.marks.find((mk) => mk.type === linkMark);
			if (m) existingHref = m.attrs.href;
		});

		const href = await opts.prompt(
			"Link URL (leave empty to remove)",
			existingHref ?? "https://"
		);
		if (href === null) return view.focus(); // cancelled
		const url = href.trim();

		if (url === "") {
			if (!empty) view.dispatch(view.state.tr.removeMark(from, to, linkMark));
		} else if (empty) {
			// No selection: insert the URL as linked text.
			const tr = view.state.tr.insertText(url, from);
			tr.addMark(from, from + url.length, linkMark.create({ href: url }));
			view.dispatch(tr);
		} else {
			view.dispatch(view.state.tr.addMark(from, to, linkMark.create({ href: url })));
		}
		view.focus();
	};

	// Blockquote toggle: wrap, or lift back out when already inside one.
	const toggleBlockquote = () => {
		editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			if (inBlockquote(view.state)) lift(view.state, view.dispatch);
			else callCommand(wrapInBlockquoteCommand.key)(ctx);
			view.focus();
		});
	};

	// Code-block toggle: code-block node types have `spec.code === true`. Turn
	// into a paragraph when already in one, else create a code block.
	const toggleCodeBlock = () => {
		editor.action((ctx) => {
			const view = ctx.get(editorViewCtx);
			const inCode = view.state.selection.$from.parent.type.spec.code === true;
			callCommand(inCode ? turnIntoTextCommand.key : createCodeBlockCommand.key)(ctx);
			view.focus();
		});
	};

	// Image: prompt for a source URL (insertImageCommand needs a `src` payload).
	const insertImage = async () => {
		const view = editor.action((ctx) => ctx.get(editorViewCtx));
		const src = await opts.prompt("Image URL", "https://");
		if (src === null || src.trim() === "") return view.focus();
		editor.action(callCommand(insertImageCommand.key, { src: src.trim() }));
		view.focus();
	};

	return {
		// editor.destroy() is async; we intentionally don't await — the host's
		// `disposed` flag guards against mounting into a torn-down node.
		destroy: () => {
			void editor.destroy();
		},
		getMarkdown: () => editor.action(getMarkdown()),
		setMarkdown: (md) => {
			editor.action(replaceAll(md));
		},
		focus: () => {
			editor.action((ctx) => ctx.get(editorViewCtx).focus());
		},
		commands: {
			bold: () => editor.action(callCommand(toggleStrongCommand.key)),
			italic: () => editor.action(callCommand(toggleEmphasisCommand.key)),
			heading: (level) => toggleHeading(level),
			link: () => applyLink(),
			image: () => insertImage(),
			bulletList: () => toggleList("bullet"),
			orderedList: () => toggleList("ordered"),
			blockquote: () => toggleBlockquote(),
			codeBlock: () => toggleCodeBlock(),
			hr: () => editor.action(callCommand(insertHrCommand.key)),
			hardBreak: () => editor.action(callCommand(insertHardbreakCommand.key)),
			undo: () => editor.action(callCommand(undoCommand.key)),
			redo: () => editor.action(callCommand(redoCommand.key)),
		},
	};
}
