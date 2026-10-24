<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` prop. A real `bind:value` is a live
	two-way binding that DOES propagate, so this harness drives FieldStruct the way
	a real consumer would and lets the test flip the external value / the field
	list / readonly via buttons. It also wraps the field in a <form> (FormData +
	Enter-submit contracts) and passes a `cell` snippet (snippets cannot be
	constructed from a plain-object props bag in the test file).
-->
<script lang="ts">
	import { untrack } from "svelte";
	import FieldStruct, {
		type FieldStructCellContext,
		type FieldStructField,
		type FieldStructValue,
	} from "./FieldStruct.svelte";

	let {
		initial = {} as FieldStructValue,
		initialFields = [] as FieldStructField[],
		withCell = false,
		initialReadonly = false,
	} = $props();
	// Seed once from the props (this harness never re-receives them).
	let value = $state<FieldStructValue>(untrack(() => initial));
	let fields = $state<FieldStructField[]>(untrack(() => initialFields));
	let readonly = $state(untrack(() => initialReadonly));
	let submitted = $state(0);
</script>

{#snippet customCell(ctx: FieldStructCellContext)}
	<input
		type="text"
		data-testid="custom-{ctx.field.key}"
		id={ctx.id}
		value={String(ctx.value ?? "")}
		aria-invalid={ctx.invalid || undefined}
		aria-describedby={ctx.describedby}
		disabled={ctx.disabled}
		oninput={(e) => ctx.setValue(e.currentTarget.value)}
	/>
{/snippet}

<form
	data-testid="form"
	onsubmit={(e) => {
		e.preventDefault();
		submitted++;
	}}
>
	<FieldStruct
		bind:value
		name="address"
		label="Address"
		{fields}
		{readonly}
		cell={withCell ? customCell : undefined}
	/>
	<button type="submit" data-testid="submit">submit</button>
</form>

<button
	type="button"
	data-testid="set-external"
	onclick={() => (value = { street: "External", zip: "999" })}
>
	set external
</button>
<button
	type="button"
	data-testid="drop-field"
	onclick={() => (fields = fields.slice(0, -1))}
>
	drop field
</button>
<button
	type="button"
	data-testid="toggle-readonly"
	onclick={() => (readonly = !readonly)}
>
	toggle readonly
</button>
<output data-testid="bound">{JSON.stringify(value)}</output>
<output data-testid="submitted">{submitted}</output>
