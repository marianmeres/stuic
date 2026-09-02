<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` props. Real `bind:start` /
	`bind:end` are live two-way bindings that DO propagate — which is also the only
	way to observe the normalization $effect writing back into the bindings, so
	`bound` renders the values the *consumer* sees, not the ones the component
	renders internally.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import RangeSlider, { type RangeSliderValue } from "./RangeSlider.svelte";

	let {
		initialStart = undefined as number | undefined,
		initialEnd = undefined as number | undefined,
		min = 0,
		max = 100,
		step = 1 as number | "any",
		minRange = 0,
		onchange = undefined as ((v: RangeSliderValue) => void) | undefined,
	} = $props();
	// Seed once from the props (this harness never re-receives them).
	let start = $state<number | undefined>(untrack(() => initialStart));
	let end = $state<number | undefined>(untrack(() => initialEnd));
	// `rerender` would re-apply the initial props and clobber the bindings, so
	// state that must change mid-interaction is toggled from inside instead.
	let disabled = $state(false);
</script>

<RangeSlider
	bind:start
	bind:end
	{min}
	{max}
	{step}
	{minRange}
	{disabled}
	{onchange}
	label="Harness"
	data-testid="rs"
	style="width:200px;height:32px"
/>
<button
	type="button"
	data-testid="set"
	onclick={() => {
		start = 30;
		end = 70;
	}}>set 30..70</button
>
<button type="button" data-testid="disable" onclick={() => (disabled = true)}
	>disable</button
>
<output data-testid="bound">{start},{end}</output>
