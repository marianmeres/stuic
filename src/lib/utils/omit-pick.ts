/**
 * Creates a new object excluding the specified keys.
 *
 * @param obj - The source object
 * @param keys - A key or array of keys to exclude
 * @returns A new object without the specified keys
 *
 * @example
 * ```ts
 * omit({ a: 1, b: 2, c: 3 }, 'b');        // { a: 1, c: 3 }
 * omit({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { b: 2 }
 * ```
 */
export function omit(obj: any, keys: string | string[]) {
	if (typeof keys === "string") keys = [keys];
	const _keys = new Set(keys);
	return Object.fromEntries(Object.entries(obj).filter(([k]) => !_keys.has(k)));
}

/**
 * Creates a new object containing only the specified keys.
 *
 * @param obj - The source object
 * @param keys - A key or array of keys to include
 * @returns A new object with only the specified keys
 *
 * @example
 * ```ts
 * pick({ a: 1, b: 2, c: 3 }, 'b');        // { b: 2 }
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
 * ```
 */
export function pick(obj: any, keys: string | string[]) {
	if (typeof keys === "string") keys = [keys];
	const _keys = new Set(keys);
	return Object.fromEntries(Object.entries(obj).filter(([k]) => _keys.has(k)));
}
