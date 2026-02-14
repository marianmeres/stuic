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
		children: Snippet;
		right?: Snippet;
	}
</script>

<script lang="ts">
	let { unstyled = false, class: classProp, children, right }: Props = $props();

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-section-header", classProp)
	);
</script>

<div class={_class}>
	<div class="left">
		{@render children()}
	</div>
	<div class="right">
		{@render right?.()}
	</div>
</div>
