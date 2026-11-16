import { render } from "vitest-browser-svelte";
import { expect, test, beforeAll, beforeEach } from "vitest";
import Nav from "./Nav.svelte";
import type { NavGroup } from "./Nav.svelte";
// Geometry of the collapsed section title, so this file needs the real stylesheet
// (Nav.svelte.test.ts deliberately loads none).
import "./index.css";

// In the collapsed rail the section title is hidden but keeps its height, which is
// the gap between sections. A hidden box still has its full layout width, so a label
// wider than the rail used to overflow sideways, and a vertically scrolling ancestor
// (overflow-x: visible computes to auto beside overflow-y: auto) grew a horizontal
// scrollbar. The fixture is a 64px rail with 8px side padding, like a real sidebar.

beforeAll(() => {
	// No Tailwind preflight in component tests: give the rail the border-box sizing
	// every real consumer has, or `width: 100%` plus padding overflows on its own.
	const style = document.createElement("style");
	style.textContent = ".rail, .rail * { box-sizing: border-box; }";
	document.head.append(style);
});

beforeEach(() => localStorage.clear());

const groups: NavGroup[] = [{ title: "Stock", items: [] }];

async function renderInRail(props: Record<string, unknown>) {
	const screen = await render(Nav, {
		groups,
		isCollapsed: true,
		persistState: false,
		...props,
	});
	const rail = screen.container as HTMLElement;
	rail.className = "rail";
	rail.style.cssText = "width: 64px; height: 400px; overflow-y: auto; padding: 0 8px;";
	const title = rail.querySelector(".stuic-nav-section-title") as HTMLElement;
	expect(title).not.toBeNull();
	expect(title.hasAttribute("data-collapsed")).toBe(true);
	return { rail, title };
}

test("collapsible title wider than the rail does not scroll the rail sideways", async () => {
	const { rail, title } = await renderInRail({
		title: "Warehouse",
		collapsibleTitle: true,
	});
	// the label span really is wider than the rail's content box...
	const label = title.querySelector("span:last-child") as HTMLElement;
	expect(label.offsetWidth).toBeGreaterThan(48);
	// ...yet it is clipped inside the title, so the rail has nothing to scroll
	expect(rail.scrollWidth).toBe(rail.clientWidth);
	// the space is kept: the title still takes up height
	expect(title.offsetHeight).toBeGreaterThan(0);
});

test("static title with one long word does not scroll the rail sideways", async () => {
	const { rail, title } = await renderInRail({ title: "Warehousemanagement" });
	expect(title.tagName).toBe("SPAN");
	expect(rail.scrollWidth).toBe(rail.clientWidth);
	expect(title.offsetHeight).toBeGreaterThan(0);
});

test("multi-word static title stays one line, so the gap does not grow", async () => {
	const short = await renderInRail({ title: "Stock" });
	const long = await renderInRail({ title: "Planning and warehouse" });
	expect(short.title.offsetHeight).toBeGreaterThan(0);
	expect(long.title.offsetHeight).toBe(short.title.offsetHeight);
});
