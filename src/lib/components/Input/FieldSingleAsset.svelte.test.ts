import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { tick } from "svelte";
import FieldSingleAsset from "./FieldSingleAsset.svelte";
import type { FieldSingleAssetUploadContext } from "./FieldSingleAsset.svelte";
import FieldAssets from "./FieldAssets.svelte";
import type { FieldAsset } from "./FieldAssets.svelte";
import { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

// FieldSingleAsset — the contract under test:
//   - ONE asset: every file source (picker, drop, paste) REPLACES; two files at
//     once are refused; the file input is single
//   - `value` is only rewritten when an action settles (upload resolved, remove,
//     undo) — an in-flight or failed upload never touches it (rollback for free)
//   - the check order: accept -> onBeforeReplace -> transformFile -> maxSize ->
//     validateFile -> processAsset
//   - a failed upload shows Retry (same file) / Discard; a cancelled upload's
//     late resolution is ignored
//   - remove offers an inline Undo for `undoTtl` ms; focus returns to the tile
//   - `disabled` blocks drop/pick/paste/remove; without `processAsset` the field
//     is display-only; `isLoading` renders a skeleton
//   - `pasteable` shares FieldAssets' document-level paste registry
//   - `required` is enforced through the hidden input's validator

const ASSET: FieldAsset = { id: "a1", url: "/x.jpg", name: "x.jpg", type: "image/jpeg" };

// Loadable, hermetic 1x1 PNG for the test that opens the AssetsPreview lightbox: the
// preview preloads images without .catch, so a dead URL there rejects unhandled.
const PNG_1X1 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const LOADABLE_ASSET: FieldAsset = { ...ASSET, url: PNG_1X1 };

const file = (name = "shot.png", type = "image/png", bytes = "fake-bytes") =>
	new File([bytes], name, { type });

const uploaded = (a: FieldAsset, id = "up-1"): FieldAsset => ({
	id,
	url: { thumb: "/t.jpg", full: "/f.jpg" },
	name: a.name,
	type: a.type,
});

const resolvingUpload = () =>
	vi.fn(async (a: FieldAsset, _ctx: FieldSingleAssetUploadContext) => uploaded(a));

// An upload the test settles by hand. Captures the LATEST call's resolvers, so a
// retry can be settled too.
function deferredUpload() {
	let resolve!: (a: FieldAsset) => void;
	let reject!: (e: unknown) => void;
	let ctx: FieldSingleAssetUploadContext | undefined;
	const processAsset = vi.fn(
		(_a: FieldAsset, c: FieldSingleAssetUploadContext) =>
			new Promise<FieldAsset>((res, rej) => {
				ctx = c;
				resolve = res;
				reject = rej;
			})
	);
	return {
		processAsset,
		resolve: (a: FieldAsset) => resolve(a),
		reject: (e: unknown) => reject(e),
		ctx: () => ctx!,
	};
}

function els(container: HTMLElement) {
	const wrap = container.querySelector<HTMLElement>(".stuic-field-single-asset");
	if (!wrap) throw new Error("missing .stuic-field-single-asset wrapper");
	const input = container.querySelector<HTMLInputElement>('input[type="file"]');
	if (!input) throw new Error("missing file input");
	const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]');
	if (!hidden) throw new Error("missing hidden input");
	return {
		wrap,
		input,
		hidden,
		state: () => wrap.getAttribute("data-state"),
		tile: () =>
			wrap.querySelector<HTMLButtonElement>("button.stuic-field-single-asset-preview"),
		action: (a: string) => wrap.querySelector<HTMLButtonElement>(`[data-action="${a}"]`),
		meta: () => wrap.querySelector<HTMLElement>("[data-meta]")?.textContent ?? "",
		undo: () => wrap.querySelector<HTMLButtonElement>(".stuic-field-single-asset-undo"),
	};
}

// deliver files through the hidden input exactly like the native picker does
function pick(input: HTMLInputElement, ...files: File[]) {
	const dt = new DataTransfer();
	files.forEach((f) => dt.items.add(f));
	input.files = dt.files;
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

function drop(el: HTMLElement, ...files: File[]) {
	const dt = new DataTransfer();
	files.forEach((f) => dt.items.add(f));
	el.dispatchEvent(
		new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true })
	);
}

function pasteEventWithFile(name = "shot.png", type = "image/png") {
	const dt = new DataTransfer();
	dt.items.add(new File(["fake-bytes"], name, { type }));
	return new ClipboardEvent("paste", {
		clipboardData: dt,
		bubbles: true,
		cancelable: true,
	});
}

const notificationsMock = () => {
	const n = new NotificationsStack([]);
	const error = vi.spyOn(n, "error");
	return { notifications: n, error };
};

// ---------------------------------------------------------------------------

test("empty: hint + dashed tile, clicking the tile opens the picker, input is single-file", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		processAsset: resolvingUpload(),
		capture: "user",
	});
	const { input, hidden, state, tile, meta } = els(screen.container);
	expect(state()).toBe("empty");
	expect(hidden.value).toBe("");
	expect(meta()).toContain("Drop a file here");
	expect(input.multiple).toBe(false);
	expect(input.getAttribute("capture")).toBe("user");

	const click = vi.spyOn(input, "click").mockImplementation(() => {});
	tile()!.click();
	expect(click).toHaveBeenCalledTimes(1);
});

test("picked file: optimistic uploading state, value untouched until the upload resolves", async () => {
	const up = deferredUpload();
	const onChange = vi.fn();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		processAsset: up.processAsset,
		onChange,
	});
	const { input, hidden, state, meta } = els(screen.container);

	pick(input, file("shot.png"));
	await expect.poll(state).toBe("uploading");
	expect(up.processAsset).toHaveBeenCalledTimes(1);
	const [optimistic, ctx] = up.processAsset.mock.calls[0];
	expect(optimistic.id.startsWith("blob:")).toBe(true);
	expect(optimistic.name).toBe("shot.png");
	expect(ctx.file.name).toBe("shot.png");
	expect(meta()).toContain("shot.png");
	// the form never sees a blob asset
	expect(hidden.value).toBe("");
	expect(onChange).not.toHaveBeenCalled();
	// the input is released right away (same file can be picked again)
	expect(input.value).toBe("");

	up.resolve(uploaded(optimistic));
	await expect.poll(state).toBe("filled");
	expect(JSON.parse(hidden.value)).toMatchObject({ id: "up-1", name: "shot.png" });
	expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: "up-1" }));
});

test("withOnProgress: ctx.onProgress drives data-progress and the meta line", async () => {
	const up = deferredUpload();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		processAsset: up.processAsset,
		withOnProgress: true,
	});
	const { input, tile, meta } = els(screen.container);
	pick(input, file());
	await expect.poll(() => tile()?.getAttribute("data-progress")).toBe("0");
	up.ctx().onProgress(42.4);
	await expect.poll(() => tile()?.getAttribute("data-progress")).toBe("42");
	expect(meta()).toContain("42%");
	up.ctx().onProgress(250);
	await expect.poll(() => tile()?.getAttribute("data-progress")).toBe("100");
});

test("a drop on a filled field replaces; onBeforeReplace=false keeps the current asset", async () => {
	const processAsset = resolvingUpload();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
		processAsset,
	});
	const { wrap, hidden, state } = els(screen.container);
	expect(state()).toBe("filled");

	drop(wrap, file("new.png"));
	await expect.poll(() => JSON.parse(hidden.value).name).toBe("new.png");
	expect(processAsset).toHaveBeenCalledTimes(1);

	// guard says no
	const guarded = resolvingUpload();
	const onBeforeReplace = vi.fn(async (_current: FieldAsset, _file: File) => false);
	const two = await render(FieldSingleAsset, {
		name: "b",
		label: "Photo",
		value: JSON.stringify(ASSET),
		processAsset: guarded,
		onBeforeReplace,
	});
	drop(els(two.container).wrap, file("new.png"));
	await expect.poll(() => onBeforeReplace.mock.calls.length).toBe(1);
	expect(onBeforeReplace.mock.calls[0][0]).toMatchObject({ id: "a1" });
	expect(onBeforeReplace.mock.calls[0][1].name).toBe("new.png");
	await tick();
	expect(guarded).not.toHaveBeenCalled();
	expect(JSON.parse(els(two.container).hidden.value).id).toBe("a1");
});

test("two files at once are refused", async () => {
	const processAsset = resolvingUpload();
	const { notifications, error } = notificationsMock();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		processAsset,
		notifications,
	});
	const { wrap, state } = els(screen.container);
	drop(wrap, file("1.png"), file("2.png"));
	await expect.poll(() => error.mock.calls.length).toBe(1);
	expect(`${error.mock.calls[0][0]}`).toMatch(/single file/i);
	expect(processAsset).not.toHaveBeenCalled();
	expect(state()).toBe("empty");
});

test("accept: a mismatched MIME is refused, an extension token accepts by file name", async () => {
	const refused = resolvingUpload();
	const { notifications, error } = notificationsMock();
	const a = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		accept: "image/*",
		processAsset: refused,
		notifications,
	});
	pick(els(a.container).input, file("cv.pdf", "application/pdf"));
	await expect.poll(() => error.mock.calls.length).toBe(1);
	expect(`${error.mock.calls[0][0]}`).toContain("image/*");
	expect(refused).not.toHaveBeenCalled();

	const accepted = resolvingUpload();
	const b = await render(FieldSingleAsset, {
		name: "b",
		label: "Contract",
		value: "",
		accept: ".pdf,.docx",
		processAsset: accepted,
		notifications,
	});
	pick(els(b.container).input, file("cv.PDF", "application/pdf"));
	await expect.poll(() => accepted.mock.calls.length).toBe(1);
});

test("maxSize refuses with both sizes in the message; validateFile (async) rejects with its own", async () => {
	const processAsset = resolvingUpload();
	const { notifications, error } = notificationsMock();
	const a = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		maxSize: 5,
		processAsset,
		notifications,
	});
	pick(els(a.container).input, file("big.png", "image/png", "0123456789"));
	await expect.poll(() => error.mock.calls.length).toBe(1);
	expect(`${error.mock.calls[0][0]}`).toContain("10 B");
	expect(`${error.mock.calls[0][0]}`).toContain("5 B");

	const b = await render(FieldSingleAsset, {
		name: "b",
		label: "Photo",
		value: "",
		validateFile: async (f: File) => (/draft/i.test(f.name) ? "No drafts" : undefined),
		processAsset,
		notifications,
	});
	pick(els(b.container).input, file("Draft-1.png"));
	await expect.poll(() => error.mock.calls.length).toBe(2);
	expect(error.mock.calls[1][0]).toBe("No drafts");
	pick(els(b.container).input, file("final.png"));
	await expect.poll(() => processAsset.mock.calls.length).toBe(1);
	expect(error).toHaveBeenCalledTimes(2);
});

test("transformFile: the transformed file is what gets uploaded; null cancels silently", async () => {
	const processAsset = resolvingUpload();
	const { notifications, error } = notificationsMock();
	let cancel = false;
	const transformFile = vi.fn(async (f: File) =>
		cancel
			? null
			: new File(["tiny"], f.name.replace(/\.png$/, ".jpg"), { type: "image/jpeg" })
	);
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		transformFile,
		processAsset,
		notifications,
		// 4 bytes pass, the 10-byte original would not: proves maxSize sees the
		// transformed file
		maxSize: 6,
	});
	const { input, hidden, state } = els(screen.container);
	pick(input, file("shot.png", "image/png", "0123456789"));
	await expect.poll(() => processAsset.mock.calls.length).toBe(1);
	const [optimistic, ctx] = processAsset.mock.calls[0];
	expect(ctx.file.name).toBe("shot.jpg");
	expect(ctx.file.type).toBe("image/jpeg");
	expect(optimistic.name).toBe("shot.jpg");
	await expect.poll(() => JSON.parse(hidden.value || "null")?.name).toBe("shot.jpg");

	cancel = true;
	pick(input, file("other.png"));
	await expect.poll(() => transformFile.mock.calls.length).toBe(2);
	await tick();
	expect(processAsset).toHaveBeenCalledTimes(1);
	expect(error).not.toHaveBeenCalled();
	expect(state()).toBe("filled");
});

test("remove empties the value and offers Undo; Undo restores; focus lands on the tile", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
		processAsset: resolvingUpload(),
		onChange,
	});
	const { hidden, state, action, undo, tile, meta } = els(screen.container);

	action("remove")!.click();
	await expect.poll(state).toBe("empty");
	expect(hidden.value).toBe("");
	expect(onChange).toHaveBeenLastCalledWith(null);
	expect(meta()).toContain("x.jpg removed");
	await expect.poll(() => document.activeElement).toBe(tile());

	undo()!.click();
	await expect.poll(state).toBe("filled");
	expect(JSON.parse(hidden.value).id).toBe("a1");
	expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "a1" }));
	expect(undo()).toBeNull();
});

test("undoTtl=0 offers no Undo; onBeforeRemove=false keeps the asset", async () => {
	const a = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
		undoTtl: 0,
	});
	const A = els(a.container);
	A.action("remove")!.click();
	await expect.poll(A.state).toBe("empty");
	expect(A.undo()).toBeNull();

	const onBeforeRemove = vi.fn(async (_asset: FieldAsset) => false);
	const b = await render(FieldSingleAsset, {
		name: "b",
		label: "Photo",
		value: JSON.stringify(ASSET),
		onBeforeRemove,
	});
	const B = els(b.container);
	B.action("remove")!.click();
	await expect.poll(() => onBeforeRemove.mock.calls.length).toBe(1);
	await tick();
	expect(B.state()).toBe("filled");
	expect(JSON.parse(B.hidden.value).id).toBe("a1");
});

test("failed upload: value untouched, error state, Retry re-uploads the same file", async () => {
	const up = deferredUpload();
	const { notifications, error } = notificationsMock();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
		processAsset: up.processAsset,
		notifications,
	});
	const { input, hidden, state, action, meta } = els(screen.container);

	pick(input, file("new.png"));
	await expect.poll(state).toBe("uploading");
	up.reject(new Error("boom"));
	await expect.poll(state).toBe("error");
	expect(JSON.parse(hidden.value).id).toBe("a1"); // rollback: nothing was written
	expect(meta()).toContain("Upload failed");
	expect(error).toHaveBeenCalledTimes(1);
	expect(`${error.mock.calls[0][0]}`).toContain("boom");
	expect(action("preview")).toBeNull(); // not while pending

	action("retry")!.click();
	await expect.poll(() => up.processAsset.mock.calls.length).toBe(2);
	expect(state()).toBe("uploading");
	expect(up.processAsset.mock.calls[1][1].file).toBe(
		up.processAsset.mock.calls[0][1].file
	);
	up.resolve(uploaded(up.processAsset.mock.calls[1][0], "up-2"));
	await expect.poll(state).toBe("filled");
	expect(JSON.parse(hidden.value).id).toBe("up-2");
});

test("Discard after a failure shows the previous asset again; X during upload cancels and a late resolution is ignored", async () => {
	const up = deferredUpload();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
		processAsset: up.processAsset,
		notifications: new NotificationsStack([]),
	});
	const { input, hidden, state, action, meta } = els(screen.container);

	pick(input, file("new.png"));
	await expect.poll(state).toBe("uploading");
	up.reject(new Error("boom"));
	await expect.poll(state).toBe("error");
	action("discard")!.click();
	await expect.poll(state).toBe("filled");
	expect(meta()).toContain("x.jpg");
	expect(JSON.parse(hidden.value).id).toBe("a1");

	// cancel mid-flight
	pick(input, file("another.png"));
	await expect.poll(state).toBe("uploading");
	action("discard")!.click();
	await expect.poll(state).toBe("filled");
	const late = uploaded(up.processAsset.mock.calls[1][0], "late");
	up.resolve(late);
	await tick();
	await tick();
	expect(JSON.parse(hidden.value).id).toBe("a1");
	expect(state()).toBe("filled");
});

test("disabled: no drop, no pick, no remove; preview stays", async () => {
	const processAsset = resolvingUpload();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
		processAsset,
		disabled: true,
	});
	const { wrap, input, tile, action, state } = els(screen.container);
	expect(tile()!.disabled).toBe(true);
	expect(action("remove")).toBeNull();
	expect(action("preview")).not.toBeNull();

	drop(wrap, file());
	pick(input, file());
	await tick();
	expect(processAsset).not.toHaveBeenCalled();
	expect(state()).toBe("filled");
});

test("without processAsset the field is display-only: tile disabled, no hint, remove still works", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(ASSET),
	});
	const { tile, action, state, hidden } = els(screen.container);
	expect(tile()!.disabled).toBe(true);
	action("remove")!.click();
	await expect.poll(state).toBe("empty");
	expect(hidden.value).toBe("");
	// no uploader: no "drop a file" invitation either
	expect(els(screen.container).meta()).not.toContain("Drop a file");
});

test("isLoading renders a skeleton and no interactive tile", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		processAsset: resolvingUpload(),
		isLoading: true,
	});
	const { wrap, tile, state } = els(screen.container);
	expect(state()).toBe("loading");
	expect(tile()).toBeNull();
	expect(wrap.querySelector("[aria-busy='true']")).not.toBeNull();
});

test("required: validate() fails while empty and passes once filled", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		required: true,
	});
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toMatch(/requires attention/);
	await expect.element(screen.getByText(/requires attention/)).toBeVisible();

	await screen.rerender({ value: JSON.stringify(ASSET) });
	expect(screen.component.validate()?.valid).toBe(true);
});

test("custom parseValue/serializeValue: an array-of-one adapter round-trips", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify([ASSET]),
		parseValue: (s: string) => (JSON.parse(s || "[]") as FieldAsset[])[0] ?? null,
		serializeValue: (a: FieldAsset | null) => JSON.stringify(a ? [a] : []),
	});
	const { hidden, state, action, meta } = els(screen.container);
	expect(state()).toBe("filled");
	expect(meta()).toContain("x.jpg");
	action("remove")!.click();
	await expect.poll(() => hidden.value).toBe("[]");
});

test("a11y: the label targets the tile, the tile describes its action; the empty tile opens the picker on Enter", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Profile picture",
		id: "pp",
		value: JSON.stringify(ASSET),
		processAsset: resolvingUpload(),
	});
	const { tile } = els(screen.container);
	expect(screen.container.querySelector("label[for='pp']")).not.toBeNull();
	expect(tile()!.id).toBe("pp");
	const describedBy = tile()!.getAttribute("aria-describedby")!;
	expect(document.getElementById(describedBy)?.textContent).toBe("Replace x.jpg");
	// action buttons carry accessible names
	await expect
		.element(screen.getByRole("button", { name: "Remove" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Preview" }))
		.toBeInTheDocument();
});

test("preview action opens the AssetsPreview dialog; its Delete removes the asset", async () => {
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: JSON.stringify(LOADABLE_ASSET),
		processAsset: resolvingUpload(),
	});
	const { action, state } = els(screen.container);
	action("preview")!.click();
	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeVisible();
	await screen.getByRole("button", { name: "Delete" }).click();
	await expect.poll(state).toBe("empty");
});

test("pasteable: a file paste replaces (shared registry), and FieldAssets + FieldSingleAsset together make an unfocused paste ambiguous", async () => {
	const single = resolvingUpload();
	const many = vi.fn(async (assets: FieldAsset[]) =>
		assets.map((a) => ({ ...uploaded(a), blobUrl: a.id }))
	);
	const s = await render(FieldSingleAsset, {
		name: "s",
		label: "Single",
		value: "",
		pasteable: true,
		processAsset: single,
	});
	const m = await render(FieldAssets, {
		name: "m",
		label: "Many",
		value: "[]",
		pasteable: true,
		processAssets: many,
	});

	// unfocused: two pasteable fields (one of each kind) -> ambiguous -> neither
	(document.activeElement as HTMLElement | null)?.blur?.();
	const ev1 = pasteEventWithFile();
	document.body.dispatchEvent(ev1);
	expect(ev1.defaultPrevented).toBe(false);
	expect(single).not.toHaveBeenCalled();
	expect(many).not.toHaveBeenCalled();

	// clicking inside the single field focuses it -> it wins the next paste
	const { wrap, state, hidden } = els(s.container);
	wrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	expect(wrap.contains(document.activeElement)).toBe(true);
	const ev2 = pasteEventWithFile("pasted.png");
	document.body.dispatchEvent(ev2);
	expect(ev2.defaultPrevented).toBe(true);
	expect(single).toHaveBeenCalledTimes(1);
	expect(many).not.toHaveBeenCalled();
	await expect.poll(state).toBe("filled");
	expect(JSON.parse(hidden.value).name).toBe("pasted.png");
	expect(m.container.querySelector("[data-asset-tile]")).toBeNull();
});

test("pasteable alone: an unfocused paste is routed here; plain text passes through", async () => {
	const processAsset = resolvingUpload();
	const screen = await render(FieldSingleAsset, {
		name: "a",
		label: "Photo",
		value: "",
		pasteable: true,
		processAsset,
	});
	(document.activeElement as HTMLElement | null)?.blur?.();

	const dt = new DataTransfer();
	dt.setData("text/plain", "hello");
	const text = new ClipboardEvent("paste", {
		clipboardData: dt,
		bubbles: true,
		cancelable: true,
	});
	document.body.dispatchEvent(text);
	expect(text.defaultPrevented).toBe(false);
	expect(processAsset).not.toHaveBeenCalled();

	const ev = pasteEventWithFile();
	document.body.dispatchEvent(ev);
	expect(ev.defaultPrevented).toBe(true);
	await expect.poll(() => processAsset.mock.calls.length).toBe(1);
	await expect.poll(els(screen.container).state).toBe("filled");
});
