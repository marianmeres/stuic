<script lang="ts">
	import type { Snippet } from "svelte";
	import type { THC } from "../../Thc/Thc.svelte";
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from "../../../actions/validate.svelte.js";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { getId } from "../../../utils/get-id.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import Thc, { isTHCNotEmpty } from "../../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props extends HTMLInputAttributes {
		input?: HTMLInputElement;
		group?: string;
		label?: SnippetWithId | THC;
		name?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		renderSize?: "sm" | "md" | "lg" | string;
		description?: SnippetWithId | THC;
		//
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		//
		classRadioBox?: string;
		classInputBox?: string;
		classInput?: string;
		classLabelBox?: string;
		classLabel?: string;
		classDescBox?: string;
		classValidationBox?: string;
		//
		validation: ValidationResult | undefined;
	}

	let {
		input = $bindable(),
		group = $bindable(),
		value,
		label,
		name,
		required,
		disabled,
		description,
		renderSize,
		tabindex,
		validate,
		classRadioBox,
		classInputBox,
		classInput,
		classLabelBox,
		classLabel,
		classDescBox,
		classValidationBox,
		validation = $bindable(),
		...rest
	}: Props = $props();

	//
	// let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	//
	let invalid = $derived(validation && !validation?.valid);
	let id = getId();
	let idDesc = getId();
</script>

{#snippet snippetOrThc({ id, value }: { id: string; value?: SnippetWithId | THC })}
	{#if typeof value === "function"}
		{@render value({ id })}
	{:else if value}
		<Thc thc={value} forceAsHtml />
	{/if}
{/snippet}

<label
	class={twMerge(
		"radio-box",
		"flex items-start cursor-pointer pr-1",
		disabled && "cursor-not-allowed",
		classRadioBox
	)}
>
	<div class={twMerge("input-box", "flex h-6 items-center ml-1", classInputBox)}>
		<input
			type="radio"
			{id}
			bind:this={input}
			bind:group
			{value}
			{name}
			class={twMerge(classInput)}
			aria-describedby={description ? idDesc : undefined}
			use:validateAction={() => ({
				enabled: !!validate,
				...(typeof validate === "boolean" ? {} : validate),
				setValidationResult,
			})}
			{required}
			{disabled}
			{...rest}
		/>
	</div>
	<div class={twMerge("label-box", "ml-3 w-full", classLabelBox)}>
		{#if label}
			<div
				class={twMerge(
					"label",
					"block w-full cursor-pointer",
					required && "after:content-['*'] after:opacity-40 after:pl-1",
					classLabel
				)}
			>
				{#if isTHCNotEmpty(label)}
					<Thc thc={label as THC} forceAsHtml />
				{:else}
					{@render (label as SnippetWithId)({ id })}
				{/if}
			</div>
		{/if}
		{#if description}
			<div
				id={idDesc}
				class={twMerge(
					"desc-box",
					"text-sm opacity-50 cursor-pointer font-normal",
					disabled && "cursor-not-allowed",
					classDescBox
				)}
			>
				{@render snippetOrThc({ id, value: description })}
			</div>
		{/if}
	</div>
</label>
