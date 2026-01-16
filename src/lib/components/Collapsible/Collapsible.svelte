<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface Props {
		/** Content to display */
		children: Snippet;
		/** Number of lines to show when collapsed (default: 1) */
		lines?: number;
		/** Expanded state (bindable) */
		expanded?: boolean;
		/** Collapsed indicator character (default: "↓") */
		collapsedIndicator?: string;
		/** Expanded indicator character (default: "↑") */
		expandedIndicator?: string;
		/** Container class */
		class?: string;
		/** Content wrapper class */
		classContent?: string;
		/** Toggle button class */
		classToggle?: string;
		/** Opacity class for toggle button (default: "opacity-70") */
		toggleOpacity?: string;
		/** Bind reference to container element */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		children,
		lines = 1,
		expanded = $bindable(false),
		collapsedIndicator = "↓",
		expandedIndicator = "↑",
		class: classProp,
		classContent,
		classToggle,
		toggleOpacity = "opacity-75",
		el = $bindable(),
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
</script>

<div
	bind:this={el}
	bind:clientWidth={containerWidth}
	class={twMerge("stuic-collapsible", classProp)}
>
	<div class="flex items-end">
		<div
			bind:this={contentEl}
			class={twMerge("flex-1", !expanded && `line-clamp-${_lines}`, classContent)}
		>
			{@render children()}
		</div>
		{#if needsCollapse}
			<button
				type="button"
				class={twMerge(
					toggleOpacity,
					"hover:opacity-100 cursor-pointer px-2 py-1 -my-1 -mr-2",
					classToggle
				)}
				onclick={() => (expanded = !expanded)}
			>
				{expanded ? expandedIndicator : collapsedIndicator}
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
