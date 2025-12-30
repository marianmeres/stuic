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
 * Waits for two browser repaint cycles to ensure DOM changes are fully painted.
 *
 * For complex timing needs where layout changes must be complete before continuing.
 * The first frame processes DOM updates, the second ensures styles and layout are applied.
 *
 * @returns A Promise that resolves after two animation frames
 *
 * @example
 * ```ts
 * element.style.display = 'block';
 * await waitForTwoRepaints();
 * // Element is now fully rendered with computed styles
 * element.classList.add('fade-in');
 * ```
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
