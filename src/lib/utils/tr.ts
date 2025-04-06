import { maybeJsonParse } from "./maybe-json-parse.js";

export type MaybeLocalized = string | Record<string, string>;

/**
 * Conventional translate lookup on given value
 */
export function tr(
	val: MaybeLocalized | undefined | null,
	locale?: string,
	fallback?: string
): string {
	if (!locale) return `${val ?? fallback ?? ""}`;

	val = maybeJsonParse(val);

	// if string - no translation support
	if (typeof val === "string") return val;

	return `${val?.[locale] ?? fallback ?? val ?? ""}`;
}
