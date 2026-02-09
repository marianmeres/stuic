# Cart

A reusable shopping cart component for displaying cart items with quantity controls,
pricing, and a summary section. Supports interactive (full cart) and readonly (checkout
summary) modes, plus a compact variant suitable for popover previews.

## Usage

```svelte
<script>
  import { Cart } from "@marianmeres/stuic";

  let items = [
    {
      id: "prod-1",
      name: "Widget Pro",
      href: "/products/widget-pro",
      thumbnailSrc: "/images/widget.jpg",
      unitPrice: 1999, // cents
      quantity: 2,
      lineTotal: 3998,
    },
    {
      id: "prod-2",
      name: "Gadget Lite",
      unitPrice: 499,
      quantity: 1,
      lineTotal: 499,
    },
  ];

  function handleQuantityChange(id, newQuantity) {
    // sync with server, then update items
  }

  function handleRemove(id) {
    // remove from server, then update items
  }
</script>

<Cart
  {items}
  formatPrice={(v) => `$${(v / 100).toFixed(2)}`}
  onQuantityChange={handleQuantityChange}
  onRemove={handleRemove}
/>
```

### Readonly Mode (checkout summary)

```svelte
<Cart {items} readonly formatPrice={(v) => `$${(v / 100).toFixed(2)}`} />
```

### Compact Variant (for popovers)

```svelte
<Cart
  {items}
  variant="compact"
  formatPrice={(v) => `$${(v / 100).toFixed(2)}`}
>
  {#snippet footer({ total, itemCount })}
    <div class="flex gap-2">
      <a href="/cart">View Cart</a>
      <a href="/checkout">Checkout</a>
    </div>
  {/snippet}
</Cart>
```

### Integration with @marianmeres/ecsuite

```svelte
<script>
  import { Cart } from "@marianmeres/stuic";
  import type { EnrichedCartItem } from "@marianmeres/ecsuite";
  import type { CartComponentItem } from "@marianmeres/stuic";

  // Map from ecsuite's EnrichedCartItem to Cart's CartComponentItem
  function toCartItems(enriched: EnrichedCartItem[]): CartComponentItem[] {
    return enriched.map((ei) => ({
      id: ei.product_id,
      name: ei.product?.name ?? "Unknown Product",
      href: ei.product?.slug ? `/products/${ei.product.slug}` : undefined,
      description: ei.product?.short_description,
      thumbnailSrc: getProductImage(ei.product), // your image helper
      unitPrice: ei.product?.price ?? 0,
      quantity: ei.quantity,
      lineTotal: ei.lineTotal,
    }));
  }

  // Use with ecsuite's CartManager
  async function handleQuantityChange(id: string, qty: number) {
    await suite.cart.updateItemQuantity(id, qty);
    items = toCartItems(await suite.cart.getEnrichedItems(suite.product));
  }

  async function handleRemove(id: string) {
    await suite.cart.removeItem(id);
    items = toCartItems(await suite.cart.getEnrichedItems(suite.product));
  }
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CartComponentItem[]` | required | Cart items to display |
| `variant` | `"default" \| "compact"` | `"default"` | Layout variant. Compact is smaller, scrollable, implicitly readonly |
| `formatPrice` | `(value: number) => string` | `(v) => (v / 100).toFixed(2)` | Format numeric price for display |
| `onQuantityChange` | `(id: string, qty: number) => void` | — | Called when quantity changes |
| `onRemove` | `(id: string) => void` | — | Called when remove is clicked |
| `readonly` | `boolean` | `false` | Hide interactive controls |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `updatingItems` | `Set<string>` | `new Set()` | Item IDs currently being updated |
| `t` | `TranslateFn` | built-in | Translation function |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `class` | `string` | — | Additional CSS classes |
| `el` | `HTMLDivElement` | — | Bindable element reference |

### CartComponentItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier |
| `name` | `string` | yes | Product name |
| `href` | `string` | — | Link to product page |
| `description` | `string` | — | Short description |
| `thumbnailSrc` | `string` | — | Image URL |
| `thumbnailAlt` | `string` | — | Image alt (defaults to name) |
| `unitPrice` | `number` | yes | Price per unit (cents) |
| `quantity` | `number` | yes | Current quantity |
| `lineTotal` | `number` | yes | Pre-computed line total |
| `unit` | `string` | — | Unit label ("pcs", "kg") |
| `quantityStep` | `number` | — | +/- step (default 1) |
| `minQuantity` | `number` | — | Min quantity (default 0) |
| `maxQuantity` | `number` | — | Max quantity |

### Snippets

| Snippet | Params | Description |
|---------|--------|-------------|
| `thumbnail` | `{ item }` | Override thumbnail rendering |
| `itemRow` | `{ item, isUpdating, readonly, formatPrice }` | Override entire item row |
| `summary` | `{ items, total, itemCount, formatPrice }` | Override summary section |
| `empty` | — | Custom empty state |
| `footer` | `{ items, total, itemCount }` | Content after summary (CTAs) |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-cart-gap` | `1rem` | Gap between items |
| `--stuic-cart-item-padding` | `1rem` | Item card padding |
| `--stuic-cart-item-radius` | `var(--radius-lg)` | Item border radius |
| `--stuic-cart-item-border-color` | `var(--stuic-color-border)` | Item border color |
| `--stuic-cart-item-bg` | `var(--stuic-color-background)` | Item background |
| `--stuic-cart-thumbnail-size` | `4rem` | Thumbnail dimensions |
| `--stuic-cart-thumbnail-size-sm` | `3rem` | Compact thumbnail dimensions |
| `--stuic-cart-thumbnail-radius` | `var(--radius-md)` | Thumbnail border radius |
| `--stuic-cart-thumbnail-bg` | `var(--stuic-color-muted)` | Thumbnail placeholder bg |
| `--stuic-cart-quantity-border-color` | `var(--stuic-color-border)` | Quantity control border |
| `--stuic-cart-quantity-button-size` | `2rem` | Quantity button dimensions |
| `--stuic-cart-remove-color` | `var(--stuic-color-destructive)` | Remove button color |
| `--stuic-cart-summary-border-color` | `var(--stuic-color-border)` | Summary separator |
| `--stuic-cart-compact-max-height` | `12rem` | Compact variant scroll height |
| `--stuic-cart-compact-item-padding` | `0.5rem` | Compact item padding |
| `--stuic-cart-transition` | `150ms` | Transition duration |

## Translation Keys

| Key | Default | Description |
|-----|---------|-------------|
| `empty_cart` | "Your cart is empty" | Empty state text |
| `unit_price_each` | "{price} each" | Unit price label |
| `quantity_label` | "Qty: {quantity}" | Readonly quantity display |
| `remove_item` | "Remove" | Remove button text |
| `total_label` | "Total" | Summary label |
| `item_count_1` | "1 item" | Singular item count |
| `item_count_n` | "{count} items" | Plural item count |
| `decrease_quantity` | "Decrease quantity" | Aria label for − button |
| `increase_quantity` | "Increase quantity" | Aria label for + button |
