<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		_i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			empty_cart: "Your cart is empty",
			unit_price_each: "{price} each",
			quantity_label: "Qty: {quantity}",
			remove_item: "Remove",
			total_label: "Total",
			item_count_1: "1 item",
			item_count_n: "{count} items",
			decrease_quantity: "Decrease quantity",
			increase_quantity: "Increase quantity",
		};
		let out = m[k] ?? fallback ?? k;
		return isPlainObject(values)
			? replaceMap(out, values as any, {
					preSearchKeyTransform: (k) => `{${k}}`,
				})
			: out;
	}

	/** A single item in the cart */
	export interface CartComponentItem {
		/** Unique item identifier */
		id: string;
		/** Product name (displayed, used as link text) */
		name: string;
		/** Link to product page */
		href?: string;
		/** Short description (shown below name if provided) */
		description?: string;
		/** Image URL for product thumbnail */
		thumbnailSrc?: string;
		/** Image alt text (defaults to name) */
		thumbnailAlt?: string;
		/** Price per unit (cents integer recommended) */
		unitPrice: number;
		/** Current quantity */
		quantity: number;
		/** Pre-computed total for this line */
		lineTotal: number;
		/** Unit label: "pcs", "kg", etc. */
		unit?: string;
		/** Increment/decrement step (default 1) */
		quantityStep?: number;
		/** Floor for decrement (default 0) */
		minQuantity?: number;
		/** Ceiling for increment */
		maxQuantity?: number;
	}

	/** Layout variant */
	export type CartVariant = "default" | "compact" | "summary";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Cart items to display */
		items: CartComponentItem[];

		/** Layout variant. "compact" = smaller thumbnails, tighter spacing, scrollable, implicitly readonly. "summary" = minimal receipt-style list (name ×qty, line total), no thumbnails/controls/footer, implicitly readonly */
		variant?: CartVariant;

		/** Format a numeric price for display. Default: (v) => (v / 100).toFixed(2) */
		formatPrice?: (value: number) => string;

		/** Called when quantity changes (not called in readonly/compact mode) */
		onQuantityChange?: (id: string, newQuantity: number) => void;
		/** Called when remove is clicked (not called in readonly/compact mode) */
		onRemove?: (id: string) => void;

		/** Hide all thumbnails */
		noThumbnails?: boolean;
		/** Hide all interactive controls — used for checkout summary */
		readonly?: boolean;
		/** Show loading skeleton instead of content */
		loading?: boolean;
		/** Set of item IDs currently being updated (shown with reduced opacity) */
		updatingItems?: Set<string>;

		/** Override thumbnail rendering */
		thumbnail?: Snippet<[{ item: CartComponentItem }]>;
		/** Override entire item row rendering */
		itemRow?: Snippet<
			[
				{
					item: CartComponentItem;
					isUpdating: boolean;
					readonly: boolean;
					formatPrice: (v: number) => string;
				},
			]
		>;
		/** Override/extend summary section */
		summary?: Snippet<
			[
				{
					items: CartComponentItem[];
					total: number;
					itemCount: number;
					formatPrice: (v: number) => string;
				},
			]
		>;
		/** Custom empty state */
		empty?: Snippet;
		/** Content after the summary (e.g., CTA buttons) */
		footer?: Snippet<
			[
				{
					items: CartComponentItem[];
					total: number;
					itemCount: number;
				},
			]
		>;

		/** Optional translate function */
		t?: TranslateFn;

		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the root container */
		class?: string;
		/** Bindable element reference */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { Breakpoint } from "../../utils/breakpoint.svelte.js";
	import Skeleton from "../Skeleton/Skeleton.svelte";

	let {
		items,
		variant = "default",
		formatPrice = (v: number) => (v / 100).toFixed(2),
		onQuantityChange,
		onRemove,
		noThumbnails = false,
		readonly: readonlyProp = false,
		loading = false,
		updatingItems = new Set<string>(),
		thumbnail,
		itemRow,
		summary,
		empty,
		footer,
		t = t_default,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	// --- Responsive ---
	const bp = Breakpoint.instance;
	let isDesktop = $derived(bp.md);
	let isCompact = $derived(variant === "compact");
	let isSummary = $derived(variant === "summary");
	let isReadonly = $derived(readonlyProp || isCompact || isSummary);

	// --- Derived ---
	let total = $derived(items.reduce((sum, i) => sum + i.lineTotal, 0));
	let itemCount = $derived(items.reduce((sum, i) => sum + i.quantity, 0));

	// --- Inline editing ---
	let editingItemId = $state<string | null>(null);

	function handleQuantityInputCommit(
		itemId: string,
		currentQty: number,
		inputValue: string
	) {
		editingItemId = null;
		const newQty = parseInt(inputValue, 10);
		if (!isNaN(newQty) && newQty !== currentQty && newQty >= 0) {
			onQuantityChange?.(itemId, newQty);
		}
	}

	function decrementQuantity(item: CartComponentItem) {
		const step = item.quantityStep ?? 1;
		const min = item.minQuantity ?? 0;
		const newQty = Math.max(min, item.quantity - step);
		if (newQty !== item.quantity) {
			onQuantityChange?.(item.id, newQty);
		}
	}

	function incrementQuantity(item: CartComponentItem) {
		const step = item.quantityStep ?? 1;
		const newQty = item.quantity + step;
		if (item.maxQuantity != null && newQty > item.maxQuantity) return;
		onQuantityChange?.(item.id, newQty);
	}

	// --- Auto-focus action (avoids a11y autofocus warning) ---
	function autoFocusAndSelect(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	// --- CSS ---
	let rootClass = $derived(unstyled ? classProp : twMerge("stuic-cart", classProp));
</script>

<!-- Root container -->
<div
	bind:this={el}
	class={rootClass}
	data-variant={!unstyled ? variant : undefined}
	data-loading={!unstyled && loading ? "" : undefined}
	data-readonly={!unstyled && isReadonly ? "" : undefined}
	{...rest}
>
	{#if loading}
		<!-- Loading skeleton -->
		<div class={!unstyled ? "stuic-cart-skeleton" : undefined}>
			{#each [1, 2, 3] as _, i (i)}
				<div class={!unstyled ? "stuic-cart-skeleton-item" : undefined}>
					<Skeleton
						variant="rectangle"
						width={isCompact ? "3rem" : "4rem"}
						height={isCompact ? "3rem" : "4rem"}
						rounded="0.375rem"
					/>
					<div class={!unstyled ? "stuic-cart-skeleton-content" : undefined}>
						<Skeleton height="1.25rem" width="60%" />
						<Skeleton height="0.875rem" width="30%" />
						{#if !isReadonly}
							<Skeleton height="2rem" width="8rem" class="mt-2" />
						{/if}
					</div>
					<Skeleton height="1.5rem" width="4rem" />
				</div>
			{/each}
		</div>
	{:else if items.length === 0}
		<!-- Empty state -->
		<div class={!unstyled ? "stuic-cart-empty" : undefined}>
			{#if empty}
				{@render empty()}
			{:else}
				<p>{t("empty_cart")}</p>
			{/if}
		</div>
	{:else}
		<!-- Item list -->
		<div
			class={!unstyled ? "stuic-cart-items" : undefined}
			data-variant={!unstyled ? variant : undefined}
		>
			{#each items as item (item.id)}
				{@const isUpdating = updatingItems.has(item.id)}
				{#if isSummary}
					<div class={!unstyled ? "stuic-cart-item" : undefined} data-variant="summary">
						<span>
							<span class={!unstyled ? "stuic-cart-item-name" : undefined}>
								{item.name}
							</span>
							<span class={!unstyled ? "stuic-cart-item-qty" : undefined}>
								&times;{item.quantity}
							</span>
						</span>
						<span>{formatPrice(item.lineTotal)}</span>
					</div>
				{:else if itemRow}
					{@render itemRow({
						item,
						isUpdating,
						readonly: isReadonly,
						formatPrice,
					})}
				{:else}
					<div
						class={!unstyled ? "stuic-cart-item" : undefined}
						data-variant={!unstyled ? variant : undefined}
						data-updating={!unstyled && isUpdating ? "" : undefined}
					>
						<!-- Thumbnail -->
						{#if !noThumbnails}
							<div
								class={!unstyled ? "stuic-cart-item-thumbnail" : undefined}
								data-variant={!unstyled ? variant : undefined}
							>
								{#if thumbnail}
									{@render thumbnail({ item })}
								{:else if item.thumbnailSrc}
									{#if item.href}
										<a href={item.href}>
											<img
												src={item.thumbnailSrc}
												alt={item.thumbnailAlt ?? item.name}
												class={!unstyled ? "stuic-cart-item-image" : undefined}
											/>
										</a>
									{:else}
										<img
											src={item.thumbnailSrc}
											alt={item.thumbnailAlt ?? item.name}
											class={!unstyled ? "stuic-cart-item-image" : undefined}
										/>
									{/if}
								{:else}
									<div
										class={!unstyled ? "stuic-cart-item-placeholder" : undefined}
									></div>
								{/if}
							</div>
						{/if}

						<!-- Info section -->
						<div class={!unstyled ? "stuic-cart-item-info" : undefined}>
							{#if item.href}
								<a
									href={item.href}
									class={!unstyled ? "stuic-cart-item-name" : undefined}
								>
									{item.name}
								</a>
							{:else}
								<span class={!unstyled ? "stuic-cart-item-name" : undefined}>
									{item.name}
								</span>
							{/if}

							{#if item.description && !isCompact}
								<div class={!unstyled ? "stuic-cart-item-description" : undefined}>
									{item.description}
								</div>
							{/if}

							<div class={!unstyled ? "stuic-cart-item-unit-price" : undefined}>
								{t("unit_price_each", {
									price: formatPrice(item.unitPrice),
								})}
							</div>

							{#if isReadonly}
								<!-- Readonly quantity display -->
								<div class={!unstyled ? "stuic-cart-item-quantity-readonly" : undefined}>
									{t("quantity_label", {
										quantity: item.quantity,
									})}{#if item.unit}&nbsp;{item.unit}{/if}
								</div>
							{:else}
								<!-- Interactive quantity controls -->
								<div class={!unstyled ? "stuic-cart-item-controls" : undefined}>
									<div class={!unstyled ? "stuic-cart-quantity" : undefined}>
										<button
											type="button"
											class={!unstyled ? "stuic-cart-quantity-button" : undefined}
											disabled={isUpdating || item.quantity <= (item.minQuantity ?? 0)}
											onclick={() => decrementQuantity(item)}
											aria-label={t("decrease_quantity")}
										>
											&minus;
										</button>
										{#if editingItemId === item.id}
											<input
												type="number"
												min={item.minQuantity ?? 0}
												max={item.maxQuantity}
												step={item.quantityStep ?? 1}
												class={!unstyled ? "stuic-cart-quantity-input" : undefined}
												value={item.quantity}
												onblur={(e) =>
													handleQuantityInputCommit(
														item.id,
														item.quantity,
														e.currentTarget.value
													)}
												onkeydown={(e) => {
													if (e.key === "Enter") {
														handleQuantityInputCommit(
															item.id,
															item.quantity,
															e.currentTarget.value
														);
													} else if (e.key === "Escape") {
														editingItemId = null;
													}
												}}
												use:autoFocusAndSelect
											/>
										{:else}
											<button
												type="button"
												class={!unstyled ? "stuic-cart-quantity-value" : undefined}
												onclick={() => (editingItemId = item.id)}
												disabled={isUpdating}
											>
												{item.quantity}
											</button>
										{/if}
										<button
											type="button"
											class={!unstyled ? "stuic-cart-quantity-button" : undefined}
											disabled={isUpdating ||
												(item.maxQuantity != null && item.quantity >= item.maxQuantity)}
											onclick={() => incrementQuantity(item)}
											aria-label={t("increase_quantity")}
										>
											+
										</button>
									</div>
									{#if item.unit}
										<span class={!unstyled ? "stuic-cart-item-unit" : undefined}>
											{item.unit}
										</span>
									{/if}
									<button
										type="button"
										class={!unstyled ? "stuic-cart-remove" : undefined}
										disabled={isUpdating}
										onclick={() => onRemove?.(item.id)}
									>
										{t("remove_item")}
									</button>
								</div>
							{/if}
						</div>

						<!-- Line total -->
						<div class={!unstyled ? "stuic-cart-item-total" : undefined}>
							{formatPrice(item.lineTotal)}
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Summary (hidden in summary variant) -->
		{#if !isSummary}
			{#if summary}
				{@render summary({ items, total, itemCount, formatPrice })}
			{:else}
				<div
					class={!unstyled ? "stuic-cart-summary" : undefined}
					data-variant={!unstyled ? variant : undefined}
				>
					<span class={!unstyled ? "stuic-cart-summary-label" : undefined}>
						{t("total_label")}
						({itemCount === 1
							? t("item_count_1")
							: t("item_count_n", { count: itemCount })})
					</span>
					<span
						class={!unstyled ? "stuic-cart-summary-total" : undefined}
						data-variant={!unstyled ? variant : undefined}
					>
						{formatPrice(total)}
					</span>
				</div>
			{/if}

			<!-- Footer -->
			{#if footer}
				<div class={!unstyled ? "stuic-cart-footer" : undefined}>
					{@render footer({ items, total, itemCount })}
				</div>
			{/if}
		{/if}
	{/if}
</div>
