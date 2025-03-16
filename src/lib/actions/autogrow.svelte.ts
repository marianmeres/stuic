export function autogrow(
	el: HTMLTextAreaElement,
	fn?: () => { enabled?: boolean; min?: number; max?: number }
) {
	$effect(() => {
		let { enabled = true, max = 250 } = fn?.() || {};

		function set_height(e: Event) {
			if (enabled) {
				el.style.height = "auto"; // Reset height to auto to correctly calculate scrollHeight
				el.style.height = Math.min(el.scrollHeight, max) + "px";
			}
		}

		el.addEventListener("input", set_height);

		return () => {
			el.removeEventListener("input", set_height);
		};
	});
}
