/**
 * Converts a hex color string to OKLCH
 * @param {string} hex - The hex color string (with or without leading #)
 * @returns {Object} An object with l (lightness), c (chroma), and h (hue) properties
 */
function hexToOklch(hex: string) {
	// Remove the hash if it exists
	hex = hex.replace(/^#/, "");

	// Handle both 3-digit and 6-digit formats
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	// Parse the hex values to RGB (0-1)
	const r = parseInt(hex.substring(0, 2), 16) / 255;
	const g = parseInt(hex.substring(2, 4), 16) / 255;
	const b = parseInt(hex.substring(4, 6), 16) / 255;

	// Convert RGB to linear RGB (removing gamma correction)
	const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
	const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
	const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

	// Convert to XYZ
	const x = 0.4124 * linearR + 0.3576 * linearG + 0.1805 * linearB;
	const y = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
	const z = 0.0193 * linearR + 0.1192 * linearG + 0.9505 * linearB;

	// Convert XYZ to LMS (cone response)
	const l = 0.819 * x + 0.3619 * y - 0.1289 * z;
	const m = 0.0329 * x + 0.9293 * y + 0.0361 * z;
	const s = 0.0482 * x + 0.2645 * y + 0.6886 * z;

	// Apply non-linearity to LMS
	const lp = Math.cbrt(l);
	const mp = Math.cbrt(m);
	const sp = Math.cbrt(s);

	// Convert to Oklab
	const L = 0.2104 * lp + 0.7936 * mp - 0.004 * sp;
	const a = 1.9779 * lp - 2.4285 * mp + 0.4505 * sp;
	const bb = 0.0259 * lp + 0.7827 * mp - 0.8086 * sp;

	// Convert Oklab to Oklch
	const C = Math.sqrt(a * a + bb * bb);
	let h = (Math.atan2(bb, a) * 180) / Math.PI;

	// Ensure hue is positive
	if (h < 0) {
		h += 360;
	}

	return {
		l: parseFloat(L.toFixed(4)),
		c: parseFloat(C.toFixed(4)),
		h: parseFloat(h.toFixed(2)),
	};
}

// Example usage:
// const oklch = hexToOklch("#ff5733");
// console.log(oklch); // Example output: { l: 0.6321, c: 0.1549, h: 27.23 }
