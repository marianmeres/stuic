/**
 * Query Selector All - returns an array of elements matching the CSS selector.
 *
 * Shorthand for `Array.from(document.querySelectorAll(selector))`.
 *
 * @param selector - A valid CSS selector string
 * @param context - Optional root element to search within (default: document)
 * @returns Array of matching elements
 *
 * @example
 * ```ts
 * qsa('.btn');                    // All elements with class 'btn'
 * qsa('input[type="text"]');      // All text inputs
 * qsa('li', myListElement);       // All li elements within myListElement
 * ```
 */
export function qsa(selector: string, context?: HTMLElement | Document) {
	return Array.from((context ?? document)?.querySelectorAll(selector) || []);
}
