import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import DropdownMenu, { type DropdownMenuItemAttrs } from "./DropdownMenu.svelte";

// DropdownMenu is an isOpen-bindable, anchor-positioned menu. Its default trigger
// is a <button aria-haspopup="menu" aria-expanded aria-controls>; the open panel
// is role="menu" and action items render through ListItemButton with an explicit
// role="menuitem" (so they are NOT matched by getByRole("button")). The menu
// open/close transition (slide ~100ms) means a just-closed menu lingers for a
// frame — every presence/absence assertion goes through expect.element auto-retry,
// never a synchronous read. Contracts a real browser proves here: aria-expanded
// flips, the menu enters/leaves the a11y tree, onSelect fires + closeOnSelect
// closes, Escape closes, and the search input filters items.

// Static-text children snippet -> a clean accessible name for the trigger button.
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// The canonical mixed item list from the brief: action / divider / header /
// disabled-action. Each test that needs spies builds its own list so the spy
// identity is fresh and the assertions stay deterministic.
function baseItems() {
	return [
		{ type: "action" as const, id: "new", label: "New", onSelect: vi.fn() },
		{ type: "divider" as const, id: "d1" },
		{ type: "header" as const, id: "h1", label: "Section" },
		{ type: "action" as const, id: "open", label: "Open", disabled: true },
	];
}

test("closed initially: aria-expanded false and no role=menu in the document", async () => {
	const screen = await render(DropdownMenu, {
		items: baseItems(),
		children: text("Open menu"),
	});

	const trigger = screen.getByRole("button", { name: "Open menu" });
	await expect.element(trigger).toBeInTheDocument();
	await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
	await expect.element(trigger).toHaveAttribute("aria-haspopup", "menu");

	// Closed -> the menu panel is not rendered at all.
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("clicking the trigger opens the menu: aria-expanded true, items + header + separator render", async () => {
	const screen = await render(DropdownMenu, {
		items: baseItems(),
		children: text("Open menu"),
	});

	const trigger = screen.getByRole("button", { name: "Open menu" });
	await trigger.click();

	await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
	const menu = screen.getByRole("menu");
	await expect.element(menu).toBeInTheDocument();

	// ARIA wiring: the trigger's aria-controls points at THIS menu's id, and the
	// menu's aria-labelledby points back at the trigger's id (ids are generated at
	// runtime by getId(), so read them off the live DOM rather than hard-coding).
	const triggerEl = trigger.element();
	const menuEl = menu.element();
	const menuId = menuEl.getAttribute("id");
	const triggerElId = triggerEl.getAttribute("id");
	expect(menuId).toBeTruthy();
	expect(triggerElId).toBeTruthy();
	expect(triggerEl.getAttribute("aria-controls")).toBe(menuId);
	expect(menuEl.getAttribute("aria-labelledby")).toBe(triggerElId);

	// Action items render via ListItemButton with role="menuitem".
	await expect.element(screen.getByRole("menuitem", { name: "New" })).toBeInTheDocument();
	await expect
		.element(screen.getByRole("menuitem", { name: "Open" }))
		.toBeInTheDocument();

	// Header text renders (role="presentation", so locate by its text).
	await expect.element(screen.getByText("Section")).toBeInTheDocument();

	// Divider renders as role="separator".
	expect(screen.container.querySelector('[role="separator"]')).not.toBeNull();
});

test("disabled action item is rendered disabled", async () => {
	const screen = await render(DropdownMenu, {
		items: baseItems(),
		children: text("Open menu"),
	});

	await screen.getByRole("button", { name: "Open menu" }).click();
	await expect.element(screen.getByRole("menuitem", { name: "Open" })).toBeDisabled();
});

test("selecting an action fires its onSelect once and closes the menu (closeOnSelect default)", async () => {
	const onSelect = vi.fn();
	const items = [
		{ type: "action" as const, id: "new", label: "New", onSelect },
		{ type: "divider" as const, id: "d1" },
		{ type: "header" as const, id: "h1", label: "Section" },
		{ type: "action" as const, id: "open", label: "Open", disabled: true },
	];
	const screen = await render(DropdownMenu, { items, children: text("Open menu") });

	const trigger = screen.getByRole("button", { name: "Open menu" });
	await trigger.click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Native click: fires the handler synchronously with no post-action wait. (A locator
	// click works too now that the in-house onClickOutside replaced runed's — its
	// cancelled debounce promise used to surface as an unhandled "Cancelled" rejection.)
	(screen.getByRole("menuitem", { name: "New" }).element() as HTMLElement).click();

	expect(onSelect).toHaveBeenCalledOnce();
	// closeOnSelect defaults to true -> the menu closes and aria-expanded reverts.
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
	await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
});

test("Escape closes the menu (closeOnEscape default)", async () => {
	const screen = await render(DropdownMenu, {
		items: baseItems(),
		children: text("Open menu"),
	});

	await screen.getByRole("button", { name: "Open menu" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// The keydown handler lives on <svelte:window>, so dispatch on window.
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("search filters items by prefix: typing 'new' keeps New and drops Open", async () => {
	// Both items enabled so the filter (not the disabled state) is what hides Open.
	const items = [
		{ type: "action" as const, id: "new", label: "New", onSelect: vi.fn() },
		{ type: "action" as const, id: "open", label: "Open", onSelect: vi.fn() },
	];
	const screen = await render(DropdownMenu, {
		items,
		search: true,
		children: text("Open menu"),
	});

	await screen.getByRole("button", { name: "Open menu" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Both items visible before filtering.
	await expect.element(screen.getByRole("menuitem", { name: "New" })).toBeInTheDocument();
	await expect
		.element(screen.getByRole("menuitem", { name: "Open" }))
		.toBeInTheDocument();

	// The search input is an <input aria-label="Search menu items">.
	const searchInput = screen.getByLabelText("Search menu items");
	await expect.element(searchInput).toBeInTheDocument();
	await searchInput.fill("new");

	// Prefix match: only "New" survives.
	await expect.element(screen.getByRole("menuitem", { name: "New" })).toBeInTheDocument();
	await expect
		.element(screen.getByRole("menuitem", { name: "Open" }))
		.not.toBeInTheDocument();
});

test("onOpen fires on open and onClose fires on close", async () => {
	const onOpen = vi.fn();
	const onClose = vi.fn();
	const screen = await render(DropdownMenu, {
		items: baseItems(),
		children: text("Open menu"),
		onOpen,
		onClose,
	});

	const trigger = screen.getByRole("button", { name: "Open menu" });
	await trigger.click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	expect(onOpen).toHaveBeenCalled();

	// Close via Escape; onClose fires on the open -> closed transition.
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
	expect(onClose).toHaveBeenCalled();
});

// --- scrollbar gutter -----------------------------------------------------------
// `scrollbar-gutter: stable` keeps the menu width steady while the scrollbar comes and
// goes (search filtering, expandables). It used to be reserved by a head-count guess
// (>= 7 items), which left a dead strip along the right edge of menus that never
// scroll. Now it is reserved only once a space-taking scrollbar is actually present,
// and then kept until the menu closes.

// The demo's "File Menu": 7 mixed items (2 headers, 4 actions, 1 divider) that fit
// well within the 300px max-height — exactly the shape that used to get the gutter.
function fileMenuItems() {
	return [
		{ type: "header" as const, id: "h1", label: "File Operations" },
		{ type: "action" as const, id: "new", label: "New File" },
		{ type: "action" as const, id: "open", label: "Open" },
		{ type: "action" as const, id: "save", label: "Save" },
		{ type: "divider" as const, id: "d1" },
		{ type: "header" as const, id: "h2", label: "Share" },
		{ type: "action" as const, id: "share", label: "Share..." },
	];
}

// Past the ~100ms slide intro, so assertions read the settled layout, not a frame
// of the transition.
const settle = () => new Promise((r) => setTimeout(r, 250));

test("scrollbar gutter: not reserved for a menu that does not scroll (7 mixed items)", async () => {
	const screen = await render(DropdownMenu, {
		items: fileMenuItems(),
		children: text("File"),
	});
	await screen.getByRole("button", { name: "File" }).click();
	const menu = screen.getByRole("menu");
	await expect.element(menu).toBeInTheDocument();
	await settle();

	const el = menu.element() as HTMLElement;
	expect(el.style.scrollbarGutter).toBe("");
});

test("scrollbar gutter: explicit scrollbarGutter=true reserves it regardless of content", async () => {
	const screen = await render(DropdownMenu, {
		items: fileMenuItems(),
		scrollbarGutter: true,
		children: text("File"),
	});
	await screen.getByRole("button", { name: "File" }).click();
	const menu = screen.getByRole("menu");
	await expect.element(menu).toBeInTheDocument();

	expect((menu.element() as HTMLElement).style.scrollbarGutter).toBe("stable");
});

test("scrollbar gutter: reserved once a space-taking scrollbar appears, kept while filtering shrinks the list, reset on reopen", async (ctx) => {
	// Component CSS is not loaded here, so opt the menu into scrolling explicitly and
	// give it a classic (space-taking) scrollbar: a ::-webkit-scrollbar rule makes
	// Chromium render a non-overlay scrollbar of that width.
	const style = document.createElement("style");
	style.textContent = `[role="menu"] { overflow-y: auto; } [role="menu"]::-webkit-scrollbar { width: 12px; }`;
	document.head.appendChild(style);
	try {
		const items = Array.from({ length: 40 }, (_, i) => ({
			type: "action" as const,
			id: `i${i}`,
			label: `Item ${i}`,
		}));
		const screen = await render(DropdownMenu, {
			items,
			search: true,
			children: text("Long"),
		});
		const trigger = screen.getByRole("button", { name: "Long" });
		await trigger.click();
		const menu = screen.getByRole("menu");
		await expect.element(menu).toBeInTheDocument();
		await settle();

		const el = menu.element() as HTMLElement;
		// No borders without the component CSS, so this is the scrollbar's own width.
		if (el.offsetWidth - el.clientWidth === 0) {
			// Headless Chromium launched with --hide-scrollbars: no scrollbar takes space,
			// so there is nothing to reserve and the auto path correctly stays off.
			expect(el.style.scrollbarGutter).toBe("");
			ctx.skip(
				"scrollbars take no space in this browser; auto-gutter path not exercised"
			);
		}
		expect(el.style.scrollbarGutter).toBe("stable");

		// Filter down to a single item: the list no longer scrolls, the gutter stays.
		await screen.getByLabelText("Search menu items").fill("Item 39");
		await expect
			.element(screen.getByRole("menuitem", { name: "Item 39" }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole("menuitem", { name: "Item 1" }))
			.not.toBeInTheDocument();
		expect(el.style.scrollbarGutter).toBe("stable");

		// Reopen: a fresh session measures again from scratch (search is cleared on
		// close, so the full list scrolls again and the gutter comes back).
		await trigger.click();
		await expect.element(menu).not.toBeInTheDocument();
		await trigger.click();
		const reopened = screen.getByRole("menu");
		await expect.element(reopened).toBeInTheDocument();
		await settle();
		expect((reopened.element() as HTMLElement).style.scrollbarGutter).toBe("stable");
	} finally {
		style.remove();
	}
});

// --- item attrs -----------------------------------------------------------------
// An item's `attrs` are spread onto its row FIRST, so every attribute the menu sets
// (id, role, tabindex, aria-expanded, class, the click/hover handlers, disabled, href)
// wins. The typical payload is a `data-testid` for a consumer's tests.

test("attrs: an action item's attrs land on its row, as a <button> and, given href, as an <a>", async () => {
	const screen = await render(DropdownMenu, {
		items: [
			{
				type: "action" as const,
				id: "save",
				label: "Save",
				disabled: true,
				attrs: { "data-testid": "row-save", title: "Nothing to save" },
			},
			{
				type: "action" as const,
				id: "docs",
				label: "Docs",
				href: "/docs",
				attrs: { "data-testid": "row-docs", "aria-describedby": "hint" },
			},
		],
		children: text("Open menu"),
	});
	await screen.getByRole("button", { name: "Open menu" }).click();

	const save = screen.getByTestId("row-save");
	await expect.element(save).toBeInTheDocument();
	await expect.element(save).toHaveAttribute("title", "Nothing to save");
	await expect.element(save).toHaveAttribute("role", "menuitem");
	await expect.element(save).toBeDisabled();
	expect(save.element().tagName).toBe("BUTTON");

	const docs = screen.getByTestId("row-docs");
	await expect.element(docs).toBeInTheDocument();
	await expect.element(docs).toHaveAttribute("aria-describedby", "hint");
	await expect.element(docs).toHaveAttribute("href", "/docs");
	expect(docs.element().tagName).toBe("A");
});

test("attrs: an expandable's header row and an action nested in it carry their attrs", async () => {
	const screen = await render(DropdownMenu, {
		items: [
			{
				type: "expandable" as const,
				id: "more",
				label: "More",
				defaultExpanded: true,
				attrs: { "data-testid": "row-more" },
				items: [
					{
						type: "action" as const,
						id: "nested",
						label: "Nested",
						attrs: { "data-testid": "row-nested" },
					},
				],
			},
		],
		children: text("Open menu"),
	});
	await screen.getByRole("button", { name: "Open menu" }).click();

	const header = screen.getByTestId("row-more");
	await expect.element(header).toBeInTheDocument();
	await expect.element(header).toHaveAttribute("role", "menuitem");
	await expect.element(header).toHaveAttribute("aria-expanded", "true");

	const nested = screen.getByTestId("row-nested");
	await expect.element(nested).toBeInTheDocument();
	await expect.element(nested).toHaveAttribute("role", "menuitem");
	expect(nested.element().tagName).toBe("BUTTON");
});

test("attrs: cannot override what the menu owns (id, role, tabindex, class, onclick, disabled, aria-expanded)", async () => {
	const onSelect = vi.fn();
	const hijackClick = vi.fn();
	// Cast past the type: it refuses these keys, this proves the runtime holds too.
	const hijack = {
		id: "hijack",
		role: "button",
		tabindex: 0,
		class: "hijack",
		onclick: hijackClick,
		disabled: true,
	} as unknown as DropdownMenuItemAttrs;
	const screen = await render(DropdownMenu, {
		items: [
			{
				type: "action" as const,
				id: "owned",
				label: "Owned",
				class: "mine",
				onSelect,
				attrs: { ...hijack, "data-testid": "row-owned" },
			},
			{
				type: "expandable" as const,
				id: "sec",
				label: "Section",
				defaultExpanded: true,
				attrs: {
					...hijack,
					"aria-expanded": false,
					"data-testid": "row-sec",
				} as unknown as DropdownMenuItemAttrs,
				items: [],
			},
		],
		closeOnSelect: false,
		children: text("Open menu"),
	});
	await screen.getByRole("button", { name: "Open menu" }).click();

	const row = screen.getByTestId("row-owned");
	await expect.element(row).toBeInTheDocument();
	const rowEl = row.element() as HTMLElement;
	expect(rowEl.id).not.toBe("hijack");
	expect(rowEl.id).toMatch(/-item-owned$/);
	expect(rowEl.getAttribute("role")).toBe("menuitem");
	expect(rowEl.getAttribute("tabindex")).toBe("-1");
	expect(rowEl.classList.contains("mine")).toBe(true);
	expect(rowEl.classList.contains("hijack")).toBe(false);
	await expect.element(row).toBeEnabled();

	const sec = screen.getByTestId("row-sec");
	await expect.element(sec).toHaveAttribute("aria-expanded", "true");
	expect((sec.element() as HTMLElement).id).toMatch(/-expandable-sec$/);
	expect(sec.element().getAttribute("role")).toBe("menuitem");

	// Keyboard navigation finds the row by the menu's id (getElementById), so it still
	// tracks it: ArrowDown activates the first navigable item and focuses its row.
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
	await expect.element(row).toHaveAttribute("data-focused");
	await expect.element(row).toHaveFocus();

	// The click is the menu's: onSelect fires, the attrs' onclick never does.
	rowEl.click();
	expect(onSelect).toHaveBeenCalledOnce();
	expect(hijackClick).not.toHaveBeenCalled();
});

test("attrs: a row that survives a search filter keeps its attributes", async () => {
	const screen = await render(DropdownMenu, {
		items: [
			{
				type: "action" as const,
				id: "new",
				label: "New",
				attrs: { "data-testid": "row-new" },
			},
			{
				type: "action" as const,
				id: "open",
				label: "Open",
				attrs: { "data-testid": "row-open" },
			},
		],
		search: true,
		children: text("Open menu"),
	});
	await screen.getByRole("button", { name: "Open menu" }).click();
	await expect.element(screen.getByTestId("row-open")).toBeInTheDocument();

	await screen.getByLabelText("Search menu items").fill("new");

	await expect.element(screen.getByTestId("row-open")).not.toBeInTheDocument();
	const row = screen.getByTestId("row-new");
	await expect.element(row).toBeInTheDocument();
	await expect.element(row).toHaveAttribute("role", "menuitem");
});

test("attrs: an item without attrs renders the same attributes as before", async () => {
	const screen = await render(DropdownMenu, {
		items: [{ type: "action" as const, id: "plain", label: "Plain" }],
		children: text("Open menu"),
	});
	await screen.getByRole("button", { name: "Open menu" }).click();

	const row = screen.getByRole("menuitem", { name: "Plain" });
	await expect.element(row).toBeInTheDocument();
	const names = (row.element() as HTMLElement).getAttributeNames().sort();
	expect(names).toEqual(["class", "data-size", "id", "role", "tabindex", "type"]);
});

test("attrs type: accepts data-*/aria-*/title, refuses the keys the menu owns", () => {
	// Compile-time contract, enforced by svelte-check through the @ts-expect-error lines.
	const ok: DropdownMenuItemAttrs = {
		"data-testid": "x",
		"aria-describedby": "hint",
		title: "Why it is disabled",
	};
	const refused: DropdownMenuItemAttrs[] = [
		// @ts-expect-error id is the keyboard-navigation target
		{ id: "x" },
		// @ts-expect-error role is the menu's
		{ role: "button" },
		// @ts-expect-error tabindex is the menu's
		{ tabindex: 0 },
		// @ts-expect-error aria-expanded is the menu's
		{ "aria-expanded": true },
		// @ts-expect-error class is the item's own field
		{ class: "x" },
		// @ts-expect-error the click is onSelect
		{ onclick: () => {} },
		// @ts-expect-error hover drives keyboard-nav state
		{ onmouseenter: () => {} },
		// @ts-expect-error the row's own state hook
		{ "data-focused": "" },
		// @ts-expect-error the row's own state hook
		{ "data-active": "" },
		// @ts-expect-error the row's own state hook
		{ "data-size": "sm" },
		// @ts-expect-error the row's own state hook
		{ "data-touch-friendly": "" },
	];
	expect(ok["data-testid"]).toBe("x");
	expect(refused).toHaveLength(11);
});
