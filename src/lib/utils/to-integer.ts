/**
 * Converts a value to an integer, with a fallback for invalid values.
 *
 * Handles numbers, numeric strings, and returns the fallback for non-numeric values.
 *
 * @param value - The value to convert
 * @param fallback - Value to return if conversion fails (default: 1)
 * @returns The integer value or the fallback
 *
 * @example
 * ```ts
 * toInteger(3.7);        // 3
 * toInteger('42');       // 42
 * toInteger('3.9');      // 3
 * toInteger('abc');      // 1 (default fallback)
 * toInteger('abc', 0);   // 0 (custom fallback)
 * ```
 */
export function toInteger(value: any, fallback: number = 1) {
	if (typeof value === "number" && !isNaN(value)) {
		return Math.floor(value);
	}

	if (typeof value === "string") {
		const parsed = parseFloat(value);
		if (!isNaN(parsed)) return Math.floor(parsed);
	}

	return fallback;
}
