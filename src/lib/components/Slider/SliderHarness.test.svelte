<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` prop. A real `bind:value` is a live
	two-way binding that DOES propagate — which is also the only way to observe the
	normalization $effect writing back into the binding, so `bound` renders the
	value the *consumer* sees, not the one the component renders internally.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import Slider from "./Slider.svelte";

	let {
		initial = undefined as number | undefined,
		min = 0,
		max = 100,
		step = 1 as number | "any",
		onchange = undefined as ((v: number) => void) | undefined,
	} = $props();
	// Seed once from the prop (this harness never re-receives `initial`).
	let value = $state<number | undefined>(untrack(() => initial));
	// `rerender` would re-apply the initial `value` prop and clobber the binding,
	// so state that must change mid-interaction is toggled from inside instead.
	let disabled = $state(false);
</script>

<Slider
	bind:value
	{min}
	{max}
	{step}
	{disabled}
	{onchange}
	label="Harness"
	data-testid="sl"
	style="width:200px;height:32px"
/>
<button type="button" data-testid="set" onclick={() => (value = 77)}>set 77</button>
<button type="button" data-testid="disable" onclick={() => (disabled = true)}
	>disable</button
>
<output data-testid="bound">{value}</output>
