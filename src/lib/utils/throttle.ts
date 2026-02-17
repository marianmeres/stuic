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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastCall: number = 0;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let pendingCall: { args: Parameters<T>; context: unknown } | null = null;

	return function (this: unknown, ...args: Parameters<T>): void {
		const now = Date.now();

		// If enough time has passed since the last call
		if (now - lastCall >= limit) {
			if (timeout !== null) {
				clearTimeout(timeout);
				timeout = null;
			}

			lastCall = now;
			func.apply(this, args);
		} else {
			// Save the latest arguments and context
			pendingCall = { args, context: this };

			// If there's no pending execution scheduled
			if (timeout === null) {
				timeout = setTimeout(
					() => {
						lastCall = Date.now();
						timeout = null;

						if (pendingCall !== null) {
							func.apply(pendingCall.context, pendingCall.args);
							pendingCall = null;
						}
					},
					limit - (now - lastCall)
				);
			}
		}
	};
}
