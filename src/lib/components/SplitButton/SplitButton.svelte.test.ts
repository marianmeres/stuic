import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import SplitButton from "./SplitButton.svelte";

// SplitButton is a composition shell: a role="group" wrapper (pill surface)
// holding a primary stuic Button and a secondary icon-button trigger which
// either opens a built-in DropdownMenu (`items`) or fires a plain callback
// (`onSecondaryClick`). The secondary trigger is icon-only, so its accessible
// name comes from `secondaryLabel` (default "More options"). DropdownMenu's
// open/close transition (~100ms slide) means presence/absence assertions go
// through expect.element auto-retry, never a synchronous read.

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function baseItems() {
	return [
		{ type: "action" as const, id: "one", label: "One", onSelect: vi.fn() },
		{ type: "action" as const, id: "two", label: "Two", onSelect: vi.fn() },
	];
}

test("renders a role=group wrapper with default data-attrs", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		"data-testid": "sb",
	});
	const group = screen.getByTestId("sb");
	await expect.element(group).toBeInTheDocument();
	await expect.element(group).toHaveClass("stuic-split-button");
	await expect.element(group).toHaveRole("group");
	await expect.element(group).toHaveAttribute("data-placement", "start");
	await expect.element(group).toHaveAttribute("data-rounded-full", "true");
	await expect.element(group).toHaveAttribute("data-size", "md");
	expect(group.element().hasAttribute("data-divided")).toBe(false);
	expect(group.element().hasAttribute("data-open")).toBe(false);
});

test("primary renders children content and fires onclick", async () => {
	const onclick = vi.fn();
	const screen = render(SplitButton, { children: text("Save"), onclick });
	const primary = screen.getByRole("button", { name: "Save" });
	await expect.element(primary).toHaveClass("stuic-split-button-primary");
	await primary.click();
	expect(onclick).toHaveBeenCalledTimes(1);
});

test("string `icon` without children renders an icon-only primary (data-icon-button)", async () => {
	const svg = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
	const screen = render(SplitButton, {
		icon: svg,
		primaryProps: { "aria-label": "Mic" },
	});
	const primary = screen.getByRole("button", { name: "Mic" });
	await expect.element(primary).toHaveAttribute("data-icon-button", "true");
	expect(primary.element().querySelector("svg")).toBeTruthy();
});

test("intent/variant/size forward to the primary button as data-attrs", async () => {
	const screen = render(SplitButton, {
		children: text("Go"),
		intent: "destructive",
		variant: "soft",
		size: "lg",
	});
	const primary = screen.getByRole("button", { name: "Go" });
	await expect.element(primary).toHaveAttribute("data-intent", "destructive");
	await expect.element(primary).toHaveAttribute("data-variant", "soft");
	await expect.element(primary).toHaveAttribute("data-size", "lg");
});

test("secondary defaults to a neutral ghost icon-button with 'More options' name", async () => {
	const screen = render(SplitButton, { children: text("Save") });
	const secondary = screen.getByRole("button", { name: "More options" });
	await expect.element(secondary).toHaveClass("stuic-split-button-secondary");
	await expect.element(secondary).toHaveAttribute("data-variant", "ghost");
	await expect.element(secondary).toHaveAttribute("data-icon-button", "true");
	expect(secondary.element().getAttribute("data-intent")).toBeNull();
});

test("placement controls DOM order (start: secondary first; end: primary first)", async () => {
	const start = render(SplitButton, {
		children: text("A"),
		"data-testid": "sb-start",
	});
	const startFirst = start.getByTestId("sb-start").element()
		.firstElementChild as HTMLElement;
	// no items -> secondary renders directly (no DropdownMenu wrapper)
	expect(startFirst.classList.contains("stuic-split-button-secondary")).toBe(true);

	const end = render(SplitButton, {
		children: text("B"),
		placement: "end",
		"data-testid": "sb-end",
	});
	const endEl = end.getByTestId("sb-end").element();
	await expect
		.element(end.getByTestId("sb-end"))
		.toHaveAttribute("data-placement", "end");
	expect(
		(endEl.firstElementChild as HTMLElement).classList.contains(
			"stuic-split-button-primary"
		)
	).toBe(true);
	expect(
		(endEl.lastElementChild as HTMLElement).classList.contains(
			"stuic-split-button-secondary"
		)
	).toBe(true);
});

test("divided mode: data-divided, divider element, secondary inherits intent/variant", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		divided: true,
		intent: "primary",
		variant: "solid",
		"data-testid": "sb",
	});
	const group = screen.getByTestId("sb");
	await expect.element(group).toHaveAttribute("data-divided", "true");
	expect(group.element().querySelector(".stuic-split-button-divider")).toBeTruthy();
	const secondary = screen.getByRole("button", { name: "More options" });
	await expect.element(secondary).toHaveAttribute("data-intent", "primary");
	await expect.element(secondary).toHaveAttribute("data-variant", "solid");
});

test("items: secondary gets menu ARIA wiring and opens/closes the dropdown", async () => {
	const items = baseItems();
	const screen = render(SplitButton, {
		children: text("Save"),
		items,
		"data-testid": "sb",
	});
	const secondary = screen.getByRole("button", { name: "More options" });
	await expect.element(secondary).toHaveAttribute("aria-haspopup", "menu");
	await expect.element(secondary).toHaveAttribute("aria-expanded", "false");
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();

	await secondary.click();
	await expect.element(secondary).toHaveAttribute("aria-expanded", "true");
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	await expect.element(screen.getByTestId("sb")).toHaveAttribute("data-open", "true");

	// Native click: selecting synchronously closes the menu (this node detaches), which
	// would orphan a Playwright actionability promise ("Cancelled"). See DropdownMenu tests.
	(screen.getByRole("menuitem", { name: "One" }).element() as HTMLElement).click();
	expect(items[0].onSelect).toHaveBeenCalledTimes(1);
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
	await expect.element(secondary).toHaveAttribute("aria-expanded", "false");
});

test("onSecondaryClick without items: callback fires, no menu ARIA, no dropdown", async () => {
	const onSecondaryClick = vi.fn();
	const screen = render(SplitButton, {
		children: text("Save"),
		onSecondaryClick,
	});
	const secondary = screen.getByRole("button", { name: "More options" });
	expect(secondary.element().getAttribute("aria-haspopup")).toBeNull();
	await secondary.click();
	expect(onSecondaryClick).toHaveBeenCalledTimes(1);
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("secondaryLabel renames the trigger; secondaryDisabled disables only the trigger", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		secondaryLabel: "Audio settings",
		secondaryDisabled: true,
	});
	const secondary = screen.getByRole("button", { name: "Audio settings" });
	await expect.element(secondary).toBeDisabled();
	await expect.element(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
});

test("disabled disables only the primary", async () => {
	const screen = render(SplitButton, { children: text("Save"), disabled: true });
	await expect.element(screen.getByRole("button", { name: "Save" })).toBeDisabled();
	await expect
		.element(screen.getByRole("button", { name: "More options" }))
		.not.toBeDisabled();
});

test("iconSwap drives the primary through bindable checked (roleSwitch)", async () => {
	const on = `<svg data-icon="on" viewBox="0 0 24 24"><path d="M1 1"/></svg>`;
	const off = `<svg data-icon="off" viewBox="0 0 24 24"><path d="M2 2"/></svg>`;
	const screen = render(SplitButton, {
		iconSwap: [on, off] as [string, string],
		roleSwitch: true,
		primaryProps: { "aria-label": "Mic" },
	});
	const primary = screen.getByRole("button", { name: "Mic" });
	await expect.element(primary).toHaveAttribute("data-icon-button", "true");
	await primary.click();
	await expect.element(primary).toHaveAttribute("data-checked", "true");
});

test("unstyled: no stuic classes/data-attrs on wrapper, forwarded to segments", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		unstyled: true,
		class: "custom",
		"data-testid": "sb",
	});
	const group = screen.getByTestId("sb");
	await expect.element(group).toHaveClass("custom");
	expect(group.element().classList.contains("stuic-split-button")).toBe(false);
	expect(group.element().hasAttribute("data-placement")).toBe(false);
	const primary = screen.getByRole("button", { name: "Save" });
	expect(primary.element().classList.contains("stuic-button")).toBe(false);
});

test("default caret chevron renders; custom secondaryIcon string replaces it", async () => {
	const withCaret = render(SplitButton, { children: text("A") });
	expect(
		withCaret
			.getByRole("button", { name: "More options" })
			.element()
			.querySelector(".stuic-split-button-caret svg")
	).toBeTruthy();

	const custom = render(SplitButton, {
		children: text("B"),
		secondaryLabel: "More B",
		secondaryIcon: `<svg data-icon="dots" viewBox="0 0 24 24"><path d="M3 3"/></svg>`,
	});
	const secondaryEl = custom.getByRole("button", { name: "More B" }).element();
	expect(secondaryEl.querySelector(".stuic-split-button-caret")).toBeNull();
	expect(secondaryEl.querySelector('svg[data-icon="dots"]')).toBeTruthy();
});

test("items takes precedence over onSecondaryClick when both are set", async () => {
	const onSecondaryClick = vi.fn();
	const screen = render(SplitButton, {
		children: text("Save"),
		items: baseItems(),
		onSecondaryClick,
	});
	const secondary = screen.getByRole("button", { name: "More options" });
	await secondary.click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	expect(onSecondaryClick).not.toHaveBeenCalled();
});

test("menuOpen: true mounts with the menu already open (external control)", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		items: baseItems(),
		menuOpen: true,
		"data-testid": "sb",
	});
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "More options" }))
		.toHaveAttribute("aria-expanded", "true");
	await expect.element(screen.getByTestId("sb")).toHaveAttribute("data-open", "true");
});

test("menuProps forwards to DropdownMenu (onOpen fires)", async () => {
	const onOpen = vi.fn();
	const screen = render(SplitButton, {
		children: text("Save"),
		items: baseItems(),
		menuProps: { onOpen },
	});
	await screen.getByRole("button", { name: "More options" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	expect(onOpen).toHaveBeenCalledTimes(1);
});

test("primaryProps/secondaryProps escape hatches win over top-level conveniences", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		variant: "solid",
		primaryProps: { variant: "outline" },
		secondaryProps: { variant: "soft", "aria-label": "Alt trigger" },
	});
	await expect
		.element(screen.getByRole("button", { name: "Save" }))
		.toHaveAttribute("data-variant", "outline");
	await expect
		.element(screen.getByRole("button", { name: "Alt trigger" }))
		.toHaveAttribute("data-variant", "soft");
});

test("items mode DOM order: DropdownMenu wrapper is the placement-start first child", async () => {
	const screen = render(SplitButton, {
		children: text("Save"),
		items: baseItems(),
		"data-testid": "sb",
	});
	const first = screen.getByTestId("sb").element().firstElementChild as HTMLElement;
	expect(first.classList.contains("stuic-split-button-menu")).toBe(true);
	expect(first.querySelector(".stuic-split-button-secondary")).toBeTruthy();
});
