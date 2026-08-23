import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import LoginForm from "./LoginForm.svelte";
import Harness from "./LoginFormHarness.test.svelte";
import type {
	LoginFormData,
	LoginFormValidationError,
} from "./_internal/login-form-types.js";

// Drives the real submit pipeline: click CTA -> native submit ->
// onSubmitValidityCheck (capture, preventDefault) -> per-field validity ->
// submit_valid -> handleSubmitValid -> validateLoginForm -> onSubmit.
// Focus here is the `errors` lifecycle and error visibility; see
// RegisterForm.svelte.test.ts for the same behaviors covered in depth.

const VALID = { email: "jane@example.com", password: "hunter2" } as const;

type HarnessExports = {
	getFormData(): LoginFormData;
	setErrors(errs: LoginFormValidationError[]): void;
	validate(): boolean;
};

function renderHarness(props: Record<string, unknown>) {
	const screen = render(Harness, props);
	return { screen, h: screen.component as unknown as HarnessExports };
}

const cta = (screen: { getByRole: (r: string, o: object) => unknown }) =>
	screen.getByRole("button", { name: "Log In" }) as { click(): Promise<void> };

test("renders email + password and submits when filled", async () => {
	const onSubmit = vi.fn();
	const screen = await render(LoginForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit.mock.calls[0][0]).toMatchObject({ email: VALID.email });
});

test("a server field error blocks submit, then clears itself once edited", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	// ...the server rejects it
	h.setErrors([{ field: "email", message: "No account with that address" }]);
	await expect
		.element(screen.getByText("No account with that address"))
		.toBeInTheDocument();

	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1); // still blocked

	// the user fixes the field: the form must recover WITHOUT the consumer
	// touching the `errors` prop (their handler is what was being suppressed)
	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);
});

test("an error on a field the form does not render keeps blocking", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit });

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	h.setErrors([{ field: "captcha", message: "Captcha failed" }]);
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Email", { exact: true }).fill("other@example.com");
	await cta(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	h.setErrors([]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("an internal validation error is visible on the FIRST failed click", async () => {
	// `jane@localhost` satisfies type="email" but not the form's own regex, so
	// the whole failure exists only in validateLoginForm — which runs on
	// `submit_valid`, i.e. after every field validator has already re-run.
	const onSubmit = vi.fn();
	const screen = await render(LoginForm, { onSubmit });
	await screen.getByLabelText("Email", { exact: true }).fill("jane@localhost");
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect
		.element(screen.getByText("Please enter a valid email address"))
		.toBeInTheDocument();
});

test("an identical error redelivered after a resubmit blocks again", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit });
	const SAME = [{ field: "email", message: "No account with that address" }];

	await screen.getByLabelText("Email", { exact: true }).fill(VALID.email);
	await screen.getByLabelText("Password", { exact: true }).fill(VALID.password);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1);

	h.setErrors([...SAME]);
	await screen.getByLabelText("Email", { exact: true }).fill("second@example.com");
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);

	// the server rejects the new address with the very same message
	h.setErrors([...SAME]);
	await cta(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(2);
});
