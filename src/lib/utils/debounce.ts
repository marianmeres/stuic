/**
 * A simple debounce function that delays invoking the provided function
 * until after a specified wait time has elapsed since the last time it was invoked.
 *
 * Example:
 *
 * ```js
 * const search = (query: string) => { console.log(`Searching for: ${query}`); };
 * const debouncedSearch = debounce(search, 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return function (this: unknown, ...args: Parameters<T>): void {
		if (timeout !== null) clearTimeout(timeout);
		timeout = setTimeout(() => fn.apply(this, args), wait);
	};
}
