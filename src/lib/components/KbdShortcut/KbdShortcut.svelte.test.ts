import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import KbdShortcut from "./KbdShortcut.svelte";

// KbdShortcut renders a plain <kbd class="stuic-kbd"> with no ARIA role, so we
// locate the root by its base class (like Avatar/Progress). The meta-key markup
// is produced ASYNC inside {#await get_meta_key() then ...} and injected via
// {@html}; it is never available synchronously, so every assertion that touches
// it goes through expect.element / expect.poll retries (no fixed sleeps).
// `forcedOs` pins the OS so the result is deterministic regardless of the runner
// UA (get_meta_key() would otherwise call isMac()).

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-kbd");
	if (!el) throw new Error("missing .stuic-kbd root");
	return page.elementLocator(el);
}

test("renders <kbd class=stuic-kbd> and the keys inside .stuic-kbd-key", async () => {
	const { container } = await render(KbdShortcut, { keys: "K" });
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-kbd");
	// keys are rendered inside <span class="stuic-kbd-key"> (not loose in the kbd)
	await expect
		.poll(() => container.querySelector(".stuic-kbd-key")?.textContent)
		.toContain("K");
	await expect.element(root).toHaveTextContent("K");
});

test("forcedOs=mac, metas=[cmd] -> ⌘ symbol in .stuic-kbd-symbol", async () => {
	const { container } = await render(KbdShortcut, {
		keys: "K",
		metas: ["cmd"],
		forcedOs: "mac",
	});
	const root = rootLocator(container);
	// the symbol span is injected async via {@html} -> poll for it, then assert the
	// symbol char lives *inside* .stuic-kbd-symbol (the brief: span "containing" ⌘),
	// not merely somewhere in the kbd (the keys live in a separate .stuic-kbd-key).
	await expect
		.poll(() => container.querySelector(".stuic-kbd-symbol")?.textContent)
		.toContain("⌘");
	await expect.element(root).toHaveTextContent("⌘");
	await expect.element(root).toHaveTextContent("K");
});

test("forcedOs=mac, metas=[shift] -> ⇧ symbol", async () => {
	const { container } = await render(KbdShortcut, {
		keys: "K",
		metas: ["shift"],
		forcedOs: "mac",
	});
	const root = rootLocator(container);
	await expect
		.poll(() => container.querySelector(".stuic-kbd-symbol")?.textContent)
		.toContain("⇧");
	await expect.element(root).toHaveTextContent("⇧");
});

test("forcedOs=win, metas=[cmd] remaps cmd->win -> ⊞ symbol", async () => {
	const { container } = await render(KbdShortcut, {
		keys: "K",
		metas: ["cmd"],
		forcedOs: "win",
	});
	const root = rootLocator(container);
	// macToOther maps cmd->win, otherSymbol[win] = "⊞"
	await expect
		.poll(() => container.querySelector(".stuic-kbd-symbol")?.textContent)
		.toContain("⊞");
	await expect.element(root).toHaveTextContent("⊞");
});

test("forcedOs=win, metas=[ctrl] has no win symbol -> falls back to Ctrl key (ucfirst)", async () => {
	const { container } = await render(KbdShortcut, {
		keys: "K",
		metas: ["ctrl"],
		forcedOs: "win",
	});
	const root = rootLocator(container);
	// otherSymbol has no entry for ctrl -> wrap() returns a .stuic-kbd-key, not a symbol.
	// Gate on the positive content first (expect.element retries until the async
	// {@html} resolves) so the subsequent absence check is not a premature false-pass.
	await expect.element(root).toHaveTextContent("Ctrl");
	// "Ctrl" lives in a .stuic-kbd-key span (the meta), plus the keys span -> at least 2
	await expect
		.poll(() => container.querySelectorAll(".stuic-kbd-key").length)
		.toBeGreaterThanOrEqual(2);
	// ucfirst("ctrl") -> "Ctrl" must be inside a .stuic-kbd-key, never a .stuic-kbd-symbol
	expect(
		[...container.querySelectorAll(".stuic-kbd-key")].some((n) =>
			n.textContent?.includes("Ctrl")
		)
	).toBe(true);
	expect(container.querySelector(".stuic-kbd-symbol")).toBeNull();
});

test("class override is twMerged onto stuic-kbd (both classes present)", async () => {
	const { container } = await render(KbdShortcut, {
		keys: "K",
		class: "my-kbd-extra",
	});
	const root = rootLocator(container);
	await expect.element(root).toHaveClass("stuic-kbd");
	await expect.element(root).toHaveClass("my-kbd-extra");
});
