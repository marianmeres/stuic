import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import Avatar from "./Avatar.svelte";

// Avatar's non-interactive form renders a plain <div class="stuic-avatar"> with
// no ARIA role, and an inner <span> that holds the photo/initials/icon. We locate
// the root via its `.stuic-avatar` class (like the Spinner test) and wrap the raw
// element in a Locator (page.elementLocator) so DOM assertions auto-retry.
// All markup is produced through $derived (synchronous on mount), so the container
// query is reliable right after `await render(...)`.

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-avatar");
	if (!el) throw new Error("missing .stuic-avatar root");
	return page.elementLocator(el);
}

test("default (no props) renders a div.stuic-avatar in icon mode with data-size=md", async () => {
	const { container } = await render(Avatar);
	const root = rootLocator(container);

	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-avatar");
	// size defaults to "md" which is a preset -> data-size="md"
	await expect.element(root).toHaveAttribute("data-size", "md");
	// no onclick -> rendered as <div>, not <button>; assert no interactive flag
	expect(container.querySelector("button")).toBeNull();
	// icon mode renders the default user icon as an inline <svg> via {@html}
	expect(container.querySelector("svg")).not.toBeNull();
});

test("src + alt renders an <img> with those attributes (photo mode)", async () => {
	const { container } = await render(Avatar, {
		src: "https://example.com/a.png",
		alt: "Alice avatar",
	});
	const img = page.elementLocator(container.querySelector("img")!);
	await expect.element(img).toBeInTheDocument();
	await expect.element(img).toHaveAttribute("src", "https://example.com/a.png");
	await expect.element(img).toHaveAttribute("alt", "Alice avatar");
	// no initials text node and no fallback svg while photo mode is active
	expect(container.querySelector("svg")).toBeNull();
});

test("initials prop extracts uppercase initials (full name -> first letters)", async () => {
	const { container } = await render(Avatar, { initials: "John Doe" });
	const root = rootLocator(container);
	// "John Doe" -> "JD" (full-name branch of extractInitials)
	await expect.element(root).toHaveTextContent("JD");
	// initials mode -> no img, no icon svg
	expect(container.querySelector("img")).toBeNull();
	expect(container.querySelector("svg")).toBeNull();
});

test("initials from email collapses local-part segments to initials", async () => {
	const { container } = await render(Avatar, { initials: "john.doe@example.com" });
	const root = rootLocator(container);
	// email branch: "john.doe" -> parts ["john","doe"] -> "JD"
	await expect.element(root).toHaveTextContent("JD");
});

test("no src and no initials falls back to icon mode (renders an svg)", async () => {
	const { container } = await render(Avatar);
	// renderMode resolves to "icon" -> default user icon emitted as <svg>
	expect(container.querySelector("svg")).not.toBeNull();
	expect(container.querySelector("img")).toBeNull();
});

test("onclick renders a <button type=button> with data-interactive and fires once", async () => {
	const onclick = vi.fn();
	const screen = render(Avatar, { onclick, initials: "AB" });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveAttribute("type", "button");
	await expect.element(btn).toHaveClass("stuic-avatar");
	await expect.element(btn).toHaveAttribute("data-interactive", "true");
	await btn.click();
	expect(onclick).toHaveBeenCalledOnce();
});

test("preset size maps to data-size; custom (non-preset) size has no data-size and is applied as a class", async () => {
	const lg = await render(Avatar, { size: "lg", initials: "AB" });
	await expect.element(rootLocator(lg.container)).toHaveAttribute("data-size", "lg");

	const custom = await render(Avatar, { size: "size-20", initials: "AB" });
	const root = rootLocator(custom.container);
	// non-preset size is NOT reflected as data-size...
	await expect.element(root).not.toHaveAttribute("data-size");
	// ...but is merged into the class list (twMerge keeps stuic-avatar + the size class)
	await expect.element(root).toHaveClass("stuic-avatar");
	await expect.element(root).toHaveClass("size-20");
});

test("autoColor is deterministic: same input yields the same inline color style", async () => {
	// Verified against the djb2 strHash + generateAvatarColors algorithm:
	//   "alice" -> bg hsl(0, 40%, 81%), text hsl(0, 55%, 22%)
	// The browser normalizes the source HSL in the inline style attribute to rgb():
	//   hsl(0, 40%, 81%)  -> rgb(226, 187, 187)
	//   hsl(0, 55%, 22%)  -> rgb(87, 25, 25)
	const a = await render(Avatar, { initials: "alice", autoColor: true });
	const b = await render(Avatar, { initials: "alice", autoColor: true });

	const styleA = rootLocator(a.container).element().getAttribute("style") ?? "";
	const styleB = rootLocator(b.container).element().getAttribute("style") ?? "";

	// Same input -> identical generated style string (determinism contract)
	expect(styleA).toBe(styleB);
	// And it contains the exact computed background/text colors (browser-normalized rgb)
	expect(styleA).toContain("background-color: rgb(226, 187, 187)");
	expect(styleA).toContain("color: rgb(87, 25, 25)");
});

test("autoColor: different inputs produce different colors", async () => {
	const a = await render(Avatar, { initials: "alice", autoColor: true });
	const b = await render(Avatar, { initials: "bob", autoColor: true });
	const styleA = rootLocator(a.container).element().getAttribute("style") ?? "";
	const styleB = rootLocator(b.container).element().getAttribute("style") ?? "";
	expect(styleA).not.toBe(styleB);
});

test("padding adds data-padded and exposes the padding value as a CSS custom property", async () => {
	const { container } = await render(Avatar, { initials: "AB", padding: "4px" });
	const root = rootLocator(container);
	// data-padded is set to "" when padding is provided
	await expect.element(root).toHaveAttribute("data-padded", "");
	// padding value is surfaced via the --stuic-avatar-padding custom property on the
	// outer element. toHaveStyle can't parse a bare custom property, so read the inline
	// style attribute string (which preserves "--stuic-avatar-padding: 4px") instead.
	const style = root.element().getAttribute("style") ?? "";
	expect(style).toContain("--stuic-avatar-padding: 4px");
});

test("img load error switches to icon fallback (default fallback='icon')", async () => {
	// Force the <img> onerror handler by pointing src at an unresolvable URL.
	// handleImageError() sets imageError=true, flipping renderMode photo -> icon.
	const { container } = await render(Avatar, {
		src: "https://invalid.invalid/__definitely_missing__.png",
	});
	// After the error fires, the fallback user icon (<svg>) should appear and the <img> should be gone.
	await expect.poll(() => container.querySelector("svg")).not.toBeNull();
	expect(container.querySelector("img")).toBeNull();
});
