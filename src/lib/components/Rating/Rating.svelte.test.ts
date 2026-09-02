import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import Rating from "./Rating.svelte";
import { createRatingT } from "./i18n.js";
import { RATING_MESSAGES_SK } from "./i18n-sk.js";

// Note: browser tests don't load the component index.css, so only structure,
// attributes, the inline fill output and callback wiring are asserted here —
// never computed sizes or colors.

const root = (c: HTMLElement) => c.querySelector<HTMLElement>("[role]")!;
const items = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-rating-item"),
];
const zones = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLButtonElement>("[role=radio]"),
];
const hidden = (c: HTMLElement) =>
	c.querySelector<HTMLInputElement>("input[type=hidden]");
const fills = (c: HTMLElement) =>
	[...root(c).children]
		.filter((x) => x.tagName === "SPAN")
		.map((x) => (x as HTMLElement).style.getPropertyValue("--stuic-rating-fill"));
const checked = (c: HTMLElement) =>
	zones(c)
		.filter((z) => z.getAttribute("aria-checked") === "true")
		.map((z) => z.dataset.value);

// ============================================================================
// structure
// ============================================================================

test("input mode: radiogroup of labeled radios, aria-checked, hidden input, fill output", async () => {
	const { container } = await render(Rating, { value: 3, name: "score" });
	const group = root(container);
	expect(group.getAttribute("role")).toBe("radiogroup");
	expect(group.getAttribute("aria-label")).toBe("Rating");
	expect(group.classList.contains("stuic-rating")).toBe(true);
	expect(group.getAttribute("data-size")).toBe("md");

	const z = zones(container);
	expect(z.length).toBe(5);
	expect(z.map((x) => x.getAttribute("aria-label"))).toEqual([
		"1 of 5 stars",
		"2 of 5 stars",
		"3 of 5 stars",
		"4 of 5 stars",
		"5 of 5 stars",
	]);
	expect(z.every((x) => x.type === "button")).toBe(true);
	expect(checked(container)).toEqual(["3"]);
	// roving tabindex: only the selected zone is a tab stop
	expect(z.map((x) => x.tabIndex)).toEqual([-1, -1, 0, -1, -1]);

	expect(fills(container)).toEqual(["100%", "100%", "100%", "0%", "0%"]);
	expect(items(container).map((x) => x.getAttribute("data-state"))).toEqual([
		"full",
		"full",
		"full",
		"empty",
		"empty",
	]);

	const input = hidden(container)!;
	expect(input.name).toBe("score");
	expect(input.value).toBe("3");

	// icons are decorative; two layers per symbol
	const icon = container.querySelector(".stuic-rating-icon")!;
	expect(icon.getAttribute("aria-hidden")).toBe("true");
	expect(icon.querySelectorAll("svg").length).toBe(2);
});

test("value 0: nothing checked, first zone is the tab stop", async () => {
	const { container } = await render(Rating, {});
	expect(checked(container)).toEqual([]);
	expect(zones(container).map((x) => x.tabIndex)).toEqual([0, -1, -1, -1, -1]);
	expect(hidden(container)!.value).toBe("0");
});

test("readonly: role=img with value announcement, fractional fill, no radios, no input", async () => {
	const { container } = await render(Rating, {
		value: 4.2,
		readonly: true,
		label: "Average rating",
	});
	const img = root(container);
	expect(img.getAttribute("role")).toBe("img");
	expect(img.getAttribute("aria-label")).toBe("Average rating, 4.2 of 5 stars");
	expect(img.getAttribute("data-readonly")).toBe("");
	expect(zones(container).length).toBe(0);
	expect(hidden(container)).toBeNull();
	expect(fills(container)).toEqual(["100%", "100%", "100%", "100%", "20%"]);
	expect(items(container)[4].getAttribute("data-state")).toBe("partial");
});

test("value normalization: clamp to [0,max], snap to step in input mode only, bad max", async () => {
	const over = await render(Rating, { value: 9 });
	expect(checked(over.container)).toEqual(["5"]);

	const neg = await render(Rating, { value: -2 });
	expect(checked(neg.container)).toEqual([]);

	const frac = await render(Rating, { value: 3.7 });
	expect(checked(frac.container)).toEqual(["4"]);

	const fracHalf = await render(Rating, { value: 3.7, allowHalf: true });
	expect(checked(fracHalf.container)).toEqual(["3.5"]);

	const nan = await render(Rating, { value: NaN });
	expect(hidden(nan.container)!.value).toBe("0");

	const badMax = await render(Rating, { max: 0 });
	expect(zones(badMax.container).length).toBe(5);

	const ten = await render(Rating, { max: 10.9, value: 7 });
	expect(zones(ten.container).length).toBe(10);
	expect(checked(ten.container)).toEqual(["7"]);
});

// ============================================================================
// interaction
// ============================================================================

test("click selects, fires onchange, updates hidden input + aria-checked", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { onchange });
	await screen.getByRole("radio", { name: "4 of 5 stars" }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith(4);
	expect(checked(screen.container)).toEqual(["4"]);
	expect(hidden(screen.container)!.value).toBe("4");
	expect(fills(screen.container)).toEqual(["100%", "100%", "100%", "100%", "0%"]);
});

test("allowClear (default): clicking the selected symbol resets to 0", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { value: 2, onchange });
	await screen.getByRole("radio", { name: "2 of 5 stars" }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith(0);
	expect(checked(screen.container)).toEqual([]);
	expect(hidden(screen.container)!.value).toBe("0");
});

test("allowClear=false: clicking the selected symbol is a no-op", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { value: 2, allowClear: false, onchange });
	await screen.getByRole("radio", { name: "2 of 5 stars" }).click();
	expect(onchange).not.toHaveBeenCalled();
	expect(checked(screen.container)).toEqual(["2"]);
});

test("allowHalf: two zones per symbol, half click gives a 50% partial", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { allowHalf: true, onchange });
	const z = zones(screen.container);
	expect(z.length).toBe(10);
	expect(z.slice(0, 2).map((x) => x.dataset.half)).toEqual(["start", "end"]);
	expect(z.slice(0, 2).map((x) => x.dataset.value)).toEqual(["0.5", "1"]);

	await screen.getByRole("radio", { name: "2.5 of 5 stars" }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith(2.5);
	expect(hidden(screen.container)!.value).toBe("2.5");
	expect(fills(screen.container)).toEqual(["100%", "100%", "50%", "0%", "0%"]);
	expect(items(screen.container)[2].getAttribute("data-state")).toBe("partial");
});

test("hover previews without changing the value; leaving restores", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { value: 2, onchange });
	await screen.getByRole("radio", { name: "4 of 5 stars" }).hover();
	await expect
		.poll(() => fills(screen.container))
		.toEqual(["100%", "100%", "100%", "100%", "0%"]);
	expect(root(screen.container).getAttribute("data-hover")).toBe("");
	expect(items(screen.container)[3].getAttribute("data-hover")).toBe("");
	expect(items(screen.container)[1].hasAttribute("data-hover")).toBe(false);
	// preview only
	expect(checked(screen.container)).toEqual(["2"]);
	expect(hidden(screen.container)!.value).toBe("2");
	expect(onchange).not.toHaveBeenCalled();

	root(screen.container).dispatchEvent(new PointerEvent("pointerleave"));
	await expect
		.poll(() => fills(screen.container))
		.toEqual(["100%", "100%", "0%", "0%", "0%"]);
	expect(root(screen.container).hasAttribute("data-hover")).toBe(false);
});

test("keyboard: arrows step, Home/End, Delete clears; focus follows the value", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { value: 3, onchange });
	const c = screen.container;
	zones(c)[2].focus();

	await userEvent.keyboard("{ArrowRight}");
	expect(checked(c)).toEqual(["4"]);
	expect(document.activeElement).toBe(zones(c)[3]);

	await userEvent.keyboard("{ArrowUp}");
	expect(checked(c)).toEqual(["5"]);
	// clamped at max
	await userEvent.keyboard("{ArrowRight}");
	expect(checked(c)).toEqual(["5"]);

	await userEvent.keyboard("{ArrowLeft}{ArrowDown}");
	expect(checked(c)).toEqual(["3"]);
	expect(document.activeElement).toBe(zones(c)[2]);

	await userEvent.keyboard("{Home}");
	expect(checked(c)).toEqual(["1"]);
	// never below one step
	await userEvent.keyboard("{ArrowLeft}");
	expect(checked(c)).toEqual(["1"]);

	await userEvent.keyboard("{End}");
	expect(checked(c)).toEqual(["5"]);

	await userEvent.keyboard("{Delete}");
	expect(checked(c)).toEqual([]);
	expect(hidden(c)!.value).toBe("0");

	expect(onchange.mock.calls.map((a) => a[0])).toEqual([4, 5, 4, 3, 1, 5, 0]);
});

test("keyboard: allowHalf steps by 0.5; allowClear=false ignores Delete/Backspace", async () => {
	const screen = await render(Rating, { value: 1, allowHalf: true, allowClear: false });
	const c = screen.container;
	zones(c)[1].focus();
	await userEvent.keyboard("{ArrowRight}");
	expect(checked(c)).toEqual(["1.5"]);
	await userEvent.keyboard("{Delete}{Backspace}");
	expect(checked(c)).toEqual(["1.5"]);
});

test("Space on the selected symbol does not toggle it off (keyboard never clears by click)", async () => {
	const onchange = vi.fn();
	const screen = await render(Rating, { value: 2, onchange });
	zones(screen.container)[1].focus();
	await userEvent.keyboard(" ");
	expect(checked(screen.container)).toEqual(["2"]);
	expect(onchange).not.toHaveBeenCalled();
});

test("disabled: buttons disabled, root flags, clicks + hover ignored, hidden input disabled", async () => {
	const onchange = vi.fn();
	const { container } = await render(Rating, { value: 3, disabled: true, onchange });
	const group = root(container);
	expect(group.getAttribute("data-disabled")).toBe("");
	expect(group.getAttribute("aria-disabled")).toBe("true");
	expect(zones(container).every((z) => z.disabled)).toBe(true);
	expect(hidden(container)!.disabled).toBe(true);

	// native click on a disabled button fires nothing, but guard the handler too
	zones(container)[4].click();
	zones(container)[4].dispatchEvent(new PointerEvent("pointerenter"));
	expect(onchange).not.toHaveBeenCalled();
	expect(checked(container)).toEqual(["3"]);
	expect(group.hasAttribute("data-hover")).toBe(false);
});

// ============================================================================
// validation
// ============================================================================

test("required: imperative validate() fails on 0 with the localized message, passes after a pick", async () => {
	const setValidationResult = vi.fn();
	const screen = await render(Rating, { required: true, setValidationResult });
	const group = root(screen.container);
	expect(group.getAttribute("aria-required")).toBe("true");

	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("Please select a rating");
	expect(setValidationResult).toHaveBeenLastCalledWith(
		expect.objectContaining({ valid: false, message: "Please select a rating" })
	);
	await expect
		.element(screen.getByRole("radiogroup"))
		.toHaveAttribute("aria-invalid", "true");

	// a pick dispatches "change" on the hidden input -> the action re-validates
	await screen.getByRole("radio", { name: "3 of 5 stars" }).click();
	await expect.poll(() => screen.component.getValidation()?.valid).toBe(true);
	await expect
		.element(screen.getByRole("radiogroup"))
		.not.toHaveAttribute("aria-invalid");

	screen.component.clearValidation();
	expect(screen.component.getValidation()).toBeUndefined();
});

test("validate.customValidator runs after the built-in required check, with the value string", async () => {
	const customValidator = vi.fn((v: unknown) => (Number(v) < 3 ? "Be kinder" : ""));
	const screen = await render(Rating, { value: 2, validate: { customValidator } });
	const res = screen.component.validate();
	expect(customValidator).toHaveBeenCalledWith(
		"2",
		undefined,
		expect.any(HTMLInputElement)
	);
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("Be kinder");

	await screen.getByRole("radio", { name: "4 of 5 stars" }).click();
	await expect.poll(() => screen.component.getValidation()?.valid).toBe(true);
});

test("validate=false: validate() is a no-op", async () => {
	const screen = await render(Rating, { required: true, validate: false });
	expect(screen.component.validate()).toBeUndefined();
});

// ============================================================================
// icons + i18n + customization
// ============================================================================

test("icon / iconEmpty render the given html in the two layers", async () => {
	const { container } = await render(Rating, {
		value: 1,
		icon: '<i data-testid="full">♥</i>',
		iconEmpty: '<i data-testid="empty">♡</i>',
	});
	expect(container.querySelectorAll('[data-testid="full"]').length).toBe(5);
	expect(container.querySelectorAll('[data-testid="empty"]').length).toBe(5);
	expect(
		container.querySelector(".stuic-rating-icon-fill [data-testid='full']")
	).not.toBeNull();
	expect(
		container.querySelector(".stuic-rating-icon-empty [data-testid='empty']")
	).not.toBeNull();
});

test("t prop localizes the group label, the radio labels and the required message (SK)", async () => {
	const screen = await render(Rating, {
		required: true,
		t: createRatingT(RATING_MESSAGES_SK),
	});
	expect(root(screen.container).getAttribute("aria-label")).toBe("Hodnotenie");
	expect(zones(screen.container)[2].getAttribute("aria-label")).toBe("3 z 5 hviezdičiek");
	expect(screen.component.validate()?.message).toBe("Prosím, vyberte hodnotenie");
});

test("intent + size + class props + rest passthrough", async () => {
	const { container } = await render(Rating, {
		value: 1,
		intent: "primary",
		size: "lg",
		class: "my-extra",
		classItem: "my-item",
		classIcon: "my-icon",
		"data-testid": "rt",
	});
	const group = root(container);
	expect(group.getAttribute("data-intent")).toBe("primary");
	expect(group.getAttribute("data-size")).toBe("lg");
	expect(group.classList.contains("stuic-rating")).toBe(true);
	expect(group.classList.contains("my-extra")).toBe(true);
	expect(group.getAttribute("data-testid")).toBe("rt");
	expect(items(container)[0].classList.contains("my-item")).toBe(true);
	expect(
		container.querySelector(".stuic-rating-icon")!.classList.contains("my-icon")
	).toBe(true);
});

test("unstyled drops stuic classes and data attributes, keeps roles, labels and the fill output", async () => {
	const { container } = await render(Rating, {
		value: 2,
		unstyled: true,
		allowHalf: true,
	});
	const group = root(container);
	expect(group.getAttribute("role")).toBe("radiogroup");
	expect(group.classList.contains("stuic-rating")).toBe(false);
	expect(group.hasAttribute("data-size")).toBe(false);
	expect(container.querySelector(".stuic-rating-item")).toBeNull();
	expect(container.querySelector(".stuic-rating-icon")).toBeNull();
	expect(container.querySelector(".stuic-rating-zone")).toBeNull();
	const z = zones(container);
	expect(z.length).toBe(10);
	expect(z[3].hasAttribute("data-half")).toBe(false);
	expect(z[3].getAttribute("aria-checked")).toBe("true");
	expect(fills(container)).toEqual(["100%", "100%", "0%", "0%", "0%"]);
});
