/**
 * Normalizes a hex color string to lowercase `#rrggbb`, or returns `null` if the
 * input is not a 3- or 6-digit hex color. The leading `#` is optional on input.
 *
 * Alpha (`#rgba` / `#rrggbbaa`) is deliberately rejected here — `ColorPicker`'s
 * native `<input type="color">` cannot represent it. Such values still pass
 * {@link isCssColor} and are kept verbatim.
 *
 * @example
 * ```ts
 * normalizeHex("#F00");    // "#ff0000"
 * normalizeHex("3b82f6");  // "#3b82f6"
 * normalizeHex("red");     // null
 * ```
 */
export function normalizeHex(input: unknown): string | null {
	if (typeof input !== "string") return null;
	const v = input.trim().replace(/^#/, "").toLowerCase();
	if (/^[0-9a-f]{3}$/.test(v)) {
		return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
	}
	if (/^[0-9a-f]{6}$/.test(v)) return `#${v}`;
	return null;
}

/**
 * True if the browser accepts `v` as a CSS `color` value — `red`, `oklch(...)`,
 * `#rrggbbaa`, `var(--x)`, ... Used as the permissive fallback of the hex text
 * field, so the field can hold anything the palette itself may hold.
 *
 * Returns `false` outside the browser (no `CSS.supports`), which is safe: the
 * only caller is a DOM event handler.
 */
export function isCssColor(v: unknown): boolean {
	if (typeof v !== "string" || !v.trim()) return false;
	if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
	return CSS.supports("color", v.trim());
}

/**
 * Loose equality of two color strings: identical strings, or two spellings of the
 * same hex (`#FFF` === `#ffffff`). No color-space conversion — `red` and
 * `#ff0000` are NOT considered equal, on purpose: swatch identity is the string
 * the consumer wrote.
 */
export function isSameColor(a: unknown, b: unknown): boolean {
	if (typeof a !== "string" || typeof b !== "string") return false;
	if (a === b) return true;
	const na = normalizeHex(a);
	return !!na && na === normalizeHex(b);
}
