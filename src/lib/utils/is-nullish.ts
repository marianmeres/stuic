/**
 * Checks if a value is `null` or `undefined`.
 *
 * @param v - The value to check
 * @returns `true` if the value is `null` or `undefined`
 *
 * @example
 * ```ts
 * isNullish(null);      // true
 * isNullish(undefined); // true
 * isNullish(0);         // false
 * isNullish('');        // false
 * isNullish(false);     // false
 * ```
 */
export function isNullish(v: any) {
	return v === null || v === undefined;
}
