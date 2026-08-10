import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { userEvent } from "vitest/browser";
import Slider from "./Slider.svelte";
import SliderHarness from "./SliderHarness.test.svelte";

// Component CSS is NOT loaded in browser tests, so the root gets an explicit
// inline size and the interaction math (which reads the root's rect) works.
// Unstyled children (track/fill/thumb) collapse to zero height, and the hidden
// range input renders visible at the top of the root (its Tailwind classes are
// inert here) — so pointer tests click LOW (y near the bottom) to hit the root
// itself, not the input.
//
// Geometry cheat sheet (200x32 horizontal, thumb mode): pad = 32/2 = 16,
// travel = 200 - 32 = 168, so clicking x maps to ratio (x - 16) / 168.
const H = "width:200px;height:32px";
const V = "width:32px;height:200px";

const input = (screen: { getByRole: (role: string) => { element: () => Element } }) =>
	screen.getByRole("slider").element() as HTMLInputElement;

// Real pointer drags: Playwright's .click() only ever produces down+up at one
// point, so pointermove (and the grab-offset / pointerId logic that only runs
// there) needs synthetic PointerEvents dispatched at the root, the same pattern
// Float.svelte.test.ts uses. `pointerId` matters — the component ignores events
// from any pointer other than the one that started the drag.
function pointer(el: Element, type: string, x: number, y: number, pointerId = 1) {
	el.dispatchEvent(
		new PointerEvent(type, {
			clientX: x,
			clientY: y,
			pointerId,
			button: 0,
			buttons: type === "pointerup" ? 0 : 1,
			bubbles: true,
			cancelable: true,
		})
	);
}

/** Root-relative -> client coords (the root is laid out by the test page). */
function at(el: Element, x: number, y: number): [number, number] {
	const r = el.getBoundingClientRect();
	return [r.left + x, r.top + y];
}

test("renders root with conventional data attributes and the hidden range input", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H });
	const root = screen.getByTestId("sl");
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-slider");
	await expect.element(root).toHaveAttribute("data-orientation", "horizontal");
	await expect.element(root).toHaveAttribute("data-thumb", "true");
	await expect.element(root).toHaveAttribute("data-size", "md");
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
});

test("value/min/max/step/name/label are reflected on the range input", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 30,
		min: 10,
		max: 90,
		step: 5,
		name: "vol",
		label: "Volume",
	});
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	const el = input(screen);
	expect(el.value).toBe("30");
	expect(el.min).toBe("10");
	expect(el.max).toBe("90");
	expect(el.step).toBe("5");
	expect(el.name).toBe("vol");
	expect(el.getAttribute("aria-label")).toBe("Volume");
});

test("an undefined value normalizes to min", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, min: 10, max: 20 });
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	await expect.poll(() => input(screen).value).toBe("10");
});

// The normalization $effect writes back into the *binding*; asserting the input's
// value only proves the internal derived. These use the harness, whose `bound`
// output renders what the consumer's variable actually holds.
test("normalization writes back into the binding: undefined -> min", async () => {
	const screen = render(SliderHarness, { initial: undefined, min: 10, max: 20 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("10");
});

test("normalization writes back into the binding: out of range -> clamped", async () => {
	const screen = render(SliderHarness, { initial: 150 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("100");
});

test("normalization writes back into the binding: NaN -> min (no update-depth crash)", async () => {
	const screen = render(SliderHarness, { initial: NaN, min: 5, max: 20 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("5");
});

test("normalization writes back into the binding: off-grid -> snapped", async () => {
	// The browser sanitizes an off-grid range value onto the step grid; the bound
	// value must follow, or form submission would disagree with the display.
	const screen = render(SliderHarness, { initial: 30, min: 0, max: 100, step: 25 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("25");
	await expect.poll(() => input(screen).value).toBe("25");
});

test("non-finite min/max fall back to sane bounds instead of crashing", async () => {
	// NaN bounds used to make every normalization write NaN, and NaN !== NaN
	// re-triggered the effect forever (effect_update_depth_exceeded).
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		min: Number("nope"),
		max: Number("nope"),
		value: 42,
	});
	await expect.element(screen.getByTestId("sl")).toBeInTheDocument();
	const el = input(screen);
	expect(el.min).toBe("0");
	expect(el.max).toBe("100");
	expect(el.value).toBe("42");
});

test("pointer-down on the track jumps the value to that position (thumb-padded mapping)", async () => {
	const oninput = vi.fn();
	const onchange = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 0,
		oninput,
		onchange,
	});
	// x=100 -> (100 - 16) / 168 = 0.5 -> 50
	await screen.getByTestId("sl").click({ position: { x: 100, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("50");
	expect(oninput).toHaveBeenCalledWith(50);
	expect(onchange).toHaveBeenCalledExactlyOnceWith(50);
});

test("pointer positions outside the travel range clamp to min/max", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 50 });
	// x=4 is inside the start dead-zone (pad=16) -> clamps to 0
	await screen.getByTestId("sl").click({ position: { x: 4, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("0");
	// x=197 is inside the end dead-zone -> clamps to 100
	await screen.getByTestId("sl").click({ position: { x: 197, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("100");
});

test("thumb=false maps the pointer linearly across the whole track", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 0,
		thumb: false,
	});
	// x=50 -> 50/200 = 0.25 -> 25
	await screen.getByTestId("sl").click({ position: { x: 50, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("25");
	// no thumb element rendered
	expect(screen.container.querySelector(".thumb")).toBeNull();
});

test('thumbPosition="start" pins the thumb and maps the pointer linearly', async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 0,
		thumbPosition: "start",
	});
	const root = screen.getByTestId("sl");
	await expect.element(root).toHaveAttribute("data-thumb-position", "start");
	await expect.element(root).toHaveAttribute("data-thumb-travels", "false");
	// thumb still rendered, but the mapping is the un-padded (linear) one:
	// x=50 -> 50/200 = 0.25 -> 25 (a traveling thumb would give (50-16)/168 ≈ 20)
	expect(screen.container.querySelector(".thumb")).not.toBeNull();
	await root.click({ position: { x: 50, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("25");
});

test('the default thumbPosition="value" travels with the value', async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 0 });
	const root = screen.getByTestId("sl");
	await expect.element(root).toHaveAttribute("data-thumb-position", "value");
	await expect.element(root).toHaveAttribute("data-thumb-travels", "true");
});

test("fillRounded sets the data attribute driving the rounded-fill CSS", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 50,
		fillRounded: true,
	});
	await expect
		.element(screen.getByTestId("sl"))
		.toHaveAttribute("data-fill-rounded", "true");
	const plain = render(Slider, { "data-testid": "sl2", style: H, value: 50 });
	await expect.element(plain.getByTestId("sl2")).toBeInTheDocument();
	expect(plain.getByTestId("sl2").element().getAttribute("data-fill-rounded")).toBe(null);
});

test("vertical orientation maps bottom->min, top->max", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: V,
		orientation: "vertical",
		value: 0,
	});
	// y=100 (center) -> pos = 200-100 = 100 -> (100-16)/168 = 0.5 -> 50
	await screen.getByTestId("sl").click({ position: { x: 16, y: 100 } });
	await expect.poll(() => input(screen).value).toBe("50");
	// near the bottom -> min
	await screen.getByTestId("sl").click({ position: { x: 16, y: 197 } });
	await expect.poll(() => input(screen).value).toBe("0");
});

test("values snap to the step grid", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 0, step: 10 });
	// x=108 -> (108-16)/168 = 0.5476 -> 54.76 -> snaps to 50
	await screen.getByTestId("sl").click({ position: { x: 108, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("50");
});

test("fractional steps produce clean values (no float noise)", async () => {
	const oninput = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		min: 0,
		max: 1,
		step: 0.1,
		value: 0,
		oninput,
	});
	// x=66 -> r=(66-16)/168=0.2976 -> round(2.976)=3 -> 3*0.1 is
	// 0.30000000000000004 in IEEE-754; the decimal trim must produce exactly 0.3.
	await screen.getByTestId("sl").click({ position: { x: 66, y: 30 } });
	expect(oninput).toHaveBeenCalledWith(0.3);
});

test("exponential-notation steps (below 1e-6) still resolve distinct values", async () => {
	// String(1e-7) is "1e-7" — a naive indexOf(".") decimal count returns 0 and
	// toFixed(0) collapses every value to 0.
	const oninput = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		min: 0,
		max: 0.000001,
		step: 0.0000001,
		value: 0,
		oninput,
	});
	await screen.getByTestId("sl").click({ position: { x: 100, y: 30 } });
	expect(oninput).toHaveBeenCalledWith(0.0000005);
});

test("auto ticks include the max even with fractional steps", async () => {
	// 0 + 3 * 0.1 = 0.30000000000000004 > max, which used to drop the last tick.
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		min: 0,
		max: 0.3,
		step: 0.1,
		ticks: true,
	});
	await expect.element(screen.getByTestId("sl")).toBeInTheDocument();
	expect(
		screen.container.querySelectorAll(".ticks:not([data-on-fill]) .tick").length
	).toBe(4);
});

test("dragging tracks the pointer and commits once on release", async () => {
	const oninput = vi.fn();
	const onchange = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 0,
		oninput,
		onchange,
	});
	const root = screen.getByTestId("sl").element();

	pointer(root, "pointerdown", ...at(root, 16, 30));
	await expect.poll(() => input(screen).value).toBe("0");
	await expect.element(screen.getByTestId("sl")).toHaveAttribute("data-dragging", "true");

	pointer(root, "pointermove", ...at(root, 100, 30));
	await expect.poll(() => input(screen).value).toBe("50");
	pointer(root, "pointermove", ...at(root, 184, 30));
	await expect.poll(() => input(screen).value).toBe("100");

	// oninput fires per change, onchange only once on release
	expect(onchange).not.toHaveBeenCalled();
	pointer(root, "pointerup", ...at(root, 184, 30));
	expect(onchange).toHaveBeenCalledExactlyOnceWith(100);
	expect(oninput.mock.calls.map((c) => c[0])).toEqual([50, 100]);
	await expect
		.poll(() => screen.getByTestId("sl").element().getAttribute("data-dragging"))
		.toBe(null);
});

test("grabbing the thumb does not jump the value; the drag continues from the grab point", async () => {
	const oninput = vi.fn();
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 50, oninput });
	const root = screen.getByTestId("sl").element();

	// The thumb center for value 50 is at x=100; press 8px off-center (still on
	// the thumb, whose radius is pad=16) — the value must NOT move.
	pointer(root, "pointerdown", ...at(root, 108, 30));
	expect(oninput).not.toHaveBeenCalled();
	expect(input(screen).value).toBe("50");

	// Moving 16.8px (= 10% of travel) raises it by exactly 10, not to the
	// absolute position of the pointer.
	pointer(root, "pointermove", ...at(root, 124.8, 30));
	await expect.poll(() => input(screen).value).toBe("60");
	pointer(root, "pointerup", ...at(root, 124.8, 30));
});

test("a second concurrent pointer cannot hijack or end an active drag", async () => {
	const onchange = vi.fn();
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 0, onchange });
	const root = screen.getByTestId("sl").element();

	pointer(root, "pointerdown", ...at(root, 16, 30), 1);
	pointer(root, "pointermove", ...at(root, 100, 30), 1);
	await expect.poll(() => input(screen).value).toBe("50");

	// A second finger touches down and moves — both are ignored.
	pointer(root, "pointerdown", ...at(root, 184, 30), 2);
	pointer(root, "pointermove", ...at(root, 184, 30), 2);
	expect(input(screen).value).toBe("50");
	// ...and its release does not commit or end the first drag.
	pointer(root, "pointerup", ...at(root, 184, 30), 2);
	expect(onchange).not.toHaveBeenCalled();
	await expect.element(screen.getByTestId("sl")).toHaveAttribute("data-dragging", "true");

	pointer(root, "pointerup", ...at(root, 100, 30), 1);
	expect(onchange).toHaveBeenCalledExactlyOnceWith(50);
});

test("disabled mid-drag aborts without applying or committing", async () => {
	// Via the harness: `rerender` re-applies the initial `value` prop and would
	// clobber the binding, so the harness flips `disabled` from the inside.
	const onchange = vi.fn();
	const screen = render(SliderHarness, { initial: 0, onchange });
	const root = screen.getByTestId("sl").element();
	pointer(root, "pointerdown", ...at(root, 100, 30));
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("50");

	await screen.getByTestId("disable").click();
	pointer(root, "pointermove", ...at(root, 184, 30));
	pointer(root, "pointerup", ...at(root, 184, 30));
	// the move was ignored and no commit happened
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("50");
	expect(onchange).not.toHaveBeenCalled();
	await expect
		.poll(() => screen.getByTestId("sl").element().getAttribute("data-dragging"))
		.toBe(null);
});

test("a right-click does not raise the keyboard focus ring", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 50 });
	const root = screen.getByTestId("sl").element();
	const [x, y] = at(root, 100, 30);
	root.dispatchEvent(
		new PointerEvent("pointerdown", {
			clientX: x,
			clientY: y,
			pointerId: 3,
			button: 2,
			buttons: 2,
			bubbles: true,
			cancelable: true,
		})
	);
	// the browser still focuses the full-size hidden input on a non-primary press
	input(screen).focus();
	expect(screen.getByTestId("sl").element().getAttribute("data-ring")).toBe(null);
	// ...while a genuine keyboard focus still shows it
	input(screen).blur();
	input(screen).focus();
	await expect.element(screen.getByTestId("sl")).toHaveAttribute("data-ring", "true");
});

test("RTL flips the horizontal mapping", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H + ";direction:rtl",
		value: 0,
	});
	// x=50 from the left is 150 from the right edge -> (150-16)/168 ≈ 0.798 -> 80
	await screen.getByTestId("sl").click({ position: { x: 50, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("80");
});

test("committing an unchanged value does not fire onchange (native-faithful)", async () => {
	const onchange = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 50,
		onchange,
	});
	// x=100 maps exactly to the current value 50 -> no input, no change
	await screen.getByTestId("sl").click({ position: { x: 100, y: 30 } });
	expect(onchange).not.toHaveBeenCalled();
	expect(input(screen).value).toBe("50");
});

test("keyboard on the focused input steps the value natively (horizontal)", async () => {
	const oninput = vi.fn();
	const onchange = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 50,
		oninput,
		onchange,
	});
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	input(screen).focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.poll(() => input(screen).value).toBe("51");
	expect(oninput).toHaveBeenCalledWith(51);
	expect(onchange).toHaveBeenCalledWith(51);
});

test("keyboard ArrowUp increases the value in vertical mode", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: V,
		orientation: "vertical",
		value: 50,
	});
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	input(screen).focus();
	await userEvent.keyboard("{ArrowUp}");
	await expect.poll(() => input(screen).value).toBe("51");
});

test("disabled ignores pointer interaction and disables the input", async () => {
	const oninput = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 40,
		disabled: true,
		oninput,
	});
	await expect.element(screen.getByTestId("sl")).toHaveAttribute("data-disabled", "true");
	await screen.getByTestId("sl").click({ position: { x: 100, y: 30 } });
	expect(oninput).not.toHaveBeenCalled();
	expect(input(screen).value).toBe("40");
	expect(input(screen).disabled).toBe(true);
});

test("ticks=true renders a tick per step; an array renders explicit (in-range) ticks", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		step: 25,
		ticks: true,
	});
	await expect.element(screen.getByTestId("sl")).toBeInTheDocument();
	// 0,25,50,75,100 — rendered in both the base and the on-fill layer
	expect(screen.container.querySelectorAll(".ticks").length).toBe(2);
	expect(
		screen.container.querySelectorAll(".ticks:not([data-on-fill]) .tick").length
	).toBe(5);
	expect(
		screen.container.querySelectorAll('.ticks[data-on-fill="true"] .tick').length
	).toBe(5);

	const screen2 = render(Slider, {
		"data-testid": "sl2",
		style: H,
		ticks: [0, 50, 150],
	});
	await expect.element(screen2.getByTestId("sl2")).toBeInTheDocument();
	// 150 is out of range and filtered out
	expect(
		screen2.container.querySelectorAll(".ticks:not([data-on-fill]) .tick").length
	).toBe(2);
});

test("excessive auto ticks are skipped with a console warning", async () => {
	const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
	try {
		const screen = render(Slider, {
			"data-testid": "sl",
			style: H,
			min: 0,
			max: 1000,
			step: 1,
			ticks: true,
		});
		await expect.element(screen.getByTestId("sl")).toBeInTheDocument();
		expect(screen.container.querySelectorAll(".tick").length).toBe(0);
		expect(warn).toHaveBeenCalledOnce();
	} finally {
		warn.mockRestore();
	}
});

test("duplicate values in an explicit ticks array dedupe instead of crashing", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		ticks: [0, 50, 50, 100],
	});
	await expect.element(screen.getByTestId("sl")).toBeInTheDocument();
	expect(
		screen.container.querySelectorAll(".ticks:not([data-on-fill]) .tick").length
	).toBe(3);
});

test("an out-of-range bound value is clamped back into range", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 150 });
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	await expect.poll(() => input(screen).value).toBe("100");
});

test("invalid step (0/negative) is normalized to a continuous input step", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, step: 0 });
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	expect(input(screen).step).toBe("any");
});

test("with max off the step grid, the last grid point is the ceiling (native-faithful)", async () => {
	const onchange = vi.fn();
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		min: 0,
		max: 95,
		step: 10,
		value: 0,
		onchange,
	});
	// far end -> clamps to the last reachable grid point 90, not the off-grid 95
	await screen.getByTestId("sl").click({ position: { x: 197, y: 30 } });
	await expect.poll(() => input(screen).value).toBe("90");
	expect(onchange).toHaveBeenCalledExactlyOnceWith(90);
});

test("focus ring: keyboard-initiated focus sets data-ring, pointer-initiated does not", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, value: 50 });
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	// programmatic (non-pointer) focus behaves like keyboard focus
	input(screen).focus();
	await expect.element(screen.getByTestId("sl")).toHaveAttribute("data-ring", "true");
	input(screen).blur();
	await expect
		.poll(() => screen.getByTestId("sl").element().getAttribute("data-ring"))
		.toBe(null);
	// pointer interaction focuses the input without showing the ring
	await screen.getByTestId("sl").click({ position: { x: 150, y: 30 } });
	expect(document.activeElement).toBe(input(screen));
	expect(screen.getByTestId("sl").element().getAttribute("data-ring")).toBe(null);
});

test("id is forwarded to the underlying input", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, id: "my-slider" });
	await expect.element(screen.getByRole("slider")).toBeInTheDocument();
	expect(input(screen).id).toBe("my-slider");
});

test("thumb and valueLabel snippets render with the current value context", async () => {
	const thumb = createRawSnippet<[{ value: number }]>((ctx) => ({
		render: () => `<span data-testid="in-thumb">t${ctx().value}</span>`,
	}));
	const valueLabel = createRawSnippet<[{ value: number }]>((ctx) => ({
		render: () => `<span data-testid="in-label">v${ctx().value}</span>`,
	}));
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		value: 42,
		thumb,
		valueLabel,
	});
	await expect.element(screen.getByTestId("in-thumb")).toHaveTextContent("t42");
	await expect.element(screen.getByTestId("in-label")).toHaveTextContent("v42");
});

test("unstyled omits the base class and preset data attributes", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		unstyled: true,
		class: "custom",
		intent: "success",
	});
	const root = screen.getByTestId("sl");
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).not.toHaveClass("stuic-slider");
	await expect.element(root).toHaveClass("custom");
	expect(root.element().getAttribute("data-size")).toBeNull();
	expect(root.element().getAttribute("data-intent")).toBeNull();
	// ...but the functional CSS hook survives — it carries touch-action/position,
	// without which dragging breaks on touch devices.
	expect(root.element().hasAttribute("data-stuic-slider")).toBe(true);
});

test("unstyled renders a single tick layer (nothing clips the on-fill copy)", async () => {
	const screen = render(Slider, {
		"data-testid": "sl",
		style: H,
		unstyled: true,
		step: 25,
		ticks: true,
	});
	await expect.element(screen.getByTestId("sl")).toBeInTheDocument();
	expect(screen.container.querySelectorAll(".ticks").length).toBe(1);
	expect(screen.container.querySelectorAll(".tick").length).toBe(5);
});

test("intent is reflected via the data-intent attribute", async () => {
	const screen = render(Slider, { "data-testid": "sl", style: H, intent: "warning" });
	await expect
		.element(screen.getByTestId("sl"))
		.toHaveAttribute("data-intent", "warning");
});

test("an externally set bound value resyncs the slider (harness)", async () => {
	const screen = render(SliderHarness, { initial: 20 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("20");
	await screen.getByTestId("set").click();
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("77");
	await expect.poll(() => input(screen).value).toBe("77");
});
