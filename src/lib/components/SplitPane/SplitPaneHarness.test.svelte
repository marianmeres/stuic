<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). A live
	`bind:size` is the only way to observe the component writing back into the
	binding (a stored size on mount, clamping of a consumer's write), and `disabled`
	has to flip from inside, since `rerender` would clobber the binding.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import SplitPane, { type Props } from "./SplitPane.svelte";

	let {
		initialSize = undefined as number | undefined,
		units = "%" as Props["units"],
		min = 0,
		max = 0,
		orientation = "horizontal" as Props["orientation"],
		primary = "start" as Props["primary"],
		key = undefined as string | undefined,
		onResize = undefined as Props["onResize"],
	} = $props();

	// Seed once from the props (this harness never re-receives them).
	let size = $state<number | undefined>(untrack(() => initialSize));
	let disabled = $state(false);
	let pane: SplitPane | undefined = $state();
</script>

<SplitPane
	bind:this={pane}
	bind:size
	{units}
	{min}
	{max}
	{orientation}
	{primary}
	{key}
	{disabled}
	{onResize}
	data-testid="sp"
	style="width:400px;height:200px"
>
	{#snippet start()}<div data-testid="a">A</div>{/snippet}
	{#snippet end()}<div data-testid="b">B</div>{/snippet}
</SplitPane>
<button type="button" data-testid="set" onclick={() => (size = 30)}>set 30</button>
<button type="button" data-testid="set-big" onclick={() => (size = 999)}>set 999</button>
<button type="button" data-testid="reset" onclick={() => pane?.reset()}>reset</button>
<button type="button" data-testid="toggle-disabled" onclick={() => (disabled = !disabled)}
	>toggle disabled</button
>
<output data-testid="bound">{size}</output>
