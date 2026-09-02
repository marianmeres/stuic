<script lang="ts">
	import {
		FieldDate,
		FieldDateRange,
		createCalendarT,
		CALENDAR_MESSAGES_SK,
		addDaysIso,
		todayIso,
		onSubmitValidityCheck,
		type IsoDate,
		type ValidationResult,
	} from "$lib/index.js";

	const today = todayIso();

	let basic = $state<IsoDate | null>(null);
	let embedded = $state<IsoDate | null>(today);
	let stayStart = $state<IsoDate | null>(null);
	let stayEnd = $state<IsoDate | null>(null);
	let embStart = $state<IsoDate | null>(addDaysIso(today, 3));
	let embEnd = $state<IsoDate | null>(addDaysIso(today, 6));
	let manual = $state<IsoDate | null>(null);
	let external = $state<IsoDate | null>(null);
	let dob = $state<IsoDate | null>(null);
	let sk = $state<IsoDate | null>(null);
	let custom = $state<IsoDate | null>(today);
	let loose = $state<string | null>("2026-09-02T10:00:00Z");

	// Imperative API demo
	let imperativeValue = $state<IsoDate | null>(null);
	let imperativeField = $state<FieldDate>();
	let lastResult = $state<ValidationResult | undefined>();

	const tSk = createCalendarT(CALENDAR_MESSAGES_SK);

	let basicForm = $state<HTMLFormElement>();
	$effect(() => {
		const form = basicForm;
		if (!form) return;
		const handler = () => {
			const fd = new FormData(form);
			alert(
				`Form submitted — ${[...fd.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`
			);
		};
		form.addEventListener("submit_valid", handler);
		return () => form.removeEventListener("submit_valid", handler);
	});
</script>

<div class="max-w-lg mx-auto py-8 space-y-12">
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (dialog)</h2>
		<p class="text-sm opacity-60">
			The trigger shows the formatted date and opens the calendar in a dialog. The bound
			<code>value</code> is always an ISO <code>YYYY-MM-DD</code>; a hidden input carries
			<code>name</code> + that value, so the form submits <code>2026-09-02</code>
			regardless of the display format. <code>required</code> and <code>min</code> are enforced
			by the field's validator (try submitting empty, or clearing).
		</p>
		<form bind:this={basicForm} use:onSubmitValidityCheck class="space-y-4">
			<FieldDate
				bind:value={basic}
				label="Delivery date"
				name="delivery"
				description="Earliest today"
				min={today}
				required
			/>
			<FieldDateRange
				bind:start={stayStart}
				bind:end={stayEnd}
				label="Stay"
				nameStart="from"
				nameEnd="to"
				min={today}
				required
			/>
			<div class="text-sm font-mono space-y-1 p-3 rounded bg-black/5">
				<div>delivery: <strong>{basic ?? "null"}</strong></div>
				<div>stay: <strong>{stayStart ?? "null"} → {stayEnd ?? "null"}</strong></div>
			</div>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Submit
			</button>
		</form>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Embedded</h2>
		<p class="text-sm opacity-60">
			<code>embedded</code> renders the calendar inline inside the field — no trigger, no dialog.
			Same value, same hidden input, same validation. "Clear" moves into the calendar's footer.
		</p>
		<FieldDate bind:value={embedded} label="Date" name="date" embedded showToday />
		<FieldDateRange
			bind:start={embStart}
			bind:end={embEnd}
			label="Period"
			nameStart="period_from"
			nameEnd="period_to"
			embedded
			months={1}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			{embedded ?? "null"} · {embStart ?? "null"} → {embEnd ?? "null"}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">
			Keep the dialog open (<code>closeOnSelect={"{false}"}</code>)
		</h2>
		<p class="text-sm opacity-60">
			By default a pick closes the dialog (a complete range, for the range field). With
			<code>closeOnSelect={"{false}"}</code> the dialog stays open and gets a "Done" button.
		</p>
		<FieldDate
			bind:value={manual}
			label="Date"
			name="manual"
			closeOnSelect={false}
			showToday
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">{manual ?? "null"}</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Date of birth (dropdown caption)</h2>
		<p class="text-sm opacity-60">
			<code>captionLayout="dropdown"</code> + <code>yearRange</code> + <code>max</code>:
			reach 1985 in two taps instead of 480 clicks.
		</p>
		<FieldDate
			bind:value={dob}
			label="Date of birth"
			name="dob"
			captionLayout="dropdown"
			yearRange={[1920, new Date().getFullYear()]}
			max={today}
			formatOptions={{ dateStyle: "long" }}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">{dob ?? "null"}</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">External value change (resync)</h2>
		<p class="text-sm opacity-60">
			Setting the bound value from outside (switching the edited record) resyncs the
			display and the hidden input.
		</p>
		<FieldDate bind:value={external} label="Date" name="external" />
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (external = "2026-01-15")}
			>
				Load 2026-01-15
			</button>
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (external = today)}
			>
				Load today
			</button>
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (external = null)}
			>
				Clear
			</button>
		</div>
		<div class="text-sm font-mono p-3 rounded bg-black/5">{external ?? "null"}</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Loose input is normalized</h2>
		<p class="text-sm opacity-60">
			A datetime string is reduced to its calendar date <em>as written</em> (never shifted through
			a zone); the hidden input submits the normalized date. Unparseable input is submitted
			as-is and fails validation.
		</p>
		<FieldDate bind:value={loose} label="Date" name="loose" />
		<div class="text-sm font-mono p-3 rounded bg-black/5">bound: {loose ?? "null"}</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Locale + i18n + custom format</h2>
		<p class="text-sm opacity-60">
			<code>locale</code> drives the display text and the calendar's day/month names;
			<code>t</code>
			the UI texts (Slovak bundled). <code>format</code> overrides the display entirely.
		</p>
		<FieldDate bind:value={sk} label="Dátum" name="sk" locale="sk" t={tSk} showToday />
		<FieldDate
			bind:value={custom}
			label="Custom format"
			name="custom"
			format={(iso) => `📅 ${iso.split("-").reverse().join("/")}`}
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Sizes</h2>
		<FieldDate label="Small" name="sm" renderSize="sm" value={today} />
		<FieldDate label="Medium (default)" name="md" renderSize="md" value={today} />
		<FieldDate label="Large" name="lg" renderSize="lg" value={today} />
		<FieldDate
			label="Label left"
			name="ll"
			value={today}
			labelLeft
			labelLeftBreakpoint={0}
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled</h2>
		<FieldDate label="Date (disabled)" name="disabled" value={today} disabled />
		<FieldDateRange
			label="Range (disabled)"
			nameStart="d_from"
			nameEnd="d_to"
			start={today}
			end={addDaysIso(today, 4)}
			disabled
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Imperative validate() API</h2>
		<p class="text-sm opacity-70">
			Click <strong>Validate now</strong> with the field empty — the inline error renders without
			touching the field.
		</p>
		<FieldDate
			bind:this={imperativeField}
			bind:value={imperativeValue}
			label="Date"
			required
		/>
		<div class="flex gap-2">
			<button
				type="button"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				onclick={() => (lastResult = imperativeField?.validate())}
			>
				Validate now
			</button>
			<button
				type="button"
				class="px-4 py-2 border rounded hover:bg-black/5"
				onclick={() => {
					imperativeField?.clearValidation();
					imperativeValue = null;
					lastResult = undefined;
				}}
			>
				Clear
			</button>
			<button
				type="button"
				class="px-4 py-2 border rounded hover:bg-black/5"
				onclick={() => imperativeField?.open()}
			>
				open()
			</button>
		</div>
		{#if lastResult}
			<pre class="text-xs p-3 rounded bg-black/5 overflow-auto">{JSON.stringify(
					{ valid: lastResult.valid, message: lastResult.message },
					null,
					2
				)}</pre>
		{/if}
	</section>
</div>
