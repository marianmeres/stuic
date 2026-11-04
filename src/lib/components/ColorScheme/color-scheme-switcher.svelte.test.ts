import { render } from "vitest-browser-svelte";
import { beforeEach, expect, test, vi } from "vitest";
import ColorSchemeSwitcher from "./ColorSchemeSwitcher.svelte";
import { ColorScheme } from "./color-scheme.svelte.js";

// ColorSchemeSwitcher is a ButtonGroupRadio wired to the ColorScheme runtime: one
// role="radio" per offered preference, named System / Light mode / Dark mode, the
// active one mirroring `ColorScheme.preference` (or `.current` for a light/dark
// pair). The runtime is a module singleton (same caveats as
// color-scheme.svelte.test.ts), so beforeEach resets every piece of shared state,
// and `matchMedia` is stubbed so "system" resolves the same on every machine.

const KEY = "stuic-color-scheme";

function fakeOs(dark: boolean) {
	let matches = dark;
	const listeners = new Set<() => void>();
	const mql = {
		get matches() {
			return matches;
		},
		addEventListener: (_type: string, fn: () => void) => listeners.add(fn),
		removeEventListener: (_type: string, fn: () => void) => listeners.delete(fn),
	};
	vi.stubGlobal("matchMedia", () => mql);
	return {
		set(next: boolean) {
			matches = next;
			for (const fn of listeners) fn();
		},
	};
}

beforeEach(() => {
	ColorScheme.configure({ followSystem: false });
	vi.unstubAllGlobals();
	localStorage.removeItem(KEY);
	document.documentElement.classList.remove("dark");
	ColorScheme.reset();
});

const isDark = () => document.documentElement.classList.contains("dark");

test("one radio per preference, named for assistive tech, in a named radiogroup; icon-only has no visible text", async () => {
	const screen = await render(ColorSchemeSwitcher);
	const group = screen.getByRole("radiogroup", { name: "Color scheme" });
	await expect.element(group).toHaveClass("stuic-color-scheme-switcher");
	await expect.element(group).toHaveClass("stuic-button-group");

	const system = screen.getByRole("radio", { name: "System" });
	await expect.element(system).toBeInTheDocument();
	await expect
		.element(screen.getByRole("radio", { name: "Light mode" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("radio", { name: "Dark mode" }))
		.toBeInTheDocument();

	// icon-only: the name is the aria-label, the content is just the SVG
	await expect.element(system).toHaveAttribute("aria-label", "System");
	await expect.element(system).toHaveTextContent("");
	expect(system.element().querySelector("svg")).not.toBeNull();
});

test("nothing stored -> System is the active segment", async () => {
	const screen = await render(ColorSchemeSwitcher);
	await expect
		.element(screen.getByRole("radio", { name: "System" }))
		.toHaveAttribute("aria-checked", "true");
	await expect
		.element(screen.getByRole("radio", { name: "Light mode" }))
		.toHaveAttribute("aria-checked", "false");
});

test("the active segment is the stored preference at mount", async () => {
	fakeOs(false);
	ColorScheme.setPreference("dark");
	const screen = await render(ColorSchemeSwitcher);
	await expect
		.element(screen.getByRole("radio", { name: "Dark mode" }))
		.toHaveAttribute("aria-checked", "true");
	await expect
		.element(screen.getByRole("radio", { name: "System" }))
		.toHaveAttribute("aria-checked", "false");
});

test("clicking a segment persists the preference, paints <html> and moves aria-checked; System hands back to the OS", async () => {
	const os = fakeOs(true);
	const screen = await render(ColorSchemeSwitcher);
	const system = screen.getByRole("radio", { name: "System" });
	const light = screen.getByRole("radio", { name: "Light mode" });
	const dark = screen.getByRole("radio", { name: "Dark mode" });

	await dark.click();
	await expect.element(dark).toHaveAttribute("aria-checked", "true");
	await expect.element(system).toHaveAttribute("aria-checked", "false");
	expect(localStorage.getItem(KEY)).toBe("dark");
	expect(ColorScheme.preference).toBe("dark");
	expect(isDark()).toBe(true);

	await light.click();
	await expect.element(light).toHaveAttribute("aria-checked", "true");
	expect(localStorage.getItem(KEY)).toBe("light");
	expect(isDark()).toBe(false);

	// "System" clears the stored value and follows the (fake, dark) OS from now on
	await system.click();
	await expect.element(system).toHaveAttribute("aria-checked", "true");
	expect(localStorage.getItem(KEY)).toBeNull();
	expect(ColorScheme.preference).toBe("system");
	expect(ColorScheme.followsSystem).toBe(true);
	expect(isDark()).toBe(true);
	os.set(false);
	expect(isDark()).toBe(false);
	// the OS flipping does not make the choice explicit: System stays active
	await expect.element(system).toHaveAttribute("aria-checked", "true");
});

test("an outside change moves the active segment (REACTIVITY): setPreference() and another tab's storage event", async () => {
	fakeOs(false);
	const screen = await render(ColorSchemeSwitcher);
	const light = screen.getByRole("radio", { name: "Light mode" });
	const dark = screen.getByRole("radio", { name: "Dark mode" });

	// e.g. UserAvatarMenu's Appearance group in the same page
	ColorScheme.setPreference("light");
	await expect.element(light).toHaveAttribute("aria-checked", "true");

	// what another tab's setPreference("dark") leaves behind, then the event this tab gets
	localStorage.setItem(KEY, "dark");
	window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: "dark" }));
	await expect.element(dark).toHaveAttribute("aria-checked", "true");
	await expect.element(light).toHaveAttribute("aria-checked", "false");
});

test("arrow keys move the preference too (the group's keyboard contract routes through setPreference)", async () => {
	fakeOs(false);
	const screen = await render(ColorSchemeSwitcher);
	const system = screen.getByRole("radio", { name: "System" });
	await expect.element(system).toHaveAttribute("aria-checked", "true");

	system
		.element()
		.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

	await expect
		.element(screen.getByRole("radio", { name: "Light mode" }))
		.toHaveAttribute("aria-checked", "true");
	expect(ColorScheme.preference).toBe("light");
	expect(localStorage.getItem(KEY)).toBe("light");
});

test("showLabels renders the text next to the icon; the text (not aria-label) names the radio", async () => {
	const screen = await render(ColorSchemeSwitcher, { showLabels: true });
	const dark = screen.getByRole("radio", { name: "Dark mode" });
	await expect.element(dark).toHaveTextContent("Dark mode");
	await expect.element(dark).not.toHaveAttribute("aria-label");
	expect(dark.element().querySelector("svg")).not.toBeNull();
});

test("labels translate the group and the segments", async () => {
	const screen = await render(ColorSchemeSwitcher, {
		labels: { group: "Vzhľad", system: "Systém", light: "Svetlý", dark: "Tmavý" },
	});
	await expect
		.element(screen.getByRole("radiogroup", { name: "Vzhľad" }))
		.toBeInTheDocument();
	await expect.element(screen.getByRole("radio", { name: "Systém" })).toBeInTheDocument();
	await expect.element(screen.getByRole("radio", { name: "Svetlý" })).toBeInTheDocument();
	await expect.element(screen.getByRole("radio", { name: "Tmavý" })).toBeInTheDocument();
});

test("a light/dark pair (no System) mirrors what is on screen, and clicking stores the choice", async () => {
	const screen = await render(ColorSchemeSwitcher, { options: ["light", "dark"] });
	await expect
		.element(screen.getByRole("radio", { name: "System" }))
		.not.toBeInTheDocument();
	const light = screen.getByRole("radio", { name: "Light mode" });
	const dark = screen.getByRole("radio", { name: "Dark mode" });

	// nothing stored and the page is light -> Light is active, not "no segment"
	expect(ColorScheme.preference).toBe("system");
	await expect.element(light).toHaveAttribute("aria-checked", "true");

	await dark.click();
	await expect.element(dark).toHaveAttribute("aria-checked", "true");
	expect(localStorage.getItem(KEY)).toBe("dark");
	expect(isDark()).toBe(true);
});

test("disabled disables every segment", async () => {
	const screen = await render(ColorSchemeSwitcher, { disabled: true });
	await expect.element(screen.getByRole("radio", { name: "System" })).toBeDisabled();
	await expect.element(screen.getByRole("radio", { name: "Light mode" })).toBeDisabled();
	await expect.element(screen.getByRole("radio", { name: "Dark mode" })).toBeDisabled();
});

test("class merges onto the radiogroup, icons override the markup, unstyled drops the component class", async () => {
	const screen = await render(ColorSchemeSwitcher, {
		class: "my-switcher",
		icons: { dark: '<svg data-testid="custom-moon"></svg>' },
	});
	const group = screen.getByRole("radiogroup");
	await expect.element(group).toHaveClass("stuic-color-scheme-switcher");
	await expect.element(group).toHaveClass("my-switcher");
	await expect.element(screen.getByTestId("custom-moon")).toBeInTheDocument();
	await screen.unmount();

	const plain = await render(ColorSchemeSwitcher, { unstyled: true });
	await expect
		.element(plain.getByRole("radiogroup"))
		.not.toHaveClass("stuic-color-scheme-switcher");
});
