import { waitForNextRepaint } from "../utils/paint.js";

const SUBMIT_VALID_EVENT_NAME = "submit_valid";

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

		let invalidCount = 0;
		for (let i = 0; i < node.elements?.length; i++) {
			let el = node.elements[i] as any;

			if (typeof el.checkValidity === "function") {
				// hm... radios are tricky, as triggering change automatically checks the last
				// input (last radio input), which is not desired
				if (el.type === "radio") continue;

				el.dispatchEvent(new Event("input", { bubbles: true }));
				el.dispatchEvent(new Event("change", { bubbles: true }));

				// typeof el.checkValidity === "function" && !el.checkValidity();
				if (!el.checkValidity()) invalidCount++;
			}
		}

		// none invalid
		if (!invalidCount) {
			node.dispatchEvent(
				new CustomEvent(SUBMIT_VALID_EVENT_NAME, {
					bubbles: true,
					detail: { formData: new FormData(node) },
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
