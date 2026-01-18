<script lang="ts">
	import type { Snippet } from "svelte";
	import { slide } from "svelte/transition";
	import type { ValidationResult } from "../../../actions/validate.svelte.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import { Collapsible } from "../../Collapsible/index.js";
	import Thc, { isTHCNotEmpty, type THC } from "../../Thc/Thc.svelte";

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
		validation?: ValidationResult | undefined;
		//
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classInputBoxWrapInvalid?: string;
		classDescBox?: string;
		classDescBoxToggle?: string;
		classBelowBox?: string;
		classValidationBox?: string;
		descriptionCollapsible?: boolean;
		descriptionDefaultExpanded?: boolean;
		style?: string;
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
		// non-zere value has priority over `labelLeft`
		labelLeftBreakpoint = 480,
		//
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		descriptionCollapsible = true,
		descriptionDefaultExpanded = false,
		style,
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

	const _preset = {
		label: {
			size: {
				sm: "text-sm",
				lg: "font-semibold",
			} as any,
		},
		inputBox: {
			size: {
				sm: "text-sm",
				lg: "p-1",
			} as any,
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

<div
	class={twMerge(
		"stuic-input",
		_classCommon,
		"mb-8",
		hasLabel && labelLeft && "flex",
		hasLabel && labelLeft && labelLeftWidth === "normal" && "width-normal",
		hasLabel && labelLeft && labelLeftWidth === "wide" && "width-wide",
		classProp
	)}
	bind:clientWidth={width}
	{style}
>
	<div
		class={twMerge(
			"label-box",
			_classCommon,
			"flex flex-1",
			labelLeft ? "left items-start mt-2" : "items-end",
			classLabelBox
		)}
	>
		{#if label}
			<label
				for={id}
				class={twMerge(
					"block",
					_classCommon,
					"flex-1 px-2 mb-1 text-base",
					required && "after:content-['*'] after:opacity-40 after:pl-1",
					_preset.label.size[size],
					classLabel
				)}
			>
				{@render snippetOrThc({ id, value: label })}
			</label>
		{/if}

		{@render snippetOrThc({ id, value: labelAfter })}
	</div>

	<div
		class={twMerge(
			"input-box",
			_classCommon,
			hasLabel && labelLeft && labelLeftWidth === "normal" && "flex-3",
			hasLabel && labelLeft && labelLeftWidth === "wide" && "flex-2",
			classInputBox
		)}
	>
		<div
			class={twMerge(
				"input-wrap",
				_classCommon,
				`rounded-md border border-neutral-300 dark:border-neutral-600
				bg-neutral-100 dark:bg-neutral-700
				focus-within:border-input-accent focus-within:dark:border-input-accent-dark
				focus-within:ring-input-accent/20 focus-within:dark:ring-input-accent-dark/20
				focus-within:ring-4`,
				disabled && "cursor-not-allowed opacity-50",
				_preset.inputBox.size[size],
				invalid
					? twMerge(
							classInputBoxWrap,
							`border-input-accent-invalid dark:border-input-accent-invalid-dark
							focus-within:border-input-accent-invalid focus-within:dark:border-input-accent-invalid-dark
							focus-within:ring-input-accent-invalid/20 focus-within:dark:ring-input-accent-invalid-dark/20`,
							classInputBoxWrapInvalid
						)
					: classInputBoxWrap
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
				class={twMerge(
					"validation-box",
					_classCommon,
					"my-1 text-sm px-2 text-input-accent-invalid dark:text-input-accent-invalid-dark",
					classValidationBox
				)}
			>
				{validation.message}
			</div>
		{/if}

		{#if description}
			<div
				class={twMerge(
					"desc-box",
					_classCommon,
					"mx-2 mt-1 text-sm opacity-50",
					classDescBox
				)}
			>
				{#if descriptionCollapsible}
					<Collapsible
						expanded={descriptionDefaultExpanded}
						classToggle={classDescBoxToggle}
					>
						{@render snippetOrThc({ id, value: description })}
					</Collapsible>
				{:else}
					{@render snippetOrThc({ id, value: description })}
				{/if}
			</div>
		{/if}

		{#if below}
			<div class={twMerge("below-box", _classCommon, "mx-2 my-1", classBelowBox)}>
				{@render snippetOrThc({ id, value: below })}
			</div>
		{/if}
	</div>
</div>
