<script lang="ts">
	import {
		CheckoutShippingStep,
		createEmptyAddress,
		type CheckoutAddressData,
		type CheckoutDeliveryOption,
		type CheckoutOrderData,
	} from "$lib/index.js";

	// --- Sample order ---
	function createSampleOrder(deliveryOptionId?: string): CheckoutOrderData {
		return {
			status: "pending",
			items: [
				{ product_id: "p1", name: "Classic T-Shirt", price: 2999, quantity: 2 },
				{ product_id: "p2", name: "Leather Belt", price: 4500, quantity: 1 },
				{ product_id: "p3", name: "Running Shoes", price: 12999, quantity: 1 },
			],
			currency: "USD",
			totals: {
				subtotal: 23497,
				tax: 1880,
				shipping:
					deliveryOptionId === "express"
						? 1499
						: deliveryOptionId === "standard"
							? 599
							: 0,
				discount: 0,
				total:
					23497 +
					1880 +
					(deliveryOptionId === "express"
						? 1499
						: deliveryOptionId === "standard"
							? 599
							: 0),
			},
			delivery_option_id: deliveryOptionId,
		};
	}

	// --- Sample delivery options ---
	const sampleDeliveryOptions: CheckoutDeliveryOption[] = [
		{
			id: "standard",
			name: "Standard Shipping",
			description: "Delivered via postal service",
			price: 599,
			estimated_time: "5-7 business days",
			is_active: true,
			sort_order: 1,
			free_above: 5000,
		},
		{
			id: "express",
			name: "Express Shipping",
			description: "Priority delivery",
			price: 1499,
			estimated_time: "1-2 business days",
			is_active: true,
			sort_order: 2,
		},
		{
			id: "pickup",
			name: "Store Pickup",
			description: "Pick up at our downtown location",
			price: 0,
			estimated_time: "Same day",
			is_active: true,
			sort_order: 3,
		},
	];

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}

	// --- State ---
	let actionLog = $state<string[]>([]);

	function log(msg: string) {
		actionLog = [...actionLog, `${msg} at ${new Date().toLocaleTimeString()}`];
	}

	// -- Shared state for default demo --
	let shippingAddress = $state<CheckoutAddressData>(createEmptyAddress());
	let billingAddress = $state<CheckoutAddressData>(createEmptyAddress());
	let billingSameAsShipping = $state(true);
	let selectedDeliveryId = $state<string | undefined>();
	let isSelectingDelivery = $state(false);
	let isSubmitting = $state(false);

	let order = $derived(createSampleOrder(selectedDeliveryId));

	function handleSelectDelivery(optionId: string) {
		isSelectingDelivery = true;
		log(`Delivery selected: ${optionId}`);
		setTimeout(() => {
			selectedDeliveryId = optionId;
			isSelectingDelivery = false;
		}, 800);
	}

	function handleContinue() {
		isSubmitting = true;
		log("Continue clicked");
		setTimeout(() => {
			isSubmitting = false;
			log("Continue completed");
		}, 1500);
	}

	// -- Pre-filled state for pre-filled demo --
	let prefilledShipping = $state<CheckoutAddressData>({
		name: "Jane Doe",
		street: "123 Main St",
		city: "Springfield",
		postal_code: "62704",
		country: "US",
		phone: "+1 555-0123",
	});
	let prefilledBilling = $state<CheckoutAddressData>({
		name: "Jane Doe (Business)",
		street: "456 Commerce Ave",
		city: "Springfield",
		postal_code: "62704",
		country: "US",
	});
	let prefilledBillingSame = $state(false);
	let prefilledDeliveryId = $state<string | undefined>("standard");
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutShippingStep</h1>

<!-- ============== DEFAULT ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Default</h2>
	<p class="text-sm opacity-60 mb-4">
		Two-column layout with shipping address, billing toggle, delivery options on the left
		and order summary with continue button on the right.
	</p>

	<CheckoutShippingStep
		{order}
		deliveryOptions={sampleDeliveryOptions}
		bind:shippingAddress
		bind:billingAddress
		bind:billingSameAsShipping
		bind:selectedDeliveryId
		{isSelectingDelivery}
		{isSubmitting}
		onSelectDelivery={handleSelectDelivery}
		onContinue={handleContinue}
		onBack={() => log("Back clicked")}
		onStepNavigate={(step) => log(`Navigate to ${step.id}`)}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== PRE-FILLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Pre-filled with separate billing</h2>
	<p class="text-sm opacity-60 mb-4">
		Addresses pre-filled. Billing is separate from shipping. Delivery already selected.
	</p>

	<CheckoutShippingStep
		order={createSampleOrder("standard")}
		deliveryOptions={sampleDeliveryOptions}
		bind:shippingAddress={prefilledShipping}
		bind:billingAddress={prefilledBilling}
		bind:billingSameAsShipping={prefilledBillingSame}
		bind:selectedDeliveryId={prefilledDeliveryId}
		onSelectDelivery={(id) => {
			prefilledDeliveryId = id;
			log(`Pre-filled delivery: ${id}`);
		}}
		onContinue={() => log("Pre-filled continue")}
		onBack={() => log("Pre-filled back")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== WITH ERRORS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With validation errors</h2>
	<p class="text-sm opacity-60 mb-4">
		Shipping and billing address forms showing validation errors, plus a top-level error.
	</p>

	<CheckoutShippingStep
		order={createSampleOrder()}
		deliveryOptions={sampleDeliveryOptions}
		error="Please fix the errors below before continuing."
		shippingErrors={[
			{ field: "shipping.name", message: "Name is required" },
			{ field: "shipping.city", message: "City is required" },
		]}
		billingErrors={[{ field: "billing.street", message: "Street is required" }]}
		billingSameAsShipping={false}
		formatPrice={dollarFormat}
		onContinue={() => log("Continue with errors")}
	/>
</section>

<!-- ============== LOADING STATE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Loading state</h2>
	<p class="text-sm opacity-60 mb-4">
		Skeleton grid shown while <code>isLoading</code> is true.
	</p>

	<CheckoutShippingStep
		order={createSampleOrder()}
		deliveryOptions={[]}
		isLoading
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== NO BACK BUTTON ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">No back button</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>onBack</code> is not provided, no back link is shown.
	</p>

	<CheckoutShippingStep
		order={createSampleOrder()}
		deliveryOptions={sampleDeliveryOptions}
		formatPrice={dollarFormat}
		onContinue={() => log("Continue (no back)")}
	/>
</section>

<!-- ============== CUSTOM COLUMN OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom column overrides (snippets)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override left and right columns via <code>leftColumn</code> and
		<code>rightColumn</code> snippets.
	</p>

	<CheckoutShippingStep
		order={createSampleOrder()}
		deliveryOptions={sampleDeliveryOptions}
		formatPrice={dollarFormat}
	>
		{#snippet leftColumn()}
			<div
				class="p-8 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-center text-blue-600 dark:text-blue-400"
			>
				Custom left column content
			</div>
		{/snippet}
		{#snippet rightColumn()}
			<div
				class="p-8 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg text-center text-green-600 dark:text-green-400"
			>
				Custom right column content
			</div>
		{/snippet}
	</CheckoutShippingStep>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">
		Customized grid with equal columns and larger gap.
	</p>

	<div
		style="
			--stuic-checkout-shipping-step-grid-columns: 1fr 1fr;
			--stuic-checkout-shipping-step-grid-gap: 3rem;
		"
	>
		<CheckoutShippingStep
			order={createSampleOrder("standard")}
			deliveryOptions={sampleDeliveryOptions}
			selectedDeliveryId="standard"
			formatPrice={dollarFormat}
			onContinue={() => log("CSS vars continue")}
			onBack={() => log("CSS vars back")}
		/>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default CSS classes.
	</p>

	<CheckoutShippingStep
		order={createSampleOrder()}
		deliveryOptions={sampleDeliveryOptions}
		unstyled
		class="space-y-6"
		formatPrice={dollarFormat}
		onContinue={() => log("Unstyled continue")}
		onBack={() => log("Unstyled back")}
	/>
</section>

<!-- ============== STATE INSPECTOR ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">State (from default demo)</h2>
	<pre
		class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto max-h-64">{JSON.stringify(
			{
				shippingAddress,
				billingAddress,
				billingSameAsShipping,
				selectedDeliveryId,
			},
			null,
			2
		)}</pre>
</section>

<!-- ============== ACTION LOG ============== -->
{#if actionLog.length > 0}
	<section class="mb-12">
		<h2 class="text-lg font-bold mb-2">Action log</h2>
		<pre
			class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto max-h-48">{actionLog.join(
				"\n"
			)}</pre>
		<button
			class="mt-2 text-xs px-2 py-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
			onclick={() => (actionLog = [])}
		>
			Clear log
		</button>
	</section>
{/if}
