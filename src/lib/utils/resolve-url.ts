/** Resolve a possibly relative URL against an optional base URL. */
export function resolveUrl(url: string, baseUrl?: string): string {
	if (!baseUrl || !url) return url;
	try {
		return new URL(url, baseUrl).href;
	} catch {
		return url;
	}
}

/** Resolve all URLs inside a srcset string against an optional base URL. */
export function resolveSrcset(srcset: string, baseUrl?: string): string {
	if (!baseUrl || !srcset) return srcset;
	return srcset
		.split(",")
		.map((entry) => {
			const parts = entry.trim().split(/\s+/);
			if (parts.length === 0) return entry;
			parts[0] = resolveUrl(parts[0], baseUrl);
			return parts.join(" ");
		})
		.join(", ");
}
