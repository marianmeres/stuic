import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import ImageCycler from "./ImageCycler.svelte";

// ImageCycler renders a <div class="stuic-image-cycler"> wrapping a role="img"
// background div (.stuic-image-cycler-bg) carrying data-fit + aria-label +
// style:background-image. The auto-cycle $effect (setTimeout(minWait) +
// preloadImg) early-returns when images.length <= 1, so EVERY test here renders
// a SINGLE image: no timers, no network -> fully deterministic. We never test
// the cycling itself (timer + image preload are nondeterministic in a unit test).
//
// role="img" is a queryable ARIA role, so getByRole("img") locates the bg div
// directly. For the .stuic-image-cycler-meta block (role-less) we read it via
// container.querySelector + page.elementLocator, mirroring the Avatar test.

// Inline static-text snippet helper (matches Button.svelte.test.ts).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

const ALPHA = [{ src: "https://example.com/a.png", alt: "Alpha" }];

test("renders the styled root and a role=img bg with aria-label, data-fit and background-image", async () => {
	const { container } = await render(ImageCycler, { images: ALPHA, fit: "contain" });

	// styled root present
	const root = container.querySelector(".stuic-image-cycler");
	expect(root).not.toBeNull();

	const bg = page.getByRole("img");
	await expect.element(bg).toBeInTheDocument();
	await expect.element(bg).toHaveClass("stuic-image-cycler-bg");
	// the bg div lives inside the styled root (structural contract)
	expect(root!.querySelector(".stuic-image-cycler-bg")).not.toBeNull();
	// aria-label comes from alt
	await expect.element(bg).toHaveAttribute("aria-label", "Alpha");
	// fit is reflected as data-fit when styled
	await expect.element(bg).toHaveAttribute("data-fit", "contain");
	// background-image is set via style:background-image="url(<src>)"
	const style = bg.element().getAttribute("style") ?? "";
	expect(style).toContain("background-image");
	expect(style).toContain("https://example.com/a.png");
});

test("aria-label falls back to title when alt is absent", async () => {
	await render(ImageCycler, {
		images: [{ src: "https://example.com/b.png", title: "T" }],
	});
	const bg = page.getByRole("img");
	await expect.element(bg).toHaveAttribute("aria-label", "T");
});

test("title and description snippet props render inside .stuic-image-cycler-meta", async () => {
	const { container } = await render(ImageCycler, {
		images: ALPHA,
		title: text("My title"),
		description: text("My description"),
	});

	const meta = container.querySelector(".stuic-image-cycler-meta");
	expect(meta).not.toBeNull();
	const metaLoc = page.elementLocator(meta!);
	await expect.element(metaLoc).toHaveTextContent("My title");
	await expect.element(metaLoc).toHaveTextContent("My description");
});

test("no title/description snippets -> no .stuic-image-cycler-meta block", async () => {
	const { container } = await render(ImageCycler, { images: ALPHA });
	expect(container.querySelector(".stuic-image-cycler-meta")).toBeNull();
});

test("unstyled=true drops the stuic-image-cycler class and the bg has no data-fit", async () => {
	const { container } = await render(ImageCycler, {
		images: ALPHA,
		fit: "contain",
		unstyled: true,
	});

	// root no longer carries the base class
	expect(container.querySelector(".stuic-image-cycler")).toBeNull();

	// the bg div still renders (role=img) but data-fit is suppressed when unstyled
	const bg = page.getByRole("img");
	await expect.element(bg).toBeInTheDocument();
	await expect.element(bg).not.toHaveAttribute("data-fit");
});
