import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { copyToClipboard, isCopyToClipboardSupported } from "./copy-to-clipboard.js";

// Browser project (real Chromium) so the async Clipboard API is real — the vitest
// config grants clipboard-read/write to the context. The legacy execCommand path is
// exercised with the async API shadowed away, since Chromium has both.

const CLIPBOARD_DESC = Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard")!;

function hideAsyncClipboard() {
	Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
}

afterEach(() => {
	vi.restoreAllMocks();
	// drop the instance shadow (if any) so the prototype getter is back
	if (Object.getOwnPropertyDescriptor(navigator, "clipboard")) {
		delete (navigator as unknown as Record<string, unknown>).clipboard;
	}
	expect(Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard")).toEqual(
		CLIPBOARD_DESC
	);
});

test("async path: writes the text to the real clipboard", async () => {
	// focus the document first — the async clipboard API refuses unfocused documents
	document.body.innerHTML = `<button id="focus-me">focus</button>`;
	await page.getByRole("button", { name: "focus" }).click();

	const text = `stuic copy-to-clipboard ${Date.now()}`;
	await copyToClipboard(text);
	await expect.poll(() => navigator.clipboard.readText()).toBe(text);
});

test("legacy path: falls back to execCommand('copy') when the async API is missing", async () => {
	hideAsyncClipboard();
	let selected: string | undefined;
	const exec = vi.spyOn(document, "execCommand").mockImplementation((cmd) => {
		if (cmd !== "copy") return false;
		// the helper's textarea is focused + selected at the time of the call
		const ta = document.activeElement as HTMLTextAreaElement | null;
		selected = ta?.value.slice(ta.selectionStart, ta.selectionEnd);
		return true;
	});

	await expect(copyToClipboard("legacy value")).resolves.toBeUndefined();
	expect(exec).toHaveBeenCalledWith("copy");
	expect(selected).toBe("legacy value");
	// the helper textarea is gone again
	expect(document.querySelector("textarea[aria-hidden]")).toBeNull();
});

test("legacy path restores focus to the previously active element", async () => {
	hideAsyncClipboard();
	vi.spyOn(document, "execCommand").mockReturnValue(true);
	document.body.innerHTML = `<button id="owner">owner</button>`;
	const owner = document.getElementById("owner")!;
	owner.focus();
	expect(document.activeElement).toBe(owner);

	await copyToClipboard("x");
	expect(document.activeElement).toBe(owner);
});

test("async API rejection falls through to the legacy path", async () => {
	vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
		new DOMException("denied", "NotAllowedError")
	);
	const exec = vi.spyOn(document, "execCommand").mockReturnValue(true);

	await expect(copyToClipboard("via fallback")).resolves.toBeUndefined();
	expect(exec).toHaveBeenCalledWith("copy");
});

test("rejects with the async API's error when both paths fail", async () => {
	const boom = new DOMException("denied", "NotAllowedError");
	vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(boom);
	vi.spyOn(document, "execCommand").mockReturnValue(false);

	await expect(copyToClipboard("nope")).rejects.toBe(boom);
});

test("rejects with a generic error when no path exists at all", async () => {
	hideAsyncClipboard();
	vi.spyOn(document, "execCommand").mockReturnValue(false);

	await expect(copyToClipboard("nope")).rejects.toThrow(/not available/i);
});

test("isCopyToClipboardSupported reflects the available paths", () => {
	expect(isCopyToClipboardSupported()).toBe(true);

	hideAsyncClipboard();
	vi.spyOn(document, "queryCommandSupported").mockReturnValue(true);
	expect(isCopyToClipboardSupported()).toBe(true);

	vi.spyOn(document, "queryCommandSupported").mockReturnValue(false);
	expect(isCopyToClipboardSupported()).toBe(false);
});
