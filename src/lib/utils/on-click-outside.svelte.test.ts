import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Fixture from "./on-click-outside.fixture.svelte";

// Document-level pointerdown listener with start/stop. Locator clicks are real Chromium
// mouse interactions (pointerdown -> pointerup -> click); the touch and pseudo-element
// paths are driven with synthetic PointerEvents because Playwright has no touch pointer.

const pointerdown = (el: Element, init: PointerEventInit = {}) =>
	el.dispatchEvent(
		new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", ...init })
	);
const click = (el: Element) =>
	el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

test("fires on a primary click outside the container, not inside", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");

	await screen.getByTestId("inside").click();
	expect(onOutside).not.toHaveBeenCalled();

	await screen.getByTestId("outside").click();
	expect(onOutside).toHaveBeenCalledTimes(1);
	expect(onOutside.mock.calls[0][0]).toBeInstanceOf(PointerEvent);
});

test("ignores secondary buttons", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");

	await screen.getByTestId("outside").click({ button: "right" });
	expect(onOutside).not.toHaveBeenCalled();
});

test("a pointerdown stopped before the document does not count (stacked dialogs)", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");

	await screen.getByTestId("stopped").click();
	expect(onOutside).not.toHaveBeenCalled();
});

test("immediate: false waits for start(); stop() detaches again", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside, immediate: false });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("off");

	await screen.getByTestId("outside").click();
	expect(onOutside).not.toHaveBeenCalled();

	await screen.getByTestId("start").click();
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");
	await screen.getByTestId("outside").click();
	expect(onOutside).toHaveBeenCalledTimes(1);

	await screen.getByTestId("stop").click();
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("off");
	await screen.getByTestId("outside").click();
	expect(onOutside).toHaveBeenCalledTimes(1);
});

test("touch: fires on the click that completes the tap, so a scroll never fires it", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");
	const outside = screen.getByTestId("outside").element();

	pointerdown(outside, { pointerType: "touch" });
	expect(onOutside).not.toHaveBeenCalled();

	click(outside);
	expect(onOutside).toHaveBeenCalledTimes(1);
});

test("touch: a new press drops the pending follow-up", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");
	const outside = screen.getByTestId("outside").element();
	const inside = screen.getByTestId("inside").element();

	pointerdown(outside, { pointerType: "touch" });
	// the finger ends up inside (no click for the outside press), then a tap inside
	pointerdown(inside, { pointerType: "touch" });
	click(inside);
	expect(onOutside).not.toHaveBeenCalled();
});

test("a press reported on the container itself is judged by geometry (pseudo-elements)", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");
	const box = screen.getByTestId("box").element();
	const r = box.getBoundingClientRect();

	pointerdown(box, { clientX: r.left + 5, clientY: r.top + 5 });
	expect(onOutside).not.toHaveBeenCalled();

	pointerdown(box, { clientX: r.right + 50, clientY: r.bottom + 50 });
	expect(onOutside).toHaveBeenCalledTimes(1);
});

test("unmount removes the document listener", async () => {
	const onOutside = vi.fn();
	const screen = await render(Fixture, { onOutside });
	await expect.element(screen.getByTestId("enabled")).toHaveTextContent("on");

	await screen.unmount();
	pointerdown(document.body);
	expect(onOutside).not.toHaveBeenCalled();
});
