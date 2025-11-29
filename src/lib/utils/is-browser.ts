/**
 * Checks if the code is running in a browser environment.
 *
 * Useful for SSR/SSG scenarios where code may run on both server and client.
 *
 * @returns `true` if running in a browser with `window` and `document` available
 *
 * @example
 * ```ts
 * if (isBrowser()) {
 *   document.addEventListener('click', handleClick);
 * }
 * ```
 */
export function isBrowser() {
	return (
		typeof window !== "undefined" &&
		typeof document !== "undefined" &&
		globalThis === window
	);
}
