import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import ButtonGroupRadio from "./ButtonGroupRadio.svelte";

// ButtonGroupRadio renders a <div role="radiogroup" data-size> (only {#if coll.size}),
// with one Button per option rendered as role="radio" + aria-checked. Options can be
// plain strings, whose label text becomes both the visible text and the radio's
// accessible name -> we locate each radio by getByRole("radio", { name }). The selection
// lives in a derived ItemCollection; clicking a radio activates it (unless onButtonClick
// returns false), which is the high-yield reactive contract worth asserting here.
// NB: option ids embed Math.random() — never assert ids.

const OPTIONS = ["Apple", "Banana", "Cherry"];

test("root is a radiogroup, only rendered when there are options, with one radio per option", async () => {
	const screen = render(ButtonGroupRadio, { options: OPTIONS });
	const group = screen.getByRole("radiogroup");
	await expect.element(group).toBeInTheDocument();
	await expect.element(group).toHaveClass("stuic-button-group");
	// one role="radio" per option, addressable by its label text
	await expect.element(screen.getByRole("radio", { name: "Apple" })).toBeInTheDocument();
	await expect.element(screen.getByRole("radio", { name: "Banana" })).toBeInTheDocument();
	await expect.element(screen.getByRole("radio", { name: "Cherry" })).toBeInTheDocument();
});

test("root is NOT rendered when there are no options (the {#if coll.size} guard)", async () => {
	const screen = render(ButtonGroupRadio, { options: [] });
	// coll.size === 0 -> the whole <div role="radiogroup"> block is skipped
	await expect.element(screen.getByRole("radiogroup")).not.toBeInTheDocument();
});

test("size defaults to md and is reflected as data-size on the radiogroup", async () => {
	const screen = render(ButtonGroupRadio, { options: OPTIONS });
	await expect.element(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "md");
});

test("size prop is reflected as data-size on the radiogroup", async () => {
	const screen = render(ButtonGroupRadio, { options: OPTIONS, size: "lg" });
	await expect.element(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "lg");
});

test("initial value selects the matching radio (aria-checked) and leaves the others unchecked", async () => {
	const screen = render(ButtonGroupRadio, { options: OPTIONS, value: "Banana" });
	await expect
		.element(screen.getByRole("radio", { name: "Banana" }))
		.toHaveAttribute("aria-checked", "true");
	await expect
		.element(screen.getByRole("radio", { name: "Apple" }))
		.toHaveAttribute("aria-checked", "false");
	await expect
		.element(screen.getByRole("radio", { name: "Cherry" }))
		.toHaveAttribute("aria-checked", "false");
});

test("clicking a radio moves the selection (REACTIVITY): the clicked one becomes checked, the previous one unchecks", async () => {
	const screen = render(ButtonGroupRadio, { options: OPTIONS, value: "Banana" });
	const banana = screen.getByRole("radio", { name: "Banana" });
	const cherry = screen.getByRole("radio", { name: "Cherry" });

	// sanity: starts on Banana
	await expect.element(banana).toHaveAttribute("aria-checked", "true");

	await cherry.click();

	// selection moves to Cherry, Banana releases it
	await expect.element(cherry).toHaveAttribute("aria-checked", "true");
	await expect.element(banana).toHaveAttribute("aria-checked", "false");
});

test("onButtonClick fires with (index, coll) and activation still proceeds when it returns undefined", async () => {
	const onButtonClick = vi.fn(); // returns undefined -> does not prevent
	const screen = render(ButtonGroupRadio, {
		options: OPTIONS,
		value: "Apple",
		onButtonClick,
	});
	const cherry = screen.getByRole("radio", { name: "Cherry" });
	await cherry.click();

	// activation proceeded
	await expect.element(cherry).toHaveAttribute("aria-checked", "true");
	// spy was called, first arg is the clicked index (Cherry -> 2)
	expect(onButtonClick).toHaveBeenCalled();
	expect(onButtonClick.mock.calls[0][0]).toBe(2);
});

test("onButtonClick returning false prevents activation (aria-checked stays false)", async () => {
	const screen = render(ButtonGroupRadio, {
		options: OPTIONS,
		value: "Apple",
		onButtonClick: () => false,
	});
	const cherry = screen.getByRole("radio", { name: "Cherry" });
	await expect.element(cherry).toHaveAttribute("aria-checked", "false");
	await cherry.click();
	// activation was prevented -> Cherry never becomes selected
	await expect.element(cherry).toHaveAttribute("aria-checked", "false");
	// and the original selection is untouched
	await expect
		.element(screen.getByRole("radio", { name: "Apple" }))
		.toHaveAttribute("aria-checked", "true");
});

test("disabled=true disables the radios (state-only; do not click a disabled radio)", async () => {
	const screen = render(ButtonGroupRadio, {
		options: OPTIONS,
		value: "Banana",
		disabled: true,
	});
	await expect.element(screen.getByRole("radio", { name: "Apple" })).toBeDisabled();
	await expect.element(screen.getByRole("radio", { name: "Banana" })).toBeDisabled();
});

// Per-option disable: a FieldRadiosOption can carry `disabled: true`, which disables
// only that one radio (the group `disabled` prop disables all of them). The middle
// option is the object form so it can carry the flag while still being addressable by
// its label text.
const OPTIONS_WITH_DISABLED = ["Apple", { label: "Banana", disabled: true }, "Cherry"];

test("a per-option `disabled` flag disables only that radio, leaving the others enabled", async () => {
	const screen = render(ButtonGroupRadio, { options: OPTIONS_WITH_DISABLED });
	await expect.element(screen.getByRole("radio", { name: "Banana" })).toBeDisabled();
	await expect.element(screen.getByRole("radio", { name: "Apple" })).not.toBeDisabled();
	await expect.element(screen.getByRole("radio", { name: "Cherry" })).not.toBeDisabled();
});

test("keyboard navigation skips a disabled option (ArrowRight from Apple lands on Cherry, not the disabled Banana)", async () => {
	const screen = render(ButtonGroupRadio, {
		options: OPTIONS_WITH_DISABLED,
		value: "Apple",
	});
	const apple = screen.getByRole("radio", { name: "Apple" });
	await expect.element(apple).toHaveAttribute("aria-checked", "true");

	// Each radio owns its own onkeydown handler; dispatch ArrowRight on the active one.
	apple
		.element()
		.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

	// Banana (disabled) is skipped and stays unchecked; selection lands on Cherry.
	await expect
		.element(screen.getByRole("radio", { name: "Cherry" }))
		.toHaveAttribute("aria-checked", "true");
	await expect
		.element(screen.getByRole("radio", { name: "Banana" }))
		.toHaveAttribute("aria-checked", "false");
});
