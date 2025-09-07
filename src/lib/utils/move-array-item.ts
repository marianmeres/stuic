/**
 *
 */
export function moveArrayItem(array: any[], fromIndex: number, toIndex: number) {
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
