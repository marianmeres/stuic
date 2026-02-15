<script lang="ts">
	import { Button, FieldObject, maybeJsonParse, onSubmitValidityCheck } from "$lib/index.js";

	let values = $state({
		flat: JSON.stringify({
			name: "John Doe",
			email: "john@example.com",
			phone: "+1 555-0123",
			active: true,
			age: 42,
		}),
		nested: JSON.stringify({
			shipping_address: {
				name: "Jane Smith",
				street: "123 Main St",
				city: "Springfield",
				postal_code: "62701",
				country: "US",
			},
			billing_same: true,
			notes: null,
		}),
		arrayOfObjects: JSON.stringify({
			items: [
				{ product: "Widget", qty: 2, price: 9.99 },
				{ product: "Gadget", qty: 1, price: 24.99 },
				{ product: "Thingamajig", qty: 5, price: 3.5 },
			],
			totals: {
				subtotal: 62.47,
				tax: 6.25,
				shipping: 5.0,
				total: 73.72,
			},
		}),
		primitiveArrays: JSON.stringify({
			tags: ["electronics", "sale", "featured"],
			scores: [98, 85, 72, 91],
			mixed: [1, "two", true, null],
		}),
		empty: "{}",
		invalid: "this is not json {",
	});
</script>

<div class="max-w-2xl space-y-8">
	<!-- Flat object -->
	<form use:onSubmitValidityCheck class="rounded border p-4">
		<h3 class="mb-4 text-lg font-semibold">Flat Object</h3>
		<FieldObject
			bind:value={values.flat}
			name="flat"
			label="Customer Data"
			description="Simple key-value pairs with various types"
		/>
		<pre
			class="mt-2 overflow-auto rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-800">{JSON.stringify(
				maybeJsonParse(values.flat),
				null,
				2
			)}</pre>
		<Button type="submit" class="mt-4">Submit</Button>
	</form>

	<!-- Nested object -->
	<form use:onSubmitValidityCheck class="rounded border p-4">
		<h3 class="mb-4 text-lg font-semibold">Nested Object</h3>
		<FieldObject
			bind:value={values.nested}
			name="nested"
			label="Order Details"
			description="Object with nested sub-objects and null values"
		/>
		<pre
			class="mt-2 overflow-auto rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-800">{JSON.stringify(
				maybeJsonParse(values.nested),
				null,
				2
			)}</pre>
	</form>

	<!-- Array of objects -->
	<form use:onSubmitValidityCheck class="rounded border p-4">
		<h3 class="mb-4 text-lg font-semibold">Array of Objects</h3>
		<FieldObject
			bind:value={values.arrayOfObjects}
			name="array-objects"
			label="Order with Line Items"
			description="Contains arrays of objects and nested totals"
		/>
		<pre
			class="mt-2 overflow-auto rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-800">{JSON.stringify(
				maybeJsonParse(values.arrayOfObjects),
				null,
				2
			)}</pre>
	</form>

	<!-- Primitive arrays -->
	<form use:onSubmitValidityCheck class="rounded border p-4">
		<h3 class="mb-4 text-lg font-semibold">Primitive Arrays</h3>
		<FieldObject
			bind:value={values.primitiveArrays}
			name="prim-arrays"
			label="Tags & Scores"
			description="Arrays of strings, numbers, and mixed primitives"
		/>
		<pre
			class="mt-2 overflow-auto rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-800">{JSON.stringify(
				maybeJsonParse(values.primitiveArrays),
				null,
				2
			)}</pre>
	</form>

	<!-- Empty -->
	<div class="rounded border p-4">
		<h3 class="mb-4 text-lg font-semibold">Empty Object</h3>
		<FieldObject
			bind:value={values.empty}
			name="empty"
			label="Empty Data"
			description="Shows empty state"
		/>
	</div>

	<!-- Invalid JSON -->
	<div class="rounded border p-4">
		<h3 class="mb-4 text-lg font-semibold">Invalid JSON (starts in edit mode)</h3>
		<FieldObject
			bind:value={values.invalid}
			name="invalid"
			label="Broken Data"
			description="Non-parseable string — should fall back gracefully"
		/>
	</div>
</div>
