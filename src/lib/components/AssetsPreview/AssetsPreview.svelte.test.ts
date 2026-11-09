import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Fixture from "./AssetsPreview.fixture.svelte";

// AssetsPreview is the MODAL gallery: it wraps the same AssetsPreviewContent (covered
// in depth by AssetsPreviewInline.svelte.test.ts) inside a ModalDialog and exposes an
// imperative open(index?)/close(). What is unique here — and all this file asserts — is
// the modal plumbing: nothing renders until open() is called; open() shows the dialog on
// the first asset and open(index) on that asset; the current index survives an `assets`
// change while the preview is open; and the content's Close button (AssetsPreview does
// NOT pass noClose, so it is present) closes the dialog.
//
// (In-preview navigation — dots, arrows, zoom — is covered hermetically by
// AssetsPreviewInline.svelte.test.ts, which renders the same AssetsPreviewContent without
// the modal. open(index) is NOT covered there: it is the modal's own path, so it lives here.)
//
// The modal is driven through AssetsPreview.fixture.svelte (an opener button + the
// bind:this ref). The native <dialog> is only in the accessibility tree while open, so
// presence/absence of role="dialog" is the open/closed signal — always via auto-retry.

// Loadable, hermetic 1x1 PNG (the component preloads images without .catch, so a
// dead/network URL would reject unhandled). Explicit name + type:"image" keeps the
// name label deterministic. See AssetsPreviewInline.svelte.test.ts for the same note.
const PNG_1X1 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const img = (name: string) => ({
	name,
	type: "image",
	url: { full: PNG_1X1, original: PNG_1X1, thumb: PNG_1X1 },
});
const ALPHA = img("alpha.jpg");
const BETA = img("beta.jpg");
const GAMMA = img("gamma.jpg");

// The current asset name is the one unambiguous text node; read it live (never via a
// snapshotting locator — it changes as the index changes).
const currentName = (container: Element) =>
	container.ownerDocument.body
		.querySelector(".stuic-assets-preview-label")
		?.textContent?.trim() ?? "";

test("nothing is shown until open() is called: no dialog initially", async () => {
	const screen = await render(Fixture, { assets: [ALPHA, BETA] });

	// The opener exists, but the modal dialog is not in the a11y tree yet.
	await expect.element(screen.getByTestId("opener")).toBeInTheDocument();
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("open() shows the modal dialog starting on the first asset", async () => {
	const screen = await render(Fixture, { assets: [ALPHA, BETA] });

	await screen.getByTestId("opener").click();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	// Default open() index is 0 -> the first asset's name shows.
	await expect.poll(() => currentName(screen.container)).toBe("alpha.jpg");
});

test("open(index) shows that asset, not the first", async () => {
	// A middle index, so "landed on the right asset" is distinguishable from both
	// "fell back to the first" and "clamped to the last".
	const screen = await render(Fixture, { assets: [ALPHA, BETA, GAMMA], openIndex: 1 });

	await screen.getByTestId("opener").click();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.poll(() => currentName(screen.container)).toBe("beta.jpg");
});

test("an `assets` change while the preview is open keeps the current index", async () => {
	const screen = await render(Fixture, { assets: [ALPHA, BETA] });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.poll(() => currentName(screen.container)).toBe("alpha.jpg");

	// Navigate inside the open preview (the dots are buttons named after their asset).
	await screen.getByRole("button", { name: "beta.jpg" }).click();
	await expect.poll(() => currentName(screen.container)).toBe("beta.jpg");

	// The consumer hands over a new `assets` identity (e.g. an upload finished). Wait
	// until the new asset's dot proves the change reached the content, then assert the
	// position did not snap back to the first asset.
	await screen.rerender({ assets: [ALPHA, BETA, GAMMA] });
	await expect
		.element(screen.getByRole("button", { name: "gamma.jpg" }))
		.toBeInTheDocument();
	await expect.poll(() => currentName(screen.container)).toBe("beta.jpg");
});

test("the Close button closes the modal", async () => {
	const screen = await render(Fixture, { assets: [ALPHA, BETA] });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// AssetsPreview does not pass noClose, so the content renders a Close button
	// (aria-label "Close") wired to modal.close().
	await screen.getByRole("button", { name: "Close" }).click();

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("onDownload threads through the modal: clicking Download fires the spy with the current asset + index", async () => {
	const onDownload = vi.fn();
	const screen = await render(Fixture, { assets: [ALPHA, BETA], onDownload });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dl = screen.getByRole("button", { name: "Download" });
	await expect.element(dl).toBeInTheDocument();
	await dl.click();

	expect(onDownload).toHaveBeenCalledOnce();
	// onDownload(asset, index) — opened at default index 0 (alpha).
	const [asset, index] = onDownload.mock.calls[0];
	expect(index).toBe(0);
	expect(asset).toMatchObject({ name: "alpha.jpg" });
});
