<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../../actions/validate.svelte.js";
	import type { IntentColorKey } from "../../../utils/design-tokens.js";
	import type { THC } from "../../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "../types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** One rendered chip. `key` must be unique within the row. */
	export interface FieldLikeChip {
		key: string | number;
		label: string;
		/** Accessible name of the chip's remove (×) button, e.g. "Remove Foo" */
		removeLabel: string;
	}

	/**
	 * Internal: the `chips` trigger of `FieldOptions`. The FieldLikeButton counterpart for a
	 * selection shown as inline, individually removable Pills — same InputWrap shell, same
	 * hidden input + validate wiring, same imperative API.
	 */
	export interface Props extends InputWrapClassProps {
		/** The hidden input carrying `value` + `name` (bindable) */
		input?: HTMLInputElement;
		value: string;
		/** The chips to render (the parent derives them from `value`) */
		chips: FieldLikeChip[];
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		name?: string;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		style?: string;
		/** Shown in the row while there are no chips */
		placeholder?: string;
		/** Accessible name (and tooltip) of the trailing "open" button */
		openLabel: string;
		/** Classes for each chip (Pill) */
		classChip?: string;
		/** Pill intent of the chips */
		chipIntent?: IntentColorKey;
		/** Open the picker (trailing button, or a click on the empty part of the row) */
		onOpen: () => void;
		/** A chip's × was pressed */
		onRemove: (chip: FieldLikeChip, index: number) => void;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { iconSearch } from "$lib/icons/index.js";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../../actions/validate.svelte.js";
	import { getId } from "../../../utils/get-id.js";
	import Button from "../../Button/Button.svelte";
	import Pill from "../../Pill/Pill.svelte";
	import InputWrap from "./InputWrap.svelte";

	let {
		input = $bindable(),
		value = $bindable(),
		chips,
		label = "",
		id = getId(),
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
		name,
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
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		style = "",
		//
		placeholder,
		openLabel,
		classChip,
		chipIntent,
		onOpen,
		onRemove,
	}: Props = $props();

	// chips sit one step smaller than the field they live in
	const PILL_SIZE: Record<string, string> = { sm: "sm", md: "sm", lg: "md" };
	let pillSize = $derived(PILL_SIZE[renderSize] ?? "sm");

	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let _doValidate: (() => void) | undefined = $state();
	let rowEl: HTMLDivElement | undefined = $state();
	let openBtnEl: HTMLElement | undefined = $state();

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

	/** Current validation state, or undefined if validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}

	/** Focus the trailing "open" button (the hidden input cannot be focused). */
	export function focus(): void {
		openBtnEl?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		rowEl?.scrollIntoView?.({
			behavior: "smooth",
			block: "center",
			...opts,
		});
	}

	// the empty part of the row is a pointer convenience: chips own their own clicks and
	// the trailing button is the keyboard-reachable opener
	function onRowClick(e: MouseEvent) {
		if (disabled) return;
		if ((e.target as Element | null)?.closest?.(".stuic-pill")) return;
		onOpen();
	}

	// keep keyboard focus inside the field after a removal: the × now sitting at the same
	// index, else the trailing button
	function remove(chip: FieldLikeChip, index: number) {
		onRemove(chip, index);
		tick().then(() => {
			const btns =
				rowEl?.querySelectorAll<HTMLButtonElement>(".stuic-pill-dismiss") ?? [];
			const next = btns[Math.min(index, btns.length - 1)];
			(next ?? openBtnEl)?.focus?.();
		});
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		bind:this={rowEl}
		class="stuic-field-options-chips"
		data-size={renderSize}
		data-empty={chips.length ? undefined : "true"}
		onclick={onRowClick}
	>
		{#each chips as chip, i (chip.key)}
			<Pill
				dismissible
				size={pillSize}
				intent={chipIntent}
				class={classChip}
				dismissLabel={chip.removeLabel}
				ondismiss={() => remove(chip, i)}
				{disabled}
				title={chip.label}
			>
				<!-- own span so an over-long label truncates (the Pill body is a flex row) -->
				<span class="stuic-field-options-chip-label">{chip.label}</span>
			</Pill>
		{/each}
		{#if !chips.length && placeholder}
			<span class="stuic-field-options-chips-placeholder">{placeholder}</span>
		{/if}
	</div>

	{#snippet inputAfter()}
		<div class="flex items-center pr-1">
			<Button
				bind:el={openBtnEl}
				iconButton
				variant="ghost"
				roundedFull
				type="button"
				size={renderSize === "lg" ? "md" : "sm"}
				aria-label={openLabel}
				tooltip={openLabel}
				{disabled}
				{tabindex}
				onclick={() => onOpen()}
			>
				{@html iconSearch({ size: 18 })}
			</Button>
		</div>
	{/snippet}

	<input
		bind:value
		bind:this={input}
		type="hidden"
		{id}
		{name}
		use:validateAction={() => ({
			enabled: validateProp !== false,
			...(typeof validateProp === "boolean"
				? {
						// Return actual messages (not reason names) because hidden inputs
						// don't support el.validationMessage - the validate action preserves
						// our return value and uses it directly as the error message.
						customValidator(val, ctx, el) {
							if (required && !val)
								return "This field requires attention. Please review and try again.";

							// also, by default, JSON validation is built in
							try {
								JSON.parse(val as string);
								return "";
							} catch (e) {
								return "This field is invalid. Please review and try again.";
							}
						},
					}
				: validateProp),
			setValidationResult,
			setDoValidate: (fn) => (_doValidate = fn),
		})}
		{required}
		{disabled}
	/>
</InputWrap>
