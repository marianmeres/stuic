<script lang="ts" module>
	export interface Props {
		class?: string;
		count?: number;
		thickness?: "thin" | "normal" | "thick";
		height?: "short" | "normal" | "tall";
		direction?: "cw" | "ccw";
	}
</script>

<script lang="ts">
	let {
		class: classProp,
		count = 8,
		thickness = "normal",
		height = "normal",
		direction = "cw",
	}: Props = $props();

	const thicknessMap: Record<NonNullable<Props["thickness"]>, number> = {
		thin: 2,
		normal: 3,
		thick: 4,
	};
	const heightMap: Record<NonNullable<Props["height"]>, number> = {
		short: 5,
		normal: 7,
		tall: 10,
	};

	const barHeight = $derived(heightMap[height]);
	const barWidth = $derived(thicknessMap[thickness]);
	const size = $derived(barHeight * 3);
	const center = $derived(size / 2);
</script>

<div class="spinner {classProp ?? ''}" style:--size="{size}px">
	{#each Array(count) as _, i}
		{@const angle = (360 / count) * i}
		{@const delay = direction === "ccw" ? i / count : (count - i) / count}
		<span
			class="bar"
			style:width="{barWidth}px"
			style:height="{barHeight}px"
			style:transform-origin="center {center}px"
			style:transform="translateX(-50%) rotate({angle}deg)"
			style:animation-delay="{-delay}s"
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
		border-radius: 1px;
		animation: fade 1s linear infinite;
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
