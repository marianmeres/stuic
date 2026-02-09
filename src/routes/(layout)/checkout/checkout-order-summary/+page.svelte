<script lang="ts">
	import {
		CheckoutOrderSummary,
		defaultFormatPrice,
		type CheckoutOrderTotals,
	} from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import FieldInput from "$lib/components/Input/FieldInput.svelte";

	// --- Basic demo ---
	let totals = $state<CheckoutOrderTotals>({
		subtotal: 8999,
		tax: 720,
		shipping: 599,
		discount: 0,
		total: 10318,
	});

	// --- Controls ---
	let hasShipping = $state(true);
	let showDiscount = $state(false);
	let showTax = $state(true);

	let displayTotals = $derived<CheckoutOrderTotals>({
		...totals,
		tax: showTax ? totals.tax : 0,
		discount: showDiscount ? 1500 : 0,
		total:
			totals.subtotal +
			(showTax ? totals.tax : 0) +
			(hasShipping ? totals.shipping : 0) -
			(showDiscount ? 1500 : 0),
	});

	// --- Custom formatter ---
	function euroFormat(cents: number): string {
		return (cents / 100).toFixed(2).replace(".", ",") + " \u20AC";
	}

	// --- Free shipping demo ---
	let freeShippingTotals: CheckoutOrderTotals = {
		subtotal: 12500,
		tax: 1000,
		shipping: 0,
		discount: 0,
		total: 13500,
	};

	// --- Large order demo ---
	let largeTotals: CheckoutOrderTotals = {
		subtotal: 249900,
		tax: 19992,
		shipping: 0,
		discount: 25000,
		total: 244892,
	};
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutOrderSummary</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Toggle shipping, tax, and discount to see how the summary updates.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={hasShipping}
			label="Has shipping selected"
			name="has-shipping"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showTax}
			label="Show tax"
			name="show-tax"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showDiscount}
			label="Show discount ($15.00)"
			name="show-discount"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-xs">
		<CheckoutOrderSummary totals={displayTotals} {hasShipping} />
	</div>
</section>

<!-- ============== BASIC (MINIMAL PROPS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">Just totals — all defaults applied.</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary
			totals={{ subtotal: 4999, tax: 0, shipping: 799, discount: 0, total: 5798 }}
		/>
	</div>
</section>

<!-- ============== FREE SHIPPING ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Free shipping</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>totals.shipping === 0</code> and <code>hasShipping === true</code>, shows
		"Free".
	</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary totals={freeShippingTotals} />
	</div>
</section>

<!-- ============== NO SHIPPING SELECTED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">No shipping selected</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>hasShipping=false</code>, shows a dash.
	</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary
			totals={{ subtotal: 4999, tax: 400, shipping: 0, discount: 0, total: 5399 }}
			hasShipping={false}
		/>
	</div>
</section>

<!-- ============== WITH DISCOUNT ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With discount</h2>
	<p class="text-sm opacity-60 mb-4">
		Discount row appears when <code>totals.discount &gt; 0</code>, shown in green with minus
		prefix.
	</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary totals={largeTotals} />
	</div>
</section>

<!-- ============== CUSTOM FORMAT PRICE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom formatPrice (Euro)</h2>
	<p class="text-sm opacity-60 mb-4">Override price formatting with a Euro formatter.</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary
			totals={{ subtotal: 8999, tax: 720, shipping: 599, discount: 0, total: 10318 }}
			formatPrice={euroFormat}
		/>
	</div>
</section>

<!-- ============== EXTRA ROWS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Extra rows (coupon)</h2>
	<p class="text-sm opacity-60 mb-4">
		Using the <code>extraRows</code> snippet to inject a coupon code row before the total.
	</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary
			totals={{ subtotal: 8999, tax: 720, shipping: 599, discount: 0, total: 8318 }}
		>
			{#snippet extraRows({ formatPrice })}
				<div class="stuic-checkout-summary-row stuic-checkout-summary-row--discount">
					<span>Coupon: SAVE10</span>
					<span>-{formatPrice(2000)}</span>
				</div>
			{/snippet}
		</CheckoutOrderSummary>
	</div>
</section>

<!-- ============== CUSTOM ROW SNIPPET ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom row snippet</h2>
	<p class="text-sm opacity-60 mb-4">
		Override individual row rendering with the <code>row</code> snippet. This example adds a
		background to the total row.
	</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary
			totals={{ subtotal: 4999, tax: 400, shipping: 799, discount: 500, total: 5698 }}
		>
			{#snippet row({ label, value, isTotal, isDiscount })}
				<div
					class="flex justify-between text-sm py-1 px-2 rounded"
					class:bg-neutral-100={isTotal}
					class:dark:bg-neutral-800={isTotal}
					class:font-bold={isTotal}
					class:text-lg={isTotal}
					class:text-green-600={isDiscount}
					class:border-t={isTotal}
					class:border-border={isTotal}
					class:mt-2={isTotal}
					class:pt-2={isTotal}
				>
					<span>{label}</span>
					<span>{value}</span>
				</div>
			{/snippet}
		</CheckoutOrderSummary>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default classes applied.
	</p>

	<div class="max-w-xs">
		<CheckoutOrderSummary
			totals={{ subtotal: 4999, tax: 400, shipping: 799, discount: 0, total: 6198 }}
			unstyled
			class="space-y-1 text-sm"
		/>
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div
		class="max-w-xs"
		style="
			--stuic-checkout-summary-gap: 1rem;
			--stuic-checkout-summary-label-font-size: 1rem;
			--stuic-checkout-summary-value-font-size: 1rem;
			--stuic-checkout-summary-total-font-size: 1.5rem;
			--stuic-checkout-summary-discount-color: #dc2626;
		"
	>
		<CheckoutOrderSummary
			totals={{ subtotal: 15000, tax: 1200, shipping: 0, discount: 3000, total: 13200 }}
		/>
	</div>
</section>
