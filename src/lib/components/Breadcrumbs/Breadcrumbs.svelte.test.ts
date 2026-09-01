import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs.svelte";
import { createBreadcrumbsT } from "./i18n.js";
import { BREADCRUMBS_MESSAGES_SK } from "./i18n-sk.js";

// Note: browser tests don't load the component index.css, so only structure,
// attributes and callback wiring are asserted here — never computed sizes.

const ITEMS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Products", href: "/products" },
	{ label: "Phones" }, // current page, no href
];

const nav = (c: HTMLElement) => c.querySelector<HTMLElement>("nav");
const lis = (c: HTMLElement) => [...c.querySelectorAll<HTMLLIElement>("li")];
const links = (c: HTMLElement) => [...c.querySelectorAll<HTMLAnchorElement>("a")];
const separators = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-breadcrumbs-separator"),
];
const ellipsisButton = (c: HTMLElement) =>
	c.querySelector<HTMLButtonElement>(".stuic-breadcrumbs-ellipsis");

// ============================================================================
// structure + a11y
// ============================================================================

test("default: nav landmark with ol/li structure, links, current marked", async () => {
	const { container } = await render(Breadcrumbs, { items: ITEMS });
	const root = nav(container)!;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-breadcrumbs")).toBe(true);
	expect(root.getAttribute("aria-label")).toBe("Breadcrumb");
	expect(root.querySelector("ol")?.classList.contains("stuic-breadcrumbs-list")).toBe(
		true
	);

	expect(lis(container).length).toBe(3);
	expect(links(container).map((a) => a.textContent?.trim())).toEqual([
		"Home",
		"Products",
	]);
	expect(links(container).map((a) => a.getAttribute("href"))).toEqual(["/", "/products"]);

	// last crumb: plain span, current
	const current = container.querySelector(".stuic-breadcrumbs-current")!;
	expect(current.tagName).toBe("SPAN");
	expect(current.textContent?.trim()).toBe("Phones");
	expect(current.getAttribute("aria-current")).toBe("page");
	expect(lis(container)[2].getAttribute("data-current")).toBe("true");
	expect(lis(container)[1].hasAttribute("data-current")).toBe(false);
});

test("last item with href renders as a link with aria-current", async () => {
	const { container } = await render(Breadcrumbs, {
		items: [
			{ label: "Home", href: "/" },
			{ label: "Phones", href: "/phones" },
		],
	});
	const last = links(container)[1];
	expect(last.getAttribute("aria-current")).toBe("page");
	expect(last.classList.contains("stuic-breadcrumbs-current")).toBe(true);
});

test("non-last item without href renders as a plain span (not current)", async () => {
	const { container } = await render(Breadcrumbs, {
		items: [{ label: "Home", href: "/" }, { label: "Section" }, { label: "Here" }],
	});
	const spans = [...container.querySelectorAll("li > span:not([aria-hidden])")];
	expect(spans.length).toBe(2);
	expect(spans[0].textContent?.trim()).toBe("Section");
	expect(spans[0].hasAttribute("aria-current")).toBe(false);
	expect(spans[0].classList.contains("stuic-breadcrumbs-current")).toBe(false);
});

test("empty items renders nothing", async () => {
	const { container } = await render(Breadcrumbs, { items: [] });
	expect(nav(container)).toBeNull();
});

// ============================================================================
// separators
// ============================================================================

test("separators: n-1 of them, aria-hidden, default '/', custom via prop", async () => {
	const { container } = await render(Breadcrumbs, { items: ITEMS });
	const seps = separators(container);
	expect(seps.length).toBe(2);
	for (const s of seps) {
		expect(s.getAttribute("aria-hidden")).toBe("true");
		expect(s.textContent?.trim()).toBe("/");
	}

	const custom = await render(Breadcrumbs, { items: ITEMS, separator: "›" });
	expect(separators(custom.container)[0].textContent?.trim()).toBe("›");
});

test("renderSeparator snippet overrides the separator content", async () => {
	const renderSeparator = createRawSnippet(() => ({
		render: () => `<b data-testid="sep">→</b>`,
	}));
	const { container } = await render(Breadcrumbs, { items: ITEMS, renderSeparator });
	expect(container.querySelectorAll('[data-testid="sep"]').length).toBe(2);
});

// ============================================================================
// collapse (maxItems)
// ============================================================================

const LONG: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "A", href: "/a" },
	{ label: "B", href: "/a/b" },
	{ label: "C", href: "/a/b/c" },
	{ label: "Current" },
];

test("maxItems collapses the middle into an ellipsis button; click expands", async () => {
	const { container } = await render(Breadcrumbs, { items: LONG, maxItems: 3 });

	// 1 before + ellipsis + 1 after
	expect(lis(container).length).toBe(3);
	const btn = ellipsisButton(container)!;
	expect(btn).not.toBeNull();
	expect(btn.getAttribute("aria-label")).toBe("Show all breadcrumbs");
	expect(links(container).map((a) => a.textContent?.trim())).toEqual(["Home"]);
	expect(container.textContent).not.toContain("B");
	// the current crumb stays visible and marked
	expect(lis(container)[2].getAttribute("data-current")).toBe("true");

	btn.click();
	await new Promise((r) => setTimeout(r));
	expect(ellipsisButton(container)).toBeNull();
	expect(lis(container).length).toBe(5);
	expect(container.textContent).toContain("B");
});

test("itemsBeforeCollapse/itemsAfterCollapse shape the collapsed window", async () => {
	const { container } = await render(Breadcrumbs, {
		items: LONG,
		maxItems: 4,
		itemsBeforeCollapse: 2,
		itemsAfterCollapse: 1,
	});
	expect(lis(container).length).toBe(4); // 2 + ellipsis + 1
	expect(links(container).map((a) => a.textContent?.trim())).toEqual(["Home", "A"]);
});

test("maxItems=0 (default) never collapses; short trails don't either", async () => {
	const all = await render(Breadcrumbs, { items: LONG });
	expect(ellipsisButton(all.container)).toBeNull();
	expect(lis(all.container).length).toBe(5);

	const short = await render(Breadcrumbs, { items: ITEMS, maxItems: 3 });
	expect(ellipsisButton(short.container)).toBeNull();
});

test("a new items array collapses again after an expand", async () => {
	const { container, rerender } = await render(Breadcrumbs, {
		items: LONG,
		maxItems: 3,
	});
	ellipsisButton(container)!.click();
	await new Promise((r) => setTimeout(r));
	expect(ellipsisButton(container)).toBeNull();

	// navigation: new trail (fresh array) -> collapsed again
	await rerender({ items: [...LONG.slice(0, 4), { label: "Elsewhere" }] });
	expect(ellipsisButton(container)).not.toBeNull();
	expect(lis(container).length).toBe(3);
});

// ============================================================================
// JSON-LD
// ============================================================================

test("jsonLd renders BreadcrumbList structured data alongside the trail", async () => {
	const { container } = await render(Breadcrumbs, { items: ITEMS, jsonLd: true });
	const script = container.querySelector('script[type="application/ld+json"]')!;
	expect(script).not.toBeNull();
	const data = JSON.parse(script.textContent!);
	expect(data["@type"]).toBe("BreadcrumbList");
	expect(data.itemListElement.length).toBe(3);
	expect(data.itemListElement[0]).toEqual({
		"@type": "ListItem",
		position: 1,
		name: "Home",
		item: "/",
	});
	// current page (no href): no `item`
	expect(data.itemListElement[2]).toEqual({
		"@type": "ListItem",
		position: 3,
		name: "Phones",
	});
});

test("jsonLd with baseUrl resolves hrefs to absolute urls", async () => {
	const { container } = await render(Breadcrumbs, {
		items: ITEMS,
		jsonLd: { baseUrl: "https://example.com" },
	});
	const data = JSON.parse(
		container.querySelector('script[type="application/ld+json"]')!.textContent!
	);
	expect(data.itemListElement[1].item).toBe("https://example.com/products");
});

test("no jsonLd prop -> no script tag", async () => {
	const { container } = await render(Breadcrumbs, { items: ITEMS });
	expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
});

// ============================================================================
// i18n
// ============================================================================

test("t prop localizes the landmark and ellipsis labels (SK catalog)", async () => {
	const t = createBreadcrumbsT(BREADCRUMBS_MESSAGES_SK);
	const { container } = await render(Breadcrumbs, { items: LONG, maxItems: 3, t });
	expect(nav(container)!.getAttribute("aria-label")).toBe("Omrvinková navigácia");
	expect(ellipsisButton(container)!.getAttribute("aria-label")).toBe(
		"Zobraziť celú cestu"
	);
});

// ============================================================================
// customization
// ============================================================================

test("renderItem snippet overrides crumbs and receives (item, index, isLast)", async () => {
	const renderItem = createRawSnippet<[BreadcrumbItem, number, boolean]>(
		(getItem, getIndex, getIsLast) => ({
			render: () =>
				`<i data-testid="crumb">${getIndex()}:${getItem().label}:${getIsLast()}</i>`,
		})
	);
	const { container } = await render(Breadcrumbs, { items: ITEMS, renderItem });
	const crumbs = [...container.querySelectorAll('[data-testid="crumb"]')];
	expect(crumbs.map((c) => c.textContent)).toEqual([
		"0:Home:false",
		"1:Products:false",
		"2:Phones:true",
	]);
	expect(links(container).length).toBe(0);
});

test("class props merge; rest props pass through", async () => {
	const { container } = await render(Breadcrumbs, {
		items: ITEMS,
		class: "my-extra",
		classItem: "my-item",
		classLink: "my-link",
		classCurrent: "my-current",
		classSeparator: "my-sep",
		"data-testid": "bc",
	});
	const root = nav(container)!;
	expect(root.classList.contains("stuic-breadcrumbs")).toBe(true);
	expect(root.classList.contains("my-extra")).toBe(true);
	expect(root.getAttribute("data-testid")).toBe("bc");

	expect(lis(container)[0].classList.contains("my-item")).toBe(true);
	expect(links(container)[0].classList.contains("my-link")).toBe(true);
	expect(separators(container)[0].classList.contains("my-sep")).toBe(true);

	const current = container.querySelector('[aria-current="page"]')!;
	expect(current.classList.contains("stuic-breadcrumbs-current")).toBe(true);
	expect(current.classList.contains("my-current")).toBe(true);
	// non-current links don't get classCurrent
	expect(links(container)[0].classList.contains("my-current")).toBe(false);
});

test("unstyled drops all stuic classes (a11y attributes stay)", async () => {
	const { container } = await render(Breadcrumbs, { items: ITEMS, unstyled: true });
	const root = nav(container)!;
	expect(root.classList.contains("stuic-breadcrumbs")).toBe(false);
	expect(container.querySelector("[class*='stuic-breadcrumbs']")).toBeNull();
	expect(root.getAttribute("aria-label")).toBe("Breadcrumb");
	expect(container.querySelector('[aria-current="page"]')).not.toBeNull();
});
