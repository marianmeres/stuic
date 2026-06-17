<script lang="ts">
	import {
		FieldMoney,
		money,
		onSubmitValidityCheck,
		type ValidationResult,
	} from "$lib/index.js";

	// Bound values are INTEGER minor units (cents). null/"" = empty.
	let price = $state<number | string | null>(1999);
	let bounded = $state<number | string | null>(null);
	let rate = $state<number | string | null>(5); // 3-decimal, scale 1000
	let external = $state<number | string | null>(null);
	let optOut = $state<number | string | null>(null);

	// Imperative API demo
	let imperativeValue = $state<number | string | null>(null);
	let imperativeField = $state<FieldMoney>();
	let lastResult = $state<ValidationResult | undefined>();

	function forceValidate() {
		lastResult = imperativeField?.validate();
	}
	function clearAndReset() {
		imperativeField?.clearValidation();
		imperativeValue = null;
		lastResult = undefined;
	}

	// onSubmitValidityCheck fires `submit_valid` only after every field's validator
	// passes — wire it via addEventListener (it's a custom DOM event).
	let basicForm = $state<HTMLFormElement>();
	$effect(() => {
		const form = basicForm;
		if (!form) return;
		const handler = () => alert(`Form submitted — price (minor units): ${price}`);
		form.addEventListener("submit_valid", handler);
		return () => form.removeEventListener("submit_valid", handler);
	});

	const fmt = (v: number | string | null): string =>
		v === null || v === "" ? "—" : money(Number(v), "USD");
</script>

<div class="max-w-lg mx-auto py-8 space-y-12">
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (stored as integer minor units)</h2>
		<p class="text-sm opacity-60">
			The bound <code>value</code> is the amount in <strong>minor units</strong> (cents);
			the visible input shows/accepts a major-unit decimal. The visible input is name-less
			— a hidden input carries <code>name</code> + the integer minor units, so the form never
			serializes the display string.
		</p>
		<form bind:this={basicForm} use:onSubmitValidityCheck class="space-y-4">
			<FieldMoney bind:value={price} label="Price" name="price" min={0} required />
			<div class="text-sm font-mono space-y-1 p-3 rounded bg-black/5">
				<div>bound value (minor units): <strong>{price ?? "—"}</strong></div>
				<div>formatted: <strong>{fmt(price)}</strong></div>
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
		<h2 class="text-xl font-semibold">Min / max guard (major units)</h2>
		<p class="text-sm opacity-60">
			The built-in numeric guard rejects non-numeric input and enforces the optional
			major-unit <code>min</code> / <code>max</code>. Try a value below 1 or above 100.
		</p>
		<FieldMoney
			bind:value={bounded}
			label="Amount ($1–$100)"
			name="bounded"
			min={1}
			max={100}
			placeholder="0.00"
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			minor units: <strong>{bounded ?? "—"}</strong> · {fmt(bounded)}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Non-cents scale / decimals</h2>
		<p class="text-sm opacity-60">
			A currency (or rate) stored at a different precision — here
			<code>scale={1000}</code> / <code>decimals={3}</code>, so 5 minor units shows as
			<code>0.005</code>.
		</p>
		<FieldMoney
			bind:value={rate}
			label="Unit rate"
			name="rate"
			scale={1000}
			decimals={3}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			minor units: <strong>{rate ?? "—"}</strong>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">External value change (resync)</h2>
		<p class="text-sm opacity-60">
			Setting the bound value from outside (e.g. switching the edited record) resyncs the
			visible input — without clobbering anything you're mid-typing.
		</p>
		<FieldMoney bind:value={external} label="Price" name="external" min={0} />
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (external = 4200)}
			>
				Load $42.00
			</button>
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (external = 99)}
			>
				Load $0.99
			</button>
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (external = null)}
			>
				Clear
			</button>
		</div>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			minor units: <strong>{external ?? "—"}</strong> · {fmt(external)}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Validation opt-out</h2>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				alert("Form submitted!");
			}}
			class="space-y-4"
		>
			<FieldMoney
				bind:value={optOut}
				label="Amount (no validation)"
				name="amount-no-validate"
				validate={false}
			/>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Submit
			</button>
		</form>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Sizes</h2>
		<FieldMoney label="Small" name="sm" renderSize="sm" />
		<FieldMoney label="Medium (default)" name="md" renderSize="md" />
		<FieldMoney label="Large" name="lg" renderSize="lg" />
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled</h2>
		<FieldMoney label="Price (disabled)" name="disabled" value={1999} disabled />
	</section>

	<!--
		Demonstrates the imperative validate() / clearValidation() API, forwarded to
		the inner FieldInput. Works even without a `name`.
	-->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Imperative validate() API</h2>
		<p class="text-sm opacity-70">
			Click <strong>Validate now</strong> with an out-of-range value (min is $0) — the inline
			error renders without touching the field.
		</p>
		<FieldMoney
			bind:this={imperativeField}
			bind:value={imperativeValue}
			label="Price"
			min={0}
			required
		/>
		<div class="flex gap-2">
			<button
				type="button"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				onclick={forceValidate}
			>
				Validate now
			</button>
			<button
				type="button"
				class="px-4 py-2 border rounded hover:bg-black/5"
				onclick={clearAndReset}
			>
				Clear
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
