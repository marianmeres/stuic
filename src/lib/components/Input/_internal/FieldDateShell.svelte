<!--
	Internal: the field scaffolding shared by FieldDate and FieldDateRange — the
	InputWrap shell, the trigger button (icon + formatted value / placeholder + a
	trailing × that clears), the hidden inputs that carry the ISO value(s) into
	FormData (the first one runs the `validate` action), and the picker's two
	homes: inline inside the field (`embedded`) or a native <dialog> opened by the
	trigger. The picker itself is the `children` snippet; the owning field decides
	what it is and what it means.

	WHY hidden inputs: the visible trigger is a <button>, so nothing would be
	submitted otherwise — and a hidden input is barred from native constraint
	validation, which is why `required` / min / max are enforced by the owning
	field's customValidator (same as FieldPhoneNumber / FieldCountry / …).
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../../actions/validate.svelte.js";
	import type { THC } from "../../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "../types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** One hidden `<input>` the field submits. The first one carries the `validate` action. */
	export interface FieldDateHiddenInput {
		name?: string;
		value: string;
	}

	export interface Props extends InputWrapClassProps {
		id: string;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		class?: string;
		style?: string;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		tabindex?: number;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		/** Formatted value shown in the trigger (`""` = empty → placeholder) */
		display: string;
		placeholder: string;
		/** Show the trailing × while there is a value */
		clearable: boolean;
		clearLabel: string;
		/** Render the picker inline inside the field instead of trigger + dialog */
		embedded: boolean;
		inputs: FieldDateHiddenInput[];
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		dialogTitle: string;
		closeLabel: string;
		noScrollLock?: boolean;
		/** Classes for the trigger button */
		classInput?: string;
		/** Classes for the dialog box */
		classDialog?: string;
		/** The first hidden input (bindable) */
		input?: HTMLInputElement;
		onOpen?: () => void;
		onClose?: () => void;
		onClear: () => void;
		/** The picker */
		children: Snippet;
	}
</script>

<script lang="ts">
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../../actions/validate.svelte.js";
	import { iconCalendar, iconX } from "../../../icons/index.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import Button from "../../Button/Button.svelte";
	import ModalDialog from "../../ModalDialog/ModalDialog.svelte";
	import InputWrap from "./InputWrap.svelte";

	let {
		id,
		label = "",
		description,
		labelAfter,
		below,
		class: classProp,
		style,
		renderSize = "md",
		required = false,
		disabled = false,
		tabindex = 0,
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		display,
		placeholder,
		clearable,
		clearLabel,
		embedded,
		inputs,
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		dialogTitle,
		closeLabel,
		noScrollLock = false,
		classInput,
		classDialog,
		input = $bindable(),
		onOpen,
		onClose,
		onClear,
		children,
	}: Props = $props();

	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
	let _doValidate: (() => void) | undefined = $state();

	// Internal refs; the public `input` bindable is a write-out mirror.
	let hiddenEl: HTMLInputElement | undefined = $state();
	let triggerEl: HTMLButtonElement | undefined = $state();
	let embeddedEl: HTMLDivElement | undefined = $state();
	let dialog: ModalDialog | undefined = $state();

	$effect(() => {
		input = hiddenEl;
	});

	let isOpen = $derived(!embedded && !!dialog?.visibility().visible);

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		return validation;
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		validation = undefined;
		hiddenEl?.setCustomValidity?.("");
	}

	/** Current validation state, or undefined if validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}

	/** Focus the trigger (dialog mode) or the picker's tabbable day (embedded). */
	export function focus(): void {
		if (embedded) embeddedEl?.querySelector<HTMLElement>('[tabindex="0"]')?.focus?.();
		else triggerEl?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		(embedded ? embeddedEl : triggerEl)?.scrollIntoView?.({
			behavior: "smooth",
			block: "center",
			...opts,
		});
	}

	/** Re-run validation the way a user edit would (the action listens on `change`). */
	export function dispatchChange(): void {
		hiddenEl?.dispatchEvent(new Event("change", { bubbles: true }));
	}

	/** Open the picker dialog (no-op when `embedded` or `disabled`). */
	export function open(): void {
		if (embedded || disabled) return;
		dialog?.open(triggerEl ?? null);
		onOpen?.();
	}

	/** Close the picker dialog. */
	export function close(): void {
		dialog?.close();
	}

	/** Whether the picker dialog is currently open. */
	export function isDialogOpen(): boolean {
		return isOpen;
	}

	function clear() {
		onClear();
		triggerEl?.focus?.();
	}
</script>

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
	{#if embedded}
		<div bind:this={embeddedEl} class="stuic-field-date-embedded" data-size={renderSize}>
			{@render children()}
		</div>
	{:else}
		<button
			bind:this={triggerEl}
			type="button"
			{id}
			class={twMerge("stuic-field-date-trigger", classInput)}
			data-size={renderSize}
			data-empty={display ? undefined : ""}
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			{disabled}
			{tabindex}
			onclick={open}
		>
			<span class="stuic-field-date-trigger-icon" aria-hidden="true">
				{@html iconCalendar({ size: 18 })}
			</span>
			<span class="stuic-field-date-trigger-label">{display || placeholder}</span>
		</button>
	{/if}

	{#snippet inputAfter()}
		{#if !embedded && clearable && display && !disabled}
			<div class="flex items-center pr-1">
				<Button
					iconButton
					variant="ghost"
					roundedFull
					type="button"
					size={renderSize === "lg" ? "md" : "sm"}
					class="stuic-field-date-clear"
					aria-label={clearLabel}
					tooltip={clearLabel}
					onclick={clear}
				>
					{@html iconX({ size: 16 })}
				</Button>
			</div>
		{/if}
	{/snippet}

	{#each inputs as h, i (i)}
		{#if i === 0}
			<input
				bind:this={hiddenEl}
				type="hidden"
				id={embedded ? id : undefined}
				name={h.name}
				value={h.value}
				use:validateAction={() => ({
					enabled: validateProp !== false,
					...(typeof validateProp === "boolean" ? {} : validateProp),
					setValidationResult,
					setDoValidate: (fn) => (_doValidate = fn),
				})}
				{required}
				{disabled}
			/>
		{:else}
			<input type="hidden" name={h.name} value={h.value} {disabled} />
		{/if}
	{/each}
</InputWrap>

{#if !embedded}
	<ModalDialog
		bind:this={dialog}
		ariaLabelledby="{id}-dialog-title"
		noAutoFocus
		{noScrollLock}
		preClose={() => {
			onClose?.();
		}}
		class="bg-transparent shadow-none pointer-events-none size-auto max-w-full"
	>
		<div class={twMerge("stuic-field-date-dialog pointer-events-auto", classDialog)}>
			<div class="stuic-field-date-dialog-header">
				<span id="{id}-dialog-title" class="stuic-field-date-dialog-title"
					>{dialogTitle}</span
				>
				<Button
					x
					size="sm"
					variant="ghost"
					roundedFull
					type="button"
					aria-label={closeLabel}
					tooltip={closeLabel}
					onclick={close}
				/>
			</div>
			<div class="stuic-field-date-dialog-body">
				{@render children()}
			</div>
		</div>
	</ModalDialog>
{/if}
