import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Stat from "./Stat.svelte";

// Stat's default form renders a plain <div class="stuic-stat"> with no ARIA role,
// so we locate the root by its base class (like Card/Avatar). With href it renders
// an <a> (role="link") and with onclick a <button> (role="button"), both carrying
// the EMPTY data-interactive attribute. The delta color is driven by the root's
// data-trend-intent attribute, which resolves from trendIntent ("auto" maps
// up→success, down→destructive, flat/none→neutral).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-stat");
	if (!el) throw new Error("missing .stuic-stat root");
	return page.elementLocator(el);
}

test("default renders <div class=stuic-stat> with label/value/hint in their wrappers", async () => {
	const { container } = await render(Stat, {
		label: "Revenue",
		value: "$45,231.89",
		hint: "vs. last month",
	});
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-stat");
	// default case is a <div>: no link/button role
	expect(container.querySelector("a")).toBeNull();
	expect(container.querySelector("button")).toBeNull();
	// each piece lands in its dedicated wrapper
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Revenue")).toBeVisible();
	await expect.element(screen.getByText("$45,231.89")).toBeVisible();
	await expect.element(screen.getByText("vs. last month")).toBeVisible();
	expect(container.querySelector(".stuic-stat-label")).not.toBeNull();
	expect(container.querySelector(".stuic-stat-value")).not.toBeNull();
	expect(container.querySelector(".stuic-stat-hint")).not.toBeNull();
});

test("numeric value and delta are accepted and rendered", async () => {
	const { container } = await render(Stat, { label: "Users", value: 1234, delta: -5 });
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("1234")).toBeVisible();
	await expect.element(screen.getByText("-5")).toBeVisible();
});

test("trend=up (auto intent) -> data-trend=up, data-trend-intent=success, arrow svg present", async () => {
	const { container } = await render(Stat, {
		value: "100",
		delta: "+20.1%",
		trend: "up",
	});
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-trend", "up");
	await expect.element(root).toHaveAttribute("data-trend-intent", "success");
	expect(container.querySelector(".stuic-stat-trend-arrow svg")).not.toBeNull();
});

test("trend=down (auto intent) -> data-trend-intent=destructive", async () => {
	const { container } = await render(Stat, { value: "100", delta: "-3%", trend: "down" });
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-trend", "down");
	await expect.element(root).toHaveAttribute("data-trend-intent", "destructive");
});

test("trend=flat (auto intent) -> data-trend-intent=neutral", async () => {
	const { container } = await render(Stat, { value: "100", delta: "0%", trend: "flat" });
	await expect
		.element(rootLocator(container))
		.toHaveAttribute("data-trend-intent", "neutral");
});

test("explicit trendIntent overrides auto mapping (down can be good: churn)", async () => {
	const { container } = await render(Stat, {
		value: "2.1%",
		delta: "-0.4%",
		trend: "down",
		trendIntent: "success",
	});
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-trend", "down");
	await expect.element(root).toHaveAttribute("data-trend-intent", "success");
});

test("showTrendArrow=false renders no arrow but keeps the delta", async () => {
	const { container } = await render(Stat, {
		value: "100",
		delta: "+1%",
		trend: "up",
		showTrendArrow: false,
	});
	expect(container.querySelector(".stuic-stat-trend-arrow")).toBeNull();
	await expect.element(page.elementLocator(container).getByText("+1%")).toBeVisible();
});

test("no trend and no delta -> no data-trend, no data-trend-intent, no meta row", async () => {
	const { container } = await render(Stat, { label: "Plain", value: "42" });
	const root = container.querySelector(".stuic-stat")!;
	expect(root.hasAttribute("data-trend")).toBe(false);
	expect(root.hasAttribute("data-trend-intent")).toBe(false);
	expect(container.querySelector(".stuic-stat-meta")).toBeNull();
});

test("href renders an <a> (role=link) with empty data-interactive", async () => {
	const screen = render(Stat, { href: "/details", label: "Linked", value: "7" });
	const link = screen.getByRole("link");
	await expect.element(link).toBeInTheDocument();
	await expect.element(link).toHaveAttribute("href", "/details");
	await expect.element(link).toHaveClass("stuic-stat");
	// data-interactive is an EMPTY attribute
	await expect.element(link).toHaveAttribute("data-interactive", "");
	expect(screen.container.querySelector("button")).toBeNull();
});

test("onclick renders a <button> (role=button) with empty data-interactive and fires once", async () => {
	const onclick = vi.fn();
	const screen = render(Stat, { onclick, label: "Clickable", value: "7" });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveClass("stuic-stat");
	await expect.element(btn).toHaveAttribute("data-interactive", "");
	await btn.click();
	expect(onclick).toHaveBeenCalledOnce();
});

test("disabled button has the disabled attribute and empty data-disabled", async () => {
	const onclick = vi.fn();
	const screen = render(Stat, { onclick, disabled: true, value: "0" });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeDisabled();
	// data-disabled is an EMPTY attribute
	await expect.element(btn).toHaveAttribute("data-disabled", "");
});

test("renderIcon renders into .stuic-stat-icon, renderFooter into .stuic-stat-footer", async () => {
	const { container } = await render(Stat, {
		label: "With extras",
		value: "9",
		renderIcon: text("ICON"),
		renderFooter: text("FOOTER"),
	});
	const icon = container.querySelector(".stuic-stat-icon");
	const footer = container.querySelector(".stuic-stat-footer");
	expect(icon).not.toBeNull();
	expect(footer).not.toBeNull();
	await expect.element(page.elementLocator(icon!)).toHaveTextContent("ICON");
	await expect.element(page.elementLocator(footer!)).toHaveTextContent("FOOTER");
});

test("children snippet overrides the whole body: no value/label wrappers rendered", async () => {
	const { container } = await render(Stat, {
		children: text("Custom body"),
		// these would normally render, but children replace the entire body
		label: "Ignored",
		value: "123",
		delta: "+1%",
		trend: "up",
	});
	await expect.element(rootLocator(container)).toHaveTextContent("Custom body");
	expect(container.querySelector(".stuic-stat-label")).toBeNull();
	expect(container.querySelector(".stuic-stat-value")).toBeNull();
	expect(container.querySelector(".stuic-stat-delta")).toBeNull();
});

test("unstyled drops the stuic-stat class and suppresses data attributes", async () => {
	const { container } = await render(Stat, {
		unstyled: true,
		label: "Raw",
		value: "1",
		delta: "+1%",
		trend: "up",
	});
	// no base class -> can't use rootLocator; the root is the first element child
	const root = container.firstElementChild as HTMLElement;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-stat")).toBe(false);
	expect(root.hasAttribute("data-trend")).toBe(false);
	expect(root.hasAttribute("data-trend-intent")).toBe(false);
});
