import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import ListItemButton from "./ListItemButton.svelte";

// ListItemButton renders a native <button class="stuic-list-item-button" type="button">
// by default, switching to an <a> when `href` is set. Visual state lives in data-*
// attributes (data-active/data-focused are EMPTY-string flags), and preset sizes map to
// data-size while custom Tailwind sizes are merged into the class list (twMerge). Both
// branches carry an ARIA role (button / link), so every case here uses getByRole; the
// anchor variant additionally lets us read its data-* contract off the <a>.
//
// children come from createRawSnippet (a .svelte.test.ts can't hold markup); contentBefore
// / contentAfter are THC values rendered as plain text by Thc.svelte ({ text } branch).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

test("renders a native button.stuic-list-item-button[type=button] with children", async () => {
	const screen = render(ListItemButton, { children: text("Hello") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveClass("stuic-list-item-button");
	await expect.element(btn).toHaveAttribute("type", "button");
	await expect.element(btn).toHaveTextContent("Hello");
	// Browser-only: real Chromium gives the button a layout box, so the element and
	// its rendered children are genuinely visible (toBeVisible is a layout read that
	// node/jsdom can't honor; it does NOT depend on the component's index.css, which
	// this suite does not load).
	await expect.element(btn).toBeVisible();
	await expect.element(screen.getByText("Hello")).toBeVisible();
});

test("active=true sets data-active to an empty-string attribute", async () => {
	const screen = render(ListItemButton, { active: true, children: text("Item") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveAttribute("data-active", "");
});

test("focused=true sets data-focused to an empty-string attribute", async () => {
	const screen = render(ListItemButton, { focused: true, children: text("Item") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveAttribute("data-focused", "");
});

test("preset size 'lg' maps to data-size='lg'", async () => {
	const screen = render(ListItemButton, { size: "lg", children: text("Big") });
	const btn = screen.getByRole("button");
	await expect.element(btn).toHaveAttribute("data-size", "lg");
});

test("custom size (non-preset) has no data-size but is merged into the class list", async () => {
	const screen = render(ListItemButton, { size: "h-20", children: text("Tall") });
	const btn = screen.getByRole("button");
	// non-preset size is NOT reflected as data-size...
	await expect.element(btn).not.toHaveAttribute("data-size");
	// ...but twMerge keeps the base class and merges in the custom size class
	await expect.element(btn).toHaveClass("stuic-list-item-button");
	await expect.element(btn).toHaveClass("h-20");
});

test("disabled=true disables the button (assert state — do not click)", async () => {
	// onclick/disabled arrive via ...rest (HTMLButtonAttributes)
	const onclick = vi.fn();
	const screen = render(ListItemButton, {
		disabled: true,
		onclick,
		children: text("Nope"),
	});
	await expect.element(screen.getByRole("button")).toBeDisabled();
});

test("onclick fires once on click (enabled button)", async () => {
	const onclick = vi.fn();
	const screen = render(ListItemButton, { onclick, children: text("Click") });
	await screen.getByRole("button").click();
	expect(onclick).toHaveBeenCalledOnce();
});

test("href renders an anchor (link) and no button, with data-* still applied", async () => {
	const screen = render(ListItemButton, {
		href: "/x",
		size: "lg",
		active: true,
		children: text("Go"),
	});
	const link = screen.getByRole("link");
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("href", "/x");
	await expect.element(link).toHaveClass("stuic-list-item-button");
	// the data-* contract applies to the anchor branch too
	await expect.element(link).toHaveAttribute("data-size", "lg");
	await expect.element(link).toHaveAttribute("data-active", "");
	// and there is no <button> in this variant
	await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
});

test("contentBefore/contentAfter THC { text } render as visible plain text", async () => {
	const screen = render(ListItemButton, {
		contentBefore: { text: "B4" },
		contentAfter: { text: "AF" },
		children: text("Main"),
	});
	// Thc renders { text } as a plain text node, before/after the main content.
	// toBeVisible is a real-layout read (browser-only) confirming all three text
	// fragments actually render into the live DOM.
	await expect.element(screen.getByText("B4")).toBeVisible();
	await expect.element(screen.getByText("AF")).toBeVisible();
	await expect.element(screen.getByText("Main")).toBeVisible();
});

test("unstyled=true drops the base class and suppresses the data-* state attributes", async () => {
	const screen = render(ListItemButton, {
		unstyled: true,
		size: "lg",
		active: true,
		focused: true,
		children: text("Raw"),
	});
	const btn = screen.getByRole("button");
	await expect.element(btn).not.toHaveClass("stuic-list-item-button");
	await expect.element(btn).not.toHaveAttribute("data-size");
	await expect.element(btn).not.toHaveAttribute("data-active");
	await expect.element(btn).not.toHaveAttribute("data-focused");
});
