<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";
	import { getId } from "../../utils/get-id.js";
	import { Thc } from "../Thc/index.js";

	//
	import "../../stuic.css";
	import "./_internal/checkbox.css";
	import { slide } from "svelte/transition";

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props extends HTMLInputAttributes {
		input?: HTMLInputElement;
		id?: string;
		checked?: boolean;
		label?: SnippetWithId | THC;
		required?: boolean;
		disabled?: boolean;
		renderSize?: "sm" | "md" | "lg" | string;
		description?: SnippetWithId | THC;
		//
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		//
		class?: string;
		classInputBox?: string;
		classInput?: string;
		classLabelBox?: string;
		classLabel?: string;
		classDescBox?: string;
		classValidationBox?: string;
	}

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
		...rest
	}: Props = $props();

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	//
	let invalid = $derived(validation && !validation?.valid);
</script>

{#snippet snippetOrThc({ id, value }: { id: string; value?: SnippetWithId | THC })}
	{#if typeof value === "function"}
		{@render value({ id })}
	{:else if value}
		<Thc thc={value} forceAsHtml />
	{/if}
{/snippet}

<div
	class={twMerge(
		`stuic-checkbox`,
		renderSize,
		disabled && "disabled",
		invalid && "invalid",
		classProp
	)}
>
	<div class={twMerge("input-box", classInputBox)}>
		<input
			{id}
			type="checkbox"
			bind:this={input}
			bind:checked
			use:validateAction={() => ({
				enabled: !!validate,
				...(typeof validate === "boolean" ? {} : validate),
				setValidationResult,
			})}
			class={twMerge(invalid && "invalid", renderSize, classInput)}
			{required}
			{disabled}
			{...rest}
		/>
	</div>
	<div class={twMerge("label-box", renderSize, classLabelBox)}>
		{#if label}
			<label
				for={id}
				class={twMerge(
					classLabel,
					renderSize,
					invalid && "invalid",
					disabled && "disabled",
					required && "required"
				)}
			>
				{#if isTHCNotEmpty(label)}
					<Thc thc={label as THC} forceAsHtml />
				{:else}
					{@render (label as SnippetWithId)({ id })}
				{/if}
			</label>
		{/if}
		{#if validation && !validation?.valid}
			<div
				transition:slide={{ duration: 150 }}
				class={twMerge("validation-box", classValidationBox)}
			>
				{@html validation.message}
			</div>
		{/if}
		{#if description}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class={twMerge(
					"desc-box",
					renderSize,
					invalid && "invalid",
					disabled && "disabled",
					classDescBox
				)}
				onclick={() => !disabled && (checked = !checked)}
			>
				{@render snippetOrThc({ id, value: description })}
			</div>
		{/if}
	</div>
</div>
