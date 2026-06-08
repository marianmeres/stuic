import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Separator from "./Separator.svelte";

// Smoke test for the browser-mode harness (see docs/component-testing/01-framework-setup.md).
// If these pass, the client Svelte build, Chromium, tailwind and the locator API all work.

test("renders with role=separator and default horizontal orientation", async () => {
	const screen = render(Separator);
	const sep = screen.getByRole("separator");
	await expect.element(sep).toBeInTheDocument();
	await expect.element(sep).toHaveAttribute("data-orientation", "horizontal");
	await expect.element(sep).toHaveAttribute("aria-orientation", "horizontal");
	await expect.element(sep).toHaveClass("stuic-separator");
});

test("orientation=vertical is reflected in attributes", async () => {
	const screen = render(Separator, { orientation: "vertical" });
	const sep = screen.getByRole("separator");
	await expect.element(sep).toHaveAttribute("data-orientation", "vertical");
	await expect.element(sep).toHaveAttribute("aria-orientation", "vertical");
});

test("decorative drops the separator role and hides from a11y tree", async () => {
	const screen = render(Separator, { decorative: true });
	await expect.element(screen.getByRole("separator")).not.toBeInTheDocument();
});
