<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLSelectAttributes } from "svelte/elements";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { FieldSelectOption } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends HTMLSelectAttributes {
		input?: HTMLSelectElement;
		value?: string | number;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		options: (string | FieldSelectOption)[];
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
	}
</script>

<script lang="ts">
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";
	import type { FieldSelectOption as _FieldSelectOption } from "./types.js";
	type FieldSelectOption = _FieldSelectOption;

	let {
		input = $bindable(),
		value = $bindable(),
		label = "",
		id = getId(),
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
		//
		options = [],
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
		style,
		//
		...rest
	}: Props = $props();

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	const _normalizeAndGroupOptions = (opts: (string | FieldSelectOption)[]) => {
		const groupped = new Map<string, FieldSelectOption[]>();
		opts.forEach((v) => {
			if (typeof v === "string") v = { label: v };
			if (v.value === undefined) v.value = v.label;
			const optgLabel = v.optgroup || "";
			if (!groupped.has(optgLabel)) groupped.set(optgLabel, []);
			const optgroup = groupped.get(optgLabel);
			optgroup!.push(v);
		});
		return groupped;
	};

	let _options = $derived(_normalizeAndGroupOptions(options));
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
	<select
		bind:value
		bind:this={input}
		{id}
		class={twMerge(classInput)}
		use:validateAction={() => ({
			enabled: !!validate,
			...(typeof validate === "boolean" ? {} : validate),
			setValidationResult,
		})}
		{tabindex}
		{required}
		{disabled}
		{...rest}
	>
		{#each _options as [_optgroup, _opts]}
			{#if _optgroup}
				<optgroup label={_optgroup}>
					{#each _opts as o}
						<option value={o.value}>{o.label}</option>
					{/each}
				</optgroup>
			{:else}
				{#each _opts as o}
					<option value={o.value}>{o.label}</option>
				{/each}
			{/if}
		{/each}
	</select>
</InputWrap>
