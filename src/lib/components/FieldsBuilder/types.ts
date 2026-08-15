import type { Snippet } from "svelte";

/** A localized string: either one plain string, or a per-language map. */
export type LocalizedText = string | Record<string, string>;

/** A single option of a choice-like field type (one declaring `supportsOptions`). */
export interface FieldOptionDef {
	/** Machine value, unique within the field's options. */
	value: string;
	label: LocalizedText;
}

/** What the user may NOT change on a field. Absent flag = editable. */
export interface FieldLock {
	key?: boolean;
	type?: boolean;
	required?: boolean;
	options?: boolean;
	/** Cannot be removed from the list. */
	delete?: boolean;
	/** Cannot be dragged, and other fields cannot be moved past it. */
	reorder?: boolean;
}

/**
 * One field definition — the unit of the `FieldsBuilder` value. The component
 * emits an ordered `FieldDef[]`; what the list is compiled into (a form, a
 * schema, a template...) is entirely the consumer's business.
 */
export interface FieldDef {
	/** Machine key. Unique within the list. */
	key: string;
	/** One of the `types` palette entries' `type`. */
	type: string;
	label: LocalizedText;
	description?: LocalizedText;
	required?: boolean;
	/**
	 * Edited and validated only for palette entries declaring
	 * `supportsOptions`. NOTE: when a field's type is changed away from a
	 * choice type, existing `options` are deliberately RETAINED on the def
	 * (never silently drop data; switching back restores them) — consumers
	 * compiling the list should ignore `options` on non-choice types.
	 */
	options?: FieldOptionDef[];
	/**
	 * Per-type extra flags, driven by the palette entry's `extras`. An open bag
	 * on purpose — the component never interprets these, it only renders a
	 * control per declared extra and round-trips the value.
	 */
	extras?: Record<string, unknown>;
	/** What the user may NOT change. Absent = fully editable. */
	lock?: FieldLock;
}

/** An extra per-field control declared by a palette entry (v1: booleans only). */
export interface FieldTypeExtraDef {
	/** Stored under `FieldDef.extras[key]`. */
	key: string;
	label: LocalizedText;
	description?: LocalizedText;
	/** v1: booleans only (rendered as a checkbox). */
	type: "boolean";
	default?: boolean;
}

/** One entry of the type palette (the `types` prop). */
export interface FieldTypeDef {
	/** Stored in `FieldDef.type`. */
	type: string;
	/** Shown in the type picker. */
	label: LocalizedText;
	description?: LocalizedText;
	/** Icon html string (e.g. from `@marianmeres/icons-fns`) or a snippet. */
	icon?: string | Snippet;
	/** Renders the option editor and allows `FieldDef.options`. */
	supportsOptions?: boolean;
	/** Extra per-field controls, rendered into `FieldDef.extras[key]`. */
	extras?: FieldTypeExtraDef[];
	/** Optional live preview of a single field of this type. */
	preview?: Snippet<[FieldDef]>;
}
