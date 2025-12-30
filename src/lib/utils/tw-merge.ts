import { twMerge as _twMerge, type ClassNameValue } from "tailwind-merge";

/**
 * Normalizes and deduplicates whitespace in a class name value.
 *
 * Converts arrays to space-separated strings, collapses multiple whitespace characters,
 * and trims leading/trailing whitespace.
 *
 * @param s - A class name value (string, array, or nested array)
 * @returns A cleaned, space-separated string of class names
 *
 * @example
 * ```ts
 * clsClean('foo   bar');        // 'foo bar'
 * clsClean(['foo', 'bar']);     // 'foo bar'
 * clsClean('foo\n\tbar');       // 'foo bar'
 * ```
 */
export function clsClean(s: ClassNameValue) {
	if (Array.isArray(s)) s = s.filter(Boolean).join(" ");
	return `${s || ""}`.replace(/\s+/g, " ").trim();
}

/**
 * Merges Tailwind CSS class names with conflict resolution and whitespace cleanup.
 *
 * A wrapper around `tailwind-merge` that handles multiline strings, tabs, and other
 * whitespace characters that the original doesn't handle well.
 *
 * @param args - Class name values to merge
 * @returns A single merged class name string with conflicts resolved
 *
 * @example
 * ```ts
 * twMerge('px-2 py-1', 'px-4');  // 'py-1 px-4'
 * twMerge(`
 *   bg-red-500
 *   text-white
 * `, 'bg-blue-500');             // 'text-white bg-blue-500'
 * ```
 */
export function twMerge(...args: ClassNameValue[]) {
	return _twMerge(...args.map(clsClean));
}
