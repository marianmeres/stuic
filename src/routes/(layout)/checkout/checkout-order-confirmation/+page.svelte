<script lang="ts">
	import {
		CheckoutOrderConfirmation,
		defaultFormatPrice,
		type CheckoutOrderData,
	} from "$lib/index.js";

	// --- Sample order data ---
	const sampleOrder: CheckoutOrderData = {
		status: "completed",
		items: [
			{ product_id: "p1", name: "Classic White T-Shirt", price: 2499, quantity: 2 },
			{ product_id: "p2", name: "Slim Fit Jeans", price: 5999, quantity: 1 },
			{ product_id: "p3", name: "Leather Belt", price: 3499, quantity: 1 },
		],
		currency: "USD",
		totals: {
			subtotal: 14496,
			tax: 1160,
			shipping: 499,
			discount: 0,
			total: 16155,
		},
		customer_email: "john.doe@example.com",
		shipping_address: {
			name: "John Doe",
			street: "123 Main Street",
			city: "New York",
			postal_code: "10001",
			country: "United States",
			phone: "+1 (555) 123-4567",
		},
		delivery_option: {
			id: "standard",
			name: "Standard Shipping",
			price: 499,
			estimated_time: "5-7 business days",
		},
	};

	const orderWithDiscount: CheckoutOrderData = {
		...sampleOrder,
		totals: {
			subtotal: 14496,
			tax: 1040,
			shipping: 0,
			discount: 2000,
			total: 13536,
		},
		delivery_option: {
			id: "express",
			name: "Express Shipping",
			price: 0,
			estimated_time: "1-2 business days",
		},
	};

	const orderMinimal: CheckoutOrderData = {
		status: "completed",
		items: [
			{ product_id: "p1", name: "Digital Download — Pro License", price: 4999, quantity: 1 },
		],
		currency: "USD",
		totals: {
			subtotal: 4999,
			tax: 0,
			shipping: 0,
			discount: 0,
			total: 4999,
		},
	};

	// --- State ---
	let continueLog = $state<string[]>([]);

	function logContinue(label: string) {
		continueLog = [
			...continueLog,
			`${label} at ${new Date().toLocaleTimeString()}`,
		];
	}

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}

	function euroFormat(cents: number): string {
		return (cents / 100).toFixed(2).replace(".", ",") + " \u20AC";
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutOrderConfirmation</h1>

<!-- ============== FULL ORDER ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Full order with email notification</h2>
	<p class="text-sm opacity-60 mb-4">
		Complete confirmation page with all sections, email notification, and continue shopping
		CTA.
	</p>

	<CheckoutOrderConfirmation
		order={sampleOrder}
		orderId="ORD-2025-001234"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => logContinue("Full order")}
	/>

	{#if continueLog.length > 0}
		<div class="mt-4 max-w-2xl mx-auto">
			<h3 class="text-sm font-semibold mb-1">Continue shopping log:</h3>
			<pre
				class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto"
			>{continueLog.join("\n")}</pre>
		</div>
	{/if}
</section>

<!-- ============== WITH DISCOUNT & FREE SHIPPING ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With discount & free shipping</h2>
	<p class="text-sm opacity-60 mb-4">
		Order with a discount applied and free express shipping.
	</p>

	<CheckoutOrderConfirmation
		order={orderWithDiscount}
		orderId="ORD-2025-005678"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => logContinue("Discount order")}
	/>
</section>

<!-- ============== MINIMAL ORDER (NO SHIPPING, NO EMAIL) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Minimal order (digital, no shipping)</h2>
	<p class="text-sm opacity-60 mb-4">
		Digital product order — no shipping address, no delivery option, no email sent, no
		continue button.
	</p>

	<CheckoutOrderConfirmation
		order={orderMinimal}
		orderId="ORD-2025-009999"
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== NO CONTINUE BUTTON ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">No continue shopping button</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>onContinueShopping</code> is not provided, the CTA button is hidden.
	</p>

	<CheckoutOrderConfirmation
		order={sampleOrder}
		orderId="ORD-2025-007777"
		emailSent
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== CUSTOM FORMAT PRICE (EURO) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom formatPrice (Euro)</h2>
	<p class="text-sm opacity-60 mb-4">Override price formatting with a Euro formatter.</p>

	<CheckoutOrderConfirmation
		order={sampleOrder}
		orderId="ORD-EU-2025-0042"
		emailSent
		formatPrice={euroFormat}
		onContinueShopping={() => logContinue("Euro order")}
	/>
</section>

<!-- ============== CUSTOM HEADER SNIPPET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom header snippet</h2>
	<p class="text-sm opacity-60 mb-4">
		Override the header section via the <code>header</code> snippet.
	</p>

	<CheckoutOrderConfirmation
		order={sampleOrder}
		orderId="ORD-2025-CUSTOM"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => logContinue("Custom header")}
	>
		{#snippet header({ orderId })}
			<div
				class="text-center p-8 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800"
			>
				<div class="text-5xl mb-4">&#127881;</div>
				<h2 class="text-2xl font-bold text-green-800 dark:text-green-200">
					Hooray! You did it!
				</h2>
				<p class="text-green-600 dark:text-green-400 mt-2">
					Order {orderId} is on its way.
				</p>
			</div>
		{/snippet}
	</CheckoutOrderConfirmation>
</section>

<!-- ============== CUSTOM FOOTER SNIPPET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom footer snippet</h2>
	<p class="text-sm opacity-60 mb-4">
		Add a footer section with tracking and support info.
	</p>

	<CheckoutOrderConfirmation
		order={sampleOrder}
		orderId="ORD-2025-FOOTER"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => logContinue("Footer order")}
	>
		{#snippet footer({ orderId })}
			<div
				class="text-center p-4 border border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 max-w-2xl mx-auto"
			>
				<p class="font-medium mb-1">Need help with order {orderId}?</p>
				<p>Contact our support team at support@example.com</p>
			</div>
		{/snippet}
	</CheckoutOrderConfirmation>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default CSS classes applied.
	</p>

	<CheckoutOrderConfirmation
		order={sampleOrder}
		orderId="ORD-2025-UNSTYLED"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => logContinue("Unstyled")}
		unstyled
		class="space-y-6 max-w-2xl mx-auto"
	/>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div
		style="
			--stuic-checkout-confirmation-max-width: 36rem;
			--stuic-checkout-confirmation-section-gap: 1.5rem;
			--stuic-checkout-confirmation-success-color: #7c3aed;
			--stuic-checkout-confirmation-order-number-bg: color-mix(in srgb, #7c3aed 10%, transparent);
			--stuic-checkout-card-radius: 1rem;
			--stuic-checkout-card-padding: 1.5rem;
		"
	>
		<CheckoutOrderConfirmation
			order={sampleOrder}
			orderId="ORD-2025-STYLED"
			emailSent
			formatPrice={dollarFormat}
			onContinueShopping={() => logContinue("CSS override")}
		/>
	</div>
</section>
