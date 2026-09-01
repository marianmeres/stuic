<script lang="ts" module>
	import type { HTMLAttributes, HTMLAnchorAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";

	export type StatTrend = "up" | "down" | "flat";

	export type StatTrendIntent =
		"auto" | "success" | "destructive" | "warning" | "neutral";

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "title"
	> {
		/** Small label above the value (metric name, e.g. "Revenue") */
		label?: THC;
		/** The primary metric value, preformatted (e.g. "$45,231.89") */
		value?: THC | number;
		/** Delta/change indicator, preformatted (e.g. "+20.1%") */
		delta?: THC | number;
		/** Trend direction — drives the arrow and (via `trendIntent="auto"`) the delta color */
		trend?: StatTrend;
		/**
		 * Delta color semantics. "auto" (default) maps up→success, down→destructive,
		 * flat→neutral. Set explicitly for metrics where down is good (churn, costs):
		 * e.g. `trend="down" trendIntent="success"`.
		 */
		trendIntent?: StatTrendIntent;
		/** Show the trend direction arrow next to the delta */
		showTrendArrow?: boolean;
		/** Secondary text next to the delta (e.g. "vs. last month") */
		hint?: THC;
		/** When provided, the stat renders as <a> */
		href?: string;
		/** Disabled state */
		disabled?: boolean;
		/** Override the entire stat body */
		children?: Snippet;
		/** Icon area in the top-right corner (next to the label) */
		renderIcon?: Snippet;
		/** Footer area (sparkline, actions, metadata, etc.) */
		renderFooter?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for the label */
		classLabel?: string;
		/** Class for the value */
		classValue?: string;
		/** Class for the delta */
		classDelta?: string;
		/** Class for the hint */
		classHint?: string;
		/** Class for the footer area */
		classFooter?: string;
		/** Bindable element reference */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";
	import { iconTrendingUp, iconTrendingDown, iconMinus } from "../../icons/index.js";

	let {
		label,
		value,
		delta,
		trend,
		trendIntent = "auto",
		showTrendArrow = true,
		hint,
		href,
		disabled = false,
		children,
		renderIcon,
		renderFooter,
		unstyled = false,
		class: classProp,
		classLabel: classLabelProp,
		classValue: classValueProp,
		classDelta: classDeltaProp,
		classHint: classHintProp,
		classFooter: classFooterProp,
		el = $bindable(),
		onclick,
		...rest
	}: Props = $props();

	const TREND_ICONS: Record<StatTrend, () => string> = {
		up: () => iconTrendingUp(),
		down: () => iconTrendingDown(),
		flat: () => iconMinus(),
	};

	let _value = $derived(typeof value === "number" ? String(value) : value);
	let _delta = $derived(typeof delta === "number" ? String(delta) : delta);

	let _resolvedTrendIntent = $derived.by(() => {
		if (trendIntent !== "auto") return trendIntent;
		if (trend === "up") return "success";
		if (trend === "down") return "destructive";
		return "neutral";
	});

	let _showArrow = $derived(showTrendArrow && !!trend);
	let _hasDelta = $derived((delta !== undefined && delta !== null) || _showArrow);
	let _hasHeader = $derived(!!(label || renderIcon));
	let _hasMeta = $derived(_hasDelta || !!hint);

	let _class = $derived(unstyled ? classProp : twMerge("stuic-stat", classProp));
	let _classLabel = $derived(
		unstyled ? classLabelProp : twMerge("stuic-stat-label", classLabelProp)
	);
	let _classValue = $derived(
		unstyled ? classValueProp : twMerge("stuic-stat-value", classValueProp)
	);
	let _classDelta = $derived(
		unstyled ? classDeltaProp : twMerge("stuic-stat-delta", classDeltaProp)
	);
	let _classHint = $derived(
		unstyled ? classHintProp : twMerge("stuic-stat-hint", classHintProp)
	);
	let _classFooter = $derived(
		unstyled ? classFooterProp : twMerge("stuic-stat-footer", classFooterProp)
	);
</script>

{#snippet statInner()}
	{#if children}
		{@render children()}
	{:else}
		{#if _hasHeader}
			<div class={unstyled ? undefined : "stuic-stat-header"}>
				{#if label}
					<div class={_classLabel}>
						<Thc thc={label} />
					</div>
				{/if}
				{#if renderIcon}
					<div class={unstyled ? undefined : "stuic-stat-icon"}>
						{@render renderIcon()}
					</div>
				{/if}
			</div>
		{/if}
		{#if _value !== undefined && _value !== null}
			<div class={_classValue}>
				<Thc thc={_value} />
			</div>
		{/if}
		{#if _hasMeta}
			<div class={unstyled ? undefined : "stuic-stat-meta"}>
				{#if _hasDelta}
					<span class={_classDelta}>
						{#if _showArrow && trend}
							<span
								class={unstyled ? undefined : "stuic-stat-trend-arrow"}
								aria-hidden="true"
							>
								{@html TREND_ICONS[trend]()}
							</span>
						{/if}
						{#if _delta !== undefined && _delta !== null}
							<Thc thc={_delta} />
						{/if}
					</span>
				{/if}
				{#if hint}
					<span class={_classHint}>
						<Thc thc={hint} />
					</span>
				{/if}
			</div>
		{/if}
		{#if renderFooter}
			<div class={_classFooter}>
				{@render renderFooter()}
			</div>
		{/if}
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		bind:this={el}
		class={_class}
		data-trend={!unstyled && trend ? trend : undefined}
		data-trend-intent={!unstyled && _hasDelta ? _resolvedTrendIntent : undefined}
		data-interactive={!unstyled ? "" : undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		aria-disabled={disabled ? "true" : undefined}
		{...rest as HTMLAnchorAttributes}
	>
		{@render statInner()}
	</a>
{:else if onclick}
	<button
		type="button"
		bind:this={el}
		class={_class}
		data-trend={!unstyled && trend ? trend : undefined}
		data-trend-intent={!unstyled && _hasDelta ? _resolvedTrendIntent : undefined}
		data-interactive={!unstyled ? "" : undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		{disabled}
		{onclick}
		{...rest as any}
	>
		{@render statInner()}
	</button>
{:else}
	<div
		bind:this={el}
		class={_class}
		data-trend={!unstyled && trend ? trend : undefined}
		data-trend-intent={!unstyled && _hasDelta ? _resolvedTrendIntent : undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		{...rest}
	>
		{@render statInner()}
	</div>
{/if}
