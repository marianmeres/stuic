<script lang="ts" module>
	export interface Props {
		class?: string;
		style?: string;
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
		style: styleProp,
		duration = 750,
		thickness = "normal",
		direction = "cw",
	}: Props = $props();

	let _thickness = $derived(
		["normal", "thin", "thick"].includes(thickness) ? thickness : "normal"
	);
</script>

<span
	class={twMerge("stuic-spinner-circle size-4", classProp)}
	data-thickness={_thickness}
	style="{styleProp ?? ''}; --stuic-spinner-circle-duration: {duration}ms; animation-direction: {direction === 'ccw' ? 'reverse' : 'normal'};"
></span>
