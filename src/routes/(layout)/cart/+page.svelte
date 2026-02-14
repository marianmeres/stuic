<script lang="ts">
	import { Cart, Button, type CartComponentItem } from "$lib/index.js";

	// --- Mock data ---
	const PRODUCTS: CartComponentItem[] = [
		{
			id: "prod-1",
			name: "Wireless Noise-Cancelling Headphones",
			href: "#product-1",
			description: "Premium over-ear headphones with 30h battery life",
			thumbnailSrc: "https://picsum.photos/seed/headphones/200/200",
			unitPrice: 29999,
			quantity: 1,
			lineTotal: 29999,
		},
		{
			id: "prod-2",
			name: "USB-C Charging Cable (2m)",
			href: "#product-2",
			thumbnailSrc: "https://picsum.photos/seed/cable/200/200",
			unitPrice: 1299,
			quantity: 3,
			lineTotal: 3897,
		},
		{
			id: "prod-3",
			name: "Organic Green Tea (250g)",
			href: "#product-3",
			description: "Hand-picked premium Japanese sencha",
			unitPrice: 1850,
			quantity: 2,
			lineTotal: 3700,
			unit: "pcs",
		},
		{
			id: "prod-4",
			name: "Mechanical Keyboard - Cherry MX Blue",
			href: "#product-4",
			description: "Full-size layout, PBT keycaps, USB-C detachable",
			thumbnailSrc: "https://picsum.photos/seed/keyboard/200/200",
			unitPrice: 13999,
			quantity: 1,
			lineTotal: 13999,
		},
	];

	const fmt = (v: number) => `$${(v / 100).toFixed(2)}`;

	// --- Interactive example ---
	let items = $state<CartComponentItem[]>(structuredClone(PRODUCTS));
	let updatingItems = $state(new Set<string>());

	async function handleQuantityChange(id: string, newQuantity: number) {
		updatingItems = new Set([...updatingItems, id]);
		await new Promise((r) => setTimeout(r, 600));
		items = items.reduce<CartComponentItem[]>((acc, item) => {
			if (item.id !== id) {
				acc.push(item);
			} else if (newQuantity > 0) {
				acc.push({
					...item,
					quantity: newQuantity,
					lineTotal: item.unitPrice * newQuantity,
				});
			}
			return acc;
		}, []);
		updatingItems = new Set([...updatingItems].filter((x) => x !== id));
	}

	async function handleRemove(id: string) {
		updatingItems = new Set([...updatingItems, id]);
		await new Promise((r) => setTimeout(r, 400));
		items = items.filter((item) => item.id !== id);
		updatingItems = new Set([...updatingItems].filter((x) => x !== id));
	}

	function resetItems() {
		items = structuredClone(PRODUCTS);
		updatingItems = new Set();
	}

	// --- Weight-based example ---
	const BULK_PRODUCTS: CartComponentItem[] = [
		{
			id: "bulk-1",
			name: "Arabica Coffee Beans",
			thumbnailSrc: "https://picsum.photos/seed/coffee/200/200",
			unitPrice: 2400,
			quantity: 1.5,
			lineTotal: 3600,
			unit: "kg",
			quantityStep: 0.25,
			minQuantity: 0.25,
			maxQuantity: 10,
		},
		{
			id: "bulk-2",
			name: "Basmati Rice",
			thumbnailSrc: "https://picsum.photos/seed/rice/200/200",
			unitPrice: 350,
			quantity: 5,
			lineTotal: 1750,
			unit: "kg",
			quantityStep: 0.5,
			minQuantity: 0.5,
		},
	];

	let bulkItems = $state<CartComponentItem[]>(structuredClone(BULK_PRODUCTS));

	function handleBulkQtyChange(id: string, newQuantity: number) {
		bulkItems = bulkItems.map((item) => {
			if (item.id !== id) return item;
			return {
				...item,
				quantity: newQuantity,
				lineTotal: Math.round(item.unitPrice * newQuantity),
			};
		});
	}
</script>

<h1 class="text-2xl font-bold mb-8">Cart</h1>

<!-- ============== INTERACTIVE (DEFAULT) ============== -->
<h2 class="text-lg font-bold mb-4">Interactive Cart</h2>
<p class="text-sm opacity-60 mb-4">
	Full cart with quantity controls, inline editing (click qty number), remove, and async
	update simulation.
</p>
<div class="max-w-full">
	<div class="mb-4">
		<Button size="sm" variant="outline" onclick={resetItems}>Reset Cart</Button>
	</div>
	<Cart
		{items}
		formatPrice={fmt}
		onQuantityChange={handleQuantityChange}
		onRemove={handleRemove}
		{updatingItems}
	>
		{#snippet footer()}
			<div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
				<Button intent="primary">Proceed to Checkout</Button>
			</div>
		{/snippet}
	</Cart>
</div>

<hr class="my-8" />

<!-- ============== READONLY (CHECKOUT SUMMARY) ============== -->
<h2 class="text-lg font-bold mb-4">Readonly (Checkout Summary)</h2>
<p class="text-sm opacity-60 mb-4">
	Same data but with <code>readonly</code> — no controls, just a clean summary.
</p>
<div class="max-w-3xl">
	<Cart items={PRODUCTS} formatPrice={fmt} readonly />
</div>

<hr class="my-8" />

<!-- ============== COMPACT VARIANT (POPOVER) ============== -->
<h2 class="text-lg font-bold mb-4">Compact Variant (for popovers)</h2>
<p class="text-sm opacity-60 mb-4">
	Smaller thumbnails, tighter spacing, scrollable, implicitly readonly. Wrap in a
	DropdownMenu for a real popover.
</p>
<div class="max-w-sm border border-border rounded-lg p-2 bg-surface">
	<Cart items={PRODUCTS} variant="compact" formatPrice={fmt}>
		{#snippet footer()}
			<div class="flex gap-2 justify-between">
				<Button variant="ghost" size="sm" href="#cart">View Cart</Button>
				<Button intent="primary" size="sm" href="#checkout">Checkout</Button>
			</div>
		{/snippet}
	</Cart>
</div>

<hr class="my-8" />

<!-- ============== LOADING STATE ============== -->
<h2 class="text-lg font-bold mb-4">Loading State</h2>
<div class="max-w-3xl">
	<Cart items={[]} formatPrice={fmt} loading />
</div>

<hr class="my-8" />

<!-- ============== EMPTY STATE ============== -->
<h2 class="text-lg font-bold mb-4">Empty State (default)</h2>
<div class="max-w-3xl">
	<Cart items={[]} formatPrice={fmt} />
</div>

<hr class="my-8" />

<!-- ============== CUSTOM EMPTY STATE ============== -->
<h2 class="text-lg font-bold mb-4">Custom Empty State</h2>
<div class="max-w-3xl">
	<Cart items={[]} formatPrice={fmt}>
		{#snippet empty()}
			<div class="text-center py-8">
				<p class="text-lg font-semibold mb-2">Nothing here yet</p>
				<p class="text-sm opacity-60 mb-4">
					Browse our catalog and add items to your cart.
				</p>
				<Button variant="outline" href="#shop">Start Shopping</Button>
			</div>
		{/snippet}
	</Cart>
</div>

<hr class="my-8" />

<!-- ============== WEIGHT-BASED UNITS ============== -->
<h2 class="text-lg font-bold mb-4">Weight-Based Units (custom step & limits)</h2>
<p class="text-sm opacity-60 mb-4">
	Items with <code>unit="kg"</code>, <code>quantityStep=0.25/0.5</code>, and min/max
	constraints.
</p>
<div class="max-w-3xl">
	<Cart
		items={bulkItems}
		formatPrice={fmt}
		onQuantityChange={handleBulkQtyChange}
		onRemove={(id) => {
			bulkItems = bulkItems.filter((i) => i.id !== id);
		}}
	/>
</div>

<hr class="my-8" />

<!-- ============== CUSTOM THUMBNAIL SNIPPET ============== -->
<h2 class="text-lg font-bold mb-4">Custom Thumbnail Snippet</h2>
<p class="text-sm opacity-60 mb-4">
	Override the thumbnail rendering with a custom snippet (colored boxes with initials).
</p>
<div class="max-w-3xl">
	<Cart items={PRODUCTS.slice(0, 2)} formatPrice={fmt} readonly>
		{#snippet thumbnail({ item })}
			<div
				class="w-full h-full flex items-center justify-center rounded-md text-white font-bold text-lg"
				style="background: hsl({item.id.charCodeAt(5) * 60}, 60%, 45%)"
			>
				{item.name.charAt(0)}
			</div>
		{/snippet}
	</Cart>
</div>

<hr class="my-8" />

<!-- ============== CSS VARIABLE OVERRIDE ============== -->
<h2 class="text-lg font-bold mb-4">CSS Variable Override</h2>
<p class="text-sm opacity-60 mb-4">
	Custom theming via CSS variables — rounded thumbnails, accent remove color, bigger gap.
</p>
<div
	class="max-w-3xl"
	style="
		--stuic-cart-thumbnail-radius: 9999px;
		--stuic-cart-thumbnail-size: 3.5rem;
		--stuic-cart-gap: 0.5rem;
		--stuic-cart-item-radius: var(--radius-xl);
		--stuic-cart-remove-color: var(--stuic-color-warning);
	"
>
	<Cart items={PRODUCTS.slice(0, 3)} formatPrice={fmt} readonly />
</div>

<hr class="my-8" />

<!-- ============== COMPACT LOADING ============== -->
<h2 class="text-lg font-bold mb-4">Compact Loading</h2>
<div class="max-w-sm border border-border rounded-lg p-2 bg-surface">
	<Cart items={[]} variant="compact" formatPrice={fmt} loading />
</div>
