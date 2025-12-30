<script lang="ts">
	import Spinner from "$lib/components/Spinner/Spinner.svelte";
	import SpinnerUnicode, {
		spinnerCreateBackAndForthCharFrames,
		type SpinnerUnicodeVariant,
	} from "$lib/components/Spinner/SpinnerUnicode.svelte";
	import { createTickerRAF } from "@marianmeres/ticker";
	import { untrack } from "svelte";
	import SpinnerCircle from "../../../lib/components/Spinner/SpinnerCircle.svelte";
	import { oscillate } from "../../../lib/utils/oscillate.js";

	let w = ["w-4", "w-5", "w-8", "w-16"];
	let size = $state(1);
	let count = $state(8);
	let duration = $state(750);

	const unicodeVariants: SpinnerUnicodeVariant[] = [
		"braille_bar_dot",
		"braille_bar",
		"braille_dot_circle",
		"braille_dot_bounce",
		"half_circle",
		"quarter_circle",
		"ascii",
		"bar_v",
		"bar_h",
		"shade",
		"arrows",
		"arrows2",
		"asterix",
		"asterix2",
		"asterix3",
		"asterix4",
		"asterix5",
	];

	const ticker = createTickerRAF(50, true);
	let completeness = $derived(oscillate($ticker / 1000, 0.1, 0.9, 1));
	// let completeness = 0.5;
	let rotate = $state(45);

	$effect(() => {
		// $ticker && rotate++;
		if ($ticker) {
			untrack(() => {
				rotate += 20;
			});
		}
		// console.log($ticker / 1000);
	});

	// let rotate = $derived($ticker ? _counter++ : _counter);

	// $inspect(12312, rotate);

	// let completeness = 0.5;

	// let circleEl: HTMLDivElement = $state()!;
	// $effect(() => {
	// 	circleEl.innerHTML = "";
	// 	circleEl.appendChild(
	// 		svgCircle({
	// 			completeness,
	// 			strokeWidth: 10,
	// 			strokeWidthRatio: 0.5,
	// 			// rotate: -90,
	// 			class: "text-red-500", //
	// 			bgColor: "#ddd",
	// 			roundedEdges: true,
	// 		})
	// 	);
	// });
</script>

<div class="flex items-center space-x-6">
	<span class="flex items-center space-x-2">
		<input type="range" bind:value={count} min={3} max={12} step="1" />
		<span>{count}</span>
	</span>
	<span class="flex items-center space-x-2">
		<input type="range" bind:value={duration} min={400} max={2000} step="100" />
		<span>{duration}</span>
	</span>
	<span class="flex items-center space-x-2">
		<input type="range" bind:value={size} min={0} max={3} step="1" />
		<span>{w[size]}</span>
	</span>
</div>

<div class="space-y-6 mt-6">
	<div class="space-x-6">
		<Spinner class={w[size]} {count} {duration} thickness="thin" height="short" />
		<Spinner class={w[size]} {count} {duration} thickness="thin" height="normal" />
		<Spinner class={w[size]} {count} {duration} thickness="thin" height="tall" />
	</div>
	<div class="space-x-6">
		<Spinner class={w[size]} {count} {duration} thickness="normal" height="short" />
		<Spinner class={w[size]} {count} {duration} thickness="normal" height="normal" />
		<Spinner class={w[size]} {count} {duration} thickness="normal" height="tall" />
	</div>
	<div class="space-x-6">
		<Spinner class={w[size]} {count} {duration} thickness="thick" height="short" />
		<Spinner class={w[size]} {count} {duration} thickness="thick" height="normal" />
		<Spinner class={w[size]} {count} {duration} thickness="thick" height="tall" />
	</div>
</div>

<hr class="my-6" />

<div class="flex items-center space-x-4">
	<SpinnerCircle class="text-red-500" />
	<SpinnerCircle
		class="text-blue-600 size-5"
		strokeWidth={6}
		bgStrokeColor=""
		noOscillate
	/>
</div>

<hr class="my-6" />

<div class="space-x-4">
	{#each unicodeVariants as variant}
		<SpinnerUnicode {variant} />
	{/each}
</div>

<div class="space-x-4">
	{#each unicodeVariants as variant}
		{#if !/asterix/.test(variant)}
			<SpinnerUnicode {variant} reversed />
		{/if}
	{/each}
</div>

<hr class="my-6" />

<SpinnerUnicode
	class="font-sans text-sm text-red-500"
	speed={130}
	frames={spinnerCreateBackAndForthCharFrames(5, "■", "□")}
/>
<hr class="my-6" />

<SpinnerUnicode
	class="text-sm text-blue-600 font-mono"
	speed={130}
	frames={spinnerCreateBackAndForthCharFrames(5, "_", "-")}
/>
