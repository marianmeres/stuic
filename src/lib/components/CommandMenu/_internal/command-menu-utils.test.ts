import { describe, expect, test } from "vitest";
import {
	normalizeAndGroupOptions,
	renderOptionLabelOf,
	sortByOptgroupLabel,
} from "./command-menu-utils.js";
import type { Item } from "@marianmeres/item-collection";

// Fast node tests for the pure option/result logic extracted from CommandMenu (task 17).

describe("renderOptionLabelOf", () => {
	test("uses the renderer when provided", () => {
		const item: Item = { id: "a", name: "Alpha" };
		expect(renderOptionLabelOf(item, (i) => `${i.name}`, "id")).toBe("Alpha");
	});

	test("falls back to the id prop when no renderer (or renderer returns empty)", () => {
		expect(renderOptionLabelOf({ id: "x42" }, undefined, "id")).toBe("x42");
		expect(renderOptionLabelOf({ id: "x42" }, () => "", "id")).toBe("x42");
	});

	test("respects a custom id prop name", () => {
		expect(renderOptionLabelOf({ uid: "u1" }, undefined, "uid")).toBe("u1");
	});
});

describe("sortByOptgroupLabel", () => {
	const label = (i: Item) => renderOptionLabelOf(i, (x) => `${x.name}`, "id");

	test("sorts grouped-then-alphabetical, case-insensitively", () => {
		const items: Item[] = [
			{ id: "1", name: "banana", optgroup: "fruit" },
			{ id: "2", name: "Apple", optgroup: "fruit" },
			{ id: "3", name: "carrot", optgroup: "veg" },
		];
		const sorted = [...items].sort((a, b) => sortByOptgroupLabel(a, b, label));
		expect(sorted.map((i) => i.name)).toEqual(["Apple", "banana", "carrot"]);
	});

	test("items without an optgroup sort under the empty group first", () => {
		const items: Item[] = [
			{ id: "1", name: "zed", optgroup: "z" },
			{ id: "2", name: "amy" },
		];
		const sorted = [...items].sort((a, b) => sortByOptgroupLabel(a, b, label));
		expect(sorted.map((i) => i.name)).toEqual(["amy", "zed"]);
	});
});

describe("normalizeAndGroupOptions", () => {
	test("groups by rendered optgroup label, preserving input order within a group", () => {
		const opts: Item[] = [
			{ id: "1", optgroup: "user_actions" },
			{ id: "2", optgroup: "user_actions" },
			{ id: "3", optgroup: "system" },
		];
		const grouped = normalizeAndGroupOptions(opts, (s) => s.replaceAll("_", " "));
		expect([...grouped.keys()]).toEqual(["user actions", "system"]);
		expect(grouped.get("user actions")!.map((i) => i.id)).toEqual(["1", "2"]);
		expect(grouped.get("system")!.map((i) => i.id)).toEqual(["3"]);
	});

	test("options without an optgroup land under the empty-string group", () => {
		const grouped = normalizeAndGroupOptions([{ id: "1" }], (s) => `${s}`);
		expect([...grouped.keys()]).toEqual([""]);
		expect(grouped.get("")!.map((i) => i.id)).toEqual(["1"]);
	});
});
