/**
 * Does a file pass an `accept` attribute value? Shared by `FieldAssets` and
 * `FieldSingleAsset`.
 *
 * Tokens are the HTML `accept` ones, comma separated: a MIME type
 * (`image/png`), a wildcard MIME (`image/*`, `*`), or an extension (`.pdf`).
 * MIME tokens are matched as prefixes of the file's `type`; extension tokens
 * are matched against the end of the file's `name` (the browser's own picker
 * filters by the same rule, so a drop and a pick agree). An empty `accept`
 * accepts everything; so does a file with an unknown (empty) `type` when the
 * token is a MIME one — we cannot tell, and the picker would have let it
 * through too.
 */
export function isAcceptedType(
	allowedAccept?: string,
	type?: string,
	name?: string
): boolean {
	if (!allowedAccept) return true;

	const tokens = (allowedAccept ?? "")
		.split(",")
		.map((v) => `${v || ""}`.trim().toLowerCase())
		.filter(Boolean);

	if (!tokens.length) return true;

	const _type = `${type ?? ""}`.toLowerCase();
	const _name = `${name ?? ""}`.toLowerCase();

	return tokens.some((tok) => {
		if (tok.startsWith(".")) return !!_name && _name.endsWith(tok);
		// unknown type: cannot decide, let it through (legacy behavior)
		if (!_type) return true;
		const prefix = tok.includes("*") ? tok.slice(0, tok.indexOf("*")) : tok;
		return _type.startsWith(prefix);
	});
}

/** `1234567` -> `"1.2 MB"` (1024-based, at most one decimal below 10). */
export function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let v = Math.max(0, Number(bytes) || 0);
	let i = 0;
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024;
		i++;
	}
	const rounded = i === 0 ? Math.round(v) : parseFloat(v.toFixed(v < 10 ? 1 : 0));
	return `${rounded} ${units[i]}`;
}
