/**
 * A simple throttle function that limits how often a function can be called.
 * The function will be called at most once in the specified time period.
 *
 * Example:
 *
 * ```js
 * const scroll = (e: Event) => { console.log('Handling scroll event'); };
 * const throttledScroll = throttle(scroll, 300);
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastCall: number = 0;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let lastArgs: Parameters<T> | null = null;

	return function (...args: Parameters<T>): void {
		// @ts-ignore
		const context = this;
		const now = Date.now();

		// If enough time has passed since the last call
		if (now - lastCall >= limit) {
			if (timeout !== null) {
				clearTimeout(timeout);
				timeout = null;
			}

			lastCall = now;
			func.apply(context, args);
		} else {
			// Save the latest arguments
			lastArgs = args;

			// If there's no pending execution scheduled
			if (timeout === null) {
				timeout = setTimeout(
					() => {
						lastCall = Date.now();
						timeout = null;

						if (lastArgs !== null) {
							func.apply(context, lastArgs);
							lastArgs = null;
						}
					},
					limit - (now - lastCall)
				);
			}
		}
	};
}
