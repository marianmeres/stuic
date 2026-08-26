import type { FieldDef, FieldTypeDef, LocalizedText } from "./types.js";

/** Default machine-key policy: lowercase snake_case, starts with a letter, max 63 chars. */
export const DEFAULT_KEY_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

export const DEFAULT_KEY_MAX_LENGTH = 63;

/** Minimal translate signature the pure helpers below need. */
export type FieldsBuilderTranslate = (
	key: string,
	values?: Record<string, string | number>
) => string;

/**
 * Read the display text of a `LocalizedText`: the string itself, the preferred
 * language's entry, or the first non-empty entry as a fallback.
 */
export function getLocalizedText(
	text: LocalizedText | null | undefined,
	preferredLanguage?: string
): string {
	if (text == null) return "";
	if (typeof text === "string") return text;
	if (preferredLanguage && text[preferredLanguage]) return text[preferredLanguage];
	for (const v of Object.values(text)) if (v) return v;
	return "";
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

export interface FieldDefRowErrors {
	label?: string;
	key?: string;
	options?: string;
	/** First offending extra of the row (its label is in the message). */
	extras?: string;
}

export interface FieldDefsValidationResult {
	valid: boolean;
	/** First error found — the component-level summary message. Empty when valid. */
	message: string;
	/** Index-aligned with the input defs. `null` = row has no errors. */
	rowErrors: (FieldDefRowErrors | null)[];
}

export interface ValidateFieldDefsOptions {
	/**
	 * The type palette. When provided, defs with a `type` not present here are
	 * treated as unknown: they are NOT validated (they round-trip untouched and
	 * must never block the rest of the list), but their keys still count toward
	 * uniqueness.
	 */
	types?: Pick<FieldTypeDef, "type" | "supportsOptions" | "extras">[];
	keyPattern?: RegExp;
	keyMaxLength?: number;
	reservedKeys?: string[] | ((key: string) => boolean);
	maxFields?: number;
	defaultLanguage?: string;
	/** Translator for the error messages; defaults to returning the message key. */
	t?: FieldsBuilderTranslate;
}

/**
 * Validate a list of field defs: label non-empty, key present/pattern/length/
 * unique/not-reserved, choice types have at least one option with non-empty
 * unique values, string extras within `maxlength`, `maxFields` not exceeded.
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

	const rowErrors: (FieldDefRowErrors | null)[] = defs.map(() => null);
	const put = (i: number, field: keyof FieldDefRowErrors, msg: string) => {
		rowErrors[i] ??= {};
		rowErrors[i]![field] ??= msg;
	};

	// keys of ALL defs (incl. unknown types) occupy the key space
	const keyCounts = new Map<string, number>();
	for (const d of defs) {
		const k = (d.key ?? "").trim();
		if (k) keyCounts.set(k, (keyCounts.get(k) ?? 0) + 1);
	}

	defs.forEach((d, i) => {
		// unknown type: keep as-is, do not block (see the doc comment above)
		if (typeMap && !typeMap.has(d.type)) return;

		if (!getLocalizedText(d.label, opts.defaultLanguage).trim()) {
			put(i, "label", t("err_label_required"));
		}

		// presence is checked trimmed, but pattern/length run on the RAW key —
		// a whitespace-padded key must fail here, not at the consumer's gate
		const k = d.key ?? "";
		if (!k.trim()) {
			put(i, "key", t("err_key_required"));
		} else {
			if (k.length > keyMaxLength) {
				put(i, "key", t("err_key_maxlength", { max: keyMaxLength }));
			} else if (!keyPattern.test(k)) {
				put(i, "key", t("err_key_pattern"));
			}
			if ((keyCounts.get(k.trim()) ?? 0) > 1) put(i, "key", t("err_key_duplicate"));
			if (isKeyReserved(k, opts.reservedKeys)) put(i, "key", t("err_key_reserved"));
		}

		if (typeMap?.get(d.type)?.supportsOptions) {
			const options = d.options ?? [];
			const values = options.map((o) => (o.value ?? "").trim());
			if (!options.length) {
				put(i, "options", t("err_options_required"));
			} else if (values.some((v) => !v)) {
				put(i, "options", t("err_option_value_required"));
			} else if (new Set(values).size !== values.length) {
				put(i, "options", t("err_option_value_duplicate"));
			}
		}

		// `maxlength` is re-checked here on purpose: the input's attribute stops
		// typing, it does not bound a seeded or pasted-then-mutated value
		for (const ex of typeMap?.get(d.type)?.extras ?? []) {
			if (ex.type !== "string" || !ex.maxlength) continue;
			const v = d.extras?.[ex.key];
			if (typeof v === "string" && v.length > ex.maxlength) {
				put(
					i,
					"extras",
					t("err_extra_maxlength", {
						label: getLocalizedText(ex.label, opts.defaultLanguage),
						max: ex.maxlength,
					})
				);
			}
		}
	});

	let message = rowErrors.find(Boolean)
		? Object.values(rowErrors.find(Boolean)!)[0]!
		: "";
	if (!message && opts.maxFields && defs.length > opts.maxFields) {
		message = t("err_max_fields", { max: opts.maxFields });
	}

	return { valid: !message, message, rowErrors };
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
