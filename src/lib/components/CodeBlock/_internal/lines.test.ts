import { expect, test } from "vitest";
import { parseLineSet, splitLines } from "./lines.js";

test("splitLines keeps each line's \\n, so the lines join back to the text", () => {
	for (const text of ["a\nb\nc", "a\n\nb", "a\nb\n", "\n", "one", ""]) {
		expect(splitLines(text).join("")).toBe(text);
	}
	expect(splitLines("a\n\nb")).toEqual(["a\n", "\n", "b"]);
	// a final \n is not an extra line (it renders none in a <pre> either)
	expect(splitLines("a\nb\n")).toEqual(["a\n", "b\n"]);
	expect(splitLines("")).toEqual([]);
});

test("parseLineSet reads arrays and '1, 3-5' strings", () => {
	expect([...parseLineSet([3, 1, 3])].sort()).toEqual([1, 3]);
	expect([...parseLineSet("1, 3-5")]).toEqual([1, 3, 4, 5]);
	expect([...parseLineSet(" 5 - 3 ")]).toEqual([3, 4, 5]);
});

test("parseLineSet drops invalid and out-of-range parts", () => {
	expect([...parseLineSet("0, 2, x, 4-, -1, 2.5, 9", 5)]).toEqual([2]);
	expect([...parseLineSet([0, 1.5, 2, 6], 5)]).toEqual([2]);
	expect([...parseLineSet("4-100", 5)]).toEqual([4, 5]);
	expect(parseLineSet(undefined).size).toBe(0);
	expect(parseLineSet("").size).toBe(0);
});

test("parseLineSet bounds a huge range", () => {
	expect(parseLineSet("1-1000000000").size).toBe(100_000);
});
