/**
 * Escapes special regex characters in a string so it can be safely used in a `RegExp` constructor.
 *
 * @param str - The string to escape
 * @returns The escaped string with all regex special characters prefixed with backslash
 *
 * @example
 * ```ts
 * escapeRegex('foo.bar');  // 'foo\\.bar'
 * escapeRegex('$100');     // '\\$100'
 * escapeRegex('a+b=c');    // 'a\\+b=c'
 * ```
 */
export const escapeRegex = (str: string): string =>
	`${str}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
