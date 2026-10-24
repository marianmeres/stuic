<script lang="ts">
	import {
		Button,
		createFieldStructT,
		FIELD_STRUCT_MESSAGES_SK,
		FieldStruct,
		onSubmitValidityCheck,
		SplitPane,
		type FieldStructCellContext,
		type FieldStructField,
		type FieldStructValue,
		type ValidationResult,
	} from "#lib/index.js";

	// the shape this component exists for: an address, declared by data, with
	// localized labels — a declaration, not an address component
	const ADDRESS: FieldStructField[] = [
		{
			key: "street",
			type: "text",
			label: { en: "Street", sk: "Ulica" },
			placeholder: { en: "Street and number", sk: "Ulica a číslo" },
			required: true,
			maxLength: 120,
		},
		{
			key: "zip",
			type: "text",
			label: { en: "ZIP", sk: "PSČ" },
			maxLength: 10,
			required: true,
			description: { en: "Digits, a space is fine", sk: "Číslice, medzera nevadí" },
		},
		{ key: "city", type: "text", label: { en: "City", sk: "Mesto" }, required: true },
		{
			key: "country",
			type: "country",
			label: { en: "Country", sk: "Krajina" },
			placeholder: { en: "Pick a country", sk: "Vyberte krajinu" },
			preferredCountries: ["SK", "CZ", "AT", "HU", "PL"],
			required: true,
		},
	];

	let address = $state<FieldStructValue>({
		street: "Hlavná 12",
		zip: "811 01",
		city: "Bratislava",
		country: "SK",
	});
	let lang = $state<"en" | "sk">("sk");
	const tSk = createFieldStructT(FIELD_STRUCT_MESSAGES_SK);
	let paneSize = $state(55);

	// one field per built-in type
	const DIMENSIONS: FieldStructField[] = [
		{ key: "w_cm", type: "number", label: "Width", unit: "cm" },
		{ key: "h_cm", type: "number", label: "Height", unit: "cm" },
		{ key: "d_cm", type: "number", label: "Depth", unit: "cm" },
		{
			key: "material",
			type: "select",
			label: "Material",
			placeholder: "—",
			options: [
				{ value: "steel", label: "Steel" },
				{ value: "wood", label: "Wood" },
			],
		},
		{ key: "fragile", type: "checkbox", label: "Fragile" },
		{ key: "measured", type: "date", label: "Measured on" },
		{ key: "sheet", type: "url", label: "Datasheet" },
	];
	let dims = $state<FieldStructValue>({ w_cm: 120, h_cm: 80.5, fragile: true });
	let dimsLocale = $state<"en" | "sk">("sk");

	// a seeded record with problems, to show validate() at work
	let seeded = $state<FieldStructValue>({
		zip: "81101-very-long",
		w_cm: "twelve",
		material: "gold",
		measured: "2026-02-30",
		sheet: "ftp://x",
		country: "XX",
		legacy_note: "kept, never rendered",
	});
	const SEEDED_FIELDS: FieldStructField[] = [
		{ key: "street", type: "text", label: "Street", required: true },
		{ key: "zip", type: "text", label: "ZIP", maxLength: 10 },
		{ key: "w_cm", type: "number", label: "Width", unit: "cm" },
		...DIMENSIONS.filter((f) => ["material", "measured", "sheet"].includes(f.key)),
		{ key: "country", type: "country", label: "Country" },
	];
	let seededField = $state<FieldStruct>();
	let lastResult = $state<ValidationResult | undefined>();

	// a custom field type through the `cell` snippet
	const VENUE: FieldStructField[] = [
		{ key: "name", type: "text", label: "Name" },
		{ key: "capacity", type: "number", label: "Capacity", unit: "people" },
		{ key: "color", type: "color", label: "Badge color" },
		{ key: "fee", type: "money", label: "Fee (EUR)" },
	];
	let venue = $state<FieldStructValue>({
		name: "Hall A",
		capacity: 200,
		color: "#3b82f6",
		fee: 1250,
	});

	let required = $state<FieldStructValue>({});
	let readonly = $state(false);

	function money(v: unknown): string {
		return typeof v === "number" ? (v / 100).toFixed(2) : "";
	}
</script>

{#snippet customCell(ctx: FieldStructCellContext)}
	{#if ctx.field.type === "money"}
		<!-- minor units in the value, major units in the input -->
		<input
			type="text"
			inputmode="decimal"
			id={ctx.id}
			class="rounded bg-(--stuic-input-bg) border border-(--stuic-input-border) focus:border-(--stuic-input-border-focus) focus:outline-none focus:ring-0"
			value={money(ctx.value)}
			disabled={ctx.disabled}
			aria-invalid={ctx.invalid || undefined}
			aria-describedby={ctx.describedby}
			onchange={(e) => {
				const n = parseFloat(e.currentTarget.value);
				ctx.setValue(Number.isFinite(n) ? Math.round(n * 100) : null);
			}}
		/>
	{:else if ctx.field.type === "color"}
		<input
			type="color"
			id={ctx.id}
			class="h-10 w-16 cursor-pointer rounded border border-(--stuic-input-border) bg-transparent p-0.5"
			value={typeof ctx.value === "string" ? ctx.value : "#000000"}
			disabled={ctx.disabled}
			oninput={(e) => ctx.setValue(e.currentTarget.value)}
		/>
	{/if}
{/snippet}

<div class="max-w-5xl mx-auto py-8 space-y-14">
	<!-- The address -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			An address is a declaration, not a component
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Four fields declared by data, labels as <code>{"{ en, sk }"}</code> records resolved
			with <code>displayLanguage</code>, Slovak chrome through <code>t</code>. The bound
			value is a live object; a field cleared to blank removes its key, so an empty
			address is
			<code>{"{}"}</code>, never four empty strings. Toggle read-only to see the same
			record as a description list — labels, never raw keys.
		</p>
		<div class="flex flex-wrap gap-4 mb-4 text-sm items-center">
			<label class="flex items-center gap-2">
				displayLanguage
				<select bind:value={lang} class="border rounded px-2 py-1">
					<option value="sk">sk</option>
					<option value="en">en</option>
				</select>
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={readonly} />
				readonly
			</label>
			<span class="text-neutral-500">pane: {Math.round(paneSize)}%</span>
		</div>
		<div class="border rounded border-neutral-200 dark:border-neutral-700">
			<SplitPane bind:size={paneSize} min={20} max={90}>
				{#snippet start()}
					<div class="p-4">
						<form use:onSubmitValidityCheck>
							<FieldStruct
								bind:value={address}
								name="address"
								label={lang === "sk" ? "Adresa" : "Address"}
								description={lang === "sk"
									? "Ulica, PSČ, mesto a krajina"
									: "Street, ZIP, city and country"}
								fields={ADDRESS}
								displayLanguage={lang}
								locale={lang}
								t={lang === "sk" ? tSk : undefined}
								{readonly}
								required
							/>
							<Button type="submit" size="sm">Submit</Button>
						</form>
					</div>
				{/snippet}
				{#snippet end()}
					<div class="p-4 text-sm h-full overflow-auto">
						<div class="text-neutral-500 mb-2">bound value (live)</div>
						<pre class="font-mono whitespace-pre-wrap">{JSON.stringify(
								address,
								null,
								2
							)}</pre>
					</div>
				{/snippet}
			</SplitPane>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Every built-in type -->
	<section>
		<h2 class="text-xl font-semibold mb-2">One field per built-in type</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Number fields parse for <code>locale</code> (type <code>80,5</code> under
			<code>sk</code>; the stored value is <code>80.5</code>) and show the unit after the
			input. A checkbox sits beside its label. The record was loaded with three of the
			seven keys; the others are written only once edited.
		</p>
		<label class="flex items-center gap-2 text-sm mb-4">
			locale
			<select bind:value={dimsLocale} class="border rounded px-2 py-1">
				<option value="sk">sk</option>
				<option value="en">en</option>
			</select>
		</label>
		<div class="grid gap-6 md:grid-cols-2">
			<FieldStruct
				bind:value={dims}
				name="dims"
				label="Dimensions"
				fields={DIMENSIONS}
				locale={dimsLocale}
			/>
			<FieldStruct
				value={JSON.parse(JSON.stringify(dims))}
				name="dims-ro"
				label="Same record, readonly"
				fields={DIMENSIONS}
				locale={dimsLocale}
				readonly
			/>
		</div>
		<pre
			class="text-sm font-mono whitespace-pre-wrap p-3 rounded bg-neutral-100 dark:bg-neutral-800">{JSON.stringify(
				dims
			)}</pre>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Validation -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Validation and preserved data</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Seeded problems: a required street left blank, a ZIP over <code>maxLength</code>,
			<code>w_cm: "twelve"</code>, a material outside the choices, an impossible date, an
			<code>ftp:</code> URL, an unknown country code. Nothing is coerced away — every
			stored value round-trips until the user changes it. <code>validate()</code> reports
			the first offender in declaration order ("Street is required", then "ZIP: too
			long…"), marks each bad field and focuses the first. <code>legacy_note</code> is a
			key no field renders; it is preserved untouched. A host that submits natively must
			call <code>validate()</code>
			first, since the hidden input is barred from constraint validation.
		</p>
		<FieldStruct
			bind:this={seededField}
			bind:value={seeded}
			name="seeded"
			label="Seeded with problems"
			fields={SEEDED_FIELDS}
		/>
		<div class="flex items-center gap-3 -mt-4">
			<Button size="sm" onclick={() => (lastResult = seededField?.validate())}>
				validate()
			</Button>
			<Button size="sm" variant="outline" onclick={() => seededField?.clearValidation()}>
				clearValidation()
			</Button>
			<span class="text-sm font-mono text-neutral-500">
				{lastResult ? (lastResult.valid ? "valid" : lastResult.message) : "—"}
			</span>
		</div>
		<pre
			class="text-sm mt-4 font-mono whitespace-pre-wrap p-3 rounded bg-neutral-100 dark:bg-neutral-800">{JSON.stringify(
				seeded,
				null,
				2
			)}</pre>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Required -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			Component-level <code>required</code>, in a form
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			On the struct itself, <code>required</code> means at least one field is non-blank (no
			field here is required on its own). Submitting the empty record surfaces the message through
			the form's validity check.
		</p>
		<form use:onSubmitValidityCheck class="space-y-2">
			<FieldStruct
				bind:value={required}
				name="required"
				label="Contact"
				fields={[
					{ key: "name", type: "text", label: "Name" },
					{ key: "email", type: "text", label: "Email" },
				]}
				required
			/>
			<Button type="submit" size="sm">Submit</Button>
		</form>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom cells -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			Custom field types (<code>cell</code> snippet)
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A field whose <code>type</code> is not built in renders through the
			<code>cell</code> snippet: it gets the value, a <code>setValue</code>, and the
			<code>id</code> the label points at. Here <code>money</code> stores minor units and
			<code>color</code> is a native color input. Without the snippet such a field shows read-only
			and still round-trips.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			<FieldStruct
				bind:value={venue}
				name="venue"
				label="Venue (with snippet)"
				fields={VENUE}
				cell={customCell}
			/>
			<FieldStruct
				value={JSON.parse(JSON.stringify(venue))}
				name="venue-ro"
				label="Same fields, no snippet"
				fields={VENUE}
			/>
		</div>
		<pre
			class="text-sm font-mono whitespace-pre-wrap p-3 rounded bg-neutral-100 dark:bg-neutral-800">{JSON.stringify(
				venue
			)}</pre>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled / sizes -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled, and the size variants</h2>
		<div class="grid gap-6 md:grid-cols-3">
			<FieldStruct
				value={JSON.parse(JSON.stringify(address))}
				name="disabled"
				label="Disabled"
				fields={ADDRESS}
				displayLanguage="en"
				disabled
			/>
			<FieldStruct
				value={JSON.parse(JSON.stringify(address))}
				name="size-sm"
				label="renderSize sm"
				fields={ADDRESS}
				displayLanguage="en"
				renderSize="sm"
			/>
			<FieldStruct
				value={JSON.parse(JSON.stringify(address))}
				name="size-lg"
				label="renderSize lg"
				fields={ADDRESS}
				displayLanguage="en"
				renderSize="lg"
			/>
		</div>
	</section>
</div>
