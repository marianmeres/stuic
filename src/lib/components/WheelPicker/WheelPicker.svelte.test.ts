import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import WheelPicker from "./WheelPicker.svelte";
// STUIC centralizes CSS (components don't self-import it), so the browser harness has
// no component styles by default. The scroll-settle test below needs the real 36px row
// geometry, so we load just this component's stylesheet (its height/overflow/snap rules
// only depend on the inline item-height var the component already writes — theme color
// tokens stay unresolved but don't affect layout).
import "./index.css";

// WheelPicker is a native-scroll shell: the index MATH is proven in utils.test.ts
// (node). Here we verify the DOM/ARIA wiring and the behaviors that only exist in a
// real browser — scroll settling ($effect + getBoundingClientRect + scroll events),
// keyboard commits, the loop's home-tile-only listbox semantics, and reactive value
// updates. Runs in real Chromium via @vitest/browser-playwright.

const ITEM_H = 36;
const hours = Array.from({ length: 24 }, (_, i) => i); // 0..23

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function lbOf(screen: ReturnType<typeof render>) {
	return screen.getByRole("listbox").element() as HTMLElement;
}

test("renders a listbox with the accessible name", async () => {
	const screen = render(WheelPicker, { options: hours, label: "Hour" });
	const lb = screen.getByRole("listbox");
	await expect.element(lb).toBeInTheDocument();
	await expect.element(lb).toHaveAttribute("aria-label", "Hour");
});

test("non-loop renders exactly one role=option per option", async () => {
	const screen = render(WheelPicker, { options: hours });
	const lb = lbOf(screen);
	expect(lb.querySelectorAll('[role="option"]').length).toBe(24);
});

test("initial value selects the matching option (label + data/aria-selected)", async () => {
	const screen = render(WheelPicker, { options: hours, value: 9 });
	const lb = lbOf(screen);
	const selected = lb.querySelector('[data-selected="true"]');
	expect(selected?.textContent?.trim()).toBe("9");
	expect(selected?.getAttribute("aria-selected")).toBe("true");
	// exactly one selected row
	expect(lb.querySelectorAll('[data-selected="true"]').length).toBe(1);
});

test("aria-activedescendant points at the selected option's id", async () => {
	const screen = render(WheelPicker, { options: hours, value: 5 });
	const lb = lbOf(screen);
	const selected = lb.querySelector('[data-selected="true"]');
	expect(lb.getAttribute("aria-activedescendant")).toBe(selected?.id);
});

test("index binding (without value) selects the right option", async () => {
	const screen = render(WheelPicker, { options: hours, index: 3 });
	const lb = lbOf(screen);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("3");
});

test("loop renders multiple tiles but exposes only N role=option rows (home tile)", async () => {
	const screen = render(WheelPicker, { options: [0, 1, 2, 3, 4], loop: true, value: 0 });
	const lb = lbOf(screen);
	// only the home tile carries role=option, so AT never reads N duplicates
	expect(lb.querySelectorAll('[role="option"]').length).toBe(5);
	// but more physical rows exist (tiles * N)
	expect(lb.querySelectorAll(".stuic-wheel-picker-item").length).toBeGreaterThan(5);
	// duplicate copies are hidden from AT
	expect(
		lb.querySelectorAll('.stuic-wheel-picker-item[aria-hidden="true"]').length
	).toBeGreaterThan(0);
});

test("ArrowDown commits the next option and fires onchange once", async () => {
	const onchange = vi.fn();
	const screen = render(WheelPicker, { options: hours, value: 0, onchange });
	const lb = lbOf(screen);
	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	await vi.waitFor(() =>
		expect(lb.getAttribute("aria-activedescendant")?.endsWith("-opt-1")).toBe(true)
	);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("1");
	expect(onchange).toHaveBeenCalledTimes(1);
	expect(onchange.mock.lastCall?.[1]).toBe(1);
});

test("ArrowUp at the first option clamps (non-loop): no change, no onchange", async () => {
	const onchange = vi.fn();
	const screen = render(WheelPicker, { options: hours, value: 0, onchange });
	const lb = lbOf(screen);
	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
	await nextFrame();
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("0");
	expect(onchange).not.toHaveBeenCalled();
});

test("ArrowUp at the first option WRAPS to the last when looping", async () => {
	const onchange = vi.fn();
	const screen = render(WheelPicker, { options: hours, value: 0, loop: true, onchange });
	const lb = lbOf(screen);
	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
	await vi.waitFor(() => expect(onchange).toHaveBeenCalled());
	expect(onchange.mock.lastCall?.[1]).toBe(23);
});

test("End jumps to the last option", async () => {
	const onchange = vi.fn();
	const screen = render(WheelPicker, { options: hours, value: 0, onchange });
	const lb = lbOf(screen);
	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
	await vi.waitFor(() => expect(onchange.mock.lastCall?.[1]).toBe(23));
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("23");
});

test("ArrowDown skips a disabled option", async () => {
	const onchange = vi.fn();
	const opts = [
		{ label: "a", value: "a" },
		{ label: "b", value: "b", disabled: true },
		{ label: "c", value: "c" },
	];
	const screen = render(WheelPicker, { options: opts, value: "a", onchange });
	const lb = lbOf(screen);
	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	await vi.waitFor(() => expect(onchange).toHaveBeenCalled());
	// "b" is disabled -> lands on "c"
	expect(onchange.mock.lastCall?.[0]?.value).toBe("c");
});

test("scrolling a row under the band and settling commits it (scrollend path)", async () => {
	const onchange = vi.fn();
	const screen = render(WheelPicker, {
		options: hours,
		value: 0,
		itemHeight: ITEM_H,
		onchange,
	});
	const lb = lbOf(screen);
	await nextFrame(); // let the init effect anchor scrollTop

	// center row 4 (non-loop global index 4): scrollTop == 4 * itemHeight
	lb.scrollTop = 4 * ITEM_H;
	lb.dispatchEvent(new Event("scroll"));
	lb.dispatchEvent(new Event("scrollend"));

	await vi.waitFor(() => expect(onchange).toHaveBeenCalled());
	expect(onchange.mock.lastCall?.[1]).toBe(4);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("4");
});

test("a reactive value change scrolls to and selects the new option", async () => {
	const screen = render(WheelPicker, { options: hours, value: 2 });
	const lb = lbOf(screen);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("2");

	await screen.rerender({ options: hours, value: 7 });
	await vi.waitFor(() =>
		expect(lb.getAttribute("aria-activedescendant")?.endsWith("-opt-7")).toBe(true)
	);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("7");
});

test("keyboard=false drops the listbox from the tab order", async () => {
	const screen = render(WheelPicker, { options: hours, keyboard: false });
	const lb = lbOf(screen);
	expect(lb.hasAttribute("tabindex")).toBe(false);
});

test("custom renderItem is used for row content", async () => {
	const screen = render(WheelPicker, {
		options: [1, 2],
		renderItem: createRawSnippet((args: () => { option: { label: string } }) => ({
			render: () => `<span class="custom">#${args().option.label}</span>`,
		})),
	});
	const lb = lbOf(screen);
	expect(lb.querySelector(".custom")?.textContent).toBe("#1");
});

// ---- regression guards for the reviewed-and-fixed defects ----

test("reactively shrinking options reconciles the stale selection and fires onchange", async () => {
	const onchange = vi.fn();
	const screen = render(WheelPicker, { options: hours, value: 20, onchange });
	const lb = lbOf(screen);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("20");

	// 20 no longer exists -> must fall back into range (clamps to last = 4), not stay stale
	await screen.rerender({ options: [0, 1, 2, 3, 4], value: 20, onchange });
	await vi.waitFor(() => expect(onchange).toHaveBeenCalled());
	expect(onchange.mock.lastCall?.[1]).toBe(4);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("4");
	// aria-activedescendant must point at a real, in-range option (not a dangling id)
	expect(lb.getAttribute("aria-activedescendant")?.endsWith("-opt-4")).toBe(true);
});

test("an initially-selected disabled option is skipped to the nearest enabled one", async () => {
	const opts = [
		{ label: "a", value: "a" },
		{ label: "b", value: "b", disabled: true },
		{ label: "c", value: "c" },
	];
	const screen = render(WheelPicker, { options: opts, value: "b", label: "x" });
	const lb = lbOf(screen);
	// "b" is disabled -> initial selection falls forward to "c"
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("c");
});

test("a value absent from options falls back to (and displays) the first option", async () => {
	const screen = render(WheelPicker, { options: [1, 2, 3], value: 99, label: "x" });
	const lb = lbOf(screen);
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("1");
});

test("re-announces even when consecutive selections share a label", async () => {
	const opts = [
		{ label: "X", value: 1 },
		{ label: "X", value: 2 },
		{ label: "X", value: 3 },
	];
	const screen = render(WheelPicker, { options: opts, value: 1, label: "x" });
	const lb = lbOf(screen);
	const srText = () =>
		lb.parentElement?.querySelector(".stuic-wheel-picker-sr")?.textContent ?? "";

	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	await vi.waitFor(() => expect(srText()).not.toBe(""));
	const first = srText();

	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	// same visible label "X", but the live region text must still change to force a re-announce
	await vi.waitFor(() => expect(srText()).not.toBe(first));
	expect(first.replace(/\u200B/g, "")).toBe("X");
	expect(srText().replace(/\u200B/g, "")).toBe("X");
});

test("looping wrap 59 -> 00 scrolls one step FORWARD (not a long rewind)", async () => {
	// Exercise the scrollToIndex path (keyboard/programmatic) with a STABLE options array —
	// the same path a live clock's external value tick takes. ArrowDown at the last minute
	// must travel ONE row down to 00, not rewind ~59 rows up to the same tile's 00.
	const mins = Array.from({ length: 60 }, (_, i) => i);
	const screen = render(WheelPicker, {
		options: mins,
		value: 59,
		loop: true,
		itemHeight: ITEM_H,
		label: "Minute",
	});
	const lb = lbOf(screen);
	await nextFrame(); // init anchors to the "59" row
	const before = lb.scrollTop;
	const spy = vi.spyOn(lb, "scrollTo");

	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	await vi.waitFor(() => expect(spy).toHaveBeenCalled());

	const opts = spy.mock.lastCall?.[0] as ScrollToOptions;
	// target is ONE item BELOW the current position (forward), not ~59 items above
	expect(opts.top).toBeGreaterThan(before);
	expect((opts.top ?? 0) - before).toBeCloseTo(ITEM_H, 0);
	// and it commits to "00"
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("0");
	spy.mockRestore();
});

test("picker width stays constant when the selected (bold) word changes (no jitter)", async () => {
	// Words of differing width + a bold selected style would otherwise resize the
	// shrink-to-fit wheel as the committed selection moves. The bold-width ghost pins it.
	const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const screen = render(WheelPicker, {
		options: days,
		loop: true,
		value: "Mon",
		label: "Weekday",
	});
	const lb = lbOf(screen);
	await nextFrame();
	const w0 = lb.offsetWidth;
	expect(w0).toBeGreaterThan(0);
	for (let i = 0; i < 5; i++) {
		lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		await nextFrame();
		expect(lb.offsetWidth).toBe(w0);
	}
});

test("keyboard nav at a non-loop edge stays usable (no stuck-flag regression)", async () => {
	// ArrowDown on the last option is a zero-distance move; it must not wedge the picker.
	// A subsequent reactive value change must still take effect.
	const screen = render(WheelPicker, { options: [0, 1, 2], value: 2, label: "x" });
	const lb = lbOf(screen);
	lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	await nextFrame();
	expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("2");
	// external value change still applies afterwards
	await screen.rerender({ options: [0, 1, 2], value: 0, label: "x" });
	await vi.waitFor(() =>
		expect(lb.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("0")
	);
});
