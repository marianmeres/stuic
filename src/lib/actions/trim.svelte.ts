/**
 * A Svelte action that trims whitespace from input values on change.
 *
 * Removes leading and trailing whitespace from the input value when the user
 * leaves the field (on "change" event).
 *
 * @param el - The input or textarea element
 * @param fn - Optional function returning configuration options
 * @param fn.enabled - Whether trimming is active (default: true)
 * @param fn.setValue - Callback to sync the trimmed value with bound state
 *
 * @example
 * ```svelte
 * <input use:trim />
 *
 * <!-- With bound value sync -->
 * <input bind:value use:trim={() => ({ setValue: (v) => value = v })} />
 *
 * <!-- Conditionally enabled -->
 * <input use:trim={() => ({ enabled: shouldTrim })} />
 * ```
 */
export function trim(
	el: HTMLInputElement | HTMLTextAreaElement,
	fn?: () => { enabled?: boolean; setValue?: (v: string) => any }
) {
	// the node has been mounted in the DOM

	$effect(() => {
		// setup goes here
		let { enabled, setValue } = fn?.() || { enabled: true };

		function trim(e: Event) {
			if (enabled && typeof el.value === "string") {
				el.value = el.value.trim();
				setValue?.(el.value);
			}
		}

		el.addEventListener("change", trim);

		return () => {
			el.removeEventListener("change", trim);
		};
	});
}
