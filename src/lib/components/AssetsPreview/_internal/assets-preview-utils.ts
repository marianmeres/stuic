import {
	iconFile,
	iconFileBinary,
	iconFileCode,
	iconFileImage,
	iconFileMusic,
	iconFilePdf,
	iconFileRichtext,
	iconFileSlides,
	iconFileSpreadsheet,
	iconFileText,
	iconFileWord,
	iconFileZip,
} from "$lib/icons/index.js";
import { getFileTypeLabel } from "../../../utils/get-file-type-label.js";
import { isImage } from "../../../utils/is-image.js";
import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";
import type { AssetPreview, AssetPreviewNormalized } from "./assets-preview-types.js";

export function getAssetIcon(ext?: string) {
	const map: Record<string, CallableFunction> = {
		archive: iconFileZip,
		audio: iconFileMusic,
		binary: iconFileBinary,
		code: iconFileCode,
		doc: iconFileWord,
		image: iconFileImage,
		pdf: iconFilePdf,
		presentation: iconFileSlides,
		richtext: iconFileRichtext,
		spreadsheet: iconFileSpreadsheet,
		text: iconFileText,
		unknown: iconFile,
	};
	return map[getFileTypeLabel(ext ?? "unknown")] ?? iconFile;
}

// i18n ready
export function t_default(
	k: string,
	values: false | null | undefined | Record<string, string | number> = null,
	fallback: string | boolean = "",
	i18nSpanWrap: boolean = true
) {
	const m: Record<string, string> = {
		unable_to_preview: "Unable to preview",
		download: "Download",
		close: "Close",
		zoom_in: "Zoom in",
		zoom_out: "Zoom out",
		delete: "Delete",
	};
	let out = m[k] ?? fallback ?? k;

	return isPlainObject(values) ? replaceMap(out, values as any) : out;
}

// naive best-effort
export function ext(name: string): string {
	const _ext = name.split(".").at(-1) ?? "";
	return _ext ? `.${_ext}` : "";
}

export function normalizeInput(input: string | AssetPreview): AssetPreviewNormalized | null {
	const asset: AssetPreviewNormalized = {
		name: "",
		type: "",
		url: { full: "", thumb: "", original: "" },
		isImage: false,
		ext: "",
	};
	if (typeof input === "string") {
		asset.url.full = input;
	} else {
		// Handle AssetPreview object
		asset.url = { ...input.url };
		asset.name = input.name ?? "";
		asset.type = input.type ?? "";
		asset.srcset = input.srcset;
		asset.sizes = input.sizes;
		asset.width = input.width;
		asset.height = input.height;
		asset.areas = input.areas;
	}

	if (!asset.url.full) {
		return null;
	}

	asset.url.full = new URL(
		asset.url.full,
		globalThis.location?.href ?? "http://placeholder"
	);

	// Use "full" also as "thumb" and "original", if not provided
	asset.url.thumb ||= asset.url.full;
	asset.url.original ||= asset.url.full;

	// best-effort..
	if (!asset.name) {
		asset.name = asset.url.full.pathname.split("/").at(-1) ?? "";
	}

	// best-effort..
	if (!asset.type) {
		asset.type = getFileTypeLabel(ext(asset.name) ?? "unknown");
	}

	asset.ext = ext(asset.name);
	asset.isImage = isImage(asset.ext);

	return asset;
}
