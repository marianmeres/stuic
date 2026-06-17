import { roundToDecimals } from "./round-to-decimals.js";

/**
 * Configuration for converting between an integer "minor units" amount (the
 * smallest indivisible unit a currency is stored in, e.g. cents) and its
 * human-facing "major units" decimal (e.g. dollars/euros).
 *
 * `scale` is how many minor units make one major unit (100 cents = 1 dollar);
 * `decimals` is how many fraction digits the major-unit string shows.
 */
export interface MinorUnitsConfig {
	/** Minor units per major unit. Default: 100. */
	scale?: number;
	/** Fraction digits in the major-unit string. Default: 2. */
	decimals?: number;
}

/**
 * Stored minor units (e.g. cents) → major-unit decimal string (e.g. `"1.00"`).
 * No currency symbol or grouping separators — the result round-trips cleanly
 * back through {@link parseToMinorUnits}, so it's safe for editable inputs.
 *
 * Non-numeric input is passed through stringified (so a half-typed value isn't
 * silently zeroed); callers that need a guarantee should validate first.
 *
 * @example
 * ```ts
 * formatMinorUnits(100);                       // "1.00"
 * formatMinorUnits(12345);                      // "123.45"
 * formatMinorUnits(5, { scale: 1000, decimals: 3 }); // "0.005"
 * ```
 */
export function formatMinorUnits(
	v: string | number | null | undefined,
	cfg?: MinorUnitsConfig
): string {
	const scale = cfg?.scale ?? 100;
	const decimals = cfg?.decimals ?? 2;
	const n = parseFloat(`${v}`);
	if (!Number.isFinite(n)) return `${v ?? ""}`;
	return roundToDecimals(n / scale, decimals).toFixed(decimals);
}

/**
 * Major-unit decimal input (e.g. `"1.00"`) → integer minor units (e.g. `100`).
 *
 * NaN-safe: non-numeric input yields `0`. This is a low-level helper — UI that
 * must distinguish "empty/invalid" from "zero" should guard for finiteness
 * before calling (see how `FieldMoney` does it).
 *
 * @example
 * ```ts
 * parseToMinorUnits("1.00");                    // 100
 * parseToMinorUnits("123.45");                   // 12345
 * parseToMinorUnits("0.005", { scale: 1000, decimals: 3 }); // 5
 * parseToMinorUnits("abc");                      // 0
 * ```
 */
export function parseToMinorUnits(
	v: string | number | null | undefined,
	cfg?: MinorUnitsConfig
): number {
	const scale = cfg?.scale ?? 100;
	const n = parseFloat(`${v}`);
	return Number.isFinite(n) ? Math.round(n * scale) : 0;
}

/**
 * Format an integer amount of minor units (cents) as a localized currency
 * string, e.g. `money(12345, "USD")` → `"$123.45"`.
 *
 * Uses `Intl.NumberFormat` with `currencyDisplay: "narrowSymbol"` so you get
 * `"$"` / `"€"` rather than the locale-disambiguated `"US$"`. Falls back to a
 * plain `"123.45 XXX"` for unknown/invalid currency codes.
 *
 * Unlike {@link formatMinorUnits} this is for DISPLAY only (it adds symbols and
 * grouping) — do not feed its output back into an editable money input.
 *
 * @example
 * ```ts
 * money(12345, "USD"); // "$123.45"
 * money(null, "EUR");  // "€0.00"
 * ```
 */
export function money(cents: number | undefined | null, currency: string): string {
	const value = (cents ?? 0) / 100;
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			currencyDisplay: "narrowSymbol",
		}).format(value);
	} catch {
		// Unknown/invalid currency code — degrade to a plain "12.00 XXX".
		return `${value.toFixed(2)} ${currency}`;
	}
}
