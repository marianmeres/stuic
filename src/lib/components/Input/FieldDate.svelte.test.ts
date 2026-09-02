import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldDate from "./FieldDate.svelte";
import FieldDateHarness from "./FieldDateHarness.test.svelte";

// FieldDate = the InputWrap shell (<div class="stuic-input" data-size>, <label for={id}>)
// around a trigger <button id={id}> that shows the formatted date or the placeholder,
// a trailing × Button ("Clear selection") while there is a value, and a hidden
// <input type="hidden" name> carrying the ISO value the form submits. Opening the
// trigger mounts a native <dialog> (ModalDialog) hosting the Calendar; the dialog is
// only in the DOM while open. `embedded` renders the Calendar inline instead and the
// hidden input then carries the id. The `validate` action runs on `change` of the
// hidden input; the field dispatches that itself after every pick / clear.
const hidden = (c: HTMLElement) =>
	c.querySelector<HTMLInputElement>('input[type="hidden"]');
const dialog = (c: HTMLElement) => c.querySelector<HTMLDialogElement>("dialog");
const dayIn = (root: ParentNode, iso: string) =>
	root.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]:not([data-outside])`);
const trigger = (c: HTMLElement) =>
	c.querySelector<HTMLButtonElement>(".stuic-field-date-trigger");

test("renders the stuic-input shell with a labelled trigger, placeholder and an empty named hidden input", async () => {
	const screen = await render(FieldDate, { label: "Delivery", name: "delivery" });
	const { container } = screen;
	expect(container.querySelector(".stuic-input")?.getAttribute("data-size")).toBe("md");
	const t = screen.getByLabelText("Delivery");
	await expect.element(t).toBeInTheDocument();
	await expect.element(t).toHaveAttribute("aria-haspopup", "dialog");
	await expect.element(t).toHaveAttribute("aria-expanded", "false");
	expect(trigger(container)?.textContent?.trim()).toBe("Select a date");
	expect(trigger(container)?.hasAttribute("data-empty")).toBe(true);
	const h = hidden(container)!;
	expect(h.getAttribute("name")).toBe("delivery");
	expect(h.value).toBe("");
	// nothing to clear yet, no dialog yet
	expect(container.querySelector(".stuic-field-date-clear")).toBeNull();
	expect(dialog(container)).toBeNull();
});

test("a value renders formatted in the trigger and as ISO in the hidden input", async () => {
	const { container } = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10",
		locale: "en-US",
	});
	expect(trigger(container)?.textContent?.trim()).toBe("Feb 10, 2026");
	expect(trigger(container)?.hasAttribute("data-empty")).toBe(false);
	expect(hidden(container)?.value).toBe("2026-02-10");
});

test("loose input is normalized to its calendar date AS WRITTEN; garbage is submitted as-is", async () => {
	const ok = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10T23:59:00Z",
		locale: "en-US",
	});
	expect(hidden(ok.container)?.value).toBe("2026-02-10");
	expect(trigger(ok.container)?.textContent?.trim()).toBe("Feb 10, 2026");
	const bad = await render(FieldDate, { label: "Date", name: "d", value: "nope" });
	expect(hidden(bad.container)?.value).toBe("nope");
	expect(trigger(bad.container)?.textContent?.trim()).toBe("Select a date");
});

test("format / formatOptions / placeholder / renderSize", async () => {
	const a = await render(FieldDate, {
		label: "Date",
		value: "2026-02-10",
		format: (iso) => `custom:${iso}`,
		renderSize: "lg",
	});
	expect(trigger(a.container)?.textContent?.trim()).toBe("custom:2026-02-10");
	expect(trigger(a.container)?.getAttribute("data-size")).toBe("lg");
	expect(a.container.querySelector(".stuic-input")?.getAttribute("data-size")).toBe("lg");
	const b = await render(FieldDate, {
		label: "Date",
		value: "2026-02-10",
		locale: "en-US",
		formatOptions: { dateStyle: "long" },
	});
	expect(trigger(b.container)?.textContent?.trim()).toBe("February 10, 2026");
	const c = await render(FieldDate, { label: "Date", placeholder: "When?" });
	expect(trigger(c.container)?.textContent?.trim()).toBe("When?");
});

test("t translates the placeholder, dialog title and clear label", async () => {
	const t = (k: string) =>
		({ placeholder_date: "Vyberte dátum", clear_value: "Zrušiť" })[k] ?? k;
	const screen = await render(FieldDate, { label: "Date", value: "2026-02-10", t });
	expect(trigger(screen.container)?.textContent?.trim()).not.toBe("Vyberte dátum");
	await expect
		.element(screen.getByRole("button", { name: "Zrušiť" }))
		.toBeInTheDocument();
	const empty = await render(FieldDate, { label: "Date", t });
	expect(trigger(empty.container)?.textContent?.trim()).toBe("Vyberte dátum");
});

// ---- dialog flow ------------------------------------------------------------

test("clicking the trigger opens the dialog on the value's month; picking a day commits, closes and refocuses the trigger", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10",
		locale: "en-US",
		onChange,
	});
	const { container } = screen;
	await screen.getByLabelText("Date").click();
	await expect.poll(() => dialog(container)?.open).toBe(true);
	await expect.poll(() => trigger(container)?.getAttribute("aria-expanded")).toBe("true");
	expect(dialog(container)?.textContent).toContain("Select date");
	// focus lands in the grid, on the selected day
	await expect
		.poll(() => (document.activeElement as HTMLElement | null)?.dataset?.iso)
		.toBe("2026-02-10");
	await page.elementLocator(dayIn(dialog(container)!, "2026-02-15")!).click();
	expect(onChange).toHaveBeenCalledWith("2026-02-15");
	await expect.poll(() => hidden(container)?.value).toBe("2026-02-15");
	await expect.poll(() => trigger(container)?.textContent?.trim()).toBe("Feb 15, 2026");
	// closeOnSelect (default): the dialog is gone and the trigger has focus again
	await expect.poll(() => dialog(container)).toBeNull();
	await expect.poll(() => document.activeElement).toBe(trigger(container));
});

test("Escape closes the dialog without changing the value", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10",
		onChange,
	});
	const { container } = screen;
	await screen.getByLabelText("Date").click();
	await expect.poll(() => dialog(container)?.open).toBe(true);
	await userEvent.keyboard("{Escape}");
	await expect.poll(() => dialog(container)).toBeNull();
	expect(onChange).not.toHaveBeenCalled();
	expect(hidden(container)?.value).toBe("2026-02-10");
});

test("closeOnSelect=false keeps the dialog open after a pick; Done closes it", async () => {
	const screen = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10",
		closeOnSelect: false,
	});
	const { container } = screen;
	await screen.getByLabelText("Date").click();
	await expect.poll(() => dialog(container)?.open).toBe(true);
	await page.elementLocator(dayIn(dialog(container)!, "2026-02-15")!).click();
	await expect.poll(() => hidden(container)?.value).toBe("2026-02-15");
	expect(dialog(container)?.open).toBe(true);
	await screen.getByRole("button", { name: "Done" }).click();
	await expect.poll(() => dialog(container)).toBeNull();
});

test("the trailing × clears the value, dispatches onChange and keeps focus in the field", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10",
		onChange,
	});
	const { container } = screen;
	await screen.getByRole("button", { name: "Clear selection" }).click();
	expect(onChange).toHaveBeenCalledWith(null);
	await expect.poll(() => hidden(container)?.value).toBe("");
	await expect.poll(() => trigger(container)?.textContent?.trim()).toBe("Select a date");
	expect(container.querySelector(".stuic-field-date-clear")).toBeNull();
	expect(document.activeElement).toBe(trigger(container));
});

test("clearable=false hides the ×", async () => {
	const { container } = await render(FieldDate, {
		label: "Date",
		value: "2026-02-10",
		clearable: false,
	});
	expect(container.querySelector(".stuic-field-date-clear")).toBeNull();
});

test("disabled: the trigger is disabled, there is no ×, open() is a no-op", async () => {
	const screen = await render(FieldDate, {
		label: "Date",
		value: "2026-02-10",
		disabled: true,
	});
	await expect.element(screen.getByLabelText("Date")).toBeDisabled();
	expect(screen.container.querySelector(".stuic-field-date-clear")).toBeNull();
	screen.component.open();
	await new Promise((r) => setTimeout(r, 50));
	expect(dialog(screen.container)).toBeNull();
});

test("imperative open() / close()", async () => {
	const screen = await render(FieldDate, { label: "Date", name: "d" });
	screen.component.open();
	await expect.poll(() => dialog(screen.container)?.open).toBe(true);
	screen.component.close();
	await expect.poll(() => dialog(screen.container)).toBeNull();
});

test("external value change (model switch via bind:value) resyncs the trigger and hidden input", async () => {
	const screen = await render(FieldDateHarness, { initial: "2026-02-10" });
	const { container } = screen;
	expect(trigger(container)?.textContent?.trim()).toBe("Feb 10, 2026");
	await screen.getByTestId("set").click();
	await expect.poll(() => trigger(container)?.textContent?.trim()).toBe("Jun 15, 2030");
	await expect.poll(() => hidden(container)?.value).toBe("2030-06-15");
	await screen.getByTestId("clear").click();
	await expect.poll(() => hidden(container)?.value).toBe("");
	// and a pick writes back through the binding
	await screen.getByLabelText("Date").click();
	await expect.poll(() => dialog(container)?.open).toBe(true);
	// nothing selected → the dialog opens on the current month; pick the 1st
	const first = dialog(container)!.querySelector<HTMLButtonElement>(
		'button[data-iso$="-01"]:not([data-outside])'
	)!;
	const iso = first.dataset.iso;
	await page.elementLocator(first).click();
	await expect.poll(() => screen.getByTestId("bound").element().textContent).toBe(iso);
});

// ---- embedded ---------------------------------------------------------------

test("embedded: the calendar sits inline (no trigger, no dialog); picks and Clear write the hidden input", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldDate, {
		label: "Date",
		name: "d",
		value: "2026-02-10",
		embedded: true,
		onChange,
	});
	const { container } = screen;
	expect(trigger(container)).toBeNull();
	expect(dialog(container)).toBeNull();
	const cal = container.querySelector(".stuic-calendar")!;
	expect(cal).not.toBeNull();
	// labelled by the field label
	expect(cal.getAttribute("aria-labelledby")).toBe(`${hidden(container)!.id}-label`);
	expect(container.querySelector(`label[for="${hidden(container)!.id}"]`)).not.toBeNull();
	await page.elementLocator(dayIn(container, "2026-02-15")!).click();
	expect(onChange).toHaveBeenCalledWith("2026-02-15");
	await expect.poll(() => hidden(container)?.value).toBe("2026-02-15");
	await screen.getByRole("button", { name: "Clear" }).click();
	expect(onChange).toHaveBeenCalledWith(null);
	await expect.poll(() => hidden(container)?.value).toBe("");
});

// ---- validation -------------------------------------------------------------

test("validate: required + empty renders the built-in message; a pick clears it", async () => {
	const screen = await render(FieldDate, {
		label: "Date",
		name: "d",
		required: true,
		embedded: true,
	});
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	await expect
		.element(
			screen.getByText("This field requires attention. Please review and try again.")
		)
		.toBeInTheDocument();
	// a pick dispatches `change` on the hidden input → the validator re-runs → clean
	const any = screen.container.querySelector<HTMLButtonElement>(
		'button[data-iso]:not([data-outside]):not([aria-disabled="true"])'
	)!;
	await page.elementLocator(any).click();
	await expect
		.element(
			screen.getByText("This field requires attention. Please review and try again.")
		)
		.not.toBeInTheDocument();
	expect(screen.component.getValidation()?.valid).toBe(true);
});

test("validate: min / max / invalid / disabled dates, in the field's locale", async () => {
	const early = await render(FieldDate, {
		label: "Date",
		value: "2026-02-01",
		min: "2026-02-05",
		locale: "en-US",
	});
	expect(early.component.validate()?.message).toBe(
		"Date must be on or after Feb 5, 2026."
	);
	const late = await render(FieldDate, {
		label: "Date",
		value: "2026-03-01",
		max: "2026-02-20",
		locale: "en-US",
	});
	expect(late.component.validate()?.message).toBe(
		"Date must be on or before Feb 20, 2026."
	);
	const bad = await render(FieldDate, { label: "Date", value: "nope" });
	expect(bad.component.validate()?.message).toBe("Please enter a valid date.");
	const weekend = await render(FieldDate, {
		label: "Date",
		value: "2026-02-07", // Saturday
		isDateDisabled: (_iso, cell) => cell.isWeekend,
	});
	expect(weekend.component.validate()?.message).toBe("This date is not available.");
	const fine = await render(FieldDate, {
		label: "Date",
		value: "2026-02-10",
		min: "2026-02-05",
		max: "2026-02-20",
		isDateDisabled: (_iso, cell) => cell.isWeekend,
	});
	expect(fine.component.validate()?.valid).toBe(true);
});

test("validate: a consumer customValidator runs after the built-in guard passes", async () => {
	const seen: unknown[] = [];
	const screen = await render(FieldDate, {
		label: "Date",
		value: "2026-02-10",
		min: "2026-02-15",
		locale: "en-US",
		validate: {
			customValidator: (v) => {
				seen.push(v);
				return "nope";
			},
		},
	});
	// guard fails first → consumer validator never reached
	expect(screen.component.validate()?.message).toBe(
		"Date must be on or after Feb 15, 2026."
	);
	expect(seen).toEqual([]);
	const ok = await render(FieldDate, {
		label: "Date",
		value: "2026-02-20",
		min: "2026-02-15",
		validate: { customValidator: () => "too late" },
	});
	expect(ok.component.validate()?.message).toBe("too late");
});

test("validate={false} disables validation entirely", async () => {
	const screen = await render(FieldDate, {
		label: "Date",
		required: true,
		validate: false,
	});
	expect(screen.component.validate()).toBeUndefined();
	expect(screen.container.querySelector(".validation-box")).toBeNull();
});

test("clearValidation / focus / scrollIntoView", async () => {
	const screen = await render(FieldDate, { label: "Date", required: true });
	screen.component.validate();
	await expect.element(screen.getByText(/requires attention/)).toBeInTheDocument();
	screen.component.clearValidation();
	await expect.element(screen.getByText(/requires attention/)).not.toBeInTheDocument();
	screen.component.focus();
	expect(document.activeElement).toBe(trigger(screen.container));
	screen.component.scrollIntoView({ behavior: "instant" });
});

test("description is rendered", async () => {
	const screen = await render(FieldDate, {
		label: "Date",
		description: "Earliest today",
	});
	await expect.element(screen.getByText("Earliest today")).toBeInTheDocument();
});
