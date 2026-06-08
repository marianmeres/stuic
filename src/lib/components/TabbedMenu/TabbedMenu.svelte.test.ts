import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import TabbedMenu from "./TabbedMenu.svelte";
import type { TabbedMenuItem } from "./TabbedMenu.svelte";

// TabbedMenu renders <ul.stuic-tabbed-menu role="tablist"> with each item as a
// role="tab" element — a <button> by default, or an <a> when item.href is set.
// Tabs carry the ARIA contract: aria-selected (string "true"/"false") tracks the
// bindable `value`, and aria-disabled="true" marks disabled items. We locate tabs
// by their ARIA role/name (getByRole("tab", { name })) and the role-less <ul> root
// by its base class (page.elementLocator), matching the Avatar/Progress patterns.
// `value` is bindable; we assert through the DOM (aria-selected), not the JS value.

// label is a THC; a plain string renders as the tab's accessible name.
const items: TabbedMenuItem[] = [
	{ id: "a", label: "Tab A" },
	{ id: "b", label: "Tab B" },
	{ id: "c", label: "Tab C", disabled: true },
];

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-tabbed-menu");
	if (!el) throw new Error("missing .stuic-tabbed-menu root");
	return page.elementLocator(el);
}

test("renders a ul.stuic-tabbed-menu role=tablist with the horizontal orientation contract", async () => {
	const { container } = render(TabbedMenu, { items });
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-tabbed-menu");
	await expect.element(root).toHaveAttribute("role", "tablist");
	// orientation defaults to "horizontal" -> reflected on both data-* and aria-*
	await expect.element(root).toHaveAttribute("data-orientation", "horizontal");
	await expect.element(root).toHaveAttribute("aria-orientation", "horizontal");
});

test("each item renders a role=tab locatable by its label as accessible name", async () => {
	const screen = render(TabbedMenu, { items });
	// default items render as <button> tabs; the string label is the accessible name
	await expect.element(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument();
	await expect.element(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument();
	await expect.element(screen.getByRole("tab", { name: "Tab C" })).toBeInTheDocument();
});

test("value selects the matching tab: aria-selected is the string 'true'/'false'", async () => {
	const screen = render(TabbedMenu, { items, value: "a" });
	const tabA = screen.getByRole("tab", { name: "Tab A" });
	const tabB = screen.getByRole("tab", { name: "Tab B" });
	// aria-selected is a STRING attribute, not a boolean
	await expect.element(tabA).toHaveAttribute("aria-selected", "true");
	await expect.element(tabB).toHaveAttribute("aria-selected", "false");
});

test("clicking a tab moves selection and fires onSelect once with that item", async () => {
	const onSelect = vi.fn();
	const screen = render(TabbedMenu, { items, value: "a", onSelect });
	const tabA = screen.getByRole("tab", { name: "Tab A" });
	const tabB = screen.getByRole("tab", { name: "Tab B" });

	await tabB.click();

	// REACTIVITY: assert via the DOM (aria-selected) since value is bindable
	await expect.element(tabB).toHaveAttribute("aria-selected", "true");
	await expect.element(tabA).toHaveAttribute("aria-selected", "false");

	// onSelect fires once, with the clicked item (id "b")
	expect(onSelect).toHaveBeenCalledOnce();
	expect(onSelect.mock.calls[0][0].id).toBe("b");
});

test("disabled item is aria-disabled='true' and a normal click leaves selection unchanged", async () => {
	const onSelect = vi.fn();
	const screen = render(TabbedMenu, { items, value: "a", onSelect });
	const tabA = screen.getByRole("tab", { name: "Tab A" });
	const tabC = screen.getByRole("tab", { name: "Tab C" });

	// disabled -> aria-disabled is the string "true"
	await expect.element(tabC).toHaveAttribute("aria-disabled", "true");

	// clicking the disabled tab must not change selection or call onSelect.
	// force:true bypasses actionability checks on the aria-disabled element so we
	// can verify the handler itself is a no-op (selectItem early-returns).
	await tabC.click({ force: true });

	// selection stays on the previously active tab A; C never becomes selected
	await expect.element(tabA).toHaveAttribute("aria-selected", "true");
	await expect.element(tabC).toHaveAttribute("aria-selected", "false");
	expect(onSelect).not.toHaveBeenCalled();
});

test("orientation='vertical' reflects on data-orientation and aria-orientation", async () => {
	const { container } = render(TabbedMenu, { items, orientation: "vertical" });
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-orientation", "vertical");
	await expect.element(root).toHaveAttribute("aria-orientation", "vertical");
});

test("item.href renders the tab as an <a> (still role=tab) with the href attribute", async () => {
	const screen = render(TabbedMenu, {
		items: [{ id: "h", label: "Link", href: "/x" }],
	});
	const tab = screen.getByRole("tab", { name: "Link" });
	await expect.element(tab).toBeInTheDocument();
	// rendered as an anchor element with the href contract
	await expect.element(tab).toHaveAttribute("href", "/x");
	expect(tab.element().tagName).toBe("A");
});

test("item.onSelect returning false aborts: outer onSelect uncalled, selection unchanged", async () => {
	const onSelect = vi.fn();
	const screen = render(TabbedMenu, {
		items: [
			{ id: "a", label: "Tab A" },
			{ id: "x", label: "X", onSelect: () => false },
		],
		value: "a",
		onSelect,
	});
	const tabA = screen.getByRole("tab", { name: "Tab A" });
	const tabX = screen.getByRole("tab", { name: "X" });

	await tabX.click();

	// item-level onSelect returned false -> selectItem short-circuits BEFORE
	// updating value or invoking the outer onSelect
	expect(onSelect).not.toHaveBeenCalled();
	await expect.element(tabA).toHaveAttribute("aria-selected", "true");
	await expect.element(tabX).toHaveAttribute("aria-selected", "false");
});

test("unstyled=true drops the stuic-tabbed-menu base class from the <ul>", async () => {
	const { container } = render(TabbedMenu, { items, unstyled: true });
	// the styled base class is gone; locate the tablist by role instead
	expect(container.querySelector(".stuic-tabbed-menu")).toBeNull();
	const ul = page.elementLocator(container.querySelector("[role='tablist']")!);
	await expect.element(ul).toBeInTheDocument();
	await expect.element(ul).not.toHaveClass("stuic-tabbed-menu");
});
