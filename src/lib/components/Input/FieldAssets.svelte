<script lang="ts" module>
	import { asset } from "$app/paths";
	import { createClog } from "@marianmeres/clog";
	import { iconFeatherArrowLeft as iconPrevious } from "@marianmeres/icons-fns/feather/iconFeatherArrowLeft.js";
	import { iconFeatherArrowRight as iconNext } from "@marianmeres/icons-fns/feather/iconFeatherArrowRight.js";
	import { iconFeatherDownload as iconDownload } from "@marianmeres/icons-fns/feather/iconFeatherDownload.js";
	import { iconFeatherFile as iconFile } from "@marianmeres/icons-fns/feather/iconFeatherFile.js";
	import { iconFeatherPlus as iconAdd } from "@marianmeres/icons-fns/feather/iconFeatherPlus.js";
	import { iconFeatherTrash2 as iconDelete } from "@marianmeres/icons-fns/feather/iconFeatherTrash2.js";
	import { onDestroy, type Snippet } from "svelte";
	import { fileDropzone } from "../../actions/file-dropzone.svelte.js";
	import { highlightDragover } from "../../actions/highlight-dragover.svelte.js";
	import { tooltip } from "../../actions/index.js";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import { fileFromBlobUrl } from "../../utils/file-from-bloburl.js";
	import { forceDownload } from "../../utils/force-download.js";
	import { getId } from "../../utils/get-id.js";
	import { isImage } from "../../utils/is-image.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { Modal } from "../Modal/index.js";
	import { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import { Spinner } from "../Spinner/index.js";
	import { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";
	import { X } from "../X/index.js";
	import InputWrap from "./_internal/InputWrap.svelte";
	import SpinnerCircle from "../Spinner/SpinnerCircle.svelte";
	import Circle from "../Circle/Circle.svelte";

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
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	export type AssetUrlObj = {
		// used in non-modal preview
		thumb: string;
		// used in modal preview
		full: string;
		// (potentially high res) used for download
		original?: string;
	};

	export interface Asset {
		id: string;
		url: string | AssetUrlObj;
		name: string;
		type: string;
		meta?: Record<string, any>;
	}

	export interface AssetWithBlobUrl extends Asset {
		blobUrl: string;
	}

	function parseFieldValue(val: string) {
		try {
			return JSON.parse(val);
		} catch (e) {
			clog.error(e);
			return [];
		}
	}
</script>

<script lang="ts">
	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props extends Record<string, any> {
		value: string;
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		name: string;
		tabindex?: number; // tooShort
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		//
		required?: boolean;
		disabled?: boolean;
		//
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		// wrap snippets
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		//
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		//
		classOption?: string;
		classOptionActive?: string;
		classOptgroup?: string;
		//
		classModalField?: string;
		noScrollLock?: boolean;
		//
		style?: string;
		t?: TranslateFn;
		//
		renderValue?: (strigifiedItems: string) => string;
		// getOptions: (
		// 	q: string,
		// 	current: Item[]
		// ) => Promise<{ coll?: ItemCollection<Item>; found: Item[] }>;
		notifications?: NotificationsStack;
		// -1 no limit
		// +n max selected limit
		cardinality?: number;
		// renderOptionLabel?: (item: Item) => string;
		// renderOptionGroup?: (s: string) => string;
		// whether to allow adding unknown options
		// allowUnknown?: boolean;
		// showIconsCheckbox?: boolean;
		// showIconsRadio?: boolean;
		// searchPlaceholder?: string;
		// itemIdPropName?: string;
		// for custom stuff...
		onChange?: (value: string) => void;
		/**
		 * this does not accept the raw FileList but already preprocessed list of assets.
		 */
		processAssets?: (
			assets: Asset[],
			onProgress?: (blobUrl: string, progress: number) => any
		) => Promise<AssetWithBlobUrl[]>;
		// should we display onProgress?
		withOnProgress?: boolean;
	}

	let {
		trigger,
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
		// renderOptionLabel,
		// renderOptionGroup = (s: string) => `${s}`.replaceAll("_", " "),
		// allowUnknown = false,
		// showIconsCheckbox = true,
		// showIconsRadio = false,
		// searchPlaceholder,
		name,
		// itemIdPropName = "id",
		onChange,
		processAssets,
		withOnProgress,
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

	let assets: Asset[] = $derived(parseFieldValue(value));
	// $inspect("assets", assets);

	// { blobUrl: number } map to be optionally shown as upload progress when uploading new asset
	// otherwise normal spinner will be shown
	let progress = $state<Record<string, number>>({});
	const onProgress = (id: string, value: number) => (progress[id] = value);
	// $inspect("progress", progress);

	$effect(() => {
		if (!assets.length) modal?.close?.();
	});

	//
	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator(value: any, context: Record<string, any> | undefined, el: any) {
			return "";
			// NOTE: the below error message code will be ignored, so it's just cosmetics.
			// This, built-in JSON array validator cannot be bypassed. Strictly expecting array.
			// let selected = [];
			// try {
			// 	selected = JSON.parse(value);
			// 	if (!Array.isArray(selected)) return "typeMismatch";
			// } catch (e) {
			// 	return "typeMismatch";
			// }
			// // cardinality check
			// if (selected.length > cardinality) return "rangeOverflow";

			// // continue with provided validator
			// return (validate as any)?.customValidator?.(value, context, el) || "";
		},
		t(reason: keyof ValidityStateFlags, value: any, fallback: string) {
			// Unfortunately, for hidden, everything is a `customError` reason. So, we must generalize...
			return t("field_req_att");
		},
	});

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	//
	let objectFitStyle = $state("object-cover");
	let objectSize = $state("size-20");

	function asset_urls(asset: Asset): AssetUrlObj {
		if (typeof asset.url === "string") {
			return { thumb: asset.url, full: asset.url, original: asset.url };
		}
		return asset.url;
	}

	function remove_by_idx(idx: number) {
		let parsed: Asset[] = parseFieldValue(value);
		const name = parsed[idx].name!;
		parsed.splice(idx, 1);
		value = JSON.stringify(parsed);
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
	<div class={["p-2 flex items-center gap-0.5 flex-wrap"]}>
		{#each assets as asset, idx}
			{@const { thumb, full, original } = asset_urls(asset)}
			{@const _is_img = isImage(asset.type ?? thumb)}
			<div class="relative group">
				<button
					class={[objectSize, "bg-black/10 grid place-content-center"]}
					onclick={(e) => {
						e.stopPropagation();
						previewIdx = idx;
						modal.open();
					}}
				>
					{#if _is_img}
						<img
							src={thumb}
							alt={asset.name}
							class={[objectSize, objectFitStyle, "hover:saturate-150"]}
						/>
					{:else}
						{@html iconFile({ size: 32, class: "mx-auto" })}
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
			onclick={(e) => {
				e.stopPropagation();
				inputEl.click();
			}}
			class={[objectSize, " grid place-content-center group"]}
		>
			{@html iconAdd({ size: 32, class: "opacity-75 group-hover:opacity-100" })}
		</button>
	</div>
{/snippet}

<div
	class="w-full"
	use:highlightDragover={() => ({
		enabled: typeof processAssets === "function",
		classes: ["outline-dashed outline-2 outline-neutral-300"],
	})}
	use:fileDropzone={() => ({
		enabled: typeof processAssets === "function",
		inputEl,
		processFiles(files: FileList | null) {
			if (asset.length + (files?.length ?? 0) >= cardinality) {
				const msg = t("cardinality_reached", { max: cardinality });
				return notifications ? notifications.error(msg) : alert(msg);
			}

			const toBeProcessed: Asset[] = [];

			for (const file of files ?? []) {
				// this create a unique blob url, which we'll use as id as well
				const url = URL.createObjectURL(file);
				const asset: Asset = {
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
			value = JSON.stringify(assets);

			if (typeof processAssets === "function") {
				isUploading = true;
				processAssets(toBeProcessed, onProgress)
					.then((uploaded: AssetWithBlobUrl[]) => {
						for (const ass of uploaded) {
							if (ass.blobUrl) {
								const idx = assets.findIndex((a) => a.id === ass.blobUrl);
								console.log(assets, idx);
								if (idx > -1) {
									ass.meta ??= {};
									ass.meta.isUploading = false;
									assets[idx] = ass;
								} else {
									clog.error(`Asset idx ${idx} not found?!?`, ass);
								}
							} else {
								clog.error(`Missing blobUrl in`, asset);
							}
						}
						value = JSON.stringify(assets);
					})
					.catch((e) => notifications?.error(`${e}`))
					.finally(() => (isUploading = false));
			}
		},
		allowClick: !parseFieldValue(value)?.length,
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
		{#if typeof renderValue === "function"}
			{@html renderValue(parseFieldValue(value))}
		{:else}
			{@render default_render()}
		{/if}
	</InputWrap>
</div>

<input type="file" bind:this={inputEl} multiple style="display: none" />

<Modal
	bind:this={modal}
	onEscape={modal?.close}
	classBackdrop="p-4 md:p-4"
	classInner="max-w-full h-full"
	class="max-h-full md:max-h-full"
	classMain="flex items-center justify-center relative "
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
					{@html iconFile({ size: 64, class: "mx-auto" })}
				</div>
				<div class="opacity-50 mt-4 text-sm">{t("unable_to_preview")}</div>
			</div>
		{/if}

		{#if assets.length > 1}
			<div class={["absolute inset-0 flex items-center justify-between"]}>
				<button class="p-4 focus:outline-0" onclick={preview_previous}>
					<span class="bg-white rounded-full p-3 block">
						{@html iconPrevious()}
					</span>
				</button>

				<button class="p-4 focus:outline-0" onclick={preview_next}>
					<span class="bg-white rounded-full p-3 block">
						{@html iconNext()}
					</span>
				</button>
			</div>
		{/if}

		<!--  bg-white rounded-md p-2 -->
		<div class="absolute top-4 right-4 flex items-center space-x-3">
			<button
				class={TOP_BUTTON_CLS}
				onclick={() => {
					remove_by_idx(previewIdx);
					previewIdx = previewIdx % assets.length; // important
				}}
				aria-label={t("delete")}
				use:tooltip
			>
				{@html iconDelete({ class: "size-6" })}
			</button>
			<button
				class={TOP_BUTTON_CLS}
				onclick={() => forceDownload(url.original ?? url.full, previewAsset?.name || "")}
				aria-label={t("download")}
				use:tooltip
			>
				{@html iconDownload({ class: "size-6" })}
			</button>
			<button
				class={TOP_BUTTON_CLS}
				onclick={modal.close}
				aria-label={t("close")}
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
