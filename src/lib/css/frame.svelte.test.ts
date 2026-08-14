import { expect, test, afterEach } from "vitest";
// STUIC centralizes CSS (nothing self-imports it), so the browser harness ships no
// styles by default — load the preset under test explicitly.
import "./frame.css";
import { isFixedContainingBlock } from "../utils/containing-block.js";

// Runs in real Chromium. Every assertion below is a regression lock on a measured
// browser behavior documented in docs/RATIO_LOCKED_FRAME.md — the formula itself,
// plus the four traps that fail SILENTLY (wrong-looking-correct output, no error).
//
// The browser viewport is fixed by the harness, so both binding directions are
// driven by varying the RATIO, not the window.

const created: HTMLElement[] = [];

/** Measured, not assumed: `100vw` / `100dvh` in this harness right now. */
function viewport(): { vw: number; dvh: number } {
	const probe = document.createElement("div");
	probe.style.cssText =
		"position:fixed;left:0;top:0;width:100vw;height:100dvh;visibility:hidden";
	document.body.appendChild(probe);
	const { width, height } = probe.getBoundingClientRect();
	probe.remove();
	return { vw: width, dvh: height };
}

function el(
	className: string,
	style = "",
	parentStyle = "display:grid;place-items:center"
): HTMLElement {
	const parent = document.createElement("div");
	parent.style.cssText = parentStyle;
	const node = document.createElement("div");
	node.className = className;
	node.style.cssText = style;
	parent.appendChild(node);
	document.body.appendChild(parent);
	created.push(parent);
	return node;
}

afterEach(() => {
	while (created.length) created.pop()!.remove();
});

// `aspect-ratio`-derived and `min()`-derived lengths can disagree in the last
// fractional pixel; anything looser would stop catching real breakage.
const near = (actual: number, expected: number) =>
	expect(Math.abs(actual - expected)).toBeLessThan(0.05);

test("ratio-locked when the HEIGHT is the binding axis", () => {
	const { vw, dvh } = viewport();
	const r = 0.25;
	const box = el(
		"stuic-frame",
		`--stuic-frame-aspect-ratio:${r}`
	).getBoundingClientRect();

	near(box.width, Math.min(vw, dvh * r));
	near(box.height, Math.min(vw, dvh * r) / r);
	near(box.width / box.height, r);
});

test("ratio-locked when the WIDTH is the binding axis", () => {
	const { vw, dvh } = viewport();
	const r = 3;
	const box = el(
		"stuic-frame",
		`--stuic-frame-aspect-ratio:${r}`
	).getBoundingClientRect();

	near(box.width, Math.min(vw, dvh * r));
	near(box.height, Math.min(vw, dvh * r) / r);
	near(box.width / box.height, r);
});

test("the `w / h` ratio form works too (it is only DIVISION that needs parens)", () => {
	const { vw, dvh } = viewport();
	const box = el(
		"stuic-frame",
		"--stuic-frame-aspect-ratio:16 / 9"
	).getBoundingClientRect();

	near(box.width, Math.min(vw, dvh * (16 / 9)));
	near(box.width / box.height, 16 / 9);
});

// The FR proposed deriving the width at :root (`--stuic-frame-width: min(...)`
// referencing the ratio). That resolves EAGERLY, so these two overrides would be
// silent no-ops — the documented anti-pattern in docs/conventions.md.
test("a ratio override scoped to the ELEMENT takes effect", () => {
	const { vw, dvh } = viewport();
	const base = el("stuic-frame").getBoundingClientRect();
	const scoped = el(
		"stuic-frame",
		"--stuic-frame-aspect-ratio:0.25"
	).getBoundingClientRect();

	near(scoped.width, Math.min(vw, dvh * 0.25));
	expect(scoped.width).not.toBeCloseTo(base.width, 0);
});

test("a ratio override scoped to an ANCESTOR takes effect", () => {
	const { vw, dvh } = viewport();
	const base = el("stuic-frame").getBoundingClientRect();
	const scoped = el(
		"stuic-frame",
		"",
		"display:grid;place-items:center;--stuic-frame-aspect-ratio:0.25"
	).getBoundingClientRect();

	near(scoped.width, Math.min(vw, dvh * 0.25));
	expect(scoped.width).not.toBeCloseTo(base.width, 0);
});

test("--stuic-frame-width overrides the derived width wholesale (the bail-out)", () => {
	const { vw } = viewport();
	const box = el(
		"stuic-frame",
		"--stuic-frame-aspect-ratio:0.25;--stuic-frame-width:100vw"
	).getBoundingClientRect();

	near(box.width, vw);
});

test("--stuic-frame-height beats aspect-ratio (no !important needed)", () => {
	const { dvh } = viewport();
	// 50dvh, not 100dvh: at a height-binding ratio the ratio-derived height IS 100dvh,
	// so asserting that would pass just as well against `height: auto`.
	const box = el(
		"stuic-frame",
		"--stuic-frame-aspect-ratio:0.25;--stuic-frame-height:50dvh"
	).getBoundingClientRect();

	near(box.height, dvh / 2);
});

test("a tall child does not stretch the frame off-ratio", () => {
	const r = 0.5;
	const frame = el("stuic-frame", `--stuic-frame-aspect-ratio:${r}`);
	const tall = document.createElement("div");
	tall.style.cssText = "height:3000px";
	frame.appendChild(tall);

	// Without `min-height:0` + `overflow:hidden` the grid item's automatic minimum
	// size wins over aspect-ratio and this measures ~0.117 instead of 0.5.
	near(frame.getBoundingClientRect().width / frame.getBoundingClientRect().height, r);
});

test(".stuic-frame-col resolves with NOTHING declaring --stuic-frame-width", () => {
	const { vw, dvh } = viewport();
	const r = 0.25;
	const col = el(
		"stuic-frame-col",
		`--stuic-frame-aspect-ratio:${r}`,
		"width:100%"
	).getBoundingClientRect();

	// A bare `var(--stuic-frame-width)` would be invalid-at-computed-value-time
	// here -> `width:auto` -> silently full-bleed. Hence the repeated fallback.
	near(col.width, Math.min(vw, dvh * r));
	expect(col.width).toBeLessThan(vw);
});

test(".stuic-frame-cq sizes against an ancestor size container, not the viewport", () => {
	const { vw, dvh } = viewport();
	const frame = el(
		"stuic-frame stuic-frame-cq",
		"--stuic-frame-aspect-ratio:1",
		"container-type:size;width:300px;height:200px;display:grid;place-items:center"
	).getBoundingClientRect();

	near(frame.width, 200); // min(300cqw, 200cqh * 1)
	near(frame.height, 200);
	expect(frame.width).not.toBeCloseTo(Math.min(vw, dvh), 0);
});

test("containment traps fixed descendants; container-type does NOT", () => {
	// The preset ships neither — both are Tailwind utilities — but the docs tell
	// consumers which one to reach for, so lock the distinction here.
	const contained = el("", "contain:layout paint");
	const queried = el("", "container-type:size;width:300px;height:200px");

	expect(isFixedContainingBlock(contained)).toBe(true);
	expect(isFixedContainingBlock(queried)).toBe(false);
});

test("the default aspect ratio is 1 — an unset ratio is an obvious square", () => {
	const { vw, dvh } = viewport();
	const box = el("stuic-frame").getBoundingClientRect();

	// A plausible default would ship a plausible-looking WRONG layout; a square is
	// unmistakably "you forgot to set the ratio".
	near(box.width, Math.min(vw, dvh));
	near(box.height, Math.min(vw, dvh));
});

test("min-height:0 keeps the ratio even when the consumer sets overflow-visible", () => {
	const r = 0.5;
	// `overflow: hidden` and `min-height: 0` each fix G13 alone, so a test with both in
	// play cannot show that either is load-bearing. Turning overflow off isolates
	// min-height:0 — which is exactly the declaration a "cleanup" would delete.
	const frame = el("stuic-frame", `--stuic-frame-aspect-ratio:${r};overflow:visible`);
	const tall = document.createElement("div");
	tall.style.cssText = "height:3000px";
	frame.appendChild(tall);

	const box = frame.getBoundingClientRect();
	near(box.width / box.height, r);
});

test(".stuic-frame centres itself in a plain block parent", () => {
	const frame = el(
		"stuic-frame",
		"--stuic-frame-aspect-ratio:0.25",
		"width:400px;height:900px"
	);
	const parent = frame.parentElement!.getBoundingClientRect();
	const box = frame.getBoundingClientRect();

	// `margin: auto` — in normal flow the block-axis autos are 0 and this is the
	// inline centring that makes the letterbox bars symmetrical.
	near(box.left - parent.left, parent.right - box.right);
	expect(box.width).toBeLessThan(parent.width);
});

test(".stuic-frame-col centres itself (margin-inline: auto)", () => {
	const col = el("stuic-frame-col", "--stuic-frame-aspect-ratio:0.25", "width:400px");
	const parent = col.parentElement!.getBoundingClientRect();
	const box = col.getBoundingClientRect();

	near(box.left - parent.left, parent.right - box.right);
	expect(box.width).toBeLessThan(parent.width);
});

test("the preset lives in @layer components, so utilities win", () => {
	// The escape hatch is the preset's central API guarantee: unlayering these rules
	// would silently invert it (they would then beat every Tailwind utility).
	const layered = [...document.styleSheets].some((sheet) => {
		let rules: CSSRuleList;
		try {
			rules = sheet.cssRules;
		} catch {
			return false; // cross-origin sheet
		}
		return [...rules].some(
			(rule) =>
				rule instanceof CSSLayerBlockRule &&
				rule.name === "components" &&
				[...rule.cssRules].some((inner) =>
					(inner as CSSStyleRule).selectorText?.includes(".stuic-frame")
				)
		);
	});

	expect(layered).toBe(true);
});
