/** Will convert #fff or #ffffff to {r: 255, g: 255, b: 255} */
export function hexToRgb(hex: string) {
	hex = hex.replace(/^#/, "");

	// both 3-digit and 6-digit formats
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return { r, g, b };
}
