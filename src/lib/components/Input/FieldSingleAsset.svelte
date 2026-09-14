<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
	import {
		iconImage,
		iconPlus,
		iconRefresh,
		iconUndo,
		iconX,
		iconZoomIn,
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
	import { getId } from "../../utils/get-id.js";
	import { isImage } from "../../utils/is-image.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { AssetsPreview, getAssetIcon } from "../AssetsPreview/index.js";
	import Circle from "../Circle/Circle.svelte";
	import { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import Skeleton from "../Skeleton/Skeleton.svelte";
	import SpinnerCircleOscillate from "../Spinner/SpinnerCircleOscillate.svelte";
	import Thc, { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";
	import { formatBytes, isAcceptedType } from "./_internal/asset-helpers.js";
	import {
		extractClipboardFiles,
		registerPasteTarget,
	} from "./_internal/paste-target.js";
	import type { FieldAsset, FieldAssetUrlObj } from "./FieldAssets.svelte";
	import { t_default } from "./field-single-asset-i18n.js";
	import type { InputWrapClassProps } from "./types.js";

	const clog = createClog("FieldSingleAsset");

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** What `processAsset` receives besides the optimistic (blob) asset. */
	export interface FieldSingleAssetUploadContext {
		/** The file to upload — already run through `transformFile`, if any. */
		file: File;
		/** Report upload progress (0–100). Rendered when `withOnProgress` is set. */
		onProgress: (progress: number) => void;
	}

	export type FieldSingleAssetShape = "square" | "circle" | "wide";
	export type FieldSingleAssetFit = "cover" | "contain";
	export type FieldSingleAssetSize = "sm" | "md" | "lg";

	/** `validateFile` verdict: a non-empty string rejects the file with that message. */
	export type FieldSingleAssetFileCheck = string | void | null | undefined | false;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		/**
		 * The serialized asset: by default the JSON of ONE `FieldAsset` object, or the
		 * empty string when the field is empty (see `parseValue` / `serializeValue`).
		 * Only ever rewritten when a user action SETTLES — an upload that resolves, a
		 * remove, an undo. An in-flight or failed upload never touches it.
		 */
		value: string;
		/** The hidden input's name (what the form submits). */
		name: string;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		/** Classes for the hidden `<input type="file">` */
		classInput?: string;
		/** Classes for the outermost wrapper (the drop zone) */
		classWrap?: string;
		/** Classes for the tile (the preview button) */
		classPreview?: string;
		/** Classes for the tile's action buttons (remove, preview, retry) */
		classControls?: string;
		style?: string;
		t?: TranslateFn;
		notifications?: NotificationsStack;
		/** Initial-fetch state: renders a skeleton in the tile's shape; takes no input. */
		isLoading?: boolean;
		/** `value` -> asset. Default: `JSON.parse`, `null` for an empty/invalid string. */
		parseValue?: (serialized: string) => FieldAsset | null;
		/** asset -> `value`. Default: `JSON.stringify`, `""` for `null`. */
		serializeValue?: (asset: FieldAsset | null) => string;
		/**
		 * The upload. Receives the optimistic asset (its `id` and every `url` are one
		 * blob URL of the file) and the file itself; resolves with the stored asset,
		 * which becomes the new `value`. A rejection keeps the previous `value`, shows
		 * an error state on the tile with Retry / Discard, and reports `notifications`
		 * (see `onUploadError` to take over that report).
		 * Without it the field is display-only (no picker, no drop, no paste).
		 */
		processAsset?: (
			asset: FieldAsset,
			ctx: FieldSingleAssetUploadContext
		) => Promise<FieldAsset>;
		/** Render a progress ring driven by `ctx.onProgress` instead of a spinner. */
		withOnProgress?: boolean;
		/**
		 * Called when `processAsset` rejects (with the raw rejection, so a status code or
		 * a custom error class is still inspectable), after the tile has entered its
		 * error state and before the default `notifications.error(...)` toast. Return
		 * `false` to skip that toast — for a rejection the page already renders its own
		 * way (a quota / plan-limit panel). The tile keeps Retry / Discard regardless.
		 */
		onUploadError?: (
			error: unknown,
			ctx: { asset: FieldAsset; file: File }
		) => void | boolean;
		/** Same tokens as the HTML `accept` attribute; also applied to drops and pastes. */
		accept?: string;
		/** Passed to the file input: on phones opens the camera directly. */
		capture?: "user" | "environment";
		/** Reject files larger than this many bytes (checked after `transformFile`). */
		maxSize?: number;
		/**
		 * Custom check, run after `transformFile` and `maxSize`. Return a non-empty
		 * string to reject the file with that message (may be async — e.g. read image
		 * dimensions first).
		 */
		validateFile?: (
			file: File
		) => FieldSingleAssetFileCheck | Promise<FieldSingleAssetFileCheck>;
		/**
		 * Pre-upload hook, run after the `accept` check: downscale a photo, or open a
		 * cropper and resolve with the cropped file. Resolving with `null`/`undefined`
		 * cancels silently (the user closed the cropper).
		 */
		transformFile?: (
			file: File
		) => File | null | undefined | Promise<File | null | undefined>;
		/**
		 * Return `false` (may be async) to keep the asset. While a returned promise is
		 * pending the tile is busy: the Remove control shows a spinner, the tile and
		 * its controls are inert, and a second Remove is a no-op — so the hook may do
		 * the actual server-side delete and resolve with whether it succeeded.
		 */
		onBeforeRemove?: (asset: FieldAsset) => boolean | Promise<boolean>;
		/** Return `false` (may be async) to keep the current asset instead of uploading `file`. */
		onBeforeReplace?: (current: FieldAsset, file: File) => boolean | Promise<boolean>;
		/**
		 * After a remove, an inline "Undo" stays available this many ms (the removed
		 * asset is only unlinked from `value`, never deleted anywhere, so undo is
		 * lossless). `0` disables it. Default `6000`.
		 */
		undoTtl?: number;
		/**
		 * Opt-in: accept a clipboard paste (Ctrl/Cmd-V). Same routing as `FieldAssets`
		 * (one shared document listener: focused field wins; a bare paste with no focus
		 * goes to the only pasteable field on the page). A paste replaces. No-op without
		 * `processAsset`.
		 */
		pasteable?: boolean;
		/** Tile shape. `circle` for avatars, `wide` (16:9) for banners / logos. Default `square`. */
		shape?: FieldSingleAssetShape;
		/** `cover` crops to fill, `contain` letterboxes on a neutral background (logos). Default `cover`. */
		fit?: FieldSingleAssetFit;
		/** Tile height: a preset (`5rem` / `8rem` / `12rem`) or any CSS length. Default `md`. */
		size?: FieldSingleAssetSize | string;
		/** What the empty tile shows instead of the default icon (e.g. an `Avatar` with initials). */
		placeholder?: THC;
		/** Hide the "Preview" action (the `AssetsPreview` lightbox). */
		noPreview?: boolean;
		/** Hide the lightbox's Download button. */
		noDownload?: boolean;
		/** See `AssetsPreview.onDownload`: replaces the default download of `url.original`. */
		onDownload?: (asset: FieldAsset) => void | Promise<void>;
		/** After every user-driven change of `value` (upload settled, remove, undo). */
		onChange?: (asset: FieldAsset | null) => void;
	}

	function default_parse(serialized: string): FieldAsset | null {
		const v = `${serialized ?? ""}`.trim();
		if (!v) return null;
		try {
			const o = JSON.parse(v);
			return isPlainObject(o) ? (o as FieldAsset) : null;
		} catch (e) {
			clog.error(e);
			return null;
		}
	}

	function default_serialize(asset: FieldAsset | null): string {
		return asset ? JSON.stringify(asset) : "";
	}

	function asset_urls(asset: FieldAsset): FieldAssetUrlObj {
		if (typeof asset.url === "string") {
			return { thumb: asset.url, full: asset.url, original: asset.url };
		}
		return asset.url;
	}

	function file_ext(name?: string): string {
		const n = `${name ?? ""}`;
		const i = n.lastIndexOf(".");
		return i > 0 ? n.slice(i + 1) : "";
	}

	const SIZE_PRESETS: readonly string[] = ["sm", "md", "lg"];

	interface Pending {
		asset: FieldAsset;
		file: File;
		progress: number;
		error: string | null;
	}
</script>

<script lang="ts">
	let {
		value = $bindable(),
		name,
		label = "",
		id = getId(),
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
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
		classWrap = "",
		classPreview = "",
		classControls = "",
		//
		style,
		t = t_default,
		notifications,
		isLoading = false,
		//
		parseValue = default_parse,
		serializeValue = default_serialize,
		processAsset,
		withOnProgress = false,
		onUploadError,
		accept,
		capture,
		maxSize,
		validateFile,
		transformFile,
		onBeforeRemove,
		onBeforeReplace,
		undoTtl = 6000,
		pasteable = false,
		//
		shape = "square",
		fit = "cover",
		size = "md",
		placeholder,
		noPreview = false,
		noDownload = false,
		onDownload,
		onChange,
	}: Props = $props();

	// --- elements ----------------------------------------------------------------
	// Outer wrapper: the drop zone, scrollIntoView target, paste registration.
	let wrapEl: HTMLDivElement | undefined = $state();
	// The tile row INSIDE InputWrap's box — focused on click so the `:focus-within`
	// paste ring lights up (wrapEl is an ancestor of the box, so it would not).
	let boxEl: HTMLDivElement | undefined = $state();
	let tileEl: HTMLButtonElement | undefined = $state();
	let inputEl = $state<HTMLInputElement>()!;
	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let assetsPreview: AssetsPreview = $state()!;

	// --- state -------------------------------------------------------------------
	let asset: FieldAsset | null = $derived(parseValue(value));
	// The in-flight (or failed) upload. Lives outside `value` on purpose: the form
	// never sees a blob asset, and a failure rolls back for free.
	let pending = $state<Pending | null>(null);
	// Bumped on every new upload / discard so a stale promise cannot land.
	let uploadSeq = 0;
	// `onBeforeRemove` in flight (it may be the real server-side delete): the tile
	// is inert and the Remove control shows a spinner until it settles.
	let removing = $state(false);
	// The last removed asset while its Undo is still offered.
	let removed = $state<FieldAsset | null>(null);
	let undoTimer: ReturnType<typeof setTimeout> | undefined;
	let liveAnnouncement = $state("");
	// blob URLs we created — revoked on destroy (not on upload completion: the
	// consumer may keep using the blob as the thumb, like the demo does)
	const createdBlobUrls: string[] = [];

	let descId = $derived(`${id}-action`);

	let hasLabel = $derived(isTHCNotEmpty(label));
	let canUpload = $derived(
		typeof processAsset === "function" && !disabled && !isLoading && !removing
	);
	// what the tile shows: the upload in progress wins over the committed asset
	let shown = $derived(pending?.asset ?? asset);
	let shownIsImage = $derived(
		shown ? isImage(shown.type || asset_urls(shown).thumb) : false
	);
	let tileState = $derived(
		isLoading
			? "loading"
			: removing
				? "removing"
				: pending
					? pending.error
						? "error"
						: "uploading"
					: asset
						? "filled"
						: "empty"
	);
	let sizePreset = $derived(SIZE_PRESETS.includes(size) ? size : undefined);
	let sizeStyle = $derived(
		sizePreset ? undefined : `--stuic-field-single-asset-size: ${size};`
	);
	let emptyIcon = $derived(
		`${accept ?? ""}`.trim().toLowerCase().startsWith("image") ? iconImage : iconPlus
	);
	// the tile's accessible description: what pressing it does
	let tileActionText = $derived(
		canUpload
			? shown
				? t("replace_file", { name: shown.name })
				: t("pick_file")
			: (shown?.name ?? "")
	);
	let metaText = $derived.by(() => {
		if (!shown) return "";
		if (removing) return t("removing_short");
		if (pending) {
			if (pending.error) return t("upload_failed");
			const parts = [
				withOnProgress
					? t("uploading_progress", { percent: pending.progress })
					: t("uploading_short"),
				formatBytes(pending.file.size),
			];
			return parts.join(" · ");
		}
		const parts: string[] = [];
		const ext = file_ext(shown.name);
		if (ext) parts.push(ext.toUpperCase());
		else if (shown.type) parts.push(shown.type);
		const sz = shown.meta?.size;
		if (typeof sz === "number" && sz >= 0) parts.push(formatBytes(sz));
		return parts.join(" · ");
	});
	let previewAssets = $derived.by(() => {
		if (!shown) return [];
		const urls = asset_urls(shown);
		return [
			{
				url: { thumb: urls.thumb, full: urls.full, original: urls.original ?? urls.full },
				name: shown.name,
				type: shown.type,
			},
		];
	});

	// The undo offer is only shown while the field is still empty: an asset arriving
	// from outside (the parent rewrites `value`) hides it without any effect; our own
	// paths (upload, undo) clear `removed` explicitly, the timer clears the rest.
	let undoOffer = $derived(asset ? null : removed);

	// --- validation --------------------------------------------------------------
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

	/** Focus the tile (the visible control). */
	export function focus(): void {
		if (tileEl && !tileEl.disabled) tileEl.focus();
		else boxEl?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		wrapEl?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}

	/** Open the native file picker (no-op when the field cannot take input). */
	export function openFilePicker(): void {
		if (canUpload) inputEl?.click();
	}

	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator() {
			// Actual translated messages (not reason names): hidden inputs have no
			// `validationMessage`, the validate action uses our return value directly.
			if (required && !asset) return t("field_req_att");
			if ((validateProp as any)?.customValidator) {
				console.warn(
					"Custom validator was provided, but is ignored in <FieldSingleAsset />"
				);
			}
			return "";
		},
		setValidationResult,
		setDoValidate: (fn: () => void) => (_doValidate = fn),
	});

	// --- helpers -----------------------------------------------------------------
	function announce(msg: string) {
		liveAnnouncement = `${msg ?? ""}`;
	}

	function fail(msg: string) {
		announce(msg);
		if (notifications) notifications.error(msg);
		else alert(msg);
	}

	function clear_removed() {
		removed = null;
		if (undoTimer) clearTimeout(undoTimer);
		undoTimer = undefined;
	}

	function commit(next: FieldAsset | null) {
		value = serializeValue(next);
		onChange?.(next);
	}

	async function focus_tile() {
		await tick();
		focus();
	}

	// --- the upload path ---------------------------------------------------------
	// Every file source (drop, picker, paste) funnels through here so they share
	// the same checks: exactly one file, `accept`, `onBeforeReplace`,
	// `transformFile`, `maxSize`, `validateFile` — in that order.
	async function handleIncomingFiles(files: FileList | File[] | null) {
		// Copy, then IMMEDIATELY release the file input's retained FileList (a
		// later stray `change` must not re-run this with the same file; clearing
		// also lets the same file be picked twice in a row).
		const incoming = [...(files ?? [])];
		if (inputEl) inputEl.value = "";
		if (!incoming.length) return;
		if (!canUpload) return;

		if (incoming.length > 1) return fail(t("single_only"));
		let file = incoming[0];

		if (accept && !isAcceptedType(accept, file.type, file.name)) {
			return fail(t("invalid_type", { accept }));
		}

		const current = shown;
		if (current && typeof onBeforeReplace === "function") {
			if (!(await onBeforeReplace(current, file))) return;
		}

		if (typeof transformFile === "function") {
			const out = await transformFile(file);
			if (!out) return; // cancelled (e.g. cropper closed)
			file = out;
		}

		if (maxSize && file.size > maxSize) {
			return fail(
				t("too_large", { size: formatBytes(file.size), max: formatBytes(maxSize) })
			);
		}

		if (typeof validateFile === "function") {
			const verdict = await validateFile(file);
			if (typeof verdict === "string" && verdict) return fail(verdict);
		}

		start_upload(file);
	}

	function start_upload(file: File) {
		const blobUrl = URL.createObjectURL(file);
		createdBlobUrls.push(blobUrl);
		const optimistic: FieldAsset = {
			id: blobUrl,
			url: { thumb: blobUrl, full: blobUrl, original: blobUrl },
			name: file.name,
			type: file.type,
			meta: { isUploading: true, size: file.size },
		};

		clear_removed();
		assetsPreview?.close?.();
		pending = { asset: optimistic, file, progress: 0, error: null };
		const seq = ++uploadSeq;
		announce(t("uploading", { name: file.name }));

		const onProgress = (p: number) => {
			if (seq === uploadSeq && pending && !pending.error) {
				pending.progress = Math.max(0, Math.min(100, Math.round(p)));
			}
		};

		// Called synchronously (the upload starts in this very tick, like FieldAssets);
		// a synchronous throw is routed to the same failure path as a rejection.
		let result: Promise<FieldAsset>;
		try {
			result = Promise.resolve(processAsset!(optimistic, { file, onProgress }));
		} catch (e) {
			result = Promise.reject(e);
		}
		result
			.then((uploaded) => {
				if (seq !== uploadSeq) return; // superseded or discarded meanwhile
				if (!isPlainObject(uploaded)) {
					throw new Error("processAsset resolved without an asset");
				}
				pending = null;
				commit(uploaded);
				announce(t("uploaded", { name: uploaded.name ?? file.name }));
			})
			.catch((e) => {
				if (seq !== uploadSeq) return;
				const error = `${e?.message ?? e}`;
				clog.error(error);
				if (pending) pending.error = error;
				const msg = t("upload_failed_named", { name: file.name, error });
				announce(msg);
				// the consumer may own the report (a quota panel it already renders):
				// `false` skips only the toast, the tile's Retry / Discard stay
				if (onUploadError?.(e, { asset: optimistic, file }) !== false) {
					notifications?.error(msg);
				}
			});
	}

	function retry() {
		if (!pending?.file) return;
		start_upload(pending.file);
	}

	// X while uploading = cancel (the consumer's promise is simply ignored), X on a
	// failed upload = discard; either way the committed `value` is untouched.
	function discard() {
		uploadSeq++;
		pending = null;
		focus_tile();
	}

	async function remove() {
		const current = asset;
		if (!current || disabled || isLoading || removing) return;
		if (typeof onBeforeRemove === "function") {
			// busy for the whole round trip (the hook may be the real delete) — the
			// `removing` guard above is what makes a second click a no-op meanwhile
			removing = true;
			try {
				if (!(await onBeforeRemove(current))) return;
			} finally {
				removing = false;
			}
		}
		assetsPreview?.close?.();
		commit(null);
		announce(t("removed", { name: current.name }));
		if (undoTtl > 0) {
			removed = current;
			undoTimer = setTimeout(() => clear_removed(), undoTtl);
		}
		focus_tile();
	}

	function undo() {
		const back = removed;
		if (!back) return;
		clear_removed();
		commit(back);
		announce(t("restored", { name: back.name }));
		focus_tile();
	}

	function on_x() {
		if (pending) discard();
		else remove();
	}

	// --- clipboard paste (opt-in via `pasteable`) --------------------------------
	function handlePaste(e: ClipboardEvent) {
		if (!pasteable || !canUpload) return;
		const files = extractClipboardFiles(e);
		if (!files.length) return; // let plain-text pastes pass through
		e.preventDefault();
		handleIncomingFiles(files);
	}

	// Focus the row on any click inside the field so a following paste routes here
	// (the document-level listener routes by focus containment). Capture phase:
	// fires even though the inner buttons stopPropagation, and even in browsers
	// that don't focus <button> on click (Safari/Firefox on macOS).
	function focusForPaste() {
		if (!pasteable || !wrapEl) return;
		if (wrapEl.contains(document.activeElement)) return;
		(boxEl ?? wrapEl).focus({ preventScroll: true });
	}

	$effect(() => {
		if (!pasteable || !canUpload || !wrapEl) return;
		const el = wrapEl;
		const unregister = registerPasteTarget({ el, handle: handlePaste });
		el.addEventListener("click", focusForPaste, true);
		return () => {
			unregister();
			el.removeEventListener("click", focusForPaste, true);
		};
	});

	onDestroy(() => {
		if (undoTimer) clearTimeout(undoTimer);
		try {
			createdBlobUrls.forEach((u) => URL.revokeObjectURL(u));
		} catch (e) {
			clog.warn(`${e}`);
		}
	});
</script>

{#snippet control(
	icon: string,
	labelText: string,
	onclick: () => void,
	action: string,
	opts: { busy?: boolean; inert?: boolean } = {}
)}
	<!-- `aria-disabled` (not `disabled`) so a busy control keeps focus for the
	     round trip; the click is a no-op meanwhile (`remove()` guards on `removing`) -->
	<button
		type="button"
		class={twMerge("stuic-field-single-asset-control", classControls)}
		aria-label={labelText}
		aria-disabled={opts.busy || opts.inert ? "true" : undefined}
		aria-busy={opts.busy ? "true" : undefined}
		data-action={action}
		use:tooltip={() => ({ content: labelText })}
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (opts.busy || opts.inert) return;
			onclick();
		}}
	>
		{#if opts.busy}
			<SpinnerCircleOscillate class="size-4" bgStrokeColor="rgba(255 255 255 / 0.3)" />
		{:else}
			{@html icon}
		{/if}
	</button>
{/snippet}

{#snippet default_render()}
	<div class="sr-only" aria-live="polite" aria-atomic="true">{liveAnnouncement}</div>
	<div
		class="p-2 flex flex-wrap items-center gap-3 w-full focus:outline-none"
		bind:this={boxEl}
		tabindex="-1"
	>
		<div
			class="stuic-field-single-asset-tile relative shrink-0 max-w-full"
			data-tile
			style={sizeStyle}
		>
			{#if isLoading}
				<div
					class={twMerge("stuic-field-single-asset-preview", classPreview)}
					aria-busy="true"
				>
					<Skeleton class="absolute inset-0 size-full" rounded={false} />
				</div>
			{:else}
				<button
					type="button"
					bind:this={tileEl}
					{id}
					{tabindex}
					class={twMerge("stuic-field-single-asset-preview", classPreview)}
					disabled={!canUpload}
					aria-label={hasLabel ? undefined : tileActionText}
					aria-describedby={hasLabel ? descId : undefined}
					data-progress={pending && !pending.error ? pending.progress : undefined}
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						openFilePicker();
					}}
				>
					<span class="sr-only" id={descId}>{tileActionText}</span>
					{#if shown}
						{@const urls = asset_urls(shown)}
						{#if shownIsImage}
							<img src={urls.thumb} alt="" class="stuic-field-single-asset-img" />
						{:else}
							<span class="stuic-field-single-asset-icon">
								{@html getAssetIcon(file_ext(shown.name))({ size: 40 })}
							</span>
						{/if}
						{#if pending && !pending.error}
							<span class="stuic-field-single-asset-overlay">
								{#if withOnProgress}
									<span class="block size-10">
										<Circle
											class="text-white"
											animateCompletenessMs={300}
											bgStrokeColor="rgba(0 0 0 / 0.2)"
											completeness={pending.progress / 100}
											rotate={-90}
										/>
									</span>
								{:else}
									<SpinnerCircleOscillate bgStrokeColor="gray" />
								{/if}
							</span>
						{:else if pending?.error}
							<span
								class="stuic-field-single-asset-overlay"
								data-error
								title={pending.error}
							>
								<span class="text-xs font-semibold px-1 text-center"
									>{t("upload_failed")}</span
								>
							</span>
						{/if}
					{:else if isTHCNotEmpty(placeholder)}
						<Thc thc={placeholder as THC} />
					{:else}
						<span class="stuic-field-single-asset-icon">
							{@html emptyIcon({ size: 28 })}
						</span>
					{/if}
				</button>
				{#if shown}
					<span class="stuic-field-single-asset-actions" data-actions>
						{#if pending?.error}
							{@render control(iconRefresh({ size: 16 }), t("retry"), retry, "retry")}
						{/if}
						{#if !pending && !noPreview}
							{@render control(
								iconZoomIn({ size: 16 }),
								t("preview"),
								() => assetsPreview.open(0),
								"preview",
								{ inert: removing }
							)}
						{/if}
						{#if pending || !disabled}
							{@render control(
								iconX({ size: 16 }),
								pending
									? pending.error
										? t("discard")
										: t("cancel_upload")
									: removing
										? t("removing_short")
										: t("remove"),
								on_x,
								pending ? "discard" : "remove",
								{ busy: removing }
							)}
						{/if}
					</span>
				{/if}
			{/if}
		</div>

		<!-- grows, but wraps under a wide tile instead of being squeezed to nothing -->
		<div class="min-w-0 flex-[1_1_10rem] text-sm leading-snug" data-meta>
			{#if isLoading}
				<Skeleton variant="text" lines={2} width="60%" />
			{:else if shown}
				<div class="truncate font-medium" title={shown.name}>{shown.name}</div>
				{#if metaText}
					<div class="text-xs stuic-field-single-asset-meta">{metaText}</div>
				{/if}
			{:else if undoOffer}
				<div class="stuic-field-single-asset-meta">
					<span>{t("removed", { name: undoOffer.name })}</span>
					<button type="button" class="stuic-field-single-asset-undo" onclick={undo}>
						{@html iconUndo({ size: 14 })}
						<span>{t("undo")}</span>
					</button>
				</div>
			{:else if canUpload}
				<div class="stuic-field-single-asset-meta">{t("empty_hint")}</div>
			{/if}
		</div>
	</div>
{/snippet}

<div
	class={twMerge("w-full stuic-field-single-asset mb-8", classWrap)}
	bind:this={wrapEl}
	tabindex="-1"
	data-state={tileState}
	data-shape={shape}
	data-fit={fit}
	data-size={sizePreset}
	use:highlightDragover={() => ({
		enabled: canUpload,
		classes: ["outline-dashed", "outline-2", "outline-(--stuic-color-border)"],
	})}
	use:fileDropzone={() => ({
		// kept on while there is an uploader at all (so a drop on a disabled field
		// is swallowed instead of navigating the tab to the file); the handler
		// itself bails when the field cannot take input
		enabled: typeof processAsset === "function",
		inputEl,
		processFiles: handleIncomingFiles,
		allowClick: false,
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
		classInputBoxWrap={twMerge(
			// the ring is the "paste lands here" affordance — only when paste works
			pasteable &&
				canUpload &&
				"focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--stuic-color-ring)",
			classInputBoxWrap
		)}
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

<input
	type="file"
	bind:this={inputEl}
	class={classInput}
	style="display: none"
	{accept}
	{capture}
	tabindex="-1"
/>
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
	assets={previewAssets}
	{t}
	{classControls}
	noPrevNext
	noDots
	noCurrentOfTotal
	{noDownload}
	onDelete={(_, _index, controls) => {
		controls.close();
		remove();
	}}
	onDownload={onDownload && asset ? () => onDownload(asset!) : undefined}
/>
