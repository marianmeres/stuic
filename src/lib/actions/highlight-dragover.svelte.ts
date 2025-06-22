/**
 * Will just add classes to el when being dragged over
 */
export function highlightDragover(
	el: HTMLElement,
	fn?: () => { enabled?: boolean; classes?: string[] }
) {
	// function handle_drop(e: DragEvent) {
	// 	const files = e?.dataTransfer?.files;

	// 	// Update the file input with the dropped files
	// 	el.files = files || null;

	// 	// Trigger change event for any listeners
	// 	el.dispatchEvent(new Event("change"));
	// }

	function prevent(e: DragEvent) {
		e.preventDefault();
		// e.stopPropagation();
	}

	const HIGH = ["dragenter", "dragover"];
	const UNHIGH = ["dragleave", "drop"];
	// const ALL = [...HIGH, ...UNHIGH];

	$effect(() => {
		let { classes = ["dragover"], enabled = true } = fn?.() || {};
		if (!enabled) return;

		if (!Array.isArray(classes)) classes = [classes];
		// allow strings
		classes = classes.reduce((m, c) => {
			m = [
				...m,
				...c
					.split(/\s/)
					.map((v) => v.trim())
					.filter(Boolean),
			];
			return m;
		}, [] as string[]);

		// el.addEventListener("drop", prevent);

		const highlight = () => el.classList.add(...classes);
		const unhighlight = () => el.classList.remove(...classes);

		// ALL.forEach((name: any) => el.addEventListener(name, prevent, false));
		HIGH.forEach((name) => el.addEventListener(name, highlight));
		UNHIGH.forEach((name) => el.addEventListener(name, unhighlight));

		// el.addEventListener("drop", handle_drop, false);

		return () => {
			// el.removeEventListener("drop", prevent);
			// ALL.forEach((name: any) => el.removeEventListener(name, prevent));
			HIGH.forEach((name) => el.removeEventListener(name, highlight));
			UNHIGH.forEach((name) => el.removeEventListener(name, unhighlight));

			// el.removeEventListener("drop", handle_drop);
		};
	});
}
