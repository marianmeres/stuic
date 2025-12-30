/**
 * Event name dispatched when form is valid on submit.
 */
const SUBMIT_VALID_EVENT_NAME = "submit_valid";

/**
 * Event name dispatched when form is invalid on submit.
 */
const SUBMIT_INVALID_EVENT_NAME = "submit_invalid";

/**
 * A Svelte action that validates all form fields before allowing submission.
 *
 * Solves the problem where custom validators (via the `validate` action) are only triggered
 * on input/change events. This action ensures all fields are validated on submit, even if
 * the user hasn't interacted with them.
 *
 * Dispatches custom events instead of the native submit:
 * - `submit_valid` - Form is valid, includes `{ formData: FormData }` in detail
 * - `submit_invalid` - Form is invalid, includes `{ invalid: HTMLElement[] }` in detail
 *
 * @param node - The form element to enhance
 *
 * @example
 * ```svelte
 * <form
 *   use:onSubmitValidityCheck
 *   onsubmit_valid={(e) => {
 *     const formData = e.detail.formData;
 *     // Handle valid submission
 *   }}
 *   onsubmit_invalid={(e) => {
 *     const invalidFields = e.detail.invalid;
 *     // Focus first invalid field, show errors, etc.
 *   }}
 * >
 *   <input required use:validate />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 *
 * @remarks
 * Access event names via static properties:
 * - `onSubmitValidityCheck.SUBMIT_VALID_EVENT_NAME`
 * - `onSubmitValidityCheck.SUBMIT_INVALID_EVENT_NAME`
 */
export function onSubmitValidityCheck(node: HTMLFormElement) {
	const onSubmit = (e: Event) => {
		e.preventDefault();

		// this will disable all other onsubmit listeners...
		e.stopImmediatePropagation();

		const invalid = [];
		for (let i = 0; i < node.elements?.length; i++) {
			const el = node.elements[i] as HTMLInputElement;

			if (typeof el.checkValidity === "function") {
				// hm... radios are tricky, as triggering change automatically checks the last
				// input (last radio input), which is not desired
				if (el.type === "radio") continue;

				el.dispatchEvent(new Event("input", { bubbles: true }));
				el.dispatchEvent(new Event("change", { bubbles: true }));

				// typeof el.checkValidity === "function" && !el.checkValidity();
				// NOTE: el.checkValidity() returns true for hidden inputs event if they are invalid!
				// if (!el.checkValidity()) {
				if (!el.validity.valid) {
					invalid.push(el);
				}
			}
		}

		// none invalid
		if (!invalid.length) {
			node.dispatchEvent(
				new CustomEvent(SUBMIT_VALID_EVENT_NAME, {
					bubbles: true,
					detail: { formData: new FormData(node) },
				})
			);
		} else {
			node.dispatchEvent(
				new CustomEvent(SUBMIT_INVALID_EVENT_NAME, {
					bubbles: true,
					detail: { invalid },
				})
			);
		}
	};

	$effect(() => {
		node.addEventListener("submit", onSubmit, true);
		return () => {
			node.removeEventListener("submit", onSubmit, true);
		};
	});
}

onSubmitValidityCheck.SUBMIT_VALID_EVENT_NAME = SUBMIT_VALID_EVENT_NAME;
onSubmitValidityCheck.SUBMIT_INVALID_EVENT_NAME = SUBMIT_INVALID_EVENT_NAME;
