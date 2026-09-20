import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Gantt, { type GanttRow } from "./Gantt.svelte";
// the layout tests at the bottom need the real stylesheet; the rest do not care
import "./index.css";

// Note: browser tests don't load the component index.css, so nothing here asserts
// computed layout — the geometry contract is the *declared* `left`/`width`, which
// is exactly what `gantt-geometry.test.ts` computes and this file wires up.

const WINDOW = { from: "2026-09-01", to: "2026-09-10", locale: "en-US" }; // 10 day columns

const ROWS: GanttRow[] = [
	{
		id: "a",
		label: "Design",
		description: "2 people",
		bars: [{ from: "2026-09-01", to: "2026-09-02", label: "Wireframes" }],
	},
	{
		id: "b",
		label: "Build",
		bars: [{ from: "2026-09-03", to: "2026-09-06", intent: "primary", progress: 0.5 }],
	},
];

const bars = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>(".stuic-gantt-bar")];
const units = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-gantt-unit"),
];
const groups = (c: HTMLElement) =>
	[...c.querySelectorAll<HTMLElement>(".stuic-gantt-group")].map((g) =>
		g.textContent?.trim()
	);
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// ============================================================================
// axis
// ============================================================================

test("day axis: a unit cell per day, grouped by month, weekends and today flagged", async () => {
	const { container } = await render(Gantt, {
		rows: ROWS,
		...WINDOW,
		today: "2026-09-03",
	});
	const u = units(container);
	expect(u.length).toBe(10);
	expect(u[0].getAttribute("data-date")).toBe("2026-09-01");
	expect(u.at(-1)!.getAttribute("data-date")).toBe("2026-09-10");
	expect(groups(container)).toEqual(["Sep 2026"]);

	// 2026-09-05 / -06 are Sat / Sun
	expect(
		u.filter((x) => x.hasAttribute("data-weekend")).map((x) => x.dataset.date)
	).toEqual(["2026-09-05", "2026-09-06"]);
	expect(
		u.filter((x) => x.hasAttribute("data-today")).map((x) => x.dataset.date)
	).toEqual(["2026-09-03"]);
	expect(container.querySelector("[data-today-marker]")).not.toBeNull();
});

test("today={null} removes the marker line and the header flag", async () => {
	const { container } = await render(Gantt, { rows: ROWS, ...WINDOW, today: null });
	expect(container.querySelector("[data-today-marker]")).toBeNull();
	expect(units(container).some((u) => u.hasAttribute("data-today"))).toBe(false);
});

test("unit=month: one column per month, grouped by year", async () => {
	const { container } = await render(Gantt, {
		rows: [{ bars: [{ from: "2026-01-15", to: "2026-03-02" }] }],
		unit: "month",
		locale: "en-US",
		today: null,
	});
	expect(units(container).map((u) => u.dataset.date)).toEqual([
		"2026-01-01",
		"2026-02-01",
		"2026-03-01",
	]);
	expect(groups(container)).toEqual(["2026"]);
});

test("the window defaults to the extent of the bars", async () => {
	const { container } = await render(Gantt, {
		rows: [{ bars: [{ from: "2026-09-04", to: "2026-09-06" }] }],
		locale: "en-US",
		today: null,
	});
	expect(units(container).map((u) => u.dataset.date)).toEqual([
		"2026-09-04",
		"2026-09-05",
		"2026-09-06",
	]);
});

test("unitWidth sets the zoom token; 'fit' switches to the flexible layout", async () => {
	const px = await render(Gantt, { rows: ROWS, ...WINDOW, unitWidth: 64 });
	const root = px.container.querySelector<HTMLElement>(".stuic-gantt")!;
	expect(root.style.getPropertyValue("--stuic-gantt-unit-width")).toBe("64px");
	expect(root.style.getPropertyValue("--_gantt-columns")).toBe("10");
	expect(root.hasAttribute("data-fit")).toBe(false);

	const fit = await render(Gantt, { rows: ROWS, ...WINDOW, unitWidth: "fit" });
	const fitRoot = fit.container.querySelector<HTMLElement>(".stuic-gantt")!;
	expect(fitRoot.hasAttribute("data-fit")).toBe(true);
	expect(fitRoot.style.getPropertyValue("--stuic-gantt-unit-width")).toBe("");
});

// ============================================================================
// bars
// ============================================================================

test("bars are placed as percentages of the track, both ends inclusive", async () => {
	const { container } = await render(Gantt, { rows: ROWS, ...WINDOW, today: null });
	const b = bars(container);
	expect(b.length).toBe(2);
	// Sep 1–2 of a Sep 1–10 window: columns 0..1 of 10
	expect(b[0].style.left).toBe("0%");
	expect(b[0].style.width).toBe("20%");
	// Sep 3–6: columns 2..5
	expect(b[1].style.left).toBe("20%");
	expect(b[1].style.width).toBe("40%");
	expect(b[1].getAttribute("data-intent")).toBe("primary");
	expect(b[1].getAttribute("data-kind")).toBe("bar");
});

test("an overhanging bar is clipped to the window and flagged on both ends", async () => {
	const { container } = await render(Gantt, {
		rows: [{ bars: [{ from: "2026-08-01", to: "2026-10-01" }] }],
		...WINDOW,
		today: null,
	});
	const bar = bars(container)[0];
	expect(bar.style.left).toBe("0%");
	expect(bar.style.width).toBe("100%");
	expect(bar.hasAttribute("data-clipped-start")).toBe(true);
	expect(bar.hasAttribute("data-clipped-end")).toBe(true);
});

test("a bar outside the window is dropped, not pinned to an edge", async () => {
	const { container } = await render(Gantt, {
		rows: [
			{ label: "x", bars: [{ from: "2026-01-01", to: "2026-01-05" }] },
			{ label: "y", bars: [{ from: "2026-09-02", to: "2026-09-02" }] },
		],
		...WINDOW,
		today: null,
	});
	// the row still renders (its label is the point of the left column) — only the bar is gone
	expect(container.querySelectorAll(".stuic-gantt-row").length).toBe(2);
	expect(bars(container).length).toBe(1);
});

test("progress renders a clamped fill; a milestone gets a point and no width", async () => {
	const { container } = await render(Gantt, {
		rows: [
			{ bars: [{ from: "2026-09-01", to: "2026-09-10", progress: 2 }] },
			{ bars: [{ from: "2026-09-06", milestone: true, label: "Ship" }] },
		],
		...WINDOW,
		today: null,
	});
	const fill = container.querySelector<HTMLElement>(".stuic-gantt-bar-progress")!;
	expect(fill.style.width).toBe("100%"); // 2 clamped to 1

	const milestone = bars(container)[1];
	expect(milestone.getAttribute("data-kind")).toBe("milestone");
	expect(milestone.style.left).toBe("55%"); // middle of the 6th of 10 columns
	expect(milestone.style.width).toBe("");
	expect(container.querySelector(".stuic-gantt-bar-progress")).toBe(fill); // none on the milestone
});

test("inset marks the emphasis bar drawn inside a wider one", async () => {
	const { container } = await render(Gantt, {
		rows: [
			{
				bars: [
					{ from: "2026-09-01", to: "2026-09-08" },
					{ from: "2026-09-03", to: "2026-09-05", inset: true },
				],
			},
		],
		...WINDOW,
		today: null,
	});
	expect(bars(container).map((b) => b.hasAttribute("data-inset"))).toEqual([false, true]);
});

// ============================================================================
// interaction + a11y
// ============================================================================

test("without onSelect a bar is a non-interactive img; with it, a button", async () => {
	const plain = await render(Gantt, { rows: ROWS, ...WINDOW, today: null });
	const span = bars(plain.container)[0];
	expect(span.tagName).toBe("SPAN");
	expect(span.getAttribute("role")).toBe("img");

	const onSelect = vi.fn();
	const clickable = await render(Gantt, { rows: ROWS, ...WINDOW, today: null, onSelect });
	const button = bars(clickable.container)[0];
	expect(button.tagName).toBe("BUTTON");
	expect(button.getAttribute("type")).toBe("button");
	expect(button.getAttribute("role")).toBeNull();
});

test("onSelect fires once with the bar, its row and both indexes", async () => {
	const onSelect = vi.fn();
	const screen = await render(Gantt, { rows: ROWS, ...WINDOW, today: null, onSelect });
	await screen.getByRole("button").nth(1).click();
	expect(onSelect).toHaveBeenCalledOnce();
	const detail = onSelect.mock.calls[0][0];
	expect(detail.rowIndex).toBe(1);
	expect(detail.barIndex).toBe(0);
	expect(detail.row.id).toBe("b");
	expect(detail.bar.intent).toBe("primary");
	expect(detail.placement.days).toBe(4);
	expect(detail.point).toBe(null);
});

test("a disabled bar is inert: a span, aria-disabled, and no callback", async () => {
	const onSelect = vi.fn();
	const { container } = await render(Gantt, {
		rows: [{ label: "x", bars: [{ from: "2026-09-02", disabled: true, href: "/x" }] }],
		...WINDOW,
		today: null,
		onSelect,
	});
	const bar = bars(container)[0];
	expect(bar.tagName).toBe("SPAN");
	expect(bar.getAttribute("aria-disabled")).toBe("true");
	expect(bar.hasAttribute("href")).toBe(false);
	bar.click();
	expect(onSelect).not.toHaveBeenCalled();
});

test("href renders a link, and the row's href links its label", async () => {
	const { container } = await render(Gantt, {
		rows: [
			{ label: "Build", href: "/rows/b", bars: [{ from: "2026-09-02", href: "/b" }] },
		],
		...WINDOW,
		today: null,
	});
	const bar = bars(container)[0];
	expect(bar.tagName).toBe("A");
	expect(bar.getAttribute("href")).toBe("/b");
	expect(
		container.querySelector<HTMLAnchorElement>(".stuic-gantt-row-link")!.href
	).toContain("/rows/b");
});

test("default accessible name is the row + bar label and the localized range", async () => {
	const { container } = await render(Gantt, { rows: ROWS, ...WINDOW, today: null });
	expect(bars(container)[0].getAttribute("aria-label")).toBe(
		"Design – Wireframes: Sep 1 – 2, 2026"
	);
	// a single day is not a range
	expect(bars(container)[1].getAttribute("aria-label")).toBe("Build: Sep 3 – 6, 2026");
});

test("formatBarAria overrides the accessible name", async () => {
	const { container } = await render(Gantt, {
		rows: ROWS,
		...WINDOW,
		today: null,
		formatBarAria: (d) => `row ${d.rowIndex}`,
	});
	expect(bars(container).map((b) => b.getAttribute("aria-label"))).toEqual([
		"row 0",
		"row 1",
	]);
});

// ============================================================================
// labels, overrides, empty
// ============================================================================

test("the label column appears only when a row has a label, and labels= forces it", async () => {
	const withLabels = await render(Gantt, { rows: ROWS, ...WINDOW, today: null });
	expect(
		withLabels.container.querySelector(".stuic-gantt")!.hasAttribute("data-labels")
	).toBe(true);
	expect(withLabels.container.querySelectorAll(".stuic-gantt-row-label").length).toBe(2);

	const without = await render(Gantt, {
		rows: [{ bars: [{ from: "2026-09-02" }] }],
		...WINDOW,
		today: null,
	});
	expect(
		without.container.querySelector(".stuic-gantt")!.hasAttribute("data-labels")
	).toBe(false);
	expect(without.container.querySelector(".stuic-gantt-corner")).toBeNull();

	const forced = await render(Gantt, {
		rows: [{ bars: [{ from: "2026-09-02" }] }],
		...WINDOW,
		today: null,
		labels: true,
	});
	expect(forced.container.querySelectorAll(".stuic-gantt-row-label").length).toBe(1);
});

test("formatColumn / formatGroup replace the header text", async () => {
	const { container } = await render(Gantt, {
		rows: ROWS,
		...WINDOW,
		today: null,
		formatColumn: (c) => c.date.slice(5),
		formatGroup: (g) => `[${g.span}]`,
	});
	expect(units(container)[0].textContent?.trim()).toBe("09-01");
	expect(groups(container)).toEqual(["[10]"]);
});

test("the empty snippet replaces the rows but keeps the axis", async () => {
	const { container } = await render(Gantt, {
		rows: [],
		...WINDOW,
		today: null,
		empty: text("Nothing planned"),
	});
	expect(units(container).length).toBe(10);
	expect(container.querySelector(".stuic-gantt-empty")?.textContent).toContain(
		"Nothing planned"
	);
	expect(bars(container).length).toBe(0);
});

test("unstyled drops every stuic class but keeps the data contract", async () => {
	const { container } = await render(Gantt, {
		rows: ROWS,
		...WINDOW,
		today: "2026-09-03",
		unstyled: true,
	});
	expect(container.querySelector(".stuic-gantt")).toBeNull();
	expect(container.querySelector(".stuic-gantt-bar")).toBeNull();
	const root = container.querySelector<HTMLElement>("[data-unit]")!;
	expect(root.getAttribute("data-unit")).toBe("day");
	expect(root.getAttribute("data-labels")).toBe("");
	expect(container.querySelectorAll("[data-date]").length).toBe(10);
	expect(container.querySelectorAll('[data-kind="bar"]').length).toBe(2);
});

// ============================================================================
// layout — the only assertions here that need the real stylesheet
//
// Everything above is attribute-level and runs without CSS. These three bugs
// were not: the frame sized itself to its own axis instead of its parent, the
// grid layer (which the today line is positioned inside) stopped matching the
// track whenever the axis was narrower than the frame, and a bar label reaching
// past its bar put a horizontal scrollbar on a chart that fit. Importing the
// component's stylesheet is what makes them assertable at all.
// ============================================================================

const WIDE: GanttRow[] = [
	{ label: "r", bars: [{ from: "2026-09-01", to: "2026-09-02" }] },
];

/** Render into a parent of a known width and hand back the measurables. */
async function measure(props: Record<string, unknown>, parentWidth: number) {
	const { container } = await render(Gantt, props as never);
	container.style.width = `${parentWidth}px`;
	// one frame for flex to resolve against the new parent width
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	const q = <T extends HTMLElement>(s: string) => container.querySelector<T>(s);
	const w = (s: string) => {
		const el = q(s);
		return el ? Math.round(el.getBoundingClientRect().width) : null;
	};
	const vp = q(".stuic-gantt-viewport")!;
	return {
		parent: Math.round(container.getBoundingClientRect().width),
		viewport: w(".stuic-gantt-viewport"),
		grid: w(".stuic-gantt-grid"),
		units: w(".stuic-gantt-units"),
		track: w(".stuic-gantt-track"),
		unit: w(".stuic-gantt-unit"),
		hScroll: vp.scrollWidth - vp.clientWidth,
	};
}

test("the frame fills its parent, and a narrow axis grows into it instead of leaving a gutter", async () => {
	// 10 columns × the 2.5rem default = 400px of basis inside a 900px parent
	const m = await measure({ rows: WIDE, ...WINDOW, today: null }, 900);
	expect(m.viewport).toBe(m.parent);
	expect(m.hScroll).toBe(0);
	// the columns shared out the spare width rather than staying at 40px
	expect(m.unit).toBeGreaterThan(40);
	expect(m.track).toBe(m.grid);
	expect(m.units).toBe(m.grid);
});

test("a wide axis keeps its unitWidth and scrolls, still grid-aligned", async () => {
	const m = await measure({ rows: WIDE, ...WINDOW, today: null, unitWidth: 80 }, 300);
	expect(m.viewport).toBe(m.parent);
	expect(m.hScroll).toBeGreaterThan(0);
	expect(m.unit).toBe(80);
	expect(m.track).toBe(800); // 10 × 80, not shrunk
	expect(m.grid).toBe(m.track);
	expect(m.units).toBe(m.track);
});

test("a label reaching past its bar does not add horizontal scroll", async () => {
	// a milestone on the LAST day: its label always renders outside the bar
	const m = await measure(
		{
			rows: [{ bars: [{ from: "2026-09-10", milestone: true, label: "Go live" }] }],
			...WINDOW,
			today: null,
		},
		900
	);
	expect(m.hScroll).toBe(0);
});

test("unitWidth='fit' never scrolls horizontally, however many columns", async () => {
	const m = await measure(
		{
			rows: WIDE,
			from: "2026-01-01",
			to: "2026-12-31",
			locale: "en-US",
			today: null,
			unitWidth: "fit",
		},
		400
	);
	expect(m.viewport).toBe(m.parent);
	expect(m.hScroll).toBe(0);
	expect(m.grid).toBe(m.units);
});
