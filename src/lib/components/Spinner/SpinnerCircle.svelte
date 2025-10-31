<script lang="ts">
	import { createTickerRAF } from "@marianmeres/ticker";
	import { onDestroy } from "svelte";
	import { oscillate } from "../../utils/oscillate.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Circle from "../Circle/Circle.svelte";

	let {
		class: classProp = "",
		bgStrokeColor = "rgba(0 0 0 / .1)",
	}: { class?: string; bgStrokeColor?: string } = $props();

	/**
	 * NOTE: we happen to have 4 distinct values here which effect the overall look and feel...
	 *  1. the tick frequency
	 *  2. the oscillation time input (seconds)
	 *  3. the oscillation speed factor (1)
	 *  4. the animation-spin duration
	 */

	const ticker = createTickerRAF(50, true);
	let completeness = $derived(oscillate($ticker / 1000, 0.15, 0.85));

	onDestroy(ticker.stop);
</script>

<Circle
	{completeness}
	class={twMerge("stuic-spinner-circle animate-spin", classProp)}
	{bgStrokeColor}
	style="animation-duration: .75s"
/>
