import { render } from "vitest-browser-svelte";
import { expect, test, vi, beforeEach } from "vitest";
import Nav from "./Nav.svelte";
import type { NavGroup, NavItem } from "./Nav.svelte";

// Nav is a sidebar navigation rendering NavGroup[] of NavItem[]. The contracts a
// real browser proves here are structural/aria/behavioral, not styling (no CSS is
// loaded), so we assert role/aria/data-* and the stuic-* hook classes.
//
// Two setup hazards drive the whole file:
//   1. persistState defaults TRUE and reads/writes localStorage, so expand state
//      would leak between tests. Every render passes persistState={false} and we
//      clear localStorage in beforeEach for belt-and-suspenders determinism.
//   2. Leaf items with an href render a real <a href> whose onclick does NOT
//      preventDefault — a Playwright .click() would navigate the test page and
//      break the run. So href leaves are asserted by attribute only; behavioral
//      click tests use onClick-only leaves (which render <button>, no navigation).
//
// Group headers start COLLAPSED by default; their <ul class="stuic-nav-children">
// appears/disappears behind a slide transition, so every presence/absence check
// goes through expect.element auto-retry, never a synchronous DOM read.

beforeEach(() => localStorage.clear());

test("(1) non-interactive section title renders as a span, not a button", async () => {
	const groups: NavGroup[] = [{ title: "Group A", items: [] }];
	const screen = render(Nav, { groups, title: "Main", persistState: false });

	// The title text is present...
	await expect.element(screen.getByText("Main")).toBeInTheDocument();
	// ...but it is NOT a button (default collapsibleTitle=false -> plain <span>).
	await expect
		.element(screen.getByRole("button", { name: "Main" }))
		.not.toBeInTheDocument();

	const titleEl = screen.container.querySelector(".stuic-nav-section-title");
	expect(titleEl).not.toBeNull();
	expect(titleEl?.tagName).toBe("SPAN");
});

test("(2) collapsibleTitle renders a button that toggles aria-expanded", async () => {
	const groups: NavGroup[] = [{ title: "Group A", items: [] }];
	const onTitleToggle = vi.fn();
	const screen = render(Nav, {
		groups,
		title: "Main",
		collapsibleTitle: true,
		persistState: false,
		onTitleToggle,
	});

	const titleBtn = screen.getByRole("button", { name: "Main" });
	await expect.element(titleBtn).toBeInTheDocument();
	await expect.element(titleBtn).toHaveAttribute("aria-controls");
	// defaultTitleExpanded defaults to true.
	await expect.element(titleBtn).toHaveAttribute("aria-expanded", "true");

	await titleBtn.click();
	await expect.element(titleBtn).toHaveAttribute("aria-expanded", "false");
	expect(onTitleToggle).toHaveBeenCalledWith(false);
});

test("(3) group header is collapsed by default; clicking expands it, items appear, onGroupToggle(index,true) fires", async () => {
	const onGroupToggle = vi.fn();
	const groups: NavGroup[] = [
		{
			title: "Group A",
			items: [{ id: "a1", label: "Item A1", href: "/a1" }],
		},
	];
	const screen = render(Nav, { groups, persistState: false, onGroupToggle });

	const header = screen.getByRole("button", { name: "Group A" });
	await expect.element(header).toBeInTheDocument();
	// Groups start collapsed.
	await expect.element(header).toHaveAttribute("aria-expanded", "false");
	// Children list is not rendered while collapsed.
	await expect
		.element(screen.getByRole("link", { name: "Item A1" }))
		.not.toBeInTheDocument();

	await header.click();

	await expect.element(header).toHaveAttribute("aria-expanded", "true");
	// The children <ul> + its leaf now appear (slide transition -> auto-retry).
	await expect.element(screen.getByRole("link", { name: "Item A1" })).toBeInTheDocument();
	expect(onGroupToggle).toHaveBeenCalledWith(0, true);

	// The children list is labelled by the header (aria-labelledby = header id).
	const ul = screen.container.querySelector(".stuic-nav-children");
	expect(ul).not.toBeNull();
	expect(ul?.getAttribute("aria-labelledby")).toBe(header.element().getAttribute("id"));
});

test("(4) active href leaf has data-active and aria-current=page (activeId auto-expands its group)", async () => {
	const groups: NavGroup[] = [
		{
			title: "Group A",
			items: [
				{ id: "a1", label: "Item A1", href: "/a1" },
				{ id: "a2", label: "Item A2", href: "/a2" },
			],
		},
	];
	// activeId matches a2 -> its group auto-expands without a click.
	const screen = render(Nav, { groups, activeId: "a2", persistState: false });

	const active = screen.getByRole("link", { name: "Item A2" });
	await expect.element(active).toBeInTheDocument();
	await expect.element(active).toHaveAttribute("aria-current", "page");
	await expect.element(active).toHaveAttribute("data-active", "");
	await expect.element(active).toHaveAttribute("href", "/a2");

	// The non-active sibling has neither marker.
	const inactive = screen.getByRole("link", { name: "Item A1" });
	await expect.element(inactive).not.toHaveAttribute("aria-current");
	await expect.element(inactive).not.toHaveAttribute("data-active");
});

test("(5) onClick-only leaf renders a <button>; clicking fires item.onClick and onSelect(item) once", async () => {
	const itemOnClick = vi.fn();
	const onSelect = vi.fn();
	const item: NavItem = { id: "a1", label: "Action A1", onClick: itemOnClick };
	const groups: NavGroup[] = [{ title: "Group A", items: [item], defaultExpanded: true }];
	const screen = render(Nav, { groups, persistState: false, onSelect });

	// onClick-only leaf (no href) is a <button>, never a link -> safe to click.
	const leaf = screen.getByRole("button", { name: "Action A1" });
	await expect.element(leaf).toBeInTheDocument();
	await expect
		.element(screen.getByRole("link", { name: "Action A1" }))
		.not.toBeInTheDocument();

	await leaf.click();

	expect(itemOnClick).toHaveBeenCalledOnce();
	expect(onSelect).toHaveBeenCalledOnce();
	// onSelect receives the selected item.
	expect(onSelect.mock.calls[0][0]).toMatchObject({ id: "a1" });
});

test("(6) disabled href leaf exposes aria-disabled and tabindex=-1 (asserted, not clicked)", async () => {
	const groups: NavGroup[] = [
		{
			title: "Group A",
			defaultExpanded: true,
			items: [{ id: "a1", label: "Item A1", href: "/a1", disabled: true }],
		},
	];
	const screen = render(Nav, { groups, persistState: false });

	const link = screen.getByRole("link", { name: "Item A1" });
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("aria-disabled", "true");
	await expect.element(link).toHaveAttribute("tabindex", "-1");
	// NOTE: deliberately NOT clicking — it is a real <a href> and would navigate.
});

test("(7) parent item with children toggles a nested children <ul>", async () => {
	const groups: NavGroup[] = [
		{
			title: "Group A",
			defaultExpanded: true,
			items: [
				{
					id: "parent",
					label: "Parent",
					children: [{ id: "child", label: "Child", href: "/child" }],
				},
			],
		},
	];
	const screen = render(Nav, { groups, persistState: false });

	// Parent with children renders as a toggle button, not a link.
	const parentBtn = screen.getByRole("button", { name: "Parent" });
	await expect.element(parentBtn).toBeInTheDocument();
	await expect.element(parentBtn).toHaveAttribute("data-has-children", "");
	await expect.element(parentBtn).toHaveAttribute("aria-expanded", "false");
	// Child not present while collapsed.
	await expect
		.element(screen.getByRole("link", { name: "Child" }))
		.not.toBeInTheDocument();

	await parentBtn.click();

	await expect.element(parentBtn).toHaveAttribute("aria-expanded", "true");
	await expect.element(screen.getByRole("link", { name: "Child" })).toBeInTheDocument();

	// Toggle back -> child disappears (slide transition -> auto-retry).
	await parentBtn.click();
	await expect.element(parentBtn).toHaveAttribute("aria-expanded", "false");
	await expect
		.element(screen.getByRole("link", { name: "Child" }))
		.not.toBeInTheDocument();
});

test("(8) group without items but with href renders an <a> directly, always visible (no expand toggle)", async () => {
	const groups: NavGroup[] = [{ title: "Standalone", href: "/standalone" }];
	const screen = render(Nav, { groups, persistState: false });

	// No expandable header button for a group without items.
	await expect
		.element(screen.getByRole("button", { name: "Standalone" }))
		.not.toBeInTheDocument();

	const link = screen.getByRole("link", { name: "Standalone" });
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("href", "/standalone");
	await expect.element(link).toHaveClass("stuic-nav-item");
});

test("(9) group without items + onClick renders a <button>; clicking fires onGroupSelect and group.onClick", async () => {
	const groupOnClick = vi.fn();
	const onGroupSelect = vi.fn();
	const group: NavGroup = { title: "Action Group", onClick: groupOnClick };
	const groups: NavGroup[] = [group];
	const screen = render(Nav, { groups, persistState: false, onGroupSelect });

	const btn = screen.getByRole("button", { name: "Action Group" });
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveClass("stuic-nav-item");

	await btn.click();

	expect(groupOnClick).toHaveBeenCalledOnce();
	expect(onGroupSelect).toHaveBeenCalledOnce();
	expect(onGroupSelect.mock.calls[0][0]).toMatchObject({ title: "Action Group" });
});

test("(10) isCollapsed sets data-collapsed on the nav root", async () => {
	const groups: NavGroup[] = [
		{ title: "Group A", items: [{ id: "a1", label: "A1", href: "/a1" }] },
	];
	const screen = render(Nav, { groups, isCollapsed: true, persistState: false });

	// Located by role (single <nav> -> implicit role=navigation), asserted via
	// auto-retry. The empty-string data-collapsed attribute is present when collapsed.
	const navLoc = screen.getByRole("navigation");
	await expect.element(navLoc).toHaveAttribute("data-collapsed", "");
	await expect.element(navLoc).toHaveClass("stuic-nav");
});

test("(11) isActive callback variant marks the matching leaf and auto-expands its containing group", async () => {
	// isActive (callback variant) instead of activeId. The group containing the
	// active descendant must render expanded WITHOUT a click.
	const isActive = (item: NavItem) => item.id === "a2";
	const groups: NavGroup[] = [
		{
			title: "Group A",
			items: [
				{ id: "a1", label: "Item A1", href: "/a1" },
				{ id: "a2", label: "Item A2", href: "/a2" },
			],
		},
	];
	const screen = render(Nav, { groups, isActive, persistState: false });

	// Auto-expanded: the header shows aria-expanded=true with no interaction.
	const header = screen.getByRole("button", { name: "Group A" });
	await expect.element(header).toHaveAttribute("aria-expanded", "true");

	const active = screen.getByRole("link", { name: "Item A2" });
	await expect.element(active).toBeInTheDocument();
	await expect.element(active).toHaveAttribute("aria-current", "page");
	await expect.element(active).toHaveAttribute("data-active", "");
});

test("(12) disabled onClick-only leaf renders a <button> with the disabled attribute (asserted, not clicked)", async () => {
	const itemOnClick = vi.fn();
	const onSelect = vi.fn();
	const groups: NavGroup[] = [
		{
			title: "Group A",
			defaultExpanded: true,
			items: [{ id: "a1", label: "Action A1", onClick: itemOnClick, disabled: true }],
		},
	];
	const screen = render(Nav, { groups, persistState: false, onSelect });

	// onClick-only leaf -> <button>; disabled -> the native disabled attribute is set.
	// We deliberately do NOT click: Playwright would wait for the button to become
	// enabled and time out. The handler's own disabled guard is exercised elsewhere.
	const leaf = screen.getByRole("button", { name: "Action A1" });
	await expect.element(leaf).toBeInTheDocument();
	await expect.element(leaf).toBeDisabled();
	// Sanity: no link variant is produced for an onClick-only leaf.
	await expect
		.element(screen.getByRole("link", { name: "Action A1" }))
		.not.toBeInTheDocument();
});
