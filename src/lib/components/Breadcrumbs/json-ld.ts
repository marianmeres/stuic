import type { BreadcrumbItem } from "./Breadcrumbs.svelte";

/** Options for the JSON-LD helpers. */
export interface BreadcrumbsJsonLdOptions {
	/**
	 * Base URL to resolve relative `href`s against (e.g. `page.url.origin` in
	 * SvelteKit). Google recommends absolute URLs in `BreadcrumbList` structured
	 * data; without a base, hrefs are emitted as-is.
	 */
	baseUrl?: string | URL;
}

/** One `ListItem` of a schema.org `BreadcrumbList`. */
export interface BreadcrumbListItemJsonLd {
	"@type": "ListItem";
	/** 1-based position in the trail. */
	position: number;
	name: string;
	/** The crumb's URL. Omitted for crumbs without `href` (typically the current page). */
	item?: string;
}

/** A schema.org `BreadcrumbList` — the structured data search engines read. */
export interface BreadcrumbListJsonLd {
	"@context": "https://schema.org";
	"@type": "BreadcrumbList";
	itemListElement: BreadcrumbListItemJsonLd[];
}

/**
 * Builds a schema.org `BreadcrumbList` object from `Breadcrumbs` items — the
 * structured data Google et al. use to render breadcrumb trails in search results.
 *
 * Crumbs without `href` (typically the last one, the current page) are emitted
 * without `item`, which is exactly what Google's guidelines prescribe for the
 * final breadcrumb.
 *
 * @example
 * ```ts
 * breadcrumbsJsonLd(items, { baseUrl: "https://example.com" });
 * // { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [...] }
 * ```
 */
export function breadcrumbsJsonLd(
	items: BreadcrumbItem[],
	options: BreadcrumbsJsonLdOptions = {}
): BreadcrumbListJsonLd {
	const { baseUrl } = options;
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => {
			const out: BreadcrumbListItemJsonLd = {
				"@type": "ListItem",
				position: i + 1,
				name: item.label,
			};
			if (item.href) {
				out.item = baseUrl ? new URL(item.href, baseUrl).toString() : item.href;
			}
			return out;
		}),
	};
}

/**
 * Renders the full `<script type="application/ld+json">…</script>` tag as a string,
 * safe to inject via `{@html}` (angle brackets and ampersands inside the JSON are
 * `\uXXXX`-escaped, so a label can never break out of the script element).
 *
 * In SvelteKit, put it in the head:
 *
 * @example
 * ```svelte
 * <svelte:head>
 *   {@html breadcrumbsJsonLdScript(items, { baseUrl: page.url.origin })}
 * </svelte:head>
 * ```
 *
 * Or let the component render it inline via its `jsonLd` prop (search engines read
 * JSON-LD anywhere in the document).
 */
export function breadcrumbsJsonLdScript(
	items: BreadcrumbItem[],
	options: BreadcrumbsJsonLdOptions = {}
): string {
	const json = JSON.stringify(breadcrumbsJsonLd(items, options))
		.replaceAll("&", "\\u0026")
		.replaceAll("<", "\\u003c")
		.replaceAll(">", "\\u003e");
	return `<script type="application/ld+json">${json}</` + `script>`;
}
