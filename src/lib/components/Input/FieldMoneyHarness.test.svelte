<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` prop. A real `bind:value` is a live
	two-way binding that DOES propagate, so this harness drives FieldMoney the way
	a real consumer would and lets the test flip the external value via a button.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import FieldMoney from "./FieldMoney.svelte";

	let { initial = null as number | string | null } = $props();
	// Seed once from the prop (this harness never re-receives `initial`).
	let value = $state<number | string | null>(untrack(() => initial));
</script>

<FieldMoney label="Price" name="price" bind:value />
<button type="button" data-testid="set" onclick={() => (value = 2500)}>set 2500</button>
<output data-testid="bound">{value}</output>
