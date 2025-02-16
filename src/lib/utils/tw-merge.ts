import { twMerge as _twMerge, type ClassNameValue } from "tailwind-merge";

/**
 * Normalizes and dedupes whitespaces
 */
export function clsClean(s: ClassNameValue) {
	if (Array.isArray(s)) s = s.join(" ");
	return `${s || ""}`.replace(/\s+/g, " ").trim();
}

/**
 * twMerge does not seem to handle "\r", "\n" and/or "\t" within the input strings correctly,
 * so we need to do the cleanup ourselves
 */
export function twMerge(...args: ClassNameValue[]) {
	return _twMerge(...args.map(clsClean));
}
