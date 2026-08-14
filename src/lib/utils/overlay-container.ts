/**
 * Shared bits for overlay actions (`popover`, `spotlight`, `dimBehind`) that
 * can portal their DOM into a consumer-provided container instead of
 * `document.body`.
 */

/**
 * The `container` option shape: a concrete element, or a lazy factory (useful
 * when the element does not exist yet at action-setup time). A factory
 * returning `null` means "use the default".
 */
export type OverlayContainerOption = HTMLElement | (() => HTMLElement | null);

/**
 * Resolve a `container` option to an element, or `null` when unset (callers
 * then fall back to their default — typically `document.body`).
 */
export function resolveContainerOption(
	option: OverlayContainerOption | undefined | null
): HTMLElement | null {
	return (typeof option === "function" ? option() : option) ?? null;
}
