import { MediaQuery } from "svelte/reactivity";

/**
 * Creates a reactive media query that detects the user's reduced motion preference.
 *
 * Uses the `prefers-reduced-motion: reduce` CSS media query. Useful for disabling
 * or reducing animations for users who have requested minimal motion.
 *
 * @returns A MediaQuery instance with a reactive `current` property (true if reduced motion is preferred)
 *
 * @example
 * ```ts
 * const reducedMotion = prefersReducedMotion();
 *
 * // In a component:
 * const duration = reducedMotion.current ? 0 : 300;
 * ```
 */
export function prefersReducedMotion(): MediaQuery {
	return new MediaQuery("(prefers-reduced-motion: reduce)");
}
