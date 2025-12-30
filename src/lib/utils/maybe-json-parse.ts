/**
 * Attempts to parse a JSON string, returning the original value if parsing fails.
 *
 * Non-string values are returned unchanged.
 *
 * @param val - The value to potentially parse
 * @param strict - If `true`, throws on parse error instead of returning original value
 * @returns The parsed value if successful, otherwise the original value
 *
 * @example
 * ```ts
 * maybeJsonParse('{"a":1}');     // { a: 1 }
 * maybeJsonParse('not json');    // 'not json'
 * maybeJsonParse(123);           // 123 (non-string passed through)
 * maybeJsonParse('bad', true);   // throws SyntaxError
 * ```
 */
export function maybeJsonParse(val: unknown, strict = false): unknown {
	if (typeof val === "string") {
		try {
			return JSON.parse(val);
		} catch (e) {
			if (strict) throw e;
		}
	}
	return val;
}
