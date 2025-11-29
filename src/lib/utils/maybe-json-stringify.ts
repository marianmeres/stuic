/**
 * Stringifies objects and arrays to JSON, but returns primitives unchanged.
 *
 * Useful when you want JSON serialization only for complex types.
 *
 * @param val - The value to potentially stringify
 * @param prettyIndent - Indentation for pretty printing (default: "\t")
 * @returns JSON string for objects/arrays, original value for primitives
 *
 * @example
 * ```ts
 * maybeJsonStringify({ a: 1 });  // '{\n\t"a": 1\n}'
 * maybeJsonStringify([1, 2]);    // '[\n\t1,\n\t2\n]'
 * maybeJsonStringify('hello');   // 'hello' (unchanged)
 * maybeJsonStringify(42);        // 42 (unchanged)
 * maybeJsonStringify(null);      // null (unchanged)
 * ```
 */
export function maybeJsonStringify(
	val: any,
	prettyIndent: number | string = "\t"
): string | null | number | boolean | undefined {
	// do not stringify primitives
	if (
		typeof val === "string" ||
		typeof val === "boolean" ||
		typeof val === "number" ||
		typeof val === "undefined" ||
		val === null
	) {
		return val;
	}

	return JSON.stringify(val, null, prettyIndent);
}
