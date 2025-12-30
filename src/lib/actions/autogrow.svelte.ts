/**
 * A Svelte action that automatically grows a textarea to fit its content.
 *
 * Adjusts the textarea height as the user types, up to a maximum height.
 * Uses `$effect` for reactive updates when options change.
 *
 * @param el - The textarea element to apply autogrow to
 * @param fn - Optional function returning configuration options
 * @param fn.enabled - Whether autogrow is active (default: true)
 * @param fn.max - Maximum height in pixels (default: 250)
 * @param fn.immediate - Set height immediately on mount (default: true)
 * @param fn.value - If provided, triggers resize when value changes programmatically
 *
 * @example
 * ```svelte
 * <textarea use:autogrow />
 *
 * <!-- With options -->
 * <textarea use:autogrow={() => ({ max: 400 })} />
 *
 * <!-- With bound value for programmatic updates -->
 * <textarea bind:value use:autogrow={() => ({ value })} />
 * ```
 */
export function autogrow(
	el: HTMLTextAreaElement,
	fn?: () => {
		enabled?: boolean;
		min?: number;
		max?: number;
		immediate?: boolean;
		// if present, will work on the programatic set as well
		value?: string;
	}
) {
	let lastValue: string = el.value;

	$effect(() => {
		const { enabled = true, max = 250, immediate = true, value } = fn?.() || {};
		if (!enabled) return;

		function set_height() {
			// console.log(123, el.value);
			if (enabled) {
				el.style.height = "auto"; // Reset height to auto to correctly calculate scrollHeight
				el.style.height = Math.min(el.scrollHeight, max) + "px";
			}
		}

		// eventlistener strategy (we're not passing value)
		if (value === undefined) {
			if (immediate) set_height();
			el.addEventListener("input", set_height);
			el.addEventListener("blur", set_height);
		}
		// strategy with provided value
		else {
			if (value !== lastValue) {
				set_height();
				lastValue = value;
			}
		}

		return () => {
			el.removeEventListener("input", set_height);
			el.removeEventListener("blur", set_height);
		};
	});
}
