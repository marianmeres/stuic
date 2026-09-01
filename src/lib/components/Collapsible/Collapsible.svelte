<script lang="ts" module>
	import type { Snippet } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import { tooltip } from "../../actions/index.js";
	import { autoHeight } from "../../attachments/index.js";
	import { iconChevronDown } from "../../icons/index.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import type { TranslateFn } from "../../types.js";

	/**
	 * Vertical alignment of the toggle button relative to the content:
	 * - `"bottom"` — always next to the last (clamped) line. Default, historical behavior.
	 * - `"top"` — always at the top of the content, in both states.
	 * - `"top-when-expanded"` — bottom while collapsed, top once expanded, so the toggle
	 *   does not run away down a long expanded block.
	 */
	export type CollapsibleToggleAlign = "bottom" | "top" | "top-when-expanded";

	export interface Props {
		/** Content to display */
		children: Snippet;
		/** Number of lines to show when collapsed (default: 1) */
		lines?: number;
		/** Expanded state (bindable) */
		expanded?: boolean;
		/**
		 * Collapsed indicator character. Omit both indicators (the default) to get the
		 * rotating chevron; providing either one switches to plain text indicators
		 * (the omitted one falls back to the legacy "↓"/"↑" arrow).
		 */
		collapsedIndicator?: string;
		/**
		 * Expanded indicator character. Omit both indicators (the default) to get the
		 * rotating chevron; providing either one switches to plain text indicators
		 * (the omitted one falls back to the legacy "↓"/"↑" arrow).
		 */
		expandedIndicator?: string;
		/**
		 * Opt-in: smoothly animate the height between the collapsed and expanded state
		 * instead of snapping. Respects `prefers-reduced-motion` (snaps when reduce is
		 * set). Default: false.
		 */
		animate?: boolean;
		/**
		 * Opt-in: where to vertically align the toggle button. Default: `"bottom"`
		 * (always next to the last clamped line — the historical behavior).
		 */
		toggleAlign?: CollapsibleToggleAlign;
		/** Container class */
		class?: string;
		/** Content wrapper class */
		classContent?: string;
		/** Toggle button class */
		classToggle?: string;
		/** Inline styles (for CSS variable overrides) */
		style?: string;
		/** Bind reference to container element */
		el?: HTMLDivElement;
		/** Optional translate function */
		t?: TranslateFn;
	}

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			more: "More...",
			less: "Less...",
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}
</script>

<script lang="ts">
	let {
		children,
		lines = 1,
		expanded = $bindable(false),
		collapsedIndicator,
		expandedIndicator,
		animate = false,
		toggleAlign = "bottom",
		class: classProp,
		classContent,
		classToggle,
		style,
		el = $bindable(),
		t = t_default,
	}: Props = $props();

	let contentEl: HTMLDivElement | undefined;
	let containerWidth = $state(0);
	let needsCollapse = $state(false);

	$effect(() => {
		// Only measure when collapsed (line-clamp applied) to detect if truncation is needed
		// containerWidth dependency ensures re-measurement on resize
		if (contentEl && !expanded && containerWidth) {
			needsCollapse = contentEl.scrollHeight > contentEl.clientHeight;
		}
	});

	// normalize, range validation
	let _lines = $derived.by(() => {
		const l = Math.abs(lines);
		return l > 10 ? 10 : l;
	});

	// The rotating chevron is the default indicator. Passing either custom indicator
	// opts back into plain text; the unspecified one keeps its historical arrow.
	let useChevron = $derived(
		collapsedIndicator === undefined && expandedIndicator === undefined
	);
	let textIndicator = $derived(
		expanded ? (expandedIndicator ?? "↑") : (collapsedIndicator ?? "↓")
	);

	let label = $derived(expanded ? t("less") : t("more"));

	let _align = $derived(
		toggleAlign === "top" || (toggleAlign === "top-when-expanded" && expanded)
			? "items-start"
			: "items-end"
	);
</script>

{#snippet content()}
	<div
		bind:this={contentEl}
		class={twMerge("flex-1", !expanded && `line-clamp-${_lines}`, classContent)}
	>
		{@render children()}
	</div>
{/snippet}

<div
	bind:this={el}
	bind:clientWidth={containerWidth}
	class={twMerge("stuic-collapsible", classProp)}
	{style}
>
	<div class={twMerge("flex", _align)}>
		{#if animate}
			<!-- Height-animated viewport: `autoHeight` drives this box to the natural
			     height of the (un)clamped content and clips while it transits. Only
			     rendered when the opt-in is active, so the default output is unchanged. -->
			<div class="stuic-collapsible-viewport flex-1" {@attach autoHeight}>
				{@render content()}
			</div>
		{:else}
			{@render content()}
		{/if}
		{#if needsCollapse}
			<button
				type="button"
				class={twMerge(
					"stuic-collapsible-toggle cursor-pointer -my-1 -mr-2",
					classToggle
				)}
				aria-expanded={expanded}
				aria-label={label}
				onclick={() => (expanded = !expanded)}
				use:tooltip={() => ({ content: label })}
			>
				{#if useChevron}
					{@html iconChevronDown({
						class: "stuic-collapsible-chevron",
						"aria-hidden": "true",
					})}
				{:else}
					{textIndicator}
				{/if}
			</button>
		{/if}
	</div>
</div>

<!-- 
DO NOT REMOVE: Food for TW compiler
line-clamp-1
line-clamp-2
line-clamp-3
line-clamp-4
line-clamp-5
line-clamp-6
line-clamp-7
line-clamp-8
line-clamp-9
line-clamp-10
-->
