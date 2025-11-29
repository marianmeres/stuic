import { escapeRegex } from "./escape-regex.js";

/**
 * Replaces template placeholders in a string using a key-value map.
 *
 * By default, looks for mustache-style `{{key}}` placeholders. Keys are processed
 * longest-first to avoid partial replacement issues.
 *
 * @param str - The template string with placeholders
 * @param replacementMap - Object mapping keys to replacement values (or functions returning values)
 * @param options - Optional configuration
 * @param options.ignoreCase - Case-insensitive matching (default: true)
 * @param options.preSearchKeyTransform - Function to transform keys before searching (default: wraps in `{{}}`)
 * @returns The string with all placeholders replaced
 *
 * @example
 * ```ts
 * replaceMap('Hello {{name}}!', { name: 'World' });
 * // 'Hello World!'
 *
 * replaceMap('{{greeting}} {{name}}', {
 *   greeting: () => new Date().getHours() < 12 ? 'Good morning' : 'Hello',
 *   name: 'World'
 * });
 * // 'Good morning World!' or 'Hello World!'
 *
 * // Custom placeholder format:
 * replaceMap('Hello %name%', { name: 'World' }, {
 *   preSearchKeyTransform: (k) => `%${k}%`
 * });
 * // 'Hello World!'
 * ```
 */
export function replaceMap(
	str: string,
	replacementMap: Record<string, string | CallableFunction>,
	options: Partial<{
		ignoreCase: boolean;
		preSearchKeyTransform: (k: string) => string;
	}> = {}
) {
	let result = str;
	const {
		ignoreCase = true,
		// adding mustache like {{key}} identifiers by default
		preSearchKeyTransform = (k: string) => `{{${k}}}`,
	} = options || {};

	const keys = Object.keys(replacementMap);

	// sort keys by length (longest first) to avoid partial replacements
	// e.g., if we have keys "cat" and "category", we want to replace "category" first
	keys.sort((a, b) => b.length - a.length);

	// Replace each key with its corresponding value
	for (const key of keys) {
		const value =
			typeof replacementMap[key] === "function"
				? replacementMap[key]()
				: replacementMap[key];

		const needle = preSearchKeyTransform(key);
		const regex = new RegExp(escapeRegex(needle), ignoreCase ? "gi" : "g");
		result = result.replace(regex, value);
	}

	return result;
}
