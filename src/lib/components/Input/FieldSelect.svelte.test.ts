import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldSelect from "./FieldSelect.svelte";

// FieldSelect wraps InputWrap (the <div class="stuic-input" data-size> shell + a
// <label for={id}>) around a native <select>. The high-yield, browser-only contracts:
//   - label/for ↔ select id association  -> getByLabelText() finds the <select> (combobox)
//   - options[] -> one <option> per entry (value === label when value omitted)
//   - value prop / bound value           -> selectOptions() updates the value (binding proof)
//   - required/disabled props            -> select DOM contract
//   - the `validate` action              -> customValidator message shows/hides in the
//                                           .validation-box (inject a stub validator —
//                                           no live validation)
// The `validate` action listens on the native `change` event; selectOptions() fires `change`
// natively, but when we render a value and want to trigger validation without changing the
// selection we dispatch a real `change` ourselves.
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

const OPTIONS = ["One", "Two", "Three"];

test("renders the stuic-input shell (data-size=md) with a label associated to a select", async () => {
	const screen = await render(FieldSelect, { label: "Pick", options: OPTIONS });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// label `for` ↔ select `id` association: getByLabelText finds the <select>
	const select = screen.getByLabelText("Pick");
	await expect.element(select).toBeInTheDocument();
	await expect.element(select).toHaveRole("combobox");
});

test("options render one <option> each (value === label) and value prop selects one", async () => {
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		value: "Two",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");

	const optionEls = screen.container.querySelectorAll("option");
	expect(optionEls.length).toBe(3);
	expect([...optionEls].map((o) => o.value)).toEqual(OPTIONS);
	expect([...optionEls].map((o) => o.textContent)).toEqual(OPTIONS);

	await expect.element(screen.getByLabelText("Pick")).toHaveValue("Two");
});

test("selectOptions updates the bound value (reactivity/binding proof)", async () => {
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		value: "One",
	});
	const select = screen.getByLabelText("Pick");
	await expect.element(select).toHaveValue("One");

	await select.selectOptions("Three");
	await expect.element(select).toHaveValue("Three");
});

test("required marks the select required", async () => {
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		required: true,
	});
	await expect.element(screen.getByLabelText("Pick")).toBeRequired();
});

test("disabled disables the select", async () => {
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		disabled: true,
	});
	await expect.element(screen.getByLabelText("Pick")).toBeDisabled();
});

test("validate: a failing customValidator renders its message in the validation box", async () => {
	const customValidator = vi.fn((v: unknown) => (v === "Two" ? undefined : "pick Two"));
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		value: "One",
		validate: { customValidator },
	});
	const select = screen.getByLabelText("Pick");

	fireChange(select.element());
	await expect.element(screen.getByText("pick Two")).toBeInTheDocument();
	expect(customValidator).toHaveBeenCalled();
});

test("validate: selecting the valid option clears the validation message", async () => {
	const customValidator = (v: unknown) => (v === "Two" ? undefined : "pick Two");
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		value: "One",
		validate: { customValidator },
	});
	const select = screen.getByLabelText("Pick");

	fireChange(select.element());
	await expect.element(screen.getByText("pick Two")).toBeInTheDocument();

	await select.selectOptions("Two");
	await expect.element(screen.getByText("pick Two")).not.toBeInTheDocument();
});

test("description text is rendered alongside the select", async () => {
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: OPTIONS,
		description: "Helpful hint",
	});
	await expect.element(screen.getByText("Helpful hint")).toBeInTheDocument();
});

test("optgroup: an option with an optgroup renders inside a matching <optgroup>", async () => {
	const screen = await render(FieldSelect, {
		label: "Pick",
		options: [{ label: "A", value: "A", optgroup: "G" }],
	});
	const optgroup = screen.container.querySelector('optgroup[label="G"]');
	expect(optgroup).not.toBeNull();
	expect(optgroup!.querySelector('option[value="A"]')).not.toBeNull();
});
