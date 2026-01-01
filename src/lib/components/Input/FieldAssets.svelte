<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
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
	import { onDestroy, type Snippet } from "svelte";
	import { fileDropzone } from "../../actions/file-dropzone.svelte.js";
	import { highlightDragover } from "../../actions/highlight-dragover.svelte.js";
	import { createValidationResult, tooltip } from "../../actions/index.js";
	import {
		type ValidateOptions,
		type ValidationResult,
		validate as validateAction,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import { forceDownload } from "../../utils/force-download.js";
	import { getFileTypeLabel } from "../../utils/get-file-type-label.js";
	import { getId } from "../../utils/get-id.js";
	import { isImage } from "../../utils/is-image.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { preloadImgs } from "../../utils/preload-img.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Circle from "../Circle/Circle.svelte";
	import { Modal } from "../Modal/index.js";
	import { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import SpinnerCircle from "../Spinner/SpinnerCircle.svelte";
	import { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";
	import { X } from "../X/index.js";
	import InputWrap from "./_internal/InputWrap.svelte";

	const clog = createClog("FieldAssets");

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			field_req_att: "This field requires attention. Please review and try again.",
			cardinality_reached: "Upload limit of {{max}} files reached",
			unable_to_preview: "This file cannot be previewed",
			delete: "Delete",
			deleted: "{{name}} deleted",
			close: "Close preview window",
			download: "Download original",
			invalid_type: 'Some of the files are not supported. Allowed are only "{{accept}}".',
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	export type FieldAssetUrlObj = {
		// used in non-modal preview
		thumb: string;
		// used in modal preview
		full: string;
		// (potentially high res) used for download
		original?: string;
	};

	export interface FieldAsset {
		id: string;
		url: string | FieldAssetUrlObj;
		name: string;
		type: string;
		meta?: Record<string, any>;
		_raw?: Record<string, any>;
	}

	export interface FieldAssetWithBlobUrl extends FieldAsset {
		blobUrl: string;
	}

	function is_accepted_type(allowedAccept?: string, type?: string) {
		// on empty allow
		if (!allowedAccept || !type) return true;

		// normalize allowed (eg "images/*, video/mpg")
		const allowed = (allowedAccept ?? "")
			.split(",")
			.map((v) => `${v || ""}`.trim().toLowerCase())
			.map((v) => {
				if (v.includes("*")) {
					v = v.slice(0, v.indexOf("*"));
				}
				return v;
			})
			.filter(Boolean);

		if (!allowed.length) return true;

		return allowed.some((a) => type.toLowerCase().startsWith(a));
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

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
		value: string;
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		name: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		classOption?: string;
		classOptionActive?: string;
		classOptgroup?: string;
		classModalField?: string;
		noScrollLock?: boolean;
		style?: string;
		t?: TranslateFn;
		parseValue?: (strigifiedModels: string) => FieldAsset[];
		serializeValue?: (assets: FieldAsset[]) => string;
		notifications?: NotificationsStack;
		cardinality?: number;
		accept?: string;
		processAssets?: (
			assets: FieldAsset[],
			onProgress?: (blobUrl: string, progress: number) => any
		) => Promise<FieldAssetWithBlobUrl[]>;
		withOnProgress?: boolean;
		classControls?: string;
		isLoading?: boolean;
	}
</script>

<script lang="ts">
	let {
		value = $bindable(), //
		label = "",
		id = getId(),
		type = "text",
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
		useTrim = true,
		//
		required = false,
		disabled = false,
		//
		validate,
		//
		labelAfter,
		below,
		//
		labelLeft,
		labelLeftWidth,
		labelLeftBreakpoint,
		//
		classInput,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classDescBox,
		classBelowBox,
		//
		classOption,
		classOptionActive,
		classOptgroup,
		//
		style,
		//
		classModalField,
		noScrollLock = false,
		t = t_default,
		//
		renderValue,
		// getOptions,
		notifications,
		cardinality: _cardinality = Infinity,

		name,
		// itemIdPropName = "id",
		accept,
		// onChange,
		processAssets,
		withOnProgress,
		classControls = "",
		isLoading = false,
		parseValue = (strigifiedModels: string) => {
			const val = strigifiedModels ?? "[]";
			try {
				return JSON.parse(val);
			} catch (e) {
				clog.error(e);
				return [];
			}
		},
		serializeValue = JSON.stringify,
		// ...rest
	}: Props = $props();

	// let innerValue = $state("");
	let isUploading = $state(false);
	let cardinality = $derived(_cardinality === -1 ? Infinity : _cardinality);
	let isMultiple = $derived(cardinality > 1);
	let parentHiddenInputEl: HTMLInputElement | undefined = $state();
	let hasLabel = $derived(isTHCNotEmpty(label) || typeof label === "function");
	let inputEl = $state<HTMLInputElement>()!;
	let modal: Modal = $state()!;
	let previewIdx = $state<number>(-1);

	let assets: FieldAsset[] = $derived(parseValue(value));
	// $inspect("assets", assets);

	// { blobUrl: number } map to be optionally shown as upload progress when uploading new asset
	// otherwise normal spinner will be shown
	let progress = $state<Record<string, number>>({});
	const onProgress = (id: string, value: number) => (progress[id] = Math.round(value));
	$inspect("progress", progress);

	$effect(() => {
		if (!assets?.length) modal?.close?.();
	});

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	//
	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator(value: any, context: Record<string, any> | undefined, el: any) {
			// Return actual translated messages (not reason names) because hidden inputs
			// don't support el.validationMessage - the validate action preserves our
			// return value and uses it directly as the error message.

			if (required && !assets.length) return t("field_req_att");
			if (assets.length > cardinality)
				return t("cardinality_reached", { max: cardinality });

			// normally, with other fieldtypes, we would continue with provided validator:
			// return (validate as any)?.customValidator?.(value, context, el) || "";
			// but not here, we just warn
			if ((validate as any)?.customValidator) {
				console.warn("Custom validator was provided, but is ignored in <FieldAssets />");
			}
			return "";
		},
		setValidationResult,
	});

	//
	let objectFitStyle = $state("object-cover");
	let objectSize = $state("size-20");

	function asset_urls(asset: FieldAsset): FieldAssetUrlObj {
		if (typeof asset.url === "string") {
			return { thumb: asset.url, full: asset.url, original: asset.url };
		}
		return asset.url;
	}

	function remove_by_idx(idx: number) {
		const name = assets[idx].name!;
		assets.splice(idx, 1);
		value = serializeValue(assets);
		notifications?.info(t("deleted", { name }));
	}

	function preview_previous() {
		previewIdx = (previewIdx - 1 + assets.length) % assets.length;
	}

	function preview_next() {
		previewIdx = (previewIdx + 1) % assets.length;
	}

	const TOP_BUTTON_CLS = "rounded bg-white hover:bg-neutral-200 p-1";

	onDestroy(() => {
		try {
			assets.forEach((a) => {
				Object.entries(a.url).forEach(([_k, url]) => {
					// memory cleanup (not sure if really needed as browser should
					// know we're loosing reference and should garbage collect by itself)
					if (url.startsWith("blob:")) URL.revokeObjectURL(url);
				});
			});
		} catch (e) {
			clog.warn(`${e}`);
		}
	});

	// cosmetic side effect - once the modal is open we want to preload all "full" resolutions
	// so the navigation feels more instant
	$effect(() => {
		if (modal.visibility().visible) {
			// perhaps we should have some upper limit here...
			const toPreload = (assets ?? [])
				.map((asset) => {
					const url = asset_urls(asset);
					return isImage(asset.type ?? url.full) && !url.full.startsWith("blob:")
						? url.full
						: "";
				})
				.filter(Boolean);

			clog.debug("going to (maybe) preload", toPreload);
			preloadImgs(toPreload);
		}
	});
</script>

<!-- this must be on window as we're catching any typing anywhere -->
<svelte:window
	onkeydown={(e) => {
		if (modal.visibility().visible) {
			if (["ArrowRight"].includes(e.key)) {
				preview_next();
			} else if (["ArrowLeft"].includes(e.key)) {
				preview_previous();
			}
		}
	}}
/>

{#snippet default_render()}
	{#if isLoading}
		<div class="p-2 pl-8 flex items-center justify-center min-h-24">
			<SpinnerCircle />
		</div>
	{:else}
		<div class={["p-2 flex items-center gap-0.5 flex-wrap"]}>
			{#each assets as asset, idx}
				{@const { thumb, full, original } = asset_urls(asset)}
				{@const _is_img = isImage(asset.type ?? thumb)}
				<div class="relative group">
					<button
						class={[objectSize, "bg-black/10 grid place-content-center", classControls]}
						onclick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							previewIdx = idx;
							modal.open();
						}}
						type="button"
					>
						{#if _is_img}
							<img
								src={thumb}
								alt={asset.name}
								class={[objectSize, objectFitStyle, "hover:saturate-150"]}
							/>
						{:else}
							{@html getAssetIcon((asset.name ?? "").split(".").at(-1))({
								size: 32,
								class: "mx-auto",
							})}
						{/if}
						<span
							class="absolute bottom-1 left-1 right-1 grid bg-white/50 rounded"
							use:tooltip={() => ({ content: asset.name })}
						>
							<span class="truncate px-2 text-xs">{asset.name}</span>
						</span>

						{#if asset.meta?.isUploading}
							<span
								class="absolute inset-0 grid place-content-center pointer-events-none text-white"
							>
								{#if withOnProgress}
									<Circle
										class="text-white"
										animateCompletenessMs={300}
										bgStrokeColor="rgba(0 0 0 / 0.2)"
										completeness={progress[asset.id] / 100}
										rotate={-90}
									/>
								{:else}
									<SpinnerCircle bgStrokeColor="gray" />
								{/if}
							</span>
						{/if}
					</button>
				</div>
			{/each}
			<button
				type="button"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					inputEl.click();
				}}
				class={[objectSize, " grid place-content-center group", classControls]}
			>
				{@html iconAdd({ size: 32, class: "opacity-75 group-hover:opacity-100" })}
			</button>
		</div>
	{/if}
{/snippet}

<div
	class="w-full stuic-field-assets"
	use:highlightDragover={() => ({
		enabled: typeof processAssets === "function",
		classes: ["outline-dashed outline-2 outline-neutral-300"],
	})}
	use:fileDropzone={() => ({
		enabled: typeof processAssets === "function",
		inputEl,
		processFiles(files: FileList | null, wasDrop?: boolean) {
			clog.debug(`processFiles`, wasDrop ? "[DROPPED]" : "", files);

			if (accept && [...(files ?? [])].some((f) => !is_accepted_type(accept, f.type))) {
				const msg = t("invalid_type", { accept });
				if (notifications) notifications.error(msg);
				else alert(msg);
				return;
			}

			const cardErrMsg = t("cardinality_reached", { max: cardinality });
			if (assets.length > cardinality) {
				// if (assets.length + (files?.length ?? 0) > cardinality) {
				if (notifications) notifications.error(cardErrMsg);
				else alert(cardErrMsg);
				return;
			}

			const toBeProcessed: FieldAsset[] = [];

			for (const file of files ?? []) {
				if (assets.length > cardinality) {
					notifications ? notifications.error(cardErrMsg) : alert(cardErrMsg);
					break;
				}

				// this create a unique blob url, which we'll use as id as well
				const url = URL.createObjectURL(file);
				const asset: FieldAsset = {
					id: url,
					url: { thumb: url, full: url, original: url },
					type: file.type,
					name: file.name,
					meta: { isUploading: true },
				};

				// ASAP optimistic UI update
				assets.push(asset);

				// prepare data for server upload
				toBeProcessed.push(asset);
			}
			value = serializeValue(assets);

			if (typeof processAssets === "function") {
				isUploading = true;
				processAssets(toBeProcessed, onProgress)
					.then((uploaded: FieldAssetWithBlobUrl[]) => {
						// clog("uploaded", uploaded);
						for (const ass of uploaded ?? []) {
							ass.meta ??= {};
							ass.meta.isUploading = false;
							if (ass.blobUrl) {
								const idx = assets.findIndex((a) => a.id === ass.blobUrl);
								if (idx > -1) {
									ass.meta ??= {};
									ass.meta.isUploading = false;
									assets[idx] = ass;
								} else {
									clog.error(`Asset idx ${idx} not found?!?`, ass);
								}
							} else {
								clog.warn(`Missing blobUrl in`, ass);
							}
						}
						value = serializeValue(assets);
					})
					.catch((e) => notifications?.error(`${e}`))
					.finally(() => (isUploading = false));
			}
		},
		allowClick: !assets?.length,
	})}
>
	<InputWrap
		{description}
		class={twMerge("m-0", classProp)}
		size={renderSize}
		{id}
		{label}
		{labelAfter}
		{below}
		{required}
		{disabled}
		{labelLeft}
		{labelLeftWidth}
		{labelLeftBreakpoint}
		{classLabel}
		{classLabelBox}
		{classInputBox}
		{classInputBoxWrap}
		{classDescBox}
		{classBelowBox}
		{validation}
		{style}
	>
		{@render default_render()}
	</InputWrap>
</div>

<input type="file" bind:this={inputEl} multiple style="display: none" {accept} />
<!-- hack to be able to validate the conventional way -->
<input type="hidden" {name} {value} use:validateAction={() => wrappedValidate} />

<Modal
	bind:this={modal}
	onEscape={modal?.close}
	classBackdrop="p-4 md:p-4"
	classInner="max-w-full h-full"
	class="max-h-full md:max-h-full"
	classMain="flex items-center justify-center relative stuic-field-assets stuic-field-assets-open"
>
	{@const previewAsset = assets?.[previewIdx]}
	{#if previewAsset}
		{@const url = asset_urls(previewAsset!)}
		{@const _is_img = isImage(previewAsset!.type ?? url.thumb)}
		{#if _is_img}
			<img
				src={url.full}
				class="w-full h-full object-scale-down"
				alt={previewAsset?.name}
			/>
		{:else}
			<div>
				<div>
					{@html getAssetIcon((previewAsset?.name ?? "").split(".").at(-1))({
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

		<!--  bg-white rounded-md p-2 -->
		<div class="absolute top-4 right-4 flex items-center space-x-3">
			<button
				class={twMerge(TOP_BUTTON_CLS, classControls)}
				onclick={(e) => {
					e.preventDefault();
					remove_by_idx(previewIdx);
					previewIdx = previewIdx % assets.length; // important
				}}
				type="button"
				aria-label={t("delete")}
				use:tooltip
			>
				{@html iconDelete({ class: "size-6" })}
			</button>
			<button
				class={twMerge(TOP_BUTTON_CLS, classControls)}
				type="button"
				onclick={(e) => {
					e.preventDefault();
					forceDownload(url.original ?? url.full, previewAsset?.name || "");
				}}
				aria-label={t("download")}
				use:tooltip
			>
				{@html iconDownload({ class: "size-6" })}
			</button>
			<button
				class={twMerge(TOP_BUTTON_CLS, classControls)}
				onclick={modal.close}
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
