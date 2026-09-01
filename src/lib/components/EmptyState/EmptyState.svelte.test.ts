import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import EmptyState from "./EmptyState.svelte";

// EmptyState renders a plain <div class="stuic-empty-state"> with no ARIA role,
// so we locate the root by its base class (like Card/Avatar). Note: browser tests
// don't load the component index.css, so only structure/attributes are asserted
// here — never computed sizes.
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-empty-state");
	if (!el) throw new Error("missing .stuic-empty-state root");
	return page.elementLocator(el);
}

test("default renders <div class=stuic-empty-state> with data-variant=plain and data-size=md", async () => {
	const { container } = await render(EmptyState, { title: "Nothing here" });
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-empty-state");
	await expect.element(root).toHaveAttribute("data-variant", "plain");
	await expect.element(root).toHaveAttribute("data-size", "md");
});

test("title / description strings render into their wrapper classes", async () => {
	const { container } = await render(EmptyState, {
		title: "No results found",
		description: "Try adjusting your search.",
	});
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("No results found")).toBeVisible();
	await expect.element(screen.getByText("Try adjusting your search.")).toBeVisible();
	expect(container.querySelector(".stuic-empty-state-title")).not.toBeNull();
	expect(container.querySelector(".stuic-empty-state-description")).not.toBeNull();
});

test("icon as { html } renders the markup inside .stuic-empty-state-icon", async () => {
	const { container } = await render(EmptyState, {
		icon: { html: `<svg data-testid="ico"></svg>` },
		title: "With icon",
	});
	const iconWrap = container.querySelector(".stuic-empty-state-icon");
	expect(iconWrap).not.toBeNull();
	expect(iconWrap!.querySelector("svg[data-testid=ico]")).not.toBeNull();
});

test("renderIcon snippet wins over the icon prop", async () => {
	const { container } = await render(EmptyState, {
		icon: { html: `<svg data-testid="ignored"></svg>` },
		renderIcon: text("Custom icon"),
		title: "x",
	});
	const iconWrap = container.querySelector(".stuic-empty-state-icon");
	expect(iconWrap).not.toBeNull();
	await expect.element(page.elementLocator(iconWrap!)).toHaveTextContent("Custom icon");
	expect(iconWrap!.querySelector("svg")).toBeNull();
});

test("no icon prop and no renderIcon -> no icon wrapper at all", async () => {
	const { container } = await render(EmptyState, { title: "Bare" });
	expect(container.querySelector(".stuic-empty-state-icon")).toBeNull();
});

test("actions snippet renders into .stuic-empty-state-actions", async () => {
	const { container } = await render(EmptyState, {
		title: "No projects",
		actions: text("New project"),
	});
	const actions = container.querySelector(".stuic-empty-state-actions");
	expect(actions).not.toBeNull();
	await expect.element(page.elementLocator(actions!)).toHaveTextContent("New project");
});

test("variant and size props are reflected as data attributes", async () => {
	const { container } = await render(EmptyState, {
		variant: "dashed",
		size: "lg",
		title: "Boxed",
	});
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-variant", "dashed");
	await expect.element(root).toHaveAttribute("data-size", "lg");
});

test("children snippet overrides the whole default layout", async () => {
	const { container } = await render(EmptyState, {
		children: text("Custom body"),
		// would normally render into their wrappers, but children replace everything
		icon: { html: `<svg></svg>` },
		title: "Ignored title",
		description: "Ignored description",
	});
	await expect.element(rootLocator(container)).toHaveTextContent("Custom body");
	expect(container.querySelector(".stuic-empty-state-icon")).toBeNull();
	expect(container.querySelector(".stuic-empty-state-title")).toBeNull();
	expect(container.querySelector(".stuic-empty-state-description")).toBeNull();
});

test("rest props pass through (role=status for live announcement)", async () => {
	const { container } = await render(EmptyState, {
		title: "No results",
		role: "status",
	});
	await expect.element(rootLocator(container)).toHaveAttribute("role", "status");
});

test("class prop merges with the base class", async () => {
	const { container } = await render(EmptyState, { title: "x", class: "my-extra" });
	const root = rootLocator(container);
	await expect.element(root).toHaveClass("stuic-empty-state");
	await expect.element(root).toHaveClass("my-extra");
});

test("unstyled drops all stuic classes and suppresses data attributes", async () => {
	const { container } = await render(EmptyState, {
		unstyled: true,
		title: "Raw",
		actions: text("cta"),
	});
	// no base class -> can't use rootLocator; the root is the first element child
	const root = container.firstElementChild as HTMLElement;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-empty-state")).toBe(false);
	expect(root.hasAttribute("data-variant")).toBe(false);
	expect(root.hasAttribute("data-size")).toBe(false);
	expect(container.querySelector(".stuic-empty-state-title")).toBeNull();
	expect(container.querySelector(".stuic-empty-state-actions")).toBeNull();
});
