import { render } from "vitest-browser-svelte";
import { createRawSnippet } from "svelte";
import { expect, test, vi } from "vitest";
import RegisterForm from "./RegisterForm.svelte";
import Harness from "./RegisterFormHarness.test.svelte";
import type {
	RegisterFieldConfig,
	RegisterFormData,
	RegisterFormValidationError,
} from "./_internal/register-form-types.js";

// Integration suite — drives the REAL submit pipeline end to end:
//   click CTA -> native submit -> onSubmitValidityCheck (capture, preventDefault)
//   -> reads each control's validity -> dispatches submit_valid -> handleSubmitValid
//   -> validateRegisterForm -> onSubmit(formData).
// The form is `novalidate`, so native `required` doesn't pop browser bubbles but IS
// still read by the action (invalid -> submit_invalid -> no onSubmit) — which is
// exactly why `showEmail`/`showPassword` must UNMOUNT rather than hide.
// No CSS is loaded; elements are located by label, by `name`, or by class.

const noop = () => {};

const VALID = {
	email: "jane@example.com",
	password: "hunter2hunter2",
} as const;

type HarnessExports = {
	getFormData(): RegisterFormData;
	setErrors(errs: RegisterFormValidationError[]): void;
	validate(): boolean;
	focusField(name: string): boolean;
};

function renderHarness(props: Record<string, unknown>) {
	const screen = render(Harness, props);
	return { screen, h: screen.component as unknown as HarnessExports };
}

const cta = (screen: { getByRole: (r: string, o: object) => unknown }) =>
	screen.getByRole("button", { name: "Create account" }) as {
		click(): Promise<void>;
	};

const formOf = (container: HTMLElement) =>
	container.querySelector("form") as HTMLFormElement;

const namesInForm = (container: HTMLElement) =>
	[...formOf(container).elements].map((el) => (el as HTMLInputElement).name);

// ---------------------------------------------------------------- defaults --

test("renders email + password + confirm by default", async () => {
	const screen = await render(RegisterForm, { onSubmit: noop });
	await expect
		.element(screen.getByLabelText("Email", { exact: true }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByLabelText("Password", { exact: true }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByLabelText("Confirm password", { exact: true }))
		.toBeInTheDocument();
});

test("filled-in defaults submit", async () => {
	const onSubmit = vi.fn();
	const screen = await render(RegisterForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await screen.getByLabelText("Confirm password", { exact: true }).fill(VALID.password);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit.mock.calls[0][0]).toMatchObject({ email: VALID.email });
});

// ------------------------------------------------- unmounting core fields --

test("showEmail={false} UNMOUNTS the email field (not merely hidden)", async () => {
	const screen = await render(RegisterForm, { onSubmit: noop, showEmail: false });
	expect(screen.container.querySelector('input[name="register-email"]')).toBeNull();
	// the decisive assertion: gone from form.elements, so the validity walk
	// in onSubmitValidityCheck can't see a `required` empty field
	expect(namesInForm(screen.container)).not.toContain("register-email");
	await expect
		.element(screen.getByLabelText("Password", { exact: true }))
		.toBeInTheDocument();
});

test("showPassword={false} unmounts password AND confirm", async () => {
	const screen = await render(RegisterForm, {
		onSubmit: noop,
		showPassword: false,
		showPasswordConfirm: true,
	});
	const names = namesInForm(screen.container);
	expect(names).not.toContain("register-password");
	expect(names).not.toContain("register-password-confirm");
	expect(names).toContain("register-email");
});

test("with both hidden the CTA still submits — no silent submit_invalid", async () => {
	const onSubmit = vi.fn();
	const screen = await render(RegisterForm, {
		onSubmit,
		showEmail: false,
		showPassword: false,
	});
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
	// untouched credential strings are still handed over
	expect(onSubmit.mock.calls[0][0]).toMatchObject({ email: "", password: "" });
});

test("with both hidden, validate() reports valid", async () => {
	const { h } = renderHarness({ onSubmit: noop, showEmail: false, showPassword: false });
	expect(h.validate()).toBe(true);
});

test("hiding the core fields still validates the extra fields", async () => {
	const onSubmit = vi.fn();
	const extraFields: RegisterFieldConfig[] = [
		{ name: "tenant", label: "Workspace id", required: true, position: "top" },
	];
	const screen = await render(RegisterForm, {
		onSubmit,
		showEmail: false,
		showPassword: false,
		extraFields,
	});
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Workspace id", { exact: true }).fill("acme");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit.mock.calls[0][0].extra).toMatchObject({ tenant: "acme" });
});

// ------------------------------------------------------- credentialsSlot ---

test("credentialsSlot renders at the credentials position", async () => {
	const { screen } = renderHarness({
		onSubmit: noop,
		showEmail: false,
		showPassword: false,
		withCredentialsSlot: true,
		extraFields: [
			{ name: "top", label: "Top field", position: "top" },
			{ name: "bottom", label: "Bottom field", position: "bottom" },
		] as RegisterFieldConfig[],
	});
	await expect.element(screen.getByTestId("credentials-slot")).toBeInTheDocument();

	const slot = screen.container.querySelector('[data-testid="credentials-slot"]')!;
	const top = screen.container.querySelector('input[name="register-extra-top"]')!;
	const bottom = screen.container.querySelector('input[name="register-extra-bottom"]')!;
	expect(
		top.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
	expect(
		slot.compareDocumentPosition(bottom) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
});

test("credentialsSlot composes with a still-visible core field", async () => {
	const { screen } = renderHarness({
		onSubmit: noop,
		showPassword: false,
		withCredentialsSlot: true,
	});
	await expect
		.element(screen.getByLabelText("Email", { exact: true }))
		.toBeInTheDocument();
	await expect.element(screen.getByTestId("credentials-slot")).toBeInTheDocument();
	const email = screen.container.querySelector('input[name="register-email"]')!;
	const slot = screen.container.querySelector('[data-testid="credentials-slot"]')!;
	expect(
		email.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
});

// -------------------------------------------------------- *FieldProps ------

test("emailFieldProps overrides the i18n label without supplying a `t`", async () => {
	const screen = await render(RegisterForm, {
		onSubmit: noop,
		emailFieldProps: { label: "Owner email", placeholder: "owner@corp.com" },
		passwordFieldProps: {
			label: "Passphrase",
			description: "At least 8 characters.",
		},
	});
	await expect
		.element(screen.getByLabelText("Owner email", { exact: true }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByLabelText("Passphrase", { exact: true }))
		.toBeInTheDocument();
	expect(
		screen.container.querySelector<HTMLInputElement>('input[name="register-email"]')
			?.placeholder
	).toBe("owner@corp.com");
	await expect.element(screen.getByText("At least 8 characters.")).toBeInTheDocument();
});

test("*FieldProps do not leak between fields", async () => {
	const screen = await render(RegisterForm, {
		onSubmit: noop,
		passwordConfirmFieldProps: { label: "Repeat it" },
	});
	await expect
		.element(screen.getByLabelText("Email", { exact: true }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByLabelText("Password", { exact: true }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByLabelText("Repeat it", { exact: true }))
		.toBeInTheDocument();
});

// --------------------------------------------------------- socialPosition --

test("default socialPosition renders the block after the CTA, divider above", async () => {
	const { screen } = renderHarness({ onSubmit: noop, withSocialLogins: true });
	const block = screen.container.querySelector(".stuic-register-form-social")!;
	const submit = screen.container.querySelector(".stuic-register-form-submit")!;
	const divider = block.querySelector(".stuic-register-form-social-divider")!;
	const buttons = block.querySelector(".stuic-register-form-social-buttons")!;

	expect(block.getAttribute("data-position")).toBe("bottom");
	expect(
		submit.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
	expect(
		divider.compareDocumentPosition(buttons) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
});

test('socialPosition="top" renders the block above the credentials, divider below', async () => {
	const { screen } = renderHarness({
		onSubmit: noop,
		withSocialLogins: true,
		socialPosition: "top",
		extraFields: [
			{ name: "tenant", label: "Workspace id", position: "top" },
		] as RegisterFieldConfig[],
	});
	const block = screen.container.querySelector(".stuic-register-form-social")!;
	const tenant = screen.container.querySelector('input[name="register-extra-tenant"]')!;
	const email = screen.container.querySelector('input[name="register-email"]')!;
	const divider = block.querySelector(".stuic-register-form-social-divider")!;
	const buttons = block.querySelector(".stuic-register-form-social-buttons")!;

	expect(block.getAttribute("data-position")).toBe("top");
	// after the top extra field, before the credentials
	expect(
		tenant.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
	expect(
		block.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
	// divider mirrored: below the buttons
	expect(
		buttons.compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
});

test("the default divider label follows the position it faces", async () => {
	// at the top the divider sits above the credentials, so "or continue with"
	// would read backwards
	const bottom = renderHarness({ onSubmit: noop, withSocialLogins: true });
	expect(
		bottom.screen.container
			.querySelector(".stuic-register-form-social-divider")
			?.textContent?.trim()
	).toBe("or continue with");

	const top = renderHarness({
		onSubmit: noop,
		withSocialLogins: true,
		socialPosition: "top",
	});
	expect(
		top.screen.container
			.querySelector(".stuic-register-form-social-divider")
			?.textContent?.trim()
	).toBe("or");

	// an explicit label still wins in both
	const override = renderHarness({
		onSubmit: noop,
		withSocialLogins: true,
		socialPosition: "top",
		socialDividerLabel: "or sign up with email",
	});
	expect(
		override.screen.container
			.querySelector(".stuic-register-form-social-divider")
			?.textContent?.trim()
	).toBe("or sign up with email");
});

test("socialDividerLabel={false} hides the divider in both positions", async () => {
	for (const socialPosition of ["top", "bottom"] as const) {
		const { screen } = renderHarness({
			onSubmit: noop,
			withSocialLogins: true,
			socialPosition,
			socialDividerLabel: false,
		});
		expect(
			screen.container.querySelector(".stuic-register-form-social-divider")
		).toBeNull();
		expect(
			screen.container.querySelector(".stuic-register-form-social-buttons")
		).not.toBeNull();
	}
});

test("unstyled suppresses the social classes and data-position", async () => {
	const { screen } = renderHarness({
		onSubmit: noop,
		withSocialLogins: true,
		socialPosition: "top",
		unstyled: true,
	});
	expect(screen.container.querySelector(".stuic-register-form-social")).toBeNull();
	expect(screen.container.querySelector("[data-position]")).toBeNull();
	await expect.element(screen.getByTestId("social-button")).toBeInTheDocument();
});

// ---------------------------------------------------------- submitDisabled --

test("submitDisabled disables the CTA and blocks onSubmit entirely", async () => {
	const onSubmit = vi.fn();
	const screen = await render(RegisterForm, {
		onSubmit,
		submitDisabled: true,
		showEmail: false,
		showPassword: false,
	});
	const button = screen.container.querySelector<HTMLButtonElement>(
		'button[type="submit"]'
	)!;
	expect(button.disabled).toBe(true);

	// bypass the disabled button entirely — a custom submitButton could too
	formOf(screen.container).requestSubmit();
	await new Promise((r) => setTimeout(r, 0));
	expect(onSubmit).not.toHaveBeenCalled();
});

test("submitButton payload reflects submitDisabled", async () => {
	const submitButton = createRawSnippet<[{ isSubmitting: boolean; disabled: boolean }]>(
		(ctx) => ({
			render: () =>
				`<button type="submit" data-testid="cta">${ctx().disabled ? "blocked" : "ready"}</button>`,
		})
	);
	// both render into the same page, so assert per-container (a page-level
	// locator would resolve to two elements and trip strict mode)
	const on = await render(RegisterForm, { onSubmit: noop, submitButton });
	expect(on.container.querySelector('[data-testid="cta"]')?.textContent).toBe("ready");

	const off = await render(RegisterForm, {
		onSubmit: noop,
		submitButton,
		submitDisabled: true,
	});
	expect(off.container.querySelector('[data-testid="cta"]')?.textContent).toBe("blocked");
});

// -------------------------------------------------------------- focusField --

test("focusField focuses core and extra fields, false for unrendered ones", async () => {
	const { screen, h } = renderHarness({
		onSubmit: noop,
		extraFields: [
			{ name: "tenant", label: "Workspace id", position: "top" },
		] as RegisterFieldConfig[],
	});

	expect(h.focusField("tenant")).toBe(true);
	expect(document.activeElement).toBe(
		screen.container.querySelector('input[name="register-extra-tenant"]')
	);

	expect(h.focusField("email")).toBe(true);
	expect(document.activeElement).toBe(
		screen.container.querySelector('input[name="register-email"]')
	);

	expect(h.focusField("nope")).toBe(false);
});

test("focusField returns false for an unmounted core field", async () => {
	const { h } = renderHarness({
		onSubmit: noop,
		showEmail: false,
		showPasswordConfirm: false,
	});
	expect(h.focusField("email")).toBe(false);
	expect(h.focusField("passwordConfirm")).toBe(false);
	expect(h.focusField("password")).toBe(true);
});

test("extra field refs stay keyed by name across a reorder", async () => {
	const a = { name: "a", label: "Field A" };
	const b = { name: "b", label: "Field B" };
	const { screen, h } = renderHarness({
		onSubmit: noop,
		extraFields: [a, b] as RegisterFieldConfig[],
	});
	await screen.rerender({ extraFields: [b, a] as RegisterFieldConfig[] });

	expect(h.focusField("a")).toBe(true);
	expect(document.activeElement).toBe(
		screen.container.querySelector('input[name="register-extra-a"]')
	);
});

// ------------------------------------------------- server (`errors`) flow ---

test("a server field error blocks submit, then clears itself once edited", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, showPasswordConfirm: false });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	// ...the server rejects it
	h.setErrors([{ field: "email", message: "That email is already registered" }]);

	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1); // still blocked
	await expect
		.element(screen.getByText("That email is already registered"))
		.toBeInTheDocument();

	// the user fixes the field — the error goes stale and submit works again,
	// WITHOUT the consumer touching the `errors` prop
	await screen.getByLabelText("Email", { exact: true }).fill("someone.else@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);
	expect(onSubmit.mock.calls[1][0].email).toBe("someone.else@example.com");
	// the inline message goes with it (cleared on the field's next validation run)
	await expect
		.element(screen.getByText("That email is already registered"))
		.not.toBeInTheDocument();
});

test("a server error on an extra field clears on that field's edit", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({
		onSubmit,
		showEmail: false,
		showPassword: false,
		extraFields: [
			{ name: "tenant", label: "Workspace id", required: true, position: "top" },
		] as RegisterFieldConfig[],
	});

	await screen.getByLabelText("Workspace id", { exact: true }).fill("acme");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	h.setErrors([{ field: "tenant", message: "That workspace id is taken" }]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	await screen.getByLabelText("Workspace id", { exact: true }).fill("acme-two");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);
});

test("typing the rejected value back in makes the error live again", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, showPasswordConfirm: false });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	h.setErrors([{ field: "email", message: "That email is already registered" }]);

	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();
});

test("an internal validation error is visible on the FIRST failed click", async () => {
	// validateRegisterForm runs on `submit_valid`, i.e. after the validity walk has
	// already run every field's validator — so without an explicit re-run its
	// messages would only appear on the second click.
	const onSubmit = vi.fn();
	const screen = await render(RegisterForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await screen.getByLabelText("Confirm password", { exact: true }).fill("something-else");
	await cta(screen).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect.element(screen.getByText("Passwords do not match")).toBeInTheDocument();
});

test("a rule with no DOM equivalent still reports on the first click", async () => {
	// `jane@localhost` satisfies type="email" but not EMAIL_RE, so the whole
	// failure exists only in validateRegisterForm — the pure "silent dead click"
	// shape if nothing repaints.
	const onSubmit = vi.fn();
	const screen = await render(RegisterForm, { onSubmit, showPasswordConfirm: false });
	await screen.getByLabelText("Email", { exact: true }).fill("jane@localhost");
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect
		.element(screen.getByText("Please enter a valid email address"))
		.toBeInTheDocument();
});

test("a delivered server error is visible without further interaction", async () => {
	const { screen, h } = renderHarness({ onSubmit: noop, showPasswordConfirm: false });
	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);

	h.setErrors([{ field: "email", message: "That email is already registered" }]);
	await expect
		.element(screen.getByText("That email is already registered"))
		.toBeInTheDocument();
});

test("an error on an UNMOUNTED core field keeps blocking — only the consumer clears it", async () => {
	// Self-clearing is scoped to fields the user can actually fix here. An error
	// on a field this form doesn't render is the consumer's to show and clear;
	// staling it on an unrelated edit would let the form post past a block they
	// deliberately set.
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({
		onSubmit,
		showEmail: false,
		showPasswordConfirm: false,
	});

	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	h.setErrors([{ field: "email", message: "That email is already registered" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Password", { exact: true }).fill("another-password");
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	h.setErrors([]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("an error on a field hidden by showPasswordConfirm={false} behaves the same", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, showPasswordConfirm: false });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	h.setErrors([{ field: "passwordConfirm", message: "Passwords do not match" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	h.setErrors([]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("an identical error redelivered after a resubmit is shown again", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, showPasswordConfirm: false });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	const SAME = [{ field: "email", message: "That email is already registered" }];
	h.setErrors([...SAME]);
	await screen.getByLabelText("Email", { exact: true }).fill("second@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);

	// the server rejects the new address with the very same message
	h.setErrors([...SAME]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2); // blocked again, not suppressed
	await expect
		.element(screen.getByText("That email is already registered"))
		.toBeInTheDocument();
});

test("an error on a consumer-owned field keeps blocking until the consumer clears it", async () => {
	// the "unchecked terms" shape: rendered from extraFieldsSlot, so there is no
	// edit here that answers it — the block must survive unrelated typing
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, showPasswordConfirm: false });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	h.setErrors([{ field: "tos", message: "You must accept the terms" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Email", { exact: true }).fill("someone.else@example.com");
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	h.setErrors([]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("a re-rendered, content-identical errors array does not resurrect a stale error", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, showPasswordConfirm: false });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	h.setErrors([{ field: "email", message: "That email is already registered" }]);

	// user starts fixing it, and the parent re-renders with a fresh array of the
	// same content (the common `errors={cond ? [{...}] : []}` shape)
	await screen.getByLabelText("Email", { exact: true }).fill("second@example.com");
	h.setErrors([{ field: "email", message: "That email is already registered" }]);

	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("`validate` passed via *FieldProps composes with the errors wiring", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({
		onSubmit,
		showPasswordConfirm: false,
		emailFieldProps: {
			validate: { customValidator: (v: unknown) => (v ? undefined : "own rule") },
		},
	});

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);

	// the consumer's own rule still runs...
	h.setErrors([{ field: "email", message: "That email is already registered" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();
	// ...and the server error is still rendered, not knocked out by the override
	await expect
		.element(screen.getByText("That email is already registered"))
		.toBeInTheDocument();
});

// ------------------------------------------------------------ initialValue --

test("a required extra field with initialValue validates and submits it", async () => {
	const onSubmit = vi.fn();
	const screen = await render(RegisterForm, {
		onSubmit,
		showEmail: false,
		showPassword: false,
		extraFields: [
			{
				name: "tenant",
				label: "Workspace id",
				required: true,
				initialValue: "acme",
			},
		] as RegisterFieldConfig[],
	});
	expect(
		screen.container.querySelector<HTMLInputElement>(
			'input[name="register-extra-tenant"]'
		)?.value
	).toBe("acme");

	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit.mock.calls[0][0].extra).toMatchObject({ tenant: "acme" });
});

test("initialValue never clobbers a value the consumer already set", async () => {
	const { h } = renderHarness({
		onSubmit: noop,
		initial: { extra: { tenant: "mine" } },
		extraFields: [
			{ name: "tenant", label: "Workspace id", initialValue: "acme" },
		] as RegisterFieldConfig[],
	});
	expect(h.getFormData().extra.tenant).toBe("mine");
});
