<script lang="ts" module>
	import { DevicePointer, twMerge } from "$lib/index.js";
	export interface Props {
		class?: string;
		strokeWidth?: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4;
	}
</script>

<script lang="ts">
	let { class: classProps, strokeWidth }: Props = $props();

	const dp = new DevicePointer();
	const auto = $derived(dp.isCoarse ? 3 : 2);

	// if sw not provided use thicker on mobile
	const _strokeWidth = $derived(strokeWidth ?? auto);

	// size-6 = 1.5rem = 24px
</script>

<svg
	fill="none"
	viewBox="0 0 24 24"
	stroke-width={_strokeWidth}
	stroke="currentColor"
	class={twMerge("inline size-6", classProps)}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
