import { assert, test } from "vitest";
import {
	findFirstInvalidField,
	scrollToFirstInvalidField,
	validateAllFields,
	type ValidatableField,
} from "./validate-fields.js";
import { createValidationResult } from "../actions/validate.svelte.js";

// Tiny test double — mirrors the shape every STUIC Field component exposes.
function makeField(opts: {
	invalid?: boolean;
	message?: string;
	onValidate?: () => void;
	onFocus?: () => void;
	onScroll?: (opts?: ScrollIntoViewOptions) => void;
}): ValidatableField & {
	validateCount: number;
	focusCount: number;
	scrollCount: number;
} {
	let _validation = opts.invalid
		? createValidationResult(opts.message ?? "Required")
		: undefined;
	const ref = {
		validateCount: 0,
		focusCount: 0,
		scrollCount: 0,
		validate() {
			ref.validateCount++;
			opts.onValidate?.();
			// re-derive validation each call to mimic the live action
			_validation = opts.invalid
				? createValidationResult(opts.message ?? "Required")
				: createValidationResult("");
			return _validation;
		},
		getValidation() {
			return _validation;
		},
		focus() {
			ref.focusCount++;
			opts.onFocus?.();
		},
		scrollIntoView(o?: ScrollIntoViewOptions) {
			ref.scrollCount++;
			opts.onScroll?.(o);
		},
	};
	return ref;
}

test("validateAllFields returns true when all fields valid", () => {
	const a = makeField({});
	const b = makeField({});
	const c = makeField({});
	assert.equal(validateAllFields([a, b, c]), true);
	assert.equal(a.validateCount, 1);
	assert.equal(b.validateCount, 1);
	assert.equal(c.validateCount, 1);
});

test("validateAllFields returns false when any field invalid", () => {
	const a = makeField({});
	const b = makeField({ invalid: true });
	const c = makeField({});
	assert.equal(validateAllFields([a, b, c]), false);
});

test("validateAllFields calls validate() on every field even after an invalid one", () => {
	const a = makeField({ invalid: true });
	const b = makeField({});
	const c = makeField({ invalid: true });
	validateAllFields([a, b, c]);
	assert.equal(a.validateCount, 1);
	assert.equal(b.validateCount, 1);
	assert.equal(c.validateCount, 1);
});

test("validateAllFields skips undefined / null entries silently", () => {
	const a = makeField({});
	assert.equal(validateAllFields([undefined, a, null]), true);
	assert.equal(a.validateCount, 1);
});

test("validateAllFields on empty list returns true (vacuous)", () => {
	assert.equal(validateAllFields([]), true);
});

test("findFirstInvalidField returns first invalid in declaration order", () => {
	const a = makeField({});
	const b = makeField({ invalid: true, message: "B is invalid" });
	const c = makeField({ invalid: true, message: "C is invalid" });
	// validate first so getValidation has cached state
	validateAllFields([a, b, c]);
	const first = findFirstInvalidField([a, b, c]);
	assert.equal(first, b);
});

test("findFirstInvalidField returns undefined when all valid", () => {
	const a = makeField({});
	const b = makeField({});
	validateAllFields([a, b]);
	assert.isUndefined(findFirstInvalidField([a, b]));
});

test("scrollToFirstInvalidField scrolls + focuses the first invalid field", () => {
	const a = makeField({});
	const b = makeField({ invalid: true });
	validateAllFields([a, b]);
	const scrolled = scrollToFirstInvalidField([a, b]);
	assert.equal(scrolled, true);
	assert.equal(b.scrollCount, 1);
	assert.equal(b.focusCount, 1);
	assert.equal(a.scrollCount, 0);
	assert.equal(a.focusCount, 0);
});

test("scrollToFirstInvalidField returns false when all fields valid (no-op)", () => {
	const a = makeField({});
	const b = makeField({});
	validateAllFields([a, b]);
	assert.equal(scrollToFirstInvalidField([a, b]), false);
	assert.equal(a.scrollCount, 0);
	assert.equal(b.scrollCount, 0);
});

test("scrollToFirstInvalidField respects { focus: false }", () => {
	const a = makeField({ invalid: true });
	validateAllFields([a]);
	scrollToFirstInvalidField([a], { focus: false });
	assert.equal(a.scrollCount, 1);
	assert.equal(a.focusCount, 0);
});

test("scrollToFirstInvalidField forwards behavior + block to scrollIntoView", () => {
	let received: ScrollIntoViewOptions | undefined;
	const a = makeField({
		invalid: true,
		onScroll: (o) => (received = o),
	});
	validateAllFields([a]);
	scrollToFirstInvalidField([a], { behavior: "auto", block: "start" });
	assert.deepEqual(received, { behavior: "auto", block: "start" });
});
