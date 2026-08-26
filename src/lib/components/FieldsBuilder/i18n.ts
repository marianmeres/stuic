import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `FieldsBuilder`. Also the fallback
 * of every other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are mustache-style (`{{label}}`, `{{max}}`, ...).
 */
export const FIELDS_BUILDER_MESSAGES_EN = {
	field_req_att: "This field requires attention. Please review and try again.",
	at_least_one_field: "At least one field is required",
	add_label: "Add field",
	empty_message: "No fields yet",
	empty_options_message: "No choices defined",
	untitled: "Untitled field",
	deleted: "Deleted",
	delete_field: "Delete field",
	undo_delete: "Undo",
	removed_field: "Deleted field: {{label}}",
	restored_field: "Restored field: {{label}}",
	move_up: "Move up",
	move_down: "Move down",
	moved_up: "Moved up: {{label}} ({{position}} of {{total}})",
	moved_down: "Moved down: {{label}} ({{position}} of {{total}})",
	row_has_errors: "Has validation errors",
	drag_to_reorder: "Drag to reorder",
	label_label: "Label",
	label_placeholder: "Field name",
	description_label: "Description",
	type_label: "Type",
	required_label: "Required",
	options_label: "Choices",
	add_option: "Add choice",
	option_label_placeholder: "Choice label",
	option_value_placeholder: "value",
	option_value_hint: "Stored machine value of this choice",
	remove_option: "Remove choice",
	removed_option: "Removed choice: {{label}}",
	advanced_label: "Advanced",
	key_label: "Key",
	key_hint:
		"Unique machine identifier of this field. Filled in automatically from the label.",
	key_locked_hint: "The key identifies stored data and can no longer be changed.",
	show_translations: "Show translations",
	hide_translations: "Hide translations",
	type_change_warning:
		"Changing the type of an existing field may not fit data already stored under it.",
	unknown_type_warning:
		"This field has a type this editor does not recognize. It is kept unchanged and cannot be edited here.",
	preview_label: "Preview",
	err_label_required: "Label is required",
	err_key_required: "Key is required",
	err_key_pattern:
		"Key must start with a lowercase letter and may contain only lowercase letters, numbers and underscores",
	err_key_maxlength: "Key is too long (max {{max}} characters)",
	err_key_duplicate: "This key is already used by another field",
	err_key_reserved: "This key is reserved and cannot be used",
	err_options_required: "Add at least one choice",
	err_option_value_required: "Every choice needs a value",
	err_option_value_duplicate: "Choice values must be unique",
	err_extra_maxlength: "{{label}} is too long (max {{max}} characters)",
	err_max_fields: "Maximum number of fields is {{max}}",
};

/** Every message key `FieldsBuilder` (and its internals) may look up. */
export type FieldsBuilderMessageKey = keyof typeof FIELDS_BUILDER_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type FieldsBuilderMessages = Record<FieldsBuilderMessageKey, string>;

/**
 * Builds the `t` prop of `FieldsBuilder` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a
 * catalog may safely be partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldsBuilder,
 *     createFieldsBuilderT,
 *     FIELDS_BUILDER_MESSAGES_SK,
 *     FIELDS_BUILDER_DEFAULT_TYPES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK);
 * </script>
 *
 * <FieldsBuilder bind:value name="fields" types={FIELDS_BUILDER_DEFAULT_TYPES_SK} {t} />
 * ```
 */
export function createFieldsBuilderT(
	messages: Partial<FieldsBuilderMessages> | Record<string, string>,
	fallbackMessages:
		Partial<FieldsBuilderMessages> | Record<string, string> = FIELDS_BUILDER_MESSAGES_EN
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
export const t_default: TranslateFn = createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_EN);
