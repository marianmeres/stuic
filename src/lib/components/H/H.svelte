<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type HLevel = 1 | 2 | 3 | 4 | 5 | 6;

	export interface Props extends Omit<
		HTMLAttributes<HTMLHeadingElement>,
		"children" | "class"
	> {
		/** Heading level (1-6), determines the semantic HTML element (h1-h6) */
		level?: HLevel;
		/** Visual level override — renders the semantic `level` tag but styles it as this level */
		renderLevel?: HLevel;
		/** If true, disables all default styling */
		unstyled?: boolean;
		/** CSS class override */
		class?: string;
		/** Inline styles */
		style?: string;
		/** Bindable element reference */
		el?: HTMLHeadingElement;
		/** Content */
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		level = 2,
		renderLevel,
		unstyled = false,
		class: classProp,
		style,
		el = $bindable(),
		children,
		...restProps
	}: Props = $props();

	const tags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

	let tag = $derived(tags[level - 1]);
	let visualLevel = $derived(renderLevel || level);
	let _class = $derived(unstyled ? classProp : twMerge("stuic-h", classProp));
</script>

<svelte:element
	this={tag}
	bind:this={el}
	data-level={!unstyled ? visualLevel : undefined}
	class={_class}
	{style}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
