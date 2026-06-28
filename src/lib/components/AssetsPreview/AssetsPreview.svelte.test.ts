import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Fixture from "./AssetsPreview.fixture.svelte";

// AssetsPreview is the MODAL gallery: it wraps the same AssetsPreviewContent (covered
// in depth by AssetsPreviewInline.svelte.test.ts) inside a ModalDialog and exposes an
// imperative open(index?)/close(). What is unique here — and all this file asserts — is
// the modal plumbing: nothing renders until open() is called; open() shows the dialog on
// the first asset; and the content's Close button (AssetsPreview does NOT pass noClose,
// so it is present) closes the dialog.
//
// (Index-precise navigation — open(index), dots, arrows — is covered hermetically by
// AssetsPreviewInline.svelte.test.ts, which renders the same AssetsPreviewContent without
// the modal's deferred open/preload effect.)
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

// The current asset name is the one unambiguous text node; read it live (never via a
// snapshotting locator — it changes as the index changes).
const currentName = (container: Element) =>
	container.ownerDocument.body
		.querySelector(".stuic-assets-preview-label")
		?.textContent?.trim() ?? "";

test("nothing is shown until open() is called: no dialog initially", async () => {
	const screen = render(Fixture, { assets: [ALPHA, BETA] });

	// The opener exists, but the modal dialog is not in the a11y tree yet.
	await expect.element(screen.getByTestId("opener")).toBeInTheDocument();
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("open() shows the modal dialog starting on the first asset", async () => {
	const screen = render(Fixture, { assets: [ALPHA, BETA] });

	await screen.getByTestId("opener").click();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	// Default open() index is 0 -> the first asset's name shows.
	await expect.poll(() => currentName(screen.container)).toBe("alpha.jpg");
});

test("the Close button closes the modal", async () => {
	const screen = render(Fixture, { assets: [ALPHA, BETA] });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// AssetsPreview does not pass noClose, so the content renders a Close button
	// (aria-label "Close") wired to modal.close().
	await screen.getByRole("button", { name: "Close" }).click();

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("onDownload threads through the modal: clicking Download fires the spy with the current asset + index", async () => {
	const onDownload = vi.fn();
	const screen = render(Fixture, { assets: [ALPHA, BETA], onDownload });

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
