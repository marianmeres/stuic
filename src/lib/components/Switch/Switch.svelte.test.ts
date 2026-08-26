import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Switch from "./Switch.svelte";

// Inline snippet helper (per-file by convention — no shared helper exists yet).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// The root element is a <label class="stuic-switch …"> carrying role="switch" +
// aria-checked — that is the interactive, announced control, reachable via
// getByRole("switch"). `...rest` is spread onto it, so a `data-testid` prop lands
// there too.
//
// The hidden <input type="checkbox"> inside is the form value carrier only and is
// aria-hidden, so it is NOT reachable by role — query it structurally.
//
// IMPORTANT: the hidden checkbox sits dead-center of the label (component CSS,
// which would collapse it to 0×0, is not loaded in tests), so a default (centered)
// `.click()` lands on the input and double-toggles (native input toggle + the
// label's onclick → change()), which nets to no change. We click the dot/knob area
// near the left edge via `position` to hit the label cleanly.
const HIT = { position: { x: 2, y: 2 } } as const;

type SwitchExports = {
	validate: () => { valid: boolean } | undefined;
};

function checkbox(container: HTMLElement) {
	const el = container.querySelector('input[type="checkbox"]');
	if (!el) throw new Error("missing hidden checkbox input");
	return page.elementLocator(el);
}

test("renders the label track and the hidden checkbox input", async () => {
	const screen = render(Switch, { "data-testid": "sw" });
	await expect.element(screen.getByTestId("sw")).toBeInTheDocument();
	await expect.element(screen.getByTestId("sw")).toHaveClass("stuic-switch");
	await expect.element(checkbox(screen.container)).toBeInTheDocument();
});

test("the track is the announced control: role=switch, the input is aria-hidden", async () => {
	const screen = render(Switch, { "data-testid": "sw" });
	await expect.element(screen.getByRole("switch")).toBeInTheDocument();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("role", "switch");
	await expect.element(checkbox(screen.container)).toHaveAttribute("aria-hidden", "true");
	// the aria-hidden input is not exposed as a second control
	expect(screen.container.querySelectorAll('[role="switch"]').length).toBe(1);
});

test("label prop becomes the accessible name (aria-label)", async () => {
	const screen = render(Switch, { "data-testid": "sw", label: "Published" });
	await expect
		.element(screen.getByTestId("sw"))
		.toHaveAttribute("aria-label", "Published");
	// reachable by its name, both by role+name and by label text
	await expect
		.element(screen.getByRole("switch", { name: "Published" }))
		.toBeInTheDocument();
	await expect.element(screen.getByLabelText("Published")).toBeInTheDocument();
});

test("an explicit aria-label from the caller wins over the label prop", async () => {
	const screen = render(Switch, {
		"data-testid": "sw",
		label: "Published",
		"aria-label": "Live on the public page",
	});
	await expect
		.element(screen.getByTestId("sw"))
		.toHaveAttribute("aria-label", "Live on the public page");
});

test("checked=true is reflected in the input, aria-checked and the data-checked attribute", async () => {
	const screen = render(Switch, { "data-testid": "sw", checked: true });
	await expect.element(checkbox(screen.container)).toBeChecked();
	await expect.element(screen.getByRole("switch")).toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-checked", "true");
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "true");
});

test("checked=false leaves the input unchecked with aria-checked/data-checked false", async () => {
	const screen = render(Switch, { "data-testid": "sw", checked: false });
	await expect.element(checkbox(screen.container)).not.toBeChecked();
	await expect.element(screen.getByRole("switch")).not.toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-checked", "false");
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "false");
});

test("clicking the track toggles the input checked state (reactivity proof)", async () => {
	const screen = render(Switch, { "data-testid": "sw", checked: false });
	const input = checkbox(screen.container);
	await expect.element(input).not.toBeChecked();

	// Click the dot/track — the label's onclick calls change(), which flips
	// checkbox.checked and dispatches a native "change" that drives bind:checked.
	await screen.getByTestId("sw").click(HIT);
	await expect.element(input).toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "true");
	// the announced state tracks it
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-checked", "true");

	// Toggle back.
	await screen.getByTestId("sw").click(HIT);
	await expect.element(input).not.toBeChecked();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-checked", "false");
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-checked", "false");
});

test("onclick callback fires once when the track is clicked", async () => {
	const onclick = vi.fn();
	const screen = render(Switch, { "data-testid": "sw", checked: false, onclick });
	await screen.getByTestId("sw").click(HIT);
	expect(onclick).toHaveBeenCalledOnce();
});

test("disabled marks the input disabled and sets data-disabled + aria-disabled", async () => {
	const screen = render(Switch, {
		"data-testid": "sw",
		checked: false,
		disabled: true,
	});
	// A label wrapping a disabled control is itself reported as not-actionable by
	// Playwright (clicking it would time out), so we do NOT click here — we assert
	// the disabled contract directly. The label's onclick also early-returns on
	// `disabled`, so no toggle could occur anyway.
	await expect.element(checkbox(screen.container)).toBeDisabled();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("data-disabled", "true");
	// <label> takes no `disabled` attribute, so the state must be announced via aria
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-disabled", "true");
});

test("required is announced on the switch (the input carrying it is aria-hidden)", async () => {
	const screen = render(Switch, { "data-testid": "sw", required: true });
	await expect.element(checkbox(screen.container)).toBeRequired();
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-required", "true");
});

test("no aria-disabled / aria-required when not disabled / not required", async () => {
	const screen = render(Switch, { "data-testid": "sw" });
	await expect.element(screen.getByTestId("sw")).not.toHaveAttribute("aria-disabled");
	await expect.element(screen.getByTestId("sw")).not.toHaveAttribute("aria-required");
	await expect.element(screen.getByTestId("sw")).not.toHaveAttribute("aria-invalid");
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
		.element(checkbox(screen.container))
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

test("a failed validation is announced via aria-invalid on the switch", async () => {
	const screen = render(Switch, {
		"data-testid": "sw",
		required: true,
		validate: true,
	});
	await expect.element(screen.getByTestId("sw")).not.toHaveAttribute("aria-invalid");

	// required + unchecked => invalid
	const sw = screen.component as unknown as SwitchExports;
	const res = sw.validate();
	expect(res?.valid).toBe(false);
	await expect.element(screen.getByTestId("sw")).toHaveAttribute("aria-invalid", "true");
});
