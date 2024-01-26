export const omit = (obj: any, keys: string | string[]) => {
	if (typeof keys === 'string') keys = [keys];
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => !(keys || []).includes(k))
	);
};

export const pick = (obj: any, keys: string | string[]) => {
	if (typeof keys === 'string') keys = [keys];
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => (keys || []).includes(k))
	);
};
