import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import ListGroup, { type ListGroupSnippetArg } from "./ListGroup.svelte";
import ListGroupFixture from "./ListGroup.fixture.svelte";
// the layout tests at the bottom need the real stylesheet; the rest do not care
import "./index.css";

// ListGroup renders <div.stuic-list-group> › optional header <div> › <ul role="list"> ›
// <li> per row › optional footer <div>. The root has no role of its own, so it is located
// by its base class. The row CSS selects STRUCTURALLY (`> li`, `> li > a:only-child`),
// which is why the hand-written `children` form is exercised against the same numbers.

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

const ROOT = "div.stuic-list-group";
const rows = (c: HTMLElement) => [...c.querySelectorAll<HTMLLIElement>("ul > li")];
const texts = (els: Element[]) => els.map((el) => el.textContent?.trim());

// ============================================================================
// structure + data form
// ============================================================================

test("renders root › ul[role=list] › li per item, strings as text", async () => {
	const { container } = await render(ListGroup, { items: ["Alpha", "Beta"] });
	const root = container.querySelector(ROOT)!;
	expect(root).not.toBeNull();
	const ul = root.querySelector(":scope > ul")!;
	expect(ul.getAttribute("role")).toBe("list");
	expect(ul.classList.contains("stuic-list-group-list")).toBe(true);
	expect(texts(rows(container))).toEqual(["Alpha", "Beta"]);
	rows(container).forEach((li) =>
		expect(li.classList.contains("stuic-list-group-item")).toBe(true)
	);
	await expect.element(page.getByRole("listitem")).toHaveLength(2);
});

test("renderItem receives { item, index }", async () => {
	const renderItem = createRawSnippet<[ListGroupSnippetArg<{ name: string }>]>((arg) => ({
		render: () => `<span>${arg().index}:${arg().item.name}</span>`,
	}));
	const { container } = await render(ListGroup<{ name: string }>, {
		items: [{ name: "a" }, { name: "b" }],
		renderItem,
	});
	expect(texts(rows(container))).toEqual(["0:a", "1:b"]);
});

test("getItemId keys the rows: a reorder moves the same <li> nodes", async () => {
	const items = [
		{ id: "a", name: "A" },
		{ id: "b", name: "B" },
	];
	const renderItem = createRawSnippet<[ListGroupSnippetArg<{ name: string }>]>((arg) => ({
		render: () => `<span>${arg().item.name}</span>`,
	}));
	const { container, rerender } = await render(ListGroup<(typeof items)[number]>, {
		items,
		renderItem,
		getItemId: (item) => item.id,
	});
	const [liA, liB] = rows(container);
	await rerender({ items: [items[1], items[0]] });
	const after = rows(container);
	expect(texts(after)).toEqual(["B", "A"]);
	expect(after[0]).toBe(liB);
	expect(after[1]).toBe(liA);
});

test("itemProps attributes land on the <li>; its class merges after classItem", async () => {
	const { container } = await render(ListGroup<{ id: number; short: number }>, {
		items: [
			{ id: 1, short: 0 },
			{ id: 2, short: 3 },
		],
		classItem: "px-2 item-x",
		itemProps: (line) => ({
			"data-line": "",
			"data-booking-id": line.id,
			"data-short": line.short || null,
			class: "px-4",
		}),
	});
	const [a, b] = rows(container);
	expect(a.getAttribute("data-line")).toBe("");
	expect(a.getAttribute("data-booking-id")).toBe("1");
	// null omits the attribute — the `data-short={line.short || null}` idiom
	expect(a.hasAttribute("data-short")).toBe(false);
	expect(b.getAttribute("data-short")).toBe("3");
	// twMerge: the per-row class wins the conflict, the rest survives
	expect(a.classList.contains("px-4")).toBe(true);
	expect(a.classList.contains("px-2")).toBe(false);
	expect(a.classList.contains("item-x")).toBe(true);
	expect(a.classList.contains("stuic-list-group-item")).toBe(true);
});

test("itemHref wraps the row content in a.stuic-list-group-item-link; falsy → plain row", async () => {
	const { container } = await render(ListGroup<string>, {
		items: ["linked", "plain"],
		itemHref: (item) => (item === "linked" ? "#/x" : undefined),
		classItemLink: "link-x",
	});
	const [linked, plain] = rows(container);
	const a = linked.querySelector(":scope > a")!;
	expect(a.getAttribute("href")).toBe("#/x");
	expect(a.classList.contains("stuic-list-group-item-link")).toBe(true);
	expect(a.classList.contains("link-x")).toBe(true);
	expect(a.textContent).toBe("linked");
	expect(plain.querySelector("a")).toBeNull();
	expect(plain.textContent).toBe("plain");
});

// ============================================================================
// header, footer, labelling
// ============================================================================

test("no header without title or aside", async () => {
	const { container } = await render(ListGroup, { items: ["a"] });
	expect(container.querySelector(".stuic-list-group-header")).toBeNull();
	expect(container.querySelector("ul")!.hasAttribute("aria-labelledby")).toBe(false);
});

test("the title labels the list; aside is the header's other side", async () => {
	const { container } = await render(ListGroup, {
		items: ["a", "b"],
		title: "Loose items",
		aside: "70 pc",
	});
	const header = container.querySelector(`${ROOT} > .stuic-list-group-header`)!;
	const title = header.querySelector(".stuic-list-group-title")!;
	expect(title.tagName).toBe("DIV");
	expect(header.querySelector(".stuic-list-group-aside")!.textContent).toBe("70 pc");
	const ul = container.querySelector("ul")!;
	expect(ul.getAttribute("aria-labelledby")).toBe(title.id);
	expect(title.id).toMatch(/^stuic-list-group-title-/);
	await expect.element(page.getByRole("list", { name: "Loose items" })).toBeVisible();
	// no heading unless asked for
	expect(container.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
});

test("aside alone renders the header without a title and leaves the list unlabelled", async () => {
	const { container } = await render(ListGroup, { items: ["a"], aside: "3 of 15" });
	expect(container.querySelector(".stuic-list-group-header")).not.toBeNull();
	expect(container.querySelector(".stuic-list-group-title")).toBeNull();
	expect(container.querySelector("ul")!.hasAttribute("aria-labelledby")).toBe(false);
});

test("titleLevel renders an <hN>; a snippet title works", async () => {
	const { container } = await render(ListGroup, {
		items: ["a"],
		title: text("Kit A"),
		titleLevel: 3,
	});
	const h3 = container.querySelector("h3.stuic-list-group-title")!;
	expect(h3).not.toBeNull();
	expect(h3.textContent).toBe("Kit A");
	await expect
		.element(page.getByRole("heading", { level: 3, name: "Kit A" }))
		.toBeVisible();
	await expect.element(page.getByRole("list", { name: "Kit A" })).toBeVisible();
});

test("header and footer are plain <div>s — no banner/contentinfo landmark per group", async () => {
	// rendered outside <main>, where a <header>/<footer> WOULD map to a landmark
	const { container } = await render(ListGroup, {
		items: ["a"],
		title: "T",
		footer: "F",
	});
	expect(container.querySelector("header, footer")).toBeNull();
	expect(page.getByRole("banner").elements()).toHaveLength(0);
	expect(page.getByRole("contentinfo").elements()).toHaveLength(0);
});

test("footer renders after the list, and is absent when empty", async () => {
	const { container } = await render(ListGroup, { items: ["a"], footer: "+12 more" });
	const footer = container.querySelector(`${ROOT} > .stuic-list-group-footer`)!;
	expect(footer.textContent).toBe("+12 more");
	expect(footer.previousElementSibling!.tagName).toBe("UL");

	const second = await render(ListGroup, { items: ["a"], footer: "" });
	expect(second.container.querySelector(".stuic-list-group-footer")).toBeNull();
});

test("listProps label a title-less list; rest props land on the root", async () => {
	const { container } = await render(ListGroup, {
		items: ["a"],
		listProps: { "aria-label": "Search hits", "data-hits": "" },
		"data-kit-group": "",
		"aria-busy": "true",
	});
	const root = container.querySelector(ROOT)!;
	expect(root.getAttribute("data-kit-group")).toBe("");
	expect(root.getAttribute("aria-busy")).toBe("true");
	const ul = container.querySelector("ul")!;
	expect(ul.getAttribute("role")).toBe("list");
	expect(ul.hasAttribute("data-hits")).toBe(true);
	await expect.element(page.getByRole("list", { name: "Search hits" })).toBeVisible();
});

// ============================================================================
// empty
// ============================================================================

test("no rows and no `empty` renders nothing at all, header included", async () => {
	const { container } = await render(ListGroup, { items: [], title: "Extras" });
	expect(container.querySelector(ROOT)).toBeNull();
	expect(container.textContent?.trim()).toBe("");

	const absent = await render(ListGroup, { title: "Extras" });
	expect(absent.container.querySelector(ROOT)).toBeNull();
});

test("no rows with `empty`: header + empty part + footer, and no list at all", async () => {
	const { container } = await render(ListGroup, {
		items: [],
		title: "Crew",
		empty: "Nobody booked yet.",
		footer: "F",
	});
	const root = container.querySelector(ROOT)!;
	expect([...root.children].map((el) => el.className)).toEqual([
		"stuic-list-group-header",
		"stuic-list-group-empty",
		"stuic-list-group-footer",
	]);
	expect(root.querySelector(".stuic-list-group-empty")!.textContent).toBe(
		"Nobody booked yet."
	);
	// no "list, 1 item" claiming there are no items
	expect(root.querySelector("ul, li")).toBeNull();
	expect(page.getByRole("listitem").elements()).toHaveLength(0);
	expect(page.getByRole("list").elements()).toHaveLength(0);
});

// ============================================================================
// children form
// ============================================================================

test("children render inside the <ul>; items are ignored and `empty` never shows", async () => {
	const { container } = await render(ListGroup, {
		items: ["ignored"],
		empty: "never",
		title: "Shortcuts",
		children: createRawSnippet(() => ({ render: () => "<li>Hand-written</li>" })),
	});
	expect(texts(rows(container))).toEqual(["Hand-written"]);
	expect(container.querySelector(".stuic-list-group-empty")).toBeNull();
	await expect.element(page.getByRole("list", { name: "Shortcuts" })).toBeVisible();
});

// ============================================================================
// unstyled
// ============================================================================

test("unstyled: no stuic-* class anywhere, semantics and the link anchor stay", async () => {
	const { container } = await render(ListGroup<string>, {
		items: ["a", "b"],
		title: "T",
		aside: "A",
		footer: "F",
		itemHref: () => "#/x",
		unstyled: true,
		class: "root-x",
		classItem: "item-x",
	});
	expect(container.querySelector("[class*='stuic-']")).toBeNull();
	const root = container.querySelector("div.root-x")!;
	expect(root).not.toBeNull();
	const ul = root.querySelector(":scope > ul")!;
	expect(ul.getAttribute("role")).toBe("list");
	expect(ul.getAttribute("aria-labelledby")).toBe(root.querySelector("[id]")!.id);
	await expect.element(page.getByRole("list", { name: "T" })).toBeVisible();
	expect(rows(container).every((li) => li.className === "item-x")).toBe(true);
	expect(container.querySelectorAll("li > a[href='#/x']")).toHaveLength(2);
	// no empty class attributes left behind
	expect(ul.hasAttribute("class")).toBe(false);
	expect(container.querySelector("li > a")!.hasAttribute("class")).toBe(false);
});

// ============================================================================
// layout — the only assertions here that need the real stylesheet
//
// Browser tests don't load `src/lib/index.css`, so the shared tier tokens
// (`--stuic-border-width`, …) are undefined here and the box has no border. The
// component's own tokens are literal, which is all these measurements read.
// ============================================================================

const nextFrame = () =>
	new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

async function renderFixture(props: Record<string, unknown>) {
	const screen = await render(ListGroupFixture, props as never);
	await nextFrame();
	return screen.container;
}

const rect = (el: Element) => el.getBoundingClientRect();
const part = (li: Element, name: string) => li.querySelector(`[data-part="${name}"]`)!;

test("wide: one line per row, the grow part absorbs the slack and pushes the facts to the end", async () => {
	const c = await renderFixture({ width: 1000 });
	const [li] = rows(c);
	const code = rect(part(li, "code"));
	const name = rect(part(li, "name"));
	const location = rect(part(li, "location"));
	expect(Math.abs(code.top - location.top)).toBeLessThan(2);
	expect(name.width).toBeGreaterThan(400);
	// the last fact ends at the row's inline-end padding (12px = 0.75rem)
	expect(Math.round(rect(li).right - location.right)).toBe(12);
});

test("narrow (360px): the facts wrap under the name, which keeps its 10rem", async () => {
	const c = await renderFixture({ width: 360 });
	const [li] = rows(c);
	const code = rect(part(li, "code"));
	const name = rect(part(li, "name"));
	const picked = rect(part(li, "picked"));
	expect(Math.abs(code.top - name.top)).toBeLessThan(2);
	expect(name.width).toBeGreaterThanOrEqual(160);
	expect(picked.top).toBeGreaterThan(name.bottom - 1);
	// nothing pushes the row sideways, the long dotted path included
	for (const el of rows(c)) expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
});

test("narrower than the basis: the grow part shrinks and truncates instead of overflowing", async () => {
	const c = await renderFixture({ width: 120 });
	const [, li] = rows(c);
	const name = part(li, "name") as HTMLElement;
	expect(rect(name).width).toBeLessThan(160);
	expect(name.scrollWidth).toBeGreaterThan(name.clientWidth); // clipped, with an ellipsis
	expect(getComputedStyle(name).textOverflow).toBe("ellipsis");
	expect(li.scrollWidth).toBeLessThanOrEqual(li.clientWidth);
});

test("header text and row text start at the same x, for any item padding-x", async () => {
	for (const style of [undefined, "--stuic-list-group-item-padding-x: 2rem"]) {
		for (const linked of [false, true]) {
			const c = await renderFixture({ width: 600, style, linked });
			const title = rect(c.querySelector(".stuic-list-group-title")!);
			const frame = rect(c.querySelector('[data-testid="frame"]')!);
			const code = rect(part(rows(c)[0], "code"));
			expect(Math.round(code.left)).toBe(Math.round(title.left));
			expect(Math.round(title.left - frame.left)).toBe(style ? 32 : 12);
		}
	}
});

test("a scoped item padding-y override reaches the header too", async () => {
	const c = await renderFixture({ style: "--stuic-list-group-item-padding-y: 20px" });
	const header = c.querySelector(".stuic-list-group-header")!;
	expect(getComputedStyle(header).paddingTop).toBe("20px");
	expect(getComputedStyle(rows(c)[0]).paddingTop).toBe("20px");
});

test("a linked row hands its box to the anchor; the focus ring is inset", async () => {
	const c = await renderFixture({ width: 600, linked: true });
	const [li] = rows(c);
	const a = li.querySelector(":scope > a")! as HTMLAnchorElement;
	expect(getComputedStyle(li).paddingTop).toBe("0px");
	expect(getComputedStyle(a).display).toBe("flex");
	expect(getComputedStyle(a).paddingLeft).toBe("12px");
	expect(Math.round(rect(a).width)).toBe(Math.round(rect(li).width));

	await userEvent.keyboard("{Tab}");
	expect(document.activeElement).toBe(a);
	const cs = getComputedStyle(a);
	expect(cs.outlineStyle).toBe("solid");
	expect(cs.outlineWidth).toBe("2px");
	expect(cs.outlineOffset).toBe("-2px");
});

test("children form: hand-written rows get the generated rows' box; a stuic component keeps its own", async () => {
	const c = await renderFixture({ width: 600, mode: "children" });
	const row = (name: string) => c.querySelector<HTMLElement>(`li[data-row="${name}"]`)!;

	const plain = getComputedStyle(row("plain"));
	expect(plain.display).toBe("flex");
	expect(plain.flexWrap).toBe("wrap");
	expect(plain.paddingLeft).toBe("12px");
	expect(getComputedStyle(part(row("plain"), "name")).flexBasis).toBe("160px");

	for (const name of ["link", "button"]) {
		const li = row(name);
		const child = li.firstElementChild as HTMLElement;
		expect(getComputedStyle(li).paddingLeft).toBe("0px");
		expect(getComputedStyle(child).display).toBe("flex");
		expect(getComputedStyle(child).paddingLeft).toBe("12px");
		expect(Math.round(rect(child).width)).toBe(Math.round(rect(li).width));
	}
	// data-grow works inside a hand-written link row too
	expect(getComputedStyle(part(row("link"), "name")).flexBasis).toBe("160px");

	// `<button class="stuic-button">` alone: the ROW keeps its padding, the button its box
	const stuic = row("stuic");
	const btn = stuic.querySelector("button")!;
	expect(getComputedStyle(stuic).display).toBe("flex");
	expect(getComputedStyle(stuic).paddingLeft).toBe("12px");
	expect(rect(btn).width).toBeLessThan(rect(stuic).width - 24);

	// hairlines between rows, not above the first
	expect(getComputedStyle(row("plain")).borderTopWidth).toBe("0px");
	expect(getComputedStyle(row("link")).borderTopWidth).toBe("1px");
});

test("a children list that rendered no rows collapses: no stray rule against the box", async () => {
	const c = await renderFixture({ mode: "children-empty" });
	const ul = c.querySelector("ul")!;
	expect(getComputedStyle(ul).display).toBe("none");
	const header = c.querySelector(".stuic-list-group-header")!;
	expect(getComputedStyle(header).borderBottomWidth).toBe("0px");
	const footer = c.querySelector(".stuic-list-group-footer")!;
	expect(getComputedStyle(footer).borderTopWidth).toBe("1px");

	const withRow = await renderFixture({ mode: "children-empty", showRow: true });
	expect(getComputedStyle(withRow.querySelector("ul")!).display).toBe("block");
	expect(getComputedStyle(withRow.querySelector("ul")!).borderTopWidth).toBe("1px");
});

test("titleLevel never changes the look: an <h1> title inherits the root's size", async () => {
	const { container } = await render(ListGroup, {
		items: ["a"],
		title: "Big?",
		titleLevel: 1,
		style: "font-size: 13px",
	});
	await nextFrame();
	const h1 = container.querySelector("h1")!;
	expect(getComputedStyle(h1).fontSize).toBe("13px");
	expect(getComputedStyle(h1).marginTop).toBe("0px");
});

// The stylesheet never declares a font-size: every part inherits, so `text-sm` on the
// root scales the whole box and no part can default below the 14px floor.
const CSS = import.meta.glob("./index.css", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

test("index.css declares no font-size", () => {
	const src = CSS["./index.css"].replace(/\/\*[\s\S]*?\*\//g, "");
	expect(src).not.toMatch(/font-size\s*:/);
});
