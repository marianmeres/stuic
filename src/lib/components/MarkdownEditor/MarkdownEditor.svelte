<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "../Input/types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export type MarkdownEditorMode = "wysiwyg" | "source";

	/** A toolbar button key, or `"|"` for a visual separator. */
	export type ToolbarItem =
		| "bold"
		| "italic"
		| "heading1"
		| "heading2"
		| "heading3"
		| "heading4"
		| "heading5"
		| "heading6"
		| "link"
		| "image"
		| "bulletList"
		| "orderedList"
		| "blockquote"
		| "codeBlock"
		| "hr"
		| "hardBreak"
		| "undo"
		| "redo"
		| "|";

	/** Default toolbar layout used when `toolbar` is `true`. */
	export const DEFAULT_TOOLBAR: ToolbarItem[] = [
		"bold",
		"italic",
		"|",
		"heading1",
		"heading2",
		"|",
		"link",
		"image",
		"|",
		"bulletList",
		"orderedList",
		"blockquote",
		"codeBlock",
		"|",
		"hr",
		"hardBreak",
		"|",
		"undo",
		"redo",
	];

	/** Reduced toolbar used on mobile / touch devices (see `mobileToolbar`). */
	export const DEFAULT_MOBILE_TOOLBAR: ToolbarItem[] = [
		"bold",
		"italic",
		"|",
		"heading2",
		"bulletList",
		"orderedList",
		"|",
		"link",
		"|",
		"undo",
		"redo",
	];

	export interface Props extends InputWrapClassProps {
		/** Markdown content. Bindable, single source of truth across both modes. */
		value?: string;
		/** Active editing surface. Bindable. Default `"wysiwyg"`. */
		mode?: MarkdownEditorMode;
		/** The editor surface wrapper element. Bindable (read). */
		input?: HTMLDivElement;
		/** Name attribute of the hidden input (markdown form submission). */
		name?: string;
		//
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		//
		/**
		 * Formatting toolbar. `true` (default) shows {@link DEFAULT_TOOLBAR},
		 * `false` hides it, or pass an ordered array of {@link ToolbarItem}s
		 * (use `"|"` for separators) to choose exactly which buttons appear.
		 */
		toolbar?: boolean | ToolbarItem[];
		/**
		 * Toolbar used on mobile / touch devices (matched by `mobileQuery`). Same
		 * shape as `toolbar`; defaults to the reduced {@link DEFAULT_MOBILE_TOOLBAR}.
		 */
		mobileToolbar?: boolean | ToolbarItem[];
		/** Start in source mode on mobile / touch devices. Default `true`. */
		autoSourceOnMobile?: boolean;
		/**
		 * Media query defining "mobile" for `mobileToolbar` / `autoSourceOnMobile`.
		 * Default `"(pointer: coarse) and (max-width: 640px)"`.
		 */
		mobileQuery?: string;
		/**
		 * URL prompt used by the link/image buttons. Defaults to the native
		 * `window.prompt`. Pass `createPrompt(acpStack)` to use STUIC's ACP dialog
		 * (any `window.prompt`-compatible sync/async function works).
		 */
		prompt?: PromptFn;
		/**
		 * Caps the editing surface height so a long document scrolls *inside* the
		 * surface instead of growing the editor (which would push the toolbar out
		 * of view). `number` → pixels; `string` → any CSS length (`"40rem"`,
		 * `"60vh"`, `"min(40rem,50vh)"`). Defaults to `32rem` (themeable via
		 * `--stuic-markdown-editor-max-height`). The surface is additionally capped
		 * to the parent's available height when {@link capToParent} is on — the
		 * smaller limit wins.
		 */
		maxHeight?: number | string;
		/**
		 * Also cap the editing surface to the height available in the parent
		 * container (measured at runtime), so the editor never overflows a
		 * height-constrained parent. Default `true`. Set `false` to rely solely on
		 * {@link maxHeight}.
		 */
		capToParent?: boolean;
		/** Show the WYSIWYG/Source mode toggle. Default `true`. */
		showModeToggle?: boolean;
		/** Label for the toggle when in WYSIWYG mode (switches to source). */
		sourceLabel?: string;
		/** Label for the toggle when in source mode (switches to WYSIWYG). */
		previewLabel?: string;
		//
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		/** Classes for the editor surface element. */
		classInput?: string;
		classToolbar?: string;
		style?: string;
		//
		onChange?: (value: string) => void;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { MediaQuery } from "svelte/reactivity";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import {
		iconBold,
		iconCode,
		iconCornerDownLeft,
		iconHeading1,
		iconHeading2,
		iconHeading3,
		iconHeading4,
		iconHeading5,
		iconHeading6,
		iconImage,
		iconItalic,
		iconLink,
		iconList,
		iconListOrdered,
		iconMinus,
		iconQuote,
		iconRedo,
		iconUndo,
	} from "$lib/icons/index.js";
	import InputWrap from "../Input/_internal/InputWrap.svelte";
	import type { EditorCommands, EditorHandle, PromptFn } from "./_internal/types.js";
	import {
		computeParentAvailable,
		DEFAULT_MAX_HEIGHT_VAR,
		maxHeightToCss,
		surfaceMaxHeight,
	} from "./_internal/max-height.js";
	import "./index.css";

	// Default URL prompt for link/image — the native `window.prompt`. Opt into
	// STUIC's ACP dialog by passing `prompt={createPrompt(acpStack)}`.
	const defaultPrompt: PromptFn = (message, defaultValue = "") =>
		typeof window !== "undefined" ? window.prompt(message, defaultValue) : null;

	// Toolbar button registry: lucide icon + tooltip + the command to run. Keep
	// this in sync with the `ToolbarItem` union in the module block.
	type IconFn = (props?: Record<string, unknown>) => string;
	type ToolbarButton = { title: string; icon: IconFn; run: (c: EditorCommands) => void };
	const TOOLBAR_REGISTRY: Record<Exclude<ToolbarItem, "|">, ToolbarButton> = {
		bold: { title: "Bold", icon: iconBold, run: (c) => c.bold() },
		italic: { title: "Italic", icon: iconItalic, run: (c) => c.italic() },
		heading1: { title: "Heading 1", icon: iconHeading1, run: (c) => c.heading(1) },
		heading2: { title: "Heading 2", icon: iconHeading2, run: (c) => c.heading(2) },
		heading3: { title: "Heading 3", icon: iconHeading3, run: (c) => c.heading(3) },
		heading4: { title: "Heading 4", icon: iconHeading4, run: (c) => c.heading(4) },
		heading5: { title: "Heading 5", icon: iconHeading5, run: (c) => c.heading(5) },
		heading6: { title: "Heading 6", icon: iconHeading6, run: (c) => c.heading(6) },
		link: { title: "Link", icon: iconLink, run: (c) => c.link() },
		image: { title: "Image", icon: iconImage, run: (c) => c.image() },
		bulletList: { title: "Bullet list", icon: iconList, run: (c) => c.bulletList() },
		orderedList: {
			title: "Ordered list",
			icon: iconListOrdered,
			run: (c) => c.orderedList(),
		},
		blockquote: { title: "Blockquote", icon: iconQuote, run: (c) => c.blockquote() },
		codeBlock: { title: "Code block", icon: iconCode, run: (c) => c.codeBlock() },
		hr: { title: "Horizontal rule", icon: iconMinus, run: (c) => c.hr() },
		hardBreak: {
			title: "Line break",
			icon: iconCornerDownLeft,
			run: (c) => c.hardBreak(),
		},
		undo: { title: "Undo", icon: iconUndo, run: (c) => c.undo() },
		redo: { title: "Redo", icon: iconRedo, run: (c) => c.redo() },
	};

	let {
		value = $bindable(""),
		mode = $bindable("wysiwyg"),
		input = $bindable(),
		name,
		//
		label,
		description,
		class: classProp,
		id = getId(),
		renderSize = "md",
		required = false,
		disabled = false,
		placeholder,
		// Renamed to avoid collision with the exported `validate()` below.
		validate: validateProp,
		//
		toolbar = true,
		mobileToolbar = DEFAULT_MOBILE_TOOLBAR,
		autoSourceOnMobile = true,
		mobileQuery = "(pointer: coarse) and (max-width: 640px)",
		prompt = defaultPrompt,
		maxHeight,
		capToParent = true,
		showModeToggle = true,
		sourceLabel = "Source",
		previewLabel = "Preview",
		//
		labelAfter,
		below,
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classInput,
		classToolbar,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		style,
		//
		onChange,
	}: Props = $props();

	// Reactive "is this a mobile / touch device" flag (SSR-safe: svelte/reactivity
	// MediaQuery returns the fallback on the server).
	const mobile = new MediaQuery(
		untrack(() => mobileQuery),
		false
	);
	const isMobile = $derived(mobile.current);

	// Resolve the toolbar config (boolean | item list) into a validated list,
	// swapping to the reduced `mobileToolbar` on touch devices.
	const toolbarItems = $derived.by<ToolbarItem[]>(() => {
		const src = isMobile ? mobileToolbar : toolbar;
		const fallback = isMobile ? DEFAULT_MOBILE_TOOLBAR : DEFAULT_TOOLBAR;
		const list = src === false ? [] : src === true ? fallback : src;
		return list.filter((k) => k === "|" || k in TOOLBAR_REGISTRY);
	});

	// Default to source mode on mobile — applied once on (client) mount so it
	// doesn't fight the user's later manual toggle or re-fire on resize.
	let mobileModeApplied = false;
	$effect(() => {
		if (mobileModeApplied) return;
		mobileModeApplied = true;
		if (autoSourceOnMobile && untrack(() => mobile.current)) mode = "source";
	});

	// The editor surface the active backend mounts into.
	let host = $state<HTMLDivElement>();
	$effect(() => {
		input = host;
	});

	// --- Surface max-height ---------------------------------------------------
	// Cap the editing surface so a long document scrolls internally instead of
	// growing the editor (which scrolls the toolbar out of view). The base cap is
	// the `maxHeight` prop (funneled into the CSS var so the surface rule + the
	// min() below both see it) or `32rem`; `capToParent` further caps it to the
	// parent's measured available height. `min()` picks the smaller limit.

	// Funnel an explicit `maxHeight` into the themeable CSS var on the root.
	const maxHeightVar = $derived.by(() => {
		const css = maxHeightToCss(maxHeight);
		return css ? `--stuic-markdown-editor-max-height: ${css};` : undefined;
	});

	// Measured parent-available height (px), or null when capping is off / not
	// yet measured / the parent is unconstrained — then the CSS default applies.
	let parentAvailable = $state<number | null>(null);

	// Inline surface `max-height`; undefined falls back to the CSS rule default.
	const surfaceMaxHeightCss = $derived(
		capToParent && parentAvailable != null
			? surfaceMaxHeight(DEFAULT_MAX_HEIGHT_VAR, parentAvailable)
			: undefined
	);

	$effect(() => {
		if (!capToParent || !host || typeof ResizeObserver === "undefined") {
			parentAvailable = null;
			return;
		}
		const surface = host;
		// Measure against the parent of the whole field (InputWrap's root), which
		// is the consumer's container — that is the "parent" whose height we cap to.
		const root = (surface.closest(".stuic-input") as HTMLElement | null) ?? surface;
		const parent = root.parentElement;
		if (!parent) {
			parentAvailable = null;
			return;
		}

		const measure = () => {
			const cs = getComputedStyle(parent);
			const next = computeParentAvailable({
				fromTop: surface.getBoundingClientRect().top,
				parentBottom: parent.getBoundingClientRect().bottom,
				parentBorderBottom: parseFloat(cs.borderBottomWidth) || 0,
				parentPaddingBottom: parseFloat(cs.paddingBottom) || 0,
			});
			// `untrack` the read of `parentAvailable`: the initial measure() runs
			// inside this effect, and tracking its own output would tear down and
			// rebuild the observer on every measurement. The threshold also guards
			// against sub-pixel ResizeObserver feedback loops.
			const prev = untrack(() => parentAvailable);
			if (next == null) {
				if (prev !== null) parentAvailable = null;
			} else if (prev == null || Math.abs(next - prev) > 1) {
				parentAvailable = next;
			}
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(parent);
		// Observe the field root too, so the surface re-measures when content above
		// it reflows (label wraps, description expands, validation message appears).
		ro.observe(root);
		window.addEventListener("resize", measure);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	});

	// Handle to whichever backend is currently mounted (null while (re)loading).
	let activeHandle = $state<EditorHandle | undefined>();

	// Loop guards (intentionally NON-reactive so they don't retrigger effects):
	//  - `applyingExternal`: true while we push `value` INTO an editor; the
	//    backend's change listener checks it to ignore the echo.
	//  - `lastEmitted`: last markdown the editor pushed UP; lets the value-watcher
	//    skip changes that originated from the editor itself.
	let applyingExternal = false;
	let lastEmitted = "";

	// editor -> value
	function onEditorChanged(md: string) {
		if (applyingExternal) return;
		lastEmitted = md;
		value = md;
		onChange?.(md);
	}

	// Mount / teardown the active backend. Keyed on (mode, host, disabled) ONLY —
	// `value` is read untracked so per-keystroke updates never rebuild the editor.
	$effect(() => {
		const target = mode;
		const el = host;
		const isDisabled = disabled;
		if (!el) return;

		let disposed = false;
		let handle: EditorHandle | undefined;

		const v0 = untrack(() => value) ?? "";
		lastEmitted = v0;

		(async () => {
			try {
				const opts = {
					value: v0,
					onChange: onEditorChanged,
					disabled: isDisabled,
					placeholder,
					prompt,
				};
				if (target === "wysiwyg") {
					const { mountMilkdown } = await import("./_internal/milkdown.js");
					if (disposed) return;
					handle = await mountMilkdown(el, opts);
				} else {
					const { mountCodeMirror } = await import("./_internal/codemirror.js");
					if (disposed) return;
					handle = mountCodeMirror(el, opts);
				}
				if (disposed) {
					handle.destroy();
					handle = undefined;
					return;
				}
				activeHandle = handle;
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(
					"[MarkdownEditor] failed to load the editor backend. " +
						"Make sure the optional peer dependencies (@milkdown/* and " +
						"@codemirror/*) are installed.",
					err
				);
			}
		})();

		return () => {
			disposed = true;
			if (handle) {
				// Flush the latest content into `value` BEFORE destroying, so a mode
				// switch never loses the final edits.
				const md = handle.getMarkdown();
				if (md !== untrack(() => value)) {
					lastEmitted = md;
					value = md;
				}
				handle.destroy();
			}
			activeHandle = undefined;
			handle = undefined;
		};
	});

	// value -> editor (external mutations). Skips editor-originated changes via the
	// `lastEmitted` guard, and the `applyingExternal` flag stops the resulting
	// programmatic replace from echoing back through `onEditorChanged`.
	$effect(() => {
		const v = value ?? "";
		const handle = activeHandle;
		if (!handle) return;
		if (v === lastEmitted) return;
		applyingExternal = true;
		try {
			handle.setMarkdown(v);
		} finally {
			applyingExternal = false;
		}
		lastEmitted = v;
	});

	function toggleModeInternal() {
		mode = mode === "wysiwyg" ? "source" : "wysiwyg";
	}

	// --- Validation (hidden-input pattern, mirrors FieldPhoneNumber) ---------
	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
	let _doValidate: (() => void) | undefined = $state();

	// Re-validate on blur of the editor surface (avoids per-keystroke churn).
	function handleFocusOut() {
		hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
	}

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		return validation;
	}
	/** Clear the inline validation message. */
	export function clearValidation(): void {
		validation = undefined;
		hiddenInputEl?.setCustomValidity?.("");
	}
	/** Current validation state, or undefined if never run. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}
	/** Focus the active editor surface. */
	export function focus(): void {
		activeHandle?.focus();
	}
	/** Scroll the editor into view. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		host?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}
	/** Read the current markdown (from the active editor, falling back to `value`). */
	export function getMarkdown(): string {
		return activeHandle?.getMarkdown() ?? value ?? "";
	}
	/** Toggle between WYSIWYG and source modes. */
	export function toggleMode(): void {
		toggleModeInternal();
	}
</script>

<InputWrap
	{id}
	{label}
	{description}
	{labelAfter}
	{below}
	{required}
	{disabled}
	size={renderSize}
	class={classProp}
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
	<div
		class={twMerge("stuic-markdown-editor", classInput)}
		class:disabled
		data-size={renderSize}
		data-mode={mode}
		style={maxHeightVar}
	>
		{#if toolbarItems.length || showModeToggle}
			<div class={twMerge("stuic-markdown-editor-bar", classToolbar)}>
				{#if toolbarItems.length}
					<div
						class="stuic-markdown-editor-toolbar"
						role="toolbar"
						aria-label="Formatting"
					>
						{#each toolbarItems as item, i (i)}
							{#if item === "|"}
								<span class="stuic-markdown-editor-toolbar-sep" aria-hidden="true"></span>
							{:else}
								{@const btn = TOOLBAR_REGISTRY[item]}
								<button
									type="button"
									data-cmd={item}
									title={btn.title}
									aria-label={btn.title}
									{disabled}
									onpointerdown={(e) => e.preventDefault()}
									onclick={() => activeHandle && btn.run(activeHandle.commands)}
								>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html btn.icon({ size: 20 })}
								</button>
							{/if}
						{/each}
					</div>
				{/if}
				{#if showModeToggle}
					<button
						type="button"
						class="stuic-markdown-editor-mode"
						{disabled}
						onclick={toggleModeInternal}
					>
						{mode === "wysiwyg" ? sourceLabel : previewLabel}
					</button>
				{/if}
			</div>
		{/if}

		<!-- Backend mounts here on the client. Empty during SSR. -->
		<div
			bind:this={host}
			class="stuic-markdown-editor-surface"
			style:max-height={surfaceMaxHeightCss}
			onfocusout={handleFocusOut}
			role="textbox"
			aria-multiline="true"
			tabindex="-1"
		></div>
	</div>
</InputWrap>

<!-- Hidden input for form submission + validation parity. Rendered whenever
     validation is enabled (default) OR `name` is set, mirroring FieldPhoneNumber. -->
{#if name || validateProp !== false}
	<input
		type="hidden"
		{name}
		value={value ?? ""}
		bind:this={hiddenInputEl}
		use:validateAction={() => {
			const customOpts =
				typeof validateProp === "object" && validateProp ? validateProp : {};
			const inner = customOpts.customValidator;
			return {
				enabled: validateProp !== false,
				...customOpts,
				// Hidden inputs are barred from native constraint validation, so we
				// enforce `required` ourselves before delegating.
				customValidator(val, ctx, el) {
					if (required && (val == null || String(val).trim() === "")) {
						return "This field requires attention. Please review and try again.";
					}
					return inner ? inner(val, ctx, el) || "" : "";
				},
				setValidationResult,
				setDoValidate: (fn) => (_doValidate = fn),
			};
		}}
	/>
{/if}
