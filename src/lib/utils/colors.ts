/**
 * Converts a CSS HEX color string to an Oklch color string.
 *
 * @param hex - The HEX color string (e.g., "#ff0000" or "ff0000" or "#f00")
 * @returns CSS oklch() color string (e.g., "oklch(62.8% 0.258 29.2)")
 * @throws Error if the HEX format is invalid
 *
 * @example
 * ```ts
 * hexToOklch("#ff0000"); // "oklch(62.8% 0.258 29.2)"
 * hexToOklch("#f00");    // "oklch(62.8% 0.258 29.2)"
 * ```
 */
export function hexToOklch(hex: string) {
	// 1. Parse HEX to RGB
	const rgb = hexToRgb(hex);
	if (!rgb) {
		throw new Error("Invalid HEX color format.");
	}

	// 2. Convert sRGB (0-255) to oklab
	return rgbToOklch(rgb);
}

/**
 * Converts an sRGB color object (0-255 range) to an Oklch color string.
 *
 * @param rgb - Object with r, g, b values in 0-255 range
 * @returns CSS oklch() color string (e.g., "oklch(62.8% 0.258 29.2)")
 *
 * @example
 * ```ts
 * rgbToOklch({ r: 255, g: 0, b: 0 }); // "oklch(62.8% 0.258 29.2)"
 * ```
 */
export function rgbToOklch(rgb: { r: number; g: number; b: number }) {
	// 1. Convert sRGB (0-255) to Linear RGB (0.0-1.0)
	const linearRgb = srgbToLinearRgb(rgb);

	// 2. Convert Linear RGB to Oklab
	const oklab = linearRgbToOklab(linearRgb);

	// 3. Convert Oklab to Oklch
	const oklch = oklabToOklch(oklab);

	// 4. Format as CSS string
	// L is 0-1, formatted as 0-100%
	// C is 0-0.4 (approx), formatted as a number
	// h is 0-360, formatted as a number (degrees)
	const l = (oklch.l * 100).toFixed(1);
	const c = oklch.c.toFixed(3);
	// Handle hue: NaN becomes 0
	const h = isNaN(oklch.h) ? "0" : oklch.h.toFixed(1);

	return `oklch(${l}% ${c} ${h})`;
}

/**
 * Converts a HEX color string to an RGB object.
 *
 * Supports both 3-character shorthand (#f00) and 6-character (#ff0000) formats,
 * with or without the leading hash.
 *
 * @param hex - The HEX color string
 * @returns Object with r, g, b values in 0-255 range, or null if invalid
 *
 * @example
 * ```ts
 * hexToRgb("#ff0000"); // { r: 255, g: 0, b: 0 }
 * hexToRgb("f00");     // { r: 255, g: 0, b: 0 }
 * hexToRgb("invalid"); // null
 * ```
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, (m, r, g, b) => {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * Converts sRGB color values (0-255) to linear RGB (0.0-1.0).
 *
 * Applies the inverse sRGB transfer function (gamma correction) to convert
 * from the non-linear sRGB color space to linear light values.
 *
 * @param rgb - Object with r, g, b values in 0-255 range
 * @returns Object with r, g, b values in 0.0-1.0 linear range
 *
 * @example
 * ```ts
 * srgbToLinearRgb({ r: 255, g: 128, b: 0 });
 * // { r: 1, g: 0.2158..., b: 0 }
 * ```
 */
export function srgbToLinearRgb({ r, g, b }: { r: number; g: number; b: number }) {
	const convert = (val: number) => {
		const v = val / 255;
		return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return {
		r: convert(r),
		g: convert(g),
		b: convert(b),
	};
}

/**
 * Converts linear RGB color values (0.0-1.0) to the Oklab color space.
 *
 * Oklab is a perceptual color space that aims for perceptual uniformity,
 * making it ideal for color manipulation and interpolation.
 *
 * @param rgb - Object with r, g, b values in 0.0-1.0 linear range
 * @returns Object with l (lightness 0-1), a (green-red axis), b (blue-yellow axis)
 *
 * @example
 * ```ts
 * linearRgbToOklab({ r: 1, g: 0, b: 0 });
 * // { l: 0.627..., a: 0.224..., b: 0.125... }
 * ```
 */
export function linearRgbToOklab({ r, g, b }: { r: number; g: number; b: number }): {
	l: number;
	a: number;
	b: number;
} {
	// Based on the conversion matrices from the Oklab color space specification
	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	return {
		l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
		a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
		b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
	};
}

/**
 * Converts Oklab color values to the Oklch (cylindrical) color space.
 *
 * Oklch represents colors using lightness (L), chroma (C), and hue (h),
 * which is more intuitive for color manipulation than Oklab's rectangular coordinates.
 *
 * @param lab - Object with l (lightness), a (green-red), b (blue-yellow) values
 * @returns Object with l (lightness 0-1), c (chroma), h (hue in degrees 0-360)
 *
 * @example
 * ```ts
 * oklabToOklch({ l: 0.627, a: 0.224, b: 0.125 });
 * // { l: 0.627, c: 0.257..., h: 29.2... }
 * ```
 */
export function oklabToOklch({ l, a, b }: { l: number; a: number; b: number }): {
	l: number;
	c: number;
	h: number;
} {
	const c = Math.sqrt(a * a + b * b);
	let h = Math.atan2(b, a) * (180 / Math.PI);

	// Normalize hue to be between 0 and 360
	if (h < 0) {
		h += 360;
	}

	return { l, c, h };
}
