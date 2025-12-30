/**
 * Removes diacritical marks (accents) from a string.
 *
 * Uses Unicode NFD normalization to decompose characters into base characters
 * plus combining diacritical marks, then strips the marks.
 *
 * @param input - The string to remove accents from
 * @returns The string with all diacritical marks removed
 *
 * @example
 * ```ts
 * unaccent("café");     // "cafe"
 * unaccent("naïve");    // "naive"
 * unaccent("Ångström"); // "Angstrom"
 * unaccent("résumé");   // "resume"
 * ```
 */
export function unaccent(input: string): string {
	return `${input}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
