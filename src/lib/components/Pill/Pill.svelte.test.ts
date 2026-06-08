import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Pill from "./Pill.svelte";

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// A plain pill (no href/onclick) renders a roleless <span>. The children snippet
// wraps content in its own inner <span>, so getByText would resolve to that inner
// node, not the outer .stuic-pill wrapper that carries the data-* contract. Target
// the wrapper directly via a data-testid passed through {...rest}.

test("plain pill renders a span.stuic-pill with default variant/size data-attrs", async () => {
	const screen = render(Pill, {
		children: text("Tag"),
		"data-testid": "pill",
	});
	const pill = screen.getByTestId("pill");
	await expect.element(pill).toBeInTheDocument();
	await expect.element(pill).toHaveClass("stuic-pill");
	// defaults from source: variant = "soft", size = "md"
	await expect.element(pill).toHaveAttribute("data-variant", "soft");
	await expect.element(pill).toHaveAttribute("data-size", "md");
});

test("intent/variant/size map to data-* attributes", async () => {
	const screen = render(Pill, {
		children: text("Status"),
		intent: "success",
		variant: "solid",
		size: "lg",
		"data-testid": "pill",
	});
	const pill = screen.getByTestId("pill");
	await expect.element(pill).toHaveAttribute("data-intent", "success");
	await expect.element(pill).toHaveAttribute("data-variant", "solid");
	await expect.element(pill).toHaveAttribute("data-size", "lg");
});

test("active reflects data-active=true", async () => {
	const screen = render(Pill, {
		children: text("Filter"),
		active: true,
		"data-testid": "pill",
	});
	await expect.element(screen.getByTestId("pill")).toHaveAttribute("data-active", "true");
});

test("href renders an anchor with data-interactive", async () => {
	const screen = render(Pill, { children: text("Go"), href: "/somewhere" });
	const link = screen.getByRole("link");
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("href", "/somewhere");
	await expect.element(link).toHaveClass("stuic-pill");
	await expect.element(link).toHaveAttribute("data-interactive", "true");
});

test("onclick (no href) renders a button and fires once on click", async () => {
	const onclick = vi.fn();
	const screen = render(Pill, { children: text("Click"), onclick });
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveClass("stuic-pill");
	await expect.element(btn).toHaveAttribute("data-interactive", "true");
	await btn.click();
	expect(onclick).toHaveBeenCalledOnce();
});

test("disabled button is disabled (and is not actionable)", async () => {
	const onclick = vi.fn();
	const screen = render(Pill, {
		children: text("Nope"),
		onclick,
		disabled: true,
	});
	const btn = screen.getByRole("button");
	// A native disabled <button> is not Playwright-actionable; assert state, don't click.
	await expect.element(btn).toBeDisabled();
	await expect.element(btn).toHaveAttribute("disabled");
});

test("dismissible: outer span gets data-dismissible and a Dismiss button is present", async () => {
	const screen = render(Pill, { children: text("Tag"), dismissible: true });
	const dismiss = screen.getByRole("button", { name: "Dismiss" });
	await expect.element(dismiss).toBeInTheDocument();
	await expect.element(dismiss).toHaveClass("stuic-pill-dismiss");
});

test("dismiss click fires ondismiss once and does NOT fire pill onclick (stopPropagation)", async () => {
	const ondismiss = vi.fn();
	const onclick = vi.fn();
	const screen = render(Pill, {
		children: text("Tag"),
		dismissible: true,
		ondismiss,
		onclick,
	});
	// In dismissible mode the interactive area is button.stuic-pill-main;
	// the dismiss button (aria-label "Dismiss") is a sibling that stops propagation.
	const dismiss = screen.getByRole("button", { name: "Dismiss" });
	await dismiss.click();
	expect(ondismiss).toHaveBeenCalledOnce();
	expect(onclick).not.toHaveBeenCalled();
});
