/**
 * Wraps an event handler to ensure it only fires once.
 *
 * @param fn - The event handler function
 * @returns A wrapped function that only executes once
 *
 * @example
 * ```ts
 * element.addEventListener('click', once((e) => console.log('Clicked!')));
 * // Logs only on first click
 * ```
 */
export function once(fn: (e: Event) => any) {
	return function (e: Event) {
		// @ts-ignore
		if (fn) fn.call(this, e);
		fn = null as any;
	};
}

/**
 * Wraps an event handler to call `preventDefault()` before executing.
 *
 * @param fn - Optional event handler function to execute after preventing default
 * @returns A wrapped function that prevents default behavior
 *
 * @example
 * ```ts
 * form.addEventListener('submit', preventDefault((e) => handleSubmit(e)));
 * ```
 */
export function preventDefault(fn?: (e: Event) => any) {
	return function (e: Event) {
		e.preventDefault();
		// @ts-ignore
		fn?.call(this, e);
	};
}

/**
 * Wraps an event handler to call `stopPropagation()` before executing.
 *
 * @param fn - Optional event handler function to execute after stopping propagation
 * @returns A wrapped function that stops event propagation
 *
 * @example
 * ```ts
 * button.addEventListener('click', stopPropagation((e) => handleClick(e)));
 * // Parent click handlers won't be triggered
 * ```
 */
export function stopPropagation(fn?: (e: Event) => any) {
	return function (e: Event) {
		e.stopPropagation();
		// @ts-ignore
		fn?.call(this, e);
	};
}

/**
 * Wraps an event handler to call `stopImmediatePropagation()` before executing.
 *
 * Prevents other listeners on the same element from being called.
 *
 * @param fn - Optional event handler function to execute
 * @returns A wrapped function that stops immediate propagation
 *
 * @example
 * ```ts
 * element.addEventListener('click', stopImmediatePropagation((e) => handle(e)));
 * // Other click handlers on this element won't be triggered
 * ```
 */
export function stopImmediatePropagation(fn?: (e: Event) => any) {
	return function (e: Event) {
		e.stopImmediatePropagation();
		// @ts-ignore
		fn?.call(this, e);
	};
}
