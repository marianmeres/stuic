<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
		value: string;
		name: string;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		style?: string;
		onChange?: (value: string) => void;
	}
</script>

<script lang="ts">
	import { iconCheck, iconPencil } from "$lib/icons/index.js";
	import { autogrow } from "../../actions/autogrow.svelte.js";
	import { tooltip } from "../../actions/index.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";

	let {
		value = $bindable(),
		name,
		id = getId(),
		label,
		description,
		class: classProp,
		tabindex = 0,
		renderSize = "sm",
		required = false,
		disabled = false,
		validate,
		labelAfter,
		below,
		labelLeft,
		labelLeftWidth,
		labelLeftBreakpoint,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classDescBox,
		classBelowBox,
		style,
		onChange,
	}: Props = $props();

	let editMode = $state(false);
	let hiddenInputEl: HTMLInputElement | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- initialized by bind:clientWidth
	let contentWidth: number = $state()!;
	const isNarrow = $derived(contentWidth < 360);

	let parsed = $derived.by(() => {
		try {
			const v = JSON.parse(value || "null");
			return v;
		} catch {
			return undefined;
		}
	});

	let isEmpty = $derived(
		parsed === null ||
			parsed === undefined ||
			(typeof parsed === "object" &&
				!Array.isArray(parsed) &&
				Object.keys(parsed).length === 0) ||
			(Array.isArray(parsed) && parsed.length === 0)
	);

	function toggleMode() {
		if (editMode) {
			// Switching from edit to pretty — validate JSON
			try {
				JSON.parse(value || "null");
				validation = undefined;
				editMode = false;
			} catch (e) {
				validation = {
					valid: false,
					message: "This field requires attention. Please review and try again.",
				};
			}
		} else {
			validation = undefined;
			// Pretty-print the JSON before entering edit mode
			try {
				const obj = JSON.parse(value || "null");
				value = JSON.stringify(obj, null, "\t");
			} catch {
				// leave value as-is if not parseable
			}
			editMode = true;
		}
	}

	// Validation
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	const TEXTAREA_CLS =
		"w-full min-h-16 p-2 font-mono text-sm focus:outline-none focus:ring-0";

	const BTN_CLS = [
		"toggle-btn",
		"px-2 rounded-r block",
		"min-w-[44px] min-h-[44px]",
		"flex items-center justify-center",
		"border-l border-(--stuic-color-border)",
	].join(" ");
</script>

{#snippet renderPrimitive(val: unknown)}
	{#if val === null || val === undefined}
		<span class="italic opacity-40">&mdash;</span>
	{:else if typeof val === "boolean"}
		<span class={val ? "text-green-600 dark:text-green-400" : "opacity-50"}
			>{val ? "true" : "false"}</span
		>
	{:else if typeof val === "number"}
		<span>{val}</span>
	{:else if typeof val === "string"}
		{#if val === ""}
			<span class="italic opacity-40">&mdash;</span>
		{:else}
			<span class="break-words">{val}</span>
		{/if}
	{:else}
		<span>{String(val)}</span>
	{/if}
{/snippet}

{#snippet renderValue(val: unknown, depth: number)}
	{#if val === null || val === undefined || typeof val === "boolean" || typeof val === "number" || typeof val === "string"}
		{@render renderPrimitive(val)}
	{:else if Array.isArray(val)}
		{#if val.length === 0}
			<span class="italic opacity-40">[]</span>
		{:else if isNarrow}
			<span class="opacity-50">[{val.length}]</span>
		{:else if val.every((v) => v === null || typeof v !== "object")}
			<span class="break-words"
				>{val.map((v) => (v === null ? "null" : String(v))).join(", ")}</span
			>
		{:else}
			<div class="flex flex-col gap-2">
				{#each val as item, i (i)}
					<div
						class={twMerge(
							"relative rounded border border-(--stuic-color-border) p-2 pl-3",
							depth > 0 && "ml-2"
						)}
					>
						<span class="absolute top-0.5 left-1 text-xs leading-none opacity-30"
							>#{i + 1}</span
						>
						{@render renderValue(item, depth + 1)}
					</div>
				{/each}
			</div>
		{/if}
	{:else if typeof val === "object"}
		{@const entries = Object.entries(val as Record<string, unknown>)}
		{#if entries.length === 0}
			<span class="italic opacity-40">{"{}"}</span>
		{:else if isNarrow && depth > 0}
			<!-- Nested objects on narrow: show keys only -->
			<span class="opacity-50"
				>{"{"}&#8239;{entries.map(([k]) => k).join(", ")}&#8239;{"}"}</span
			>
		{:else}
			<div class={twMerge("flex flex-col", depth > 0 && "ml-2")}>
				{#each entries as [key, v], i (key)}
					<div
						class={twMerge(
							"py-1",
							i > 0 && "border-t border-(--stuic-color-border)",
							isNarrow ? "flex flex-col" : "flex gap-3"
						)}
					>
						<span
							class={twMerge(
								"shrink-0 break-all text-sm opacity-50",
								isNarrow ? "text-xs" : "min-w-24 text-right"
							)}>{key}</span
						>
						<div class="min-w-0 flex-1">
							{#if isNarrow && typeof v === "object" && v !== null}
								<!-- On narrow, collapse complex nested values -->
								{#if Array.isArray(v)}
									<span class="opacity-50">[{v.length}]</span>
								{:else}
									<span class="opacity-50"
										>{"{"}&#8239;{Object.keys(v).join(", ")}&#8239;{"}"}</span
									>
								{/if}
							{:else}
								{@render renderValue(v, depth + 1)}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		{@render renderPrimitive(val)}
	{/if}
{/snippet}

<InputWrap
	{id}
	{label}
	{description}
	{labelAfter}
	{below}
	{required}
	{disabled}
	size={renderSize}
	class={classProp}
	{labelLeft}
	{labelLeftWidth}
	{labelLeftBreakpoint}
	{classLabel}
	{classLabelBox}
	{classInputBox}
	{classInputBoxWrap}
	{classDescBox}
	{classBelowBox}
	{validation}
	{style}
>
	<div class="stuic-input-localized w-full flex">
		<div class="flex-1 min-w-0" bind:clientWidth={contentWidth}>
			{#if editMode}
				<textarea
					bind:value
					{id}
					class={TEXTAREA_CLS}
					{tabindex}
					{disabled}
					use:autogrow={() => ({ enabled: true, value })}
				></textarea>
			{:else}
				<div
					class={twMerge(
						"p-3 text-sm max-h-96 overflow-auto scrollbar-thin",
						isEmpty && "py-2 text-center"
					)}
				>
					{#if isEmpty}
						<!-- <span class="italic opacity-40">&mdash;</span> -->
					{:else}
						{@render renderValue(parsed, 0)}
					{/if}
				</div>
			{/if}
		</div>
		<button
			type="button"
			class={BTN_CLS}
			onclick={toggleMode}
			{disabled}
			use:tooltip={() => ({
				enabled: true,
				content: editMode ? "Apply" : "Edit JSON",
			})}
		>
			{#if editMode}
				{@html iconCheck({ size: 19 })}
			{:else}
				{@html iconPencil({ size: 19 })}
			{/if}
		</button>
	</div>
</InputWrap>

<!-- Hidden input for form submission and validation -->
<input
	type="hidden"
	{name}
	{value}
	bind:this={hiddenInputEl}
	use:validateAction={() => ({
		enabled: !!validate,
		...(typeof validate === "boolean" ? {} : validate),
		setValidationResult,
	})}
/>
