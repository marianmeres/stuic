/**
 * Shared helpers for CSS Anchor Positioning based actions (spotlight, popover,
 * tooltip).
 */

/**
 * Builds the `position-try-fallbacks` value for an anchored element at a given
 * position.
 *
 * For the centered positions (`top`/`bottom` are inline-centered; `left`/`right`
 * are block-centered) a `flip-inline`/`flip-block` is a no-op on the centered
 * axis, so the browser cannot slide the element back on-screen when the target
 * sits near a viewport edge. We append `span-*` variants that give it an edge to
 * align to. A JS clamp (see {@link clampIntoViewport}) should still be used as
 * the ultimate backstop; these fallbacks just yield nicer native placement.
 *
 * Note: tooltip/popover declare their fallbacks via `@position-try` named rules
 * in CSS instead and don't use this; it's primarily for the spotlight action,
 * which sets `position-try-fallbacks` inline.
 */
export function buildPositionTryFallbacks(position: string): string {
	const flips = "flip-block, flip-inline, flip-block flip-inline";
	if (position === "top" || position === "bottom") {
		return `${flips}, ${position} span-left, ${position} span-right`;
	}
	if (position === "left" || position === "right") {
		return `${flips}, ${position} span-top, ${position} span-bottom`;
	}
	return flips;
}

/**
 * Pull an element fully into the viewport with a corrective `transform`.
 *
 * This is the backstop for CSS Anchor Positioning: `position-try` can only swap
 * between discrete declared positions and cannot slide a centered annotation
 * back on-screen when the target is near a viewport edge — so without this an
 * anchored element can render off-screen on browsers that support anchor
 * positioning (e.g. Android Chrome).
 *
 * Synchronous and flicker-free: it clears any prior transform, force-measures
 * the natural rect (`getBoundingClientRect` triggers a synchronous layout), then
 * applies a single translate — all within one JS turn, so the browser only
 * paints the final, clamped position. The element MUST be laid out
 * (`display: block`) when called, and `transform` MUST NOT be in its
 * `transition-property` (callers use `transition-property: opacity`) so the
 * correction applies instantly. The caller owns the element's `transform`.
 *
 * @param el - The (anchored, position:fixed) element to clamp
 * @param margin - Minimum gap from each viewport edge, in px (default 8)
 */
export function clampIntoViewport(el: HTMLElement, margin = 8): void {
	// Remove any prior correction so we measure the natural (anchored or
	// left/top) position, then recompute from scratch.
	el.style.transform = "";
	const a = el.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	let dx = 0;
	let dy = 0;
	if (a.left < margin) dx = margin - a.left;
	else if (a.right > vw - margin) dx = vw - margin - a.right;
	if (a.top < margin) dy = margin - a.top;
	else if (a.bottom > vh - margin) dy = vh - margin - a.bottom;
	if (dx || dy) el.style.transform = `translate(${dx}px, ${dy}px)`;
}
