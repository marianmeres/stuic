import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import CheckoutOrderSummary from "./CheckoutOrderSummary.svelte";
import type { CheckoutOrderTotals } from "./_internal/checkout-types.js";

// CheckoutOrderSummary derives the shipping-row value with this precedence:
//   shippingPending → !hasShipping → shipping === 0 → formatted amount
// The `shippingPending` branch ("Calculated separately") was added for orders
// whose shipping is quoted later (e.g. international), where a 0 amount must NOT
// read as "Free". These tests pin that precedence using the default t().

const totals = (over: Partial<CheckoutOrderTotals> = {}): CheckoutOrderTotals => ({
	subtotal: 42000,
	tax: 0,
	shipping: 0,
	discount: 0,
	total: 42000,
	...over,
});

test("shippingPending shows the pending label, not 'Free', when shipping is 0", async () => {
	const screen = render(CheckoutOrderSummary, {
		totals: totals({ shipping: 0 }),
		shippingPending: true,
	});
	await expect.element(screen.getByText("Calculated separately")).toBeVisible();
	await expect.element(screen.getByText("Free")).not.toBeInTheDocument();
});

test("shippingPending wins over a non-zero amount (price is hidden while pending)", async () => {
	const screen = render(CheckoutOrderSummary, {
		totals: totals({ shipping: 1500 }),
		shippingPending: true,
	});
	await expect.element(screen.getByText("Calculated separately")).toBeVisible();
});

test("without shippingPending, a 0 amount still reads as 'Free' (baseline unchanged)", async () => {
	const screen = render(CheckoutOrderSummary, {
		totals: totals({ shipping: 0 }),
	});
	await expect.element(screen.getByText("Free")).toBeVisible();
	await expect.element(screen.getByText("Calculated separately")).not.toBeInTheDocument();
});

test("hasShipping=false shows the not-selected dash (pending takes precedence over it)", async () => {
	const dashOnly = render(CheckoutOrderSummary, {
		totals: totals({ shipping: 0 }),
		hasShipping: false,
	});
	await expect.element(dashOnly.getByText("—")).toBeVisible();

	const pendingWins = render(CheckoutOrderSummary, {
		totals: totals({ shipping: 0 }),
		hasShipping: false,
		shippingPending: true,
	});
	await expect.element(pendingWins.getByText("Calculated separately")).toBeVisible();
});
