/**
 * Capitalizes the first character of a string.
 *
 * @param s - The input string
 * @returns The string with first character uppercased
 *
 * @example
 * ```ts
 * ucfirst('hello');   // 'Hello'
 * ucfirst('HELLO');   // 'HELLO'
 * ucfirst('');        // ''
 * ```
 */
export function ucfirst(s: string) {
	s = `${s}`;
	if (!s.length) return s;
	return s[0].toUpperCase() + (s.slice(1) || "");
}
