import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createRawSnippet } from "svelte";
import DataTable, { type DataTableColumn } from "./DataTable.svelte";
import { createPagingStore } from "@marianmeres/paging-store";

// The browser test viewport is 414x896 — below Tailwind's `md` — so DataTable would
// always pick the mobile card layout. `Breakpoint` derives from `window.innerWidth`
// (via svelte/reactivity/window), so shadowing it once, before the first render,
// pins every test in this file to the DESKTOP layout. Mobile-layout tests opt back
// in explicitly with `small`.
Object.defineProperty(window, "innerWidth", { value: 1200, configurable: true });

// Every field here is a string, which (unlike a shaped interface) stays assignable to
// the `Record<string, any>` DataTable falls back to when `render()` can't infer `T`.
type Row = Record<string, string>;

const COLUMNS: DataTableColumn<Row>[] = [
	{ key: "name", label: "Name" },
	{ key: "email", label: "Email" },
];

const DATA: Row[] = [
	{ id: "a", name: "Alice", email: "alice@example.com" },
	{ id: "b", name: "Bob", email: "bob@example.com" },
];

const getRowId = (row: Row) => row.id;
const href = (row: Row) => `#/users/${row.id}`;

const rows = () => [...document.querySelectorAll<HTMLTableRowElement>("tbody tr")];
const links = () => [
	...document.querySelectorAll<HTMLAnchorElement>("a.stuic-data-table-row-link"),
];
const cards = () => [...document.querySelectorAll<HTMLElement>(".stuic-data-table-card")];

// ============================================================================
// rowHref — the lead cell becomes a real link
// ============================================================================

test("rowHref wraps the lead cell content in an anchor (desktop)", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		rowHref: href,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const a = links();
	expect(a.length).toBe(2);
	expect(a[0].getAttribute("href")).toBe("#/users/a");
	expect(a[0].textContent?.trim()).toBe("Alice");
	// only the lead (first) cell is linked
	expect(rows()[0].querySelectorAll("td")[0].querySelector("a")).not.toBe(null);
	expect(rows()[0].querySelectorAll("td")[1].querySelector("a")).toBe(null);
});

test("rowHref returning undefined renders that row without an anchor", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		rowHref: (row: Row) => (row.id === "a" ? `#/users/a` : undefined),
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(links().length).toBe(1);
	expect(rows()[1].querySelector("a")).toBe(null);
	expect(rows()[1].querySelectorAll("td")[0].textContent?.trim()).toBe("Bob");
});

test("rowHrefColumn moves the anchor to another column", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		rowHref: href,
		rowHrefColumn: "email",
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(rows()[0].querySelectorAll("td")[0].querySelector("a")).toBe(null);
	expect(
		rows()[0].querySelectorAll("td")[1].querySelector("a")?.textContent?.trim()
	).toBe("alice@example.com");
});

test("the anchor wraps the consumer `cell` snippet output, not the raw value", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		rowHref: href,
		cell: createRawSnippet((args: () => { value: unknown }) => ({
			render: () => `<span data-custom>${args().value}!</span>`,
		})),
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const a = links()[0];
	expect(a.querySelector("[data-custom]")?.textContent).toBe("Alice!");
});

test("the anchor keeps the column's renderValue formatting", async () => {
	render(DataTable, {
		columns: [
			{
				key: "name",
				label: "Name",
				renderValue: (v: unknown) => String(v).toUpperCase(),
			},
			{ key: "email", label: "Email" },
		],
		data: DATA,
		getRowId,
		rowHref: href,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(links()[0].textContent?.trim()).toBe("ALICE");
});

test("clicking the lead anchor does not fire onRowClick nor toggle selection", async () => {
	const onRowClick = vi.fn();
	const selected = new Set<string | number>();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		selectOnRowClick: true,
		selected,
		onRowClick,
		rowHref: href,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	await userEvent.click(links()[0]);
	expect(onRowClick).not.toHaveBeenCalled();
	expect(document.querySelectorAll("tbody tr[data-selected]").length).toBe(0);
});

test("clicking elsewhere on the row still fires onRowClick", async () => {
	const onRowClick = vi.fn();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		onRowClick,
		rowHref: href,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	await userEvent.click(rows()[1].querySelectorAll("td")[1]);
	expect(onRowClick).toHaveBeenCalledTimes(1);
	expect(onRowClick.mock.calls[0][0]).toEqual(DATA[1]);
	expect(onRowClick.mock.calls[0][1]).toBe(1);
});

test("classRowLink is merged onto the anchor, and unstyled drops the base class", async () => {
	const screen = render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		rowHref: href,
		classRowLink: "font-bold",
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();
	expect(links()[0].className).toBe("stuic-data-table-row-link font-bold");

	await screen.rerender({ unstyled: true });
	const a = document.querySelector<HTMLAnchorElement>("tbody a")!;
	expect(a.className).toBe("font-bold");
});

// ============================================================================
// rowHref — mobile cards
// ============================================================================

test("rowHref links the lead field of the mobile card too", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		small: true,
		rowHref: href,
	});
	await expect.poll(() => cards().length).toBe(2);

	const a = links();
	expect(a.length).toBe(2);
	expect(a[0].getAttribute("href")).toBe("#/users/a");
	expect(a[0].textContent?.trim()).toBe("Alice");
});

test("a hideOnMobile lead column falls back to the first visible card field", async () => {
	render(DataTable, {
		columns: [{ ...COLUMNS[0], hideOnMobile: true }, COLUMNS[1]],
		data: DATA,
		getRowId,
		small: true,
		rowHref: href,
	});
	await expect.poll(() => cards().length).toBe(2);

	expect(links()[0].textContent?.trim()).toBe("alice@example.com");
});

test("Enter on a card's lead link navigates instead of firing onRowClick", async () => {
	const onRowClick = vi.fn();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		small: true,
		onRowClick,
		rowHref: href,
	});
	await expect.poll(() => cards().length).toBe(2);

	links()[0].focus();
	await userEvent.keyboard("{Enter}");
	expect(onRowClick).not.toHaveBeenCalled();
	expect(location.hash).toBe("#/users/a");
});

test("a focused card checkbox keeps Space for itself", async () => {
	const onRowClick = vi.fn();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		small: true,
		selectable: true,
		onRowClick,
	});
	await expect.poll(() => cards().length).toBe(2);

	const cb = cards()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!;
	cb.focus();
	await userEvent.keyboard(" ");
	await expect.poll(() => cb.checked).toBe(true);
	expect(onRowClick).not.toHaveBeenCalled();
});

// ============================================================================
// rowActivatable — the <tr> itself
// ============================================================================

test("rowActivatable makes the <tr> focusable without giving it a role", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		onRowClick: () => {},
		rowActivatable: true,
		rowLabel: (row: Row) => `Open ${row.name}`,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const tr = rows()[0];
	expect(tr.getAttribute("tabindex")).toBe("0");
	expect(tr.hasAttribute("role")).toBe(false);
	expect(tr.getAttribute("aria-label")).toBe("Open Alice");
});

test("rowActivatable is a no-op without onRowClick / selectOnRowClick", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		rowActivatable: true,
		rowLabel: () => "nope",
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(rows()[0].hasAttribute("tabindex")).toBe(false);
	expect(rows()[0].hasAttribute("aria-label")).toBe(false);
});

test("Enter activates a focused row, Space does not", async () => {
	const onRowClick = vi.fn();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		onRowClick,
		rowActivatable: true,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	rows()[1].focus();
	await userEvent.keyboard("{Enter}");
	expect(onRowClick).toHaveBeenCalledTimes(1);
	expect(onRowClick.mock.calls[0][1]).toBe(1);

	await userEvent.keyboard(" ");
	expect(onRowClick).toHaveBeenCalledTimes(1);
});

test("Enter on an activatable row selects and activates, in that order", async () => {
	const seen: Array<boolean> = [];
	const onRowClick = vi.fn(() => {
		seen.push(!!document.querySelector('tbody tr[data-selected="true"]'));
	});
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		selectOnRowClick: true,
		onRowClick,
		rowActivatable: true,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	rows()[0].focus();
	await userEvent.keyboard("{Enter}");
	expect(onRowClick).toHaveBeenCalledTimes(1);
	await expect
		.poll(() => document.querySelectorAll('tbody tr[data-selected="true"]').length)
		.toBe(1);
});

test("Enter on a lead link inside an activatable row does not double-fire", async () => {
	const onRowClick = vi.fn();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		onRowClick,
		rowActivatable: true,
		rowHref: href,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	links()[0].focus();
	await userEvent.keyboard("{Enter}");
	expect(onRowClick).not.toHaveBeenCalled();
});

// ============================================================================
// opt-in only
// ============================================================================

test("without rowHref / rowActivatable the row markup is unchanged", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		onRowClick: () => {},
		selectOnRowClick: true,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const tr = rows()[0];
	expect(tr.hasAttribute("tabindex")).toBe(false);
	expect(tr.hasAttribute("role")).toBe(false);
	expect(tr.hasAttribute("aria-label")).toBe(false);
	expect(tr.querySelector("a")).toBe(null);
	expect(tr.getAttribute("data-clickable")).toBe("true");
});

// ============================================================================
// selection bar (reserveBatchBar)
// ============================================================================

// NOTE: these assert the DOM invariant — one bar element that survives every
// selection state change. The *height* invariant that actually stops the jump is
// CSS (`--stuic-data-table-batch-min-height`), and component tests don't load
// index.css, so that half is verified against the running dev page instead.

const bar = () => document.querySelector<HTMLElement>(".stuic-data-table-batch");
const batchActionsSnippet = createRawSnippet(
	(args: () => { effectiveCount: number }) => ({
		render: () => `<span data-actions>${args().effectiveCount} picked</span>`,
	})
);
// 2 rows on screen out of 10 -- enough for the select-all-across-pages offer
const PAGING = createPagingStore({ total: 10, limit: 2 }).get();

test("the selection bar is reserved (and idle) before anything is selected", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		batchActions: batchActionsSnippet,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(bar()?.getAttribute("data-idle")).toBe("true");
	expect(bar()?.textContent?.trim()).toBe("No rows selected");
	expect(bar()?.querySelector("[data-actions]")).toBe(null);
});

test("selecting swaps the bar's content in place, keeping the same element", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		batchActions: batchActionsSnippet,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const before = bar();
	const cb = rows()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!;
	cb.click();
	await vi.waitFor(() => expect(bar()?.querySelector("[data-actions]")).not.toBe(null));

	// same node, not a remount — that is what keeps the table from moving
	expect(bar()).toBe(before);
	expect(bar()?.hasAttribute("data-idle")).toBe(false);
	expect(bar()?.querySelector("[data-actions]")?.textContent).toBe("1 picked");
});

test("reserveBatchBar={false} restores the pop-in behaviour", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		reserveBatchBar: false,
		batchActions: batchActionsSnippet,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(bar()).toBe(null);
	rows()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
	await vi.waitFor(() => expect(bar()).not.toBe(null));
	expect(bar()?.querySelector("[data-actions]")?.textContent).toBe("1 picked");
});

test("no bar at all when there is nothing to put in it", async () => {
	render(DataTable, { columns: COLUMNS, data: DATA, getRowId, selectable: true });
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(bar()).toBe(null);
	rows()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
	await vi.waitFor(() => expect(rows()[0].getAttribute("data-selected")).toBe("true"));
	expect(bar()).toBe(null);
});

test("without a batchActions snippet the bar reports the count itself", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		allowSelectAllPages: true,
		paging: PAGING,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(bar()?.textContent?.trim()).toBe("No rows selected");
	rows()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
	await vi.waitFor(() => expect(bar()?.textContent?.trim()).toBe("1 selected"));
});

test("the select-all offer renders inside the same bar, not as a second block", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		allowSelectAllPages: true,
		paging: PAGING,
		batchActions: batchActionsSnippet,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const before = bar();
	// header checkbox selects the whole page, which reveals the offer
	document.querySelector<HTMLInputElement>('thead input[type="checkbox"]')!.click();
	await vi.waitFor(() =>
		expect(bar()?.querySelector(".stuic-data-table-batch-select-all")).not.toBe(null)
	);

	expect(bar()).toBe(before);
	expect(bar()?.getAttribute("data-select-all")).toBe("true");
	expect(document.querySelectorAll(".stuic-data-table-batch").length).toBe(1);
	expect(bar()?.textContent).toContain("Select all 10 results");
});

// ============================================================================
// showPager — `paging` feeds the selection machinery, the pager is a separate ask
// ============================================================================

const pager = () => document.querySelector<HTMLElement>(".stuic-data-table-paging");

test("paging renders the built-in pager by default", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		allowSelectAllPages: true,
		paging: PAGING,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(pager()).not.toBe(null);
	expect(pager()?.textContent).toContain("Page 1 of 5");
});

test("showPager={false} hides the pager but keeps the select-all offer", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		selectable: true,
		allowSelectAllPages: true,
		paging: PAGING,
		showPager: false,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	// not `display: none` -- the node is absent, so it holds no space and no tab stop
	expect(pager()).toBe(null);

	// the banner still needs `paging`, and still gets it
	rows()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
	rows()[1].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
	await vi.waitFor(() => expect(bar()?.textContent).toContain("Select all 10"));
});

test("showPager={true} still renders no pager for a single-page result", async () => {
	// 2 rows out of 2 -- one page, nothing to page through
	const onePage = createPagingStore({ total: 2, limit: 2 }).get();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		paging: onePage,
		showPager: true,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(pager()).toBe(null);
});

// ============================================================================
// Pagination / EmptyState delegation — the pager IS a Pagination, the built-in
// empty state IS an EmptyState. Both regions keep their old classes, texts and
// callback contract; these pin that down.
// ============================================================================

test("the pager is a Pagination, and still reports the same offsets", async () => {
	const seen: number[] = [];
	// page 2 of 5 (total 10, limit 2) — both directions are live
	const middle = createPagingStore({ total: 10, limit: 2, offset: 2 }).get();
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		paging: middle,
		onPageChange: (offset: number) => seen.push(offset),
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const nav = pager()!;
	expect(nav.tagName).toBe("NAV");
	expect(nav.classList.contains("stuic-pagination")).toBe(true);
	expect(nav.getAttribute("data-variant")).toBe("compact");
	expect(nav.querySelector(".stuic-data-table-paging-info")?.textContent?.trim()).toBe(
		"Page 2 of 5"
	);

	const buttons = [...nav.querySelectorAll("button")];
	expect(buttons.length).toBe(2);
	expect(buttons[0].getAttribute("aria-label")).toBe("Prev");
	expect(buttons[1].getAttribute("aria-label")).toBe("Next");

	buttons[0].click();
	buttons[1].click();
	// exactly what `paging.previousOffset` / `paging.nextOffset` hold
	await vi.waitFor(() =>
		expect(seen).toEqual([middle.previousOffset, middle.nextOffset])
	);
});

test("the pager's edge buttons stay disabled (no onPageChange on the first page)", async () => {
	const seen: number[] = [];
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		paging: PAGING,
		onPageChange: (offset: number) => seen.push(offset),
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const buttons = [...pager()!.querySelectorAll("button")];
	expect(buttons[0].disabled).toBe(true);
	expect(buttons[1].disabled).toBe(false);
	buttons[0].click();
	expect(seen).toEqual([]);
});

test("the pager renders the DataTable `t` (no separate Pagination catalog)", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: DATA,
		getRowId,
		paging: PAGING,
		t: (k: string, values?: false | null | Record<string, string | number>) =>
			({
				previous_page: "Späť",
				next_page: "Ďalej",
				page_x_of_y: `Strana ${(values || {}).page} z ${(values || {}).pageCount}`,
				pagination: "Stránkovanie",
			})[k] ?? "",
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(pager()?.getAttribute("aria-label")).toBe("Stránkovanie");
	expect(pager()?.textContent).toContain("Strana 1 z 5");
	expect(pager()?.textContent).toContain("Späť");
	expect(pager()?.textContent).toContain("Ďalej");
});

const emptyCell = () => document.querySelector<HTMLElement>(".stuic-data-table-empty");

test("the built-in empty state is an EmptyState titled `no_data` (desktop)", async () => {
	render(DataTable, { columns: COLUMNS, data: [], getRowId });
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	const cell = emptyCell()!;
	expect(cell.tagName).toBe("TD");
	expect(cell.getAttribute("colspan")).toBe("2");

	const es = cell.querySelector(".stuic-data-table-empty-state")!;
	expect(es).not.toBe(null);
	expect(es.classList.contains("stuic-empty-state")).toBe(true);
	expect(es.getAttribute("data-size")).toBe("sm");
	expect(es.querySelector(".stuic-empty-state-title")?.textContent?.trim()).toBe(
		"No data"
	);
});

test("the built-in empty state renders the same way in the mobile card layout", async () => {
	render(DataTable, { columns: COLUMNS, data: [], getRowId, small: true });
	await vi.waitFor(() => expect(emptyCell()).not.toBe(null));

	const cell = emptyCell()!;
	expect(cell.tagName).toBe("DIV");
	expect(
		cell
			.querySelector(".stuic-data-table-empty-state .stuic-empty-state-title")
			?.textContent?.trim()
	).toBe("No data");
});

test("an `empty` snippet still replaces the built-in one entirely", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: [],
		getRowId,
		empty: createRawSnippet(() => ({ render: () => `<p>Nothing here</p>` })),
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(emptyCell()?.textContent?.trim()).toBe("Nothing here");
	// no EmptyState, so the container keeps its own padding (see index.css `:has()`)
	expect(emptyCell()?.querySelector(".stuic-data-table-empty-state")).toBe(null);
});

test("unstyled drops the wrapper classes from both delegated regions", async () => {
	render(DataTable, {
		columns: COLUMNS,
		data: [],
		getRowId,
		paging: PAGING,
		unstyled: true,
	});
	await expect.element(page.getByRole("table")).toBeInTheDocument();

	expect(pager()).toBe(null);
	expect(document.querySelector(".stuic-pagination")).toBe(null);
	expect(document.querySelector(".stuic-empty-state")).toBe(null);
	// the pager and the empty state are still there, just unstyled
	expect(document.querySelector("nav")?.textContent).toContain("Page 1 of 5");
	expect(document.querySelector("tbody td")?.textContent?.trim()).toBe("No data");
});
