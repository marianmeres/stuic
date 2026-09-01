import { assert, test } from "vitest";
import { paginationRange } from "./pagination-range.js";

test("no pages -> empty", () => {
	assert.deepEqual(paginationRange(1, 0), []);
	assert.deepEqual(paginationRange(1, -5), []);
	assert.deepEqual(paginationRange(1, NaN as unknown as number), []);
});

test("single page", () => {
	assert.deepEqual(paginationRange(1, 1), [1]);
});

test("few pages render fully, no ellipsis (defaults)", () => {
	// 1 boundary + 1 gap slot + 2*1 siblings + current + 1 gap slot + 1 boundary = 7
	for (const pageCount of [2, 3, 4, 5, 6, 7]) {
		for (let page = 1; page <= pageCount; page++) {
			assert.deepEqual(
				paginationRange(page, pageCount),
				Array.from({ length: pageCount }, (_, i) => i + 1),
				`pageCount=${pageCount} page=${page}`
			);
		}
	}
});

test("middle of many pages: ellipsis on both sides", () => {
	assert.deepEqual(paginationRange(5, 10), [1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
	assert.deepEqual(paginationRange(50, 100), [
		1,
		"ellipsis",
		49,
		50,
		51,
		"ellipsis",
		100,
	]);
});

test("near the start: no start ellipsis, window stays 7 slots wide", () => {
	assert.deepEqual(paginationRange(1, 10), [1, 2, 3, 4, 5, "ellipsis", 10]);
	assert.deepEqual(paginationRange(2, 10), [1, 2, 3, 4, 5, "ellipsis", 10]);
	assert.deepEqual(paginationRange(3, 10), [1, 2, 3, 4, 5, "ellipsis", 10]);
	assert.deepEqual(paginationRange(4, 10), [1, 2, 3, 4, 5, "ellipsis", 10]);
});

test("near the end: no end ellipsis, window stays 7 slots wide", () => {
	assert.deepEqual(paginationRange(10, 10), [1, "ellipsis", 6, 7, 8, 9, 10]);
	assert.deepEqual(paginationRange(9, 10), [1, "ellipsis", 6, 7, 8, 9, 10]);
	assert.deepEqual(paginationRange(8, 10), [1, "ellipsis", 6, 7, 8, 9, 10]);
	assert.deepEqual(paginationRange(7, 10), [1, "ellipsis", 6, 7, 8, 9, 10]);
});

test("slot count is stable across every page (no layout jumping)", () => {
	const len = paginationRange(1, 20).length;
	for (let page = 1; page <= 20; page++) {
		assert.equal(paginationRange(page, 20).length, len, `page=${page}`);
	}
});

test("a gap of exactly one page renders the page, not an ellipsis", () => {
	// start gap is just page 2 -> rendered as "2"; end gap (6..7) collapses
	assert.deepEqual(paginationRange(4, 8), [1, 2, 3, 4, 5, "ellipsis", 8]);
	// end gap is just page 7 -> rendered as "7"; start gap (2..3) collapses
	assert.deepEqual(paginationRange(5, 8), [1, "ellipsis", 4, 5, 6, 7, 8]);
});

test("siblingCount widens the middle window", () => {
	assert.deepEqual(paginationRange(10, 20, { siblingCount: 2 }), [
		1,
		"ellipsis",
		8,
		9,
		10,
		11,
		12,
		"ellipsis",
		20,
	]);
	assert.deepEqual(paginationRange(10, 20, { siblingCount: 0 }), [
		1,
		"ellipsis",
		10,
		"ellipsis",
		20,
	]);
});

test("boundaryCount widens both edges", () => {
	assert.deepEqual(paginationRange(10, 20, { boundaryCount: 2 }), [
		1,
		2,
		"ellipsis",
		9,
		10,
		11,
		"ellipsis",
		19,
		20,
	]);
	assert.deepEqual(paginationRange(10, 20, { boundaryCount: 0 }), [
		"ellipsis",
		9,
		10,
		11,
		"ellipsis",
	]);
});

test("currentPage is clamped into [1, pageCount]", () => {
	assert.deepEqual(paginationRange(0, 10), paginationRange(1, 10));
	assert.deepEqual(paginationRange(-3, 10), paginationRange(1, 10));
	assert.deepEqual(paginationRange(99, 10), paginationRange(10, 10));
});

test("negative option values are treated as 0", () => {
	assert.deepEqual(
		paginationRange(10, 20, { siblingCount: -1, boundaryCount: -1 }),
		paginationRange(10, 20, { siblingCount: 0, boundaryCount: 0 })
	);
});
