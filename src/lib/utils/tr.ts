import { maybeJsonParse } from "./maybe-json-parse.js";

/**
 * A value that may be a plain string or a locale-keyed object of translations.
 */
export type MaybeLocalized = string | Record<string, string>;

/**
 * Performs a locale-based translation lookup on a value.
 *
 * If the value is a plain string, returns it directly. If it's an object with
 * locale keys (e.g., `{ en: "Hello", sk: "Ahoj" }`), returns the value for the
 * given locale.
 *
 * @param val - A plain string or locale-keyed object (can also be a JSON string of the object)
 * @param locale - The locale key to look up (e.g., "en", "sk")
 * @param fallback - Fallback value if locale key not found
 * @returns The translated string
 *
 * @example
 * ```ts
 * tr('Hello', 'sk');                            // 'Hello' (plain string returned as-is)
 * tr({ en: 'Hello', sk: 'Ahoj' }, 'sk');        // 'Ahoj'
 * tr({ en: 'Hello' }, 'sk', 'fallback');        // 'fallback'
 * tr('{"en":"Hello","sk":"Ahoj"}', 'sk');       // 'Ahoj' (JSON string parsed)
 * ```
 */
export function tr(
	val: MaybeLocalized | undefined | null,
	locale?: string,
	fallback?: string
): string {
	if (!locale) return `${val ?? fallback ?? ""}`;

	val = maybeJsonParse(val) as MaybeLocalized | null | undefined;

	// if string - no translation support
	if (typeof val === "string") return val;

	return `${val?.[locale] ?? fallback ?? val ?? ""}`;
}
