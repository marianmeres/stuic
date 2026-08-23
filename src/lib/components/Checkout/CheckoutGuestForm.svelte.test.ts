import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import CheckoutGuestForm from "./CheckoutGuestForm.svelte";
import Harness from "./CheckoutGuestFormHarness.test.svelte";
import type {
	CheckoutCustomerFormData,
	CheckoutValidationError,
} from "./_internal/checkout-types.js";

// This form submits through a plain `onsubmit` handler (no
// onSubmitValidityCheck), so `handleSubmit` always runs and the gate is the only
// thing standing between the user and `onSubmit`. That made the `errors` prop a
// hard block with, until now, no way out and — for every field but email — no
// visible message either.

type HarnessExports = {
	getFormData(): CheckoutCustomerFormData;
	setErrors(errs: CheckoutValidationError[]): void;
	validate(): boolean;
};

function renderHarness(props: Record<string, unknown>) {
	const screen = render(Harness, props);
	return { screen, h: screen.component as unknown as HarnessExports };
}

const cta = (screen: { getByRole: (r: string, o: object) => unknown }) =>
	screen.getByRole("button", { name: "Continue to Shipping" }) as {
		click(): Promise<void>;
	};

test("submits once the required email is valid", async () => {
	const onSubmit = vi.fn();
	const screen = await render(CheckoutGuestForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill("jane@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("an invalid email is reported on the FIRST failed click", async () => {
	const onSubmit = vi.fn();
	const screen = await render(CheckoutGuestForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill("jane@localhost");
	await cta(screen).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect
		.element(screen.getByText("Please enter a valid email address"))
		.toBeInTheDocument();
});

test("a server field error blocks submit, then clears itself once edited", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit });

	await screen.getByLabelText("Email", { exact: true }).fill("jane@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	h.setErrors([{ field: "email", message: "That address is already in use" }]);
	await expect
		.element(screen.getByText("That address is already in use"))
		.toBeInTheDocument();

	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1); // still blocked

	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);
});

test("a server error on a non-email field is now rendered, and self-clears", async () => {
	// only the email field used to consume `fieldError()`, so an error on any
	// other field blocked the submit with no message anywhere
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit });

	await screen.getByLabelText("Email", { exact: true }).fill("jane@example.com");
	h.setErrors([{ field: "first_name", message: "First name looks wrong" }]);
	await expect.element(screen.getByText("First name looks wrong")).toBeInTheDocument();

	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("First Name", { exact: true }).fill("Jane");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("an error on a field the form does not render keeps blocking", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit });

	await screen.getByLabelText("Email", { exact: true }).fill("jane@example.com");
	h.setErrors([{ field: "coupon", message: "Coupon expired" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	h.setErrors([]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("an error on a field hidden by `fields` keeps blocking too", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, fields: { phone: false } });
	expect(screen.container.querySelector('input[name="checkout-guest-phone"]')).toBeNull();

	await screen.getByLabelText("Email", { exact: true }).fill("jane@example.com");
	h.setErrors([{ field: "phone", message: "We could not reach that number" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();
});

test("the phone field still runs its own validation alongside server errors", async () => {
	// FieldPhoneNumber's customValidator REPLACES validatePhoneNumber, so the
	// server-error wiring has to delegate rather than knock it out
	const onSubmit = vi.fn();
	const screen = await render(CheckoutGuestForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill("jane@example.com");
	await screen.getByLabelText("Phone", { exact: true }).fill("12345");
	await cta(screen).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect.element(screen.getByText("Invalid phone number")).toBeInTheDocument();
});
