import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `FieldSingleAsset`. Also the fallback of
 * every other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are mustache-style (`{{name}}`, `{{max}}`, ...). The last six keys are
 * the ones the embedded `AssetsPreview` looks up, so one `t` serves both.
 */
export const FIELD_SINGLE_ASSET_MESSAGES_EN = {
	field_req_att: "This field requires attention. Please review and try again.",
	pick_file: "Choose a file",
	replace_file: "Replace {{name}}",
	empty_hint: "Drop a file here or click to browse",
	remove: "Remove",
	removing_short: "Removing…",
	removed: "{{name}} removed",
	undo: "Undo",
	restored: "{{name}} restored",
	preview: "Preview",
	retry: "Retry upload",
	discard: "Discard",
	cancel_upload: "Cancel upload",
	uploading: "Uploading {{name}}",
	uploading_short: "Uploading…",
	uploading_progress: "Uploading… {{percent}}%",
	uploaded: "{{name}} uploaded",
	upload_failed: "Upload failed",
	upload_failed_named: "Upload of {{name}} failed: {{error}}",
	invalid_type: 'This file type is not supported. Allowed: "{{accept}}".',
	too_large: "The file is too large ({{size}}). The maximum is {{max}}.",
	single_only: "Only one file can be placed here. Drop or paste a single file.",
	// AssetsPreview
	unable_to_preview: "This file cannot be previewed",
	download: "Download original",
	close: "Close preview window",
	zoom_in: "Zoom in",
	zoom_out: "Zoom out",
	delete: "Delete",
};

/** Every message key `FieldSingleAsset` may look up. */
export type FieldSingleAssetMessageKey = keyof typeof FIELD_SINGLE_ASSET_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type FieldSingleAssetMessages = Record<FieldSingleAssetMessageKey, string>;

/**
 * Builds the `t` prop of `FieldSingleAsset` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a catalog
 * may safely be partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldSingleAsset,
 *     createFieldSingleAssetT,
 *     FIELD_SINGLE_ASSET_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *
 *   // full locale, plus a field specific tweak
 *   const t = createFieldSingleAssetT({
 *     ...FIELD_SINGLE_ASSET_MESSAGES_SK,
 *     empty_hint: "Sem presuňte fotku",
 *   });
 * </script>
 *
 * <FieldSingleAsset name="avatar" bind:value {processAsset} {t} />
 * ```
 */
export function createFieldSingleAssetT(
	messages: Partial<FieldSingleAssetMessages> | Record<string, string>,
	fallbackMessages:
		| Partial<FieldSingleAssetMessages>
		| Record<string, string> = FIELD_SINGLE_ASSET_MESSAGES_EN
): TranslateFn {
	return (k, values = null, fallback = "") => {
		const out =
			(messages as Record<string, string>)[k] ??
			(fallbackMessages as Record<string, string>)[k] ??
			(typeof fallback === "string" ? fallback : k);
		return isPlainObject(values)
			? replaceMap(out, values as Record<string, string>)
			: out;
	};
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createFieldSingleAssetT(
	FIELD_SINGLE_ASSET_MESSAGES_EN
);
