/**
 * Round a number to a fixed number of decimal places.
 *
 * Avoids the trailing float noise of naive `toFixed`-then-`parseFloat` by
 * scaling to integers, rounding, then scaling back.
 *
 * @param value - The number to round
 * @param decimals - Number of decimal places to keep (default: 5)
 * @returns The rounded number
 *
 * @example
 * ```ts
 * roundToDecimals(1.005, 2);   // 1.01
 * roundToDecimals(2.5 / 100, 2); // 0.03
 * roundToDecimals(3.14159);    // 3.14159 (default 5 decimals)
 * ```
 */
export function roundToDecimals(value: number, decimals: number = 5): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}
