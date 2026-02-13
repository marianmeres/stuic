<script lang="ts" module>
	export interface Props {
		class?: string;
		bgStrokeColor?: string;
		strokeWidth?: number;
		noOscillate?: boolean;
		rotateDuration?: string;
	}
</script>

<script lang="ts">
	import { createTickerRAF } from "@marianmeres/ticker";
	import { onDestroy } from "svelte";
	import { oscillate } from "../../utils/oscillate.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Circle from "../Circle/Circle.svelte";

	let {
		class: classProp = "",
		bgStrokeColor,
		strokeWidth,
		noOscillate,
		rotateDuration,
	}: Props = $props();

	// Use CSS variable as default when bgStrokeColor is not provided
	const _bgStrokeColor = $derived(
		bgStrokeColor ?? "var(--stuic-spinner-circle-oscillate-bg-stroke)"
	);

	/**
	 * NOTE: we happen to have 4 distinct values here which effect the overall look and feel...
	 *  1. the tick frequency
	 *  2. the oscillation time input (seconds)
	 *  3. the oscillation speed factor (1)
	 *  4. the animation-spin duration
	 */

	const ticker = createTickerRAF(50, true);
	let completeness = $derived(noOscillate ? 0.66 : oscillate($ticker / 1000, 0.15, 0.85));

	onDestroy(ticker.stop);
</script>

<Circle
	animateCompletenessMs={0}
	{completeness}
	class={twMerge("stuic-spinner-circle-oscillate", classProp)}
	bgStrokeColor={_bgStrokeColor}
	{strokeWidth}
	style={rotateDuration
		? `--stuic-spinner-circle-oscillate-duration: ${rotateDuration}`
		: undefined}
/>
