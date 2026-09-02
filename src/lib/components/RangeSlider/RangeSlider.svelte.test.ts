import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { userEvent } from "vitest/browser";
import RangeSlider, { type RangeSliderRenderCtx } from "./RangeSlider.svelte";
import RangeSliderHarness from "./RangeSliderHarness.test.svelte";
import { createRangeSliderT } from "./i18n.js";
import { RANGE_SLIDER_MESSAGES_SK } from "./i18n-sk.js";

// Component CSS is NOT loaded in browser tests, so the root gets an explicit
// inline size and the interaction math (which reads the root's rect) works.
// Unstyled children (track/fill/thumbs) collapse to zero height, and the two
// hidden range inputs render visible, stacked at the top of the root (nothing
// positions them here) — pointer events on them bubble to the root handler,
// which is all the interaction needs.
//
// Geometry cheat sheet (200x32 horizontal, thumbs on): pad = 32/2 = 16,
// travel = 200 - 32 = 168, so x maps to ratio (x - 16) / 168, and a thumb at
// value v sits at x = 16 + 168 * v / 100 (40 -> 83.2, 50 -> 100, 80 -> 150.4).
// A press picks the NEAREST thumb (in px), so the assertions below always
// spell out which one is expected to move.
const H = "width:200px;height:32px";
const V = "width:32px;height:200px";

type Screen = { container: HTMLElement };

const startInput = (screen: Screen) =>
	screen.container.querySelector('input[data-thumb="start"]') as HTMLInputElement;
const endInput = (screen: Screen) =>
	screen.container.querySelector('input[data-thumb="end"]') as HTMLInputElement;
/** Both hidden inputs' values, as the form would submit them. */
const values = (screen: Screen) => [startInput(screen).value, endInput(screen).value];

// Real pointer drags: Playwright's .click() only ever produces down+up at one
// point, so pointermove (and the grab-offset / pointerId / tie-break logic that
// only runs there) needs synthetic PointerEvents dispatched at the root, the
// same pattern Slider.svelte.test.ts uses. `pointerId` matters — the component
// ignores events from any pointer other than the one that started the press.
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

test("renders a labelled group with two range inputs and conventional data attributes", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		label: "Price",
		start: 20,
		end: 80,
		min: 10,
		max: 90,
		step: 5,
		nameStart: "price_min",
		nameEnd: "price_max",
	});
	const root = screen.getByTestId("rs");
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-range-slider");
	await expect.element(root).toHaveAttribute("role", "group");
	await expect.element(root).toHaveAttribute("aria-label", "Price");
	await expect.element(root).toHaveAttribute("data-orientation", "horizontal");
	await expect.element(root).toHaveAttribute("data-thumbs", "true");
	await expect.element(root).toHaveAttribute("data-size", "md");
	await expect
		.element(screen.getByRole("slider", { name: "Minimum" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("slider", { name: "Maximum" }))
		.toBeInTheDocument();

	const s = startInput(screen);
	const e = endInput(screen);
	expect(values(screen)).toEqual(["20", "80"]);
	expect([s.min, s.max, s.step]).toEqual(["10", "90", "5"]);
	expect([e.min, e.max, e.step]).toEqual(["10", "90", "5"]);
	expect([s.name, e.name]).toEqual(["price_min", "price_max"]);

	// the CSS contract: per-thumb ratios + the split midpoint are inline custom
	// properties on the root ((20-10)/80 = 0.125, (80-10)/80 = 0.875)
	const el = root.element() as HTMLElement;
	expect(el.style.getPropertyValue("--_ratio-start")).toBe("0.125");
	expect(el.style.getPropertyValue("--_ratio-end")).toBe("0.875");
	expect(el.style.getPropertyValue("--_mid")).toBe("0.5");
});

test("thumb names: labelStart/labelEnd override the defaults, which come from t", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		labelStart: "Lowest price",
		labelEnd: "Highest price",
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	expect(startInput(screen).getAttribute("aria-label")).toBe("Lowest price");
	expect(endInput(screen).getAttribute("aria-label")).toBe("Highest price");

	const sk = render(RangeSlider, {
		"data-testid": "rs2",
		style: H,
		t: createRangeSliderT(RANGE_SLIDER_MESSAGES_SK),
	});
	await expect.element(sk.getByTestId("rs2")).toBeInTheDocument();
	expect(startInput(sk).getAttribute("aria-label")).toBe(
		RANGE_SLIDER_MESSAGES_SK.minimum
	);
	expect(endInput(sk).getAttribute("aria-label")).toBe(RANGE_SLIDER_MESSAGES_SK.maximum);
});

// The normalization $effect writes back into the *bindings*; asserting the
// inputs' values only proves the internal derived. These use the harness, whose
// `bound` output renders what the consumer's variables actually hold. (One
// harness per test: locators are page-scoped, and its test ids are fixed.)
test("undefined values default to the full range", async () => {
	const screen = render(RangeSliderHarness, { min: 10, max: 90 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("10,90");
});

test("with max off the step grid, the end defaults to the last grid point, not to max", async () => {
	const screen = render(RangeSliderHarness, { min: 0, max: 95, step: 10 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("0,90");
	expect(values(screen)).toEqual(["0", "90"]);
});

test("normalization writes back into the bindings: a reversed pair is reordered", async () => {
	const screen = render(RangeSliderHarness, { initialStart: 80, initialEnd: 20 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("20,80");
});

test("normalization writes back into the bindings: out of range -> clamped", async () => {
	const screen = render(RangeSliderHarness, { initialStart: -5, initialEnd: 150 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("0,100");
});

test("normalization writes back into the bindings: off-grid -> snapped", async () => {
	// The browser sanitizes an off-grid range value onto the step grid; the bound
	// values must follow, or form submission would disagree with the display.
	const screen = render(RangeSliderHarness, {
		initialStart: 30,
		initialEnd: 70,
		step: 25,
	});
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("25,75");
	expect(values(screen)).toEqual(["25", "75"]);
});

test("normalization writes back into the bindings: NaN -> bounds (no update-depth crash)", async () => {
	const screen = render(RangeSliderHarness, {
		initialStart: NaN,
		initialEnd: NaN,
		min: 5,
		max: 20,
	});
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("5,20");
});

test("minRange on the bindings: the end is pushed up", async () => {
	const screen = render(RangeSliderHarness, {
		initialStart: 50,
		initialEnd: 52,
		minRange: 10,
	});
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("50,60");
});

test("minRange on the bindings: at the ceiling the start is pushed down", async () => {
	const screen = render(RangeSliderHarness, {
		initialStart: 95,
		initialEnd: 100,
		minRange: 10,
	});
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("90,100");
});

test("minRange is rounded UP onto the step grid (15 with step 10 -> 20)", async () => {
	const screen = render(RangeSliderHarness, {
		initialStart: 50,
		initialEnd: 50,
		step: 10,
		minRange: 15,
	});
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("50,70");
});

test("minRange wider than the whole span pins the thumbs to the full range", async () => {
	const screen = render(RangeSliderHarness, {
		initialStart: 40,
		initialEnd: 60,
		minRange: 500,
	});
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("0,100");
	// ...and nothing can move them
	await screen.getByTestId("rs").click({ position: { x: 100, y: 30 } });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("0,100");
});

test("non-finite min/max fall back to sane bounds instead of crashing", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		min: Number("nope"),
		max: Number("nope"),
		start: 20,
		end: 42,
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	expect([startInput(screen).min, startInput(screen).max]).toEqual(["0", "100"]);
	expect(values(screen)).toEqual(["20", "42"]);
});

test("a track press jumps the NEAREST thumb there and commits it", async () => {
	const oninput = vi.fn();
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 40,
		end: 80,
		oninput,
		onchange,
	});
	// x=50 -> 20: nearer to the start thumb (83.2) than to the end one (150.4)
	await screen.getByTestId("rs").click({ position: { x: 50, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["20", "80"]);
	expect(oninput).toHaveBeenCalledWith({ start: 20, end: 80 }, "start");
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: 20, end: 80 }, "start");

	// x=184 -> 100: the end thumb
	await screen.getByTestId("rs").click({ position: { x: 184, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["20", "100"]);
	expect(onchange).toHaveBeenLastCalledWith({ start: 20, end: 100 }, "end");
	expect(onchange).toHaveBeenCalledTimes(2);
});

test("a press between the thumbs moves the nearer one", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 40,
		end: 80,
	});
	// x=100 -> 50: 16.8px from the start thumb, 50.4px from the end thumb
	await screen.getByTestId("rs").click({ position: { x: 100, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["50", "80"]);
});

test("thumbs never cross: a thumb dragged past the other stops at it", async () => {
	const oninput = vi.fn();
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 40,
		end: 80,
		oninput,
		onchange,
	});
	const root = screen.getByTestId("rs").element();
	// grab the start thumb dead center and drag it to the far end
	pointer(root, "pointerdown", ...at(root, 83.2, 30));
	await expect
		.element(screen.getByTestId("rs"))
		.toHaveAttribute("data-dragging", "start");
	pointer(root, "pointermove", ...at(root, 184, 30));
	await expect.poll(() => values(screen)).toEqual(["80", "80"]);
	expect(oninput).toHaveBeenLastCalledWith({ start: 80, end: 80 }, "start");
	pointer(root, "pointerup", ...at(root, 184, 30));
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: 80, end: 80 }, "start");
	await expect
		.poll(() => screen.getByTestId("rs").element().getAttribute("data-dragging"))
		.toBe(null);
});

test("minRange keeps the thumbs apart while dragging", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 40,
		end: 80,
		minRange: 10,
	});
	const root = screen.getByTestId("rs").element();
	pointer(root, "pointerdown", ...at(root, 83.2, 30));
	pointer(root, "pointermove", ...at(root, 184, 30));
	await expect.poll(() => values(screen)).toEqual(["70", "80"]);
	pointer(root, "pointerup", ...at(root, 184, 30));
});

test("stacked thumbs: a press beside them moves the thumb on that side", async () => {
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 50,
		onchange,
	});
	// both at x=100; a press at x=184 is equidistant, but off the thumbs -> end
	await screen.getByTestId("rs").click({ position: { x: 184, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["50", "100"]);
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: 50, end: 100 }, "end");

	// ...and on the other side -> start
	const left = render(RangeSlider, {
		"data-testid": "rs2",
		style: H,
		start: 50,
		end: 50,
		onchange,
	});
	await left.getByTestId("rs2").click({ position: { x: 16, y: 30 } });
	await expect.poll(() => values(left)).toEqual(["0", "50"]);
	expect(onchange).toHaveBeenLastCalledWith({ start: 0, end: 50 }, "start");
});

test("stacked thumbs: a press ON them is resolved by the first move's direction", async () => {
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 50,
		onchange,
	});
	const root = screen.getByTestId("rs").element();

	// both thumbs sit at x=100: the press alone must not move anything
	pointer(root, "pointerdown", ...at(root, 100, 30));
	expect(values(screen)).toEqual(["50", "50"]);
	expect(root.getAttribute("data-dragging")).toBe(null);
	// ...moving towards max takes the END thumb along
	pointer(root, "pointermove", ...at(root, 150, 30));
	await expect.poll(() => values(screen)).toEqual(["50", "80"]);
	await expect.element(screen.getByTestId("rs")).toHaveAttribute("data-dragging", "end");
	pointer(root, "pointerup", ...at(root, 150, 30));
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: 50, end: 80 }, "end");

	// bring them together again and move towards min: the START thumb goes
	pointer(root, "pointerdown", ...at(root, 150.4, 30));
	pointer(root, "pointermove", ...at(root, 100, 30));
	pointer(root, "pointerup", ...at(root, 100, 30));
	await expect.poll(() => values(screen)).toEqual(["50", "50"]);
	pointer(root, "pointerdown", ...at(root, 100, 30));
	pointer(root, "pointermove", ...at(root, 50, 30));
	await expect.poll(() => values(screen)).toEqual(["20", "50"]);
	pointer(root, "pointerup", ...at(root, 50, 30));
	expect(onchange).toHaveBeenLastCalledWith({ start: 20, end: 50 }, "start");
});

test("a press-and-release without movement on stacked thumbs changes nothing", async () => {
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 50,
		onchange,
	});
	const root = screen.getByTestId("rs").element();
	pointer(root, "pointerdown", ...at(root, 100, 30));
	pointer(root, "pointerup", ...at(root, 100, 30));
	expect(values(screen)).toEqual(["50", "50"]);
	expect(onchange).not.toHaveBeenCalled();
	// ...and the press did not leave the component stuck in a drag
	await screen.getByTestId("rs").click({ position: { x: 184, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["50", "100"]);
});

test("grabbing a thumb does not jump the value; the drag continues from the grab point", async () => {
	const oninput = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 80,
		oninput,
	});
	const root = screen.getByTestId("rs").element();

	// The start thumb's center is at x=100; press 8px off-center (still on the
	// thumb, whose radius is pad=16) — the value must NOT move.
	pointer(root, "pointerdown", ...at(root, 108, 30));
	expect(oninput).not.toHaveBeenCalled();
	expect(values(screen)).toEqual(["50", "80"]);

	// Moving 16.8px (= 10% of travel) raises it by exactly 10, not to the
	// absolute position of the pointer.
	pointer(root, "pointermove", ...at(root, 124.8, 30));
	await expect.poll(() => values(screen)).toEqual(["60", "80"]);
	pointer(root, "pointerup", ...at(root, 124.8, 30));
});

test("a second concurrent pointer cannot hijack or end an active drag", async () => {
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 0,
		end: 100,
		onchange,
	});
	const root = screen.getByTestId("rs").element();

	pointer(root, "pointerdown", ...at(root, 16, 30), 1);
	pointer(root, "pointermove", ...at(root, 100, 30), 1);
	await expect.poll(() => values(screen)).toEqual(["50", "100"]);

	// A second finger touches down on the end thumb and moves — both are ignored.
	pointer(root, "pointerdown", ...at(root, 184, 30), 2);
	pointer(root, "pointermove", ...at(root, 150, 30), 2);
	expect(values(screen)).toEqual(["50", "100"]);
	// ...and its release does not commit or end the first drag.
	pointer(root, "pointerup", ...at(root, 150, 30), 2);
	expect(onchange).not.toHaveBeenCalled();
	await expect
		.element(screen.getByTestId("rs"))
		.toHaveAttribute("data-dragging", "start");

	pointer(root, "pointerup", ...at(root, 100, 30), 1);
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: 50, end: 100 }, "start");
});

test("disabled mid-drag aborts without applying or committing", async () => {
	// Via the harness: `rerender` re-applies the initial props and would clobber
	// the bindings, so the harness flips `disabled` from the inside.
	const onchange = vi.fn();
	const screen = render(RangeSliderHarness, {
		initialStart: 0,
		initialEnd: 60,
		onchange,
	});
	const root = screen.getByTestId("rs").element();
	// x=100 -> 50: 16.8px from the end thumb (116.8), 84px from the start one
	pointer(root, "pointerdown", ...at(root, 100, 30));
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("0,50");

	await screen.getByTestId("disable").click();
	pointer(root, "pointermove", ...at(root, 184, 30));
	pointer(root, "pointerup", ...at(root, 184, 30));
	// the move was ignored and no commit happened
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("0,50");
	expect(onchange).not.toHaveBeenCalled();
	await expect
		.poll(() => screen.getByTestId("rs").element().getAttribute("data-dragging"))
		.toBe(null);
});

test("RTL flips the horizontal mapping", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H + ";direction:rtl",
		start: 0,
		end: 100,
	});
	// x=50 from the left is 150 from the right edge -> (150-16)/168 ≈ 0.798 -> 80,
	// and 150 is nearer to the end thumb's position (184) than to the start's (16)
	await screen.getByTestId("rs").click({ position: { x: 50, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["0", "80"]);
});

test("committing an unchanged value does not fire onchange (native-faithful)", async () => {
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 80,
		onchange,
	});
	// x=100 is exactly the start thumb's center -> a grab, no move, no change
	await screen.getByTestId("rs").click({ position: { x: 100, y: 30 } });
	expect(onchange).not.toHaveBeenCalled();
	expect(values(screen)).toEqual(["50", "80"]);
});

test("keyboard on a focused input steps that thumb natively", async () => {
	const oninput = vi.fn();
	const onchange = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 80,
		oninput,
		onchange,
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	startInput(screen).focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.poll(() => values(screen)).toEqual(["51", "80"]);
	expect(oninput).toHaveBeenCalledWith({ start: 51, end: 80 }, "start");
	expect(onchange).toHaveBeenCalledWith({ start: 51, end: 80 }, "start");

	endInput(screen).focus();
	await userEvent.keyboard("{ArrowLeft}");
	await expect.poll(() => values(screen)).toEqual(["51", "79"]);
	expect(onchange).toHaveBeenLastCalledWith({ start: 51, end: 79 }, "end");
});

test("keyboard cannot push a thumb past the other one (End jumps up to it)", async () => {
	const oninput = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 50,
		end: 50,
		oninput,
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	startInput(screen).focus();
	await userEvent.keyboard("{ArrowRight}");
	// the native input roamed to 51 and was pulled back
	await expect.poll(() => values(screen)).toEqual(["50", "50"]);
	expect(oninput).not.toHaveBeenCalled();

	const wide = render(RangeSlider, {
		"data-testid": "rs2",
		style: H,
		start: 40,
		end: 80,
		oninput,
	});
	await expect.element(wide.getByTestId("rs2")).toBeInTheDocument();
	startInput(wide).focus();
	await userEvent.keyboard("{End}");
	await expect.poll(() => values(wide)).toEqual(["80", "80"]);
	expect(oninput).toHaveBeenCalledWith({ start: 80, end: 80 }, "start");
});

test("vertical orientation maps bottom->min, top->max (pointer + ArrowUp)", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: V,
		orientation: "vertical",
		start: 0,
		end: 100,
	});
	await expect
		.element(screen.getByTestId("rs"))
		.toHaveAttribute("data-orientation", "vertical");
	expect(startInput(screen).getAttribute("aria-orientation")).toBe("vertical");
	// y=150 -> pos = 200-150 = 50 -> (50-16)/168 ≈ 0.2 -> 20, nearer to the start thumb
	await screen.getByTestId("rs").click({ position: { x: 16, y: 150 } });
	await expect.poll(() => values(screen)).toEqual(["20", "100"]);
	// y=50 -> pos = 150 -> 80, nearer to the end thumb
	await screen.getByTestId("rs").click({ position: { x: 16, y: 50 } });
	await expect.poll(() => values(screen)).toEqual(["20", "80"]);

	endInput(screen).focus();
	await userEvent.keyboard("{ArrowUp}");
	await expect.poll(() => values(screen)).toEqual(["20", "81"]);
});

test("values snap to the step grid", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 0,
		end: 100,
		step: 10,
	});
	// x=108 -> (108-16)/168 = 0.5476 -> 54.76 -> snaps to 50; 108 is nearer to
	// the end thumb (184) than to the start one (16)
	await screen.getByTestId("rs").click({ position: { x: 108, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["0", "50"]);
});

test("fractional steps produce clean values (no float noise)", async () => {
	const oninput = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		min: 0,
		max: 1,
		step: 0.1,
		start: 0,
		end: 1,
		oninput,
	});
	// x=66 -> r=(66-16)/168=0.2976 -> round(2.976)=3 -> 3*0.1 is
	// 0.30000000000000004 in IEEE-754; the decimal trim must produce exactly 0.3.
	await screen.getByTestId("rs").click({ position: { x: 66, y: 30 } });
	expect(oninput).toHaveBeenCalledWith({ start: 0.3, end: 1 }, "start");
});

test("ticks: three clipped layers when styled, one plain layer when unstyled; arrays filter", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		step: 25,
		ticks: true,
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	const layers = [...screen.container.querySelectorAll(".ticks")].map((l) =>
		l.getAttribute("data-layer")
	);
	expect(layers).toEqual(["before", "on-fill", "after"]);
	for (const layer of layers) {
		// 0,25,50,75,100 in every layer
		expect(
			screen.container.querySelectorAll(`.ticks[data-layer="${layer}"] .tick`).length
		).toBe(5);
	}

	const explicit = render(RangeSlider, {
		"data-testid": "rs2",
		style: H,
		ticks: [0, 50, 50, 150],
	});
	await expect.element(explicit.getByTestId("rs2")).toBeInTheDocument();
	// 150 is out of range and filtered out, the duplicate 50 is deduped
	expect(
		explicit.container.querySelectorAll('.ticks[data-layer="before"] .tick').length
	).toBe(2);

	const unstyled = render(RangeSlider, {
		"data-testid": "rs3",
		style: H,
		unstyled: true,
		step: 25,
		ticks: true,
	});
	await expect.element(unstyled.getByTestId("rs3")).toBeInTheDocument();
	expect(unstyled.container.querySelectorAll(".ticks").length).toBe(1);
	expect(unstyled.container.querySelectorAll(".tick").length).toBe(5);
});

test("thumb=false maps the pointer linearly across the whole track", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 0,
		end: 100,
		thumb: false,
	});
	await expect.element(screen.getByTestId("rs")).toHaveAttribute("data-thumbs", "false");
	expect(screen.container.querySelector(".thumb")).toBeNull();
	// x=50 -> 50/200 = 0.25 -> 25 (nearer to the start thumb at x=0)
	await screen.getByTestId("rs").click({ position: { x: 50, y: 30 } });
	await expect.poll(() => values(screen)).toEqual(["25", "100"]);
});

test("thumb and valueLabel snippets render once per thumb with its context", async () => {
	const thumb = createRawSnippet<[RangeSliderRenderCtx]>((ctx) => ({
		render: () => `<span data-testid="thumb-${ctx().thumb}">t${ctx().value}</span>`,
	}));
	const valueLabel = createRawSnippet<[RangeSliderRenderCtx]>((ctx) => ({
		render: () =>
			`<span data-testid="label-${ctx().thumb}">${ctx().start}-${ctx().end}:${ctx().value}</span>`,
	}));
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 20,
		end: 80,
		thumb,
		valueLabel,
	});
	await expect.element(screen.getByTestId("thumb-start")).toHaveTextContent("t20");
	await expect.element(screen.getByTestId("thumb-end")).toHaveTextContent("t80");
	await expect.element(screen.getByTestId("label-start")).toHaveTextContent("20-80:20");
	await expect.element(screen.getByTestId("label-end")).toHaveTextContent("20-80:80");
	// the wrappers carry the thumb id the CSS positions them by
	expect(screen.container.querySelector('.thumb[data-thumb="end"]')).not.toBeNull();
	expect(screen.container.querySelector('.value[data-thumb="end"]')).not.toBeNull();
});

test("unstyled omits the base class and preset data attributes, keeps the functional hook", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		unstyled: true,
		class: "custom",
		intent: "success",
	});
	const root = screen.getByTestId("rs");
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).not.toHaveClass("stuic-range-slider");
	await expect.element(root).toHaveClass("custom");
	expect(root.element().getAttribute("data-size")).toBeNull();
	expect(root.element().getAttribute("data-intent")).toBeNull();
	// ...but the functional CSS hook survives — it carries touch-action/position
	// and the hidden inputs' hit areas, without which dragging breaks on touch.
	expect(root.element().hasAttribute("data-stuic-range-slider")).toBe(true);
});

test("intent and fillRounded are reflected as data attributes", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		intent: "warning",
		fillRounded: true,
	});
	const root = screen.getByTestId("rs");
	await expect.element(root).toHaveAttribute("data-intent", "warning");
	await expect.element(root).toHaveAttribute("data-fill-rounded", "true");
});

test("disabled ignores pointer interaction and disables both inputs", async () => {
	const oninput = vi.fn();
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 40,
		end: 60,
		disabled: true,
		oninput,
	});
	await expect.element(screen.getByTestId("rs")).toHaveAttribute("data-disabled", "true");
	await screen.getByTestId("rs").click({ position: { x: 184, y: 30 } });
	expect(oninput).not.toHaveBeenCalled();
	expect(values(screen)).toEqual(["40", "60"]);
	expect(startInput(screen).disabled).toBe(true);
	expect(endInput(screen).disabled).toBe(true);
});

test("focus ring names the keyboard-focused thumb; pointer-initiated focus shows none", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 20,
		end: 80,
	});
	const root = screen.getByTestId("rs");
	await expect.element(root).toBeInTheDocument();
	// programmatic (non-pointer) focus behaves like keyboard focus
	startInput(screen).focus();
	await expect.element(root).toHaveAttribute("data-ring", "start");
	await expect.element(root).toHaveAttribute("data-active-thumb", "start");
	endInput(screen).focus();
	await expect.element(root).toHaveAttribute("data-ring", "end");
	await expect.element(root).toHaveAttribute("data-active-thumb", "end");
	endInput(screen).blur();
	await expect.poll(() => root.element().getAttribute("data-ring")).toBe(null);

	// a press on the end thumb focuses its input without showing the ring
	await root.click({ position: { x: 150.4, y: 30 } });
	expect(document.activeElement).toBe(endInput(screen));
	expect(root.element().getAttribute("data-ring")).toBe(null);
	// ...and a press on the OTHER thumb hops the focus over, still without a ring
	await root.click({ position: { x: 49.6, y: 30 } });
	expect(document.activeElement).toBe(startInput(screen));
	expect(root.element().getAttribute("data-ring")).toBe(null);
	await expect.element(root).toHaveAttribute("data-active-thumb", "start");
});

test("an externally set bound pair resyncs the slider (harness)", async () => {
	const screen = render(RangeSliderHarness, { initialStart: 10, initialEnd: 90 });
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("10,90");
	await screen.getByTestId("set").click();
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("30,70");
	await expect.poll(() => values(screen)).toEqual(["30", "70"]);
});

test("validate: customValidator gets the pair, re-runs when either thumb commits", async () => {
	const setValidationResult = vi.fn();
	const customValidator = vi.fn((v: unknown) => {
		const { start, end } = v as { start: number; end: number };
		return end - start < 30 ? "too narrow" : "";
	});
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		start: 40,
		end: 80,
		validate: { customValidator },
		setValidationResult,
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	expect(screen.component.validate()?.valid).toBe(true);
	expect(customValidator).toHaveBeenLastCalledWith(
		{ start: 40, end: 80 },
		undefined,
		startInput(screen)
	);

	// drag the END thumb (whose input the action does not listen on) down to 50
	const root = screen.getByTestId("rs").element();
	pointer(root, "pointerdown", ...at(root, 150.4, 30));
	pointer(root, "pointermove", ...at(root, 100, 30));
	await expect.poll(() => values(screen)).toEqual(["40", "50"]);
	pointer(root, "pointerup", ...at(root, 100, 30));
	await expect.poll(() => screen.component.getValidation()?.valid).toBe(false);
	expect(screen.component.getValidation()?.message).toBe("too narrow");
	expect(setValidationResult).toHaveBeenLastCalledWith(
		expect.objectContaining({ valid: false, message: "too narrow" })
	);

	screen.component.clearValidation();
	expect(screen.component.getValidation()).toBeUndefined();
});

test("validate=false: validate() is a no-op", async () => {
	const screen = render(RangeSlider, {
		"data-testid": "rs",
		style: H,
		validate: false,
	});
	await expect.element(screen.getByTestId("rs")).toBeInTheDocument();
	expect(screen.component.validate()).toBeUndefined();
});
