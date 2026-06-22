import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import ContactUsForm from "./ContactUsForm.svelte";

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
