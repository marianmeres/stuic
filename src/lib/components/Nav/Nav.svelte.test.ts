import { render } from "vitest-browser-svelte";
import { expect, test, vi, beforeEach } from "vitest";
import Nav from "./Nav.svelte";
import type { NavGroup, NavGroupEntry, NavItem } from "./Nav.svelte";

// Nav is a sidebar navigation rendering NavGroup[] of NavItem[]. The contracts a
// real browser proves here are structural/aria/behavioral, not styling (no CSS is
// loaded), so we assert role/aria/data-* and the stuic-* hook classes.
//
// Two setup hazards drive the whole file:
//   1. persistState defaults TRUE and reads/writes localStorage, so expand state
//      would leak between tests. Every render passes persistState={false} (except
//      the persistence tests 13-14, which assert on localStorage on purpose) and we
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
	const screen = await render(Nav, { groups, title: "Main", persistState: false });

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
	const screen = await render(Nav, {
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
	const screen = await render(Nav, { groups, persistState: false, onGroupToggle });

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
	const screen = await render(Nav, { groups, activeId: "a2", persistState: false });

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
	const screen = await render(Nav, { groups, persistState: false, onSelect });

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
	const screen = await render(Nav, { groups, persistState: false });

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
	const screen = await render(Nav, { groups, persistState: false });

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
	const screen = await render(Nav, { groups, persistState: false });

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
	const screen = await render(Nav, { groups, persistState: false, onGroupSelect });

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
	const screen = await render(Nav, { groups, isCollapsed: true, persistState: false });

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
	const screen = await render(Nav, { groups, isActive, persistState: false });

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
	const screen = await render(Nav, { groups, persistState: false, onSelect });

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

test("(13) sectionId keys the collapsible title's saved state per section under a shared prefix", async () => {
	// Two Navs share one storageKeyPrefix (as a sidebar does on purpose, so that a
	// group's memory follows its id between sections) but carry distinct sectionIds.
	// Collapsing one must write its own `{prefix}-section-{sectionId}` key, leave the
	// other section untouched, and a re-mount must read each section's own state back.
	const prefix = "stuic-nav-shared";
	const groupsA: NavGroup[] = [{ title: "Group A1", items: [] }];
	const groupsB: NavGroup[] = [{ title: "Group B1", items: [] }];
	const propsA = {
		groups: groupsA,
		title: "Section A",
		collapsibleTitle: true,
		storageKeyPrefix: prefix,
		sectionId: "a",
	};
	const propsB = { ...propsA, groups: groupsB, title: "Section B", sectionId: "b" };

	const first = { a: await render(Nav, propsA), b: await render(Nav, propsB) };
	const titleA = first.a.getByRole("button", { name: "Section A" });
	const titleB = first.b.getByRole("button", { name: "Section B" });
	await expect.element(titleA).toHaveAttribute("aria-expanded", "true");
	await expect.element(titleB).toHaveAttribute("aria-expanded", "true");

	await titleA.click();
	await expect.element(titleA).toHaveAttribute("aria-expanded", "false");
	// Section B is unaffected...
	await expect.element(titleB).toHaveAttribute("aria-expanded", "true");
	// ...because only A's own key was written; B's key and the bare `-section` key
	// (what a Nav without sectionId would use) stay untouched.
	expect(localStorage.getItem(`${prefix}-section-a`)).toBe("false");
	expect(localStorage.getItem(`${prefix}-section-b`)).toBeNull();
	expect(localStorage.getItem(`${prefix}-section`)).toBeNull();

	// Re-mount both (a "reload"): each reads its own saved state.
	first.a.unmount();
	first.b.unmount();
	const second = { a: await render(Nav, propsA), b: await render(Nav, propsB) };
	await expect
		.element(second.a.getByRole("button", { name: "Section A" }))
		.toHaveAttribute("aria-expanded", "false");
	await expect
		.element(second.b.getByRole("button", { name: "Section B" }))
		.toHaveAttribute("aria-expanded", "true");
});

test("(14) without sectionId the collapsible title's saved state stays under `{prefix}-section`", async () => {
	const prefix = "stuic-nav-single";
	const groups: NavGroup[] = [{ title: "Group A", items: [] }];
	const screen = await render(Nav, {
		groups,
		title: "Main",
		collapsibleTitle: true,
		storageKeyPrefix: prefix,
	});

	const titleBtn = screen.getByRole("button", { name: "Main" });
	await titleBtn.click();
	await expect.element(titleBtn).toHaveAttribute("aria-expanded", "false");

	expect(localStorage.getItem(`${prefix}-section`)).toBe("false");
	// No per-section key is produced (guards against a stray `-section-undefined`).
	const perSection = Object.keys(localStorage).filter((k) =>
		k.startsWith(`${prefix}-section-`)
	);
	expect(perSection).toEqual([]);
});

// ---------------------------------------------------------------------------
// Dividers and headers: non-interactive entries allowed at every level (among
// groups, among a group's items, among an item's children). Group-level ones
// render as <div>, list-level ones as <li>.
// ---------------------------------------------------------------------------

const separators = (root: HTMLElement) =>
	Array.from(root.querySelectorAll<HTMLElement>('[role="separator"]'));
const headerTexts = (root: HTMLElement) =>
	Array.from(root.querySelectorAll<HTMLElement>(".stuic-nav-header")).map((h) =>
		h.textContent?.trim()
	);

test("(15) dividers and headers render at every level; walkers and callbacks skip them", async () => {
	const isActive = vi.fn((item: NavItem) => item.id === "c2");
	const groups: NavGroupEntry[] = [
		{ title: "G1", href: "/g1" },
		{ type: "divider" },
		{ type: "header", label: "Top header" },
		{
			title: "G2",
			items: [
				{ id: "a", label: "A", href: "/a" },
				{ type: "divider", line: false },
				{ type: "header", label: { en: "Item header", sk: "Hlavička" } },
				{
					id: "p",
					label: "P",
					children: [
						{ id: "c1", label: "C1", href: "/c1" },
						{ type: "divider" },
						{ type: "header", label: "Child header" },
						{ id: "c2", label: "C2", href: "/c2" },
					],
				},
				{ type: "divider" },
				{ id: "b", label: "B", href: "/b" },
			],
		},
	];
	const screen = await render(Nav, {
		groups,
		isActive,
		locale: "en",
		persistState: false,
	});

	// The active child sits behind two dividers/headers per level, yet still
	// auto-expands both its group and its parent item.
	const active = screen.getByRole("link", { name: "C2" });
	await expect.element(active).toHaveAttribute("aria-current", "page");
	await expect
		.element(screen.getByRole("button", { name: "P" }))
		.toHaveAttribute("aria-expanded", "true");

	// Four dividers: one among groups (div), two among items (li), one among children (li).
	await expect.poll(() => separators(screen.container).length).toBe(4);
	const seps = separators(screen.container);
	expect(seps.map((s) => s.tagName)).toEqual(["DIV", "LI", "LI", "LI"]);
	expect(seps.every((s) => s.classList.contains("stuic-nav-divider"))).toBe(true);
	// Only the `line: false` one is blank.
	expect(seps.map((s) => s.hasAttribute("data-blank"))).toEqual([
		false,
		true,
		false,
		false,
	]);

	// Headers at all three levels, localized, and none of them interactive.
	expect(headerTexts(screen.container)).toEqual([
		"Top header",
		"Item header",
		"Child header",
	]);
	await expect
		.element(screen.getByRole("button", { name: "Item header" }))
		.not.toBeInTheDocument();
	await expect
		.element(screen.getByRole("link", { name: "Item header" }))
		.not.toBeInTheDocument();

	// The isActive callback is only ever handed real items.
	expect(isActive).toHaveBeenCalled();
	for (const [arg] of isActive.mock.calls) {
		expect(arg).toHaveProperty("id");
		expect(arg).not.toHaveProperty("type");
	}
});

test("(16) leading, trailing and repeated dividers and orphan headers are not rendered", async () => {
	const groups: NavGroupEntry[] = [
		{ type: "divider" }, // leading -> dropped
		{ type: "header", label: "Empty top" }, // section ends at the divider, empty -> dropped
		{ type: "divider" }, // nothing before it but headers -> dropped
		{ type: "header", label: "Top" },
		{
			title: "G",
			defaultExpanded: true,
			items: [
				{ type: "divider" }, // leading -> dropped
				{ type: "header", label: "Orphan" }, // next header comes first -> dropped
				{ type: "header", label: "Kept" },
				{ id: "a", label: "A", href: "/a" },
				{ type: "divider" }, // first of a run -> kept
				{ type: "divider", line: false }, // rest of the run -> dropped
				{ id: "b", label: "B", href: "/b" },
				{ type: "divider" }, // kept
				// The permission-filter case: this header's items were removed, so its section
				// (up to the next divider) is empty. Keeping it would label "C" as "Admin".
				{ type: "header", label: "Admin" }, // -> dropped
				{ type: "divider" }, // now repeats the one above -> dropped
				{ id: "c", label: "C", href: "/c" },
				{ type: "divider" }, // trailing -> dropped
				{ type: "header", label: "Trailing" }, // nothing after -> dropped
			],
		},
		{ type: "divider" }, // trailing -> dropped
	];
	const screen = await render(Nav, { groups, persistState: false });

	await expect.element(screen.getByRole("link", { name: "C" })).toBeInTheDocument();
	const seps = separators(screen.container);
	expect(seps).toHaveLength(2);
	expect(seps.every((s) => s.tagName === "LI")).toBe(true);
	expect(seps[0].hasAttribute("data-blank")).toBe(false); // first of the run wins
	expect(headerTexts(screen.container)).toEqual(["Top", "Kept"]);
});

test("(17) dividers/headers alone don't make a group or item expandable; groupIndex counts them", async () => {
	const onGroupToggle = vi.fn();
	const groups: NavGroupEntry[] = [
		{ type: "divider" },
		{ type: "header", label: "Section" },
		// Only separating entries -> acts like a group without items (a plain link).
		{ title: "Leafy", href: "/leafy", items: [{ type: "divider" }] },
		{
			title: "G",
			defaultExpanded: true,
			items: [
				{
					id: "p",
					label: "P",
					href: "/p",
					children: [{ type: "header", label: "Nothing under me" }],
				},
			],
		},
	];
	const screen = await render(Nav, { groups, persistState: false, onGroupToggle });

	await expect
		.element(screen.getByRole("link", { name: "Leafy" }))
		.toHaveAttribute("href", "/leafy");
	await expect
		.element(screen.getByRole("button", { name: "Leafy" }))
		.not.toBeInTheDocument();
	// An item whose children are only a header is a leaf link, not a toggle.
	await expect.element(screen.getByRole("link", { name: "P" })).toBeInTheDocument();
	await expect.element(screen.getByRole("button", { name: "P" })).not.toBeInTheDocument();

	// "G" is the 4th entry of `groups`: the index includes the header and divider.
	await screen.getByRole("button", { name: "G" }).click();
	expect(onGroupToggle).toHaveBeenCalledWith(3, false);
});

test("(18) collapsed mode: headers turn into lines with an sr-only label", async () => {
	const groups: NavGroupEntry[] = [
		{ title: "Home", href: "/" },
		{ type: "header", label: "Reports" },
		{ title: "Sales", href: "/sales" },
		{ type: "divider" },
		{ title: "Help", href: "/help" },
	];
	const screen = await render(Nav, { groups, isCollapsed: true, persistState: false });

	await expect.element(screen.getByText("Reports")).toBeInTheDocument();
	const header = screen.container.querySelector<HTMLElement>(".stuic-nav-header");
	expect(header?.hasAttribute("data-collapsed")).toBe(true);
	expect(header?.querySelector("span")?.classList.contains("sr-only")).toBe(true);
	expect(separators(screen.container)[0].hasAttribute("data-collapsed")).toBe(true);
});
