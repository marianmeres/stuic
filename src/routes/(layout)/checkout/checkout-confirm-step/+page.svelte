<script lang="ts">
	import {
		CheckoutConfirmStep,
		type CheckoutOrderData,
		type CheckoutValidationError,
	} from "$lib/index.js";

	// --- Sample order ---
	function createSampleOrder(): CheckoutOrderData {
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
				shipping: 599,
				discount: 500,
				total: 25376,
			},
			delivery_option_id: "standard",
			delivery_option: {
				id: "standard",
				name: "Standard Shipping",
				price: 599,
				estimated_time: "5-7 business days",
			},
			shipping_address: {
				name: "Jane Doe",
				street: "123 Main St",
				city: "Springfield",
				postal_code: "62704",
				country: "US",
				phone: "+1 555-0123",
			},
			billing_address: {
				name: "Jane Doe",
				street: "123 Main St",
				city: "Springfield",
				postal_code: "62704",
				country: "US",
			},
			customer_email: "jane@example.com",
		};
	}

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}

	// --- State ---
	let actionLog = $state<string[]>([]);

	function log(msg: string) {
		actionLog = [...actionLog, `${msg} at ${new Date().toLocaleTimeString()}`];
	}

	// -- Default demo state --
	let isSubmitting = $state(false);
	let isValid = $state(true);

	function handlePlaceOrder() {
		isSubmitting = true;
		log("Place Order clicked");
		setTimeout(() => {
			isSubmitting = false;
			log("Payment processing completed");
		}, 2000);
	}

	// -- Validation errors demo state --
	const sampleValidationErrors: CheckoutValidationError[] = [
		{ field: "shipping_address", message: "Shipping address is incomplete" },
		{ field: "delivery", message: "No delivery method selected" },
		{ field: "billing_address", message: "Billing address is required" },
	];

	// -- Submitting demo state --
	let submittingDemo = $state(false);

	function handleSubmittingDemo() {
		submittingDemo = true;
		log("Submitting demo: Place Order clicked");
		setTimeout(() => {
			submittingDemo = false;
			log("Submitting demo: completed");
		}, 3000);
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutConfirmStep</h1>

<!-- ============== DEFAULT ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Default</h2>
	<p class="text-sm opacity-60 mb-4">
		Two-column layout with order review on the left and order summary with "Place Order"
		CTA on the right. All edit callbacks wired up.
	</p>

	<CheckoutConfirmStep
		order={createSampleOrder()}
		{isValid}
		{isSubmitting}
		onPlaceOrder={handlePlaceOrder}
		onBack={() => log("Back to shipping clicked")}
		onStepNavigate={(step) => log(`Navigate to ${step.id}`)}
		onEditItems={() => log("Edit items")}
		onEditShippingAddress={() => log("Edit shipping address")}
		onEditBillingAddress={() => log("Edit billing address")}
		onEditDelivery={() => log("Edit delivery")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== WITH VALIDATION ERRORS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With validation errors</h2>
	<p class="text-sm opacity-60 mb-4">
		Validation errors displayed above the CTA. Button is disabled because
		<code>isValid=false</code>.
	</p>

	<CheckoutConfirmStep
		order={createSampleOrder()}
		isValid={false}
		validationErrors={sampleValidationErrors}
		onPlaceOrder={() => log("Place order (should not fire - disabled)")}
		onBack={() => log("Back clicked (validation demo)")}
		onEditItems={() => log("Edit items (validation demo)")}
		onEditShippingAddress={() => log("Edit shipping (validation demo)")}
		onEditBillingAddress={() => log("Edit billing (validation demo)")}
		onEditDelivery={() => log("Edit delivery (validation demo)")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== WITH PAYMENT ERROR ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With payment error</h2>
	<p class="text-sm opacity-60 mb-4">
		Simulates a payment failure redirect. The host page parses the URL and passes the error
		message as a prop.
	</p>

	<CheckoutConfirmStep
		order={createSampleOrder()}
		error="Payment was not completed. Please try again."
		onPlaceOrder={() => log("Retry payment")}
		onBack={() => log("Back clicked (error demo)")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== LOADING STATE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Loading state</h2>
	<p class="text-sm opacity-60 mb-4">
		Skeleton grid shown while <code>isLoading</code> is true.
	</p>

	<CheckoutConfirmStep order={createSampleOrder()} isLoading formatPrice={dollarFormat} />
</section>

<!-- ============== SUBMITTING STATE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Submitting state</h2>
	<p class="text-sm opacity-60 mb-4">
		Click the button to see the submitting state with "Processing Payment..." label and
		<code>aria-busy</code>.
	</p>

	<CheckoutConfirmStep
		order={createSampleOrder()}
		isSubmitting={submittingDemo}
		onPlaceOrder={handleSubmittingDemo}
		onBack={() => log("Back (submitting demo)")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== NO BACK BUTTON ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">No back button</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>onBack</code> is not provided, no back link is shown.
	</p>

	<CheckoutConfirmStep
		order={createSampleOrder()}
		formatPrice={dollarFormat}
		onPlaceOrder={() => log("Place order (no back)")}
	/>
</section>

<!-- ============== CUSTOM COLUMN OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom column overrides (snippets)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override left and right columns via <code>leftColumn</code> and
		<code>rightColumn</code> snippets.
	</p>

	<CheckoutConfirmStep order={createSampleOrder()} formatPrice={dollarFormat}>
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
	</CheckoutConfirmStep>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">
		Customized grid with equal columns and larger gap.
	</p>

	<div
		style="
			--stuic-checkout-confirm-step-grid-columns: 1fr 1fr;
			--stuic-checkout-confirm-step-grid-gap: 3rem;
		"
	>
		<CheckoutConfirmStep
			order={createSampleOrder()}
			formatPrice={dollarFormat}
			onPlaceOrder={() => log("CSS vars place order")}
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

	<CheckoutConfirmStep
		order={createSampleOrder()}
		unstyled
		class="space-y-6"
		formatPrice={dollarFormat}
		onPlaceOrder={() => log("Unstyled place order")}
		onBack={() => log("Unstyled back")}
	/>
</section>

<!-- ============== STATE INSPECTOR ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">State (from default demo)</h2>
	<pre
		class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto max-h-64">{JSON.stringify(
			{
				isValid,
				isSubmitting,
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
			class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto max-h-48">{actionLog.join("\n")}</pre>
		<button
			class="mt-2 text-xs px-2 py-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
			onclick={() => (actionLog = [])}
		>
			Clear log
		</button>
	</section>
{/if}
