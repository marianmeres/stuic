<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends HTMLTextareaAttributes, InputWrapClassProps {
		input?: HTMLTextAreaElement;
		value?: string;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		useAutogrow?: boolean | { enabled?: boolean; max?: number };
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
		/** Classes for the <textarea> element */
		classInput?: string;
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
	import InputWrap from "./_internal/InputWrap.svelte";

	let {
		input = $bindable(),
		value = $bindable(),
		label = "",
		id = getId(),
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
		useTrim = true,
		useAutogrow = true,
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
	<textarea
		bind:value
		bind:this={input}
		{id}
		class={twMerge("min-h-16", classInput)}
		use:trim={() => ({
			enabled: useTrim,
			setValue: (v: string) => (value = v),
		})}
		use:validateAction={() => ({
			enabled: !!validate,
			...(typeof validate === "boolean" ? {} : validate),
			setValidationResult,
		})}
		use:autogrow={() => ({
			enabled: !!useAutogrow,
			...(typeof useAutogrow === "boolean" ? {} : useAutogrow),
			value,
		})}
		{tabindex}
		{required}
		{disabled}
		{...rest}
	></textarea>
</InputWrap>
