export function maybeJsonParse(val: any, strict = false) {
	if (typeof val === "string") {
		try {
			val = JSON.parse(val);
		} catch (e) {
			if (strict) throw e;
		}
	}
	return val;
}
