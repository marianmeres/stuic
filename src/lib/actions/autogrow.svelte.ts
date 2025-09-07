export function autogrow(
	el: HTMLTextAreaElement,
	fn?: () => { enabled?: boolean; min?: number; max?: number; immediate?: boolean }
) {
	$effect(() => {
		let { enabled = true, max = 250, immediate = true } = fn?.() || {};

		function set_height(e: Event | null) {
			if (enabled) {
				el.style.height = "auto"; // Reset height to auto to correctly calculate scrollHeight
				el.style.height = Math.min(el.scrollHeight, max) + "px";
			}
		}

		if (immediate) set_height(null);

		el.addEventListener("input", set_height);
		el.addEventListener("blur", set_height);

		return () => {
			el.removeEventListener("input", set_height);
			el.removeEventListener("blur", set_height);
		};
	});
}
