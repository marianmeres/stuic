<script lang="ts">
	import {
		FieldsBuilder,
		FIELDS_BUILDER_DEFAULT_TYPES,
		FIELDS_BUILDER_DEFAULT_TYPES_SK,
		FIELDS_BUILDER_MESSAGES_SK,
		createFieldsBuilderT,
		getLocalizedText,
		type FieldDef,
		type FieldTypeDef,
	} from "../../../lib/index.js";

	let fieldsBuilderRef: FieldsBuilder | undefined = $state();

	// 1) minimal
	let value1 = $state<FieldDef[]>([]);

	// 2) prefilled, locks, languages, reserved keys
	let value2 = $state<FieldDef[]>([
		{
			key: "title",
			type: "text",
			label: { en: "Title", sk: "Názov" },
			required: true,
			lock: { key: true, type: true, required: true, delete: true, reorder: true },
		},
		{ key: "vintage_year", type: "number", label: "Vintage year" },
		{
			key: "region",
			type: "select",
			label: { en: "Region", sk: "Región" },
			options: [
				{ value: "small_carpathians", label: "Small Carpathians" },
				{ value: "tokaj", label: "Tokaj" },
			],
		},
		// intentionally unknown type -> degraded read-only row
		{ key: "legacy_blob", type: "wormhole", label: "Legacy blob" },
	]);

	// 3) custom palette with a boolean extra + veto hooks
	const customTypes: FieldTypeDef[] = [
		{
			type: "text",
			label: "Text",
			description: "A single line of text",
			extras: [
				{
					key: "searchable",
					label: "Include in search",
					description: "This field's content participates in fulltext search.",
					type: "boolean",
					default: true,
				},
			],
		},
		...FIELDS_BUILDER_DEFAULT_TYPES.filter((t) => t.type !== "text"),
	];
	let value3 = $state<FieldDef[]>([
		{ key: "name", type: "text", label: "Name", extras: { searchable: true } },
	]);

	// 4) bundled slovak catalog + slovak palette (english stays the default)
	const tSk = createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK);
	let value4 = $state<FieldDef[]>([
		{ key: "nazov", type: "text", label: "Názov", required: true },
		{
			key: "farba",
			type: "select",
			label: "Farba",
			options: [
				{ value: "biele", label: "Biele" },
				{ value: "cervene", label: "Červené" },
			],
		},
	]);

	// 5) no top level label (just omit the `label` prop)
	let value5 = $state<FieldDef[]>([
		{ key: "name", type: "text", label: "Name", required: true },
		{ key: "note", type: "longtext", label: "Note" },
	]);
</script>

<div class="space-y-12 max-w-4xl">
	<h1 class="text-2xl font-bold">FieldsBuilder</h1>

	<div class="space-y-8">
		<div>
			<h2 class="text-lg font-semibold mb-4">Minimal (default palette)</h2>
			<FieldsBuilder
				bind:value={value1}
				bind:this={fieldsBuilderRef}
				name="fields1"
				label="Fields"
				description="Define what properties a thing has. Reorder by dragging or with the arrow buttons."
				types={FIELDS_BUILDER_DEFAULT_TYPES}
			/>
			<div class="mt-2 text-sm opacity-60">
				<button
					class="underline"
					onclick={() => console.log(fieldsBuilderRef?.validate())}
				>
					validate()
				</button>
			</div>
			<pre class="mt-2 text-xs opacity-60 overflow-x-auto">{JSON.stringify(
					value1,
					null,
					2
				)}</pre>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">
				Prefilled: locks, languages, reserved keys, unknown type, preview
			</h2>
			<FieldsBuilder
				bind:value={value2}
				name="fields2"
				label="Item properties"
				types={FIELDS_BUILDER_DEFAULT_TYPES}
				languages={["en", "sk"]}
				reservedKeys={["id", "type", "created_at"]}
				maxFields={8}
			>
				{#snippet preview({ fields }: { fields: FieldDef[] })}
					<div class="flex flex-col gap-3">
						{#each fields as f (f.key || f.label)}
							<div class="text-sm">
								<div class="font-medium">
									{getLocalizedText(f.label, "en") || "…"}{f.required ? " *" : ""}
								</div>
								{#if f.type === "longtext"}
									<textarea class="w-full border rounded p-1 opacity-50" disabled
									></textarea>
								{:else if f.type === "select"}
									<select class="w-full border rounded p-1 opacity-50" disabled>
										{#each f.options ?? [] as o (o.value)}
											<option>{getLocalizedText(o.label, "en")}</option>
										{/each}
									</select>
								{:else if f.type === "checkbox"}
									<input type="checkbox" disabled />
								{:else}
									<input class="w-full border rounded p-1 opacity-50" disabled />
								{/if}
							</div>
						{/each}
					</div>
				{/snippet}
			</FieldsBuilder>
			<pre class="mt-2 text-xs opacity-60 overflow-x-auto">{JSON.stringify(
					value2,
					null,
					2
				)}</pre>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">
				Custom palette (boolean extra) + veto hooks
			</h2>
			<FieldsBuilder
				bind:value={value3}
				name="fields3"
				label="Fields"
				types={customTypes}
				onBeforeDelete={(f) =>
					confirm(`Delete "${getLocalizedText(f.label)}"? Stored data may be lost.`)
						? undefined
						: false}
				onBeforeTypeChange={(f, newType) =>
					confirm(`Change "${getLocalizedText(f.label)}" to type "${newType}"?`)
						? undefined
						: false}
			/>
			<pre class="mt-2 text-xs opacity-60 overflow-x-auto">{JSON.stringify(
					value3,
					null,
					2
				)}</pre>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Bundled Slovak localization</h2>
			<p class="text-sm opacity-60 mb-4">
				<code>createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK)</code> for the UI texts,
				<code>FIELDS_BUILDER_DEFAULT_TYPES_SK</code> for the palette. Both are opt-in imports
				— English remains the built-in default.
			</p>
			<FieldsBuilder
				bind:value={value4}
				name="fields4"
				label="Vlastnosti položky"
				description="Definujte, aké vlastnosti položka má. Poradie zmeníte ťahaním alebo šípkami."
				types={FIELDS_BUILDER_DEFAULT_TYPES_SK}
				t={tSk}
				required
				maxFields={6}
			/>
			<pre class="mt-2 text-xs opacity-60 overflow-x-auto">{JSON.stringify(
					value4,
					null,
					2
				)}</pre>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">No top-level label</h2>
			<p class="text-sm opacity-60 mb-4">
				The <code>label</code> prop is optional — omitting it simply renders no top-level
				label (the label box collapses to zero height and the rows span the full width).
				Everything else (description, validation, <code>below</code>, …) still works.
			</p>
			<FieldsBuilder
				bind:value={value5}
				name="fields5"
				types={FIELDS_BUILDER_DEFAULT_TYPES}
				description="The label prop was omitted here."
			/>
			<pre class="mt-2 text-xs opacity-60 overflow-x-auto">{JSON.stringify(
					value5,
					null,
					2
				)}</pre>
		</div>
	</div>
</div>
