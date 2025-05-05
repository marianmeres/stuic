export function ucfirst(s: string) {
	s = `${s}`;
	if (!s.length) return s;
	return s[0].toUpperCase() + (s.slice(1) || "");
}
