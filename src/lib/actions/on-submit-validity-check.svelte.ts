const SUBMIT_VALID_EVENT_NAME = "submit_valid";
const SUBMIT_INVALID_EVENT_NAME = "submit_invalid";

/**
 * The problem: custom validity checks via `validate` action are registered on
 * "input" or "change" events. When a form is submitted without touching those custom
 * validated elements, those will not be validity-checked...
 * I'm not able to come up with better solution than to manually trigger events which will
 * then trigger the custom validation... (utilizing the `requestSubmit` seems like
 * a right direction, but that still is not good)
 *
 * Still, smells like a hack...
 */
export function onSubmitValidityCheck(node: HTMLFormElement) {
	const onSubmit = (e: Event) => {
		e.preventDefault();

		// this will disable all other onsubmit listeners...
		e.stopImmediatePropagation();

		let invalid = [];
		for (let i = 0; i < node.elements?.length; i++) {
			let el = node.elements[i] as any;

			if (typeof el.checkValidity === "function") {
				// hm... radios are tricky, as triggering change automatically checks the last
				// input (last radio input), which is not desired
				if (el.type === "radio") continue;

				el.dispatchEvent(new Event("input", { bubbles: true }));
				el.dispatchEvent(new Event("change", { bubbles: true }));

				// typeof el.checkValidity === "function" && !el.checkValidity();
				if (!el.checkValidity()) {
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
