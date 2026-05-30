import type { Attachment } from "svelte/attachments";

/**
 * Svelte attachment that drives the host element's `height` to match the natural
 * height of its single child, re-measuring whenever that child resizes, so the host
 * can animate smoothly between content sizes.
 *
 * Pair it with a CSS `height` transition on the host (gate it behind
 * `prefers-reduced-motion`). The attachment owns two things on the host: the inline
 * `height`, and — only **while that height is transitioning** — `overflow: clip`.
 * Clipping during the transition stops growing content from spilling out as the box
 * opens; clearing it at rest means focus rings, borders and shadows that paint outside
 * the box are **not** cut off when the animation is idle. Do not set `overflow`
 * yourself on the host (it would override the at-rest reset and clip permanently).
 *
 * To keep focus rings / borders visible *during* the transition too, set
 * `overflow-clip-margin` on the host in CSS — `clip` honours it, so paint within that
 * margin bleeds past the clip edge instead of being sliced. Size it per consumer to the
 * largest thing that paints outside a child's box (focus outline width + offset, or a
 * shadow's blur/spread); too small still clips, too large lets growing content peek a
 * little further before it's clipped. A focus outline of a few px typically needs
 * `~0.5rem`. Expose it as a custom property if downstream consumers may need to tune it.
 *
 * The host should contain exactly one element child (the thing being measured); give
 * that child its natural, content-driven height. On mount the host's `height` is locked
 * from `auto` to a px value (no first-paint animation — `auto` is not interpolatable),
 * then a `ResizeObserver` keeps it in sync. With no transition configured, or under
 * `prefers-reduced-motion`, the height simply snaps and nothing is ever clipped.
 *
 * @example
 * ```svelte
 * <div class="viewport" {@attach autoHeight}>
 *   <div class="inner">
 *     <!-- variable-height content; swapping it animates the viewport height -->
 *   </div>
 * </div>
 *
 * <style>
 *   .inner { display: flex; flex-direction: column; }
 *   @media (prefers-reduced-motion: no-preference) {
 *     .viewport { transition: height 250ms ease; }
 *   }
 * </style>
 * ```
 *
 * (Note: do not set `overflow` on `.viewport` — the attachment manages it.)
 *
 * Conditional usage (a falsy value means "no attachment"):
 * ```svelte
 * <div {@attach enabled && autoHeight}>...</div>
 * ```
 */
export const autoHeight: Attachment<HTMLElement> = (node) => {
	const measure = () => {
		const inner = node.firstElementChild as HTMLElement | null;
		if (!inner) return;
		const next = `${inner.offsetHeight}px`;
		if (node.style.height === next) return;

		// Clip *only* while a real transition will play, so growing content doesn't
		// spill out mid-animation — but focus rings / borders show fully at rest.
		// `transitionDuration` is "0s" with no transition configured or under
		// prefers-reduced-motion; the first measure (from `auto`) doesn't animate either.
		// Use `clip` (not `hidden`) so a CSS `overflow-clip-margin` on the host can let
		// focus rings / borders paint just outside the box instead of being sliced.
		const willAnimate =
			node.style.height !== "" &&
			parseFloat(getComputedStyle(node).transitionDuration) > 0;
		if (willAnimate) node.style.overflow = "clip";

		node.style.height = next;
	};

	// Restore visibility once the height settles (end or interrupt).
	const reveal = (e: TransitionEvent) => {
		if (e.target === node && e.propertyName === "height") node.style.overflow = "";
	};

	measure();

	const ro = new ResizeObserver(measure);
	if (node.firstElementChild) ro.observe(node.firstElementChild);
	node.addEventListener("transitionend", reveal);
	node.addEventListener("transitioncancel", reveal);

	return () => {
		ro.disconnect();
		node.removeEventListener("transitionend", reveal);
		node.removeEventListener("transitioncancel", reveal);
		node.style.height = "";
		node.style.overflow = "";
	};
};
