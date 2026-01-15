<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
		input?: HTMLInputElement;
		value: string;
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
	import { onMount } from "svelte";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";
	import { watch } from "runed";

	let {
		input = $bindable(),
		value = $bindable(),
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

	let _value_renderer: any = $derived(
		typeof renderValue === "function"
			? renderValue
			: (v: any) => {
					// by default, we're expecting JSON value
					try {
						return JSON.stringify(JSON.parse(v));
					} catch (e) {
						return `${e}`;
					}
				}
	);

	//
	let rendered: string | Snippet<[value: string]> = $derived(_value_renderer(value));

	// let renderCount = $state(0);

	// // once button rendered, trigger change on the input, so that the validation re/triggers
	// // (this is ugly as hell...)
	// watch(
	// 	() => rendered,
	// 	(isRendered, wasRendered) => {
	// 		// ignore first (initial) render
	// 		// if (isRendered && renderCount++) {
	// 		// input?.dispatchEvent(new Event("change", { bubbles: true }));
	// 		// }
	// 	}
	// );

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	// $inspect("validation", validation);
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
	{classDescBox}
	{classBelowBox}
	{validation}
	{style}
>
	<button
		type="button"
		class={twMerge(
			"no-focus-visible form-field",
			"w-full text-left py-2.5 px-3 border-0 bg-transparent",
			"focus:outline-0 focus-visible:outline-0",
			renderSize,
			classInput
		)}
		{disabled}
		{...rest as any}
		{tabindex}
	>
		{#if typeof rendered === "function"}
			{@render rendered(value)}
		{:else if rendered}
			{@html rendered}
		{:else}
			&nbsp;
		{/if}
	</button>

	<input
		bind:value
		bind:this={input}
		type="hidden"
		{id}
		{name}
		use:validateAction={() => ({
			enabled: !!validate,
			...(typeof validate === "boolean"
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
				: validate),
			setValidationResult,
		})}
		{required}
		{disabled}
	/>
</InputWrap>
