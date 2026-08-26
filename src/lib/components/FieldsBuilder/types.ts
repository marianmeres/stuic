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
	 * Per-type extra values, driven by the palette entry's `extras`. An open bag
	 * on purpose — the component never interprets these, it only renders a
	 * control per declared extra and round-trips the value. Like `options`,
	 * extras of a previous type are RETAINED when the type changes.
	 */
	extras?: Record<string, unknown>;
	/** What the user may NOT change. Absent = fully editable. */
	lock?: FieldLock;
}

/** Shared shape of every extra per-field control declared by a palette entry. */
export interface FieldTypeExtraBaseDef {
	/** Stored under `FieldDef.extras[key]`. */
	key: string;
	label: LocalizedText;
	description?: LocalizedText;
}

/** A yes/no extra — rendered as a checkbox. */
export interface FieldTypeExtraBooleanDef extends FieldTypeExtraBaseDef {
	type: "boolean";
	default?: boolean;
}

/**
 * A short free-text extra (a unit, a suffix, a format hint...) — rendered as a
 * single-line text input. An emptied value REMOVES `extras[key]` rather than
 * storing `""`, so "no value" has exactly one representation downstream.
 */
export interface FieldTypeExtraStringDef extends FieldTypeExtraBaseDef {
	type: "string";
	default?: string;
	placeholder?: LocalizedText;
	/**
	 * Enforced by the input's `maxlength` attribute AND re-checked by
	 * `validateFieldDefs` (the attribute does not bound a programmatically
	 * seeded value).
	 */
	maxlength?: number;
}

/**
 * One of a fixed list of values — rendered as a select. Selecting the empty
 * entry REMOVES `extras[key]`. A stored value that is not among `options` is
 * kept and rendered as-is (never silently coerced away).
 */
export interface FieldTypeExtraSelectDef extends FieldTypeExtraBaseDef {
	type: "select";
	default?: string;
	options: FieldOptionDef[];
	/** Label of the "nothing selected" entry. Default: blank. */
	placeholder?: LocalizedText;
}

/**
 * An extra per-field control declared by a palette entry, rendered into
 * `FieldDef.extras[key]`. Discriminated by `type`.
 */
export type FieldTypeExtraDef =
	FieldTypeExtraBooleanDef | FieldTypeExtraStringDef | FieldTypeExtraSelectDef;

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
