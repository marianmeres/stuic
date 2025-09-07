import { assert, test } from "vitest";
import { StorageAbstraction } from "./storage-abstraction.js";

test("StorageAbstraction (type memory) works", () => {
	const s = new StorageAbstraction("memory");

	assert.isFalse(s.has("foo"));
	assert.equal(s.length, 0);

	s.set("foo", { ba: "r" });
	assert(s.has("foo"));
	assert.equal(s.length, 1);

	assert.equal(s.entries()[0][0], "foo");
	assert.equal(s.entries()[0][1], '{"ba":"r"}');
	assert.deepEqual(s.get("foo"), { ba: "r" });
});
