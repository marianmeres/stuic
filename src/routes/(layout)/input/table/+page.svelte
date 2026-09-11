<script lang="ts">
	import {
		Button,
		createFieldTableT,
		FIELD_TABLE_MESSAGES_SK,
		FieldTable,
		onSubmitValidityCheck,
		SplitPane,
		type FieldTableCellContext,
		type FieldTableColumn,
		type FieldTableRow,
		type ValidationResult,
	} from "$lib/index.js";

	// the shape this component exists for: a bill of materials with one column per
	// built-in cell type
	const BOM_COLUMNS: FieldTableColumn[] = [
		{ key: "part", type: "text", label: "Part", placeholder: "Part name", maxLength: 60 },
		{ key: "qty", type: "number", label: "Qty", unit: "pcs" },
		{
			key: "material",
			type: "select",
			label: "Material",
			placeholder: "—",
			options: [
				{ value: "steel", label: "Steel" },
				{ value: "brass", label: "Brass" },
				{ value: "nylon", label: "Nylon" },
			],
		},
		{ key: "rohs", type: "checkbox", label: "RoHS" },
		{ key: "since", type: "date", label: "Since" },
		{ key: "sheet", type: "url", label: "Datasheet" },
	];

	let bom = $state<FieldTableRow[]>([
		{
			part: "M6 bolt",
			qty: 12,
			material: "steel",
			rohs: true,
			since: "2026-01-15",
			sheet: "https://example.com/m6.pdf",
		},
		{ part: "Washer", qty: 24, material: "brass", rohs: false, since: "", sheet: "" },
	]);

	// a seeded list with problems, to show validate() at work
	let seeded = $state<FieldTableRow[]>([
		{
			part: "Spacer",
			qty: "twelve",
			material: "gold",
			since: "2026-02-30",
			sheet: "ftp://x",
		},
		{ part: "Clip", qty: 4, material: "nylon", rohs: true, since: "", sheet: "" },
		{ part: "Legacy", legacy_note: "kept, never rendered", nested: { a: 1 } },
	]);
	let seededField = $state<FieldTable>();
	let lastResult = $state<ValidationResult | undefined>();

	// a custom cell type through the `cell` snippet
	const PRICE_COLUMNS: FieldTableColumn[] = [
		{ key: "sku", type: "text", label: "SKU" },
		{ key: "price", type: "money", label: "Price (EUR)" },
		{ key: "color", type: "color", label: "Color" },
	];
	let prices = $state<FieldTableRow[]>([
		{ sku: "A-1", price: 1250, color: "#3b82f6" },
		{ sku: "B-2", price: 990, color: "#ef4444" },
	]);

	// slovak chrome + slovak number cells
	const tSk = createFieldTableT(FIELD_TABLE_MESSAGES_SK);
	const SK_COLUMNS: FieldTableColumn[] = [
		{ key: "part", type: "text", label: { en: "Part", sk: "Diel" } },
		{ key: "qty", type: "number", label: { en: "Qty", sk: "Množstvo" }, unit: "ks" },
		{
			key: "material",
			type: "select",
			label: { en: "Material", sk: "Materiál" },
			options: [
				{ value: "steel", label: { en: "Steel", sk: "Oceľ" } },
				{ value: "brass", label: { en: "Brass", sk: "Mosadz" } },
			],
		},
	];
	let sk = $state<FieldTableRow[]>([{ part: "Skrutka", qty: 4.2, material: "steel" }]);

	let required = $state<FieldTableRow[]>([]);
	let paneSize = $state(55);
	let layout = $state<"auto" | "table" | "stacked">("auto");
	let tableFrom = $state<"sm" | "md" | "lg" | "xl">("md");

	function money(v: unknown): string {
		return typeof v === "number" ? (v / 100).toFixed(2) : "";
	}
</script>

{#snippet customCell(ctx: FieldTableCellContext)}
	{#if ctx.column.type === "money"}
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
	{:else if ctx.column.type === "color"}
		<input
			type="color"
			id={ctx.id}
			class="h-9 w-14 cursor-pointer rounded border border-(--stuic-input-border) bg-transparent p-0.5"
			value={typeof ctx.value === "string" ? ctx.value : "#000000"}
			disabled={ctx.disabled}
			oninput={(e) => ctx.setValue(e.currentTarget.value)}
		/>
	{/if}
{/snippet}

<div class="max-w-5xl mx-auto py-8 space-y-14">
	<!-- Container-driven layout -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			Layout switches on the component's own width
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>layout="auto"</code> (default) renders a <code>&lt;table&gt;</code> when the
			component itself is at least <code>tableFrom</code> wide (<code>md</code> = 40rem) and
			the same DOM as stacked cards below that — a container query, not a viewport one, so a
			table in a side panel of a wide window still stacks. Drag the separator; focus and caret
			survive the switch. Eight-column tables scroll horizontally instead of squashing their
			inputs.
		</p>
		<div class="flex flex-wrap gap-4 mb-4 text-sm">
			<label class="flex items-center gap-2">
				layout
				<select bind:value={layout} class="border rounded px-2 py-1">
					<option value="auto">auto</option>
					<option value="table">table</option>
					<option value="stacked">stacked</option>
				</select>
			</label>
			<label class="flex items-center gap-2">
				tableFrom
				<select bind:value={tableFrom} class="border rounded px-2 py-1">
					<option value="sm">sm (32rem)</option>
					<option value="md">md (40rem)</option>
					<option value="lg">lg (48rem)</option>
					<option value="xl">xl (56rem)</option>
				</select>
			</label>
			<span class="text-neutral-500 self-center">pane: {Math.round(paneSize)}%</span>
		</div>
		<div class="border rounded border-neutral-200 dark:border-neutral-700">
			<SplitPane bind:size={paneSize} min={20} max={90}>
				{#snippet start()}
					<div class="p-4">
						<form use:onSubmitValidityCheck>
							<FieldTable
								bind:value={bom}
								name="bom"
								label="Bill of materials"
								description="One column per built-in cell type: text, number (with unit), select, checkbox, date, url"
								columns={BOM_COLUMNS}
								maxRows={20}
								{layout}
								{tableFrom}
								locale="en"
							/>
							<Button type="submit" size="sm">Submit</Button>
						</form>
					</div>
				{/snippet}
				{#snippet end()}
					<div class="p-4 text-xs h-full overflow-auto">
						<div class="text-neutral-500 mb-2">bound value (live)</div>
						<pre class="font-mono whitespace-pre-wrap">{JSON.stringify(
								bom,
								null,
								2
							)}</pre>
					</div>
				{/snippet}
			</SplitPane>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Validation -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Validation and preserved data</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Seeded problems: <code>qty: "twelve"</code>, a material outside the choices, an
			impossible date, an <code>ftp:</code> URL. Nothing is coerced away — every stored
			value round-trips until the user changes it. <code>validate()</code> reports the
			first offender as "Row N, Column: message", marks each bad cell and focuses the
			first. The third row carries keys no column renders (<code>legacy_note</code>,
			<code>nested</code>); they are preserved untouched. A host that submits natively
			must call <code>validate()</code> first, since the hidden input is barred from constraint
			validation.
		</p>
		<FieldTable
			bind:this={seededField}
			bind:value={seeded}
			name="seeded"
			label="Seeded with problems"
			columns={BOM_COLUMNS}
			maxRows={5}
			tableFrom="sm"
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
			class="text-xs mt-4 font-mono whitespace-pre-wrap p-3 rounded bg-neutral-100 dark:bg-neutral-800">{JSON.stringify(
				seeded,
				null,
				2
			)}</pre>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Required -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Required, in a form</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>required</code> means at least one row. Submitting the empty list surfaces the message
			through the form's validity check.
		</p>
		<form use:onSubmitValidityCheck class="space-y-2">
			<FieldTable
				bind:value={required}
				name="required"
				label="Contacts"
				columns={[
					{ key: "name", type: "text", label: "Name" },
					{ key: "email", type: "text", label: "Email" },
				]}
				required
				reorderable={false}
				tableFrom="sm"
			/>
			<Button type="submit" size="sm">Submit</Button>
		</form>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom cells -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			Custom cell types (<code>cell</code> snippet)
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A column whose <code>type</code> is not built in renders through the
			<code>cell</code> snippet: it gets the value, a <code>setValue</code>, and the
			<code>id</code> the row label points at. Here <code>money</code> stores minor units
			and <code>color</code> is a native color input. Without the snippet such a column shows
			read-only and still round-trips.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			<FieldTable
				bind:value={prices}
				name="prices"
				label="Price list (with snippet)"
				columns={PRICE_COLUMNS}
				cell={customCell}
				tableFrom="sm"
			/>
			<FieldTable
				value={JSON.parse(JSON.stringify(prices))}
				name="prices-ro"
				label="Same columns, no snippet"
				columns={PRICE_COLUMNS}
				tableFrom="sm"
			/>
		</div>
		<pre
			class="text-xs font-mono whitespace-pre-wrap p-3 rounded bg-neutral-100 dark:bg-neutral-800">{JSON.stringify(
				prices
			)}</pre>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Slovak: chrome, labels and number cells</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>t</code> from <code>createFieldTableT(FIELD_TABLE_MESSAGES_SK)</code>,
			<code>displayLanguage="sk"</code> for the localized column / option labels, and
			<code>locale="sk"</code> so number cells accept and display <code>4,2</code>. Type
			<code>1 000,5</code>; the stored value is <code>1000.5</code>.
		</p>
		<FieldTable
			bind:value={sk}
			name="sk"
			label="Kusovník"
			columns={SK_COLUMNS}
			displayLanguage="sk"
			locale="sk"
			t={tSk}
			tableFrom="sm"
		/>
		<pre
			class="text-xs font-mono whitespace-pre-wrap p-3 rounded bg-neutral-100 dark:bg-neutral-800">{JSON.stringify(
				sk
			)}</pre>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled / sizes -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled, and the size variants</h2>
		<div class="space-y-2">
			<FieldTable
				value={JSON.parse(JSON.stringify(bom))}
				name="disabled"
				label="Disabled"
				columns={BOM_COLUMNS}
				disabled
				tableFrom="sm"
			/>
			<FieldTable
				value={JSON.parse(JSON.stringify(bom))}
				name="size-md"
				label="renderSize md"
				columns={BOM_COLUMNS.slice(0, 3)}
				renderSize="md"
				tableFrom="sm"
			/>
			<FieldTable
				value={JSON.parse(JSON.stringify(bom))}
				name="size-lg"
				label="renderSize lg"
				columns={BOM_COLUMNS.slice(0, 3)}
				renderSize="lg"
				tableFrom="sm"
			/>
		</div>
	</section>
</div>
