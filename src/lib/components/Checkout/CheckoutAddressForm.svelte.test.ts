import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Harness from "./CheckoutAddressFormHarness.test.svelte";
import PlainHarness from "./CheckoutAddressFormPlainHarness.test.svelte";
import type { CheckoutSubdivisionOption } from "./_internal/checkout-types.js";

// CheckoutAddressForm's `subdivisions` prop swaps the state_or_region field
// between the default free-text input and a fixed FieldSelect based on the
// currently selected country (see the "Country-aware state/region select"
// section in README.md). These tests pin the behavior spec:
//   - mode resolution is live (reacts to address.country edits)
//   - the stored value is always the option `code`
//   - prefill reconciliation self-heals legacy values ("mi"/"Michigan" → "MI")
//     but NEVER destroys unrecognized ones
//   - required semantics (subdivisionRequired, default true in select mode)
//   - the `stateField` snippet override replaces the built-in in both modes
// All tests drive a real bound $state address via the harness (rerender can't
// propagate into a component that writes its own $bindable — see the harness).

const US: CheckoutSubdivisionOption[] = [
	{ code: "MI", name: "Michigan" },
	{ code: "MN", name: "Minnesota" },
	{ code: "CA", name: "California" },
];
const CA: CheckoutSubdivisionOption[] = [
	{ code: "ON", name: "Ontario" },
	{ code: "MB", name: "Manitoba" },
];
const SUBDIVISIONS = { US, CA };

const LABEL = "State / Region";

type HarnessExports = {
	getAddress: () => import("./_internal/checkout-types.js").CheckoutAddressData;
	validate: () => boolean;
};

function renderHarness(props: Record<string, unknown>) {
	const screen = render(Harness, props);
	return { screen, h: screen.component as unknown as HarnessExports };
}

// --- mode resolution -------------------------------------------------------

test("without `subdivisions` the field is the unchanged free-text input (regression: opt-in only)", async () => {
	// Seeded with a display-name value: with the feature OFF nothing may
	// reconcile, require, or re-label the field — the pre-feature behavior
	// verbatim.
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "Michigan" },
	});
	const input = screen.getByLabelText(LABEL);
	await expect.element(input).toHaveRole("textbox");
	await expect.element(input).toHaveValue("Michigan"); // NOT reconciled to "MI"
	await expect.element(input).not.toBeRequired();
	await expect.element(input).toHaveAttribute("placeholder", "");
	expect(h.getAddress().state_or_region).toBe("Michigan");
});

test("mode swaps live on country edits: listed → select, unlisted/unknown → input", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("combobox");
	// the select's empty option uses the dedicated placeholder key
	await expect.element(screen.getByText("Select…")).toBeInTheDocument();

	h.getAddress().country = "SK"; // no list → free text
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("textbox");

	h.getAddress().country = "XX"; // unknown country → free text
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("textbox");

	h.getAddress().country = "CA"; // listed again → select
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("combobox");
});

// --- stored value ----------------------------------------------------------

test("selecting an option stores the `code`, not the display name", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
	});
	const select = screen.getByLabelText(LABEL);
	await select.selectOptions("MN");
	await expect.element(select).toHaveValue("MN");
	expect(h.getAddress().state_or_region).toBe("MN");
});

// --- prefill reconciliation ------------------------------------------------

test("reconciliation: lowercase code is normalized to the canonical code", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "mi" },
		subdivisions: SUBDIVISIONS,
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveValue("MI");
	expect(h.getAddress().state_or_region).toBe("MI");
});

test("reconciliation: display-name value is rewritten to its code (self-heals legacy rows)", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "Michigan" },
		subdivisions: SUBDIVISIONS,
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveValue("MI");
	expect(h.getAddress().state_or_region).toBe("MI");
});

test("reconciliation: unrecognized value renders unselected but is NEVER destroyed", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "Narnia" },
		subdivisions: SUBDIVISIONS,
	});
	const select = screen.getByLabelText(LABEL);
	await expect.element(select).toHaveRole("combobox");
	// no option matches → select is truly unselected (not the placeholder)
	expect((select.element() as HTMLSelectElement).selectedIndex).toBe(-1);
	expect(h.getAddress().state_or_region).toBe("Narnia");
});

test("reconciliation: empty value stays empty (no write), placeholder option shows", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "" },
		subdivisions: SUBDIVISIONS,
	});
	const select = screen.getByLabelText(LABEL);
	await expect.element(select).toHaveValue("");
	expect((select.element() as HTMLSelectElement).selectedIndex).toBe(0);
	expect(h.getAddress().state_or_region).toBe("");
});

test("country round-trip preserves the stored code (US → CA → US restores 'MI')", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "MI" },
		subdivisions: SUBDIVISIONS,
	});
	const select = screen.getByLabelText(LABEL);
	await expect.element(select).toHaveValue("MI");

	h.getAddress().country = "CA"; // "MI" is not a CA code/name → unselected, untouched
	await expect.element(screen.getByText("Ontario")).toBeInTheDocument();
	expect(h.getAddress().state_or_region).toBe("MI");
	expect((select.element() as HTMLSelectElement).selectedIndex).toBe(-1);

	h.getAddress().country = "US";
	await expect.element(screen.getByLabelText(LABEL)).toHaveValue("MI");
});

// --- required semantics ----------------------------------------------------

// NOTE: one harness per test — two instances would duplicate the
// "address-state_or_region" id and label/for association would resolve to the
// first one document-wide.

test("select mode is required by default", async () => {
	const { screen } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
	});
	await expect.element(screen.getByLabelText(LABEL)).toBeRequired();
});

test("subdivisionRequired=false opts out of select-mode required", async () => {
	const { screen } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
		subdivisionRequired: false,
	});
	await expect.element(screen.getByLabelText(LABEL)).not.toBeRequired();
});

test("subdivisionRequired accepts a per-country predicate", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
		subdivisionRequired: (cc: string) => cc === "CA",
	});
	await expect.element(screen.getByLabelText(LABEL)).not.toBeRequired();
	h.getAddress().country = "CA";
	await expect.element(screen.getByLabelText(LABEL)).toBeRequired();
});

test("input mode keeps the plain requiredFields behavior (not required by default)", async () => {
	const { screen } = renderHarness({
		initial: { country: "SK" },
		subdivisions: SUBDIVISIONS,
	});
	const input = screen.getByLabelText(LABEL);
	await expect.element(input).toHaveRole("textbox");
	await expect.element(input).not.toBeRequired();
});

test("a requiredFields entry for state_or_region wins over subdivisionRequired=false", async () => {
	const { screen } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
		subdivisionRequired: false,
		requiredFields: [
			"name",
			"street",
			"city",
			"postal_code",
			"country",
			"state_or_region",
		],
	});
	await expect.element(screen.getByLabelText(LABEL)).toBeRequired();
});

test("validate() blocks an empty required subdivision and passes once one is picked", async () => {
	const { screen, h } = renderHarness({
		initial: {
			name: "Jo",
			street: "1 Main St",
			city: "Detroit",
			postal_code: "48201",
			country: "US",
			state_or_region: "",
		},
		subdivisions: SUBDIVISIONS,
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("combobox");
	expect(h.validate()).toBe(false);

	await screen.getByLabelText(LABEL).selectOptions("MI");
	await vi.waitFor(() => expect(h.validate()).toBe(true));
});

// --- stateField snippet override -------------------------------------------

test("stateField snippet replaces the built-in field and receives the active options", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US" },
		subdivisions: SUBDIVISIONS,
		withCustomStateField: true,
	});
	await expect.element(screen.getByTestId("custom-state-field")).toBeInTheDocument();
	await expect
		.element(screen.getByTestId("custom-state-options"))
		.toHaveTextContent("MI,MN,CA");
	// built-in field is gone in BOTH modes
	expect(screen.container.querySelector(`[id$="state_or_region"]`)).toBeNull();

	h.getAddress().country = "SK"; // free-text mode → snippet gets null options
	await expect
		.element(screen.getByTestId("custom-state-options"))
		.toHaveTextContent("null");

	await screen.getByTestId("custom-state-set").click();
	expect(h.getAddress().state_or_region).toBe("MI");
});

test("stateField snippet: built-in reconciliation is OFF — the custom control owns the value", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "Michigan" },
		subdivisions: SUBDIVISIONS,
		withCustomStateField: true,
	});
	// select mode is active for the snippet (options delivered)...
	await expect
		.element(screen.getByTestId("custom-state-options"))
		.toHaveTextContent("MI,MN,CA");
	// ...but the value is NOT rewritten behind the snippet's back
	expect(h.getAddress().state_or_region).toBe("Michigan");
});

// --- free-text (input mode) value preservation ------------------------------

test("free-text countries keep raw text verbatim even with `subdivisions` passed", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "SK", state_or_region: "Bratislavský kraj" },
		subdivisions: SUBDIVISIONS,
	});
	const input = screen.getByLabelText(LABEL);
	await expect.element(input).toHaveRole("textbox");
	await expect.element(input).toHaveValue("Bratislavský kraj");
	expect(h.getAddress().state_or_region).toBe("Bratislavský kraj");
});

test("round-trip THROUGH input mode preserves the code (US 'MI' → SK shows text → US reselects)", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "MI" },
		subdivisions: SUBDIVISIONS,
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveValue("MI");

	h.getAddress().country = "SK"; // no list → the code renders as plain text
	const input = screen.getByLabelText(LABEL);
	await expect.element(input).toHaveRole("textbox");
	await expect.element(input).toHaveValue("MI");
	expect(h.getAddress().state_or_region).toBe("MI");

	h.getAddress().country = "US";
	const select = screen.getByLabelText(LABEL);
	await expect.element(select).toHaveRole("combobox");
	await expect.element(select).toHaveValue("MI");
});

test("a name typed in input mode reconciles to its code when the country later matches", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "SK" },
		subdivisions: SUBDIVISIONS,
	});
	const input = screen.getByLabelText(LABEL);
	await expect.element(input).toHaveRole("textbox");
	await input.fill("Michigan");
	(input.element() as HTMLInputElement).blur();
	expect(h.getAddress().state_or_region).toBe("Michigan");

	h.getAddress().country = "US";
	const select = screen.getByLabelText(LABEL);
	await expect.element(select).toHaveRole("combobox");
	await expect.element(select).toHaveValue("MI");
	expect(h.getAddress().state_or_region).toBe("MI");
});

// --- required / errors through validate() -----------------------------------

test("subdivisionRequired=false: validate() passes with an empty subdivision", async () => {
	const { screen, h } = renderHarness({
		initial: {
			name: "Jo",
			street: "1 Main St",
			city: "Detroit",
			postal_code: "48201",
			country: "US",
			state_or_region: "",
		},
		subdivisions: SUBDIVISIONS,
		subdivisionRequired: false,
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("combobox");
	expect(h.validate()).toBe(true);
});

test("external `errors` for state_or_region surface inline in select mode via validate()", async () => {
	const { screen, h } = renderHarness({
		initial: { country: "US", state_or_region: "MI" },
		subdivisions: SUBDIVISIONS,
		errors: [{ field: "address.state_or_region", message: "Server rejected this state" }],
	});
	await expect.element(screen.getByLabelText(LABEL)).toHaveValue("MI");
	expect(h.validate()).toBe(false);
	await expect
		.element(screen.getByText("Server rejected this state"))
		.toBeInTheDocument();
});

// --- plain (non-$state) address object --------------------------------------

test("plain address object: country edits made through the form still flip the mode live", async () => {
	const screen = render(PlainHarness, {
		initial: { country: "SK", state_or_region: "Michigan" },
		subdivisions: SUBDIVISIONS,
	});
	const h = screen.component as unknown as {
		getAddress: () => { state_or_region?: string };
	};
	const input = screen.getByLabelText(LABEL);
	await expect.element(input).toHaveRole("textbox");
	await expect.element(input).toHaveValue("Michigan");

	await screen.getByTestId("plain-country-us").click();
	const select = screen.getByLabelText(LABEL);
	await expect.element(select).toHaveRole("combobox");
	// reconciliation healed the plain object's data on mode entry
	await vi.waitFor(() => expect(h.getAddress().state_or_region).toBe("MI"));

	await screen.getByTestId("plain-country-sk").click();
	await expect.element(screen.getByLabelText(LABEL)).toHaveRole("textbox");
	expect(h.getAddress().state_or_region).toBe("MI");
});
