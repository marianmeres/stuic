import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import ContactUsForm from "./ContactUsForm.svelte";
import Harness from "./ContactUsFormHarness.test.svelte";
import type {
	ContactFieldConfig,
	ContactFormData,
	ContactFormValidationError,
} from "./_internal/contact-form-types.js";

type HarnessExports = {
	getFormData(): ContactFormData;
	setErrors(errs: ContactFormValidationError[]): void;
	validate(): boolean;
	scrollToFirstError(): boolean;
};

// Integration suite — drives the REAL submit pipeline end to end:
//   click CTA -> native submit -> onSubmitValidityCheck (capture, preventDefault)
//   -> reads each control's validity -> dispatches submit_valid -> handleSubmitValid
//   -> validateContactForm -> onSubmit(formData, botCheck).
// The form is `novalidate`, so native `required` / `type=email` don't pop browser
// bubbles but ARE still read by the action (invalid -> submit_invalid -> no onSubmit).
// No CSS is loaded; fields are located by their <label> (getByLabelText) and the
// off-screen honeypot / hidden time-trap inputs by `name` via the container.

const noop = () => {};

test("by default renders only Email + Message", async () => {
	const screen = await render(ContactUsForm, { onSubmit: noop });
	await expect.element(screen.getByLabelText("Email")).toBeInTheDocument();
	await expect.element(screen.getByLabelText("Message")).toBeInTheDocument();
	const { container } = screen;
	expect(container.querySelector('input[name="contact-name"]')).toBeNull();
	expect(container.querySelector('input[name="contact-phone"]')).toBeNull();
	expect(container.querySelector('input[name="contact-subject"]')).toBeNull();
	expect(container.querySelector('input[name="contact-company"]')).toBeNull();
});

test("toggles render Name / Phone / Subject / Company", async () => {
	const screen = await render(ContactUsForm, {
		onSubmit: noop,
		showName: true,
		showPhone: true,
		showSubject: true,
		showCompany: true,
	});
	await expect.element(screen.getByLabelText("Name")).toBeInTheDocument();
	await expect.element(screen.getByLabelText("Phone")).toBeInTheDocument();
	await expect.element(screen.getByLabelText("Subject")).toBeInTheDocument();
	await expect.element(screen.getByLabelText("Company")).toBeInTheDocument();
});

test("renders the honeypot + time-trap by default; both can be disabled", async () => {
	const on = await render(ContactUsForm, { onSubmit: noop });
	expect(on.container.querySelector('input[name="link"]')).not.toBeNull();
	expect(on.container.querySelector('input[name="_ts"]')).not.toBeNull();

	const off = await render(ContactUsForm, {
		onSubmit: noop,
		useHoneypot: false,
		useTimeTrap: false,
	});
	expect(off.container.querySelector('input[name="link"]')).toBeNull();
	expect(off.container.querySelector('input[name="_ts"]')).toBeNull();
});

test("empty required fields block submit (onSubmit not called)", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, { onSubmit });
	await screen.getByRole("button", { name: "Send message" }).click();
	// settle: the form is still mounted, but native required routed to submit_invalid
	await expect.element(screen.getByLabelText("Email")).toBeInTheDocument();
	expect(onSubmit).not.toHaveBeenCalled();
});

test("valid submit calls onSubmit(formData, botCheck); a too-fast submit flags isLikelyBot", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, { onSubmit });
	await screen.getByLabelText("Email").fill("jane@example.com");
	await screen.getByLabelText("Message").fill("Hello there, I have a question.");
	await screen.getByRole("button", { name: "Send message" }).click();

	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
	const [data, botCheck] = onSubmit.mock.calls[0];
	expect(data.email).toBe("jane@example.com");
	expect(data.message).toContain("Hello there");
	// default timeTrapMinMs=2000 — the test submits well under that
	expect(botCheck.minMs).toBe(2000);
	expect(botCheck.isTooFast).toBe(true);
	expect(botCheck.honeypotFilled).toBe(false);
	expect(botCheck.isLikelyBot).toBe(true);
});

test("report-only: a filled honeypot STILL submits but flags isLikelyBot", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, { onSubmit, timeTrapMinMs: 0 });
	await screen.getByLabelText("Email").fill("bot@spam.com");
	await screen.getByLabelText("Message").fill("buy cheap stuff now");

	// Fill the off-screen honeypot directly — Playwright won't .fill a hidden input.
	const hp = screen.container.querySelector<HTMLInputElement>('input[name="link"]')!;
	hp.value = "http://spam.example";
	hp.dispatchEvent(new Event("input", { bubbles: true }));

	await screen.getByRole("button", { name: "Send message" }).click();

	await expect.poll(() => onSubmit.mock.calls.length).toBe(1); // not blocked
	const [, botCheck] = onSubmit.mock.calls[0];
	expect(botCheck.honeypot).toBe("http://spam.example");
	expect(botCheck.honeypotFilled).toBe(true);
	expect(botCheck.isLikelyBot).toBe(true);
});

test("clean human submit (minMs=0, empty honeypot) => isLikelyBot false", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, { onSubmit, timeTrapMinMs: 0 });
	await screen.getByLabelText("Email").fill("real@person.com");
	await screen.getByLabelText("Message").fill("Genuine question about pricing.");
	await screen.getByRole("button", { name: "Send message" }).click();

	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
	const [, botCheck] = onSubmit.mock.calls[0];
	expect(botCheck.isTooFast).toBe(false);
	expect(botCheck.honeypotFilled).toBe(false);
	expect(botCheck.isLikelyBot).toBe(false);
});

test("subjectValues renders Subject as a <select> (auto-shown) with a blank prompt + the values", async () => {
	const screen = await render(ContactUsForm, {
		onSubmit: noop,
		// no showSubject — subjectValues alone shows the field
		subjectValues: ["Sales", "Support"],
	});
	const sel = screen.container.querySelector<HTMLSelectElement>(
		'select[name="contact-subject"]'
	);
	expect(sel).not.toBeNull();
	// the free-text variant is NOT rendered
	expect(screen.container.querySelector('input[name="contact-subject"]')).toBeNull();
	// prepended blank prompt (value "") + the two values
	const opts = [...sel!.options].map((o) => o.value);
	expect(opts).toEqual(["", "Sales", "Support"]);
	// initial empty subject keeps the prompt selected (not auto-jumped to "Sales")
	expect(sel!.value).toBe("");
});

test("selecting a subject option binds into formData.subject and submits", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, {
		onSubmit,
		timeTrapMinMs: 0,
		subjectValues: ["Sales", "Support"],
	});
	await screen.getByLabelText("Email").fill("a@b.com");
	await screen.getByLabelText("Message").fill("hi");
	const sel = screen.container.querySelector<HTMLSelectElement>(
		'select[name="contact-subject"]'
	)!;
	sel.value = "Support";
	sel.dispatchEvent(new Event("change", { bubbles: true }));
	await screen.getByRole("button", { name: "Send message" }).click();

	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
	expect(onSubmit.mock.calls[0][0].subject).toBe("Support");
});

test("an extra field renders and binds into formData.extra", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, {
		onSubmit,
		timeTrapMinMs: 0,
		extraFields: [{ name: "reason", label: "Reason for contact", required: true }],
	});
	await screen.getByLabelText("Email").fill("a@b.com");
	await screen.getByLabelText("Message").fill("body");
	await screen.getByLabelText("Reason for contact").fill("Sales");
	await screen.getByRole("button", { name: "Send message" }).click();

	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
	const [data] = onSubmit.mock.calls[0];
	expect(data.extra.reason).toBe("Sales");
});

// --- server (`errors`) lifecycle + error visibility -------------------------
// (the same behaviors RegisterForm covers in depth; here we assert the shared
// `createExternalFieldErrors` / `repaintFieldErrors` wiring is actually in place)

function renderHarness(props: Record<string, unknown>) {
	const screen = render(Harness, props);
	return { screen, h: screen.component as unknown as HarnessExports };
}

const send = (screen: { getByRole: (r: string, o: object) => unknown }) =>
	screen.getByRole("button", { name: "Send message" }) as {
		click(): Promise<void>;
	};

test("a server field error blocks submit, then clears itself once edited", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, timeTrapMinMs: 0 });

	await screen.getByLabelText("Email").fill("a@b.com");
	await screen.getByLabelText("Message").fill("body");
	await send(screen).click();
	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);

	h.setErrors([{ field: "email", message: "That address is blocked" }]);
	await expect.element(screen.getByText("That address is blocked")).toBeInTheDocument();

	await send(screen).click();
	expect(onSubmit).toHaveBeenCalledTimes(1); // still blocked

	await screen.getByLabelText("Email").fill("other@b.com");
	await send(screen).click();
	await expect.poll(() => onSubmit.mock.calls.length).toBe(2);
});

test("an error on a consumer-owned field keeps blocking until cleared", async () => {
	const onSubmit = vi.fn();
	const { screen, h } = renderHarness({ onSubmit, timeTrapMinMs: 0 });

	await screen.getByLabelText("Email").fill("a@b.com");
	await screen.getByLabelText("Message").fill("body");
	h.setErrors([{ field: "consent", message: "You must accept the terms" }]);
	await send(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	await screen.getByLabelText("Email").fill("other@b.com");
	await send(screen).click();
	expect(onSubmit).not.toHaveBeenCalled();

	h.setErrors([]);
	await send(screen).click();
	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
});

test("an internal validation error is visible on the FIRST failed click", async () => {
	// `a@localhost` passes type="email" but not the form's own regex, so the
	// failure exists only in validateContactForm — which runs after every field
	// validator has already been re-run by the validity walk.
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, { onSubmit, timeTrapMinMs: 0 });
	await screen.getByLabelText("Email").fill("a@localhost");
	await screen.getByLabelText("Message").fill("body");
	await screen.getByRole("button", { name: "Send message" }).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect
		.element(screen.getByText("Please enter a valid email address"))
		.toBeInTheDocument();
});

// --- adjacent defects ------------------------------------------------------

test("a required extra field with initialValue validates and submits it", async () => {
	const onSubmit = vi.fn();
	const screen = await render(ContactUsForm, {
		onSubmit,
		timeTrapMinMs: 0,
		extraFields: [
			{ name: "reason", label: "Reason", required: true, initialValue: "Sales" },
		],
	});
	expect(
		screen.container.querySelector<HTMLInputElement>('input[name="contact-extra-reason"]')
			?.value
	).toBe("Sales");

	await screen.getByLabelText("Email").fill("a@b.com");
	await screen.getByLabelText("Message").fill("body");
	await screen.getByRole("button", { name: "Send message" }).click();

	await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
	expect(onSubmit.mock.calls[0][0].extra).toMatchObject({ reason: "Sales" });
});

test("initialValue never clobbers a value the consumer already set", async () => {
	const { h } = renderHarness({
		onSubmit: noop,
		timeTrapMinMs: 0,
		initial: { extra: { reason: "mine" } },
		extraFields: [{ name: "reason", label: "Reason", initialValue: "Sales" }],
	});
	expect(h.getFormData().extra.reason).toBe("mine");
});

test("extra field refs follow display order across a reorder", async () => {
	// The #each is keyed by cfg.name while the refs used to be collected by index,
	// so after a reorder the ref list no longer matched what was on screen and
	// scrollToFirstError() focused the wrong field.
	// top-position so they precede the (also empty, also required) core fields
	const a: ContactFieldConfig = {
		name: "a",
		label: "Field A",
		required: true,
		position: "top",
	};
	const b: ContactFieldConfig = {
		name: "b",
		label: "Field B",
		required: true,
		position: "top",
	};
	const { screen, h } = renderHarness({
		onSubmit: noop,
		timeTrapMinMs: 0,
		extraFields: [a, b],
	});
	await screen.rerender({ extraFields: [b, a] });

	// both are required and empty; "b" is now rendered first, so it is the one
	// the user should be sent to
	expect(h.validate()).toBe(false);
	expect(h.scrollToFirstError()).toBe(true);
	expect(document.activeElement).toBe(
		screen.container.querySelector('input[name="contact-extra-b"]')
	);
});
