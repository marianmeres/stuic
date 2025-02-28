<script lang="ts">
	import type { Snippet } from "svelte";
	import { slide } from "svelte/transition";
	import type { ValidationResult } from "../../../actions/validate.svelte.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import Thc, { isTHCNotEmpty, type THC } from "../../Thc/Thc.svelte";
	//
	import "./input-wrap.css";

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props {
		id: string;
		size?: "sm" | "md" | "lg" | string;
		class?: string;
		label?: SnippetWithId | THC;
		labelAfter?: SnippetWithId | THC;
		inputBefore?: SnippetWithId | THC;
		children: Snippet;
		inputAfter?: SnippetWithId | THC;
		inputBelow?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		required?: boolean;
		disabled?: boolean;
		validation: ValidationResult | undefined;
		//
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		classValidationBox?: string;
	}
	let {
		id,
		size = "md",
		class: classProp,
		label,
		labelAfter,
		inputBefore,
		children,
		inputAfter,
		inputBelow,
		description,
		below,
		required = false,
		disabled = false,
		validation,
		//
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classDescBox,
		classBelowBox,
		classValidationBox,
	}: Props = $props();

	let invalid = $derived(validation && !validation?.valid);

	let width = $state<number>(0);

	$effect(() => {
		// a non-zero breakpoint has priority
		if (labelLeftBreakpoint) {
			labelLeft = !(width && width < labelLeftBreakpoint);
		}
	});

	let _classCommon = $derived(
		[invalid && "invalid", disabled && "disabled", required && "required", size]
			.filter(Boolean)
			.join(" ")
	);

	let hasLabel = $derived(isTHCNotEmpty(label) || typeof label === "function");
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
		`stuic-input`,
		_classCommon,
		hasLabel && labelLeft && labelLeftWidth === "normal" && "width-normal grid-cols-4",
		hasLabel && labelLeft && labelLeftWidth === "wide" && "width-wide grid-cols-3",
		classProp
	)}
	bind:clientWidth={width}
>
	<div
		class={twMerge(
			"label-box flex",
			_classCommon,
			labelLeft ? "left items-start mt-2" : "items-end",
			classLabelBox
		)}
	>
		{#if label}
			<label for={id} class={twMerge(_classCommon, classLabel)}>
				{@render snippetOrThc({ id, value: label })}
			</label>
		{/if}

		{@render snippetOrThc({ id, value: labelAfter })}
	</div>

	<div
		class={twMerge(
			"input-box",
			_classCommon,
			hasLabel && labelLeft && labelLeftWidth === "normal" && "col-span-3",
			hasLabel && labelLeft && labelLeftWidth === "wide" && "col-span-2",
			classInputBox
		)}
	>
		<div
			class={twMerge(
				"input-wrap",
				_classCommon,
				disabled && "cursor-not-allowed opacity-50",
				classInputBoxWrap
			)}
		>
			<div class="flex">
				{@render snippetOrThc({ id, value: inputBefore })}
				{@render children()}
				{@render snippetOrThc({ id, value: inputAfter })}
			</div>
			{@render snippetOrThc({ id, value: inputBelow })}
		</div>

		{#if validation && !validation?.valid}
			<div
				transition:slide={{ duration: 150 }}
				class={twMerge("validation-box", _classCommon, classValidationBox)}
			>
				{@html validation.message}
			</div>
		{/if}

		{#if description}
			<div class={twMerge("desc-box", _classCommon, classDescBox)}>
				{@render snippetOrThc({ id, value: description })}
			</div>
		{/if}

		{#if below}
			<div class={twMerge("below-box", _classCommon, classBelowBox)}>
				{@render snippetOrThc({ id, value: below })}
			</div>
		{/if}
	</div>
</div>
