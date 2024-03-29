// this smells like a hack...
// The problem: custom validity checks via `validate` action are registered on "input" or "change" events.
// When a form is submitted without touching those custom validated elements, those will not be
// validity-checked which is not desired... I'm not able to come up with better solution
// than to manually trigger events which will then trigger the custom validation...
export const preSubmitValidityCheck = (node: HTMLFormElement) => {
	const onSubmit = () => {
		for (let i = 0; i < node.elements?.length; i++) {
			let el = node.elements[i];
			el.dispatchEvent(new Event('input', { bubbles: true }));
			el.dispatchEvent(new Event('change', { bubbles: true }));
			typeof el.checkValidity === 'function' && !el.checkValidity();
		}
	};
	node.addEventListener('submit', onSubmit, true);
	return {
		destroy() {
			node.removeEventListener('submit', onSubmit, true);
		},
	};
};
