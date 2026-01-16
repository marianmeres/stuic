<script lang="ts" module>
	import { iconBsFileEarmark } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmark.js";
	import { iconBsFileEarmarkBinary } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkBinary.js";
	import { iconBsFileEarmarkCode } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkCode.js";
	import { iconBsFileEarmarkImage } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkImage.js";
	import { iconBsFileEarmarkMusic } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkMusic.js";
	import { iconBsFileEarmarkPdf } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkPdf.js";
	import { iconBsFileEarmarkRichtext } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkRichtext.js";
	import { iconBsFileEarmarkSlides } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkSlides.js";
	import { iconBsFileEarmarkSpreadsheet } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkSpreadsheet.js";
	import { iconBsFileEarmarkText } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkText.js";
	import { iconBsFileEarmarkWord } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkWord.js";
	import { iconBsFileEarmarkZip } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmarkZip.js";
	import { iconFeatherArrowLeft as iconPrevious } from "@marianmeres/icons-fns/feather/iconFeatherArrowLeft.js";
	import { iconFeatherArrowRight as iconNext } from "@marianmeres/icons-fns/feather/iconFeatherArrowRight.js";
	import { iconFeatherDownload as iconDownload } from "@marianmeres/icons-fns/feather/iconFeatherDownload.js";
	import { iconFeatherPlus as iconAdd } from "@marianmeres/icons-fns/feather/iconFeatherPlus.js";
	import { iconFeatherTrash2 as iconDelete } from "@marianmeres/icons-fns/feather/iconFeatherTrash2.js";
	import { getFileTypeLabel } from "../../utils/get-file-type-label.js";
	import { Modal } from "../Modal/index.js";
	import { createClog } from "@marianmeres/clog";
	import { isImage } from "../../utils/is-image.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import type { TranslateFn } from "../../types.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { forceDownload } from "../../utils/force-download.js";
	import { tooltip } from "../../actions/index.js";
	import { X } from "../X/index.js";
	import { preloadImgs } from "../../utils/preload-img.js";

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

	interface AssetPreviewNormalized extends AssetPreview {
		name: string;
		type: string;
		ext: string;
		isImage: boolean;
	}

	export interface Props {
		assets: string[] | AssetPreview[];
		classControls?: string;
		/** Optional translate function */
		t?: TranslateFn;
	}

	export function getAssetIcon(ext?: string) {
		const map: Record<string, CallableFunction> = {
			archive: iconBsFileEarmarkZip,
			audio: iconBsFileEarmarkMusic,
			binary: iconBsFileEarmarkBinary,
			code: iconBsFileEarmarkCode,
			doc: iconBsFileEarmarkWord,
			image: iconBsFileEarmarkImage,
			pdf: iconBsFileEarmarkPdf,
			presentation: iconBsFileEarmarkSlides,
			richtext: iconBsFileEarmarkRichtext,
			spreadsheet: iconBsFileEarmarkSpreadsheet,
			text: iconBsFileEarmarkText,
			unknown: iconBsFileEarmark,
		};
		return map[getFileTypeLabel(ext ?? "unknown")] ?? iconBsFileEarmark;
	}

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			unable_to_preview: "Unable to preview",
			download: "Download",
			close: "Close",
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	// naive best-effort
	function ext(name: string): string {
		const _ext = name.split(".").at(-1) ?? "";
		return _ext ? `.${_ext}` : "";
	}

	function normalizeInput(input: string | AssetPreview): AssetPreviewNormalized | null {
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
</script>

<script lang="ts">
	const clog = createClog("AssetsPreview", { color: "auto" });

	let { assets: _assets, t = t_default, classControls = "" }: Props = $props();

	let assets: AssetPreviewNormalized[] = $derived(
		(_assets ?? []).map(normalizeInput).filter(Boolean) as AssetPreviewNormalized[]
	);
	let previewIdx = $state<number>(0);
	let modal: Modal | undefined = $state();

	const TOP_BUTTON_CLS = "rounded bg-white hover:bg-neutral-200 p-1";

	$effect(() => {
		if (modal?.visibility().visible) {
			// perhaps we should have some upper limit here...
			const toPreload = (assets ?? [])
				.map((asset) => (asset.isImage ? String(asset.url.full) : ""))
				.filter(Boolean);

			clog.debug("going to (maybe) preload", toPreload);
			preloadImgs(toPreload);
		}
	});

	export function open() {
		modal?.open();
	}

	export function close() {
		modal?.close();
	}

	export function visibility() {
		return (
			modal?.visibility() ?? {
				get visible() {
					return false;
				},
			}
		);
	}

	export function setOpener(opener?: null | HTMLElement) {
		modal?.setOpener(opener);
	}

	function preview_previous() {
		previewIdx = (previewIdx - 1 + assets.length) % assets.length;
	}

	function preview_next() {
		previewIdx = (previewIdx + 1) % assets.length;
	}

	// $inspect(assets).with(clog);
</script>

<!-- this must be on window as we're catching any typing anywhere -->
<svelte:window
	onkeydown={(e) => {
		if (modal?.visibility().visible) {
			if (["ArrowRight"].includes(e.key)) {
				preview_next();
			} else if (["ArrowLeft"].includes(e.key)) {
				preview_previous();
			}
		}
	}}
/>

{#if assets.length}
	<Modal
		bind:this={modal}
		onEscape={modal?.close}
		classBackdrop="p-4 md:p-4"
		classInner="max-w-full h-full"
		class="max-h-full md:max-h-full"
		classMain="flex items-center justify-center relative stuic-assets-preview stuic-assets-preview-open"
	>
		{@const previewAsset = assets?.[previewIdx]}
		{#if previewAsset}
			<!-- <pre>{JSON.stringify(previewAsset)}</pre> -->
			{#if previewAsset.isImage}
				<img
					src={String(previewAsset.url.full)}
					class="w-full h-full object-scale-down"
					alt={previewAsset?.name}
				/>
			{:else}
				<div>
					<div>
						{@html getAssetIcon(previewAsset.ext)({
							size: 32,
							class: "mx-auto",
						})}
					</div>
					<div class="opacity-50 mt-4 text-sm">{t("unable_to_preview")}</div>
				</div>
			{/if}

			{#if assets?.length > 1}
				<div class={["absolute inset-0 flex items-center justify-between"]}>
					<button
						class={twMerge("p-4", classControls)}
						onclick={preview_previous}
						type="button"
					>
						<span class="bg-white rounded-full p-3 block">
							{@html iconPrevious()}
						</span>
					</button>

					<button
						class={twMerge("p-4", classControls)}
						onclick={preview_next}
						type="button"
					>
						<span class="bg-white rounded-full p-3 block">
							{@html iconNext()}
						</span>
					</button>
				</div>
			{/if}

			<div class="absolute top-4 right-4 flex items-center space-x-3">
				<button
					class={twMerge(TOP_BUTTON_CLS, classControls)}
					type="button"
					onclick={(e) => {
						e.preventDefault();
						forceDownload(String(previewAsset.url.original), previewAsset?.name || "");
					}}
					aria-label={t("download")}
					use:tooltip
				>
					{@html iconDownload({ class: "size-6" })}
				</button>

				<button
					class={twMerge(TOP_BUTTON_CLS, classControls)}
					onclick={modal?.close}
					aria-label={t("close")}
					type="button"
					use:tooltip
				>
					<X />
				</button>
			</div>

			{#if previewAsset?.name}
				<span class="absolute top-4 left-4 bg-white px-1 text-sm rounded">
					{previewAsset?.name}
				</span>
			{/if}
		{/if}
	</Modal>
{/if}
