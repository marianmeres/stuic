<script lang="ts" module>
	export interface Props {
		class?: string;
		count?: number;
		thickness?: "thin" | "normal" | "thick";
		height?: "short" | "normal" | "tall";
		direction?: "cw" | "ccw";
		rounded?: number;
		duration?: number;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		class: classProp,
		count = 8,
		thickness = "normal",
		height = "normal",
		direction = "cw",
		rounded = 2,
		duration = 750,
	}: Props = $props();

	const thicknessMap: Record<NonNullable<Props["thickness"]>, number> = {
		thin: 1,
		normal: 2,
		thick: 4,
	};
	const heightMap: Record<NonNullable<Props["height"]>, number> = {
		short: 5,
		normal: 6,
		tall: 10,
	};

	const barLength = $derived(heightMap[height]);
	const barWidth = $derived(thicknessMap[thickness]);
	const size = $derived(barLength * 3);
	const center = $derived(size / 2);
	const barHeight = $derived(barLength - 1);
</script>

<div
	class={twMerge("spinner opacity-80", classProp)}
	style:--size="{size}px"
	style:--duration="{duration}ms"
>
	{#each Array(count) as _, i}
		{@const angle = (360 / count) * i}
		{@const delay = direction === "ccw" ? i / count : (count - i) / count}
		<span
			class="bar"
			style:width="{barWidth}px"
			style:height="{barHeight}px"
			style:border-radius="{rounded}px"
			style:transform-origin="center {center}px"
			style:transform="translateX(-50%) rotate({angle}deg)"
			style:animation-delay="{-delay * duration}ms"
		></span>
	{/each}
</div>

<style>
	.spinner {
		position: relative;
		width: var(--size);
		height: var(--size);
	}

	.bar {
		position: absolute;
		left: 50%;
		top: 0px;
		background: currentColor;
		animation: fade var(--duration) linear infinite;
	}

	@keyframes fade {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.12;
		}
	}
</style>
