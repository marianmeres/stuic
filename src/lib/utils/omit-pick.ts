export function omit(obj: any, keys: string | string[]) {
	if (typeof keys === "string") keys = [keys];
	const _keys = new Set(keys);
	return Object.fromEntries(Object.entries(obj).filter(([k]) => !_keys.has(k)));
}

export function pick(obj: any, keys: string | string[]) {
	if (typeof keys === "string") keys = [keys];
	const _keys = new Set(keys);
	return Object.fromEntries(Object.entries(obj).filter(([k]) => _keys.has(k)));
}
