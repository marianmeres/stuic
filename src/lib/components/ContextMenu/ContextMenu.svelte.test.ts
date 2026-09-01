import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import ContextMenu from "./ContextMenu.svelte";

// ContextMenu wraps the DropdownMenu engine behind context-menu trigger semantics:
// a `contextmenu` event (right-click), a long-press (touch/pen), or Shift+F10 /
// the menu key open the menu, anchored at the pointer via an invisible 0x0 fixed
// anchor div. The menu panel itself IS a DropdownMenu (role="menu", menuitem items,
// Escape/click-outside closing) — its internals are proven in
// DropdownMenu.svelte.test.ts; here we prove the trigger semantics and the anchor
// placement. The menu's open/close slide transition (~100ms) means presence/absence
// assertions go through expect.element auto-retry, never a synchronous read.

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function baseItems() {
	return [
		{ type: "action" as const, id: "copy", label: "Copy", onSelect: vi.fn() },
		{ type: "divider" as const, id: "d1" },
		{ type: "header" as const, id: "h1", label: "Danger" },
		{ type: "action" as const, id: "delete", label: "Delete", disabled: true },
	];
}

const target = (screen: { container: HTMLElement }) =>
	screen.container.querySelector(".stuic-context-menu") as HTMLElement;

const anchor = (screen: { container: HTMLElement }) =>
	screen.container.querySelector(".stuic-context-menu-anchor") as HTMLElement;

function rightClick(el: HTMLElement, clientX: number, clientY: number): boolean {
	return el.dispatchEvent(
		new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX, clientY })
	);
}

test("closed initially: no role=menu, target area has aria-haspopup", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		children: text("Target area"),
	});

	await expect.element(screen.getByText("Target area")).toBeInTheDocument();
	expect(target(screen).getAttribute("aria-haspopup")).toBe("menu");
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("contextmenu opens the menu at the pointer: native menu prevented, anchor moved, items render", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		children: text("Target area"),
	});

	// dispatchEvent returns false when preventDefault was called -> native menu blocked
	const notPrevented = rightClick(target(screen), 120, 80);
	expect(notPrevented).toBe(false);

	// The menu panel is a DropdownMenu, named by the sr-only label via aria-labelledby.
	const menu = screen.getByRole("menu", { name: "Context menu" });
	await expect.element(menu).toBeInTheDocument();

	// The invisible anchor sits at the pointer coordinates.
	expect(anchor(screen).style.left).toBe("120px");
	expect(anchor(screen).style.top).toBe("80px");

	// Item model passes through: action, disabled action, header, divider.
	await expect
		.element(screen.getByRole("menuitem", { name: "Copy" }))
		.toBeInTheDocument();
	await expect.element(screen.getByRole("menuitem", { name: "Delete" })).toBeDisabled();
	await expect.element(screen.getByText("Danger")).toBeInTheDocument();
	expect(screen.container.querySelector('[role="separator"]')).not.toBeNull();
});

test("re-invoking while open just moves the anchor (menu stays open)", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		children: text("Target area"),
	});

	rightClick(target(screen), 100, 100);
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	rightClick(target(screen), 210, 160);
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	expect(anchor(screen).style.left).toBe("210px");
	expect(anchor(screen).style.top).toBe("160px");
});

test("selecting an action fires its onSelect and closes the menu (closeOnSelect default)", async () => {
	const onSelect = vi.fn();
	const items = [{ type: "action" as const, id: "copy", label: "Copy", onSelect }];
	const screen = render(ContextMenu, { items, children: text("Target area") });

	rightClick(target(screen), 100, 100);
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Native click: selecting synchronously detaches this node, which would orphan
	// a Playwright actionability promise — same pattern as the DropdownMenu tests.
	(screen.getByRole("menuitem", { name: "Copy" }).element() as HTMLElement).click();

	expect(onSelect).toHaveBeenCalledOnce();
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("Escape closes the menu", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		children: text("Target area"),
	});

	rightClick(target(screen), 100, 100);
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// The keydown handler lives on <svelte:window> (DropdownMenu's), dispatch there.
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("Shift+F10 opens the menu anchored at the target area", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		children: text("Target area"),
	});

	target(screen).dispatchEvent(
		new KeyboardEvent("keydown", { key: "F10", shiftKey: true, bubbles: true })
	);

	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	// keyboard invocation anchors at the target's bottom-left corner, not (0,0)
	const rect = target(screen).getBoundingClientRect();
	expect(anchor(screen).style.left).toBe(`${rect.left}px`);
	expect(anchor(screen).style.top).toBe(`${rect.bottom}px`);
});

test("long-press (touch) opens the menu at the press point", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		longPress: 60,
		children: text("Target area"),
	});

	target(screen).dispatchEvent(
		new PointerEvent("pointerdown", {
			bubbles: true,
			pointerId: 1,
			pointerType: "touch",
			isPrimary: true,
			clientX: 60,
			clientY: 40,
		})
	);

	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	expect(anchor(screen).style.left).toBe("60px");
	expect(anchor(screen).style.top).toBe("40px");

	window.dispatchEvent(
		new PointerEvent("pointerup", { pointerId: 1, pointerType: "touch", isPrimary: true })
	);
});

test("moving beyond the tolerance cancels the pending long-press", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		longPress: 60,
		children: text("Target area"),
	});

	target(screen).dispatchEvent(
		new PointerEvent("pointerdown", {
			bubbles: true,
			pointerId: 1,
			pointerType: "touch",
			isPrimary: true,
			clientX: 60,
			clientY: 40,
		})
	);
	// a scroll-like move well past the 10px tolerance, before the 60ms timer fires
	window.dispatchEvent(
		new PointerEvent("pointermove", {
			pointerId: 1,
			pointerType: "touch",
			isPrimary: true,
			clientX: 60,
			clientY: 90,
		})
	);

	await new Promise((r) => setTimeout(r, 150));
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("disabled: contextmenu is not intercepted and no menu opens", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		disabled: true,
		children: text("Target area"),
	});

	const notPrevented = rightClick(target(screen), 100, 100);
	expect(notPrevented).toBe(true); // native context menu would show
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("programmatic open (isOpen prop) anchors at the target area", async () => {
	const screen = render(ContextMenu, {
		items: baseItems(),
		isOpen: true,
		children: text("Target area"),
	});

	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	const rect = target(screen).getBoundingClientRect();
	expect(anchor(screen).style.left).toBe(`${rect.left}px`);
	expect(anchor(screen).style.top).toBe(`${rect.bottom}px`);
});

test("onOpen/onClose fire across the open -> close cycle", async () => {
	const onOpen = vi.fn();
	const onClose = vi.fn();
	const screen = render(ContextMenu, {
		items: baseItems(),
		onOpen,
		onClose,
		children: text("Target area"),
	});

	rightClick(target(screen), 100, 100);
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	expect(onOpen).toHaveBeenCalled();

	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
	expect(onClose).toHaveBeenCalled();
});
