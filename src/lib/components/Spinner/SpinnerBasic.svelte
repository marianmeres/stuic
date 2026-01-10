<script lang="ts" module>
	export interface Props {
		class?: string;
		/** One "loop" duration in ms */
		duration?: number;
		/** Border thickness preset */
		thickness?: "normal" | "thin" | "thick";
		/** Rotation direction */
		direction?: "cw" | "ccw";
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		class: classProp,
		duration = 750,
		thickness = "normal",
		direction = "cw",
	}: Props = $props();

	let _thickness = $derived(
		"thickness-" +
			(["normal", "thin", "thick"].includes(thickness) ? thickness : "normal")
	);
</script>

<span
	class={twMerge("stuic-spinner-basic inline-block size-5", _thickness, classProp)}
	style="animation-duration: {duration}ms; animation-direction: {direction === 'ccw'
		? 'reverse'
		: 'normal'};"
></span>

<style>
	.stuic-spinner-basic {
		box-sizing: border-box;
		border-radius: 50%;
		border-style: solid;
		border-color: currentColor;
		border-top-color: transparent;
		animation: spin linear infinite;
	}

	/* Thickness presets */
	.stuic-spinner-basic.thickness-thin {
		border-width: 1px;
	}
	.stuic-spinner-basic.thickness-normal {
		border-width: 2px;
	}
	.stuic-spinner-basic.thickness-thick {
		border-width: 4px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
