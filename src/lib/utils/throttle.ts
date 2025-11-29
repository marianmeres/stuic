/**
 * Creates a throttled function that limits how often the original function can be called.
 *
 * The function will be invoked at most once per `limit` milliseconds. If called multiple
 * times within the limit, the last call's arguments will be used for a trailing invocation.
 *
 * @typeParam T - The type of the function to throttle
 * @param func - The function to throttle
 * @param limit - Minimum time in milliseconds between invocations
 * @returns A throttled version of the function
 *
 * @example
 * ```ts
 * const handleScroll = (e: Event) => console.log('Scrolled!');
 * const throttledScroll = throttle(handleScroll, 300);
 * window.addEventListener('scroll', throttledScroll);
 * // handleScroll will be called at most once every 300ms
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
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
