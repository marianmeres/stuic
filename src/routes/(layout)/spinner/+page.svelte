<script lang="ts">
	import Spinner from "$lib/components/Spinner/Spinner.svelte";
	import SpinnerCircle from "$lib/components/Spinner/SpinnerCircle.svelte";
	import SpinnerUnicode, {
		spinnerCreateBackAndForthCharFrames,
		type SpinnerUnicodeVariant,
	} from "$lib/components/Spinner/SpinnerUnicode.svelte";
	import { createTickerRAF } from "@marianmeres/ticker";
	import { untrack } from "svelte";
	import SpinnerCircleOscillate from "../../../lib/components/Spinner/SpinnerCircleOscillate.svelte";
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

<Spinner />

<hr class="my-6" />

<div class="space-y-6">
	<!-- Thickness variations -->
	<div class="flex items-center space-x-6">
		<Spinner thickness="thin" />
		<Spinner thickness="normal" />
		<Spinner thickness="thick" />
	</div>

	<!-- Height variations -->
	<div class="flex items-center space-x-6">
		<Spinner height="short" />
		<Spinner height="normal" />
		<Spinner height="tall" thickness="thick" rounded={1} />
	</div>

	<!-- Color and direction -->
	<div class="flex items-center space-x-6">
		<Spinner class="text-red-500" />
		<Spinner class="text-blue-600" direction="ccw" />
		<Spinner class="text-green-500" count={12} />
	</div>
</div>

<hr class="my-6" />

<SpinnerCircle />

<hr class="my-6" />

<div class="space-y-6">
	<!-- Thickness variations -->
	<div class="flex items-center space-x-6">
		<SpinnerCircle thickness="thin" />
		<SpinnerCircle thickness="normal" />
		<SpinnerCircle thickness="thick" />
	</div>

	<!-- Size variations using class -->
	<div class="flex items-center space-x-6">
		<SpinnerCircle class="size-4" />
		<SpinnerCircle class="size-6" />
		<SpinnerCircle class="size-10" />
	</div>

	<!-- Color variations via text color -->
	<div class="flex items-center space-x-6">
		<SpinnerCircle class="text-red-500" />
		<SpinnerCircle class="text-blue-600" />
		<SpinnerCircle class="text-green-500 opacity-50" />
	</div>

	<!-- Direction -->
	<div class="flex items-center space-x-6">
		<SpinnerCircle direction="cw" />
		<SpinnerCircle direction="ccw" />
	</div>
</div>

<hr class="my-6" />

<hr class="my-6" />

<div class="flex items-center space-x-4">
	<SpinnerCircleOscillate class="text-red-500" />
	<SpinnerCircleOscillate
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

<hr class="my-6" />

<!-- CSS Variable Customization Examples -->
<h3 class="font-semibold mb-4">CSS Variable Customization</h3>
<div class="space-y-6">
	<!-- Custom opacity and fade -->
	<div class="flex items-center space-x-6">
		<Spinner style="--stuic-spinner-opacity: 1; --stuic-spinner-fade-end-opacity: 0.3;" />
		<span class="text-sm text-neutral-500">Full opacity, softer fade</span>
	</div>

	<!-- Custom thickness via CSS variable -->
	<div class="flex items-center space-x-6">
		<SpinnerCircle style="--stuic-spinner-circle-thickness-normal: 4px;" class="size-8" />
		<span class="text-sm text-neutral-500">Custom border thickness</span>
	</div>

	<!-- Custom duration -->
	<div class="flex items-center space-x-6">
		<SpinnerCircle style="--stuic-spinner-circle-duration: 400ms;" class="text-purple-500" />
		<SpinnerCircle style="--stuic-spinner-circle-duration: 1500ms;" class="text-orange-500" />
		<span class="text-sm text-neutral-500">Fast and slow via CSS variable</span>
	</div>

	<!-- Custom unicode font size -->
	<div class="flex items-center space-x-6">
		<SpinnerUnicode style="--stuic-spinner-unicode-font-size: 2rem;" variant="braille_bar" />
		<span class="text-sm text-neutral-500">Larger unicode spinner</span>
	</div>
</div>
