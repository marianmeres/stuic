/**
 *
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
 *
 */
export function waitForTransitionEnd(element: Element) {
	return new Promise((resolve) => {
		element.addEventListener("transitionend", function handler() {
			element.removeEventListener("transitionend", handler);
			resolve(undefined);
		});
	});
}
