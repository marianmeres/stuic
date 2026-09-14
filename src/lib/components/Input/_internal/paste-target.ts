// --- Clipboard paste plumbing (see the `pasteable` prop of FieldAssets /
// FieldSingleAsset) ------------------------------------------------------------
// All mounted pasteable instances — of EITHER component — coordinate through ONE
// document-level `paste` listener (installed while at least one is mounted).
// Document-level (rather than a listener on the field wrapper) because browsers
// dispatch `paste` at the focused/selection node — with focus on <body> the
// event never bubbles through the field, which made the feature look dead
// unless the field was clicked first.
//
// Shared on purpose: the "single mounted pasteable field" fallback below must
// count every pasteable field on the page. Two private registries (one per
// component) would each believe they own the only field and BOTH would consume
// a bare Ctrl/Cmd-V.

export type PasteTarget = {
	el: HTMLElement;
	handle: (e: ClipboardEvent) => void;
};

const paste_targets = new Set<PasteTarget>();

// True only when NOTHING is focused (browsers park focus on <body>/<html>).
// The fallback below must never fire while the user has deliberately focused
// some other element — a text input obviously, but also any other widget
// (e.g. a different, non-pasteable field): pasting "into" the thing they
// focused must not teleport files to an unrelated field.
function is_unclaimed_focus(el: Element | null): boolean {
	return !el || el === document.body || el === document.documentElement;
}

// Text-entry elements own their pastes even when they live INSIDE the field
// (consumer content via the label/description/below snippets) — an editor's
// image paste must insert into the editor, not upload into the field.
function is_text_entry(el: Element | null): boolean {
	if (!el) return false;
	if ((el as HTMLElement).isContentEditable) return true;
	return ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

// A field hidden by CSS (kept-mounted inactive tab panel etc.) must not
// claim the no-focus fallback — the user would see nothing happen.
function is_visible(el: HTMLElement): boolean {
	return el.checkVisibility?.() ?? el.offsetParent !== null;
}

// A modal/dialog (drawer, modal) takes focus on open, so `active` is the
// dialog panel — or a control inside it — and NEVER <body>. When the field
// lives in such a dialog, treat a non-text focus within that SAME dialog as
// unclaimed too, so a bare Ctrl/Cmd-V attaches with no prior click. Scoped to
// a shared [aria-modal]/[role=dialog] ancestor on purpose: it must not make
// the field greedy on ordinary (non-modal) pages, where a deliberately
// focused control elsewhere still owns its paste.
function shares_modal(fieldEl: HTMLElement, active: Element | null): boolean {
	if (!active) return false;
	const modal = fieldEl.closest?.("[aria-modal='true'],[role='dialog']");
	return !!modal && modal.contains(active);
}

function on_document_paste(e: ClipboardEvent) {
	// someone (an editor, another paste handler) already claimed it
	if (e.defaultPrevented) return;
	const active = document.activeElement;
	// 1) the field holding focus always wins — unless focus sits in a
	// text-entry element nested inside it: stand down entirely
	for (const t of paste_targets) {
		if (t.el.contains(active)) {
			if (is_text_entry(active)) return;
			return t.handle(e);
		}
	}
	// 2) fall back to the SINGLE mounted + visible pasteable field for a paste
	// NOT owned by a focused text-entry element, when focus is EITHER unclaimed
	// (fresh page, focus on <body>) OR parked on a non-text control inside the
	// SAME modal/dialog as the field (the drawer/modal case: the panel or the
	// row that opened it holds focus, so <body> is never active). A bare
	// Ctrl/Cmd-V then works with no prior click. With several fields mounted the
	// routing would be ambiguous, so focus (a click on the field) must decide.
	if (paste_targets.size === 1 && !is_text_entry(active)) {
		const [t] = paste_targets;
		if (is_visible(t.el) && (is_unclaimed_focus(active) || shares_modal(t.el, active))) {
			t.handle(e);
		}
	}
}

/**
 * Registers a pasteable field. Returns the unregister function. The document
 * listener is installed with the first registration and removed with the last.
 */
export function registerPasteTarget(t: PasteTarget): () => void {
	if (!paste_targets.size) document.addEventListener("paste", on_document_paste);
	paste_targets.add(t);
	return () => {
		paste_targets.delete(t);
		if (!paste_targets.size) document.removeEventListener("paste", on_document_paste);
	};
}

/**
 * The file entries of a paste. Prefers `items` (lets us keep only file-kind
 * entries, e.g. a pasted screenshot); falls back to `.files` for browsers that
 * only populate that. Empty for a plain-text paste.
 */
export function extractClipboardFiles(e: ClipboardEvent): File[] {
	const dt = e.clipboardData;
	if (!dt) return [];
	const out: File[] = [];
	for (let i = 0; i < (dt.items?.length ?? 0); i++) {
		const it = dt.items[i];
		if (it?.kind === "file") {
			const f = it.getAsFile();
			if (f) out.push(f);
		}
	}
	if (!out.length && dt.files?.length) out.push(...dt.files);
	return out;
}
