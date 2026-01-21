<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";

	export type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends HTMLInputAttributes {
		input?: HTMLInputElement;
		id?: string;
		checked?: boolean;
		label?: SnippetWithId | THC;
		required?: boolean;
		disabled?: boolean;
		renderSize?: "sm" | "md" | "lg" | string;
		description?: SnippetWithId | THC;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		class?: string;
		classInputBox?: string;
		classInput?: string;
		classLabelBox?: string;
		classLabel?: string;
		classDescBox?: string;
		classValidationBox?: string;
		style?: string;
	}
</script>

<script lang="ts">
	import { slide } from "svelte/transition";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { Thc, isTHCNotEmpty } from "../Thc/index.js";
	import { Collapsible } from "../Collapsible/index.js";
	type THC = import("../Thc/index.js").THC;

	let {
		input = $bindable(),
		id = getId(),
		checked = $bindable(),
		label,
		required,
		disabled,
		renderSize = "md",
		description,
		validate,
		class: classProp,
		classInputBox,
		classInput,
		classLabelBox,
		classLabel,
		classDescBox,
		classValidationBox,
		style,
		...rest
	}: Props = $props();

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	//
	let invalid = $derived(validation && !validation?.valid);
	let idDesc = getId();

	// $inspect(33333, invalid, validation);


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
		"stuic-checkbox",
		"flex items-start mb-4 text-base",
		invalid && "invalid",
		disabled && "disabled",
		classProp
	)}
	data-size={renderSize}
	{style}
>
	<div
		class={twMerge(
			"input-box",
			"flex h-6 items-center ml-1",
			classInputBox
		)}
	>
		<input
			{id}
			type="checkbox"
			bind:this={input}
			bind:checked
			aria-checked={checked}
			aria-describedby={description ? idDesc : undefined}
			use:validateAction={() => ({
				enabled: !!validate,
				...(typeof validate === "boolean" ? {} : validate),
				setValidationResult,
			})}
			class={twMerge(classInput)}
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
					disabled && "cursor-not-allowed",
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
		{#if validation && !validation?.valid}
			<div
				transition:slide={{ duration: 150 }}
				class={twMerge(
					"validation-box",
					"text-sm tracking-tight",
					classValidationBox
				)}
			>
				{validation.message}
			</div>
		{/if}
		{#if description}
			<Collapsible
				class={twMerge(
					"desc-box",
					"text-sm opacity-50 cursor-pointer font-normal",
					disabled && "cursor-not-allowed",
					classDescBox
				)}
			>
				{@render snippetOrThc({ id, value: description })}
			</Collapsible>
			<!-- <div
				id={idDesc}
				class={twMerge(
					"desc-box",
					_classCommon,
					"text-sm opacity-50 cursor-pointer font-normal",
					disabled && "cursor-not-allowed",
					classDescBox
				)}
			>
				{@render snippetOrThc({ id, value: description })}
			</div> -->
		{/if}
	</div>
</label>
