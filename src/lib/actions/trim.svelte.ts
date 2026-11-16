import { untrack } from "svelte";

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
	fn?: () => { enabled?: boolean; setValue?: (v: string) => void }
) {
	// the node has been mounted in the DOM

	$effect(() => {
		// setup goes here
		const { enabled, setValue } = fn?.() || { enabled: true };

		function trim() {
			if (enabled && typeof el.value === "string") {
				el.value = el.value.trim();
				// Chromium commits a focused, edited field while REMOVING it: this
				// `change` then arrives from inside the removal, which Svelte runs in a
				// block effect, where a `$state` write throws `state_unsafe_mutation`.
				// The node is still connected at that point, so `isConnected` cannot
				// tell the two apart. The write is this event handler's, not that
				// reaction's: `untrack` says so, and the trimmed value still reaches the
				// bound state (the edit is being committed, whoever caused it).
				untrack(() => setValue?.(el.value));
			}
		}

		el.addEventListener("change", trim);

		return () => {
			el.removeEventListener("change", trim);
		};
	});
}
