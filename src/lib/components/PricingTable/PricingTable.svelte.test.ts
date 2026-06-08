import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import PricingTable from "./PricingTable.svelte";
import type { PricingTier } from "./PricingTable.svelte";

// PricingTable renders a <div class="stuic-pricing-table"> wrapping a role="list"
// tiers grid (each tier is role="listitem"). High-yield, build-invisible contracts:
//   - the role="list"/"listitem" a11y structure and tier count
//   - the billing toggle (a ButtonGroupRadio -> role="radio" Monthly/Annual) appears
//     only when showBillingToggle && some tier has BOTH monthly+annual prices, and
//     clicking "Annual" reactively switches the rendered prices (binding proof)
//   - data-highlighted / data-disabled tier flags + their badges/labels
//   - per-feature data-included flag (icon:false drops it)
//   - the CTA callback fires with (tier, billingPeriod)
// We assert data-* contracts + a single meaningful class, never class strings.

// Shared tiers fixture per the brief. ctaOnClick is wired per-test so we can spy.
function makeTiers(ctaOnClick: PricingTier["ctaOnClick"]): PricingTier[] {
	return [
		{ id: "free", name: "Free", price: { monthly: 0, annual: 0 } },
		{
			id: "pro",
			name: "Pro",
			price: { monthly: 10, annual: 100 },
			highlighted: true,
			highlightedBadge: "Popular",
			features: [{ label: "Feature X" }, { label: "No Y", icon: false }],
			ctaLabel: "Buy",
			ctaOnClick,
		},
		{
			id: "sold",
			name: "Sold",
			price: { monthly: 5, annual: 5 },
			disabled: true,
			disabledLabel: "Sold out",
		},
	];
}

test("renders the stuic-pricing-table root with a role=list tiers grid of 3 tiers", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	// root container class is the one stable contract we assert by class
	expect(screen.container.querySelector(".stuic-pricing-table")).not.toBeNull();

	// The tiers grid is role="list", but each tier's feature <ul> is ALSO an implicit
	// role="list" (and feature <li>s are implicit "listitem"s), so a bare getByRole("list")
	// / getByRole("listitem") is ambiguous. Assert the grid + tier count by their classes.
	const grid = screen.container.querySelector(".stuic-pricing-table-tiers");
	expect(grid).not.toBeNull();
	expect(grid!.getAttribute("role")).toBe("list");
	expect(screen.container.querySelectorAll(".stuic-pricing-table-tier").length).toBe(3);
});

test("renders each tier name and the monthly price + period (default billingPeriod=monthly)", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	await expect.element(screen.getByText("Free")).toBeInTheDocument();
	await expect.element(screen.getByText("Pro")).toBeInTheDocument();
	// getByText is substring + case-insensitive by default (Playwright semantics, NOT
	// Testing Library exact). The "Sold" tier name would otherwise also match the
	// disabled CTA "Sold out" -> 2 elements -> strict-mode violation. Pin it exact.
	await expect.element(screen.getByText("Sold", { exact: true })).toBeInTheDocument();

	// numeric price -> "{currency}{value}" with the period label; default currency "$".
	// Pro's "$10" is unique across tiers (Free=$0, Sold=$5), so it locates one element.
	await expect.element(screen.getByText("$10")).toBeInTheDocument();

	// EVERY tier here has a numeric price, so the "/mo" period label renders 3 times.
	// A bare getByText("/mo") would resolve to 3 elements -> Playwright strict-mode
	// violation. Scope the period assertion to the (unique) highlighted Pro tier.
	const proTier = screen.container.querySelector(
		".stuic-pricing-table-tier[data-highlighted]"
	) as HTMLElement;
	expect(proTier).not.toBeNull();
	await expect.element(page.elementLocator(proTier).getByText("/mo")).toBeInTheDocument();
});

test("billing toggle shows Monthly/Annual radios when a tier has both periods", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	// ButtonGroupRadio renders the options as role=radio buttons
	await expect
		.element(screen.getByRole("radio", { name: "Monthly" }))
		.toBeInTheDocument();
	await expect.element(screen.getByRole("radio", { name: "Annual" })).toBeInTheDocument();
});

test("showBillingToggle=false hides the toggle even when both periods exist", async () => {
	const screen = render(PricingTable, {
		tiers: makeTiers(vi.fn()),
		showBillingToggle: false,
	});
	expect(screen.container.querySelector('[role="radio"]')).toBeNull();
});

test("toggle hidden when no tier defines both monthly AND annual prices", async () => {
	// "pro" only has a monthly price here -> hasBothPeriods is false -> no toggle
	const screen = render(PricingTable, {
		tiers: [
			{ id: "free", name: "Free", price: { monthly: 0 } },
			{ id: "pro", name: "Pro", price: { monthly: 10 } },
		],
	});
	expect(screen.container.querySelector('[role="radio"]')).toBeNull();
});

test("clicking the Annual radio reactively switches the rendered prices to annual", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	// Scope period assertions to the unique highlighted Pro tier: every tier renders a
	// period label, so a bare getByText("/mo" | "/yr") would match 3 elements (strict-mode
	// violation). The Pro price value ("$10" -> "$100") is unique across tiers on its own.
	const proTier = screen.container.querySelector(
		".stuic-pricing-table-tier[data-highlighted]"
	) as HTMLElement;
	expect(proTier).not.toBeNull();

	// monthly is the default: the Pro tier shows "$10" and "/mo". Poll the LIVE element's
	// textContent rather than a captured page.elementLocator(proTier): elementLocator
	// snapshots the element by its text, which changes when the price flips, so a captured
	// locator would go stale after the toggle. The proTier node itself is keyed (by tier.id)
	// and persists, so its textContent updates reactively in place.
	await expect.poll(() => proTier.textContent).toContain("$10");
	await expect.poll(() => proTier.textContent).toContain("/mo");

	await screen.getByRole("radio", { name: "Annual" }).click();

	// after switching, the Pro tier's price + period reactively update (binding -> DOM proof)
	await expect.poll(() => proTier.textContent).toContain("$100");
	await expect.poll(() => proTier.textContent).toContain("/yr");
});

test("highlighted tier carries data-highlighted and renders its badge", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	const highlighted = screen.container.querySelector(
		".stuic-pricing-table-tier[data-highlighted]"
	);
	expect(highlighted).not.toBeNull();
	// the highlighted tier is "pro" -> its badge text renders
	await expect.element(screen.getByText("Popular")).toBeInTheDocument();
});

test("feature with default icon gets data-included; icon:false feature does not", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	// the included feature label renders
	const included = screen.getByText("Feature X");
	await expect.element(included).toBeInTheDocument();

	// its <li> ancestor carries data-included=""
	const includedLi = (included.element() as HTMLElement).closest("li")!;
	expect(includedLi).not.toBeNull();
	expect(includedLi.hasAttribute("data-included")).toBe(true);

	// the icon:false ("No Y") feature label renders but its <li> has NO data-included
	const excluded = screen.getByText("No Y");
	await expect.element(excluded).toBeInTheDocument();
	const excludedLi = (excluded.element() as HTMLElement).closest("li")!;
	expect(excludedLi).not.toBeNull();
	expect(excludedLi.hasAttribute("data-included")).toBe(false);
});

test("CTA button click invokes ctaOnClick with the tier and current billingPeriod", async () => {
	const ctaOnClick = vi.fn();
	const screen = render(PricingTable, { tiers: makeTiers(ctaOnClick) });

	await screen.getByRole("button", { name: "Buy" }).click();

	expect(ctaOnClick).toHaveBeenCalledOnce();
	const [tierArg, periodArg] = ctaOnClick.mock.calls[0];
	expect(tierArg.id).toBe("pro");
	expect(periodArg).toBe("monthly");
});

test("CTA passes the active billingPeriod (annual) after the toggle is switched", async () => {
	const ctaOnClick = vi.fn();
	const screen = render(PricingTable, { tiers: makeTiers(ctaOnClick) });

	await screen.getByRole("radio", { name: "Annual" }).click();
	// wait for the switch to land in the DOM before clicking the CTA
	await expect.element(screen.getByText("$100")).toBeInTheDocument();

	await screen.getByRole("button", { name: "Buy" }).click();
	expect(ctaOnClick).toHaveBeenCalledOnce();
	expect(ctaOnClick.mock.calls[0][1]).toBe("annual");
});

test("disabled tier carries data-disabled and renders a disabled Button with the disabledLabel", async () => {
	const screen = render(PricingTable, { tiers: makeTiers(vi.fn()) });

	const disabledTier = screen.container.querySelector(
		".stuic-pricing-table-tier[data-disabled]"
	);
	expect(disabledTier).not.toBeNull();

	// the disabled tier exposes a disabled Button labelled "Sold out"
	const soldBtn = page.elementLocator(disabledTier as HTMLElement).getByRole("button", {
		name: "Sold out",
	});
	await expect.element(soldBtn).toBeInTheDocument();
	await expect.element(soldBtn).toBeDisabled();
});
