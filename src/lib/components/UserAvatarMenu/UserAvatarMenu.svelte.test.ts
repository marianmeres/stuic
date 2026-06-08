import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import UserAvatarMenu from "./UserAvatarMenu.svelte";

// UserAvatarMenu wraps DropdownMenu. It is bindable-driven (the default trigger
// is a <button aria-label> calling DropdownMenu's `toggle`), so we can render it
// directly and click the trigger — no imperative fixture needed. Contracts a real
// browser proves here:
//   - the trigger aria-label flips on auth state ("User menu" vs "Sign in");
//   - clicking the trigger opens role="menu" (slide transition ~100ms, so always
//     assert presence/absence via expect.element auto-retry, never a sync read);
//   - items are built from identity + actions and render as role="menuitem"
//     through ListItemButton (NOT role="button"); only provided handlers appear;
//   - selecting an action fires its spy once and closes the menu
//     (DropdownMenu closeOnSelect defaults true).
// We assert the color-scheme item exists by /mode/i (matches "Light mode" or
// "Dark mode") without toggling the shared global ColorScheme state.

test("AUTHED: trigger exposes aria-label 'User menu' and starts collapsed", async () => {
	const screen = render(UserAvatarMenu, {
		identity: { email: "ada@x.io" },
		actions: { onLogout: vi.fn() },
	});
	const trigger = screen.getByRole("button", { name: "User menu" });
	await expect.element(trigger).toBeInTheDocument();
	// defaultTrigger spreads DropdownMenu's triggerProps onto the button, so the
	// ARIA menu-button contract holds: collapsed before any click.
	await expect.element(trigger).toHaveAttribute("aria-haspopup", "menu");
	await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
	// Menu is closed until the trigger is clicked.
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("AUTHED: clicking the trigger opens the menu, shows the email header and a Logout menuitem", async () => {
	const screen = render(UserAvatarMenu, {
		identity: { email: "ada@x.io" },
		actions: { onLogout: vi.fn() },
	});

	const trigger = screen.getByRole("button", { name: "User menu" });
	await trigger.click();

	await expect.element(screen.getByRole("menu")).toBeInTheDocument();
	// Open state flows back through bind:isOpen -> triggerProps -> the button.
	await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
	// Header tile renders identity.email (name ?? email).
	await expect.element(screen.getByText("ada@x.io")).toBeInTheDocument();
	// Items render through ListItemButton with role="menuitem", not role="button".
	await expect
		.element(screen.getByRole("menuitem", { name: /logout/i }))
		.toBeInTheDocument();
});

test("AUTHED: clicking Logout fires onLogout once and closes the menu", async () => {
	const onLogout = vi.fn();
	const screen = render(UserAvatarMenu, {
		identity: { email: "ada@x.io" },
		actions: { onLogout },
	});

	await screen.getByRole("button", { name: "User menu" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Native click: selecting synchronously closes the menu (node detaches), which would
	// orphan a Playwright actionability promise ("Cancelled"). Native click is synchronous.
	(screen.getByRole("menuitem", { name: /logout/i }).element() as HTMLElement).click();

	expect(onLogout).toHaveBeenCalledOnce();
	// closeOnSelect defaults true -> menu closes (transition lingers, so auto-retry).
	await expect.element(screen.getByRole("menu")).not.toBeInTheDocument();
});

test("AUTHED: a color-scheme menuitem renders by default (Light/Dark mode)", async () => {
	const screen = render(UserAvatarMenu, {
		identity: { email: "ada@x.io" },
		actions: { onLogout: vi.fn() },
	});

	await screen.getByRole("button", { name: "User menu" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Label is "Light mode" or "Dark mode" depending on ColorScheme.current; both
	// match /mode/i. We do NOT click it (avoid mutating shared ColorScheme state).
	await expect
		.element(screen.getByRole("menuitem", { name: /mode/i }))
		.toBeInTheDocument();
});

test("UNAUTH: trigger exposes aria-label 'Sign in'", async () => {
	const screen = render(UserAvatarMenu, {
		identity: null,
		actions: { onLogin: vi.fn(), onRegister: vi.fn() },
	});
	await expect
		.element(screen.getByRole("button", { name: "Sign in" }))
		.toBeInTheDocument();
});

test("UNAUTH: open shows Login and Register menuitems", async () => {
	const screen = render(UserAvatarMenu, {
		identity: null,
		actions: { onLogin: vi.fn(), onRegister: vi.fn() },
	});

	await screen.getByRole("button", { name: "Sign in" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	await expect
		.element(screen.getByRole("menuitem", { name: "Login" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("menuitem", { name: "Register" }))
		.toBeInTheDocument();
});

test("UNAUTH: only provided handlers appear (no Logout menuitem)", async () => {
	const screen = render(UserAvatarMenu, {
		identity: null,
		actions: { onLogin: vi.fn() },
	});

	await screen.getByRole("button", { name: "Sign in" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	await expect
		.element(screen.getByRole("menuitem", { name: "Login" }))
		.toBeInTheDocument();
	// onRegister was not passed -> no Register item; onLogout is auth-only.
	// screen.getByRole already scans the whole rendered document, so a regex
	// matching either label resolving to zero matches proves both are absent.
	await expect
		.element(screen.getByRole("menuitem", { name: /register|logout/i }))
		.not.toBeInTheDocument();
});

test("UNAUTH: clicking Login fires onLogin once", async () => {
	const onLogin = vi.fn();
	const screen = render(UserAvatarMenu, {
		identity: null,
		actions: { onLogin },
	});

	await screen.getByRole("button", { name: "Sign in" }).click();
	await expect.element(screen.getByRole("menu")).toBeInTheDocument();

	// Native click: selecting synchronously closes the menu (node detaches), which would
	// orphan a Playwright actionability promise ("Cancelled"). Native click is synchronous.
	(screen.getByRole("menuitem", { name: "Login" }).element() as HTMLElement).click();

	expect(onLogin).toHaveBeenCalledOnce();
});
