<script lang="ts" module>
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { FieldRadiosOption } from "./types.js";

	export interface Props {
		name?: string;
		value?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		options: (string | FieldRadiosOption)[];
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		class?: string;
		classRadioBox?: string;
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
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import FieldRadioInternal from "./_internal/FieldRadioInternal.svelte";

	let {
		options,
		name = getId("name-"),
		value = $bindable(),
		tabindex = 0,
		required,
		disabled,
		renderSize = "md",
		validate,
		//
		class: classProp,
		classRadioBox,
		classInputBox,
		classInput,
		classLabelBox,
		classLabel,
		classDescBox,
		classValidationBox,
		style,
	}: Props = $props();

	let _options: FieldRadiosOption[] = $derived(
		options.map((v) => {
			if (typeof v === "string") v = { label: v };
			return v;
		})
	);
	// $inspect(_options);

	//
	let validation = $state<ValidationResult | undefined>();
	let invalid = $derived(validation && !validation?.valid);

	//
	let _classCommon = $derived(
		[invalid && "invalid", disabled && "disabled", required && "required", renderSize]
			.filter(Boolean)
			.join(" ")
	);
	// $inspect(value);
</script>

{#if _options.length}
	<div class={twMerge("stuic-radios", _classCommon)} {style}>
		<div
			class={twMerge(
				"radios-box",
				_classCommon,
				"gap-y-2 grid rounded-md p-2 mb-8",
				"border border-neutral-300 dark:border-neutral-600",
				"bg-neutral-100 dark:bg-neutral-700",
				invalid && "border-(--stuic-input-accent-error)",
				classProp
			)}
		>
			{#each _options as o, i}
				<!-- value={o.value || o.label} -->
				<FieldRadioInternal
					{name}
					bind:group={value}
					label={o.label}
					value={o.value ?? o.label}
					description={o.description}
					{renderSize}
					{disabled}
					{tabindex}
					{required}
					{validate}
					{classRadioBox}
					{classInputBox}
					{classInput}
					{classLabelBox}
					{classLabel}
					{classDescBox}
					{classValidationBox}
					bind:validation
				/>
			{/each}
		</div>
		{#if validation && !validation?.valid}
			<div
				transition:slide={{ duration: 150 }}
				class={twMerge(
					"validation-box",
					_classCommon,
					`mt-1 px-2 text-sm text-input-accent dark:text-input-accent-dark 
					tracking-tight`,
					classValidationBox
				)}
			>
				{validation.message}
			</div>
		{/if}
	</div>
{/if}
