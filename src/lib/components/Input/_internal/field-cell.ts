/**
 * The typed cell shared by `FieldTable` (N records × fixed columns) and `FieldStruct`
 * (1 record × fixed fields): the declaration shape, the built-in type list, the
 * "blank" rules and the per-type validation rule.
 *
 * Pure functions (no DOM), so they are unit-testable in the fast node project. The
 * control itself is `FieldCell.svelte` next to this file.
 */
import { ISO_MAP } from "@marianmeres/countries";
import type { TranslateFn } from "../../../types.js";
import type { MaybeLocalized } from "../../../utils/tr.js";

/** The cell types `FieldCell` renders itself. */
export const FIELD_CELL_TYPES = [
	"text",
	"number",
	"select",
	"checkbox",
	"date",
	"url",
	"country",
] as const;

export type FieldCellType = (typeof FIELD_CELL_TYPES)[number];

/** Whether `type` is one of the built-in cell types (anything else is the host's). */
export function isBuiltInCellType(type: string): type is FieldCellType {
	return (FIELD_CELL_TYPES as readonly string[]).includes(type);
}

/**
 * One typed cell, as declared by data. `FieldTableColumn` and `FieldStructField` are
 * this shape (plus what a column / a field needs on top).
 */
export interface FieldCellDef {
	/** The record key this cell reads and writes. */
	key: string;
	/** A built-in cell type, or anything else for the host's `cell` snippet. */
	type: FieldCellType | (string & {});
	label: MaybeLocalized;
	/** `select` cells: the choices. */
	options?: { value: string; label: MaybeLocalized }[];
	/** `number` cells: a display unit, shown after the input. */
	unit?: string;
	placeholder?: MaybeLocalized;
	/** `text` / `url` cells: the input's `maxlength`, re-checked by validation. */
	maxLength?: number;
	/** `country` cells: restrict the list (ISO alpha-2 codes). Default: every country. */
	countryList?: string[];
	/** `country` cells: ISO codes pinned at the top of the list. */
	preferredCountries?: string[];
	/** `country` cells: display-name overrides keyed by ISO code (wins over `locale`). */
	countryNames?: Record<string, string>;
	/** `country` cells: flag emoji in the list and the trigger. Default `true`. */
	flags?: boolean;
	/** Extra per-cell rule, run after the built-in one. Return a message to fail. */
	validate?: (
		value: unknown,
		record: Record<string, unknown>
	) => string | undefined | void;
}

/** The value a freshly added record gets for a cell of `type`. */
export function emptyCellValue(type: string): unknown {
	if (type === "number") return null;
	if (type === "checkbox") return false;
	return "";
}

export const isBlankCellValue = (v: unknown): boolean =>
	v === null || v === undefined || v === "";

/** What a text-like control shows for a stored value. */
export function cellText(v: unknown): string {
	if (v === null || v === undefined) return "";
	return typeof v === "string" ? v : String(v);
}

/** Read-only rendering of a value the editor does not interpret. */
export function cellRawText(v: unknown): string {
	if (v === null || v === undefined) return "";
	return typeof v === "string" ? v : JSON.stringify(v);
}

export function selectHasValue(def: FieldCellDef, v: unknown): boolean {
	return typeof v === "string" && (def.options ?? []).some((o) => o.value === v);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(v: string): boolean {
	if (!ISO_DATE_RE.test(v)) return false;
	const d = new Date(`${v}T00:00:00Z`);
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function isHttpUrl(v: string): boolean {
	try {
		const u = new URL(v);
		return u.protocol === "http:" || u.protocol === "https:";
	} catch {
		return false;
	}
}

/** An ISO 3166-1 alpha-2 code this build knows (case-insensitive). */
export function isCountryCode(v: unknown): v is string {
	return typeof v === "string" && ISO_MAP.has(v.toUpperCase());
}

/**
 * The `locale` of a cell host ("sk", "sk-SK", "en_US") reduced to what
 * `@marianmeres/countries` names its locales by (ISO 639-1, "sk").
 */
export function countryLocaleOf(locale: string | undefined): string | undefined {
	if (!locale) return undefined;
	return locale.split(/[-_]/)[0].toLowerCase() || undefined;
}

/**
 * Built-in per-type rule, then `maxLength`, then `def.validate`. A blank value passes
 * the type rule (whether blank is allowed is the host's `required` business).
 *
 * Messages come from the host's `t` (`err_number`, `err_select_unknown`, `err_date`,
 * `err_url`, `err_country`, `err_maxlength`) so each host keeps its own catalog.
 */
export function cellRule(
	def: FieldCellDef,
	v: unknown,
	record: Record<string, unknown>,
	t: TranslateFn
): string | undefined {
	if (!isBlankCellValue(v)) {
		switch (def.type) {
			case "number":
				if (typeof v !== "number" || !Number.isFinite(v)) return String(t("err_number"));
				break;
			case "select":
				if (!selectHasValue(def, v)) {
					return String(t("err_select_unknown", { value: cellRawText(v) }));
				}
				break;
			case "date":
				if (typeof v !== "string" || !isIsoDate(v)) return String(t("err_date"));
				break;
			case "url":
				if (typeof v !== "string" || !isHttpUrl(v)) return String(t("err_url"));
				break;
			case "country":
				if (!isCountryCode(v)) return String(t("err_country"));
				break;
		}
	}
	if (def.maxLength != null && typeof v === "string" && v.length > def.maxLength) {
		return String(t("err_maxlength", { max: def.maxLength }));
	}
	const custom = def.validate?.(v, record);
	return custom ? String(custom) : undefined;
}
