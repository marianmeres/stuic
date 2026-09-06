import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import DescriptionList, {
	type DescriptionListSnippetArg,
} from "./DescriptionList.svelte";

// DescriptionList renders a plain <dl class="stuic-description-list"> with no ARIA role
// of its own (a <dl> already has list semantics), so we locate the root by its base
// class — like Stat/Card/Avatar. Everything the component decides is a data-* attribute
// on the <dl> (layout / columns-from / divide / wrap / value-align) or on the row <div>
// (wrap / emphasis); the CSS selects structurally (`dl > div > dt`), which is why the
// hand-written `children` form gets the same rendering.
//
// NOTE: browser tests do not load the component's index.css, so the container query
// itself (the `auto` -> columns flip) is not observable here — only the attribute
// contract it is driven by. The layout is exercised on the demo page instead.

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function rootLocator(container: HTMLElement) {
	const el = container.querySelector("dl.stuic-description-list");
	if (!el) throw new Error("missing dl.stuic-description-list root");
	return page.elementLocator(el);
}

const ITEMS = [
	{ label: "Code", value: "ABC-123" },
	{ label: "Owner", value: "Alice" },
];

test("renders <dl> > <div> > <dt> + <dd> per item, in the given order", async () => {
	const { container } = await render(DescriptionList, { items: ITEMS });
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();

	const rows = container.querySelectorAll("dl.stuic-description-list > div");
	expect(rows).toHaveLength(2);

	// each row is exactly one <dt> + one <dd>, and the dt precedes the dd
	rows.forEach((row) => {
		expect(row.querySelectorAll(":scope > dt")).toHaveLength(1);
		expect(row.querySelectorAll(":scope > dd")).toHaveLength(1);
		expect(row.firstElementChild!.tagName).toBe("DT");
	});

	expect([...rows].map((r) => r.querySelector("dt")!.textContent)).toEqual([
		"Code",
		"Owner",
	]);
	expect([...rows].map((r) => r.querySelector("dd")!.textContent)).toEqual([
		"ABC-123",
		"Alice",
	]);
});

test("keyed order is preserved when items are reordered", async () => {
	const { container, rerender } = await render(DescriptionList, {
		items: [
			{ key: "a", label: "A", value: "1" },
			{ key: "b", label: "B", value: "2" },
		],
	});
	await rerender({
		items: [
			{ key: "b", label: "B", value: "2" },
			{ key: "a", label: "A", value: "1" },
		],
	});
	const labels = [...container.querySelectorAll("dt")].map((el) => el.textContent);
	expect(labels).toEqual(["B", "A"]);
});

test("defaults reflect onto the <dl> as data attributes", async () => {
	const { container } = await render(DescriptionList, { items: ITEMS });
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-layout", "auto");
	await expect.element(root).toHaveAttribute("data-columns-from", "sm");
	await expect.element(root).toHaveAttribute("data-divide", "inside");
	await expect.element(root).toHaveAttribute("data-wrap", "anywhere");
	await expect.element(root).toHaveAttribute("data-value-align", "start");
});

test("explicit props reflect onto the <dl>", async () => {
	const { container } = await render(DescriptionList, {
		items: ITEMS,
		layout: "auto",
		columnsFrom: "xl",
		divide: "outside",
		wrap: "truncate",
		valueAlign: "end",
	});
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-columns-from", "xl");
	await expect.element(root).toHaveAttribute("data-divide", "outside");
	await expect.element(root).toHaveAttribute("data-wrap", "truncate");
	await expect.element(root).toHaveAttribute("data-value-align", "end");
});

test("data-columns-from is dropped unless layout is auto", async () => {
	for (const layout of ["stacked", "columns"] as const) {
		const { container } = await render(DescriptionList, { items: ITEMS, layout });
		const root = container.querySelector("dl.stuic-description-list")!;
		expect(root.getAttribute("data-layout")).toBe(layout);
		expect(root.hasAttribute("data-columns-from")).toBe(false);
	}
});

test("unstyled renders the bare structure: no stuic class, no data attributes", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "Code", value: "ABC-123", emphasis: true, wrap: "truncate" }],
		unstyled: true,
		divide: "outside",
	});
	const dl = container.querySelector("dl")!;
	expect(dl).not.toBeNull();
	expect(dl.className).toBe("");
	for (const attr of [
		"data-layout",
		"data-columns-from",
		"data-divide",
		"data-wrap",
		"data-value-align",
	]) {
		expect(dl.hasAttribute(attr)).toBe(false);
	}
	const row = dl.querySelector("div")!;
	expect(row.className).toBe("");
	expect(row.hasAttribute("data-emphasis")).toBe(false);
	expect(row.hasAttribute("data-wrap")).toBe(false);
	// the structure itself survives
	expect(row.querySelector("dt")!.textContent).toBe("Code");
	expect(row.querySelector("dd")!.textContent).toBe("ABC-123");
});

test("unstyled still merges consumer classes (list-level and per-item)", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "L", value: "V", class: "row-x", classValue: "val-x" }],
		unstyled: true,
		class: "dl-x",
		classItem: "item-x",
		classLabel: "label-x",
	});
	const dl = container.querySelector("dl")!;
	expect(dl.className).toBe("dl-x");
	const row = dl.querySelector("div")!;
	expect(row.className).toBe("item-x row-x");
	expect(row.querySelector("dt")!.className).toBe("label-x");
	expect(row.querySelector("dd")!.className).toBe("val-x");
});

test("item.emphasis and item.wrap land on the row as data attributes", async () => {
	const { container } = await render(DescriptionList, {
		items: [
			{ label: "Subtotal", value: "10" },
			{ label: "Total", value: "12", emphasis: true, wrap: "truncate" },
		],
	});
	const rows = container.querySelectorAll("dl.stuic-description-list > div");
	expect(rows[0].hasAttribute("data-emphasis")).toBe(false);
	expect(rows[0].hasAttribute("data-wrap")).toBe(false);
	// data-emphasis is an EMPTY attribute
	expect(rows[1].getAttribute("data-emphasis")).toBe("");
	expect(rows[1].getAttribute("data-wrap")).toBe("truncate");
});

test("description renders a second <dd>, and is absent when empty", async () => {
	const { container } = await render(DescriptionList, {
		items: [
			{ label: "Downloads", value: 42, description: "in the last 30 days" },
			{ label: "Owner", value: "Alice" },
			{ label: "Empty", value: "x", description: "" },
		],
	});
	const rows = container.querySelectorAll("dl.stuic-description-list > div");
	const dds = [...rows].map((r) => r.querySelectorAll(":scope > dd"));
	expect(dds[0]).toHaveLength(2);
	expect(dds[0][1].textContent).toBe("in the last 30 days");
	expect(dds[0][1].classList.contains("stuic-description-list-description")).toBe(true);
	expect(dds[1]).toHaveLength(1);
	expect(dds[2]).toHaveLength(1);
});

test("href wraps the value in a plain <a>", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "URL", value: "example.com", href: "https://example.com" }],
	});
	const link = container.querySelector("dd > a") as HTMLAnchorElement;
	expect(link).not.toBeNull();
	expect(link.getAttribute("href")).toBe("https://example.com");
	expect(link.textContent).toBe("example.com");
});

test("renderValue wins over href", async () => {
	const renderValue = createRawSnippet<[DescriptionListSnippetArg]>((arg) => ({
		render: () => `<span>custom ${arg().index}</span>`,
	}));
	const { container } = await render(DescriptionList, {
		items: [{ label: "URL", value: "example.com", href: "https://example.com" }],
		renderValue,
	});
	expect(container.querySelector("dd > a")).toBeNull();
	expect(container.querySelector("dd")!.textContent).toBe("custom 0");
});

test("renderLabel replaces the <dt> content only", async () => {
	const renderLabel = createRawSnippet<[DescriptionListSnippetArg]>((arg) => ({
		render: () => `<span>#${arg().index}</span>`,
	}));
	const { container } = await render(DescriptionList, { items: ITEMS, renderLabel });
	const rows = container.querySelectorAll("dl.stuic-description-list > div");
	expect([...rows].map((r) => r.querySelector("dt")!.textContent)).toEqual(["#0", "#1"]);
	expect(rows[0].querySelector("dd")!.textContent).toBe("ABC-123");
});

test("renderItem replaces the row content but keeps the row <div>", async () => {
	const renderItem = createRawSnippet<[DescriptionListSnippetArg]>((arg) => ({
		render: () => `<dt>only ${arg().item.label}</dt>`,
	}));
	const { container } = await render(DescriptionList, { items: ITEMS, renderItem });
	const rows = container.querySelectorAll("dl.stuic-description-list > div");
	expect(rows).toHaveLength(2);
	expect(rows[0].querySelectorAll(":scope > dd")).toHaveLength(0);
	expect(rows[0].querySelector("dt")!.textContent).toBe("only Code");
});

test("wrap=truncate auto-fills title from a plain string value", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "URL", value: "https://example.com/very/long" }],
		wrap: "truncate",
	});
	expect(container.querySelector("dd")!.getAttribute("title")).toBe(
		"https://example.com/very/long"
	);
});

test("row-level wrap=truncate auto-fills title too, and other rows keep none", async () => {
	const { container } = await render(DescriptionList, {
		items: [
			{ label: "URL", value: "https://example.com/x", wrap: "truncate" },
			{ label: "Owner", value: "Alice" },
		],
	});
	const dds = container.querySelectorAll("dd");
	expect(dds[0].getAttribute("title")).toBe("https://example.com/x");
	expect(dds[1].hasAttribute("title")).toBe(false);
});

test("an explicit item.title wins over the auto-filled one", async () => {
	const { container } = await render(DescriptionList, {
		items: [
			{ label: "A", value: "plain" },
			{ label: "B", value: "clipped", title: "explicit" },
		],
		wrap: "truncate",
	});
	const dds = container.querySelectorAll("dd");
	expect(dds[0].getAttribute("title")).toBe("plain"); // auto-filled from the value
	expect(dds[1].getAttribute("title")).toBe("explicit"); // explicit wins
});

test("item.title is honoured even when nothing is truncated", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "A", value: "plain", title: "explicit" }],
	});
	expect(container.querySelector("dd")!.getAttribute("title")).toBe("explicit");
});

test("a non-string value under truncate gets no auto title", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "A", value: { html: "<b>markup</b>" } }],
		wrap: "truncate",
	});
	expect(container.querySelector("dd")!.hasAttribute("title")).toBe(false);
});

test("wrap=anywhere (default) sets no title even for a long string", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "URL", value: "https://example.com/very/long" }],
	});
	expect(container.querySelector("dd")!.hasAttribute("title")).toBe(false);
});

test("value 0 renders '0'; undefined/null/'' render emptyValue", async () => {
	const { container } = await render(DescriptionList, {
		items: [
			{ label: "Zero", value: 0 },
			{ label: "Undef", value: undefined },
			{ label: "Null", value: null },
			{ label: "Blank", value: "" },
		],
	});
	const dds = [...container.querySelectorAll("dd")].map((d) => d.textContent);
	expect(dds).toEqual(["0", "—", "—", "—"]);
});

test("emptyValue is configurable, and '' renders an empty <dd>", async () => {
	const custom = await render(DescriptionList, {
		items: [{ label: "X" }],
		emptyValue: "n/a",
	});
	expect(custom.container.querySelector("dd")!.textContent).toBe("n/a");

	const blank = await render(DescriptionList, {
		items: [{ label: "X" }],
		emptyValue: "",
	});
	const dd = blank.container.querySelector("dd")!;
	expect(dd).not.toBeNull();
	expect(dd.textContent).toBe("");
});

test("labelLang and valueLang land on the <dt> / value <dd>", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "Nazov", value: "Hodnota", labelLang: "sk", valueLang: "en" }],
	});
	expect(container.querySelector("dt")!.getAttribute("lang")).toBe("sk");
	expect(container.querySelector("dd")!.getAttribute("lang")).toBe("en");
});

test("children renders inside the <dl> and items are ignored", async () => {
	const { container } = await render(DescriptionList, {
		items: ITEMS,
		children: text("hand written"),
	});
	const dl = container.querySelector("dl.stuic-description-list")!;
	expect(dl.textContent).toBe("hand written");
	expect(dl.querySelector("dt")).toBeNull();
});

test("empty items with no children renders no element at all", async () => {
	const { container } = await render(DescriptionList, { items: [] });
	expect(container.querySelector("dl")).toBeNull();
});

test("no items and no children renders no element at all", async () => {
	const { container } = await render(DescriptionList, {});
	expect(container.querySelector("dl")).toBeNull();
});

test("children alone renders the <dl> even with no items", async () => {
	const { container } = await render(DescriptionList, { children: text("x") });
	expect(container.querySelector("dl.stuic-description-list")).not.toBeNull();
});

test("rest props (aria-label, style, data-*) land on the <dl>", async () => {
	const { container } = await render(DescriptionList, {
		items: ITEMS,
		"aria-label": "Item details",
		style: "--stuic-description-list-label-width: 1fr;",
		"data-testid": "dl",
	});
	const dl = container.querySelector("dl.stuic-description-list")!;
	expect(dl.getAttribute("aria-label")).toBe("Item details");
	expect(dl.getAttribute("data-testid")).toBe("dl");
	expect(
		(dl as HTMLElement).style.getPropertyValue("--stuic-description-list-label-width")
	).toBe("1fr");
});

test("class slots merge onto the right elements", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "L", value: "V", description: "D" }],
		class: "mt-3",
		classItem: "item-x",
		classLabel: "label-x",
		classValue: "value-x",
		classDescription: "desc-x",
	});
	const dl = container.querySelector("dl")!;
	expect(dl.classList.contains("stuic-description-list")).toBe(true);
	expect(dl.classList.contains("mt-3")).toBe(true);
	const row = dl.querySelector("div")!;
	expect(row.classList.contains("stuic-description-list-item")).toBe(true);
	expect(row.classList.contains("item-x")).toBe(true);
	expect(row.querySelector("dt")!.classList.contains("label-x")).toBe(true);
	const dds = row.querySelectorAll("dd");
	expect(dds[0].classList.contains("value-x")).toBe(true);
	expect(dds[1].classList.contains("desc-x")).toBe(true);
});

test("THC values render html and components, not escaped text", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: { html: "<em>Code</em>" }, value: { html: "<b>X</b>" } }],
	});
	expect(container.querySelector("dt em")).not.toBeNull();
	expect(container.querySelector("dd b")).not.toBeNull();
});

test("a snippet description is not dropped", async () => {
	const { container } = await render(DescriptionList, {
		items: [{ label: "L", value: "V", description: text("qualifier") }],
	});
	const dds = container.querySelectorAll("dd");
	expect(dds).toHaveLength(2);
	expect(dds[1].textContent).toBe("qualifier");
});
