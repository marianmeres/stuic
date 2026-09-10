import { isPlainObject } from "./is-plain-object.js";
import { maybeJsonParse } from "./maybe-json-parse.js";

/**
 * A value that may be a plain string or a locale-keyed object of translations
 * (`{ en: "Hello", sk: "Ahoj" }`).
 */
export type MaybeLocalized = string | Record<string, string>;

/**
 * Resolves a `MaybeLocalized` value to the text to display.
 *
 * A plain string is returned as-is. A locale-keyed record (or a JSON string
 * encoding one — how string-valued inputs such as `FieldInputLocalized` carry
 * it) is resolved in this order:
 *
 * 1. the first entry of `locale` (one locale, or a preference chain in order)
 *    that is non-empty — an empty entry counts as missing,
 * 2. `fallback`, when one is given,
 * 3. the first non-empty entry of the record,
 * 4. `""`.
 *
 * So a record never renders as `[object Object]`, and a missing translation
 * degrades to another language rather than to nothing. `null`/`undefined`
 * yield `fallback ?? ""`.
 *
 * @param val - A plain string, a locale-keyed record, or a JSON string of one
 * @param locale - The locale to look up, or a chain of locales in order of preference
 * @param fallback - Text to use when none of `locale` has a non-empty entry
 *
 * @example
 * ```ts
 * tr("Hello", "sk");                             // "Hello" (plain string returned as-is)
 * tr({ en: "Hello", sk: "Ahoj" }, "sk");         // "Ahoj"
 * tr({ en: "Hello", sk: "Ahoj" }, ["cs", "sk"]); // "Ahoj" (chain, in order)
 * tr({ en: "Hello" }, "sk");                     // "Hello" (first non-empty entry)
 * tr({ en: "Hello" }, "sk", "—");                // "—" (explicit fallback wins)
 * tr('{"en":"Hello","sk":"Ahoj"}', "sk");        // "Ahoj" (JSON string parsed)
 * ```
 */
export function tr(
	val: MaybeLocalized | undefined | null,
	locale?: string | string[],
	fallback?: string
): string {
	if (val == null) return fallback ?? "";

	// only a plain object is a record; a string that parses to anything else
	// ("2024", "null", "[1,2]") is just that string
	const parsed = maybeJsonParse(val);
	if (!isPlainObject(parsed)) return String(val);
	const rec = parsed as Record<string, unknown>;

	const chain = typeof locale === "string" ? [locale] : (locale ?? []);
	for (const l of chain) {
		if (l && Object.hasOwn(rec, l) && rec[l]) return String(rec[l]);
	}
	if (fallback !== undefined) return fallback;
	for (const v of Object.values(rec)) if (v) return String(v);
	return "";
}
