import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Card from "./Card.svelte";

// Card's default form renders a plain <div class="stuic-card"> with no ARIA role,
// so we locate the root by its base class (like Avatar/Progress). With href it
// renders an <a> (role="link") and with onclick a <button> (role="button"), both
// carrying the EMPTY data-interactive attribute. GOTCHA: variant="horizontal"
// auto-switches to "vertical" when offsetWidth < horizontalThreshold (default 480);
// the test viewport is narrow, so horizontalThreshold={0} disables the auto-switch.
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-card");
	if (!el) throw new Error("missing .stuic-card root");
	return page.elementLocator(el);
}

test("default renders <div class=stuic-card> with data-variant=vertical", async () => {
	const { container } = await render(Card, { title: "Hello" });
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-card");
	// default variant -> vertical
	await expect.element(root).toHaveAttribute("data-variant", "vertical");
	// default case is a <div>: no link/button role
	expect(container.querySelector("a")).toBeNull();
	expect(container.querySelector("button")).toBeNull();
});

test("variant=horizontal + horizontalThreshold=0 -> data-variant=horizontal (auto-switch disabled)", async () => {
	// Without horizontalThreshold={0} the narrow test width would force vertical.
	const { container } = await render(Card, {
		variant: "horizontal",
		horizontalThreshold: 0,
		title: "Wide",
	});
	await expect
		.element(rootLocator(container))
		.toHaveAttribute("data-variant", "horizontal");
});

test("variant=horizontal WITHOUT threshold override auto-switches to vertical at narrow width (browser-only)", async () => {
	// Real Chromium gives the rendered root a non-zero offsetWidth, so bind:offsetWidth
	// feeds the $derived _effectiveVariant. To make the switch deterministic (independent
	// of the test viewport width) we pin the width to 200px via the style attribute, which
	// passes through `...rest` onto the root element. 200 < the default horizontalThreshold
	// (480) -> "horizontal" collapses to "vertical". This GOTCHA is the reason the
	// horizontalThreshold={0} escape hatch exists, and it only manifests in a real layout
	// engine (offsetWidth is 0 under jsdom/node). The assertion auto-retries because
	// offsetWidth is measured after first paint, so the attribute may start "horizontal".
	const { container } = await render(Card, {
		variant: "horizontal",
		title: "Wide",
		style: "width: 200px;",
	});
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-variant", "vertical");
});

test("title / eyebrow / description strings render into their wrapper classes", async () => {
	const { container } = await render(Card, {
		eyebrow: "Category",
		title: "The Title",
		description: "Some description",
	});
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Category")).toBeVisible();
	await expect.element(screen.getByText("The Title")).toBeVisible();
	await expect.element(screen.getByText("Some description")).toBeVisible();
	// each piece lands in its dedicated wrapper
	expect(container.querySelector(".stuic-card-eyebrow")).not.toBeNull();
	expect(container.querySelector(".stuic-card-title")).not.toBeNull();
	expect(container.querySelector(".stuic-card-description")).not.toBeNull();
});

test("image + imageAlt render an <img> inside .stuic-card-image", async () => {
	const { container } = await render(Card, {
		image: "https://example.com/x.png",
		imageAlt: "alt",
		title: "With image",
	});
	const imageWrap = container.querySelector(".stuic-card-image");
	expect(imageWrap).not.toBeNull();
	const img = page.elementLocator(imageWrap!.querySelector("img")!);
	await expect.element(img).toHaveAttribute("src", "https://example.com/x.png");
	await expect.element(img).toHaveAttribute("alt", "alt");
});

test("href renders an <a> (role=link) with empty data-interactive", async () => {
	const screen = render(Card, { href: "/go", title: "Linked" });
	const link = screen.getByRole("link");
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("href", "/go");
	await expect.element(link).toHaveClass("stuic-card");
	// data-interactive is an EMPTY attribute
	await expect.element(link).toHaveAttribute("data-interactive", "");
	// not a button
	expect(screen.container.querySelector("button")).toBeNull();
});

test("onclick renders a <button> (role=button) with empty data-interactive and fires once", async () => {
	const onclick = vi.fn();
	const screen = render(Card, { onclick, title: "Clickable" });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveClass("stuic-card");
	await expect.element(btn).toHaveAttribute("data-interactive", "");
	await btn.click();
	expect(onclick).toHaveBeenCalledOnce();
});

test("disabled button has the disabled attribute and empty data-disabled", async () => {
	const onclick = vi.fn();
	const screen = render(Card, { onclick, disabled: true, title: "Off" });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeDisabled();
	// data-disabled is an EMPTY attribute
	await expect.element(btn).toHaveAttribute("data-disabled", "");
});

test("renderFooter snippet renders into .stuic-card-footer", async () => {
	const { container } = await render(Card, {
		title: "Has footer",
		renderFooter: text("Footer content"),
	});
	const footer = container.querySelector(".stuic-card-footer");
	expect(footer).not.toBeNull();
	await expect.element(page.elementLocator(footer!)).toHaveTextContent("Footer content");
});

test("children snippet overrides the whole body: children shown, no <img> rendered", async () => {
	const { container } = await render(Card, {
		children: text("Custom body"),
		// image would normally render an <img>, but children replace the entire body
		image: "https://example.com/x.png",
		title: "Ignored title",
	});
	await expect.element(rootLocator(container)).toHaveTextContent("Custom body");
	// children short-circuit cardInner -> no image markup at all
	expect(container.querySelector("img")).toBeNull();
	expect(container.querySelector(".stuic-card-image")).toBeNull();
});

test("unstyled drops the stuic-card class and suppresses data-variant", async () => {
	const { container } = await render(Card, { unstyled: true, title: "Raw" });
	// no base class -> can't use rootLocator; the root is the first element child
	const root = container.firstElementChild as HTMLElement;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-card")).toBe(false);
	expect(root.hasAttribute("data-variant")).toBe(false);
});
