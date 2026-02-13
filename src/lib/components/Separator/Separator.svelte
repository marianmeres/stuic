<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	export interface Props
		extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "class" | "role"> {
		/** Separator orientation */
		orientation?: "horizontal" | "vertical";
		/** If true, separator is purely decorative (sets aria-hidden, removes role) */
		decorative?: boolean;
		/** If true, disables all default styling */
		unstyled?: boolean;
		/** CSS class override */
		class?: string;
		/** Inline styles */
		style?: string;
		/** Bindable element reference */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		orientation = "horizontal",
		decorative = false,
		unstyled = false,
		class: classProp,
		style,
		el = $bindable(),
		...restProps
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-separator", classProp));
</script>

<div
	bind:this={el}
	role={decorative ? undefined : "separator"}
	aria-orientation={decorative ? undefined : orientation}
	aria-hidden={decorative ? "true" : undefined}
	data-orientation={orientation}
	class={_class}
	{style}
	{...restProps}
></div>
