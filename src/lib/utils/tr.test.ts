import { assert, test } from "vitest";
import { tr } from "./tr.js";

test("tr: plain strings and nil", () => {
	assert.equal(tr("foo"), "foo");
	assert.equal(tr("foo", "sk"), "foo");
	assert.equal(tr(undefined), "");
	assert.equal(tr(null, "sk"), "");
	assert.equal(tr(undefined, "sk", "foo"), "foo");
});

test("tr: translation found", () => {
	assert.equal(tr({ en: "foo" }, "en"), "foo");
	assert.equal(tr({ en: "foo", sk: "bar" }, "sk"), "bar");
	assert.equal(tr('{"en":"foo","sk":"bar"}', "sk"), "bar");
});

test("tr: a record never renders as [object Object]", () => {
	// no locale at all -> first non-empty entry
	assert.equal(tr({ foo: "foo" }), "foo");
	// translation not found, no fallback -> first non-empty entry
	assert.equal(tr({ sk: "foo" }, "en"), "foo");
	assert.equal(tr({ de: "", sk: "foo" }, "en"), "foo");
	// nothing non-empty at all
	assert.equal(tr({}, "en"), "");
	assert.equal(tr({ en: "" }, "en"), "");
});

test("tr: an explicit fallback wins over the first-entry heuristic", () => {
	assert.equal(tr({ sk: "foo" }, "en", "bar"), "bar");
	assert.equal(tr({ sk: "foo" }, "en", ""), "");
	// ...but never over a found translation
	assert.equal(tr({ en: "foo" }, "en", "bar"), "foo");
});

test("tr: a preference chain is honoured in order; empty entries count as missing", () => {
	const val = { de: "hallo", en: "hello", sk: "ahoj" };
	assert.equal(tr(val, ["sk", "en"]), "ahoj");
	assert.equal(tr(val, ["cs", "en"]), "hello");
	assert.equal(tr(val, ["cs", "hu"]), "hallo");
	assert.equal(tr(val, []), "hallo");
	assert.equal(tr({ en: "hello", sk: "" }, ["sk", "en"]), "hello");
	assert.equal(tr({ en: "hello", sk: "" }, "sk"), "hello");
});

test("tr: a string that parses to a non-record is kept as-is", () => {
	assert.equal(tr("2024", "sk"), "2024");
	assert.equal(tr("null", "sk"), "null");
	assert.equal(tr("[1,2]", "sk"), "[1,2]");
	assert.equal(tr("true"), "true");
});

test("tr: prototype keys are not translations", () => {
	assert.equal(tr({ en: "foo" }, "constructor"), "foo");
});
