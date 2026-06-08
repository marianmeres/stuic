import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Switch from "./Switch.svelte";

// Inline snippet helper (per-file by convention — no shared helper exists yet).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// The root element is a <label class="stuic-switch …">. `...rest` is spread onto
// that label, so a `data-testid` prop lands on it and lets us target the actual
// interactive surface. The hidden <input type="checkbox"> carries the checked
// state (implicit role "checkbox").
//
// IMPORTANT: the hidden checkbox sits dead-center of the label, so a default
// (centered) `.click()` lands on the input and double-toggles (native input
// toggle + the label's onclick → change()), which nets to no change. We click
// the dot/knob area near the left edge via `position` to hit the label cleanly.
const HIT = { position: { x: 2, y: 2 } } as const;

test("renders the label track and the hidden checkbox input", async () => {
	const screen = render(Switch, { "data-testid": "sw" });
	await expect.element(screen.getByTestId("sw")).toBeInTheDocument();
	await expect.element(screen.getByTestId("sw")).toHaveClass("stuic-switch");
	await expect.element(screen.getByRole("checkbox")).toBeInTheDocument();
});

test("checked=true is reflected in the input and the data-checked attribute", async () => {
	const screen = render(Switch, { "data-testid": "sw", checked: true });
	await expect.element(screen.getByRole("checkbox")).toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "true");
});

test("checked=false leaves the input unchecked with data-checked=false", async () => {
	const screen = render(Switch, { "data-testid": "sw", checked: false });
	await expect.element(screen.getByRole("checkbox")).not.toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "false");
});

test("clicking the track toggles the input checked state (reactivity proof)", async () => {
	const screen = render(Switch, { "data-testid": "sw", checked: false });
	const input = screen.getByRole("checkbox");
	await expect.element(input).not.toBeChecked();

	// Click the dot/track — the label's onclick calls change(), which flips
	// checkbox.checked and dispatches a native "change" that drives bind:checked.
	await screen.getByTestId("sw").click(HIT);
	await expect.element(input).toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "true");

	// Toggle back.
	await screen.getByTestId("sw").click(HIT);
	await expect.element(input).not.toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "false");
});

test("onclick callback fires once when the track is clicked", async () => {
	const onclick = vi.fn();
	const screen = render(Switch, { "data-testid": "sw", checked: false, onclick });
	await screen.getByTestId("sw").click(HIT);
	expect(onclick).toHaveBeenCalledOnce();
});

test("disabled marks the input disabled and sets data-disabled", async () => {
	const screen = render(Switch, {
		"data-testid": "sw",
		checked: false,
		disabled: true,
	});
	// A label wrapping a disabled control is itself reported as not-actionable by
	// Playwright (clicking it would time out), so we do NOT click here — we assert
	// the disabled contract directly. The label's onclick also early-returns on
	// `disabled`, so no toggle could occur anyway.
	await expect.element(screen.getByRole("checkbox")).toBeDisabled();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-disabled", "true");
});

test("intent is reflected via the data-intent attribute", async () => {
	const screen = render(Switch, { "data-testid": "sw", intent: "success" });
	await expect
		.element(screen.getByTestId("sw"))
		.toHaveAttribute("data-intent", "success");
});

test("name is forwarded to the hidden checkbox for form participation", async () => {
	const screen = render(Switch, { "data-testid": "sw", name: "notifications" });
	await expect
		.element(screen.getByRole("checkbox"))
		.toHaveAttribute("name", "notifications");
});

test("on snippet renders inside the dot when checked", async () => {
	const screen = render(Switch, {
		"data-testid": "sw",
		checked: true,
		on: text("ON"),
		off: text("OFF"),
	});
	await expect.element(screen.getByText("ON")).toBeInTheDocument();
	await expect.element(screen.getByText("OFF")).not.toBeInTheDocument();
});

test("off snippet renders inside the dot when unchecked", async () => {
	const screen = render(Switch, {
		"data-testid": "sw",
		checked: false,
		on: text("ON"),
		off: text("OFF"),
	});
	await expect.element(screen.getByText("OFF")).toBeInTheDocument();
	await expect.element(screen.getByText("ON")).not.toBeInTheDocument();
});
