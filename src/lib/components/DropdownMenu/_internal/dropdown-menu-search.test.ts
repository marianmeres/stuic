import { describe, expect, test } from "vitest";
import {
	extractSearchableItems,
	filterItemsByMatchedIds,
} from "./dropdown-menu-search.js";
import type { DropdownMenuItem } from "../DropdownMenu.svelte";

// Fast node tests for the pure search logic extracted from DropdownMenu (task 17).
const items: DropdownMenuItem[] = [
	{ type: "header", id: "h1", label: "Section" },
	{ type: "action", id: "new", label: "New file" },
	{ type: "divider", id: "d1" },
	{ type: "action", id: "open", label: "Open file" },
	{
		type: "expandable",
		id: "recent",
		label: "Recent",
		items: [
			{ type: "action", id: "r1", label: "report.pdf" },
			{ type: "divider", id: "rd" },
			{ type: "action", id: "r2", label: "budget.xlsx" },
		],
	},
	{ type: "custom", id: "c1", content: "custom" },
];

describe("extractSearchableItems", () => {
	test("collects top-level actions, expandable headers, and nested action children", () => {
		const ids = extractSearchableItems(items).map((i) => i.id);
		// "new", "open" (top-level actions), "recent" (expandable), then its actions r1/r2.
		// header/divider/custom are excluded.
		expect(ids).toEqual(["new", "open", "recent", "r1", "r2"]);
	});

	test("returns an empty list when there are no searchable items", () => {
		expect(
			extractSearchableItems([
				{ type: "header", id: "h", label: "H" },
				{ type: "divider", id: "d" },
			])
		).toEqual([]);
	});
});

describe("filterItemsByMatchedIds", () => {
	test("keeps only matched action items; drops dividers/headers/custom", () => {
		const out = filterItemsByMatchedIds(items, new Set(["open"]));
		expect(out.map((i) => i.id)).toEqual(["open"]);
	});

	test("keeps an expandable section when one of its children matched", () => {
		const out = filterItemsByMatchedIds(items, new Set(["r2"]));
		expect(out.map((i) => i.id)).toEqual(["recent"]);
	});

	test("keeps an expandable section when the section header itself matched", () => {
		const out = filterItemsByMatchedIds(items, new Set(["recent"]));
		expect(out.map((i) => i.id)).toEqual(["recent"]);
	});

	test("a match across an action and an expandable child keeps both", () => {
		const out = filterItemsByMatchedIds(items, new Set(["new", "r1"]));
		expect(out.map((i) => i.id)).toEqual(["new", "recent"]);
	});

	test("no matches yields an empty list", () => {
		expect(filterItemsByMatchedIds(items, new Set(["nope"]))).toEqual([]);
	});
});
