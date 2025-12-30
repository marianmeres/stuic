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
export function omit<T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K | K[]
): Omit<T, K> {
	const _keys = new Set(Array.isArray(keys) ? keys : [keys]) as Set<string>;
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => !_keys.has(k))
	) as Omit<T, K>;
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
export function pick<T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K | K[]
): Pick<T, K> {
	const _keys = new Set(Array.isArray(keys) ? keys : [keys]) as Set<string>;
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => _keys.has(k))
	) as Pick<T, K>;
}
