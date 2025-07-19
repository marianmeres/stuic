import { escapeRegex } from "./escape-regex.js";

/** Will replace all keys from k-v pair map with corresponding value  */
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
