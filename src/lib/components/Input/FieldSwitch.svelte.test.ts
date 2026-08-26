import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import FieldSwitch from "./FieldSwitch.svelte";

// Inline snippet helper (per-file by convention — no shared helper exists yet).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// FieldSwitch wraps <Switch> inside InputWrap. InputWrap renders the
// <div class="stuic-input" data-size> shell + a <label for={id} id="{id}-label">;
// the control is a <Switch> whose root <label class="stuic-switch"> carries
// role="switch" + aria-checked and holds an aria-hidden <input type="checkbox">
// carrying the checked state for form submission.
//
// The InputWrap <label for={id}> is still NOT associated to anything (`for` cannot
// point at the <Switch>'s own <label>, and its inner checkbox is aria-hidden), so
// clicking the label text does not toggle. The accessible NAME does work: FieldSwitch
// points the switch's aria-labelledby at `{id}-label`, so getByLabelText() reaches it.
//
// TOGGLE GOTCHA (see Switch/Switch.svelte.test.ts): the hidden checkbox sits
// dead-center of the .stuic-switch label, so a default centered .click() lands on
// the input and double-toggles to a no-op. We click the switch label OFF-CENTER.
const HIT = { position: { x: 2, y: 2 } } as const;

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

function switchLabel(container: HTMLElement) {
	const el = container.querySelector(".stuic-switch");
	if (!el) throw new Error("missing .stuic-switch label");
	return page.elementLocator(el);
}

function checkbox(container: HTMLElement) {
	const el = container.querySelector('input[type="checkbox"]');
	if (!el) throw new Error("missing hidden checkbox input");
	return page.elementLocator(el);
}

test("renders the stuic-input shell (data-size=md) with the label and a switch control", async () => {
	const screen = await render(FieldSwitch, { label: "Notifications" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// the InputWrap label text renders
	await expect.element(screen.getByText("Notifications")).toBeInTheDocument();
	// the Switch's root label is the interactive control
	await expect.element(screen.getByRole("switch")).toBeInTheDocument();
	// the hidden checkbox is the value carrier only
	await expect.element(checkbox(screen.container)).toBeInTheDocument();
});

test("the visible label names the switch (aria-labelledby → getByLabelText)", async () => {
	const screen = await render(FieldSwitch, { label: "Notifications" });
	await expect.element(screen.getByLabelText("Notifications")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("switch", { name: "Notifications" }))
		.toBeInTheDocument();
	// the aria-labelledby target is the InputWrap label itself
	const labelledby = switchLabel(screen.container)
		.element()
		.getAttribute("aria-labelledby");
	expect(labelledby).toBeTruthy();
	expect(screen.container.querySelector(`#${labelledby}`)?.tagName).toBe("LABEL");
});

test("no label → no dangling aria-labelledby", async () => {
	const screen = await render(FieldSwitch, {});
	await expect.element(screen.getByRole("switch")).toBeInTheDocument();
	await expect
		.element(switchLabel(screen.container))
		.not.toHaveAttribute("aria-labelledby");
});

test("checked=true is reflected in the checkbox and on the switch", async () => {
	const screen = await render(FieldSwitch, { label: "On", checked: true });
	await expect.element(checkbox(screen.container)).toBeChecked();
	await expect.element(screen.getByRole("switch")).toBeChecked();
});

test("checked=false leaves the checkbox unchecked", async () => {
	const screen = await render(FieldSwitch, { label: "Off", checked: false });
	await expect.element(checkbox(screen.container)).not.toBeChecked();
	await expect.element(screen.getByRole("switch")).not.toBeChecked();
});

test("clicking the switch label off-center toggles the checkbox (reactivity proof)", async () => {
	const screen = await render(FieldSwitch, { label: "Toggle", checked: false });
	const input = checkbox(screen.container);
	await expect.element(input).not.toBeChecked();

	// off-center click hits the label cleanly (centered click would double-toggle)
	await switchLabel(screen.container).click(HIT);
	await expect.element(input).toBeChecked();
	await expect.element(screen.getByRole("switch")).toBeChecked();

	// toggle back
	await switchLabel(screen.container).click(HIT);
	await expect.element(input).not.toBeChecked();
	await expect.element(screen.getByRole("switch")).not.toBeChecked();
});

test("disabled marks the checkbox disabled and announces it on the switch", async () => {
	const screen = await render(FieldSwitch, { label: "Locked", disabled: true });
	// A label wrapping a disabled control is not actionable; assert the contract directly.
	await expect.element(checkbox(screen.container)).toBeDisabled();
	await expect
		.element(switchLabel(screen.container))
		.toHaveAttribute("aria-disabled", "true");
	// the InputWrap label still renders
	await expect.element(screen.getByText("Locked")).toBeInTheDocument();
});

test("required marks the checkbox required and announces it on the switch", async () => {
	const screen = await render(FieldSwitch, { label: "Must", required: true });
	await expect.element(checkbox(screen.container)).toBeRequired();
	await expect
		.element(switchLabel(screen.container))
		.toHaveAttribute("aria-required", "true");
});

test("name is forwarded to the hidden checkbox for form participation", async () => {
	const screen = await render(FieldSwitch, { label: "Field", name: "newsletter" });
	await expect.element(checkbox(screen.container)).toHaveAttribute("name", "newsletter");
});

test("renderSize maps through to the data-size on the stuic-input wrapper", async () => {
	const screen = await render(FieldSwitch, { label: "Big", renderSize: "lg" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("description text is rendered below the control", async () => {
	const screen = await render(FieldSwitch, {
		label: "Field",
		description: "Helpful hint",
	});
	await expect.element(screen.getByText("Helpful hint")).toBeInTheDocument();
});

test("intent reaches the underlying Switch", async () => {
	const screen = await render(FieldSwitch, { label: "Live", intent: "success" });
	await expect
		.element(switchLabel(screen.container))
		.toHaveAttribute("data-intent", "success");
});

test("classInput reaches the underlying Switch", async () => {
	const screen = await render(FieldSwitch, { label: "Styled", classInput: "my-switch" });
	await expect.element(switchLabel(screen.container)).toHaveClass("my-switch");
});

test("switchSize sizes the switch independently of renderSize", async () => {
	const screen = await render(FieldSwitch, {
		label: "Small switch",
		renderSize: "lg",
		switchSize: "sm",
	});
	// shell stays lg …
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
	// … while the switch itself picks the sm size preset
	await expect.element(switchLabel(screen.container)).toHaveClass("h-6");
	await expect.element(switchLabel(screen.container)).toHaveClass("w-11");
});

test("dotClass reaches the switch's knob", async () => {
	const screen = await render(FieldSwitch, { label: "Dot", dotClass: "my-dot" });
	const dot = screen.container.querySelector(".stuic-switch > .dot");
	expect(dot?.classList.contains("my-dot")).toBe(true);
});

test("tabindex reaches the switch", async () => {
	const screen = await render(FieldSwitch, { label: "Tab", tabindex: 3 });
	await expect.element(switchLabel(screen.container)).toHaveAttribute("tabindex", "3");
});

test("rest props land on the switch (escape hatch, as in every other Field*)", async () => {
	const screen = await render(FieldSwitch, { label: "Rest", "data-testid": "sw" });
	await expect.element(screen.getByTestId("sw")).toHaveClass("stuic-switch");
});

test("preHook reaches the switch and can veto the toggle", async () => {
	const screen = await render(FieldSwitch, {
		label: "Guarded",
		checked: false,
		preHook: async () => false,
	});
	await switchLabel(screen.container).click(HIT);
	await expect.element(checkbox(screen.container)).not.toBeChecked();
	await expect.element(screen.getByRole("switch")).not.toBeChecked();
});

test("on/off snippets reach the switch's knob", async () => {
	const screen = await render(FieldSwitch, {
		label: "Iconed",
		checked: true,
		on: text("YES"),
		off: text("NO"),
	});
	await expect.element(screen.getByText("YES")).toBeInTheDocument();
	await expect.element(screen.getByText("NO")).not.toBeInTheDocument();
});
