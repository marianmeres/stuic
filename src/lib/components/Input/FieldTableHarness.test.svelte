<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because vitest-browser-svelte's `rerender` does not propagate a new value into
	a component that writes its own `$bindable` prop. A real `bind:value` is a live
	two-way binding that DOES propagate, so this harness drives FieldTable the way
	a real consumer would and lets the test flip the external value / the column
	list via buttons. It also wraps the field in a <form> (FormData + Enter-submit
	contracts) and passes a `cell` snippet (snippets cannot be constructed from a
	plain-object props bag in the test file).
-->
<script lang="ts">
	import { untrack } from "svelte";
	import FieldTable, {
		type FieldTableCellContext,
		type FieldTableColumn,
		type FieldTableRow,
	} from "./FieldTable.svelte";

	let {
		initial = [] as FieldTableRow[],
		initialColumns = [] as FieldTableColumn[],
		withCell = false,
	} = $props();
	// Seed once from the props (this harness never re-receives them).
	let value = $state<FieldTableRow[]>(untrack(() => initial));
	let columns = $state<FieldTableColumn[]>(untrack(() => initialColumns));
	let submitted = $state(0);
</script>

{#snippet customCell(ctx: FieldTableCellContext)}
	<input
		type="text"
		data-testid="custom-{ctx.rowIndex}"
		id={ctx.id}
		value={String(ctx.value ?? "")}
		aria-invalid={ctx.invalid || undefined}
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
	<FieldTable
		bind:value
		name="bom"
		label="BOM"
		{columns}
		cell={withCell ? customCell : undefined}
	/>
	<button type="submit" data-testid="submit">submit</button>
</form>

<button
	type="button"
	data-testid="set-external"
	onclick={() => (value = [{ part: "External", qty: 1 }])}
>
	set external
</button>
<button
	type="button"
	data-testid="drop-column"
	onclick={() => (columns = columns.slice(0, -1))}
>
	drop column
</button>
<output data-testid="bound">{JSON.stringify(value)}</output>
<output data-testid="submitted">{submitted}</output>
