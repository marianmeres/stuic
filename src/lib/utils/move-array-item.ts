/**
 * Moves an item within an array from one index to another.
 *
 * Returns a new array (does not mutate the original).
 *
 * @param array - The source array
 * @param fromIndex - The current index of the item to move
 * @param toIndex - The target index for the item
 * @returns A new array with the item moved to the new position
 * @throws Error if either index is out of bounds
 *
 * @example
 * ```ts
 * moveArrayItem(['a', 'b', 'c'], 0, 2);  // ['b', 'c', 'a']
 * moveArrayItem(['a', 'b', 'c'], 2, 0);  // ['c', 'a', 'b']
 * moveArrayItem(['a', 'b', 'c'], 1, 1);  // ['a', 'b', 'c'] (clone)
 * ```
 */
export function moveArrayItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
	if (fromIndex < 0 || fromIndex >= array.length) {
		throw new Error("Invalid fromIndex");
	}

	if (toIndex < 0 || toIndex >= array.length) {
		throw new Error("Invalid toIndex");
	}

	const newArray = [...array];

	// always return clone
	if (fromIndex === toIndex) return newArray;

	// Remove the item from its original position
	const [removedItem] = newArray.splice(fromIndex, 1);

	// Insert the item at the new position
	newArray.splice(toIndex, 0, removedItem);

	return newArray;
}
