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

	//
	let _classCommon = $derived(
		[invalid && "invalid", disabled && "disabled", renderSize].filter(Boolean).join(" ")
	);

	const _preset = {
		labelBox: {
			label: {
				size: {
					sm: "text-sm mt-0.5",
					lg: "font-semibold",
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
		"radio-box",
		_classCommon,
		"flex items-start cursor-pointer pr-1",
		disabled && "cursor-not-allowed",
		classRadioBox
	)}
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
			type="radio"
			{id}
			bind:this={input}
			bind:group
			{value}
			{name}
			class={twMerge(
				_classCommon,
				`size-4 rounded-full
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
				disabled && "cursor-not-allowed",
				classInput
			)}
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
	<div class={twMerge("label-box", _classCommon, "ml-3 w-full", classLabelBox)}>
		{#if label}
			<div
				class={twMerge(
					"label",
					_classCommon,
					"block w-full cursor-pointer",
					renderSize && _preset.labelBox.label.size[renderSize],
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
