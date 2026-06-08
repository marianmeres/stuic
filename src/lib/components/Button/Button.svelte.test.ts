import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Button from "./Button.svelte";

// The flagship browser-mode test — establishes the patterns reused across the
// component suite (see docs/component-testing/02-test-conventions.md):
//   render() -> locators -> expect.element (auto-retry); events are spy props;
//   snippet children via createRawSnippet; assert the data-* contract, not class
//   strings. Kept per-file inline helper for `children` (no shared helper yet).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

test("renders a native button with the stuic-button base class and children", async () => {
	const screen = render(Button, { children: text("Click me") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveClass("stuic-button");
	await expect.element(btn).toHaveTextContent("Click me");
});

test("defaults to variant=solid and size=md, with no data-intent", async () => {
	const screen = render(Button, { children: text("Default") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveAttribute("data-variant", "solid");
	await expect.element(btn).toHaveAttribute("data-size", "md");
	await expect.element(btn).not.toHaveAttribute("data-intent");
});

test("intent / variant / size map to data-* attributes", async () => {
	const screen = render(Button, {
		intent: "primary",
		variant: "outline",
		size: "lg",
		children: text("Save"),
	});
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveAttribute("data-intent", "primary");
	await expect.element(btn).toHaveAttribute("data-variant", "outline");
	await expect.element(btn).toHaveAttribute("data-size", "lg");
});

test("disabled disables the button (assert state — a disabled button is not clickable)", async () => {
	const onclick = vi.fn();
	const screen = render(Button, { disabled: true, onclick, children: text("Nope") });
	await expect.element(screen.getByRole("button")).toBeDisabled();
});

test("href renders an anchor instead of a button", async () => {
	const screen = render(Button, { href: "/somewhere", children: text("Go") });
	const link = screen.getByRole("link");
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("href", "/somewhere");
	await expect.element(link).toHaveClass("stuic-button");
	await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
});

test("onclick fires once on click", async () => {
	const onclick = vi.fn();
	const screen = render(Button, { onclick, children: text("Click") });
	await screen.getByRole("button").click();
	expect(onclick).toHaveBeenCalledOnce();
});

test("spinner renders the Spinner element alongside the children", async () => {
	const screen = render(Button, { spinner: true, children: text("Loading") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveTextContent("Loading");
	// Spinner.svelte renders <div class="stuic-spinner">.
	expect(screen.container.querySelector(".stuic-spinner")).not.toBeNull();
});

test("spinnerOnly keeps the spinner but hides the children", async () => {
	const screen = render(Button, {
		spinner: true,
		spinnerOnly: true,
		children: text("Hidden"),
	});
	const btn = screen.getByRole("button");
	await expect.element(btn).not.toHaveTextContent("Hidden");
	expect(screen.container.querySelector(".stuic-spinner")).not.toBeNull();
});

test("roleSwitch toggles data-checked on click", async () => {
	const screen = render(Button, { roleSwitch: true, children: text("Toggle") });
	const btn = screen.getByRole("button");
	// checked starts false -> data-checked attribute is absent.
	await expect.element(btn).not.toHaveAttribute("data-checked");
	await btn.click();
	await expect.element(btn).toHaveAttribute("data-checked", "true");
	await btn.click();
	await expect.element(btn).not.toHaveAttribute("data-checked");
});

test("unstyled drops the base class and suppresses data-* attributes", async () => {
	const screen = render(Button, {
		unstyled: true,
		intent: "primary",
		children: text("Raw"),
	});
	const btn = screen.getByRole("button");
	await expect.element(btn).not.toHaveClass("stuic-button");
	await expect.element(btn).not.toHaveAttribute("data-intent");
});
