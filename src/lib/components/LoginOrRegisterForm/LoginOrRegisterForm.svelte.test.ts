import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import LoginOrRegisterForm from "./LoginOrRegisterForm.svelte";
import { createLoginOrRegisterFormT } from "./i18n.js";
import { LOGIN_OR_REGISTER_FORM_MESSAGES_SK } from "./i18n-sk.js";

// The composite forwards its `t` to the inner LoginForm / RegisterForm /
// EmailVerifyForm — which is why its catalog (and factory fallback) spans all
// four namespaces. These tests pin that forwarding from the outside.

const noop = () => {};

test("one `t` localizes the composite's tabs and the inner form", async () => {
	const t = createLoginOrRegisterFormT(LOGIN_OR_REGISTER_FORM_MESSAGES_SK);
	const screen = await render(LoginOrRegisterForm, {
		onLogin: noop,
		onRegister: noop,
		t,
	});
	// own key (`login_or_register_form.mode_register`)
	await expect.element(screen.getByText("Registrácia", { exact: true })).toBeVisible();
	// inner LoginForm keys, through the forwarded `t`
	await expect.element(screen.getByLabelText("Heslo", { exact: true })).toBeVisible();
	await expect
		.element(screen.getByRole("button", { name: "Prihlásiť sa", exact: true }))
		.toBeVisible();
});

test("a partial catalog leaves every other key — inner forms included — in English", async () => {
	const t = createLoginOrRegisterFormT({ "login_or_register_form.mode_login": "Dnu" });
	const screen = await render(LoginOrRegisterForm, {
		onLogin: noop,
		onRegister: noop,
		t,
	});
	await expect.element(screen.getByText("Dnu", { exact: true })).toBeVisible();
	await expect.element(screen.getByText("Sign up", { exact: true })).toBeVisible();
	await expect.element(screen.getByLabelText("Password", { exact: true })).toBeVisible();
	await expect
		.element(screen.getByRole("button", { name: "Log In", exact: true }))
		.toBeVisible();
});
