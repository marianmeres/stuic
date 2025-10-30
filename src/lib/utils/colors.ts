/**
 * Converts a CSS HEX color string to an Oklch color string.
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
 * Converts a sRGB (0-255) to an Oklch color string.
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
 * Converts a HEX string to an RGB object.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, (m, r, g, b) => {
		return r + r + g + g + b + b;
	});

	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * Converts sRGB (0-255) to linear RGB (0.0-1.0).
 */
export function srgbToLinearRgb({ r, g, b }: { r: number; g: number; b: number }) {
	const convert = (val: number) => {
		let v = val / 255;
		return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return {
		r: convert(r),
		g: convert(g),
		b: convert(b),
	};
}

/**
 * Converts linear RGB (0.0-1.0) to Oklab.
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
 * Converts Oklab to Oklch.
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
