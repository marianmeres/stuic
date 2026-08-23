import { expect, test } from "vitest";
import {
	createEmptyRegisterFormData,
	validateRegisterForm,
} from "./register-form-utils.js";
import { t_default } from "./register-form-i18n-defaults.js";
import type { RegisterFormData } from "./register-form-types.js";

const t = t_default;

function data(partial: Partial<RegisterFormData> = {}): RegisterFormData {
	return { ...createEmptyRegisterFormData(), ...partial };
}

const fields = (errs: { field: string }[]) => errs.map((e) => e.field);

test("empty form reports email + password + confirm", () => {
	expect(fields(validateRegisterForm(data(), t))).toEqual([
		"email",
		"password",
		"passwordConfirm",
	]);
});

test("valid form reports nothing", () => {
	const errs = validateRegisterForm(
		data({ email: "a@b.com", password: "12345678", passwordConfirm: "12345678" }),
		t
	);
	expect(errs).toEqual([]);
});

test("email must look like an email", () => {
	const errs = validateRegisterForm(data({ email: "nope" }), t);
	expect(errs.find((e) => e.field === "email")?.message).toBe(
		"Please enter a valid email address"
	);
});

test("password honors passwordMinLength", () => {
	const d = data({ email: "a@b.com", password: "1234", passwordConfirm: "1234" });
	expect(validateRegisterForm(d, t, [], { passwordMinLength: 4 })).toEqual([]);
	expect(
		validateRegisterForm(d, t, [], { passwordMinLength: 8 }).find(
			(e) => e.field === "password"
		)?.message
	).toBe("Password must be at least 8 characters");
});

test("mismatching confirm is reported", () => {
	const errs = validateRegisterForm(
		data({ email: "a@b.com", password: "12345678", passwordConfirm: "8765432" }),
		t
	);
	expect(fields(errs)).toEqual(["passwordConfirm"]);
});

test("showPasswordConfirm=false skips the confirm checks", () => {
	const errs = validateRegisterForm(
		data({ email: "a@b.com", password: "12345678" }),
		t,
		[],
		{ showPasswordConfirm: false }
	);
	expect(errs).toEqual([]);
});

// --- identity-first: a field that isn't rendered isn't validated ------------

test("showEmail=false skips every email check", () => {
	const errs = validateRegisterForm(
		data({ password: "12345678", passwordConfirm: "12345678" }),
		t,
		[],
		{ showEmail: false }
	);
	expect(errs).toEqual([]);
});

test("showPassword=false skips password AND confirm, even if confirm is on", () => {
	const errs = validateRegisterForm(data({ email: "a@b.com" }), t, [], {
		showPassword: false,
		showPasswordConfirm: true,
	});
	expect(errs).toEqual([]);
});

test("both false leaves only the extra fields", () => {
	const errs = validateRegisterForm(
		data(),
		t,
		[{ name: "tenant", label: "Workspace id", required: true }],
		{ showEmail: false, showPassword: false }
	);
	expect(fields(errs)).toEqual(["tenant"]);
	expect(errs[0].message).toBe("Workspace id is required");
});

test("options default to the pre-existing behavior (BC)", () => {
	// no options at all === showEmail/showPassword/showPasswordConfirm all true
	expect(fields(validateRegisterForm(data(), t, [], {}))).toEqual(
		fields(validateRegisterForm(data(), t))
	);
});

// --- extra fields ----------------------------------------------------------

test("required extra field: value present in `extra` satisfies it", () => {
	const cfg = [{ name: "tenant", label: "Workspace id", required: true }];
	const base = { email: "a@b.com", password: "12345678", passwordConfirm: "12345678" };
	expect(fields(validateRegisterForm(data(base), t, cfg))).toEqual(["tenant"]);
	expect(
		validateRegisterForm(data({ ...base, extra: { tenant: "acme" } }), t, cfg)
	).toEqual([]);
});

test("custom extra validator runs only once required passes", () => {
	const cfg = [
		{
			name: "tenant",
			label: "Workspace id",
			required: true,
			validate: (v: unknown) => (String(v) === "acme" ? undefined : "nope"),
		},
	];
	const base = { email: "a@b.com", password: "12345678", passwordConfirm: "12345678" };
	// empty => required wins, validator skipped
	expect(validateRegisterForm(data(base), t, cfg)[0].message).toBe(
		"Workspace id is required"
	);
	// present but invalid => validator message
	expect(
		validateRegisterForm(data({ ...base, extra: { tenant: "x" } }), t, cfg)[0].message
	).toBe("nope");
	// valid
	expect(
		validateRegisterForm(data({ ...base, extra: { tenant: "acme" } }), t, cfg)
	).toEqual([]);
});
