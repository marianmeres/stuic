import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Float from "./Float.svelte";
import Fixture from "./Float.fixture.svelte";

// NOTE: component CSS lives in the external index.css (loaded only via lib/index.css),
// so it is NOT present in these tests. We therefore drive layout with the `width`
// prop (= 100px, narrow enough to move freely in the 414x896 test viewport) so the
// viewport-clamp math is deterministic, and we assert against the raw element
// (inline styles / attributes) rather than re-resolving page locators by accessible
// name (which can match sibling buttons / leftover nodes).

const body = createRawSnippet(() => ({
	render: () => `<div data-testid="body">body</div>`,
}));

// narrow enough to move freely inside the 414x896 test viewport
const W = 100;

function root(container: HTMLElement): HTMLElement {
	const el = container.querySelector(".stuic-float");
	if (!el) throw new Error("missing .stuic-float root");
	return el as HTMLElement;
}
const header = (c: HTMLElement) => c.querySelector(".stuic-float-header") as HTMLElement;
const q = (c: HTMLElement, sel: string) => c.querySelector(sel) as HTMLElement | null;

function pointer(el: HTMLElement, type: string, x: number, y: number) {
	el.dispatchEvent(
		new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true })
	);
}

// --- structure ---------------------------------------------------------------

test("renders a positioned dialog with the title and stuic-float base class", async () => {
	const { container } = render(Float, {
		title: "Settings",
		x: 40,
		y: 40,
		width: W,
		children: body,
	});
	const el = root(container);
	expect(el.classList.contains("stuic-float")).toBe(true);
	expect(el.getAttribute("role")).toBe("dialog");
	expect(el.getAttribute("aria-modal")).toBe("false");
	expect(el.textContent).toContain("Settings");
	await expect.poll(() => el.style.left).toBe("40px");
	await expect.poll(() => el.style.top).toBe("40px");
});

test("placement resolves an initial position when x/y are omitted", async () => {
	const { container } = render(Float, {
		title: "A",
		placement: "top-left",
		offset: 12,
		width: W,
		children: body,
	});
	const el = root(container);
	// top-left with offset 12 -> 12,12 (well inside 414x896)
	await expect.poll(() => el.style.left).toBe("12px");
	await expect.poll(() => el.style.top).toBe("12px");
});

// --- minimize ----------------------------------------------------------------

test("minimize button toggles data-minimized and swaps its label", async () => {
	const { container } = render(Float, {
		title: "T",
		x: 10,
		y: 10,
		width: W,
		children: body,
	});
	const el = root(container);
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("false");

	q(container, '[aria-label="Minimize"]')!.click();
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("true");

	// the same button is now labelled "Restore"
	q(container, '[aria-label="Restore"]')!.click();
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("false");
});

test("double-clicking the header toggles minimized", async () => {
	const { container } = render(Float, {
		title: "T",
		x: 10,
		y: 10,
		width: W,
		children: body,
	});
	const el = root(container);
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("false");

	header(container).dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("true");
});

// --- close -------------------------------------------------------------------

test("no close button unless closable", () => {
	const { container } = render(Float, {
		title: "T",
		x: 10,
		y: 10,
		width: W,
		children: body,
	});
	root(container);
	expect(q(container, '[aria-label="Close"]')).toBeNull();
});

test("closable shows a close button that fires onClose", async () => {
	const onClose = vi.fn();
	const { container } = render(Float, {
		title: "T",
		x: 10,
		y: 10,
		width: W,
		closable: true,
		onClose,
		children: body,
	});
	q(container, '[aria-label="Close"]')!.click();
	expect(onClose).toHaveBeenCalledOnce();
});

test("Escape fires onClose only when closable + closeOnEscape", () => {
	const onClose = vi.fn();
	const a = render(Float, {
		title: "T",
		x: 10,
		y: 10,
		width: W,
		closable: true,
		onClose,
		children: body,
	});
	root(a.container).dispatchEvent(
		new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
	);
	expect(onClose).toHaveBeenCalledOnce();

	const onClose2 = vi.fn();
	const b = render(Float, {
		title: "T2",
		x: 10,
		y: 10,
		width: W,
		closable: true,
		closeOnEscape: false,
		onClose: onClose2,
		children: body,
	});
	root(b.container).dispatchEvent(
		new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
	);
	expect(onClose2).not.toHaveBeenCalled();
});

// --- drag --------------------------------------------------------------------

test("dragging the header repositions the panel", async () => {
	const { container } = render(Float, {
		title: "T",
		x: 100,
		y: 100,
		width: W,
		children: body,
	});
	const el = root(container);
	await expect.poll(() => el.style.left).toBe("100px");

	const h = header(container);
	pointer(h, "pointerdown", 200, 200);
	pointer(h, "pointermove", 250, 230);
	pointer(h, "pointerup", 250, 230);

	await expect.poll(() => el.style.left).toBe("150px"); // 100 + 50
	await expect.poll(() => el.style.top).toBe("130px"); // 100 + 30
});

test("draggable=false disables repositioning", async () => {
	const { container } = render(Float, {
		title: "T",
		x: 100,
		y: 100,
		width: W,
		draggable: false,
		children: body,
	});
	const el = root(container);
	await expect.poll(() => el.style.left).toBe("100px");
	expect(el.getAttribute("data-draggable")).toBe("false");

	const h = header(container);
	pointer(h, "pointerdown", 200, 200);
	pointer(h, "pointermove", 300, 300);
	pointer(h, "pointerup", 300, 300);

	expect(el.style.left).toBe("100px");
	expect(el.style.top).toBe("100px");
});

// --- bring to front ----------------------------------------------------------

test("pointerdown raises the stacking order when bringToFrontOnClick", async () => {
	const { container } = render(Float, {
		title: "T",
		x: 10,
		y: 10,
		width: W,
		children: body,
	});
	const el = root(container);
	await expect
		.poll(() => Number(el.style.getPropertyValue("--stuic-float-z-order")))
		.toBeGreaterThan(0);
	const before = Number(el.style.getPropertyValue("--stuic-float-z-order"));

	pointer(el, "pointerdown", 5, 5);
	await expect
		.poll(() => Number(el.style.getPropertyValue("--stuic-float-z-order")))
		.toBeGreaterThan(before);
});

// --- imperative API (via fixture) --------------------------------------------

test("imperative moveTo / minimize / expand drive the panel", async () => {
	const { container } = render(Fixture, { x: 10, y: 10, width: W });
	const el = root(container);
	await expect.poll(() => el.style.left).toBe("10px");

	q(container, '[data-testid="m-moveto"]')!.click();
	await expect.poll(() => el.style.left).toBe("123px");
	await expect.poll(() => el.style.top).toBe("45px");

	q(container, '[data-testid="m-minimize"]')!.click();
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("true");

	q(container, '[data-testid="m-expand"]')!.click();
	await expect.poll(() => el.getAttribute("data-minimized")).toBe("false");
});

// --- persistence (regression: must not infinite-loop) ------------------------

test("storageKey persists position across remounts", async () => {
	localStorage.removeItem("stuic-float-persist-test");
	const a = render(Float, {
		title: "P",
		x: 30,
		y: 40,
		width: W,
		storageKey: "persist-test",
		children: body,
	});
	const elA = root(a.container);
	await expect.poll(() => elA.style.left).toBe("30px");

	// drag → new position is saved
	const h = header(a.container);
	pointer(h, "pointerdown", 100, 100);
	pointer(h, "pointermove", 120, 120);
	pointer(h, "pointerup", 120, 120);
	await expect.poll(() => elA.style.left).toBe("50px"); // 30 + 20

	// a fresh mount restores the stored position, ignoring its own x/y props
	const b = render(Float, {
		title: "P",
		x: 999,
		y: 999,
		width: W,
		storageKey: "persist-test",
		children: body,
	});
	const elB = root(b.container);
	await expect.poll(() => elB.style.left).toBe("50px");
	await expect.poll(() => elB.style.top).toBe("60px"); // 40 + 20
});
