<script lang="ts">
	import { createTickerRAF } from "@marianmeres/ticker";
	import Circle from "../Circle/Circle.svelte";
	import { oscillate } from "../../utils/oscillate.js";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		class: classProp = "",
		bgStrokeColor = "rgba(0 0 0 / .1)",
	}: { class?: string; bgStrokeColor?: string } = $props();

	const ticker = createTickerRAF(50, true);

	let completeness = $derived(oscillate($ticker / 1000, 0.15, 0.85, 1));
</script>

<Circle {completeness} class={twMerge("animate-spin", classProp)} {bgStrokeColor} />
