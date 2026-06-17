import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import FieldMoney from "./FieldMoney.svelte";
import FieldMoneyHarness from "./FieldMoneyHarness.test.svelte";

// FieldMoney wraps FieldInput (→ InputWrap: the <div class="stuic-input" data-size>
// shell, a <label for={id}>, and a <input type="text" inputmode="decimal">). The
// VISIBLE input shows a MAJOR-unit decimal ("19.99") and is intentionally name-less;
// a sibling <input type="hidden" name> carries the INTEGER MINOR units the form
// submits (1999). The visible input id matches the label `for`, so getByLabelText
// finds it.
//
// Both the value→display and display→value paths are $effect/$derived-driven, so
// hidden-value assertions are poll-driven (never a fixed sleep). The `validate`
// action (numeric guard) listens on the native `change` event; Playwright's .fill()
// only fires `input`, so validation tests dispatch a real `change` too.
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

const hidden = (container: HTMLElement) =>
	container.querySelector('input[type="hidden"]') as HTMLInputElement | null;

test("renders the stuic-input shell (data-size=md) with a label associated to a decimal input", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	const input = screen.getByLabelText("Price");
	await expect.element(input).toBeInTheDocument();
	await expect.element(input).toHaveAttribute("type", "text");
	await expect.element(input).toHaveAttribute("inputmode", "decimal");
});

test("the visible input is name-less; a hidden input carries the name", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	// visible input must NOT carry name (else the form serializes the display string)
	await expect.element(screen.getByLabelText("Price")).not.toHaveAttribute("name");
	const h = hidden(screen.container);
	expect(h).not.toBeNull();
	expect(h!.getAttribute("name")).toBe("price");
});

test("external value (integer minor units) populates the visible major-unit input AND the hidden input", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price", value: 1999 });
	// 1999 cents → "19.99" in the visible input
	await expect.element(screen.getByLabelText("Price")).toHaveValue("19.99");
	// hidden input carries the integer minor units verbatim
	await expect.poll(() => hidden(screen.container)?.value).toBe("1999");
});

test("typing a major-unit decimal writes integer minor units to the hidden input", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	const input = screen.getByLabelText("Price");
	await input.fill("12.34");
	await expect.poll(() => hidden(screen.container)?.value).toBe("1234");
});

test('WHOLE-VALUE CONTRACT: "20.00" serializes as 2000 minor units, not 20', async () => {
	// The headline footgun this component exists to prevent: a name on the visible
	// input would submit "20.00" and the server would read 20 (minor units) = $0.20.
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	const input = screen.getByLabelText("Price");
	await input.fill("20.00");
	await expect.poll(() => hidden(screen.container)?.value).toBe("2000");
});

test("empty input serializes as an empty hidden value", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price", value: 500 });
	await expect.poll(() => hidden(screen.container)?.value).toBe("500");
	const input = screen.getByLabelText("Price");
	await input.fill("");
	await expect.poll(() => hidden(screen.container)?.value).toBe("");
});

test("external value change (model switch via bind:value) resyncs the visible input and hidden value", async () => {
	// Driven through a bind:value harness — a live two-way binding propagates the
	// external change into the resync effect (rerender of a written $bindable does not).
	const screen = await render(FieldMoneyHarness, { initial: 1000 });
	const visible = () =>
		(screen.getByLabelText("Price").element() as HTMLInputElement).value;
	await expect.poll(visible).toBe("10.00");
	await expect.poll(() => hidden(screen.container)?.value).toBe("1000");
	// Flip the externally-bound value → the second $effect resyncs display + hidden.
	await screen.getByTestId("set").click();
	await expect.poll(visible).toBe("25.00");
	await expect.poll(() => hidden(screen.container)?.value).toBe("2500");
});

test("no-clobber: a partially-typed amount is not reformatted out from under the user", async () => {
	// The resync effect's guard must NOT rewrite the display while it already
	// represents the same canonical amount — typing "12.3" stays "12.3" (not "12.30").
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	const input = screen.getByLabelText("Price");
	await input.fill("12.3");
	await expect.poll(() => hidden(screen.container)?.value).toBe("1230");
	expect((input.element() as HTMLInputElement).value).toBe("12.3");
});

test("negative external value renders and serializes with its sign (no min set)", async () => {
	const screen = await render(FieldMoney, { label: "Adj", name: "adj", value: -1999 });
	await expect.element(screen.getByLabelText("Adj")).toHaveValue("-19.99");
	await expect.poll(() => hidden(screen.container)?.value).toBe("-1999");
});

test("typing a negative amount (no min) serializes negative minor units", async () => {
	const screen = await render(FieldMoney, { label: "Adj", name: "adj" });
	const input = screen.getByLabelText("Adj");
	await input.fill("-19.99");
	await expect.poll(() => hidden(screen.container)?.value).toBe("-1999");
});

test("CONSISTENCY: a hex literal is rejected, not silently stored as 0", async () => {
	// The validator and the submitted hidden value share one decimal parser, so a
	// value the validator rejects is never silently submitted as a wrong amount.
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	const input = screen.getByLabelText("Price");
	await input.fill("0x10");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Please enter a valid amount."))
		.toBeInTheDocument();
	await expect.poll(() => hidden(screen.container)?.value).toBe("");
});

test("CONSISTENCY: trailing garbage is rejected, not partially parsed", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	const input = screen.getByLabelText("Price");
	await input.fill("12.34abc");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Please enter a valid amount."))
		.toBeInTheDocument();
	await expect.poll(() => hidden(screen.container)?.value).toBe("");
});

test("validate: a consumer customValidator runs after the numeric guard passes", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		validate: { customValidator: () => "too cheap" },
	});
	const input = screen.getByLabelText("Price");
	// numerically valid → built-in guard passes → consumer validator runs
	await input.fill("5.00");
	fireChange(input.element());
	await expect.element(screen.getByText("too cheap")).toBeInTheDocument();
});

test("validate: the built-in numeric guard pre-empts the consumer customValidator", async () => {
	const seen: unknown[] = [];
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		validate: {
			customValidator: (v) => {
				seen.push(v);
				return "too cheap";
			},
		},
	});
	const input = screen.getByLabelText("Price");
	// non-numeric → built-in message wins; the consumer validator is never reached
	await input.fill("abc");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Please enter a valid amount."))
		.toBeInTheDocument();
	await expect.element(screen.getByText("too cheap")).not.toBeInTheDocument();
	expect(seen).not.toContain("abc");
});

test("scale/decimals support non-cents currencies", async () => {
	const screen = await render(FieldMoney, {
		label: "Rate",
		name: "rate",
		value: 5,
		scale: 1000,
		decimals: 3,
	});
	// 5 minor units at scale 1000 → "0.005"
	await expect.element(screen.getByLabelText("Rate")).toHaveValue("0.005");
	const input = screen.getByLabelText("Rate");
	await input.fill("1.250");
	await expect.poll(() => hidden(screen.container)?.value).toBe("1250");
});

test("validate: non-numeric input shows the built-in message and serializes empty", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price" });
	const input = screen.getByLabelText("Price");
	await input.fill("abc");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Please enter a valid amount."))
		.toBeInTheDocument();
	// garbage is treated as "no amount", not silently 0
	await expect.poll(() => hidden(screen.container)?.value).toBe("");
});

test("validate: min guard (major units) rejects values below the minimum", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		min: 0,
	});
	const input = screen.getByLabelText("Price");
	await input.fill("-5.00");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Amount must be at least 0."))
		.toBeInTheDocument();
});

test("validate: max guard (major units) rejects values above the maximum", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		max: 100,
	});
	const input = screen.getByLabelText("Price");
	await input.fill("150.00");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Amount must be at most 100."))
		.toBeInTheDocument();
});

test("validate: a valid amount clears the validation message", async () => {
	const screen = await render(FieldMoney, { label: "Price", name: "price", min: 0 });
	const input = screen.getByLabelText("Price");
	await input.fill("-5.00");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Amount must be at least 0."))
		.toBeInTheDocument();
	await input.fill("5.00");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Amount must be at least 0."))
		.not.toBeInTheDocument();
});

test("validate={false} disables the built-in numeric guard", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		validate: false,
	});
	const input = screen.getByLabelText("Price");
	await input.fill("abc");
	fireChange(input.element());
	await expect
		.element(screen.getByText("Please enter a valid amount."))
		.not.toBeInTheDocument();
});

test("renderSize maps to the data-size shell attribute", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("disabled disables the visible input", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		disabled: true,
	});
	await expect.element(screen.getByLabelText("Price")).toBeDisabled();
});

test("description text is rendered", async () => {
	const screen = await render(FieldMoney, {
		label: "Price",
		name: "price",
		description: "In USD",
	});
	await expect.element(screen.getByText("In USD")).toBeInTheDocument();
});
