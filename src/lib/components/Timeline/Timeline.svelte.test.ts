import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import Timeline, { type TimelineItem, type TimelineSnippetArg } from "./Timeline.svelte";

// Note: browser tests don't load the component index.css, so only structure,
// attributes and snippet wiring are asserted here — never computed layout.

const ITEMS: TimelineItem[] = [
	{ title: "Order placed", description: "Ref #1001", time: "09:00" },
	{ title: "Payment received", time: "09:05", intent: "success" },
	{ title: "Shipped", description: "Tracking sent" },
];

const list = (c: HTMLElement) => c.querySelector<HTMLOListElement>("ol");
const items = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>("li")];
const markers = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-timeline-marker"),
];
const times = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-timeline-time"),
];
const titles = (c: HTMLElement) =>
	[...c.querySelectorAll<HTMLElement>(".stuic-timeline-title")].map((t) =>
		t.textContent?.trim()
	);

// ============================================================================
// structure
// ============================================================================

test("default: ol[role=list] root, li per item, dot markers, inline time, title + description", async () => {
	const { container } = await render(Timeline, { items: ITEMS });
	const root = list(container)!;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-timeline")).toBe(true);
	expect(root.getAttribute("role")).toBe("list");
	expect(root.getAttribute("data-align")).toBe("start");
	expect(root.getAttribute("data-time-position")).toBe("inline");

	const li = items(container);
	expect(li.length).toBe(3);
	expect(li.every((x) => x.classList.contains("stuic-timeline-item"))).toBe(true);

	// markers are decorative dots
	const m = markers(container);
	expect(m.length).toBe(3);
	expect(m.every((x) => x.getAttribute("data-marker") === "dot")).toBe(true);
	expect(m.every((x) => x.getAttribute("aria-hidden") === "true")).toBe(true);

	expect(titles(container)).toEqual(["Order placed", "Payment received", "Shipped"]);
	const desc = [...container.querySelectorAll(".stuic-timeline-description")].map((d) =>
		d.textContent?.trim()
	);
	expect(desc).toEqual(["Ref #1001", "Tracking sent"]);

	// inline time lives inside the content cell, before the title; no opposite cell
	const t = times(container);
	expect(t.length).toBe(2);
	expect(t[0].closest(".stuic-timeline-content")).not.toBeNull();
	expect(t[0].nextElementSibling?.classList.contains("stuic-timeline-title")).toBe(true);
	expect(container.querySelector(".stuic-timeline-opposite")).toBeNull();
});

test("empty items render nothing", async () => {
	const { container } = await render(Timeline, { items: [] });
	expect(list(container)).toBeNull();
});

test("intent sets data-intent on the item only when present", async () => {
	const { container } = await render(Timeline, { items: ITEMS });
	expect(items(container).map((x) => x.getAttribute("data-intent"))).toEqual([
		null,
		"success",
		null,
	]);
});

// ============================================================================
// time
// ============================================================================

test("datetime renders <time datetime>, Date is serialized to ISO; plain time is a <span>", async () => {
	const d = new Date(Date.UTC(2026, 8, 1, 12, 30));
	const { container } = await render(Timeline, {
		items: [
			{ title: "A", time: "noon", datetime: "2026-09-01T12:00:00Z" },
			{ title: "B", time: "half past", datetime: d },
			{ title: "C", time: "sometime" },
		],
	});
	const t = times(container);
	expect(t.map((x) => x.tagName)).toEqual(["TIME", "TIME", "SPAN"]);
	expect(t[0].getAttribute("datetime")).toBe("2026-09-01T12:00:00Z");
	expect(t[1].getAttribute("datetime")).toBe("2026-09-01T12:30:00.000Z");
	expect(t[2].hasAttribute("datetime")).toBe(false);
	expect(t.map((x) => x.textContent?.trim())).toEqual(["noon", "half past", "sometime"]);
});

test("formatTime fills in only items that have datetime but no time", async () => {
	const { container } = await render(Timeline, {
		items: [
			{ title: "A", datetime: "2026-09-01T12:00:00Z" },
			{ title: "B", time: "explicit", datetime: "2026-09-01T13:00:00Z" },
			{ title: "C" },
		],
		formatTime: (dt) => `fmt:${typeof dt === "string" ? dt : dt.toISOString()}`,
	});
	const t = times(container);
	expect(t.map((x) => x.textContent?.trim())).toEqual([
		"fmt:2026-09-01T12:00:00Z",
		"explicit",
	]);
	// no formatter + no time → no label at all
	const { container: c2 } = await render(Timeline, {
		items: [{ title: "A", datetime: "2026-09-01T12:00:00Z" }],
	});
	expect(times(c2).length).toBe(0);
});

test("timePosition=opposite moves the time into its own cell before the rail", async () => {
	const { container } = await render(Timeline, {
		items: ITEMS,
		timePosition: "opposite",
	});
	expect(list(container)!.getAttribute("data-time-position")).toBe("opposite");
	const opp = [...container.querySelectorAll<HTMLElement>(".stuic-timeline-opposite")];
	// every item gets the cell (keeps the grid column), even without a label
	expect(opp.length).toBe(3);
	expect(opp.map((x) => x.textContent?.trim())).toEqual(["09:00", "09:05", ""]);
	// DOM order: opposite → rail → content
	const first = items(container)[0];
	expect([...first.children].map((x) => x.className)).toEqual([
		"stuic-timeline-opposite",
		"stuic-timeline-rail",
		"stuic-timeline-content",
	]);
	// nothing time-ish left in the content cell
	expect(
		container.querySelector(".stuic-timeline-content .stuic-timeline-time")
	).toBeNull();
});

test("align=alternate is reflected on the root", async () => {
	const { container } = await render(Timeline, { items: ITEMS, align: "alternate" });
	expect(list(container)!.getAttribute("data-align")).toBe("alternate");
});

// ============================================================================
// markers
// ============================================================================

test("item.icon switches the marker to the icon bubble and renders the THC", async () => {
	const { container } = await render(Timeline, {
		items: [
			{ title: "A", icon: { html: '<svg data-testid="ico"></svg>' } },
			{ title: "B" },
		],
	});
	const m = markers(container);
	expect(m.map((x) => x.getAttribute("data-marker"))).toEqual(["icon", "dot"]);
	expect(m[0].querySelector('[data-testid="ico"]')).not.toBeNull();
	// a dot marker is an empty box (Svelte may leave comment anchors, never elements/text)
	expect(m[1].childElementCount).toBe(0);
	expect(m[1].textContent?.trim()).toBe("");
});

test("renderMarker overrides every marker (data-marker=custom), receives item + index", async () => {
	const renderMarker = createRawSnippet<[TimelineSnippetArg]>((getArg) => ({
		render: () =>
			`<b data-testid="mk">${getArg().index}:${String(getArg().item.title)}</b>`,
	}));
	const { container } = await render(Timeline, {
		items: [{ title: "A", icon: { html: "<i>ignored</i>" } }, { title: "B" }],
		renderMarker,
	});
	const m = markers(container);
	expect(m.every((x) => x.getAttribute("data-marker") === "custom")).toBe(true);
	const custom = [...container.querySelectorAll('[data-testid="mk"]')];
	expect(custom.map((x) => x.textContent)).toEqual(["0:A", "1:B"]);
	// the custom snippet wins over item.icon
	expect(container.querySelector("i")).toBeNull();
});

// ============================================================================
// content snippets + links
// ============================================================================

test("renderItem replaces the whole content cell (no default time/title/footer)", async () => {
	const renderItem = createRawSnippet<[TimelineSnippetArg]>((getArg) => ({
		render: () => `<p data-testid="custom">${String(getArg().item.title)}!</p>`,
	}));
	const renderFooter = createRawSnippet<[TimelineSnippetArg]>(() => ({
		render: () => `<span data-testid="footer"></span>`,
	}));
	const { container } = await render(Timeline, {
		items: ITEMS,
		renderItem,
		renderFooter,
	});
	expect(
		[...container.querySelectorAll('[data-testid="custom"]')].map((x) => x.textContent)
	).toEqual(["Order placed!", "Payment received!", "Shipped!"]);
	expect(container.querySelector(".stuic-timeline-title")).toBeNull();
	expect(times(container).length).toBe(0);
	expect(container.querySelector('[data-testid="footer"]')).toBeNull();
	// the rail + markers are untouched
	expect(markers(container).length).toBe(3);
});

test("renderFooter renders a footer area per item after the description", async () => {
	const renderFooter = createRawSnippet<[TimelineSnippetArg]>((getArg) => ({
		render: () => `<button data-testid="act">act-${getArg().index}</button>`,
	}));
	const { container } = await render(Timeline, { items: ITEMS, renderFooter });
	const footers = [...container.querySelectorAll<HTMLElement>(".stuic-timeline-footer")];
	expect(footers.length).toBe(3);
	expect(footers.map((f) => f.textContent?.trim())).toEqual(["act-0", "act-1", "act-2"]);
	expect(
		footers[0].previousElementSibling?.classList.contains("stuic-timeline-description")
	).toBe(true);
});

test("href renders the title as a link", async () => {
	const { container } = await render(Timeline, {
		items: [{ title: "Linked", href: "/orders/1" }, { title: "Plain" }],
	});
	const links = [
		...container.querySelectorAll<HTMLAnchorElement>(".stuic-timeline-title a"),
	];
	expect(links.length).toBe(1);
	expect(links[0].getAttribute("href")).toBe("/orders/1");
	expect(links[0].classList.contains("stuic-timeline-link")).toBe(true);
	expect(links[0].textContent?.trim()).toBe("Linked");
});

// ============================================================================
// customization
// ============================================================================

test("class props merge; rest props pass through", async () => {
	const { container } = await render(Timeline, {
		items: ITEMS,
		class: "my-extra",
		classItem: "my-item",
		classMarker: "my-marker",
		classContent: "my-content",
		classTime: "my-time",
		classTitle: "my-title",
		classDescription: "my-desc",
		"data-testid": "tl",
		"aria-label": "Order history",
	});
	const root = list(container)!;
	expect(root.classList.contains("stuic-timeline")).toBe(true);
	expect(root.classList.contains("my-extra")).toBe(true);
	expect(root.getAttribute("data-testid")).toBe("tl");
	expect(root.getAttribute("aria-label")).toBe("Order history");

	const li = items(container)[0];
	expect(li.classList.contains("stuic-timeline-item")).toBe(true);
	expect(li.classList.contains("my-item")).toBe(true);
	expect(markers(container)[0].classList.contains("my-marker")).toBe(true);
	expect(
		container.querySelector(".stuic-timeline-content")!.classList.contains("my-content")
	).toBe(true);
	expect(times(container)[0].classList.contains("my-time")).toBe(true);
	expect(
		container.querySelector(".stuic-timeline-title")!.classList.contains("my-title")
	).toBe(true);
	expect(
		container.querySelector(".stuic-timeline-description")!.classList.contains("my-desc")
	).toBe(true);
});

test("unstyled drops stuic classes and data attributes, keeps structure + semantics", async () => {
	const { container } = await render(Timeline, {
		items: [{ title: "A", time: "t", datetime: "2026-09-01", intent: "success" }],
		unstyled: true,
		class: "raw",
	});
	const root = list(container)!;
	expect(root.className).toBe("raw");
	expect(root.hasAttribute("data-align")).toBe(false);
	expect(root.hasAttribute("data-time-position")).toBe(false);
	expect(root.getAttribute("role")).toBe("list");
	expect(container.querySelector("[class*='stuic-']")).toBeNull();
	expect(items(container)[0].hasAttribute("data-intent")).toBe(false);
	expect(container.querySelector("[data-marker]")).toBeNull();
	// semantics survive
	expect(container.querySelector("time")!.getAttribute("datetime")).toBe("2026-09-01");
	expect(container.querySelector("li")!.textContent).toContain("A");
});
