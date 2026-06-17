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
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
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

	// Refs to each rendered radio — used for the imperative validate() / focus().
	// All radios in the group share validity (browser-level), so delegating to
	// the first one is sufficient to run the validator.
	let radioRefs: (FieldRadioInternal | undefined)[] = $state([]);

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		radioRefs[0]?.validate();
		return validation;
	}

	/** Clear the inline validation message. */
	export function clearValidation(): void {
		for (const r of radioRefs) r?.clearValidation?.();
		validation = undefined;
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}

	/** Focus the first radio. */
	export function focus(): void {
		radioRefs[0]?.focus?.();
	}

	/** Scroll the field into view. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		radioRefs[0]?.scrollIntoView?.(opts);
	}

	// $inspect(value);
</script>

{#if _options.length}
	<div
		class={twMerge("stuic-radios", invalid && "invalid", disabled && "disabled")}
		data-size={renderSize}
		{style}
	>
		<div class={twMerge("radios-box", "gap-y-2 grid p-2 mb-8", classProp)}>
			{#each _options as o, i}
				<FieldRadioInternal
					bind:this={radioRefs[i]}
					{name}
					bind:group={value}
					label={o.label}
					value={o.value ?? o.label}
					description={o.description}
					{renderSize}
					disabled={disabled || o.disabled}
					{tabindex}
					{required}
					validate={validateProp}
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
					"mt-1 px-2 text-sm tracking-tight",
					classValidationBox
				)}
			>
				{validation.message}
			</div>
		{/if}
	</div>
{/if}
