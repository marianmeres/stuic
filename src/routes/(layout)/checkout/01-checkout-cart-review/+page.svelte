<script lang="ts">
	import { CheckoutCartReview, defaultFormatPrice } from "$lib/index.js";
	import type { CartComponentItem } from "$lib/components/Cart/Cart.svelte";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	// --- Sample items ---
	const sampleItems: CartComponentItem[] = [
		{
			id: "prod-1",
			name: "Classic T-Shirt",
			description: "100% cotton, navy blue",
			thumbnailSrc: "https://picsum.photos/seed/tshirt/80/80",
			unitPrice: 2999,
			quantity: 2,
			lineTotal: 5998,
		},
		{
			id: "prod-2",
			name: "Leather Belt",
			thumbnailSrc: "https://picsum.photos/seed/belt/80/80",
			unitPrice: 4500,
			quantity: 1,
			lineTotal: 4500,
		},
		{
			id: "prod-3",
			name: "Running Shoes Pro Max Ultra Lightweight Edition",
			description: "Breathable mesh, size 42",
			thumbnailSrc: "https://picsum.photos/seed/shoes/80/80",
			unitPrice: 12999,
			quantity: 1,
			lineTotal: 12999,
		},
	];

	const singleItem: CartComponentItem[] = [
		{
			id: "prod-single",
			name: "Premium Headphones",
			thumbnailSrc: "https://picsum.photos/seed/headphones/80/80",
			unitPrice: 19999,
			quantity: 1,
			lineTotal: 19999,
		},
	];

	const noThumbItems: CartComponentItem[] = [
		{
			id: "prod-nothumb-1",
			name: "Digital Gift Card",
			unitPrice: 5000,
			quantity: 1,
			lineTotal: 5000,
		},
		{
			id: "prod-nothumb-2",
			name: "Extended Warranty",
			unitPrice: 1999,
			quantity: 1,
			lineTotal: 1999,
		},
	];

	// --- Controls ---
	let showEditButton = $state(true);
	let editCount = $state(0);

	function handleEditCart() {
		editCount++;
	}

	// --- Custom formatter ---
	function euroFormat(cents: number): string {
		return (cents / 100).toFixed(2).replace(".", ",") + " \u20AC";
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutCartReview</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Toggle the Edit Cart button. Click it to see the callback fire.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showEditButton}
			label="Show Edit Cart button"
			name="show-edit"
			renderSize="sm"
		/>
	</div>

	{#if editCount > 0}
		<p class="text-sm mb-4">
			Edit Cart clicked <strong>{editCount}</strong> time{editCount === 1 ? "" : "s"}
		</p>
	{/if}

	<div class="max-w-full">
		<CheckoutCartReview
			items={sampleItems}
			onEditCart={showEditButton ? handleEditCart : undefined}
		/>
	</div>
</section>

<!-- ============== BASIC (MINIMAL PROPS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">
		Just items — no edit action. Defaults to "Order Summary" title and default price
		formatting.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={sampleItems} />
	</div>
</section>

<!-- ============== SINGLE ITEM ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Single item</h2>
	<p class="text-sm opacity-60 mb-4">Shows singular "1 item" text in the summary.</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={singleItem} onEditCart={() => alert("Edit cart!")} />
	</div>
</section>

<!-- ============== NO THUMBNAILS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Items without thumbnails</h2>
	<p class="text-sm opacity-60 mb-4">
		Items with no <code>thumbnailSrc</code> — Cart renders its built-in placeholder.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={noThumbItems} onEditCart={handleEditCart} />
	</div>
</section>

<!-- ============== CUSTOM FORMAT PRICE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom formatPrice (Euro)</h2>
	<p class="text-sm opacity-60 mb-4">Override price formatting with a Euro formatter.</p>

	<div class="max-w-lg">
		<CheckoutCartReview
			items={sampleItems}
			formatPrice={euroFormat}
			onEditCart={handleEditCart}
		/>
	</div>
</section>

<!-- ============== CUSTOM TITLE (STRING) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom title (string)</h2>
	<p class="text-sm opacity-60 mb-4">
		Pass a string to <code>title</code> to override the default "Order Summary".
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview
			items={sampleItems}
			title="Your Cart"
			onEditCart={handleEditCart}
		/>
	</div>
</section>

<!-- ============== CUSTOM TITLE (SNIPPET) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom title (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">
		Use a snippet for full control over the title rendering.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={sampleItems} onEditCart={handleEditCart}>
			{#snippet title()}
				<div class="flex items-center gap-2">
					<span class="text-xl">&#128722;</span>
					<h3 class="text-lg font-bold">Shopping Bag</h3>
				</div>
			{/snippet}
		</CheckoutCartReview>
	</div>
</section>

<!-- ============== CUSTOM EDIT ACTION ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom edit action (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override the edit button with a custom snippet. The snippet receives <code
			>onEditCart</code
		>.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={sampleItems} onEditCart={handleEditCart}>
			{#snippet editAction({ onEditCart: handler })}
				{#if handler}
					<button
						type="button"
						class="text-sm underline opacity-60 hover:opacity-100"
						onclick={handler}
					>
						Modify items
					</button>
				{/if}
			{/snippet}
		</CheckoutCartReview>
	</div>
</section>

<!-- ============== CUSTOM SUMMARY ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom summary (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override the summary section with a custom snippet for full control.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={sampleItems} onEditCart={handleEditCart}>
			{#snippet summary({ total, itemCount, formatPrice })}
				<div class="flex justify-between items-center pt-4 mt-2 border-t border-border">
					<div>
						<div class="text-lg font-bold">{formatPrice(total)}</div>
						<div class="text-sm opacity-60">
							{itemCount}
							{itemCount === 1 ? "item" : "items"} in cart
						</div>
					</div>
					<Button size="sm" variant="solid" onclick={() => alert("Proceed to checkout!")}>
						Checkout
					</Button>
				</div>
			{/snippet}
		</CheckoutCartReview>
	</div>
</section>

<!-- ============== CUSTOM THUMBNAIL ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom thumbnail (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override thumbnail rendering via the <code>thumbnail</code> snippet (passed through to Cart).
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={sampleItems} onEditCart={handleEditCart}>
			{#snippet thumbnail({ item })}
				{#if item.thumbnailSrc}
					<img
						src={item.thumbnailSrc}
						alt={item.thumbnailAlt ?? item.name}
						class="stuic-cart-item-image"
						style="border-radius: 50%;"
					/>
				{:else}
					<div
						class="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs"
					>
						N/A
					</div>
				{/if}
			{/snippet}
		</CheckoutCartReview>
	</div>
</section>

<!-- ============== EMPTY CART ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Empty cart</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>items</code> is empty, Cart renders its built-in empty state.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview items={[]} onEditCart={handleEditCart} />
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default classes applied.
	</p>

	<div class="max-w-lg">
		<CheckoutCartReview
			items={sampleItems}
			onEditCart={handleEditCart}
			unstyled
			class="space-y-4"
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
			--stuic-checkout-cart-review-header-gap: 1rem;
			--stuic-checkout-cart-review-header-margin-bottom: 1rem;
			--stuic-checkout-cart-review-title-font-size: 1.5rem;
			--stuic-checkout-cart-review-summary-total-font-size: 1.5rem;
		"
	>
		<CheckoutCartReview items={sampleItems} onEditCart={handleEditCart} />
	</div>
</section>
