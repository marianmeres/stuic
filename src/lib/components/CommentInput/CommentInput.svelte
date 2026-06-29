<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "../Input/types.js";
	import { DEFAULT_MOBILE_TOOLBAR } from "../MarkdownEditor/index.js";
	import type {
		MarkdownEditorMode,
		ToolbarItem,
		PromptFn,
	} from "../MarkdownEditor/index.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** Active editing surface of the comment box (mirrors `MarkdownEditor`). */
	export type CommentInputMode = MarkdownEditorMode;

	/**
	 * Default toolbar for the comment box — mirrors the reduced mobile toolbar
	 * ({@link DEFAULT_MOBILE_TOOLBAR}) so the desktop and touch experiences stay
	 * consistent. Pass your own `toolbar` array to customize.
	 */
	export const DEFAULT_COMMENT_TOOLBAR: ToolbarItem[] = [
		"bold",
		"italic",
		"|",
		"bulletList",
		"orderedList",
		"|",
		"link",
	];

	export interface Props extends InputWrapClassProps {
		/** Comment content (markdown). Bindable. */
		value?: string;
		/** Active editing surface. Bindable. Default `"source"` (opens on raw markdown). */
		mode?: CommentInputMode;
		/** The editor surface wrapper element. Bindable (read). */
		input?: HTMLDivElement;
		/** Name attribute of the hidden input, for native form submission. */
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
		 * Formatting toolbar. `true` shows {@link DEFAULT_COMMENT_TOOLBAR}, `false`
		 * hides it, or pass an ordered array of {@link ToolbarItem}s (`"|"` for a
		 * separator). Default {@link DEFAULT_COMMENT_TOOLBAR}.
		 */
		toolbar?: boolean | ToolbarItem[];
		/** Toolbar used on mobile / touch devices. Same shape as `toolbar`. */
		mobileToolbar?: boolean | ToolbarItem[];
		/** Start in source mode on mobile / touch devices. Default `true`. */
		autoSourceOnMobile?: boolean;
		/** Media query defining "mobile". Default `"(pointer: coarse) and (max-width: 640px)"`. */
		mobileQuery?: string;
		/** URL prompt used by the link/image buttons. Defaults to `window.prompt`. */
		prompt?: PromptFn;
		/** Cap the editing surface height (long content scrolls inside). Default `32rem`. */
		maxHeight?: number | string;
		/** Also cap the surface to the parent's available height. Default `true`. */
		capToParent?: boolean;
		/** Show the WYSIWYG/Source mode toggle. Default `true`. */
		showModeToggle?: boolean;
		/** Toggle label while in WYSIWYG mode (switches to source). Default `"Source"`. */
		sourceLabel?: string;
		/** Toggle label while in source mode (switches to WYSIWYG). Default `"Preview"`. */
		previewLabel?: string;
		/** Wire ⌘/Ctrl+B / I / K to bold / italic / link. Default `true`. */
		useShortcuts?: boolean;
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
		/** Submit on ⌘/Ctrl+Enter while the editor is focused. Default `true`. */
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
		/** Classes for the editor surface element (forwarded to MarkdownEditor). */
		classInput?: string;
		/** Classes for the toolbar bar (forwarded to MarkdownEditor's `classToolbar`). */
		classBar?: string;
		/** Classes for the footer (button row). */
		classFooter?: string;
		style?: string;
	}
</script>

<script lang="ts">
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { Button } from "../Button/index.js";
	import Thc from "../Thc/Thc.svelte";
	import { MarkdownEditor } from "../MarkdownEditor/index.js";

	let {
		value = $bindable(""),
		mode = $bindable("source"),
		input = $bindable(),
		name,
		//
		label = "",
		description,
		class: classProp,
		id = getId(),
		renderSize = "md",
		required = false,
		disabled = false,
		placeholder,
		validate: validateProp,
		//
		toolbar = DEFAULT_COMMENT_TOOLBAR,
		mobileToolbar,
		autoSourceOnMobile = true,
		mobileQuery,
		prompt,
		maxHeight,
		capToParent = true,
		showModeToggle = true,
		sourceLabel = "Source",
		previewLabel = "Preview",
		useShortcuts = true,
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
	}: Props = $props();

	// The embedded editor instance (exposes validate/focus/command/… imperatively).
	let editor = $state<MarkdownEditor>();

	// --- Submit state ---------------------------------------------------------
	let submitting = $state(false);
	const isEmpty = $derived(!(value ?? "").trim());
	const _showSubmit = $derived(showSubmit ?? !!onSubmit);
	const _showCancel = $derived(showCancel ?? !!onCancel);
	const _busy = $derived(disabled || busy || submitting);
	const canSubmit = $derived(!_busy && !(submitDisabledWhenEmpty && isEmpty));
	// Toggling `disabled` on MarkdownEditor remounts its backend, so only feed it
	// the externally-controlled disable (not the transient `submitting`); the
	// footer buttons carry the in-flight state instead.
	const editorDisabled = $derived(disabled || busy);

	// --- Handlers -------------------------------------------------------------
	async function handleSubmit() {
		if (!canSubmit) return;
		// Validate before invoking the handler — the submit button bypasses any
		// form-level submit check, so enforce it here (surfaces the inline message).
		const res = editor?.validate();
		if (res && !res.valid) return;
		try {
			submitting = true;
			await onSubmit?.(value ?? "");
			if (clearOnSubmit) {
				value = "";
				editor?.clearValidation();
			}
		} finally {
			submitting = false;
		}
	}

	function handleCancel() {
		onCancel?.();
	}

	// Capture keydown on the wrapper so we intercept the shortcut BEFORE the
	// editor's own keymap (stopPropagation prevents a double-handle / native bold).
	function handleKeydown(e: KeyboardEvent) {
		if (!(e.metaKey || e.ctrlKey)) return;
		if (submitOnModEnter && e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			handleSubmit();
			return;
		}
		if (!useShortcuts) return;
		const cmd =
			e.key === "b" || e.key === "B"
				? "bold"
				: e.key === "i" || e.key === "I"
					? "italic"
					: e.key === "k" || e.key === "K"
						? "link"
						: undefined;
		if (cmd) {
			e.preventDefault();
			e.stopPropagation();
			editor?.command(cmd);
		}
	}

	// --- Imperative API (delegates to the embedded MarkdownEditor) ------------
	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		return editor?.validate();
	}
	/** Clear the inline validation message. */
	export function clearValidation(): void {
		editor?.clearValidation();
	}
	/** Current validation state, or undefined if the validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return editor?.getValidation();
	}
	/** Focus the editor surface. */
	export function focus(): void {
		editor?.focus();
	}
	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		editor?.scrollIntoView(opts);
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

<div
	class={twMerge("stuic-comment-input", classProp)}
	data-size={renderSize}
	class:disabled
	{style}
	onkeydowncapture={handleKeydown}
>
	{#if avatar}
		<div class="stuic-comment-input-avatar">
			{@render thcOrSnippet(avatar)}
		</div>
	{/if}

	<div class="stuic-comment-input-main">
		<MarkdownEditor
			bind:this={editor}
			bind:value
			bind:mode
			bind:input
			{id}
			{name}
			{label}
			{description}
			{labelAfter}
			{below}
			{required}
			disabled={editorDisabled}
			{placeholder}
			{renderSize}
			validate={validateProp}
			{toolbar}
			{mobileToolbar}
			{autoSourceOnMobile}
			{mobileQuery}
			{prompt}
			{maxHeight}
			{capToParent}
			{showModeToggle}
			{sourceLabel}
			{previewLabel}
			{labelLeft}
			{labelLeftWidth}
			{labelLeftBreakpoint}
			classInput={twMerge("stuic-comment-input-editor", classInput)}
			classToolbar={classBar}
			{classLabel}
			{classLabelBox}
			{classInputBox}
			{classInputBoxWrap}
			{classInputBoxWrapInvalid}
			{classDescBox}
			{classDescBoxToggle}
			{classBelowBox}
			{classValidationBox}
			onChange={(v) => onChange?.(v)}
		/>

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
