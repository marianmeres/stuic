<script lang="ts" module>
	export interface Props {
		class?: string;
		style?: string;
		count?: number;
		thickness?: "thin" | "normal" | "thick";
		size?: "sm" | "md" | "lg";
		direction?: "cw" | "ccw";
		rounded?: number;
		duration?: number;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		class: classProp,
		style: styleProp,
		count = 8,
		thickness = "normal",
		size = "md",
		direction = "cw",
		rounded = 2,
		duration = 750,
	}: Props = $props();

	const thicknessMap: Record<NonNullable<Props["thickness"]>, number> = {
		thin: 1,
		normal: 2,
		thick: 4,
	};
	const sizeMap: Record<NonNullable<Props["size"]>, number> = {
		sm: 5,
		md: 6,
		lg: 10,
	};

	const barLength = $derived(sizeMap[size]);
	const barWidth = $derived(thicknessMap[thickness]);
	const containerSize = $derived(barLength * 3);
	const center = $derived(containerSize / 2);
	const barHeight = $derived(barLength - 1);
</script>

<div
	class={twMerge("stuic-spinner", classProp)}
	style="{styleProp ?? ''}; width: {containerSize}px; height: {containerSize}px; --stuic-spinner-duration: {duration}ms;"
>
	{#each Array(count) as _, i}
		{@const angle = (360 / count) * i}
		{@const delay = direction === "ccw" ? i / count : (count - i) / count}
		<span
			class="stuic-spinner-bar"
			style:width="{barWidth}px"
			style:height="{barHeight}px"
			style:border-radius="{rounded}px"
			style:transform-origin="center {center}px"
			style:transform="translateX(-50%) rotate({angle}deg)"
			style:animation-delay="{-delay * duration}ms"
		></span>
	{/each}
</div>
