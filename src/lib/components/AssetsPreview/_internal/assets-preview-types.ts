import type { BookPageArea } from "../../Book/Book.svelte";

export interface AssetArea extends BookPageArea {}

export type AssetPreviewUrlObj = {
	// o
	thumb: string | URL;
	// used in modal preview
	full: string | URL;
	// (potentially extra high res) used for download
	original: string | URL;
};

export interface AssetPreview {
	url: AssetPreviewUrlObj;
	name?: string;
	type?: string;
	srcset?: string;
	sizes?: string;
	/** Natural image width in px (required for areas) */
	width?: number;
	/** Natural image height in px (required for areas) */
	height?: number;
	/** Clickable areas on this image */
	areas?: AssetArea[];
}

export interface AssetPreviewNormalized extends AssetPreview {
	name: string;
	type: string;
	ext: string;
	isImage: boolean;
}
