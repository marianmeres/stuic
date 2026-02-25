<script lang="ts" module>
	import { DevicePointer, twMerge } from "$lib/index.js";
	export interface Props {
		class?: string;
		strokeWidth?: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4;
		linecapRound?: boolean;
	}
</script>

<script lang="ts">
	let { class: classProps, strokeWidth, linecapRound = true }: Props = $props();

	// motivation - make it thicker on mobile, especially for weary eyes
	// (note: dp.isCoarse does not say nothing technically about mobile, but in 90% it will)
	// const dp = new DevicePointer();
	// const auto = $derived(dp.isCoarse ? 3 : 2);

	// if sw not provided use thicker on mobile
	const _strokeWidth = $derived(strokeWidth ?? 1.5);

	const _strokeLinecap = $derived(linecapRound ? "round" : "square");

	// size-6 = 1.5rem = 24px
</script>

<svg
	fill="none"
	viewBox="0 0 24 24"
	stroke-width={_strokeWidth}
	stroke="currentColor"
	class={twMerge("inline size-6", classProps)}
>
	<!-- iconLucideX -->
	<path stroke-linecap={_strokeLinecap} d="M18 6 6 18" />
	<path stroke-linecap={_strokeLinecap} d="m6 6 12 12" />
</svg>
