import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldAssets from "./FieldAssets.svelte";
import type { FieldAsset, FieldAssetWithBlobUrl } from "./FieldAssets.svelte";

// FieldAssets clipboard paste (opt-in `pasteable`) — the contract under test:
//   - pasteable fields register with ONE document-level paste listener; a file
//     paste is consumed (preventDefault) and routed through the same path as
//     drop/picker (optimistic tile + processAssets call) when the field holds
//     focus, OR — single mounted pasteable field — when NOTHING is focused
//     (focus parked on <body>, e.g. a fresh page)
//   - focus on ANY other element (text input, but also any widget, e.g. a
//     different non-pasteable FieldAssets) is respected — never hijacked
//   - with TWO pasteable fields mounted, an unfocused paste is ambiguous and
//     ignored; the focused field receives it
//   - plain-text pastes (no files) pass through untouched
//   - `pasteable: false` (default) ignores file pastes entirely
//   - a click inside the field focuses the grid so a follow-up Cmd/Ctrl-V lands here
// We dispatch synthetic ClipboardEvents (real Chromium honors ClipboardEventInit
// .clipboardData with a DataTransfer) — plus one NATIVE-path test at the end.

function pasteEventWithFile(name = "shot.png", type = "image/png") {
	const dt = new DataTransfer();
	dt.items.add(new File(["fake-bytes"], name, { type }));
	return new ClipboardEvent("paste", {
		clipboardData: dt,
		bubbles: true,
		cancelable: true,
	});
}

function pasteEventWithText(text = "hello") {
	const dt = new DataTransfer();
	dt.setData("text/plain", text);
	return new ClipboardEvent("paste", {
		clipboardData: dt,
		bubbles: true,
		cancelable: true,
	});
}

// resolve uploads exactly like the demo page does: blobUrl = optimistic asset id
const processAssetsMock = () =>
	vi.fn(async (assets: FieldAsset[]): Promise<FieldAssetWithBlobUrl[]> =>
		assets.map((a, i) => ({
			id: `uploaded-${i}`,
			url: { thumb: `t-${i}`, full: `f-${i}` },
			name: a.name,
			type: a.type,
			blobUrl: a.id,
		}))
	);

function els(container: HTMLElement) {
	const wrap = container.querySelector<HTMLElement>(".stuic-field-assets");
	if (!wrap) throw new Error("missing .stuic-field-assets wrapper");
	// the asset grid is the first tabindex=-1 DESCENDANT (wrap itself also has one)
	const grid = wrap.querySelector<HTMLElement>("div[tabindex='-1']");
	if (!grid) throw new Error("missing grid element");
	return { wrap, grid };
}

test("pasteable: a file paste inside the field is consumed and reaches processAssets", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});
	const { grid } = els(screen.container);

	const ev = pasteEventWithFile();
	grid.dispatchEvent(ev);

	// consumed (not left for the browser default)
	expect(ev.defaultPrevented).toBe(true);
	// optimistic tile appears (poll: querySelector must re-run after Svelte flushes)
	await expect
		.poll(() => screen.container.querySelector("[data-asset-tile]"))
		.not.toBeNull();
	// and the upload path got exactly the pasted file
	expect(processAssets).toHaveBeenCalledTimes(1);
	const batch = processAssets.mock.calls[0][0];
	expect(batch).toHaveLength(1);
	expect(batch[0].name).toBe("shot.png");
	expect(batch[0].type).toBe("image/png");
});

test("pasteable: plain-text paste (no files) passes through untouched", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});
	const { grid } = els(screen.container);

	const ev = pasteEventWithText();
	grid.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(false);
	expect(processAssets).not.toHaveBeenCalled();
});

test("pasteable defaults to false: file paste is ignored", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		processAssets,
	});
	const { grid } = els(screen.container);

	const ev = pasteEventWithFile();
	grid.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(false);
	expect(processAssets).not.toHaveBeenCalled();
});

test("pasteable: no-op without processAssets (docs contract)", async () => {
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
	});
	const { grid } = els(screen.container);

	const ev = pasteEventWithFile();
	grid.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(false);
	expect(screen.container.querySelector("[data-asset-tile]")).toBeNull();
});

test("pasteable: clicking inside the field focuses the grid (paste target)", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		// one pre-existing asset so fileDropzone's allowClick (empty-field click ->
		// file picker) stays off and a click is purely a focus gesture
		value: JSON.stringify([
			{ id: "0", url: "/x.jpg", name: "x.jpg", type: "image/jpeg" },
		]),
		pasteable: true,
		processAssets,
	});
	const { wrap, grid } = els(screen.container);

	// real click on the wrapper (not on a button) — capture-phase focusForPaste
	wrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	expect(document.activeElement).toBe(grid);

	// and a paste now bubbling from the focused grid is handled
	const ev = pasteEventWithFile("second.png");
	grid.dispatchEvent(ev);
	expect(ev.defaultPrevented).toBe(true);
	expect(processAssets).toHaveBeenCalledTimes(1);
});

test("unclaimed paste (focus on body, no click) is routed to the single pasteable field", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});

	// no click, no focus — the document-level listener must still route it here
	(document.activeElement as HTMLElement | null)?.blur?.();
	const ev = pasteEventWithFile();
	document.body.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(true);
	expect(processAssets).toHaveBeenCalledTimes(1);
	await expect
		.poll(() => screen.container.querySelector("[data-asset-tile]"))
		.not.toBeNull();
});

test("paste while focus is in a text input is never hijacked", async () => {
	const processAssets = processAssetsMock();
	await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});

	const input = document.createElement("input");
	document.body.appendChild(input);
	try {
		input.focus();
		expect(document.activeElement).toBe(input);
		const ev = pasteEventWithFile();
		input.dispatchEvent(ev);

		expect(ev.defaultPrevented).toBe(false);
		expect(processAssets).not.toHaveBeenCalled();
	} finally {
		input.remove();
	}
});

test("focus on any other element blocks the no-focus fallback (e.g. a second, non-pasteable FieldAssets)", async () => {
	const processAssets = processAssetsMock();
	const pasteableField = await render(FieldAssets, {
		name: "a",
		label: "Pasteable",
		value: "[]",
		pasteable: true,
		processAssets,
	});
	// a second, NON-pasteable field (like the demo page's isLoading example) —
	// it does not register a paste target, so the pasteable one is still the
	// single mounted target; focusing the non-pasteable field's grid must NOT
	// let the fallback teleport the paste into the pasteable field
	const plainField = await render(FieldAssets, {
		name: "b",
		label: "Plain",
		value: "[]",
	});

	const { grid: plainGrid } = els(plainField.container);
	plainGrid.focus();
	expect(document.activeElement).toBe(plainGrid);

	const ev = pasteEventWithFile();
	plainGrid.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(false);
	expect(processAssets).not.toHaveBeenCalled();
	expect(pasteableField.container.querySelector("[data-asset-tile]")).toBeNull();
});

test("two pasteable fields: unfocused paste is ambiguous (ignored); the focused field wins", async () => {
	const processA = processAssetsMock();
	const processB = processAssetsMock();
	const a = await render(FieldAssets, {
		name: "a",
		label: "A",
		value: "[]",
		pasteable: true,
		processAssets: processA,
	});
	const b = await render(FieldAssets, {
		name: "b",
		label: "B",
		value: "[]",
		pasteable: true,
		processAssets: processB,
	});

	// unfocused: ambiguous -> neither consumes
	(document.activeElement as HTMLElement | null)?.blur?.();
	const ev1 = pasteEventWithFile();
	document.body.dispatchEvent(ev1);
	expect(ev1.defaultPrevented).toBe(false);
	expect(processA).not.toHaveBeenCalled();
	expect(processB).not.toHaveBeenCalled();

	// focus field B's grid -> B receives the paste even though the event
	// itself is dispatched at body (document-level targeting robustness)
	const { grid: gridB } = els(b.container);
	gridB.focus();
	expect(document.activeElement).toBe(gridB);
	const ev2 = pasteEventWithFile("for-b.png");
	document.body.dispatchEvent(ev2);
	expect(ev2.defaultPrevented).toBe(true);
	expect(processB).toHaveBeenCalledTimes(1);
	expect(processA).not.toHaveBeenCalled();
	// wait until B's tile actually renders, THEN assert A stayed empty (a
	// synchronous check straight after dispatch would pass vacuously)
	await expect.poll(() => b.container.querySelector("[data-asset-tile]")).not.toBeNull();
	expect(a.container.querySelector("[data-asset-tile]")).toBeNull();
});

test("disabled pasteable field takes no pastes (not even the no-focus fallback)", async () => {
	const processAssets = processAssetsMock();
	await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		disabled: true,
		processAssets,
	});

	(document.activeElement as HTMLElement | null)?.blur?.();
	const ev = pasteEventWithFile();
	document.body.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(false);
	expect(processAssets).not.toHaveBeenCalled();
});

test("paste while focus is in a contenteditable is never hijacked", async () => {
	const processAssets = processAssetsMock();
	await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});

	const ce = document.createElement("div");
	ce.contentEditable = "true";
	ce.tabIndex = 0;
	document.body.appendChild(ce);
	try {
		ce.focus();
		expect(document.activeElement).toBe(ce);
		const ev = pasteEventWithFile();
		ce.dispatchEvent(ev);

		expect(ev.defaultPrevented).toBe(false);
		expect(processAssets).not.toHaveBeenCalled();
	} finally {
		ce.remove();
	}
});

test("a text-entry element nested INSIDE the field owns its pastes (stand down)", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});

	// approximates consumer content injected via the label/description/below
	// snippets: a caption editor living inside the field wrapper
	const wrap = screen.container.querySelector<HTMLElement>(".stuic-field-assets")!;
	const nested = document.createElement("input");
	wrap.appendChild(nested);
	try {
		nested.focus();
		expect(document.activeElement).toBe(nested);
		const ev = pasteEventWithFile();
		nested.dispatchEvent(ev);

		expect(ev.defaultPrevented).toBe(false);
		expect(processAssets).not.toHaveBeenCalled();
	} finally {
		nested.remove();
	}
});

test("an already-handled paste (defaultPrevented) is left alone", async () => {
	const processAssets = processAssetsMock();
	await render(FieldAssets, {
		name: "a",
		label: "Assets",
		value: "[]",
		pasteable: true,
		processAssets,
	});

	// a capture-phase consumer (e.g. an editor) claims the event first
	document.addEventListener("paste", (e) => e.preventDefault(), {
		capture: true,
		once: true,
	});
	(document.activeElement as HTMLElement | null)?.blur?.();
	const ev = pasteEventWithFile();
	document.body.dispatchEvent(ev);

	expect(ev.defaultPrevented).toBe(true); // by the capture consumer, not us
	expect(processAssets).not.toHaveBeenCalled();
});

// NATIVE path: real mouse click + real Cmd/Ctrl-V key chord + real browser clipboard.
// The synthetic tests above bypass the browser's paste TARGETING (which element the
// UA dispatches `paste` at) — this one exercises it. Chromium synthesizes the paste
// editing command from the key chord, so the whole chain runs exactly as for a user.
test("NATIVE: click field, press Cmd/Ctrl-V with a PNG on the clipboard", async () => {
	const processAssets = processAssetsMock();
	const screen = await render(FieldAssets, {
		name: "a",
		label: "Assets",
		// non-empty so fileDropzone's empty-field click->picker stays off
		value: JSON.stringify([
			{ id: "0", url: "/x.jpg", name: "x.jpg", type: "image/jpeg" },
		]),
		pasteable: true,
		processAssets,
	});
	const { grid } = els(screen.container);

	// real click first (focuses the document + grid), THEN write the clipboard
	// (async clipboard API requires a focused document)
	await userEvent.click(page.elementLocator(grid));
	expect(document.activeElement).toBe(grid);

	const png = Uint8Array.from(
		atob(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
		),
		(c) => c.charCodeAt(0)
	);
	await navigator.clipboard.write([
		new ClipboardItem({ "image/png": new Blob([png], { type: "image/png" }) }),
	]);

	await userEvent.keyboard("{ControlOrMeta>}v{/ControlOrMeta}");

	await expect.poll(() => processAssets.mock.calls.length).toBe(1);
	const batch = processAssets.mock.calls[0][0];
	expect(batch[0].type).toBe("image/png");
});
