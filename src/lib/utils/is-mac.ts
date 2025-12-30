/**
 * Detects if the current device is running macOS.
 *
 * Uses modern `userAgentData` API when available, falls back to legacy `navigator.platform`
 * and `navigator.userAgent` for older browsers.
 *
 * @returns Promise that resolves to `true` if running on macOS
 *
 * @example
 * ```ts
 * const mac = await isMac();
 * const modKey = mac ? 'Cmd' : 'Ctrl';
 * ```
 */
export async function isMac() {
	const rx = /mac/i;

	// modern
	const nav = navigator as Navigator & {
		userAgentData?: {
			getHighEntropyValues: (hints: string[]) => Promise<{ platform: string }>;
		};
	};
	if (nav.userAgentData) {
		const uad = await nav.userAgentData.getHighEntropyValues(["platform"]);
		return rx.test(uad.platform);
	}

	// old fallback
	return rx.test(navigator.platform) || rx.test(navigator.userAgent);
}
