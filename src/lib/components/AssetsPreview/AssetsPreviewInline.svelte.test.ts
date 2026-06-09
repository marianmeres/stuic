import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import AssetsPreviewInline from "./AssetsPreviewInline.svelte";

// AssetsPreviewInline is the non-modal gallery: it renders AssetsPreviewContent
// directly inside <div role="region" class="stuic-assets-preview" tabindex="0">
// (and passes noClose, so there is never a "Close" button here).
//
// What only a real browser proves (and what we assert): normalizeInput turns
// absolute image URLs into named, isImage assets; the current asset's name shows
// in <span class="stuic-assets-preview-label">; the zoom buttons reflect the
// discrete zoom-index state (Zoom out disabled at index 0, enabled after Zoom in);
// the dots reflect/drive the bound currentIndex (the .active dot + the name label
// update immediately even while a ~300ms slide animation plays); and ArrowRight on
// the root advances via the onkeydown handler.
//
// LOCATING NOTES:
//  - role="region" with no accessible name is NOT reliably exposed as a "region"
//    role, so we never use getByRole("region"); the root is found via
//    container.querySelector(".stuic-assets-preview") and wrapped in a Locator
//    (page.elementLocator) so DOM assertions on it auto-retry.
//  - The prev/next arrow Buttons are icon-only (no accessible name) -> we never
//    locate them by name; navigation is asserted via the named dots / the keyboard.
//  - The zoom/download/delete buttons and the dots all carry explicit accessible
//    names (aria-label), so getByRole("button", { name }) is unambiguous for them.
//
// TIMING: goTo()/next() run a ~300ms CSS slide, but they set previewIdx (-> the
// bound currentIndex, the .active dot and the name label) synchronously up front,
// so every navigation assertion still goes through expect.element auto-retry —
// never a synchronous read.

// Real, loadable 1x1 PNG. The component preloads images and does NOT .catch the
// promise, so a dead/unreachable URL would reject as an unhandled rejection (and
// would also make the suite depend on the network — fatal in CI). A data URI loads
// instantly and offline. We pass AssetPreview objects with an explicit name +
// type:"image" so normalizeInput marks them as images and the name label / dot
// aria-labels are deterministic.
const PNG_1X1 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const img = (name: string) => ({
	name,
	type: "image",
	url: { full: PNG_1X1, original: PNG_1X1, thumb: PNG_1X1 },
});
const ALPHA = img("alpha.jpg");
const BETA = img("beta.jpg");

// The single source of truth for "which asset is showing" is the name label —
// the one unambiguous text node (the dots' names live in aria-label, not text).
// We read it LIVE via expect.poll rather than wrapping it in page.elementLocator:
// elementLocator snapshots the element by its current text, so it goes stale the
// moment the name changes during navigation (the PricingTable lesson). Polling the
// live textContent re-reads the (stable) span on every retry.
const currentName = (container: Element) =>
	container.querySelector(".stuic-assets-preview-label")?.textContent?.trim() ?? "";

// During a slide there are two panels (outgoing + active) -> two <img>; once the
// ~300ms slide settles the outgoing panel is removed, leaving one. Polling for a
// single <img> both confirms the slide finished AND keeps the component mounted
// through the animation, so its async tail never runs on a torn-down component
// (which would surface as an unhandled track_reactivity_loss rejection). preloadImg
// uses a detached `new Image()`, so it never adds to the container's <img> count.
const slidePanelImgCount = (container: Element) =>
	container.querySelectorAll("img").length;

test("single image: name label shows the basename, Download present, no dots, no Close", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA] });

	// The root region carries the stuic hook class.
	const root = screen.container.querySelector(".stuic-assets-preview");
	expect(root).not.toBeNull();

	// normalizeInput sets name to the URL pathname basename.
	await expect.poll(() => currentName(screen.container)).toBe("alpha.jpg");

	// Download is rendered (noDownload defaults false).
	await expect
		.element(screen.getByRole("button", { name: "Download" }))
		.toBeInTheDocument();

	// Inline forces noClose -> there is no Close button.
	await expect
		.element(screen.getByRole("button", { name: "Close" }))
		.not.toBeInTheDocument();

	// Single asset -> no dots.
	expect(screen.container.querySelector(".stuic-assets-preview-dot")).toBeNull();
});

test("two images: two dots render and the first is the active one", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA, BETA] });

	// Dots render one-per-asset for galleries of length 2..10.
	await expect
		.element(screen.getByRole("button", { name: "alpha.jpg" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "beta.jpg" }))
		.toBeInTheDocument();

	const dots = screen.container.querySelectorAll(".stuic-assets-preview-dot");
	expect(dots).toHaveLength(2);

	// currentIndex defaults to 0 -> the first dot is active.
	await expect
		.element(screen.getByRole("button", { name: "alpha.jpg" }))
		.toHaveClass("active");
	await expect
		.element(screen.getByRole("button", { name: "beta.jpg" }))
		.not.toHaveClass("active");
});

test("clicking the beta dot navigates: name label -> 'beta.jpg' and that dot becomes active", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA, BETA] });

	await expect.poll(() => currentName(screen.container)).toBe("alpha.jpg");

	// goTo(1) sets previewIdx synchronously; the slide animation is cosmetic, the
	// bound index / .active dot / name label update right away (poll covers it).
	await screen.getByRole("button", { name: "beta.jpg" }).click();

	await expect.poll(() => currentName(screen.container)).toBe("beta.jpg");
	await expect
		.element(screen.getByRole("button", { name: "beta.jpg" }))
		.toHaveClass("active");
	await expect
		.element(screen.getByRole("button", { name: "alpha.jpg" }))
		.not.toHaveClass("active");

	// Let the slide settle (outgoing panel removed -> single img) before the test
	// ends, so the component's async slide tail completes while still mounted.
	await expect.poll(() => slidePanelImgCount(screen.container)).toBe(1);
});

test("Zoom out is disabled at zoom index 0; clicking Zoom in enables it", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA] });

	const zoomOut = screen.getByRole("button", { name: "Zoom out" });
	const zoomIn = screen.getByRole("button", { name: "Zoom in" });

	// At zoom index 0, Zoom out is disabled, Zoom in is enabled.
	await expect.element(zoomOut).toBeDisabled();
	await expect.element(zoomIn).toBeEnabled();

	await zoomIn.click();

	// Zoom index advanced -> Zoom out becomes enabled.
	await expect.element(zoomOut).toBeEnabled();
});

test("noZoom hides both zoom buttons", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA], noZoom: true });

	// Wait for the gallery to mount (Download confirms the controls rendered).
	await expect
		.element(screen.getByRole("button", { name: "Download" }))
		.toBeInTheDocument();

	await expect
		.element(screen.getByRole("button", { name: "Zoom in" }))
		.not.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Zoom out" }))
		.not.toBeInTheDocument();
});

test("noDownload hides the Download button", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA], noDownload: true });

	// Zoom in confirms the control bar rendered (zoom defaults on for images).
	await expect
		.element(screen.getByRole("button", { name: "Zoom in" }))
		.toBeInTheDocument();

	await expect
		.element(screen.getByRole("button", { name: "Download" }))
		.not.toBeInTheDocument();
});

test("onDelete fn renders a Delete button; clicking it fires the spy with the current asset + index", async () => {
	const onDelete = vi.fn();
	const screen = render(AssetsPreviewInline, { assets: [ALPHA, BETA], onDelete });

	const del = screen.getByRole("button", { name: "Delete" });
	await expect.element(del).toBeInTheDocument();

	await del.click();

	expect(onDelete).toHaveBeenCalledOnce();
	// onDelete(asset, index, controls) — index 0 is the current asset (alpha).
	const [asset, index, controls] = onDelete.mock.calls[0];
	expect(index).toBe(0);
	expect(asset).toMatchObject({ name: "alpha.jpg", isImage: true });
	expect(typeof controls?.close).toBe("function");
});

test("ArrowRight on the root advances to the next asset (name label -> 'beta.jpg')", async () => {
	const screen = render(AssetsPreviewInline, { assets: [ALPHA, BETA] });

	await expect.poll(() => currentName(screen.container)).toBe("alpha.jpg");

	// The root <div> owns the onkeydown handler (ArrowRight -> next()). Dispatch on it.
	const rootEl = screen.container.querySelector(".stuic-assets-preview");
	expect(rootEl).not.toBeNull();
	rootEl!.dispatchEvent(
		new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
	);

	await expect.poll(() => currentName(screen.container)).toBe("beta.jpg");

	// Let the slide settle before the test ends (see slidePanelImgCount note).
	await expect.poll(() => slidePanelImgCount(screen.container)).toBe(1);
});
