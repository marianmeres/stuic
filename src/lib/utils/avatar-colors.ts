import { strHash } from "./str-hash.js";

/**
 * Generates deterministic, harmonious pastel colors for avatar backgrounds.
 *
 * The colors are derived from a hash of the input string, ensuring the same
 * input always produces the same color combination. The background is a pastel
 * color (high lightness, moderate saturation) and the text is a darker shade
 * of the same hue for visual harmony and good contrast.
 *
 * @param source - The string to hash for color generation (e.g., email, user ID)
 * @returns Object with `bg` and `text` CSS color strings in HSL format
 *
 * @example
 * ```ts
 * generateAvatarColors("user@example.com");
 * // { bg: "hsl(142, 52%, 68%)", text: "hsl(142, 62%, 28%)" }
 *
 * generateAvatarColors("another@example.com");
 * // { bg: "hsl(287, 48%, 71%)", text: "hsl(287, 58%, 28%)" }
 * ```
 */
export function generateAvatarColors(source: string): { bg: string; text: string } {
	// Get hash as hex string and convert to number
	const hashHex = strHash(source || "");
	const hash = parseInt(hashHex, 16);

	// Derive hue (0-360) from hash
	const hue = hash % 360;

	// Derive saturation and lightness variations from hash for slight variety
	// Saturation: 40-55% (pastel range - soft, not too vivid)
	const saturation = 40 + (hash % 15);
	// Lightness: 75-82% (high lightness ensures dark text is always readable)
	const lightness = 75 + (hash % 7);

	const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	// Text: same hue, more saturated, very dark for strong contrast
	const text = `hsl(${hue}, ${saturation + 15}%, 22%)`;

	return { bg, text };
}
