import { tr } from "../../utils/tr.js";
import type {
	FieldColumnDef,
	FieldDef,
	FieldOptionDef,
	FieldTypeDef,
	LocalizedText,
} from "./types.js";

/** Default machine-key policy: lowercase snake_case, starts with a letter, max 63 chars. */
export const DEFAULT_KEY_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

export const DEFAULT_KEY_MAX_LENGTH = 63;

/** Minimal translate signature the pure helpers below need. */
export type FieldsBuilderTranslate = (
	key: string,
	values?: Record<string, string | number>
) => string;

/**
 * Read the display text of a `LocalizedText`: the string itself, the entry of
 * the first preferred language (a single one, or a fallback chain in order of
 * preference) that is non-empty, or the first non-empty entry as a last
 * resort. This is the library-wide `tr()` under this component's name — same
 * resolution, same fallbacks (a JSON-encoded record is accepted too).
 */
export function getLocalizedText(
	text: LocalizedText | null | undefined,
	preferredLanguage?: string | string[]
): string {
	return tr(text, preferredLanguage);
}

/**
 * Derive a machine key from a human label: transliterates diacritics
 * (`Ročník` → `rocnik`), lowercases, collapses everything else to `_`. A slug
 * not starting with a letter is prefixed with `f_` (`2024` → `f_2024`) so the
 * result always satisfies `DEFAULT_KEY_PATTERN`.
 */
export function slugifyKey(input: string, maxLength = DEFAULT_KEY_MAX_LENGTH): string {
	let s = (input ?? "")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
	if (s && !/^[a-z]/.test(s)) s = `f_${s}`;
	if (maxLength > 0 && s.length > maxLength) {
		s = s.slice(0, maxLength).replace(/_+$/, "");
	}
	return s;
}

/**
 * Make `base` unique against `isTaken` by suffixing `_2`, `_3`, ... The base is
 * truncated when a suffixed candidate would exceed `maxLength`.
 */
export function uniqueKey(
	base: string,
	isTaken: (key: string) => boolean,
	maxLength = DEFAULT_KEY_MAX_LENGTH
): string {
	if (!base || !isTaken(base)) return base;
	for (let i = 2; i < 1_000; i++) {
		const suffix = `_${i}`;
		let candidate = base + suffix;
		if (maxLength > 0 && candidate.length > maxLength) {
			candidate = base.slice(0, maxLength - suffix.length).replace(/_+$/, "") + suffix;
		}
		if (!isTaken(candidate)) return candidate;
	}
	return base;
}

export function isKeyReserved(
	key: string,
	reservedKeys?: string[] | ((key: string) => boolean)
): boolean {
	if (!reservedKeys) return false;
	return typeof reservedKeys === "function"
		? !!reservedKeys(key)
		: reservedKeys.includes(key);
}

/** Errors of one column of a `supportsColumns` field. */
export interface FieldColumnErrors {
	label?: string;
	key?: string;
	options?: string;
	/** First offending extra of the column (its label is in the message). */
	extras?: string;
}

export interface FieldDefRowErrors {
	label?: string;
	key?: string;
	options?: string;
	/**
	 * The column-list summary: no columns / over `maxColumns`, else the first
	 * column-level message already prefixed with its position ("Column 2: …").
	 */
	columns?: string;
	/** First offending extra of the row (its label is in the message). */
	extras?: string;
	/**
	 * Index-aligned with `def.columns`; `null` = that column has no errors.
	 * Present only when at least one column has an error.
	 */
	columnErrors?: (FieldColumnErrors | null)[];
}

export interface FieldDefsValidationResult {
	valid: boolean;
	/** First error found — the component-level summary message. Empty when valid. */
	message: string;
	/** Index-aligned with the input defs. `null` = row has no errors. */
	rowErrors: (FieldDefRowErrors | null)[];
}

/** The slice of a palette entry `validateFieldDefs` reads. */
export type ValidateFieldDefsTypeDef = Pick<
	FieldTypeDef,
	"type" | "supportsOptions" | "extras" | "supportsColumns" | "columnTypes" | "maxColumns"
>;

/**
 * The palette a column of `entry` may take: its own `columnTypes`, else the
 * component's `types` without every entry that `supportsColumns` itself
 * (columns never nest).
 */
export function resolveColumnTypes<T extends Pick<FieldTypeDef, "supportsColumns">>(
	entry: Pick<FieldTypeDef, "columnTypes">,
	types: T[] | null | undefined
): (T | FieldTypeDef)[] {
	return entry.columnTypes ?? (types ?? []).filter((td) => !td.supportsColumns);
}

/**
 * Materialize the `default` of every declared extra that the bag does not
 * hold yet. Returns the same bag when nothing was seeded (so `undefined`
 * stays `undefined` for a type without defaults).
 */
export function seedExtraDefaults(
	extras: Record<string, unknown> | undefined,
	entry: Pick<FieldTypeDef, "extras"> | undefined
): Record<string, unknown> | undefined {
	let next = extras;
	for (const ex of entry?.extras ?? []) {
		if (ex.default !== undefined && next?.[ex.key] === undefined) {
			next = { ...(next ?? {}), [ex.key]: ex.default };
		}
	}
	return next;
}

export interface ValidateFieldDefsOptions {
	/**
	 * The type palette. When provided, defs with a `type` not present here are
	 * treated as unknown: they are NOT validated (they round-trip untouched and
	 * must never block the rest of the list), but their keys still count toward
	 * uniqueness.
	 */
	types?: ValidateFieldDefsTypeDef[];
	keyPattern?: RegExp;
	keyMaxLength?: number;
	reservedKeys?: string[] | ((key: string) => boolean);
	maxFields?: number;
	/** The canonical language: the "label required" rule reads this entry. */
	defaultLanguage?: string;
	/**
	 * Language the texts interpolated into messages (an extra's `label`) are
	 * read in, falling back to `defaultLanguage`. The rules themselves are not
	 * affected. Default: `defaultLanguage`.
	 */
	displayLanguage?: string;
	/** Translator for the error messages; defaults to returning the message key. */
	t?: FieldsBuilderTranslate;
}

// ---------------------------------------------------------------------------
// the single-value rules, shared by the field loop and the column loop so the
// two cannot drift; each returns the FIRST offending message or undefined
// ---------------------------------------------------------------------------

function labelError(
	label: LocalizedText | undefined,
	defaultLanguage: string | undefined,
	t: FieldsBuilderTranslate
): string | undefined {
	return getLocalizedText(label, defaultLanguage).trim()
		? undefined
		: t("err_label_required");
}

interface KeyRules {
	pattern: RegExp;
	maxLength: number;
	isDuplicate: (key: string) => boolean;
	duplicateMessageKey: string;
	isReserved?: (key: string) => boolean;
}

function keyError(
	key: string | undefined,
	rules: KeyRules,
	t: FieldsBuilderTranslate
): string | undefined {
	// presence is checked trimmed, but pattern/length run on the RAW key —
	// a whitespace-padded key must fail here, not at the consumer's gate
	const k = key ?? "";
	if (!k.trim()) return t("err_key_required");
	if (k.length > rules.maxLength) return t("err_key_maxlength", { max: rules.maxLength });
	if (!rules.pattern.test(k)) return t("err_key_pattern");
	if (rules.isDuplicate(k.trim())) return t(rules.duplicateMessageKey);
	if (rules.isReserved?.(k)) return t("err_key_reserved");
	return undefined;
}

function optionsError(
	options: FieldOptionDef[] | undefined,
	t: FieldsBuilderTranslate
): string | undefined {
	const list = options ?? [];
	const values = list.map((o) => (o.value ?? "").trim());
	if (!list.length) return t("err_options_required");
	if (values.some((v) => !v)) return t("err_option_value_required");
	if (new Set(values).size !== values.length) return t("err_option_value_duplicate");
	return undefined;
}

// `maxlength` is re-checked here on purpose: the input's attribute stops
// typing, it does not bound a seeded or pasted-then-mutated value
function extrasError(
	extras: Record<string, unknown> | undefined,
	entry: Pick<FieldTypeDef, "extras"> | undefined,
	displayLanguages: string[],
	t: FieldsBuilderTranslate
): string | undefined {
	for (const ex of entry?.extras ?? []) {
		if (ex.type !== "string" || !ex.maxlength) continue;
		const v = extras?.[ex.key];
		if (typeof v === "string" && v.length > ex.maxlength) {
			return t("err_extra_maxlength", {
				label: getLocalizedText(ex.label, displayLanguages),
				max: ex.maxlength,
			});
		}
	}
	return undefined;
}

function countKeys(items: { key?: string }[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const it of items) {
		const k = (it.key ?? "").trim();
		if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
	}
	return counts;
}

/** First string member of an errors object (skips the `columnErrors` array). */
function firstMessage(errs: object | null | undefined): string {
	if (!errs) return "";
	return Object.values(errs).find((v): v is string => typeof v === "string") ?? "";
}

/**
 * Validate a list of field defs: label non-empty, key present/pattern/length/
 * unique/not-reserved, choice types have at least one option with non-empty
 * unique values, string extras within `maxlength`, `maxFields` not exceeded.
 * A `supportsColumns` type additionally needs at least one column, at most
 * `maxColumns`, and every column (of a known column type) passes the label /
 * key (unique within the field) / options / extras rules above.
 *
 * This is client-side convenience only — a consumer persisting the list MUST
 * re-validate server-side; this function is not a security boundary.
 */
export function validateFieldDefs(
	defs: FieldDef[],
	opts: ValidateFieldDefsOptions = {}
): FieldDefsValidationResult {
	const t: FieldsBuilderTranslate = opts.t ?? ((k) => k);
	const keyPattern = opts.keyPattern ?? DEFAULT_KEY_PATTERN;
	const keyMaxLength = opts.keyMaxLength ?? DEFAULT_KEY_MAX_LENGTH;
	const typeMap = opts.types ? new Map(opts.types.map((td) => [td.type, td])) : null;
	const displayLanguages = [opts.displayLanguage, opts.defaultLanguage].filter(
		(l): l is string => !!l
	);

	const rowErrors: (FieldDefRowErrors | null)[] = defs.map(() => null);
	const put = (
		i: number,
		field: "label" | "key" | "options" | "columns" | "extras",
		msg: string | undefined
	) => {
		if (!msg) return;
		rowErrors[i] ??= {};
		rowErrors[i]![field] ??= msg;
	};

	// keys of ALL defs (incl. unknown types) occupy the key space
	const keyCounts = countKeys(defs);

	defs.forEach((d, i) => {
		// unknown type: keep as-is, do not block (see the doc comment above)
		if (typeMap && !typeMap.has(d.type)) return;
		const entry = typeMap?.get(d.type);

		put(i, "label", labelError(d.label, opts.defaultLanguage, t));
		put(
			i,
			"key",
			keyError(
				d.key,
				{
					pattern: keyPattern,
					maxLength: keyMaxLength,
					isDuplicate: (k) => (keyCounts.get(k) ?? 0) > 1,
					duplicateMessageKey: "err_key_duplicate",
					isReserved: (k) => isKeyReserved(k, opts.reservedKeys),
				},
				t
			)
		);
		if (entry?.supportsOptions) put(i, "options", optionsError(d.options, t));

		if (entry?.supportsColumns) {
			const { summary, columnErrors } = validateColumns(d.columns, entry, {
				columnTypes: resolveColumnTypes(entry, opts.types),
				keyPattern,
				keyMaxLength,
				defaultLanguage: opts.defaultLanguage,
				displayLanguages,
				t,
			});
			put(i, "columns", summary);
			if (columnErrors) rowErrors[i]!.columnErrors = columnErrors;
		}

		put(i, "extras", extrasError(d.extras, entry, displayLanguages, t));
	});

	// the summary is the first STRING member of the first erroneous row —
	// `columnErrors` (an array) must never be picked here
	let message = firstMessage(rowErrors.find(Boolean));
	if (!message && opts.maxFields && defs.length > opts.maxFields) {
		message = t("err_max_fields", { max: opts.maxFields });
	}

	return { valid: !message, message, rowErrors };
}

interface ValidateColumnsOptions {
	columnTypes: ValidateFieldDefsTypeDef[];
	keyPattern: RegExp;
	keyMaxLength: number;
	defaultLanguage?: string;
	displayLanguages: string[];
	t: FieldsBuilderTranslate;
}

/**
 * The column rules of one `supportsColumns` def. A column whose type is not
 * in the column palette is NOT validated (it round-trips untouched, like an
 * unknown field type) but its key still counts toward uniqueness. `reservedKeys`
 * does not apply: it guards the field-key namespace, and a column key lives
 * inside one field's rows.
 */
function validateColumns(
	columns: FieldColumnDef[] | undefined,
	entry: Pick<FieldTypeDef, "maxColumns">,
	opts: ValidateColumnsOptions
): { summary?: string; columnErrors?: (FieldColumnErrors | null)[] } {
	const { t } = opts;
	const list = columns ?? [];
	// a `supportsColumns` entry inside the column palette is a plain column
	// type here — nothing nests — so only `type` / `supportsOptions` / `extras` matter
	const colTypeMap = new Map(opts.columnTypes.map((td) => [td.type, td]));
	const keyCounts = countKeys(list);

	let summary: string | undefined;
	if (!list.length) summary = t("err_columns_required");
	else if (entry.maxColumns && list.length > entry.maxColumns) {
		summary = t("err_max_columns", { max: entry.maxColumns });
	}

	const columnErrors = list.map((c): FieldColumnErrors | null => {
		const ct = colTypeMap.get(c.type);
		if (!ct) return null;
		const e: FieldColumnErrors = {};
		const label = labelError(c.label, opts.defaultLanguage, t);
		if (label) e.label = label;
		const key = keyError(
			c.key,
			{
				pattern: opts.keyPattern,
				maxLength: opts.keyMaxLength,
				isDuplicate: (k) => (keyCounts.get(k) ?? 0) > 1,
				duplicateMessageKey: "err_column_key_duplicate",
			},
			t
		);
		if (key) e.key = key;
		if (ct.supportsOptions) {
			const options = optionsError(c.options, t);
			if (options) e.options = options;
		}
		const extras = extrasError(c.extras, ct, opts.displayLanguages, t);
		if (extras) e.extras = extras;
		return Object.keys(e).length ? e : null;
	});

	const firstIdx = columnErrors.findIndex(Boolean);
	if (!summary && firstIdx >= 0) {
		summary = t("err_column", {
			position: firstIdx + 1,
			message: firstMessage(columnErrors[firstIdx]),
		});
	}

	return {
		summary,
		columnErrors: firstIdx >= 0 ? columnErrors : undefined,
	};
}

/**
 * A small general-purpose palette — handy for demos and for consumers with no
 * opinion. `types` is a required prop, so nobody gets this by accident.
 */
export const DEFAULT_FIELD_TYPES: FieldTypeDef[] = [
	{ type: "text", label: "Text", description: "A single line of text" },
	{ type: "longtext", label: "Long text", description: "Multiple lines of text" },
	{ type: "number", label: "Number", description: "A numeric value" },
	{ type: "checkbox", label: "Yes / no", description: "A single on/off checkbox" },
	{
		type: "select",
		label: "Choice",
		description: "Pick one from a list of choices",
		supportsOptions: true,
	},
	{ type: "date", label: "Date", description: "A calendar date" },
];
