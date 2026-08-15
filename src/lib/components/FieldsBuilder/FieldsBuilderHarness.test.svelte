<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` prop. A real `bind:value` is a live
	two-way binding that DOES propagate, so this harness drives FieldsBuilder the
	way a real consumer would and lets the test flip the external value via a
	button. It also passes a `preview` snippet (snippets cannot be constructed
	from a plain-object props bag in the test file).
-->
<script lang="ts">
	import { untrack } from "svelte";
	import FieldsBuilder from "./FieldsBuilder.svelte";
	import type { FieldDef } from "./types.js";
	import { DEFAULT_FIELD_TYPES } from "./utils.js";

	let { initial = [] as FieldDef[], withPreview = false } = $props();
	// Seed once from the prop (this harness never re-receives `initial`).
	let value = $state<FieldDef[]>(untrack(() => initial));
</script>

{#snippet fieldsPreview({ fields }: { fields: FieldDef[] })}
	<div data-testid="preview-json">{JSON.stringify(fields.map((f) => f.label))}</div>
{/snippet}

<FieldsBuilder
	bind:value
	name="fields"
	label="Fields"
	types={DEFAULT_FIELD_TYPES}
	preview={withPreview ? fieldsPreview : undefined}
	previewBreakpoint={0}
/>

<button
	type="button"
	data-testid="set-external"
	onclick={() => (value = [{ key: "external_field", type: "text", label: "External" }])}
>
	set external
</button>
<output data-testid="bound">{JSON.stringify(value)}</output>
