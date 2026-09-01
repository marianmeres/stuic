import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { calculatePaging, type PagingCalcResult } from "@marianmeres/paging-store";
import Pagination from "./Pagination.svelte";
import { createPaginationT } from "./i18n.js";
import { PAGINATION_MESSAGES_SK } from "./i18n-sk.js";

// Note: browser tests don't load the component index.css, so only structure,
// attributes and callback wiring are asserted here — never computed sizes.

// page 3 of 10 (offset 20)
const PAGING = calculatePaging({ total: 100, limit: 10, offset: 20 });

const nav = (c: HTMLElement) => c.querySelector<HTMLElement>("nav");
const byLabel = (c: HTMLElement, label: string) =>
	c.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
const pageButtons = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLButtonElement>('button[aria-label^="Go to page"]'),
];
const ellipses = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-pagination-ellipsis"),
];

// ============================================================================
// compact (the DataTable pager, standalone)
// ============================================================================

test("compact default: nav landmark, prev/next, page info", async () => {
	const { container } = await render(Pagination, { paging: PAGING });
	const root = nav(container)!;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-pagination")).toBe(true);
	expect(root.getAttribute("data-variant")).toBe("compact");
	expect(root.getAttribute("aria-label")).toBe("Pagination");

	expect(byLabel(container, "Prev")).not.toBeNull();
	expect(byLabel(container, "Next")).not.toBeNull();
	expect(container.querySelector(".stuic-pagination-info")?.textContent?.trim()).toBe(
		"Page 3 of 10"
	);
	// no numbered buttons in compact
	expect(pageButtons(container).length).toBe(0);
});

test("compact: next/prev fire onPageChange with (offset, page)", async () => {
	const onPageChange = vi.fn();
	const { container } = await render(Pagination, { paging: PAGING, onPageChange });

	byLabel(container, "Next")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(30, 4);

	byLabel(container, "Prev")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(10, 2);
	expect(onPageChange).toHaveBeenCalledTimes(2);
});

test("prev disabled on first page, next disabled on last page", async () => {
	const first = await render(Pagination, {
		paging: calculatePaging({ total: 100, limit: 10, offset: 0 }),
	});
	expect(byLabel(first.container, "Prev")!.disabled).toBe(true);
	expect(byLabel(first.container, "Next")!.disabled).toBe(false);

	const last = await render(Pagination, {
		paging: calculatePaging({ total: 100, limit: 10, offset: 90 }),
	});
	expect(byLabel(last.container, "Prev")!.disabled).toBe(false);
	expect(byLabel(last.container, "Next")!.disabled).toBe(true);
});

// ============================================================================
// render / hide rules
// ============================================================================

test("single page renders nothing by default (the DataTable rule)", async () => {
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 5, limit: 10, offset: 0 }),
	});
	expect(nav(container)).toBeNull();
});

test("hideSinglePage=false keeps a single-page pager visible (both ends disabled)", async () => {
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 5, limit: 10, offset: 0 }),
		hideSinglePage: false,
	});
	expect(nav(container)).not.toBeNull();
	expect(byLabel(container, "Prev")!.disabled).toBe(true);
	expect(byLabel(container, "Next")!.disabled).toBe(true);
});

test("no paging and no total/limit/offset renders nothing", async () => {
	const { container } = await render(Pagination, {});
	expect(nav(container)).toBeNull();
});

test("total/limit/offset convenience props compute paging internally", async () => {
	const onPageChange = vi.fn();
	const { container } = await render(Pagination, {
		total: 95,
		limit: 10,
		offset: 20,
		onPageChange,
	});
	expect(container.querySelector(".stuic-pagination-info")?.textContent?.trim()).toBe(
		"Page 3 of 10"
	);
	byLabel(container, "Next")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(30, 4);
});

// ============================================================================
// numbers variant
// ============================================================================

test("numbers: windowed page buttons with ellipsis, current marked", async () => {
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 100, limit: 10, offset: 40 }), // page 5 of 10
		variant: "numbers",
	});
	expect(nav(container)!.getAttribute("data-variant")).toBe("numbers");

	// [1, …, 4, 5, 6, …, 10]
	expect(pageButtons(container).map((b) => b.textContent?.trim())).toEqual([
		"1",
		"4",
		"5",
		"6",
		"10",
	]);
	expect(ellipses(container).length).toBe(2);

	const current = byLabel(container, "Go to page 5")!;
	expect(current.getAttribute("aria-current")).toBe("page");
	expect(current.getAttribute("data-current")).toBe("true");
	expect(byLabel(container, "Go to page 4")!.hasAttribute("aria-current")).toBe(false);

	// chevron-only prev/next (no text labels), no info by default
	expect(byLabel(container, "Prev")!.textContent).not.toContain("Prev");
	expect(container.querySelector(".stuic-pagination-info")).toBeNull();
});

test("numbers: clicking a page fires (offset, page); clicking current fires nothing", async () => {
	const onPageChange = vi.fn();
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 100, limit: 10, offset: 40 }), // page 5
		variant: "numbers",
		onPageChange,
	});

	byLabel(container, "Go to page 6")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(50, 6);

	byLabel(container, "Go to page 10")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(90, 10);

	byLabel(container, "Go to page 5")!.click();
	expect(onPageChange).toHaveBeenCalledTimes(2);
});

test("numbers: siblingCount/boundaryCount shape the window, showInfo opts info in", async () => {
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 200, limit: 10, offset: 90 }), // page 10 of 20
		variant: "numbers",
		siblingCount: 2,
		boundaryCount: 2,
		showInfo: true,
	});
	expect(pageButtons(container).map((b) => b.textContent?.trim())).toEqual([
		"1",
		"2",
		"8",
		"9",
		"10",
		"11",
		"12",
		"19",
		"20",
	]);
	expect(container.querySelector(".stuic-pagination-info")?.textContent?.trim()).toBe(
		"Page 10 of 20"
	);
});

// ============================================================================
// first/last
// ============================================================================

test("showFirstLast: jump buttons with first/last offsets", async () => {
	const onPageChange = vi.fn();
	const { container } = await render(Pagination, {
		paging: PAGING, // page 3 of 10
		showFirstLast: true,
		onPageChange,
	});

	byLabel(container, "First page")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(0, 1);

	byLabel(container, "Last page")!.click();
	expect(onPageChange).toHaveBeenLastCalledWith(90, 10);
});

test("showFirstLast: first disabled on first page, last disabled on last page", async () => {
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 100, limit: 10, offset: 0 }),
		showFirstLast: true,
	});
	expect(byLabel(container, "First page")!.disabled).toBe(true);
	expect(byLabel(container, "Last page")!.disabled).toBe(false);
});

// ============================================================================
// disabled
// ============================================================================

test("disabled disables every control", async () => {
	const { container } = await render(Pagination, {
		paging: PAGING,
		variant: "numbers",
		showFirstLast: true,
		disabled: true,
	});
	const buttons = [...container.querySelectorAll<HTMLButtonElement>("button")];
	expect(buttons.length).toBeGreaterThan(0);
	for (const b of buttons) expect(b.disabled).toBe(true);
});

// ============================================================================
// i18n
// ============================================================================

test("t prop localizes labels and info (SK catalog)", async () => {
	const { container } = await render(Pagination, {
		paging: PAGING,
		t: createPaginationT(PAGINATION_MESSAGES_SK),
	});
	expect(nav(container)!.getAttribute("aria-label")).toBe("Stránkovanie");
	expect(byLabel(container, "Späť")).not.toBeNull();
	expect(byLabel(container, "Ďalej")).not.toBeNull();
	expect(container.querySelector(".stuic-pagination-info")?.textContent?.trim()).toBe(
		"Strana 3 z 10"
	);
});

// ============================================================================
// customization
// ============================================================================

test("renderInfo snippet overrides the info content", async () => {
	const renderInfo = createRawSnippet<[PagingCalcResult]>((getPaging) => ({
		render: () => `<b data-testid="custom-info">at ${getPaging().currentPage}</b>`,
	}));
	const { container } = await render(Pagination, { paging: PAGING, renderInfo });
	expect(container.querySelector('[data-testid="custom-info"]')?.textContent).toBe(
		"at 3"
	);
});

test("class props merge; rest props pass through", async () => {
	const { container } = await render(Pagination, {
		paging: PAGING,
		class: "my-extra",
		classButton: "my-btn",
		classInfo: "my-info",
		"data-testid": "pgn",
	});
	const root = nav(container)!;
	expect(root.classList.contains("stuic-pagination")).toBe(true);
	expect(root.classList.contains("my-extra")).toBe(true);
	expect(root.getAttribute("data-testid")).toBe("pgn");

	const prev = byLabel(container, "Prev")!;
	expect(prev.classList.contains("stuic-pagination-button")).toBe(true);
	expect(prev.classList.contains("my-btn")).toBe(true);

	const info = container.querySelector(".stuic-pagination-info")!;
	expect(info.classList.contains("my-info")).toBe(true);
});

test("classButtonCurrent lands only on the current page button", async () => {
	const { container } = await render(Pagination, {
		paging: calculatePaging({ total: 100, limit: 10, offset: 40 }), // page 5
		variant: "numbers",
		classButtonCurrent: "im-current",
	});
	expect(byLabel(container, "Go to page 5")!.classList.contains("im-current")).toBe(true);
	expect(byLabel(container, "Go to page 4")!.classList.contains("im-current")).toBe(
		false
	);
});

test("unstyled drops pagination classes and data-variant (Buttons keep their own)", async () => {
	const { container } = await render(Pagination, { paging: PAGING, unstyled: true });
	const root = nav(container)!;
	expect(root.classList.contains("stuic-pagination")).toBe(false);
	expect(root.hasAttribute("data-variant")).toBe(false);
	expect(container.querySelector(".stuic-pagination-info")).toBeNull();
	expect(container.querySelector(".stuic-pagination-button")).toBeNull();
	// inner Buttons still render as styled stuic Buttons
	expect(byLabel(container, "Prev")!.classList.contains("stuic-button")).toBe(true);
});
