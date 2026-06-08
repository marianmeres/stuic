import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./focus-trap.fixture.svelte";

// The focus-trap action is pure focus management — jsdom can't observe it, real Chromium
// can. This is the proof deferred from the anchor-position hard proof into the
// portals/focus-trap backlog (#16). The action auto-focuses the first focusable element on
// mount and wraps Tab/Shift+Tab between the first and last focusable descendants. Its Tab
// handlers key off KeyboardEvent.code === "Tab" (not .key), so we dispatch with { code }.

test("auto-focuses the first focusable element on mount", async () => {
	const screen = await render(Fixture);
	await expect.element(screen.getByTestId("first")).toHaveFocus();
});

test("Tab on the last element wraps focus back to the first", async () => {
	const screen = await render(Fixture);
	const last = screen.getByTestId("last").element() as HTMLElement;
	last.focus();
	await expect.element(screen.getByTestId("last")).toHaveFocus();
	// The action's keydown listener lives on the last element; Tab there wraps to first.
	last.dispatchEvent(new KeyboardEvent("keydown", { code: "Tab", bubbles: true }));
	await expect.element(screen.getByTestId("first")).toHaveFocus();
});

test("Shift+Tab on the first element wraps focus to the last", async () => {
	const screen = await render(Fixture);
	const first = screen.getByTestId("first").element() as HTMLElement;
	first.focus();
	await expect.element(screen.getByTestId("first")).toHaveFocus();
	first.dispatchEvent(
		new KeyboardEvent("keydown", { code: "Tab", shiftKey: true, bubbles: true })
	);
	await expect.element(screen.getByTestId("last")).toHaveFocus();
});

test("autoFocusFirst=false leaves focus unmoved on mount", async () => {
	const screen = await render(Fixture, { autoFocusFirst: false });
	await expect.element(screen.getByTestId("first")).not.toHaveFocus();
});

test("enabled=false installs no trap (Tab on last does not wrap)", async () => {
	const screen = await render(Fixture, { enabled: false, autoFocusFirst: false });
	const last = screen.getByTestId("last").element() as HTMLElement;
	last.focus();
	last.dispatchEvent(new KeyboardEvent("keydown", { code: "Tab", bubbles: true }));
	// No trap wired -> the wrap-to-first never happens; the last element keeps focus.
	await expect.element(screen.getByTestId("last")).toHaveFocus();
});
