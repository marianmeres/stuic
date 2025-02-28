<script lang="ts">
	import { slide } from "svelte/transition";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import FieldRadioInternal from "./_internal/FieldRadioInternal.svelte";
	import type { FieldRadiosOption } from "./types.js";

	interface Props {
		name?: string;
		value?: string;
		tabindex?: number; // tooShort
		renderSize?: "sm" | "md" | "lg" | string;
		//
		options: (string | FieldRadiosOption)[];
		//
		required?: boolean;
		disabled?: boolean;
		//
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		//
		class?: string;
		classRadioBox?: string;
		classInputBox?: string;
		classInput?: string;
		classLabelBox?: string;
		classLabel?: string;
		classDescBox?: string;
		classValidationBox?: string;
	}

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
	}: Props = $props();

	let _options: FieldRadiosOption[] = $derived(
		options.map((v) => {
			if (typeof v === "string") v = { label: v };
			return v;
		})
	);
	$inspect(_options);

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
	<div class={twMerge("stuic-radios", _classCommon)}>
		<div class={twMerge("radios-box", _classCommon, classProp)}>
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
				class={twMerge("validation-box", _classCommon, classValidationBox)}
			>
				{@html validation.message}
			</div>
		{/if}
	</div>
{/if}
