import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import EmailVerifyForm from "./EmailVerifyForm.svelte";

// EmailVerifyForm is a <form> around an OtpInput, a submit button and an optional resend
// control. The OTP input auto-focuses by default; these tests turn that off so focus does not
// leak between them (the focus behaviour itself is OtpInput's, tested there).
const base = {
	email: "user@example.com",
	onSubmit: () => {},
	otpInputProps: { autoFocus: false },
};

test("renders the heading, the address and one OTP slot per digit", async () => {
	const screen = await render(EmailVerifyForm, { ...base, codeLength: 4 });
	await expect.element(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
	await expect.element(screen.getByText("user@example.com")).toBeInTheDocument();
	expect(screen.container.querySelectorAll(".stuic-otp-input input").length).toBe(4);
});

test("no onResend, no resend control", async () => {
	const screen = await render(EmailVerifyForm, base);
	await expect
		.element(screen.getByRole("button", { name: "Resend code" }))
		.not.toBeInTheDocument();
});

// A resend starts the "sent" flash (3s) and the cooldown (30s by default) together. The
// countdown used to be rendered first, so it hid the confirmation for its whole life.
test("a resend confirms with 'New code sent' before the countdown takes over", async () => {
	const onResend = vi.fn();
	const screen = await render(EmailVerifyForm, { ...base, onResend });
	await screen.getByRole("button", { name: "Resend code" }).click();

	expect(onResend).toHaveBeenCalledOnce();
	await expect.element(screen.getByText("New code sent")).toBeInTheDocument();
	// the resend button is gone for the cooldown, so a second code cannot be requested yet
	await expect
		.element(screen.getByRole("button", { name: "Resend code" }))
		.not.toBeInTheDocument();
});

test("completing the code submits it once", async () => {
	const onSubmit = vi.fn();
	const screen = await render(EmailVerifyForm, { ...base, onSubmit, codeLength: 4 });
	for (const [i, digit] of ["1", "2", "3", "4"].entries()) {
		await screen.getByLabelText(`Digit ${i + 1} of 4`, { exact: true }).fill(digit);
	}
	expect(onSubmit).toHaveBeenCalledOnce();
	expect(onSubmit).toHaveBeenCalledWith("1234");
});
