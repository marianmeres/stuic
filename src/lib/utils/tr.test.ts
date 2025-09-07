import { assert, test } from "vitest";
import { tr } from "./tr.js";

test("tr works", () => {
	// no effective translation
	assert.equal(tr("foo"), "foo");
	assert.deepEqual(tr({ foo: "foo" }), "[object Object]");

	// just fallback
	assert.equal(tr(undefined, "sk", "foo"), "foo");

	// translation found
	assert.equal(tr({ en: "foo" }, "en"), "foo");

	// translation not found, no fallback
	assert.deepEqual(tr({ sk: "foo" }, "en"), "[object Object]");

	// translation not found, with fallback
	assert.deepEqual(tr({ sk: "foo" }, "en", "foo"), "foo");
});
