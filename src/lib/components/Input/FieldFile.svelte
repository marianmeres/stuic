<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props
		extends HTMLInputAttributes,
			InputWrapClassProps,
			Record<string, any> {
		input?: HTMLInputElement;
		files?: FileList;
		multiple?: boolean;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
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
		/** Classes for the rendered file list (when multiple files selected) */
		classFileList?: string;
		style?: string;
	}
</script>

<script lang="ts">
	import { highlightDragover } from "../../actions/highlight-dragover.svelte.js";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";

	let {
		input = $bindable(),
		files = $bindable(),
		multiple,
		label = "",
		id = getId(),
		type = "text",
		tabindex = 0,
		description,
		class: classProp,
		renderSize,
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
		classFileList,
		style,
		//
		...rest
	}: Props = $props();

	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	// $inspect(files);
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
	<div class="block w-full">
		<input
			type="file"
			bind:files
			bind:this={input}
			{id}
			class={twMerge("block w-full", classInput)}
			use:highlightDragover={() => ({ classes: ["outline-dashed"] })}
			use:validateAction={() => ({
				enabled: !!validate,
				...(typeof validate === "boolean" ? {} : validate),
				setValidationResult,
			})}
			{multiple}
			{tabindex}
			{required}
			{disabled}
			{...rest}
		/>
		{#if (files?.length || 0) > 1}
			<ul
				class={twMerge(
					"px-2.5 pb-2.5 pt-1 text-sm opacity-80",
					"space-y-1 list-decimal list-inside",
					classFileList
				)}
			>
				{#each files || [] as f}
					<li>{f.name}</li>
				{/each}
			</ul>
		{/if}
	</div>
</InputWrap>
