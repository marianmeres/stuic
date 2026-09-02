import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import DropdownMenu from "./DropdownMenu.svelte";

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
	const screen = render(DropdownMenu, {
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
	const screen = render(DropdownMenu, {
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
	const screen = render(DropdownMenu, {
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
	const screen = render(DropdownMenu, { items, children: text("Open menu") });

	const trigger = screen.getByRole("button", { name: "Open menu" });
	await trigger.click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Native click: selecting synchronously closes the menu (this node detaches), which
	// would orphan a Playwright actionability promise ("Cancelled"). A native DOM click
	// fires the handler synchronously with no post-action wait.
	(screen.getByRole("menuitem", { name: "New" }).element() as HTMLElement).click();

	expect(onSelect).toHaveBeenCalledOnce();
	// closeOnSelect defaults to true -> the menu closes and aria-expanded reverts.
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
	await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
});

test("Escape closes the menu (closeOnEscape default)", async () => {
	const screen = render(DropdownMenu, {
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
	const screen = render(DropdownMenu, {
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
	const screen = render(DropdownMenu, {
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
	const screen = render(DropdownMenu, { items: fileMenuItems(), children: text("File") });
	await screen.getByRole("button", { name: "File" }).click();
	const menu = screen.getByRole("menu");
	await expect.element(menu).toBeInTheDocument();
	await settle();

	const el = menu.element() as HTMLElement;
	expect(el.style.scrollbarGutter).toBe("");
});

test("scrollbar gutter: explicit scrollbarGutter=true reserves it regardless of content", async () => {
	const screen = render(DropdownMenu, {
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
		const screen = render(DropdownMenu, { items, search: true, children: text("Long") });
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
