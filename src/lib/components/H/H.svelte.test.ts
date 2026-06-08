import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import H from "./H.svelte";

// H renders a heading via <svelte:element this={h1..h6}>, so it HAS an ARIA
// `heading` role with a `level` — we locate with getByRole("heading", { level }).
// The semantic tag comes from `level` (tags[level-1]); `data-level` reflects the
// VISUAL level = renderLevel || level. Those two diverge when renderLevel is set,
// which is the core contract worth asserting (semantic tag vs. visual style level).
// See docs/component-testing/02-test-conventions.md.
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

test("defaults to level=2 -> renders an <h2> with the stuic-h base class", async () => {
	const screen = render(H, { children: text("Title") });
	const heading = screen.getByRole("heading", { level: 2 });
	await expect.element(heading).toBeInTheDocument();
	await expect.element(heading).toHaveClass("stuic-h");
});

test("level 1..6 -> semantic h1..h6 (getByRole heading level N) with matching data-level", async () => {
	for (const level of [1, 2, 3, 4, 5, 6] as const) {
		const screen = render(H, { level, children: text(`Level ${level}`) });
		const heading = screen.getByRole("heading", { level });
		await expect.element(heading).toBeInTheDocument();
		// with no renderLevel, visualLevel === level
		await expect.element(heading).toHaveAttribute("data-level", String(level));
	}
});

test("renderLevel overrides the VISUAL level (data-level) but not the semantic tag", async () => {
	// level=2 -> still <h2> (semantic heading level 2), but data-level reflects
	// renderLevel=5 (the visual level).
	const screen = render(H, {
		level: 2,
		renderLevel: 5,
		children: text("Visually small"),
	});
	const heading = screen.getByRole("heading", { level: 2 });
	await expect.element(heading).toBeInTheDocument();
	await expect.element(heading).toHaveAttribute("data-level", "5");
	// the semantic element is literally an <h2> (the tag comes from `level`, not
	// `renderLevel`) — assert the rendered tagName directly, complementing the role check
	expect(screen.container.querySelector("h2")).not.toBeNull();
	expect(screen.container.querySelector("h5")).toBeNull();
	// and it is NOT a level-5 heading semantically (ARIA role-level is browser-computed
	// from the <h2> tag, never from data-level)
	await expect.element(screen.getByRole("heading", { level: 5 })).not.toBeInTheDocument();
});

test("level=3 -> <h3 data-level=3>", async () => {
	const screen = render(H, { level: 3, children: text("Three") });
	const heading = screen.getByRole("heading", { level: 3 });
	await expect.element(heading).toBeInTheDocument();
	await expect.element(heading).toHaveAttribute("data-level", "3");
});

test("class override is twMerged -> keeps stuic-h AND adds the override class", async () => {
	const screen = render(H, { class: "my-heading-extra", children: text("Merged") });
	const heading = screen.getByRole("heading", { level: 2 });
	await expect.element(heading).toHaveClass("stuic-h");
	await expect.element(heading).toHaveClass("my-heading-extra");
});

test("children render inside the heading", async () => {
	const screen = render(H, { level: 4, children: text("Hello heading") });
	const heading = screen.getByRole("heading", { level: 4 });
	await expect.element(heading).toHaveTextContent("Hello heading");
});

test("unstyled=true drops the stuic-h base class and the data-level attribute", async () => {
	const screen = render(H, { level: 3, unstyled: true, children: text("Raw") });
	const heading = screen.getByRole("heading", { level: 3 });
	await expect.element(heading).toBeInTheDocument();
	await expect.element(heading).not.toHaveClass("stuic-h");
	await expect.element(heading).not.toHaveAttribute("data-level");
});
