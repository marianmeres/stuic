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
		e.stopPropagation();
	}

	const HIGH = ["dragenter", "dragover"];
	const UNHIGH = ["dragleave", "drop"];
	// const ALL = [...HIGH, ...UNHIGH];

	$effect(() => {
		let { classes = ["dragover"], enabled = true } = fn?.() || {};
		if (!enabled) return;

		if (!Array.isArray(classes)) classes = [classes];

		const highlight = () => el.classList.add(...classes);
		const unhighlight = () => el.classList.remove(...classes);

		// ALL.forEach((name: any) => el.addEventListener(name, prevent, false));
		HIGH.forEach((name) => el.addEventListener(name, highlight, false));
		UNHIGH.forEach((name) => el.addEventListener(name, unhighlight, false));

		// el.addEventListener("drop", handle_drop, false);

		return () => {
			// ALL.forEach((name: any) => el.removeEventListener(name, prevent));
			HIGH.forEach((name) => el.removeEventListener(name, highlight));
			UNHIGH.forEach((name) => el.removeEventListener(name, unhighlight));

			// el.removeEventListener("drop", handle_drop);
		};
	});
}
