<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "../Input/types.js";
	import type { MarkdownRenderer } from "./_internal/render.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** Active tab of the comment box. */
	export type CommentInputMode = "write" | "preview";

	export interface Props
		extends
			Omit<HTMLTextareaAttributes, "value" | "class" | "style">,
			InputWrapClassProps {
		/** Comment text (raw markdown). Bindable. */
		value?: string;
		/** Active tab. Bindable. Default `"write"`. */
		mode?: CommentInputMode;
		/** The underlying `<textarea>` element. Bindable. */
		input?: HTMLTextAreaElement;
		/** Name attribute of the textarea, for native form submission. */
		name?: string;
		//
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		/** Trim surrounding whitespace on blur. Default `true`. */
		useTrim?: boolean;
		/** Grow the textarea with its content (up to `max`). Default `true`. */
		useAutogrow?: boolean | { enabled?: boolean; max?: number };
		//
		/** Show the Write/Preview tabs. Default `true`. Set `false` for a plain markdown textarea. */
		showTabs?: boolean;
		/** Label for the "write" tab. Default `"Write"`. */
		writeLabel?: string;
		/** Label for the "preview" tab. Default `"Preview"`. */
		previewLabel?: string;
		/** Show the subtle "Markdown supported" hint in the tab bar. Default `true`. */
		showMarkdownHint?: boolean;
		/** Text of the markdown hint. Default `"Markdown supported"`. */
		markdownHintLabel?: string;
		/** Placeholder shown in the Preview tab when there is nothing to render. */
		previewEmptyLabel?: string;
		/** Text shown in the Preview tab while the renderer is (lazy-)loading. */
		previewLoadingLabel?: string;
		/**
		 * Override the Preview renderer. Receives the raw markdown, returns (or
		 * resolves to) an HTML string that is rendered as-is — **you are responsible
		 * for sanitizing it**. When omitted, the bundled marked + DOMPurify pipeline
		 * is used (lazy-loaded; requires the optional `marked` / `dompurify` peers).
		 */
		renderMarkdown?: MarkdownRenderer;
		//
		/**
		 * Submit handler. Receives the current value. May be async — the submit
		 * button shows a spinner and the box is disabled while it resolves.
		 */
		onSubmit?: (value: string) => void | Promise<void>;
		/** Cancel handler. When set, a Cancel button is shown by default. */
		onCancel?: () => void;
		/** Fired on every edit with the new value. */
		onChange?: (value: string) => void;
		/** Submit button label. Default `"Comment"`. */
		submitLabel?: string;
		/** Cancel button label. Default `"Cancel"`. */
		cancelLabel?: string;
		/** Show the submit button. Defaults to `true` when `onSubmit` is set. */
		showSubmit?: boolean;
		/** Show the cancel button. Defaults to `true` when `onCancel` is set. */
		showCancel?: boolean;
		/** Submit on ⌘/Ctrl+Enter while the textarea is focused. Default `true`. */
		submitOnModEnter?: boolean;
		/** Clear the value after a successful submit. Default `true`. */
		clearOnSubmit?: boolean;
		/** Disable the submit button when the value is empty/whitespace. Default `true`. */
		submitDisabledWhenEmpty?: boolean;
		/** Externally-controlled busy state (disables the box + submit). */
		busy?: boolean;
		//
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		/** Optional avatar/gutter rendered to the left of the box. */
		avatar?: SnippetWithId | THC;
		/** Extra content rendered in the footer, left of the buttons (e.g. attach). */
		footer?: Snippet;
		//
		/** Classes for the `<textarea>` element. */
		classInput?: string;
		/** Classes for the tab bar. */
		classBar?: string;
		/** Classes for the preview panel. */
		classPreview?: string;
		/** Classes for the footer (button row). */
		classFooter?: string;
		style?: string;
	}
</script>

<script lang="ts">
	import { autogrow } from "../../actions/autogrow.svelte.js";
	import { trim } from "../../actions/trim.svelte.js";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { Button } from "../Button/index.js";
	import Thc from "../Thc/Thc.svelte";
	import InputWrap from "../Input/_internal/InputWrap.svelte";
	import { renderMarkdownSafe } from "./_internal/render.js";

	let {
		value = $bindable(""),
		mode = $bindable("write"),
		input = $bindable(),
		name,
		//
		label = "",
		description,
		class: classProp,
		id = getId(),
		tabindex = 0,
		renderSize = "md",
		required = false,
		disabled = false,
		placeholder,
		// Renamed to avoid collision with the exported `validate()` below.
		validate: validateProp,
		useTrim = true,
		useAutogrow = true,
		//
		showTabs = true,
		writeLabel = "Write",
		previewLabel = "Preview",
		showMarkdownHint = true,
		markdownHintLabel = "Markdown supported",
		previewEmptyLabel = "Nothing to preview",
		previewLoadingLabel = "Loading preview…",
		renderMarkdown,
		//
		onSubmit,
		onCancel,
		onChange,
		submitLabel = "Comment",
		cancelLabel = "Cancel",
		showSubmit,
		showCancel,
		submitOnModEnter = true,
		clearOnSubmit = true,
		submitDisabledWhenEmpty = true,
		busy = false,
		//
		labelAfter,
		below,
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		avatar,
		footer,
		//
		classInput,
		classBar,
		classPreview,
		classFooter,
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
		...rest
	}: Props = $props();

	// --- Validation (mirrors FieldTextarea: action lives on the real textarea) ---
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
	let _doValidate: (() => void) | undefined = $state();

	// --- Submit state ---------------------------------------------------------
	let submitting = $state(false);
	const isEmpty = $derived(!(value ?? "").trim());
	// Resolve the show* defaults from the presence of their handlers.
	const _showSubmit = $derived(showSubmit ?? !!onSubmit);
	const _showCancel = $derived(showCancel ?? !!onCancel);
	const _busy = $derived(disabled || busy || submitting);
	const canSubmit = $derived(!_busy && !(submitDisabledWhenEmpty && isEmpty));

	// --- Preview rendering ----------------------------------------------------
	let previewHtml = $state("");
	let previewError = $state(false);
	let previewLoading = $state(false);

	$effect(() => {
		if (mode !== "preview" || !showTabs) return;
		const md = value ?? "";
		if (!md.trim()) {
			previewHtml = "";
			previewError = false;
			previewLoading = false;
			return;
		}
		const render = renderMarkdown ?? renderMarkdownSafe;
		let cancelled = false;
		previewLoading = true;
		// Drop the previous value's HTML so the loading placeholder shows instead of
		// briefly rendering content that no longer matches `value`.
		previewHtml = "";
		previewError = false;
		(async () => {
			try {
				const html = await render(md);
				if (cancelled) return;
				previewHtml = html;
				previewError = false;
			} catch (err) {
				if (cancelled) return;
				previewHtml = "";
				previewError = true;
				// eslint-disable-next-line no-console
				console.warn(
					"[CommentInput] preview renderer failed. When using the default " +
						"renderer, make sure the optional peers `marked` and `dompurify` " +
						"are installed, or pass a `renderMarkdown` function.",
					err
				);
			} finally {
				if (!cancelled) previewLoading = false;
			}
		})();
		return () => {
			cancelled = true;
		};
	});

	// Returning to the Write tab: re-measure the textarea. autogrow can't size a
	// `display:none` element, so an external value change made while previewing
	// would otherwise leave the textarea at a stale height.
	$effect(() => {
		if (mode !== "write" || !input || !useAutogrow) return;
		const el = input;
		const max =
			typeof useAutogrow === "object" && useAutogrow.max ? useAutogrow.max : 250;
		requestAnimationFrame(() => {
			el.style.height = "auto";
			const cs = getComputedStyle(el);
			const borderY =
				cs.boxSizing === "border-box"
					? parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)
					: 0;
			el.style.height = Math.min(el.scrollHeight + borderY, max) + "px";
		});
	});

	// --- Handlers -------------------------------------------------------------
	async function handleSubmit() {
		if (!canSubmit) return;
		// Validate before invoking the handler — the submit button bypasses any
		// form-level submit check, so enforce it here (surfaces the inline message).
		const res = validate();
		if (res && !res.valid) {
			mode = "write";
			return;
		}
		try {
			submitting = true;
			await onSubmit?.(value ?? "");
			if (clearOnSubmit) {
				value = "";
				// Back to Write so the (now empty) box is editable again.
				if (mode === "preview") mode = "write";
				validation = undefined;
				input?.setCustomValidity?.("");
			}
		} finally {
			submitting = false;
		}
	}

	function handleCancel() {
		onCancel?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (submitOnModEnter && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	}

	function setMode(next: CommentInputMode) {
		if (disabled) return;
		mode = next;
	}

	// Roving-tabindex keyboard nav for the Write/Preview tablist (automatic
	// activation — Arrow/Home/End move selection and focus together).
	function handleTabKeydown(e: KeyboardEvent) {
		const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
		if (!keys.includes(e.key)) return;
		e.preventDefault();
		const next: CommentInputMode =
			e.key === "Home"
				? "write"
				: e.key === "End"
					? "preview"
					: mode === "write"
						? "preview"
						: "write";
		setMode(next);
		if (disabled) return;
		document.getElementById(`${id}-tab-${next}`)?.focus();
	}

	// --- Imperative API (mirrors FieldTextarea) -------------------------------
	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		return validation;
	}
	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		validation = undefined;
		input?.setCustomValidity?.("");
	}
	/** Current validation state, or undefined if the validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}
	/** Focus the underlying `<textarea>` (switches to the Write tab first). */
	export function focus(): void {
		mode = "write";
		input?.focus?.();
	}
	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		input?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}
	/** Programmatically run the submit flow (respects the empty/busy guards). */
	export function submit(): void {
		handleSubmit();
	}
</script>

{#snippet thcOrSnippet(value?: SnippetWithId | THC)}
	{#if typeof value === "function"}
		{@render value({ id })}
	{:else if value}
		<Thc thc={value} forceAsHtml />
	{/if}
{/snippet}

<InputWrap
	{description}
	class={classProp}
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
	<div class="stuic-comment-input" data-size={renderSize} class:disabled>
		{#if avatar}
			<div class="stuic-comment-input-avatar">
				{@render thcOrSnippet(avatar)}
			</div>
		{/if}

		<div class="stuic-comment-input-editor" data-mode={mode}>
			{#if showTabs || showMarkdownHint}
				<div class={twMerge("stuic-comment-input-bar", classBar)}>
					{#if showTabs}
						<div
							class="stuic-comment-input-tabs"
							role="tablist"
							aria-label="Comment editor"
						>
							<button
								id={`${id}-tab-write`}
								type="button"
								role="tab"
								aria-selected={mode === "write"}
								aria-controls={`${id}-panel-write`}
								tabindex={mode === "write" ? 0 : -1}
								data-active={mode === "write" ? "true" : undefined}
								{disabled}
								onclick={() => setMode("write")}
								onkeydown={handleTabKeydown}
							>
								{writeLabel}
							</button>
							<button
								id={`${id}-tab-preview`}
								type="button"
								role="tab"
								aria-selected={mode === "preview"}
								aria-controls={`${id}-panel-preview`}
								tabindex={mode === "preview" ? 0 : -1}
								data-active={mode === "preview" ? "true" : undefined}
								{disabled}
								onclick={() => setMode("preview")}
								onkeydown={handleTabKeydown}
							>
								{previewLabel}
							</button>
						</div>
					{/if}
					{#if showMarkdownHint && mode === "write"}
						<span class="stuic-comment-input-hint">{markdownHintLabel}</span>
					{/if}
				</div>
			{/if}

			<div class="stuic-comment-input-surface">
				<div
					class="stuic-comment-input-panel"
					id={`${id}-panel-write`}
					role={showTabs ? "tabpanel" : undefined}
					aria-labelledby={showTabs ? `${id}-tab-write` : undefined}
					hidden={showTabs && mode === "preview"}
				>
					<textarea
						bind:value
						bind:this={input}
						{...rest}
						{id}
						{name}
						{placeholder}
						{tabindex}
						{required}
						disabled={_busy}
						class={twMerge("stuic-comment-input-textarea", classInput)}
						oninput={(e) => onChange?.(e.currentTarget.value)}
						onkeydown={handleKeydown}
						use:trim={() => ({
							enabled: useTrim,
							setValue: (v: string) => (value = v),
						})}
						use:validateAction={() => ({
							enabled: validateProp !== false,
							...(typeof validateProp === "boolean" ? {} : validateProp),
							setValidationResult,
							setDoValidate: (fn) => (_doValidate = fn),
						})}
						use:autogrow={() => ({
							enabled: !!useAutogrow,
							...(typeof useAutogrow === "boolean" ? {} : useAutogrow),
							value,
						})}
					></textarea>
				</div>

				{#if showTabs && mode === "preview"}
					<div
						class={twMerge(
							"stuic-comment-input-panel stuic-comment-input-preview",
							classPreview
						)}
						id={`${id}-panel-preview`}
						role="tabpanel"
						aria-labelledby={`${id}-tab-preview`}
					>
						{#if previewError}
							<p class="stuic-comment-input-preview-empty">Preview unavailable.</p>
						{:else if !(value ?? "").trim()}
							<p class="stuic-comment-input-preview-empty">{previewEmptyLabel}</p>
						{:else if previewLoading && !previewHtml}
							<p class="stuic-comment-input-preview-empty">{previewLoadingLabel}</p>
						{:else}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html previewHtml}
						{/if}
					</div>
				{/if}
			</div>

			{#if _showSubmit || _showCancel || footer}
				<div class={twMerge("stuic-comment-input-footer", classFooter)}>
					<div class="stuic-comment-input-footer-start">
						{@render footer?.()}
					</div>
					<div class="stuic-comment-input-footer-end">
						{#if _showCancel}
							<Button
								type="button"
								variant="ghost"
								size={renderSize}
								disabled={submitting}
								onclick={handleCancel}
							>
								{cancelLabel}
							</Button>
						{/if}
						{#if _showSubmit}
							<Button
								type="button"
								intent="primary"
								size={renderSize}
								disabled={!canSubmit}
								spinner={submitting}
								onclick={handleSubmit}
							>
								{submitLabel}
							</Button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</InputWrap>
