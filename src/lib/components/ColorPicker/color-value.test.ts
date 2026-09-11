import { assert, test } from "vitest";
import { isCssColor, isSameColor, normalizeHex } from "./color-value.js";

test("normalizeHex accepts 3/6 digits, with or without the hash", () => {
	assert.equal(normalizeHex("#ff0000"), "#ff0000");
	assert.equal(normalizeHex("FF0000"), "#ff0000");
	assert.equal(normalizeHex("#F00"), "#ff0000");
	assert.equal(normalizeHex("  #3b82f6  "), "#3b82f6");
	assert.equal(normalizeHex("abc"), "#aabbcc");
});

test("normalizeHex rejects everything else (alpha included)", () => {
	for (const v of [
		"",
		"   ",
		"#",
		"#ff",
		"#ffff", // 4-digit alpha
		"#ff0000aa", // 8-digit alpha
		"#gggggg",
		"red",
		"rgb(255 0 0)",
		"var(--stuic-color-primary)",
		null,
		undefined,
		123,
		{},
	]) {
		assert.isNull(normalizeHex(v), JSON.stringify(v));
	}
});

test("isSameColor is string identity, plus hex spelling", () => {
	assert.isTrue(isSameColor("#fff", "#FFFFFF"));
	assert.isTrue(isSameColor("aabbcc", "#aabbcc"));
	assert.isTrue(isSameColor("var(--x)", "var(--x)"));
	assert.isTrue(isSameColor("", ""));

	// no color-space conversion, on purpose — swatch identity is the string
	assert.isFalse(isSameColor("red", "#ff0000"));
	assert.isFalse(isSameColor("#fff", "#000"));
	assert.isFalse(isSameColor("#fff", null));
});

test("isCssColor is false without a DOM (node project has no CSS.supports)", () => {
	// The only caller is a DOM event handler; this pins the SSR/node behavior so
	// it can never throw during a server render.
	assert.isFalse(isCssColor("red"));
	assert.isFalse(isCssColor(""));
});
