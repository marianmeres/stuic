export function trim(
	el: HTMLInputElement | HTMLTextAreaElement,
	fn?: () => { enabled?: boolean; setValue?: (v: string) => any }
) {
	// the node has been mounted in the DOM

	$effect(() => {
		// setup goes here
		let { enabled, setValue } = fn?.() || { enabled: true };

		function _trim(e: Event) {
			if (enabled && typeof el.value === "string") {
				el.value = el.value.trim();
				setValue?.(el.value);
			}
		}

		el.addEventListener("change", _trim);

		return () => {
			el.removeEventListener("change", _trim);
		};
	});
}
