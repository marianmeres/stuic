import type { ColorPickerMessages } from "./i18n.js";

/**
 * Slovak message catalog for `ColorPicker`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually
 * imported (the component itself never references it).
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
export const COLOR_PICKER_MESSAGES_SK: ColorPickerMessages = {
	color: "Farba",
	custom_color: "Vlastná farba",
	hex_value: "Hex hodnota",
	// a format hint, not a word — the same in every locale
	hex_placeholder: "#rrggbb",
	no_color: "Žiadna farba",
	required: "Prosím, vyberte farbu",

	red: "Červená",
	orange: "Oranžová",
	amber: "Jantárová",
	yellow: "Žltá",
	lime: "Limetková",
	green: "Zelená",
	teal: "Modrozelená",
	cyan: "Azúrová",
	blue: "Modrá",
	indigo: "Indigová",
	violet: "Fialová",
	pink: "Ružová",
	white: "Biela",
	gray: "Sivá",
	black: "Čierna",

	primary: "Primárna",
	accent: "Akcentová",
	success: "Úspešná",
	warning: "Varovná",
	destructive: "Deštruktívna",
	foreground: "Popredie",
	muted_foreground: "Tlmené popredie",
	muted: "Tlmená",
	background: "Pozadie",
};
