import { describe, expect, it } from "vitest";
import { createEmptyContactFormData, validateContactForm } from "./contact-form-utils.js";
import { t_default as t } from "./contact-form-i18n-defaults.js";
import type { ContactFormData } from "./contact-form-types.js";

// Pure-logic suite (node project) — no DOM. validateContactForm is the single
// source of truth for ContactUsForm's semantic validation; the component wires
// these messages into the inline error pipeline. Email + Message are always
// validated; every other field only when its show*/require* toggles are on.

function data(overrides: Partial<ContactFormData> = {}): ContactFormData {
	return { ...createEmptyContactFormData(), ...overrides };
}
const fields = (errs: { field: string }[]) => errs.map((e) => e.field).sort();

describe("createEmptyContactFormData", () => {
	it("returns all-empty strings and an empty extra map", () => {
		expect(createEmptyContactFormData()).toEqual({
			name: "",
			email: "",
			phone: "",
			subject: "",
			company: "",
			message: "",
			extra: {},
		});
	});
});

describe("validateContactForm — always-on fields", () => {
	it("flags missing email and message on empty data", () => {
		const errs = validateContactForm(data(), t);
		expect(fields(errs)).toEqual(["email", "message"]);
		expect(errs.find((e) => e.field === "email")!.message).toBe("Email is required");
		expect(errs.find((e) => e.field === "message")!.message).toBe("Message is required");
	});

	it("passes with a valid email + non-empty message", () => {
		const errs = validateContactForm(data({ email: "a@b.com", message: "Hello" }), t);
		expect(errs).toEqual([]);
	});

	it("rejects a malformed email", () => {
		const errs = validateContactForm(data({ email: "not-an-email", message: "x" }), t);
		expect(fields(errs)).toEqual(["email"]);
		expect(errs[0].message).toBe("Please enter a valid email address");
	});

	it("enforces messageMinLength only when > 0, with interpolation", () => {
		const tooShort = validateContactForm(data({ email: "a@b.com", message: "hey" }), t, {
			messageMinLength: 10,
		});
		expect(fields(tooShort)).toEqual(["message"]);
		expect(tooShort[0].message).toBe("Message must be at least 10 characters");

		const okWhenDisabled = validateContactForm(
			data({ email: "a@b.com", message: "hey" }),
			t,
			{ messageMinLength: 0 }
		);
		expect(okWhenDisabled).toEqual([]);
	});
});

describe("validateContactForm — toggled fields", () => {
	const base = { email: "a@b.com", message: "hi" };

	it("requires name only when shown AND required", () => {
		expect(
			validateContactForm(data(base), t, { showName: true, requireName: true })
		).toEqual([{ field: "name", message: "Name is required" }]);
		// shown but not required -> no error
		expect(
			validateContactForm(data(base), t, { showName: true, requireName: false })
		).toEqual([]);
		// required but not shown -> no error
		expect(
			validateContactForm(data(base), t, { showName: false, requireName: true })
		).toEqual([]);
	});

	it("requires phone / subject / company when shown AND required", () => {
		const errs = validateContactForm(data(base), t, {
			showPhone: true,
			requirePhone: true,
			showSubject: true,
			requireSubject: true,
			showCompany: true,
			requireCompany: true,
		});
		expect(fields(errs)).toEqual(["company", "phone", "subject"]);
	});
});

describe("validateContactForm — extraFields", () => {
	const base = { email: "a@b.com", message: "hi" };

	it("flags a required-but-empty extra field with its label", () => {
		const errs = validateContactForm(data(base), t, {
			extraFields: [{ name: "reason", label: "Reason", required: true }],
		});
		expect(errs).toEqual([{ field: "reason", message: "Reason is required" }]);
	});

	it("runs a custom validator and surfaces its message", () => {
		const errs = validateContactForm(
			data({ ...base, extra: { website: "ftp://x" } }),
			t,
			{
				extraFields: [
					{
						name: "website",
						label: "Website",
						validate: (v) =>
							String(v).startsWith("http") ? undefined : "Must be an http(s) URL",
					},
				],
			}
		);
		expect(errs).toEqual([{ field: "website", message: "Must be an http(s) URL" }]);
	});
});
