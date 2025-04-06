<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { slide } from "svelte/transition";
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { Thc } from "../Thc/index.js";
	import { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";

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
		style?: string;
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

	//
	let _classCommon = $derived(
		[invalid && "invalid", disabled && "disabled", required && "required", renderSize]
			.filter(Boolean)
			.join(" ")
	);

	const _preset = {
		labelBox: {
			label: {
				size: {
					sm: "text-sm mt-0.5",
					lg: "font-bold",
				} as any,
			},
		},
	};
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
		`stuic-checkbox`,
		_classCommon,
		"flex items-start mb-4 text-base",
		classProp
	)}
	{style}
>
	<div
		class={twMerge(
			"input-box",
			_classCommon,
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
			class={twMerge(
				_classCommon,
				`size-4 rounded
				bg-neutral-100
				border-neutral-300
				text-input-accent dark:text-input-accent-dark
				cursor-pointer

				checked:border-input-accent checked:bg-input-accent 
				checked:dark:border-input-accent-dark checked:dark:bg-input-accent-dark

				focus:border-input-accent
				focus:ring-4
				focus:ring-offset-0
				focus:ring-input-accent/20 focus:dark:ring-input-accent-dark/20

				disabled:cursor-not-allowed`,
				classInput
			)}
			{required}
			{disabled}
			{...rest}
		/>
	</div>
	<div class={twMerge("label-box", _classCommon, "ml-3 w-full", classLabelBox)}>
		{#if label}
			<div
				class={twMerge(
					"label",
					_classCommon,
					"block w-full cursor-pointer",
					disabled && "cursor-not-allowed",
					required && "after:content-['*'] after:opacity-40 after:pl-1",
					_preset.labelBox.label.size[renderSize],
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
					_classCommon,
					"text-xs text-input-accent dark:text-input-accent-dark tracking-tight",
					classValidationBox
				)}
			>
				{@html validation.message}
			</div>
		{/if}
		{#if description}
			<div
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
			</div>
		{/if}
	</div>
</label>
