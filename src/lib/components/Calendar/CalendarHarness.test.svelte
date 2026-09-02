<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). A real
	`bind:value` is a live two-way binding that propagates an external write into
	the component (a `rerender` of a component-written $bindable does not), so this
	drives Calendar the way a consumer would and lets a test flip the value.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import Calendar from "./Calendar.svelte";

	let { initial = null as string | null } = $props();
	// Seed once from the prop (this harness never re-receives `initial`).
	let value = $state<string | null>(untrack(() => initial));
	let view = $state<{ year: number; month: number } | undefined>();
</script>

<Calendar bind:value bind:view locale="en-US" />
<button type="button" data-testid="set" onclick={() => (value = "2030-06-15")}>set</button
>
<button type="button" data-testid="clear" onclick={() => (value = null)}>clear</button>
<output data-testid="bound">{value ?? "null"}</output>
<output data-testid="view">{view ? `${view.year}-${view.month}` : ""}</output>
