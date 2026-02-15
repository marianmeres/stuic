<script lang="ts">
	import {
		CheckoutOrderReview,
		defaultFormatPrice,
		type CheckoutOrderData,
	} from "$lib/index.js";

	// --- Sample order data ---
	const sampleOrder: CheckoutOrderData = {
		status: "pending",
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
		shipping_address: {
			name: "John Doe",
			street: "123 Main Street",
			city: "New York",
			postal_code: "10001",
			country: "United States",
			phone: "+1 (555) 123-4567",
		},
		billing_address: {
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

	const orderDifferentBilling: CheckoutOrderData = {
		...sampleOrder,
		billing_address: {
			name: "Jane Doe",
			street: "456 Oak Avenue",
			city: "Los Angeles",
			postal_code: "90001",
			country: "United States",
			phone: "+1 (555) 987-6543",
		},
	};

	const orderFreeShipping: CheckoutOrderData = {
		...sampleOrder,
		delivery_option: {
			id: "pickup",
			name: "Store Pickup",
			price: 0,
			estimated_time: "Available same day",
		},
	};

	const orderMinimal: CheckoutOrderData = {
		status: "pending",
		items: [{ product_id: "p1", name: "Widget", price: 999, quantity: 1 }],
		currency: "USD",
		totals: {
			subtotal: 999,
			tax: 0,
			shipping: 0,
			discount: 0,
			total: 999,
		},
	};

	// --- State ---
	let editLog = $state<string[]>([]);

	function logEdit(section: string) {
		editLog = [...editLog, `${section} edited at ${new Date().toLocaleTimeString()}`];
	}

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}

	function euroFormat(cents: number): string {
		return (cents / 100).toFixed(2).replace(".", ",") + " \u20AC";
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutOrderReview</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive (all edit callbacks)</h2>
	<p class="text-sm opacity-60 mb-4">
		Full order review with edit buttons on every section. Click edit to see callbacks
		fire.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview
			order={sampleOrder}
			formatPrice={dollarFormat}
			onEditItems={() => logEdit("Items")}
			onEditShippingAddress={() => logEdit("Shipping")}
			onEditBillingAddress={() => logEdit("Billing")}
			onEditDelivery={() => logEdit("Delivery")}
		/>
	</div>

	{#if editLog.length > 0}
		<div class="mt-4 max-w-lg">
			<h3 class="text-sm font-semibold mb-1">Edit log:</h3>
			<pre
				class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto">{editLog.join(
					"\n"
				)}</pre>
		</div>
	{/if}
</section>

<!-- ============== BILLING SAME AS SHIPPING ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Billing same as shipping</h2>
	<p class="text-sm opacity-60 mb-4">
		When billing and shipping addresses are identical, shows "Same as shipping" instead of
		duplicating the address.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={sampleOrder} formatPrice={dollarFormat} />
	</div>
</section>

<!-- ============== DIFFERENT BILLING ADDRESS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Different billing address</h2>
	<p class="text-sm opacity-60 mb-4">
		When billing address differs from shipping, it shows the full billing address.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={orderDifferentBilling} formatPrice={dollarFormat} />
	</div>
</section>

<!-- ============== FREE DELIVERY ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Free delivery</h2>
	<p class="text-sm opacity-60 mb-4">
		When delivery price is 0, shows "Free" instead of a price.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={orderFreeShipping} formatPrice={dollarFormat} />
	</div>
</section>

<!-- ============== MINIMAL ORDER ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Minimal order (no address, no delivery)</h2>
	<p class="text-sm opacity-60 mb-4">
		Order with only items — no shipping address, billing address, or delivery option.
		Those sections are hidden.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={orderMinimal} formatPrice={dollarFormat} />
	</div>
</section>

<!-- ============== NO EDIT BUTTONS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">No edit buttons</h2>
	<p class="text-sm opacity-60 mb-4">
		When no <code>onEdit*</code> callbacks are provided, edit buttons are hidden.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={orderDifferentBilling} formatPrice={dollarFormat} />
	</div>
</section>

<!-- ============== CUSTOM FORMAT PRICE (EURO) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom formatPrice (Euro)</h2>
	<p class="text-sm opacity-60 mb-4">Override price formatting with a Euro formatter.</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={sampleOrder} formatPrice={euroFormat} />
	</div>
</section>

<!-- ============== CUSTOM SECTION SNIPPETS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom section snippets</h2>
	<p class="text-sm opacity-60 mb-4">
		Override individual sections via snippets. Here the items section is customized.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview order={sampleOrder} formatPrice={dollarFormat}>
			{#snippet itemsSection({ items, formatPrice, onEdit })}
				<div
					class="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
				>
					<h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">
						Custom Items ({items.length})
					</h4>
					<ul class="space-y-1 text-sm">
						{#each items as item (item.product_id)}
							<li class="flex justify-between">
								<span>{item.name} (x{item.quantity})</span>
								<span class="font-mono">{formatPrice(item.price * item.quantity)}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/snippet}
		</CheckoutOrderReview>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default CSS classes applied.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview
			order={sampleOrder}
			formatPrice={dollarFormat}
			onEditItems={() => {}}
			onEditShippingAddress={() => {}}
			unstyled
			class="space-y-6"
		/>
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div
		class="max-w-lg"
		style="
			--stuic-checkout-review-section-gap: 2rem;
			--stuic-checkout-review-header-font-size: 1.125rem;
			--stuic-checkout-review-header-font-weight: 700;
			--stuic-checkout-card-radius: 1rem;
			--stuic-checkout-card-padding: 1.5rem;
		"
	>
		<CheckoutOrderReview
			order={orderDifferentBilling}
			formatPrice={dollarFormat}
			onEditItems={() => {}}
			onEditShippingAddress={() => {}}
			onEditBillingAddress={() => {}}
			onEditDelivery={() => {}}
		/>
	</div>
</section>

<!-- ============== PARTIAL EDIT CALLBACKS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Partial edit callbacks</h2>
	<p class="text-sm opacity-60 mb-4">
		Only some sections have edit buttons — only items and delivery have callbacks.
	</p>

	<div class="max-w-lg">
		<CheckoutOrderReview
			order={sampleOrder}
			formatPrice={dollarFormat}
			onEditItems={() => logEdit("Items (partial)")}
			onEditDelivery={() => logEdit("Delivery (partial)")}
		/>
	</div>
</section>
