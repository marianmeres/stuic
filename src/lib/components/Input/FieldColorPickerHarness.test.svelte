<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` prop. A real `bind:value` is a live
	two-way binding that DOES propagate, so this harness drives FieldColorPicker the
	way a real consumer would and lets the test flip the external value via a button.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import FieldColorPicker from "./FieldColorPicker.svelte";

	let { initial = "" } = $props();
	// Seed once from the prop (this harness never re-receives `initial`).
	let value = $state<string>(untrack(() => initial));
</script>

<FieldColorPicker
	label="Accent"
	name="accent"
	palette={["#ff0000", "#00ff00", "#0000ff"]}
	bind:value
/>
<button type="button" data-testid="set" onclick={() => (value = "#0000ff")}>set</button>
<output data-testid="bound">{value}</output>
