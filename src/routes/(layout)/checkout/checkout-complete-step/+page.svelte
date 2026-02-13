<script lang="ts">
	import { CheckoutCompleteStep, type CheckoutOrderData } from "$lib/index.js";

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

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}

	// --- State ---
	let actionLog = $state<string[]>([]);

	function log(msg: string) {
		actionLog = [...actionLog, `${msg} at ${new Date().toLocaleTimeString()}`];
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutCompleteStep</h1>

<!-- ============== DEFAULT (SUCCESS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Default (success state)</h2>
	<p class="text-sm opacity-60 mb-4">
		Complete step showing order confirmation with progress indicator, email notification,
		and continue shopping CTA.
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId="ORD-2025-001234"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => log("Continue shopping")}
		onStepNavigate={(step) => log(`Navigate to ${step.id}`)}
	/>
</section>

<!-- ============== LOADING STATE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Loading state</h2>
	<p class="text-sm opacity-60 mb-4">
		Shown while the host completes payment flow (calling <code>completeCheckout()</code>,
		clearing cart, etc.).
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId=""
		isLoading
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== ERROR STATE (BOTH ACTIONS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Error state (both actions)</h2>
	<p class="text-sm opacity-60 mb-4">
		Payment failure with both "Return to Checkout" and "Continue Shopping" CTAs.
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId=""
		error="Payment was not completed. Your card was declined. Please try again or use a different payment method."
		onReturnToCheckout={() => log("Return to checkout")}
		onContinueShopping={() => log("Continue shopping (from error)")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== ERROR STATE (RETURN ONLY) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Error state (return to checkout only)</h2>
	<p class="text-sm opacity-60 mb-4">
		Error with only the "Return to Checkout" action — no continue shopping option.
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId=""
		error="Payment session expired. Please try again."
		onReturnToCheckout={() => log("Return to checkout (single action)")}
		formatPrice={dollarFormat}
	/>
</section>

<!-- ============== WITH DISCOUNT & FREE SHIPPING ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With discount & free shipping</h2>
	<p class="text-sm opacity-60 mb-4">
		Completed order with discount applied and free express shipping.
	</p>

	<CheckoutCompleteStep
		order={orderWithDiscount}
		orderId="ORD-2025-005678"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => log("Continue shopping (discount order)")}
	/>
</section>

<!-- ============== CUSTOM HEADER SNIPPET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom header snippet (pass-through)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override the confirmation header via the <code>header</code> snippet, passed through
		to <code>CheckoutOrderConfirmation</code>.
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId="ORD-2025-CUSTOM"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => log("Continue shopping (custom header)")}
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
	</CheckoutCompleteStep>
</section>

<!-- ============== CUSTOM FOOTER SNIPPET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom confirmation footer snippet</h2>
	<p class="text-sm opacity-60 mb-4">
		Add content after the confirmation via the <code>confirmationFooter</code> snippet
		(mapped to <code>footer</code> on <code>CheckoutOrderConfirmation</code>).
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId="ORD-2025-FOOTER"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => log("Continue shopping (footer)")}
	>
		{#snippet confirmationFooter({ orderId })}
			<div
				class="text-center p-4 border border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-sm text-blue-600 dark:text-blue-400"
			>
				<p class="font-medium mb-1">Need help with order {orderId}?</p>
				<p>Contact our support team at support@example.com</p>
			</div>
		{/snippet}
	</CheckoutCompleteStep>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">
		Customized max width and error gap via CSS variables.
	</p>

	<div
		style="
			--stuic-checkout-complete-step-max-width: 36rem;
			--stuic-checkout-complete-step-error-gap: 2rem;
		"
	>
		<CheckoutCompleteStep
			order={sampleOrder}
			orderId=""
			error="Custom-styled error state with wider gap."
			onReturnToCheckout={() => log("Return (CSS vars)")}
			onContinueShopping={() => log("Continue (CSS vars)")}
			formatPrice={dollarFormat}
		/>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default CSS classes applied.
	</p>

	<CheckoutCompleteStep
		order={sampleOrder}
		orderId="ORD-2025-UNSTYLED"
		emailSent
		formatPrice={dollarFormat}
		onContinueShopping={() => log("Continue (unstyled)")}
		unstyled
		class="space-y-6"
	/>
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
