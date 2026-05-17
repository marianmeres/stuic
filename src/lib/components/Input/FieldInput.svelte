<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { TypeaheadOptions } from "../../actions/typeahead.svelte.js";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props
		extends HTMLInputAttributes,
			InputWrapClassProps,
			Record<string, any> {
		input?: HTMLInputElement;
		value?: string | number;
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		useTypeahead?: boolean | Omit<TypeaheadOptions, "enabled">;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		inputBefore?: SnippetWithId | THC;
		inputAfter?: SnippetWithId | THC;
		inputBelow?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		/** Classes for the <input> element */
		classInput?: string;
		style?: string;
	}
</script>

<script lang="ts">
	import { trim } from "../../actions/trim.svelte.js";
	import { typeahead } from "../../actions/typeahead.svelte.js";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";

	let {
		input = $bindable(),
		value = $bindable(),
		label = "",
		id = getId(),
		type = "text",
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
		useTrim = true,
		useTypeahead,
		//
		required = false,
		disabled = false,
		//
		// Renamed binding because `validate` is also the name of the exported
		// imperative method below — destructuring under the same name would
		// collide with `export function validate()` in the script scope.
		validate: validateProp,
		//
		labelAfter,
		inputBefore,
		inputAfter,
		inputBelow,
		below,
		//
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
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
		style,
		//
		...rest
	}: Props = $props();

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	// Imperative API. The validate action re-assigns `_doValidate` on every
	// $effect run (whenever options change), so the exported `validate()`
	// always invokes the current closure.
	let _doValidate: (() => void) | undefined = $state();

	/**
	 * Trigger validation now. Same code path as the change/blur listeners.
	 * Renders the inline validation message if invalid. Useful from submit
	 * handlers where the user may not have touched every field.
	 */
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

	/** Focus the underlying `<input>` element. */
	export function focus(): void {
		input?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		input?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}
</script>

<InputWrap
	{description}
	class={classProp}
	size={renderSize}
	{id}
	{label}
	{labelAfter}
	{inputBefore}
	{inputAfter}
	{inputBelow}
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
	<input
		bind:value
		bind:this={input}
		{type}
		{id}
		class={twMerge(classInput)}
		use:trim={() => ({
			enabled: useTrim,
			setValue: (v: string) => useTrim && (value = v),
		})}
		use:typeahead={() => ({
			enabled: !!useTypeahead,
			...(typeof useTypeahead === "boolean" ? {} : useTypeahead),
		})}
		use:validateAction={() => ({
			enabled: validateProp !== false,
			...(typeof validateProp === "boolean" ? {} : validateProp),
			setValidationResult,
			setDoValidate: (fn) => (_doValidate = fn),
		})}
		{tabindex}
		{required}
		{disabled}
		{...rest}
	/>
</InputWrap>
