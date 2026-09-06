import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import Thc, { isTHCNotEmpty, getTHCStringContent, type THC } from "./Thc.svelte";

const snippet = createRawSnippet(() => ({ render: () => `<i>snip</i>` }));

// ============================================================================
// isTHCNotEmpty — must cover every form `Thc` itself can render
// ============================================================================

test("isTHCNotEmpty is true for every renderable form", () => {
	expect(isTHCNotEmpty("Hello")).toBe(true);
	expect(isTHCNotEmpty({ text: "Hi" })).toBe(true);
	expect(isTHCNotEmpty({ html: "<b>X</b>" })).toBe(true);
	expect(isTHCNotEmpty({ component: Thc })).toBe(true);
	// the two that used to report empty, so guarded call sites dropped them
	expect(isTHCNotEmpty(snippet)).toBe(true);
	expect(isTHCNotEmpty({ snippet })).toBe(true);
});

test("isTHCNotEmpty is false for absent or blank content", () => {
	expect(isTHCNotEmpty(undefined)).toBe(false);
	expect(isTHCNotEmpty(null)).toBe(false);
	expect(isTHCNotEmpty("")).toBe(false);
	expect(isTHCNotEmpty({ text: "" })).toBe(false);
	expect(isTHCNotEmpty({ html: "" })).toBe(false);
	// no renderable key at all
	expect(isTHCNotEmpty({} as THC)).toBe(false);
});

test("the guard agrees with what Thc actually renders", async () => {
	// the contract that makes the guard usable: guard true => Thc renders something
	for (const thc of [
		"Hello",
		{ text: "Hi" },
		{ html: "<b>X</b>" },
		snippet,
		{ snippet },
	] as THC[]) {
		expect(isTHCNotEmpty(thc)).toBe(true);
		const { container, unmount } = await render(Thc, { thc });
		expect(container.textContent?.trim()).not.toBe("");
		unmount();
	}
});

// ============================================================================
// getTHCStringContent — unchanged, and deliberately NOT a renderer
// ============================================================================

test("getTHCStringContent returns the html SOURCE and nothing for snippets", () => {
	expect(getTHCStringContent("Hello")).toBe("Hello");
	expect(getTHCStringContent({ text: "Hi" })).toBe("Hi");
	// documented: the source, not the text — do not use it to render a label
	expect(getTHCStringContent({ html: "<b>X</b>" })).toBe("<b>X</b>");
	expect(getTHCStringContent(snippet)).toBe("");
	expect(getTHCStringContent(null)).toBe("");
});

// ============================================================================
// Thc renders snippets in both forms
// ============================================================================

test("Thc renders a bare snippet and the { snippet } form", async () => {
	const bare = await render(Thc, { thc: snippet });
	expect(bare.container.querySelector("i")?.textContent).toBe("snip");
	bare.unmount();

	const wrapped = await render(Thc, { thc: { snippet } });
	expect(wrapped.container.querySelector("i")?.textContent).toBe("snip");
});
