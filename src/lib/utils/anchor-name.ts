/**
 * Utilities for managing CSS anchor-name property when multiple actions
 * (like popover and tooltip) need to anchor to the same element.
 *
 * CSS anchor-name accepts a comma-separated list of names, allowing multiple
 * anchor references on a single element.
 */

/**
 * Adds an anchor name to an element without overwriting existing ones.
 *
 * @param el - The element to add the anchor name to
 * @param name - The anchor name to add (e.g., "--anchor-popover-xyz")
 */
export function addAnchorName(el: HTMLElement, name: string): void {
	const current = el.style.getPropertyValue("anchor-name").trim();
	if (current) {
		// Append to existing list (avoid duplicates)
		const names = current.split(",").map((n) => n.trim());
		if (!names.includes(name)) {
			el.style.setProperty("anchor-name", `${current}, ${name}`);
		}
	} else {
		el.style.setProperty("anchor-name", name);
	}
}

/**
 * Removes an anchor name from an element, preserving other anchor names.
 *
 * @param el - The element to remove the anchor name from
 * @param name - The anchor name to remove
 */
export function removeAnchorName(el: HTMLElement, name: string): void {
	const current = el.style.getPropertyValue("anchor-name").trim();
	if (current) {
		const names = current
			.split(",")
			.map((n) => n.trim())
			.filter((n) => n !== name);
		if (names.length > 0) {
			el.style.setProperty("anchor-name", names.join(", "));
		} else {
			el.style.removeProperty("anchor-name");
		}
	}
}
