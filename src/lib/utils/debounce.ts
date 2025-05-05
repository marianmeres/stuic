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
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return function (...args: Parameters<T>): void {
		// @ts-ignore
		const context = this;
		if (timeout !== null) clearTimeout(timeout);
		timeout = setTimeout(() => fn.apply(context, args), wait);
	};
}
