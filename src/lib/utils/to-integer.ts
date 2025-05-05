export function toInteger(value: any, fallback: number = 1) {
	if (typeof value === "number" && !isNaN(value)) {
		return Math.floor(value);
	}

	if (typeof value === "string") {
		const parsed = parseFloat(value);
		if (!isNaN(parsed)) return Math.floor(parsed);
	}

	return fallback;
}
