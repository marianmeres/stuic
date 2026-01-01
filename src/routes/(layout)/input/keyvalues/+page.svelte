<script lang="ts">
	import {
		Button,
		FieldKeyValues,
		maybeJsonParse,
		Notifications,
		NotificationsStack,
		onSubmitValidityCheck,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";

	const clog = createClog("field keyvalues page");

	const notifications = new NotificationsStack([]);

	let values = $state({
		simple: "{}",
		prefilled: JSON.stringify({
			"Content-Type": "application/json",
			Authorization: "Bearer token123",
			"X-Custom-Header": "A longer value that might span\nmultiple lines",
		}),
		required: "{}",
		withValidation: "{}",
	});

	function customValidator(val: any, ctx: any, el: any) {
		const entries = JSON.parse(val || "{}");
		// Must have at least one entry with non-empty key
		const keys = Object.keys(entries).filter((k) => k.trim() !== "");
		return keys.length > 0 ? "" : "At least one entry with a non-empty key is required";
	}
</script>

<Notifications {notifications} />

<div class="space-y-8 max-w-2xl">
	<!-- Basic usage -->
	<form use:onSubmitValidityCheck class="border p-4 rounded">
		<h3 class="text-lg font-semibold mb-4">Basic Usage</h3>
		<FieldKeyValues
			bind:value={values.simple}
			name="simple"
			label="HTTP Headers"
			description="Add custom headers as key-value pairs"
		/>
		<pre class="text-xs mt-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded overflow-auto">{JSON.stringify(maybeJsonParse(values.simple), null, 2)}</pre>
		<Button type="submit" class="mt-4">Submit</Button>
	</form>

	<!-- Prefilled -->
	<form use:onSubmitValidityCheck class="border p-4 rounded">
		<h3 class="text-lg font-semibold mb-4">Prefilled Values</h3>
		<FieldKeyValues
			bind:value={values.prefilled}
			name="prefilled"
			label="Configuration"
			description="Values can be any valid JSON (strings auto-detected)"
		/>
		<pre class="text-xs mt-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded overflow-auto">{JSON.stringify(maybeJsonParse(values.prefilled), null, 2)}</pre>
	</form>

	<!-- Required -->
	<form use:onSubmitValidityCheck class="border p-4 rounded">
		<h3 class="text-lg font-semibold mb-4">Required Field</h3>
		<FieldKeyValues
			bind:value={values.required}
			name="required"
			label="Required Entries"
			description="At least one entry is required"
			required
		/>
		<Button type="submit" class="mt-4">Submit</Button>
	</form>

	<!-- With custom validation -->
	<form use:onSubmitValidityCheck class="border p-4 rounded">
		<h3 class="text-lg font-semibold mb-4">With Custom Validation</h3>
		<FieldKeyValues
			bind:value={values.withValidation}
			name="validated"
			label="Validated Entries"
			description="At least one entry must have a non-empty key"
			validate={{ customValidator }}
		/>
		<Button type="submit" class="mt-4">Submit</Button>
	</form>

	<!-- Size variants -->
	<div class="border p-4 rounded">
		<h3 class="text-lg font-semibold mb-4">Size Variants</h3>
		<div class="space-y-4">
			<FieldKeyValues
				value={JSON.stringify({ small: "example" })}
				name="size-sm"
				label="Small (sm)"
				renderSize="sm"
			/>
			<FieldKeyValues
				value={JSON.stringify({ medium: "example" })}
				name="size-md"
				label="Medium (md)"
				renderSize="md"
			/>
			<FieldKeyValues
				value={JSON.stringify({ large: "example" })}
				name="size-lg"
				label="Large (lg)"
				renderSize="lg"
			/>
		</div>
	</div>
</div>
