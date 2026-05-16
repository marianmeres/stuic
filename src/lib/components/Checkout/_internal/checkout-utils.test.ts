import { assert, test } from "vitest";
import type { TranslateFn } from "../../../types.js";
import type { CheckoutAddressData } from "./checkout-types.js";
import {
	addressesEqual,
	createEmptyAddress,
	createEmptyCustomerFormData,
	createEmptyLoginFormData,
	defaultFormatPrice,
	validateAddress,
	validateCustomerForm,
	validateEmail,
	validateLoginForm,
} from "./checkout-utils.js";

// Identity translator — returns the key so assertions can compare against keys directly.
const t: TranslateFn = (k) => k;

// ─────────────────────────────────────────────────────────────
// defaultFormatPrice
// ─────────────────────────────────────────────────────────────

test("defaultFormatPrice formats cents to a two-decimal string", () => {
	assert.equal(defaultFormatPrice(0), "0.00");
	assert.equal(defaultFormatPrice(1), "0.01");
	assert.equal(defaultFormatPrice(100), "1.00");
	assert.equal(defaultFormatPrice(1299), "12.99");
	assert.equal(defaultFormatPrice(1000000), "10000.00");
});

// ─────────────────────────────────────────────────────────────
// validateEmail
// ─────────────────────────────────────────────────────────────

test("validateEmail rejects empty strings", () => {
	assert.equal(validateEmail("", t), "checkout.guest.email_required");
	assert.equal(validateEmail("   ", t), "checkout.guest.email_required");
});

test("validateEmail rejects malformed addresses", () => {
	assert.equal(validateEmail("foo", t), "checkout.guest.email_invalid");
	assert.equal(validateEmail("foo@", t), "checkout.guest.email_invalid");
	assert.equal(validateEmail("foo@bar", t), "checkout.guest.email_invalid");
	assert.equal(validateEmail("@bar.com", t), "checkout.guest.email_invalid");
	assert.equal(validateEmail("foo bar@baz.com", t), "checkout.guest.email_invalid");
});

test("validateEmail accepts well-formed addresses", () => {
	assert.equal(validateEmail("foo@bar.com", t), null);
	assert.equal(validateEmail("user+tag@example.co.uk", t), null);
	assert.equal(validateEmail("  foo@bar.com  ", t), null); // whitespace is trimmed
});

// ─────────────────────────────────────────────────────────────
// validateAddress
// ─────────────────────────────────────────────────────────────

const fullAddress: CheckoutAddressData = {
	name: "Jane Doe",
	street: "123 Main St",
	city: "Bratislava",
	postal_code: "81101",
	country: "SK",
};

test("validateAddress flags every missing required field", () => {
	const errs = validateAddress(createEmptyAddress(), "shipping", t);
	const fieldPaths = errs.map((e) => e.field).sort();
	assert.deepEqual(fieldPaths, [
		"shipping.city",
		"shipping.country",
		"shipping.name",
		"shipping.postal_code",
		"shipping.street",
	]);
});

test("validateAddress accepts a full required set", () => {
	assert.deepEqual(validateAddress(fullAddress, "shipping", t), []);
});

test("validateAddress treats whitespace-only values as missing", () => {
	const addr = { ...fullAddress, name: "   " };
	const errs = validateAddress(addr, "shipping", t);
	assert.equal(errs.length, 1);
	assert.equal(errs[0].field, "shipping.name");
});

test("validateAddress validates the optional phone when present", () => {
	const addr = { ...fullAddress, phone: "not-a-phone" };
	const errs = validateAddress(addr, "shipping", t);
	assert.equal(errs.length, 1);
	assert.equal(errs[0].field, "shipping.phone");
});

test("validateAddress does NOT flag a missing state_or_region (truly optional by default)", () => {
	// fullAddress has no state_or_region — validation should still pass.
	assert.deepEqual(validateAddress(fullAddress, "shipping", t), []);
	// Explicitly empty also passes.
	const addr = { ...fullAddress, state_or_region: "" };
	assert.deepEqual(validateAddress(addr, "shipping", t), []);
});

test("validateAddress prefixes field paths with the given prefix", () => {
	const errs = validateAddress(createEmptyAddress(), "billing", t);
	assert(errs.every((e) => e.field.startsWith("billing.")));
});

// ─────────────────────────────────────────────────────────────
// validateCustomerForm
// ─────────────────────────────────────────────────────────────

test("validateCustomerForm flags email and phone", () => {
	const data = createEmptyCustomerFormData();
	data.phone = "nope";
	const errs = validateCustomerForm(data, t);
	const fields = errs.map((e) => e.field).sort();
	assert.deepEqual(fields, ["email", "phone"]);
});

test("validateCustomerForm accepts a valid email with no phone", () => {
	const data = createEmptyCustomerFormData();
	data.email = "user@example.com";
	assert.deepEqual(validateCustomerForm(data, t), []);
});

// ─────────────────────────────────────────────────────────────
// validateLoginForm
// ─────────────────────────────────────────────────────────────

test("validateLoginForm flags missing email and password", () => {
	const errs = validateLoginForm(createEmptyLoginFormData(), t);
	const fields = errs.map((e) => e.field).sort();
	assert.deepEqual(fields, ["email", "password"]);
});

test("validateLoginForm flags invalid email format", () => {
	const errs = validateLoginForm(
		{ email: "not-an-email", password: "secret", rememberMe: false },
		t
	);
	assert.equal(errs.length, 1);
	assert.equal(errs[0].field, "email");
	assert.equal(errs[0].message, "checkout.login.email_invalid");
});

test("validateLoginForm accepts valid credentials", () => {
	assert.deepEqual(
		validateLoginForm(
			{ email: "user@example.com", password: "secret", rememberMe: false },
			t
		),
		[]
	);
});

// ─────────────────────────────────────────────────────────────
// addressesEqual
// ─────────────────────────────────────────────────────────────

test("addressesEqual returns true when either address is missing", () => {
	assert.isTrue(addressesEqual(undefined, undefined));
	assert.isTrue(addressesEqual(fullAddress, undefined));
	assert.isTrue(addressesEqual(undefined, fullAddress));
});

test("addressesEqual returns true for identical addresses", () => {
	assert.isTrue(addressesEqual(fullAddress, { ...fullAddress }));
});

test("addressesEqual returns false when any tracked field differs", () => {
	assert.isFalse(addressesEqual(fullAddress, { ...fullAddress, city: "Kosice" }));
	assert.isFalse(addressesEqual(fullAddress, { ...fullAddress, postal_code: "99999" }));
	assert.isFalse(addressesEqual(fullAddress, { ...fullAddress, state_or_region: "CA" }));
});

test("addressesEqual treats missing phone and empty phone as equal", () => {
	const a: CheckoutAddressData = { ...fullAddress };
	const b: CheckoutAddressData = { ...fullAddress, phone: "" };
	assert.isTrue(addressesEqual(a, b));
});

test("addressesEqual compares non-required fields (label, is_default)", () => {
	const a: CheckoutAddressData = { ...fullAddress, label: "home" };
	const b: CheckoutAddressData = { ...fullAddress, label: "work" };
	assert.isFalse(addressesEqual(a, b));

	const c: CheckoutAddressData = { ...fullAddress, is_default: true };
	const d: CheckoutAddressData = { ...fullAddress, is_default: false };
	assert.isFalse(addressesEqual(c, d));
});

// ─────────────────────────────────────────────────────────────
// createEmpty* factories
// ─────────────────────────────────────────────────────────────

test("createEmptyAddress returns all required fields as empty strings", () => {
	const addr = createEmptyAddress();
	for (const k of [
		"name",
		"street",
		"city",
		"state_or_region",
		"postal_code",
		"country",
		"phone",
	] as const) {
		assert.equal(addr[k], "", `expected ${k} to be empty string`);
	}
});

test("createEmptyCustomerFormData returns all fields as empty strings", () => {
	const data = createEmptyCustomerFormData();
	assert.equal(data.email, "");
	assert.equal(data.first_name, "");
	assert.equal(data.last_name, "");
	assert.equal(data.phone, "");
	assert.equal(data.company_name, "");
	assert.equal(data.tax_id, "");
	assert.equal(data.vat_number, "");
});

test("createEmptyLoginFormData defaults rememberMe to true", () => {
	const data = createEmptyLoginFormData();
	assert.equal(data.email, "");
	assert.equal(data.password, "");
	assert.equal(data.rememberMe, true);
});
