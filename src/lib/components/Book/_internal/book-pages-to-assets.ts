import type { BookPage } from "../Book.svelte";
import type { AssetPreview } from "../../AssetsPreview/_internal/assets-preview-types.js";
import { resolveUrl } from "../../../utils/resolve-url.js";

/**
 * Convert BookPage[] to AssetPreview[] for use with AssetsPreviewInline.
 * Areas are directly compatible (AssetArea extends BookPageArea).
 */
export function bookPagesToAssets(
	pages: BookPage[],
	baseUrl?: string
): AssetPreview[] {
	return pages.map((page) => {
		const src = resolveUrl(page.src, page.baseUrl || baseUrl);
		return {
			url: { thumb: src, full: src, original: src },
			name: page.title || basename(page.src),
			type: "image",
			srcset: page.srcset,
			sizes: page.sizes,
			width: page.width,
			height: page.height,
			areas: page.areas,
		};
	});
}

function basename(src: string): string {
	try {
		return new URL(src, "https://x").pathname.split("/").pop() || src;
	} catch {
		return src;
	}
}
