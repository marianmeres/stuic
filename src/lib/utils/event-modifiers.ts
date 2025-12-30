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
export function once(fn: (e: Event) => void) {
	let called = false;
	return function (this: unknown, e: Event) {
		if (!called) {
			called = true;
			fn.call(this, e);
		}
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
export function preventDefault(fn?: (e: Event) => void) {
	return function (this: unknown, e: Event) {
		e.preventDefault();
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
export function stopPropagation(fn?: (e: Event) => void) {
	return function (this: unknown, e: Event) {
		e.stopPropagation();
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
export function stopImmediatePropagation(fn?: (e: Event) => void) {
	return function (this: unknown, e: Event) {
		e.stopImmediatePropagation();
		fn?.call(this, e);
	};
}
