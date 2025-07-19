import { assert, test } from "vitest";
import { replaceMap } from "./replace-map.js";

test("replaceMap works (case insensitive and mustache-like by default)", () => {
	const s = "Hello, {{name}}! {{nAMe}} {{FOO}}";
	const m = {
		foo: "bar",
		name: "world",
		hey: "safely ignored",
	};

	const replaced = replaceMap(s, m);

	assert.equal("Hello, world! world bar", replaced);
});
