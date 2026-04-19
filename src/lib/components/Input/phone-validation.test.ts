import { assert, test } from "vitest";
import { validatePhoneNumber } from "./phone-validation.js";

test("validatePhoneNumber returns undefined for empty / non-string input", () => {
	assert.equal(validatePhoneNumber(""), undefined);
	assert.equal(validatePhoneNumber(null), undefined);
	assert.equal(validatePhoneNumber(undefined), undefined);
	assert.equal(validatePhoneNumber(12345), undefined);
	assert.equal(validatePhoneNumber({}), undefined);
});

test("validatePhoneNumber rejects malformed numbers", () => {
	assert.equal(validatePhoneNumber("not-a-phone"), "Invalid phone number");
	assert.equal(validatePhoneNumber("123"), "Invalid phone number");
	assert.equal(validatePhoneNumber("+"), "Invalid phone number");
});

test("validatePhoneNumber accepts valid E.164 numbers", () => {
	assert.equal(validatePhoneNumber("+421905123456"), undefined);
	assert.equal(validatePhoneNumber("+14155552671"), undefined);
	assert.equal(validatePhoneNumber("+442079460958"), undefined);
});
