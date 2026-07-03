import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldAssets from "./FieldAssets.svelte";
import type { FieldAsset, FieldAssetWithBlobUrl } from "./FieldAssets.svelte";

// FieldAssets clipboard paste (opt-in `pasteable`) — the contract under test:
//   - a `paste` ClipboardEvent carrying files, bubbling from inside the field,
//     is consumed (preventDefault) and routed through the same path as drop/picker:
//     optimistic tile + processAssets call
//   - plain-text pastes (no files) pass through untouched
//   - `pasteable: false` (default) ignores file pastes entirely
//   - a click inside the field focuses the grid so a follow-up Cmd/Ctrl-V lands here
// We dispatch synthetic ClipboardEvents (real Chromium honors ClipboardEventInit
// .clipboardData with a DataTransfer) — real-keyboard paste can't be driven in a
// test without OS clipboard access, but everything downstream of the event is real.

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
