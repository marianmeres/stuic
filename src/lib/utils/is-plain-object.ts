/**
 * Checks if a value is a plain object (created by `{}` or `new Object()`).
 *
 * Returns `false` for arrays, `null`, class instances, and other non-plain objects.
 *
 * @param v - The value to check
 * @returns `true` if the value is a plain object
 *
 * @example
 * ```ts
 * isPlainObject({});           // true
 * isPlainObject({ a: 1 });     // true
 * isPlainObject([]);           // false
 * isPlainObject(null);         // false
 * isPlainObject(new Date());   // false
 * ```
 */
export function isPlainObject(v: unknown): boolean {
	if (v === null || typeof v !== "object") return false;
	const ctor = (v as { constructor?: unknown }).constructor;
	return ctor === undefined || ctor === Object;
}
