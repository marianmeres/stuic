import { twMerge as _twMerge, type ClassNameValue } from "tailwind-merge";
import { clsx } from "clsx";

/**
 * Normalizes and dedupes whitespaces
 */
export function clsClean(s: ClassNameValue) {
	if (Array.isArray(s)) s = s.filter(Boolean).join(" ");
	return `${s || ""}`.replace(/\s+/g, " ").trim();
}

/**
 * twMerge does not seem to handle "\r", "\n" and/or "\t" within the input strings correctly,
 * so we need to do the cleanup ourselves
 *
 * Note: adding clsx preprocess, so we can accept nested/arrays as well (should we need it)
 */
export function twMerge(...args: ClassNameValue[]) {
	// return _twMerge(...args.map(clsx).filter(Boolean).map(clsClean));
	return _twMerge(...args.map(clsClean));
}
