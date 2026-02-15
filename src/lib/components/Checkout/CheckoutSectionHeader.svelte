<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "title"
	> {
		unstyled?: boolean;
		class?: string;
		classLeft?: string;
		classRight?: string;
		children: Snippet;
		right?: Snippet;
		noMinHeight?: boolean;
	}
</script>

<script lang="ts">
	let {
		unstyled = false,
		class: classProp,
		classLeft,
		classRight,
		children,
		right,
		noMinHeight = false,
	}: Props = $props();

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-section-header", classProp)
	);
</script>

<div class={_class} data-min-height={!noMinHeight ? true : undefined}>
	<div class="left {classLeft}">
		{@render children()}
	</div>
	<div class="right {classRight}">
		{@render right?.()}
	</div>
</div>
