<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { trim } from "../../actions/trim.svelte.js";
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import type { THC } from "../Thc/Thc.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props extends HTMLInputAttributes, Record<string, any> {
		input?: HTMLInputElement;
		value?: string | number; // badInput
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
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
		inputBefore?: SnippetWithId | THC;
		inputAfter?: SnippetWithId | THC;
		inputBelow?: SnippetWithId | THC;
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
		style?: string;
	}

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
		//
		required = false,
		disabled = false,
		//
		validate,
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
		classBelowBox,
		style,
		//
		...rest
	}: Props = $props();

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
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
	{classBelowBox}
	{validation}
	{style}
>
	<input
		bind:value
		bind:this={input}
		{type}
		{id}
		class={twMerge("form-input", renderSize, classInput)}
		use:trim={() => ({
			enabled: useTrim,
			setValue: (v: string) => useTrim && (value = v),
		})}
		use:validateAction={() => ({
			enabled: !!validate,
			...(typeof validate === "boolean" ? {} : validate),
			setValidationResult,
		})}
		{tabindex}
		{required}
		{disabled}
		{...rest}
	/>
</InputWrap>
