/**
 * Waits for the next browser repaint cycle using `requestAnimationFrame`.
 *
 * Useful for ensuring DOM updates are applied before reading layout properties.
 *
 * @returns A Promise that resolves after the next animation frame
 *
 * @example
 * ```ts
 * element.classList.add('animate');
 * await waitForNextRepaint();
 * // Now the class is applied and styles computed
 * ```
 */
export function waitForNextRepaint() {
	return new Promise((resolve) => {
		requestAnimationFrame(resolve);
	});
}

/**
 * For more complex timing needs, you might sometimes need to wait for two animation frames
 * to ensure changes have been painted, especially if you're making DOM changes that affect
 * layout...
 *
 * 1. The first one waits for the next frame where the browser processes the DOM update
 * 2. The second one waits for the frame after that, where the browser has had time to apply
 *    styles, calculate layout, and paint
 */
export async function waitForTwoRepaints() {
	await waitForNextRepaint();
	await waitForNextRepaint();
}

/**
 * Waits for a CSS transition to complete on an element.
 *
 * Listens for the `transitionend` event and resolves when fired.
 *
 * @param element - The DOM element to watch for transition end
 * @returns A Promise that resolves when the transition completes
 *
 * @example
 * ```ts
 * element.classList.add('slide-out');
 * await waitForTransitionEnd(element);
 * element.remove();
 * ```
 */
export function waitForTransitionEnd(element: Element) {
	return new Promise((resolve) => {
		element.addEventListener("transitionend", function handler() {
			element.removeEventListener("transitionend", handler);
			resolve(undefined);
		});
	});
}
