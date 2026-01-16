<script lang="ts" module>
	export interface Props {
		class?: string;
		strokeWidth?: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4;
	}
</script>

<script lang="ts">
	import { twMerge } from "$lib/index.js";

	let { class: classProps, strokeWidth = 2.5 }: Props = $props();

	// size-6 = 1.5rem = 24px
</script>

<svg
	fill="none"
	viewBox="0 0 24 24"
	stroke-width={strokeWidth}
	stroke="currentColor"
	class={twMerge("inline size-6", classProps)}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
