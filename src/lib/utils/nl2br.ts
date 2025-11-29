/**
 * Converts newlines to HTML `<br />` tags.
 *
 * Handles `\r\n`, `\r`, and `\n` line endings.
 *
 * @param str - The input string containing newlines
 * @returns String with newlines replaced by `<br />` tags
 *
 * @example
 * ```ts
 * nl2br('Hello\nWorld');    // 'Hello<br />World'
 * nl2br('Line1\r\nLine2');  // 'Line1<br />Line2'
 * ```
 */
export function nl2br(str: string) {
	return `${str ?? ""}`.replace(/(?:\r\n|\r|\n)/g, "<br />");
}
