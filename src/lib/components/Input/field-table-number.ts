/**
 * Locale-aware number parsing and formatting for `FieldTable`'s `number` cells.
 *
 * Pure functions (no DOM), so they can be unit-tested in the fast node project.
 * The rule they implement is "never guess": a typed value is either read as one
 * unambiguous number, or rejected.
 */

/** A parse outcome — `null` is "blank" (an empty cell), never an error. */
export type ParsedCellNumber = { ok: true; value: number | null } | { ok: false };

/**
 * The decimal separator `Intl` uses for `locale` (`"."` for `en`, `","` for `sk`).
 * `undefined` means the runtime's default locale. An unknown locale falls back to `"."`.
 */
export function decimalSeparator(locale?: string): string {
	try {
		const parts = new Intl.NumberFormat(locale, { useGrouping: false }).formatToParts(
			1.1
		);
		return parts.find((p) => p.type === "decimal")?.value ?? ".";
	} catch {
		return ".";
	}
}

// an optional sign, then digits with at most one dot ("12", "12.", ".5", "-3.2");
// no exponent, no hex, no trailing garbage
const DECIMAL_RE = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/;

/**
 * Parses what a user typed into a number cell.
 *
 * - Whitespace anywhere (including NBSP / narrow NBSP) is stripped: `"1 000"` → `1000`.
 * - `"."` is always accepted as the decimal separator.
 * - `","` is accepted as the decimal separator **only** when `locale` uses it. Under an
 *   English locale `"1,000"` is rejected — it is never silently read as a thousands group.
 * - Two separators (`"1.2.3"`, `"1,2,3"`, `"1,000.5"`) are rejected.
 * - A Unicode minus (`"−5"`, what `Intl` formats in some locales) reads as a minus sign.
 * - Blank is `{ ok: true, value: null }`.
 *
 * @example
 * ```ts
 * parseCellNumber("4.2", "sk");  // { ok: true, value: 4.2 }
 * parseCellNumber("4,2", "sk");  // { ok: true, value: 4.2 }
 * parseCellNumber("4,2", "en");  // { ok: false }
 * parseCellNumber("1 000", "en"); // { ok: true, value: 1000 }
 * parseCellNumber("", "en");     // { ok: true, value: null }
 * ```
 */
export function parseCellNumber(raw: string, locale?: string): ParsedCellNumber {
	let s = String(raw ?? "")
		.replace(/\s+/g, "")
		.replace(/−/g, "-");
	if (s === "") return { ok: true, value: null };

	const dots = (s.match(/\./g) ?? []).length;
	const commas = (s.match(/,/g) ?? []).length;
	if (dots + commas > 1) return { ok: false };
	if (commas === 1) {
		if (decimalSeparator(locale) !== ",") return { ok: false };
		s = s.replace(",", ".");
	}

	if (!DECIMAL_RE.test(s)) return { ok: false };
	const n = Number(s);
	if (!Number.isFinite(n)) return { ok: false };
	return { ok: true, value: n };
}

/**
 * Formats a number for display in a number cell: no grouping, up to 20 fraction
 * digits (so `4.2` is never rounded away), Latin digits, the locale's decimal
 * separator. A Slovak user sees `4,2` for `4.2`; an English one `4.2`.
 *
 * A non-finite input yields `""`.
 */
export function formatCellNumber(n: number, locale?: string): string {
	if (typeof n !== "number" || !Number.isFinite(n)) return "";
	try {
		return new Intl.NumberFormat(locale, {
			useGrouping: false,
			maximumFractionDigits: 20,
			numberingSystem: "latn",
		}).format(n);
	} catch {
		return String(n);
	}
}
