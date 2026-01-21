<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
		input?: HTMLInputElement;
		checked?: boolean;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		name?: string;
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
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		style?: string;
		renderValue?: (rawValue: any) => string;
	}
</script>

<script lang="ts">
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Switch from "../Switch/Switch.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";

	let {
		input = $bindable(),
		checked = $bindable(),
		label = "",
		id = getId(),
		// type = "button",
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
		useTrim = true,
		name,
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
		classDescBox,
		classBelowBox,
		style = "",
		//
		renderValue,
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
	{classDescBox}
	{classBelowBox}
	{validation}
	classInputBoxWrap={twMerge("input-wrap-transparent", classInputBoxWrap)}
	{style}
>
	<Switch bind:checked {name} {required} {disabled} {validate} {setValidationResult} />
</InputWrap>
