import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `ColorPicker`. Also the fallback of
 * every other bundled locale, so a locale missing a key still renders text.
 *
 * The second half are the labels of the two bundled palettes. Swatch labels are
 * looked up with themselves as the fallback (`t(label, null, label)`), which is
 * why a consumer's own label — "Brand blue" — renders verbatim while the short
 * keys below get translated.
 */
export const COLOR_PICKER_MESSAGES_EN = {
	// chrome
	color: "Color",
	custom_color: "Custom color",
	hex_value: "Hex value",
	hex_placeholder: "#rrggbb",
	no_color: "No color",
	required: "Please select a color",

	// COLOR_PICKER_PALETTE
	red: "Red",
	orange: "Orange",
	amber: "Amber",
	yellow: "Yellow",
	lime: "Lime",
	green: "Green",
	teal: "Teal",
	cyan: "Cyan",
	blue: "Blue",
	indigo: "Indigo",
	violet: "Violet",
	pink: "Pink",
	white: "White",
	gray: "Gray",
	black: "Black",

	// COLOR_PICKER_PALETTE_THEME
	primary: "Primary",
	accent: "Accent",
	success: "Success",
	warning: "Warning",
	destructive: "Destructive",
	foreground: "Foreground",
	muted_foreground: "Muted foreground",
	muted: "Muted",
	background: "Background",
};

/** Every message key `ColorPicker` may look up. */
export type ColorPickerMessageKey = keyof typeof COLOR_PICKER_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type ColorPickerMessages = Record<ColorPickerMessageKey, string>;

/**
 * Builds the `t` prop of `ColorPicker` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a
 * catalog may safely be partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { ColorPicker, createColorPickerT, COLOR_PICKER_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createColorPickerT(COLOR_PICKER_MESSAGES_SK);
 * </script>
 *
 * <ColorPicker bind:value {t} />
 * ```
 */
export function createColorPickerT(
	messages: Partial<ColorPickerMessages> | Record<string, string>,
	fallbackMessages:
		Partial<ColorPickerMessages> | Record<string, string> = COLOR_PICKER_MESSAGES_EN
): TranslateFn {
	return (k, values = null, fallback = "") => {
		const out =
			(messages as Record<string, string>)[k] ??
			(fallbackMessages as Record<string, string>)[k] ??
			(typeof fallback === "string" ? fallback : k);
		return isPlainObject(values)
			? replaceMap(out, values as Record<string, string>, {
					preSearchKeyTransform: (k) => `{${k}}`,
				})
			: out;
	};
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createColorPickerT(COLOR_PICKER_MESSAGES_EN);
