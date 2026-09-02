import { render } from "vitest-browser-svelte";
import { beforeEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import Fixture from "./resizable.fixture.svelte";
import type { ResizableApi } from "./resizable.js";

// The fixture lays the resized element out first in a 400x300 flex container
// (see resizable.fixture.svelte); the created handle lives inside it.
type Screen = { container: HTMLElement };
const el = (screen: Screen) =>
	screen.container.querySelector('[data-testid="el"]') as HTMLElement;
const handle = (screen: Screen) =>
	el(screen).querySelector("[data-handle]") as HTMLElement;

// Synthetic pointer events, the Slider / RangeSlider way: Playwright's .click() is a
// down+up at one point, so a drag needs dispatched PointerEvents. `setPointerCapture`
// rejects the fake pointerId, which the attachment tolerates (capture is best-effort).
function pointer(target: Element, type: string, x: number, y: number) {
	target.dispatchEvent(
		new PointerEvent(type, {
			clientX: x,
			clientY: y,
			pointerId: 1,
			button: 0,
			buttons: type === "pointerup" ? 0 : 1,
			bubbles: true,
			cancelable: true,
		})
	);
}

beforeEach(() => {
	sessionStorage.clear();
	localStorage.clear();
});

test("applies `initial`, clamps to min/max and reports through onResize", async () => {
	const onResize = vi.fn();
	const screen = render(Fixture, {
		options: { initial: 500, min: 50, max: 300, onResize },
	});
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "300px" });
	expect(onResize).toHaveBeenCalledOnce();
	expect(onResize).toHaveBeenCalledWith({
		size: 300,
		units: "px",
		axis: "x",
		container: 400,
	});
});

test("% units resolve against the parent element", async () => {
	const screen = render(Fixture, { options: { initial: 25, units: "%" } });
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "25%" });
	expect(el(screen).offsetWidth).toBe(100);
});

test("axis y resizes the height and puts the handle on the bottom edge", async () => {
	const screen = render(Fixture, {
		vertical: true,
		options: { axis: "y", initial: 120 },
	});
	await expect.element(screen.getByTestId("el")).toHaveStyle({ height: "120px" });
	const h = handle(screen);
	expect(h.getAttribute("aria-orientation")).toBe("horizontal");
	expect(h.className).toContain("bottom-0");
	expect(h.className).toContain("cursor-row-resize");
});

test("the created handle is a focusable ARIA window splitter describing the size", async () => {
	const screen = render(Fixture, {
		options: { initial: 100, min: 50, max: 300, label: "Sidebar width" },
	});
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "100px" });
	const h = handle(screen);
	expect(h.getAttribute("role")).toBe("separator");
	expect(h.getAttribute("tabindex")).toBe("0");
	expect(h.getAttribute("aria-orientation")).toBe("vertical");
	expect(h.getAttribute("aria-label")).toBe("Sidebar width");
	expect(h.getAttribute("aria-valuenow")).toBe("100");
	expect(h.getAttribute("aria-valuemin")).toBe("50");
	expect(h.getAttribute("aria-valuemax")).toBe("300");
	expect(h.getAttribute("aria-valuetext")).toBe("100px");
	// it controls the resized element, which got an id for that
	expect(el(screen).id).toMatch(/^stuic-resizable-/);
	expect(h.getAttribute("aria-controls")).toBe(el(screen).id);
	expect(h.style.touchAction).toBe("none");
	// the element hosts an absolute handle
	expect(el(screen).style.position).toBe("relative");
});

test("without min/max the aria range is 0..container (px) or 0..100 (%)", async () => {
	const screen = render(Fixture, { options: { initial: 100 } });
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "100px" });
	expect(handle(screen).getAttribute("aria-valuemin")).toBe("0");
	expect(handle(screen).getAttribute("aria-valuemax")).toBe("400");
	screen.unmount();

	const screen2 = render(Fixture, { options: { initial: 25, units: "%" } });
	await expect.element(screen2.getByTestId("el")).toHaveStyle({ width: "25%" });
	expect(handle(screen2).getAttribute("aria-valuemax")).toBe("100");
	expect(handle(screen2).getAttribute("aria-valuetext")).toBe("25%");
});

test("keyboard: arrows step (Shift x10), Home/End hit the bounds, Enter resets", async () => {
	const onResize = vi.fn();
	const screen = render(Fixture, {
		options: { initial: 100, min: 50, max: 300, step: 10, onResize },
	});
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "100px" });
	handle(screen).focus();

	await userEvent.keyboard("{ArrowRight}");
	await expect.element(target).toHaveStyle({ width: "110px" });
	expect(handle(screen).getAttribute("aria-valuenow")).toBe("110");

	await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
	await expect.element(target).toHaveStyle({ width: "90px" });

	await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
	await expect.element(target).toHaveStyle({ width: "190px" });

	await userEvent.keyboard("{Home}");
	await expect.element(target).toHaveStyle({ width: "50px" });

	await userEvent.keyboard("{End}");
	await expect.element(target).toHaveStyle({ width: "300px" });

	await userEvent.keyboard("{Enter}");
	await expect.element(target).toHaveStyle({ width: "100px" });

	// cross-axis keys are not the splitter's business
	await userEvent.keyboard("{ArrowDown}");
	await expect.element(target).toHaveStyle({ width: "100px" });

	// setup + 7 handled presses
	expect(onResize).toHaveBeenCalledTimes(8);
	expect(onResize.mock.lastCall?.[0].size).toBe(100);
});

test("`reverse` inverts the keys, like it inverts the drag", async () => {
	const screen = render(Fixture, { options: { initial: 100, reverse: true } });
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "100px" });
	expect(handle(screen).className).toContain("left-0");
	handle(screen).focus();
	await userEvent.keyboard("{ArrowLeft}");
	await expect.element(target).toHaveStyle({ width: "110px" });
	await userEvent.keyboard("{ArrowRight}");
	await expect.element(target).toHaveStyle({ width: "100px" });
});

test("axis y listens to ArrowUp/ArrowDown, in % steps of 1", async () => {
	const screen = render(Fixture, {
		vertical: true,
		options: { axis: "y", units: "%", initial: 50 },
	});
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ height: "50%" });
	expect(el(screen).offsetHeight).toBe(150);
	handle(screen).focus();
	await userEvent.keyboard("{ArrowDown}");
	await expect.element(target).toHaveStyle({ height: "51%" });
	expect(el(screen).offsetHeight).toBe(153);
	await userEvent.keyboard("{ArrowRight}");
	expect(el(screen).style.height).toBe("51%");
	await userEvent.keyboard("{ArrowUp}{ArrowUp}");
	await expect.element(target).toHaveStyle({ height: "49%" });
	expect(el(screen).offsetHeight).toBe(147);
});

test("pointer drag resizes from the grab point and flags the handle while dragging", async () => {
	const onResize = vi.fn();
	const screen = render(Fixture, { options: { initial: 100, max: 300, onResize } });
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "100px" });
	const h = handle(screen);
	const r = h.getBoundingClientRect();

	pointer(h, "pointerdown", r.left, r.top + 10);
	expect(h.hasAttribute("data-resizing")).toBe(true);
	expect(document.body.style.userSelect).toBe("none");
	expect(document.body.style.cursor).toBe("col-resize");

	pointer(h, "pointermove", r.left + 50, r.top + 10);
	await expect.element(target).toHaveStyle({ width: "150px" });
	pointer(h, "pointermove", r.left + 500, r.top + 10);
	await expect.element(target).toHaveStyle({ width: "300px" });

	pointer(h, "pointerup", r.left + 500, r.top + 10);
	expect(h.hasAttribute("data-resizing")).toBe(false);
	expect(document.body.style.userSelect).toBe("");
	expect(document.body.style.cursor).toBe("");

	// a move after the release is not a drag
	pointer(h, "pointermove", r.left + 10, r.top + 10);
	await expect.element(target).toHaveStyle({ width: "300px" });
	expect(onResize.mock.lastCall?.[0]).toEqual({
		size: 300,
		units: "px",
		axis: "x",
		container: 400,
	});
});

test("double-click resets to `resetTo` (defaults to `initial`)", async () => {
	const screen = render(Fixture, { options: { initial: 100, resetTo: 150 } });
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "100px" });
	handle(screen).focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.element(target).toHaveStyle({ width: "110px" });
	handle(screen).dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
	await expect.element(target).toHaveStyle({ width: "150px" });
});

test("`key` persists the size and a fresh setup restores it over `initial`", async () => {
	const screen = render(Fixture, { options: { initial: 100, key: "t-persist" } });
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "100px" });
	handle(screen).focus();
	await userEvent.keyboard("{ArrowRight}{ArrowRight}");
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "120px" });
	expect(sessionStorage.getItem("resizable-width-t-persist")).toContain("120");
	screen.unmount();

	const again = render(Fixture, { options: { initial: 100, key: "t-persist" } });
	await expect.element(again.getByTestId("el")).toHaveStyle({ width: "120px" });
	// …and Enter still means the configured initial, not the restored size
	handle(again).focus();
	await userEvent.keyboard("{Enter}");
	await expect.element(again.getByTestId("el")).toHaveStyle({ width: "100px" });
});

test("a provided handle gets the semantics and is restored on cleanup", async () => {
	const screen = render(Fixture, { external: true, options: { initial: 100, max: 300 } });
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "100px" });
	// nothing was created inside the element, the sibling is the handle
	expect(el(screen).querySelector("[data-handle]")).toBeNull();
	expect(el(screen).style.position).toBe("");
	const h = screen.container.querySelector('[data-testid="handle"]') as HTMLElement;
	await expect.element(screen.getByTestId("handle")).toHaveAttribute("role", "separator");
	expect(h.getAttribute("tabindex")).toBe("0");
	expect(h.getAttribute("aria-valuenow")).toBe("100");
	expect(h.getAttribute("aria-controls")).toBe(el(screen).id);
	expect(h.style.touchAction).toBe("none");

	h.focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.element(target).toHaveStyle({ width: "110px" });

	const resized = el(screen);
	await screen.getByTestId("unmount").click();
	await expect.element(screen.getByTestId("handle")).not.toBeInTheDocument();
	// the detached handle is as it was: own attributes kept, ours gone
	expect(h.getAttribute("data-foo")).toBe("bar");
	expect(h.hasAttribute("role")).toBe(false);
	expect(h.hasAttribute("tabindex")).toBe(false);
	expect(h.hasAttribute("aria-valuenow")).toBe(false);
	expect(h.hasAttribute("aria-controls")).toBe(false);
	expect(h.style.touchAction).toBe("");
	expect(resized.id).toBe("");
});

test("enabled: false sets nothing up", async () => {
	const screen = render(Fixture, { options: { enabled: false, initial: 200 } });
	await expect.element(screen.getByTestId("el")).toHaveStyle({ width: "100px" });
	expect(el(screen).querySelector("[data-handle]")).toBeNull();
});

test("onInit hands out an api: set() clamps and persists, reset() restores", async () => {
	let api: ResizableApi | undefined;
	const onResize = vi.fn();
	const screen = render(Fixture, {
		options: { initial: 100, max: 300, onResize, onInit: (a) => (api = a) },
	});
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "100px" });
	expect(api?.current).toBe(100);
	api!.set(500);
	await expect.element(target).toHaveStyle({ width: "300px" });
	expect(api?.current).toBe(300);
	expect(handle(screen).getAttribute("aria-valuenow")).toBe("300");
	expect(onResize.mock.lastCall?.[0].size).toBe(300);
	api!.reset();
	await expect.element(target).toHaveStyle({ width: "100px" });
});

test("resizableWidth action: same handle, legacy `{ width }` payload", async () => {
	const onResize = vi.fn();
	const screen = render(Fixture, { action: { initial: 120, max: 300, onResize } });
	const target = screen.getByTestId("el");
	await expect.element(target).toHaveStyle({ width: "120px" });
	expect(onResize).toHaveBeenCalledWith({ width: 120, units: "px", container: 400 });
	const h = handle(screen);
	expect(h.getAttribute("role")).toBe("separator");
	h.focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.element(target).toHaveStyle({ width: "130px" });
	expect(onResize.mock.lastCall?.[0]).toEqual({
		width: 130,
		units: "px",
		container: 400,
	});
});
