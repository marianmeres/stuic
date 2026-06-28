<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
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
		iconPlus as iconAdd,
		iconChevronLeft,
		iconChevronRight,
	} from "$lib/icons/index.js";
	import { onDestroy, tick, type Snippet } from "svelte";
	import { fileDropzone } from "../../actions/file-dropzone.svelte.js";
	import { highlightDragover } from "../../actions/highlight-dragover.svelte.js";
	import { tooltip } from "../../actions/index.js";
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import { getFileTypeLabel } from "../../utils/get-file-type-label.js";
	import { getId } from "../../utils/get-id.js";
	import { isImage } from "../../utils/is-image.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { AssetsPreview } from "../AssetsPreview/index.js";
	import Circle from "../Circle/Circle.svelte";
	import { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import SpinnerCircleOscillate from "../Spinner/SpinnerCircleOscillate.svelte";
	import { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";
	import type { InputWrapClassProps } from "./types.js";
	import Button from "../Button/Button.svelte";

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
			move_prev: "Move earlier",
			move_next: "Move later",
			moved_prev: "Moved {{name}} earlier",
			moved_next: "Moved {{name}} later",
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

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
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
		/** Classes for the hidden <input> element */
		classInput?: string;
		classOption?: string;
		classOptionActive?: string;
		classOptgroup?: string;
		classModalField?: string;
		noScrollLock?: boolean;
		style?: string;
		t?: TranslateFn;
		parseValue?: (strigifiedModels: string) => FieldAsset[];
		serializeValue?: (assets: FieldAsset[]) => string;
		/**
		 * See AssetsPreview.onDownload. When provided, the preview's Download button calls
		 * this instead of `forceDownload(asset.url.original)` — for auth-gated bytes or
		 * lazy fetching. Receives the full `FieldAsset` (incl. `_raw`) for the clicked
		 * asset + its index. May be async; the button shows a busy state while it settles.
		 */
		onDownload?: (asset: FieldAsset, index: number) => void | Promise<void>;
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
		/**
		 * Opt-in: when true, each asset tile in the grid gets "Move earlier" / "Move later"
		 * controls (shown on hover/focus) so the user can manually reorder the assets. The
		 * chosen order is serialized to `value`. Buttons only, no drag (the field's drag is
		 * reserved for file drops); full keyboard + aria-live announcements. Default `false`.
		 */
		ordered?: boolean;
		//
		classWrap?: string;
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
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
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
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
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
		ordered = false,
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
		onDownload,
		classWrap = "",
		// ...rest
	}: Props = $props();

	// let innerValue = $state("");
	let isUploading = $state(false);
	let cardinality = $derived(_cardinality === -1 ? Infinity : _cardinality);
	let isMultiple = $derived(cardinality > 1);
	// reordering ("ordered") is opt-in and only meaningful with more than one asset
	let canArrange = $derived(ordered && isMultiple);
	// aria-live announcement text for reorder actions
	let liveAnnouncement = $state("");
	let parentHiddenInputEl: HTMLInputElement | undefined = $state();
	let hasLabel = $derived(isTHCNotEmpty(label) || typeof label === "function");
	let inputEl = $state<HTMLInputElement>()!;
	// Outer wrapper for scrollIntoView and focus targeting.
	let wrapEl: HTMLDivElement | undefined = $state();
	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let assetsPreview: AssetsPreview = $state()!;

	let assets: FieldAsset[] = $derived(parseValue(value));
	// $inspect("assets", assets);

	// { blobUrl: number } map to be optionally shown as upload progress when uploading new asset
	// otherwise normal spinner will be shown
	let progress = $state<Record<string, number>>({});
	const onProgress = (id: string, value: number) => (progress[id] = Math.round(value));
	// $inspect("progress", progress);

	$effect(() => {
		if (!assets?.length) assetsPreview?.close?.();
	});

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let _doValidate: (() => void) | undefined = $state();

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		return validation;
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		validation = undefined;
		hiddenInputEl?.setCustomValidity?.("");
	}

	/** Current validation state, or undefined if validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}

	/**
	 * Focus the visible dropzone wrapper. The hidden file/validation inputs
	 * cannot be focused directly.
	 */
	export function focus(): void {
		wrapEl?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		wrapEl?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}

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
			if ((validateProp as any)?.customValidator) {
				console.warn("Custom validator was provided, but is ignored in <FieldAssets />");
			}
			return "";
		},
		setValidationResult,
		setDoValidate: (fn: () => void) => (_doValidate = fn),
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

	// re-focus the same logical move button on the tile that moved, so repeated presses keep
	// walking the item; if that button is now disabled (a boundary), fall back to the enabled one.
	// We target by the NEW index (querySelectorAll DOM order == array order) to avoid escaping
	// blob/url ids into a CSS attribute selector.
	function focusMovedButton(to: number, which: "prev" | "next") {
		tick().then(() => {
			const tile = wrapEl?.querySelectorAll<HTMLElement>("[data-asset-tile]")[to];
			if (!tile) return;
			let btn = tile.querySelector<HTMLButtonElement>(`[data-arrange-btn="${which}"]`);
			if (!btn || btn.disabled) {
				btn =
					tile.querySelector<HTMLButtonElement>(
						`[data-arrange-btn="prev"]:not([disabled])`
					) ||
					tile.querySelector<HTMLButtonElement>(
						`[data-arrange-btn="next"]:not([disabled])`
					);
			}
			btn?.focus();
		});
	}

	// Reorder by moving the asset at `from` to `to`. Splices a copy and re-serializes (same
	// value-driven pattern as remove_by_idx). Safe mid-upload: processAssets reconciles the
	// resolved asset by blob-url id (findIndex), never by array position.
	function move(from: number, to: number) {
		if (to < 0 || to >= assets.length || from === to) return;
		const next = [...assets];
		const [item] = next.splice(from, 1);
		if (!item) return;
		next.splice(to, 0, item);
		value = serializeValue(next);
		liveAnnouncement = t(to < from ? "moved_prev" : "moved_next", {
			name: item.name,
		}) as string;
		focusMovedButton(to, to < from ? "prev" : "next");
	}

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

{#snippet default_render()}
	{#if isLoading}
		<div class="p-2 pl-8 flex items-center justify-center min-h-24">
			<SpinnerCircleOscillate />
		</div>
	{:else}
		{#if canArrange}
			<!-- screen-reader announcements for reorder actions -->
			<div class="sr-only" aria-live="polite" aria-atomic="true">{liveAnnouncement}</div>
		{/if}
		<div class={["p-2 flex items-center gap-0.5 flex-wrap"]}>
			{#each assets as asset, idx (asset.id)}
				{@const { thumb, full, original } = asset_urls(asset)}
				{@const _is_img = isImage(asset.type ?? thumb)}
				<div class="relative group" data-asset-tile>
					<button
						class={[objectSize, "bg-black/10 grid place-content-center", classControls]}
						onclick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							assetsPreview.open(idx);
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
							class="absolute bottom-1 left-1 right-1 grid bg-black/60 text-white rounded"
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
									<SpinnerCircleOscillate bgStrokeColor="gray" />
								{/if}
							</span>
						{/if}
					</button>

					{#if canArrange && assets.length > 1}
						<!-- Reorder controls (sibling of the thumbnail <button>, never nested — that
						would be invalid HTML). Hidden until the tile is hovered/focused; pointer
						events are gated to hover/focus so an invisible control can't intercept a
						click meant for the thumbnail, while keyboard users can still Tab to them. -->
						<div
							class={[
								"absolute inset-x-0 top-0 flex items-start justify-between p-0.5",
								"opacity-0 transition-opacity pointer-events-none",
								"group-hover:opacity-100 focus-within:opacity-100",
							]}
						>
							<button
								type="button"
								data-arrange-btn="prev"
								disabled={idx === 0}
								aria-label={t("move_prev")}
								use:tooltip={() => ({ content: t("move_prev") })}
								class={[
									"grid place-content-center rounded p-0.5 bg-black/60 text-white hover:bg-black/80",
									"pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto",
									"disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/60",
								]}
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									move(idx, idx - 1);
								}}
							>
								{@html iconChevronLeft({ size: 16 })}
							</button>
							<button
								type="button"
								data-arrange-btn="next"
								disabled={idx === assets.length - 1}
								aria-label={t("move_next")}
								use:tooltip={() => ({ content: t("move_next") })}
								class={[
									"grid place-content-center rounded p-0.5 bg-black/60 text-white hover:bg-black/80",
									"pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto",
									"disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/60",
								]}
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									move(idx, idx + 1);
								}}
							>
								{@html iconChevronRight({ size: 16 })}
							</button>
						</div>
					{/if}
				</div>
			{/each}
			<Button
				type="button"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					inputEl.click();
				}}
				class={["m-4", classControls].join(" ")}
				iconButton
				variant="ghost"
			>
				{@html iconAdd({ size: 24 })}
			</Button>
		</div>
	{/if}
{/snippet}

<div
	class={twMerge("w-full stuic-field-assets mb-8", classWrap)}
	bind:this={wrapEl}
	tabindex="-1"
	use:highlightDragover={() => ({
		enabled: typeof processAssets === "function",
		classes: ["outline-dashed outline-2 outline-(--stuic-color-border)"],
	})}
	use:fileDropzone={() => ({
		enabled: typeof processAssets === "function",
		inputEl,
		processFiles(files: FileList | null, wasDrop?: boolean) {
			clog.debug(`processFiles`, wasDrop ? "[DROPPED]" : "", files);

			// Copy the File objects into a stable array, then IMMEDIATELY release the
			// hidden <input type="file">'s retained FileList. A native file input
			// keeps its FileList after a selection until it is reset (form reset or
			// `value = ""`), and its `change` event (wired by the `fileDropzone`
			// action) calls back into this handler. Without this reset, any later
			// stray `change` re-runs processFiles with the SAME file still in
			// `inputEl.files`, pushing a duplicate optimistic asset and firing a real
			// re-upload. `onSubmitValidityCheck` used to dispatch exactly such a
			// synthetic `change` on submit (now fixed there too — belt and braces).
			// Clearing also restores the ability to re-select the same file twice in
			// a row (an unchanged value emits no `change`). The blob URLs we create
			// below are independent of the input, so clearing here is safe.
			const incoming = [...(files ?? [])];
			if (inputEl) inputEl.value = "";

			// Nothing to consume — a cancelled picker, or a stray/synthetic `change`
			// on an already-cleared input. Bail before touching state or calling
			// processAssets (which would otherwise run with an empty batch).
			if (!incoming.length) return;

			if (accept && incoming.some((f) => !is_accepted_type(accept, f.type))) {
				const msg = t("invalid_type", { accept });
				if (notifications) notifications.error(msg);
				else alert(msg);
				return;
			}

			const cardErrMsg = t("cardinality_reached", { max: cardinality });
			// `>=` (not `>`): refuse the moment the field already holds `cardinality`
			// assets, instead of optimistically adding one past the limit and relying
			// on the validator to reject it afterwards (the off-by-one that made the
			// single-cardinality symptom loud).
			if (assets.length >= cardinality) {
				if (notifications) notifications.error(cardErrMsg);
				else alert(cardErrMsg);
				return;
			}

			const toBeProcessed: FieldAsset[] = [];

			for (const file of incoming) {
				if (assets.length >= cardinality) {
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
		{classInputBoxWrapInvalid}
		{classDescBox}
		{classDescBoxToggle}
		{classBelowBox}
		{classValidationBox}
		{validation}
		{style}
	>
		{@render default_render()}
	</InputWrap>
</div>

<input type="file" bind:this={inputEl} multiple style="display: none" {accept} />
<!-- hack to be able to validate the conventional way -->
<input
	type="hidden"
	{name}
	{value}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>

<AssetsPreview
	bind:this={assetsPreview}
	assets={assets.map((a) => {
		const urls = asset_urls(a);
		return {
			url: {
				thumb: urls.thumb,
				full: urls.full,
				original: urls.original ?? urls.full,
			},
			name: a.name,
			type: a.type,
		};
	})}
	{t}
	{classControls}
	onDelete={(_, index) => {
		remove_by_idx(index);
	}}
	onDownload={onDownload
		? (_previewAsset, idx) => onDownload(assets[idx], idx)
		: undefined}
/>
