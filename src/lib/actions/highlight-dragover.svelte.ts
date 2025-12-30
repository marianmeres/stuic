/**
 * A Svelte action that adds CSS classes to an element during drag-over events.
 *
 * Useful for providing visual feedback when files are being dragged over a drop zone.
 * Uses `$effect` for reactive updates when options change.
 *
 * @param el - The element to apply highlight classes to
 * @param fn - Optional function returning configuration options
 * @param fn.enabled - Whether the action is active (default: true)
 * @param fn.classes - CSS class(es) to add during dragover (default: ['dragover'])
 *
 * @example
 * ```svelte
 * <div
 *   use:highlightDragover={() => ({ classes: ['border-blue-500', 'bg-blue-50'] })}
 *   ondrop={handleDrop}
 * >
 *   Drop files here
 * </div>
 *
 * <!-- With reactive enabled state -->
 * <div use:highlightDragover={() => ({ enabled: isDropEnabled })}>
 *   ...
 * </div>
 * ```
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

	// function prevent(e: DragEvent) {
	// 	e.preventDefault();
	// 	// e.stopPropagation();
	// }

	const HIGH = ["dragenter", "dragover"];
	const UNHIGH = ["dragleave", "drop"];
	// const ALL = [...HIGH, ...UNHIGH];

	$effect(() => {
		const { enabled = true } = fn?.() || {};
		let { classes = ["dragover"] } = fn?.() || {};
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
