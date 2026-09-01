/**
 * Copies `text` to the system clipboard.
 *
 * Uses the async Clipboard API (`navigator.clipboard.writeText`) and, when that is
 * unavailable (insecure context, older browser) or rejects (permission policy,
 * unfocused document), falls back to the legacy `document.execCommand("copy")` path
 * via an off-screen textarea. Rejects only when both paths fail — with the async
 * API's own error when it was the one that failed.
 *
 * Call it from a user gesture (a click handler): browsers gate clipboard writes on
 * transient user activation, and Safari in particular expects the write to happen
 * promptly after the gesture. Any async work (resolving the text) should be kept
 * short.
 *
 * @param text - The text to place on the clipboard
 * @returns Resolves once the text is on the clipboard
 *
 * @example
 * ```ts
 * import { copyToClipboard } from "@marianmeres/stuic";
 *
 * try {
 *   await copyToClipboard(apiKey);
 *   notifications.success("Copied");
 * } catch (e) {
 *   notifications.error("Copy failed");
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<void> {
	let asyncError: unknown;

	if (
		typeof navigator !== "undefined" &&
		typeof navigator.clipboard?.writeText === "function"
	) {
		try {
			await navigator.clipboard.writeText(text);
			return;
		} catch (e) {
			asyncError = e;
		}
	}

	if (!legacyCopy(text)) {
		throw asyncError ?? new Error("Clipboard is not available");
	}
}

/**
 * Whether any clipboard write path is available in the current environment:
 * the async Clipboard API or the legacy `execCommand("copy")`. Always `false` outside
 * a browser (SSR). Useful to decide whether to render a copy control at all.
 *
 * @example
 * ```svelte
 * {#if isCopyToClipboardSupported()}
 *   <CopyButton text={url} />
 * {/if}
 * ```
 */
export function isCopyToClipboardSupported(): boolean {
	if (
		typeof navigator !== "undefined" &&
		typeof navigator.clipboard?.writeText === "function"
	) {
		return true;
	}
	return (
		typeof document !== "undefined" &&
		typeof document.queryCommandSupported === "function" &&
		document.queryCommandSupported("copy")
	);
}

/** The pre-Clipboard-API path: select the text in an off-screen textarea and `copy`. */
function legacyCopy(text: string): boolean {
	if (typeof document === "undefined" || typeof document.execCommand !== "function") {
		return false;
	}

	const active = document.activeElement as HTMLElement | null;
	const ta = document.createElement("textarea");
	ta.value = text;
	ta.setAttribute("readonly", "");
	ta.setAttribute("aria-hidden", "true");
	ta.tabIndex = -1;
	// off-screen and out of the way, but NOT display:none — hidden elements can't be selected
	ta.style.position = "fixed";
	ta.style.top = "0";
	ta.style.left = "0";
	ta.style.width = "1px";
	ta.style.height = "1px";
	ta.style.opacity = "0";
	ta.style.pointerEvents = "none";

	document.body.appendChild(ta);
	ta.focus({ preventScroll: true });
	ta.select();
	ta.setSelectionRange(0, text.length);

	let ok = false;
	try {
		ok = document.execCommand("copy");
	} catch (_e) {
		ok = false;
	}

	ta.remove();
	// the textarea stole focus — hand it back
	if (active && typeof active.focus === "function") active.focus({ preventScroll: true });

	return ok;
}
