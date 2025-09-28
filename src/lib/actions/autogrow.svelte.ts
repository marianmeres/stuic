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
	let lastValue: any = el.value;

	$effect(() => {
		let { enabled = true, max = 250, immediate = true, value } = fn?.() || {};
		if (!enabled) return;

		function set_height(_e: Event | null) {
			// console.log(123, el.value);
			if (enabled) {
				el.style.height = "auto"; // Reset height to auto to correctly calculate scrollHeight
				el.style.height = Math.min(el.scrollHeight, max) + "px";
			}
		}

		// eventlistener strategy (we're not passing value)
		if (value === undefined) {
			if (immediate) set_height(null);
			el.addEventListener("input", set_height);
			el.addEventListener("blur", set_height);
		}
		// strategy with provided value
		else {
			if (value !== lastValue) {
				set_height(null);
				lastValue = value;
			}
		}

		return () => {
			el.removeEventListener("input", set_height);
			el.removeEventListener("blur", set_height);
		};
	});
}
