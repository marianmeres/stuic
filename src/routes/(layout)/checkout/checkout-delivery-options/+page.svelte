<script lang="ts">
	import {
		CheckoutDeliveryOptions,
		defaultFormatPrice,
		type CheckoutDeliveryOption,
	} from "$lib/index.js";
	import FieldInput from "$lib/components/Input/FieldInput.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	// --- Sample delivery options ---
	const sampleOptions: CheckoutDeliveryOption[] = [
		{
			id: "standard",
			name: "Standard Shipping",
			description: "Delivered by national postal service",
			price: 499,
			estimated_time: "5-7 business days",
			is_active: true,
			sort_order: 1,
			free_above: 5000,
		},
		{
			id: "express",
			name: "Express Shipping",
			description: "Fast delivery with tracking",
			price: 1299,
			estimated_time: "2-3 business days",
			is_active: true,
			sort_order: 2,
		},
		{
			id: "overnight",
			name: "Overnight",
			price: 2499,
			estimated_time: "Next business day",
			is_active: true,
			sort_order: 3,
		},
		{
			id: "pickup",
			name: "Store Pickup",
			description: "Pick up at our downtown location",
			price: 0,
			estimated_time: "Available same day",
			is_active: true,
			sort_order: 0,
		},
		{
			id: "inactive",
			name: "Drone Delivery (Coming Soon)",
			price: 999,
			is_active: false,
			sort_order: 99,
		},
	];

	const minimalOptions: CheckoutDeliveryOption[] = [
		{
			id: "flat",
			name: "Flat Rate",
			price: 599,
			is_active: true,
			sort_order: 1,
		},
		{
			id: "free-option",
			name: "Economy",
			price: 0,
			is_active: true,
			sort_order: 2,
		},
	];

	// --- State ---
	let selectedId = $state<string | undefined>("standard");
	let subtotal = $state(3500);
	let isUpdating = $state(false);
	let selectCount = $state(0);

	function handleSelect(optionId: string) {
		selectCount++;
	}

	async function simulateUpdate() {
		isUpdating = true;
		await new Promise((r) => setTimeout(r, 1500));
		isUpdating = false;
	}

	// --- Custom formatters ---
	function euroFormat(cents: number): string {
		return (cents / 100).toFixed(2).replace(".", ",") + " \u20AC";
	}

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutDeliveryOptions</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Full-featured demo with controls. Change subtotal to see free shipping threshold behavior.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldInput
			bind:value={subtotal}
			label="Subtotal (cents)"
			name="subtotal"
			type="number"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={isUpdating}
			label="Simulate updating state"
			name="updating"
			renderSize="sm"
		/>
	</div>

	{#if selectCount > 0}
		<p class="text-sm mb-4">
			onSelect fired <strong>{selectCount}</strong> time{selectCount === 1 ? "" : "s"}.
			Selected: <code>{selectedId}</code>
		</p>
	{/if}

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={sampleOptions}
			bind:selectedId
			onSelect={handleSelect}
			{subtotal}
			{isUpdating}
			formatPrice={dollarFormat}
		/>
	</div>

	<pre class="text-xs mt-4 p-3 bg-neutral-100 dark:bg-neutral-900 rounded">selectedId: {JSON.stringify(selectedId)}, subtotal: {subtotal}</pre>
</section>

<!-- ============== BASIC (MINIMAL PROPS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">
		Just options — default price formatting, no preselection.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions options={minimalOptions} />
	</div>
</section>

<!-- ============== FREE SHIPPING THRESHOLD MET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Free shipping threshold met</h2>
	<p class="text-sm opacity-60 mb-4">
		Subtotal (7500) exceeds the free_above threshold (5000) — "Free shipping applied!" shown.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={sampleOptions}
			selectedId="standard"
			subtotal={7500}
			formatPrice={dollarFormat}
		/>
	</div>
</section>

<!-- ============== FREE SHIPPING THRESHOLD NOT MET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Free shipping threshold not met</h2>
	<p class="text-sm opacity-60 mb-4">
		Subtotal (2000) below free_above (5000) — shows "Free for orders over $50.00".
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={sampleOptions}
			selectedId="standard"
			subtotal={2000}
			formatPrice={dollarFormat}
		/>
	</div>
</section>

<!-- ============== UPDATING STATE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Updating state</h2>
	<p class="text-sm opacity-60 mb-4">
		The <code>isUpdating</code> prop reduces opacity and disables interaction.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={sampleOptions}
			selectedId="express"
			isUpdating={true}
			formatPrice={dollarFormat}
		/>
	</div>
</section>

<!-- ============== EMPTY OPTIONS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">No available options</h2>
	<p class="text-sm opacity-60 mb-4">
		When no active options exist, shows the empty state message.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions options={[]} />
	</div>
</section>

<!-- ============== ALL INACTIVE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">All options inactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Options exist but none are active — still shows empty state.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={[
				{ id: "a", name: "A", price: 100, is_active: false, sort_order: 1 },
				{ id: "b", name: "B", price: 200, is_active: false, sort_order: 2 },
			]}
		/>
	</div>
</section>

<!-- ============== CUSTOM FORMAT PRICE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom formatPrice (Euro)</h2>
	<p class="text-sm opacity-60 mb-4">Override price formatting with a Euro formatter.</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={sampleOptions}
			selectedId="express"
			subtotal={3000}
			formatPrice={euroFormat}
		/>
	</div>
</section>

<!-- ============== CUSTOM OPTION SNIPPET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom option snippet</h2>
	<p class="text-sm opacity-60 mb-4">
		Override rendering of individual option cards via the <code>option</code> snippet.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={minimalOptions}
			formatPrice={dollarFormat}
		>
			{#snippet option({ option: opt, selected, free, effectivePrice, formatPrice: fp })}
				<button
					type="button"
					class="w-full text-left p-3 rounded border-2 transition-colors {selected
						? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
						: 'border-transparent bg-neutral-100 dark:bg-neutral-800 hover:border-neutral-300'}"
					onclick={() => (selectedId = opt.id)}
				>
					<strong>{opt.name}</strong>
					<span class="float-right {free ? 'text-green-600' : ''}">
						{free ? "FREE" : fp(effectivePrice)}
					</span>
				</button>
			{/snippet}
		</CheckoutDeliveryOptions>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default classes applied.
	</p>

	<div class="max-w-lg">
		<CheckoutDeliveryOptions
			options={sampleOptions}
			selectedId="standard"
			subtotal={3000}
			unstyled
			class="space-y-2"
			formatPrice={dollarFormat}
		/>
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div
		class="max-w-lg"
		style="
			--stuic-checkout-delivery-gap: 1rem;
			--stuic-checkout-delivery-option-padding: 1.25rem;
			--stuic-checkout-delivery-option-radius: 1rem;
			--stuic-checkout-delivery-free-color: #059669;
		"
	>
		<CheckoutDeliveryOptions
			options={sampleOptions}
			selectedId="pickup"
			subtotal={3000}
			formatPrice={dollarFormat}
		/>
	</div>
</section>
