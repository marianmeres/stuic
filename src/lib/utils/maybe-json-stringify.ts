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
