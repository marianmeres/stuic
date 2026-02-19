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
}

export interface AssetPreviewNormalized extends AssetPreview {
	name: string;
	type: string;
	ext: string;
	isImage: boolean;
}
