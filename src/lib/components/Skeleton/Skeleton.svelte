<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "class"
	> {
		/** Shape variant */
		variant?: "text" | "circle" | "rectangle";
		/** Width (e.g., "100%", "200px") */
		width?: string;
		/** Height (e.g., "1rem", "40px") */
		height?: string;
		/** Shorthand for circle size (sets both width & height) */
		size?: string;
		/** Number of text lines (for text variant) */
		lines?: number;
		/** Gap between lines (for text variant) */
		gap?: string;
		/** Last line width (for text variant) */
		lastLineWidth?: string;
		/** Animation style */
		animation?: "shimmer" | "pulse" | "none";
		/** Animation duration */
		duration?: string;
		/** Border radius (boolean for default, string for custom) */
		rounded?: boolean | string;
		/** Accessibility label */
		ariaLabel?: string;
		/** Bindable element reference */
		el?: HTMLDivElement;
		/** CSS class */
		class?: string | string[];
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";

	let {
		variant = "rectangle",
		width,
		height,
		size,
		lines = 1,
		gap,
		lastLineWidth = "75%",
		animation = "shimmer",
		duration,
		rounded = true,
		ariaLabel,
		el = $bindable(),
		class: classProp = "",
		...restProps
	}: Props = $props();

	const reduceMotion = prefersReducedMotion();

	const effectiveAnimation = $derived(reduceMotion.current ? "none" : animation);

	const baseClass = $derived(
		twMerge(
			"block",
			effectiveAnimation === "shimmer" && "stuic-skeleton-shimmer",
			effectiveAnimation === "pulse" && "stuic-skeleton-pulse",
			effectiveAnimation === "none" && "bg-[var(--stuic-skeleton-bg)]",
			variant === "circle" && "stuic-skeleton-circle",
			rounded === true && variant !== "circle" && "stuic-skeleton-rounded",
			classProp
		)
	);

	const baseStyle = $derived.by(() => {
		const styles: string[] = [];
		if (duration) styles.push(`--stuic-skeleton-duration: ${duration}`);
		if (variant === "circle" && size) {
			styles.push(`width: ${size}`, `height: ${size}`);
		} else {
			if (width) styles.push(`width: ${width}`);
			if (height) styles.push(`height: ${height}`);
		}
		if (typeof rounded === "string") {
			styles.push(`border-radius: ${rounded}`);
		}
		return styles.join("; ");
	});
</script>

{#if variant === "text" && lines > 1}
	<div
		bind:this={el}
		role="status"
		aria-busy="true"
		aria-label={ariaLabel}
		class="stuic-skeleton-text-container"
		style:gap
		{...restProps}
	>
		{#each Array(lines) as _, i}
			{@const isLast = i === lines - 1}
			<div
				class={baseClass}
				style="{baseStyle}; width: {isLast ? lastLineWidth : width || '100%'}{height
					? `; height: ${height}`
					: ''}"
			></div>
		{/each}
		{#if ariaLabel}
			<span class="sr-only">{ariaLabel}</span>
		{/if}
	</div>
{:else}
	<div
		bind:this={el}
		role="status"
		aria-busy="true"
		aria-label={ariaLabel}
		class={baseClass}
		style={baseStyle}
		{...restProps}
	>
		{#if ariaLabel}
			<span class="sr-only">{ariaLabel}</span>
		{/if}
	</div>
{/if}
