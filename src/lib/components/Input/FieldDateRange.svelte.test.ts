import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldDateRange from "./FieldDateRange.svelte";

// FieldDateRange shares the FieldDate scaffolding (trigger + × + dialog / embedded)
// but binds `start` + `end`, submits TWO hidden inputs (nameStart / nameEnd; the
// first one runs the validate action), and hosts a range-mode Calendar. Its default
// `months=2` collapses to a single month below the md breakpoint — which the 414px
// test viewport is, so every test here sees one grid.
const hiddens = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLInputElement>('input[type="hidden"]'),
];
const dialog = (c: HTMLElement) => c.querySelector<HTMLDialogElement>("dialog");
const dayIn = (root: ParentNode, iso: string) =>
	root.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]:not([data-outside])`);
const trigger = (c: HTMLElement) =>
	c.querySelector<HTMLButtonElement>(".stuic-field-date-trigger");

test("renders a labelled trigger with the range placeholder and two named, empty hidden inputs", async () => {
	const screen = await render(FieldDateRange, {
		label: "Stay",
		nameStart: "from",
		nameEnd: "to",
	});
	const { container } = screen;
	await expect
		.element(screen.getByLabelText("Stay"))
		.toHaveAttribute("aria-haspopup", "dialog");
	expect(trigger(container)?.textContent?.trim()).toBe("Select a date range");
	const [s, e] = hiddens(container);
	expect(s.getAttribute("name")).toBe("from");
	expect(e.getAttribute("name")).toBe("to");
	expect(s.value).toBe("");
	expect(e.value).toBe("");
});

test("a complete range renders as one formatted range; a half range shows an ellipsis", async () => {
	const full = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "2026-02-15",
		locale: "en-US",
	});
	expect(trigger(full.container)?.textContent?.trim()).toMatch(/^Feb 10\s*–\s*15, 2026$/);
	expect(hiddens(full.container).map((h) => h.value)).toEqual([
		"2026-02-10",
		"2026-02-15",
	]);
	const half = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		locale: "en-US",
	});
	expect(trigger(half.container)?.textContent?.trim()).toBe("Feb 10, 2026 – …");
	expect(hiddens(half.container).map((h) => h.value)).toEqual(["2026-02-10", ""]);
	const custom = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "2026-02-15",
		format: (a, b) => `${a}..${b}`,
	});
	expect(trigger(custom.container)?.textContent?.trim()).toBe("2026-02-10..2026-02-15");
});

test("the default 2 months collapse to 1 below the md breakpoint (414px viewport)", async () => {
	const screen = await render(FieldDateRange, { label: "Stay", embedded: true });
	expect(screen.container.querySelectorAll(".stuic-calendar-month").length).toBe(1);
});

test("dialog: the first pick keeps the dialog open, the second commits both ends and closes", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDateRange, {
		label: "Stay",
		nameStart: "from",
		nameEnd: "to",
		start: "2026-02-10",
		end: "2026-02-15",
		locale: "en-US",
		onChange,
	});
	const { container } = screen;
	await screen.getByLabelText("Stay").click();
	await expect.poll(() => dialog(container)?.open).toBe(true);
	expect(dialog(container)?.textContent).toContain("Select date range");
	// third pick (a complete range exists) starts over
	await page.elementLocator(dayIn(dialog(container)!, "2026-02-20")!).click();
	expect(onChange).toHaveBeenLastCalledWith({ start: "2026-02-20", end: null });
	await expect
		.poll(() => hiddens(container).map((h) => h.value))
		.toEqual(["2026-02-20", ""]);
	expect(dialog(container)?.open).toBe(true);
	// an EARLIER second pick becomes the start
	await page.elementLocator(dayIn(dialog(container)!, "2026-02-18")!).click();
	expect(onChange).toHaveBeenLastCalledWith({ start: "2026-02-18", end: "2026-02-20" });
	await expect
		.poll(() => hiddens(container).map((h) => h.value))
		.toEqual(["2026-02-18", "2026-02-20"]);
	await expect.poll(() => dialog(container)).toBeNull();
	await expect
		.poll(() => trigger(container)?.textContent?.trim())
		.toMatch(/^Feb 18\s*–\s*20, 2026$/);
	expect(document.activeElement).toBe(trigger(container));
});

test("closeOnSelect=false keeps the dialog open after a complete range; Done closes it", async () => {
	const screen = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		closeOnSelect: false,
	});
	const { container } = screen;
	await screen.getByLabelText("Stay").click();
	await expect.poll(() => dialog(container)?.open).toBe(true);
	// a preset start is the anchor → this completes the range
	await page.elementLocator(dayIn(dialog(container)!, "2026-02-12")!).click();
	await expect
		.poll(() => hiddens(container).map((h) => h.value))
		.toEqual(["2026-02-10", "2026-02-12"]);
	expect(dialog(container)?.open).toBe(true);
	await screen.getByRole("button", { name: "Done" }).click();
	await expect.poll(() => dialog(container)).toBeNull();
});

test("the × clears both ends", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "2026-02-15",
		onChange,
	});
	await screen.getByRole("button", { name: "Clear selection" }).click();
	expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
	await expect
		.poll(() => hiddens(screen.container).map((h) => h.value))
		.toEqual(["", ""]);
	expect(trigger(screen.container)?.textContent?.trim()).toBe("Select a date range");
});

test("embedded: inline range calendar; two picks write both hidden inputs; Clear resets", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDateRange, {
		label: "Stay",
		nameStart: "from",
		nameEnd: "to",
		embedded: true,
		calendarProps: { view: { year: 2026, month: 2 } },
		onChange,
	});
	const { container } = screen;
	expect(trigger(container)).toBeNull();
	expect(dialog(container)).toBeNull();
	await page.elementLocator(dayIn(container, "2026-02-03")!).click();
	await page.elementLocator(dayIn(container, "2026-02-06")!).click();
	expect(onChange).toHaveBeenLastCalledWith({ start: "2026-02-03", end: "2026-02-06" });
	await expect
		.poll(() => hiddens(container).map((h) => h.value))
		.toEqual(["2026-02-03", "2026-02-06"]);
	await screen.getByRole("button", { name: "Clear" }).click();
	await expect.poll(() => hiddens(container).map((h) => h.value)).toEqual(["", ""]);
});

test("disabled: the trigger is disabled and there is no ×", async () => {
	const screen = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "2026-02-15",
		disabled: true,
	});
	await expect.element(screen.getByLabelText("Stay")).toBeDisabled();
	expect(screen.container.querySelector(".stuic-field-date-clear")).toBeNull();
});

// ---- validation -------------------------------------------------------------

test("validate: required + empty; half range is incomplete regardless of required; complete is valid", async () => {
	const empty = await render(FieldDateRange, { label: "Stay", required: true });
	expect(empty.component.validate()?.message).toBe(
		"This field requires attention. Please review and try again."
	);
	const optionalEmpty = await render(FieldDateRange, { label: "Stay" });
	expect(optionalEmpty.component.validate()?.valid).toBe(true);
	const half = await render(FieldDateRange, { label: "Stay", start: "2026-02-10" });
	expect(half.component.validate()?.message).toBe(
		"Please select both a start and an end date."
	);
	const endOnly = await render(FieldDateRange, { label: "Stay", end: "2026-02-10" });
	expect(endOnly.component.validate()?.valid).toBe(false);
	const full = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "2026-02-15",
		required: true,
	});
	expect(full.component.validate()?.valid).toBe(true);
});

test("validate: min / max / invalid apply to both ends, in the field's locale", async () => {
	const early = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-01",
		end: "2026-02-10",
		min: "2026-02-05",
		locale: "en-US",
	});
	expect(early.component.validate()?.message).toBe(
		"Date must be on or after Feb 5, 2026."
	);
	const late = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "2026-03-01",
		max: "2026-02-20",
		locale: "en-US",
	});
	expect(late.component.validate()?.message).toBe(
		"Date must be on or before Feb 20, 2026."
	);
	const bad = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-10",
		end: "nope",
	});
	expect(bad.component.validate()?.message).toBe("Please enter a valid date.");
	expect(hiddens(bad.container).map((h) => h.value)).toEqual(["2026-02-10", "nope"]);
	const reversed = await render(FieldDateRange, {
		label: "Stay",
		start: "2026-02-15",
		end: "2026-02-10",
	});
	expect(reversed.component.validate()?.valid).toBe(false);
});

test("validate: a pick re-runs validation so the inline message clears", async () => {
	const screen = await render(FieldDateRange, {
		label: "Stay",
		required: true,
		embedded: true,
		calendarProps: { view: { year: 2026, month: 2 } },
	});
	screen.component.validate();
	await expect.element(screen.getByText(/requires attention/)).toBeInTheDocument();
	await page.elementLocator(dayIn(screen.container, "2026-02-03")!).click();
	await expect.element(screen.getByText(/select both a start/)).toBeInTheDocument();
	await page.elementLocator(dayIn(screen.container, "2026-02-06")!).click();
	await expect.element(screen.getByText(/select both a start/)).not.toBeInTheDocument();
	expect(screen.component.getValidation()?.valid).toBe(true);
});

test("validate={false} disables validation; focus() reaches the trigger", async () => {
	const screen = await render(FieldDateRange, {
		label: "Stay",
		required: true,
		validate: false,
	});
	expect(screen.component.validate()).toBeUndefined();
	screen.component.focus();
	expect(document.activeElement).toBe(trigger(screen.container));
});
