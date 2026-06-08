import { expect, test, afterEach } from "vitest";
import { clampIntoViewport } from "./anchor-position.js";

// THE HARD PROOF (docs/component-testing/04-hard-cases-and-e2e.md, Candidate A).
//
// clampIntoViewport is the JS backstop for CSS Anchor Positioning: it force-
// measures getBoundingClientRect and reads window.innerWidth/innerHeight, then
// applies a corrective translate so an anchored element never paints off-screen.
// This is the textbook "jsdom returns all-zeros from getBoundingClientRect" case
// — it can ONLY be exercised in a real browser. Guards the regression fixed in
// 9d8c974 ("clamp anchor-positioned annotations to viewport on all paths").

const MARGIN = 8;
const created: HTMLElement[] = [];

function box(styles: Partial<CSSStyleDeclaration>): HTMLElement {
	const el = document.createElement("div");
	Object.assign(el.style, {
		position: "fixed",
		width: "100px",
		height: "40px",
		background: "red",
		...styles,
	});
	document.body.appendChild(el);
	created.push(el);
	return el;
}

afterEach(() => {
	while (created.length) created.pop()!.remove();
});

test("element overflowing the left edge is pushed in to the margin", () => {
	const el = box({ left: "-50px", top: "100px" }); // left rect = -50
	clampIntoViewport(el, MARGIN);
	expect(el.getBoundingClientRect().left).toBeCloseTo(MARGIN, 0);
});

test("element overflowing the right edge is pulled in to the margin", () => {
	// left so far right that right edge overshoots the viewport by ~80px
	const el = box({ left: `${window.innerWidth - 20}px`, top: "100px" });
	clampIntoViewport(el, MARGIN);
	expect(el.getBoundingClientRect().right).toBeCloseTo(window.innerWidth - MARGIN, 0);
});

test("element overflowing the top edge is pushed down to the margin", () => {
	const el = box({ left: "100px", top: "-30px" });
	clampIntoViewport(el, MARGIN);
	expect(el.getBoundingClientRect().top).toBeCloseTo(MARGIN, 0);
});

test("element overflowing the bottom edge is pulled up to the margin", () => {
	const el = box({ left: "100px", top: `${window.innerHeight - 10}px` });
	clampIntoViewport(el, MARGIN);
	expect(el.getBoundingClientRect().bottom).toBeCloseTo(window.innerHeight - MARGIN, 0);
});

test("corner overflow clamps on both axes with a single transform", () => {
	const el = box({ left: "-40px", top: "-40px" });
	clampIntoViewport(el, MARGIN);
	const r = el.getBoundingClientRect();
	expect(r.left).toBeCloseTo(MARGIN, 0);
	expect(r.top).toBeCloseTo(MARGIN, 0);
	expect(el.style.transform).toMatch(/^translate\(/);
});

test("an element already inside the viewport is left untouched (no transform)", () => {
	const el = box({ left: "100px", top: "100px" });
	clampIntoViewport(el, MARGIN);
	expect(el.style.transform).toBe("");
});

test("a custom margin is honored", () => {
	const el = box({ left: "-50px", top: "100px" });
	clampIntoViewport(el, 24);
	expect(el.getBoundingClientRect().left).toBeCloseTo(24, 0);
});

test("a prior correction is cleared and recomputed (idempotent across calls)", () => {
	const el = box({ left: "-50px", top: "100px" });
	clampIntoViewport(el, MARGIN);
	const first = el.style.transform;
	// calling again must not double-correct — it re-measures from the natural rect
	clampIntoViewport(el, MARGIN);
	expect(el.style.transform).toBe(first);
	expect(el.getBoundingClientRect().left).toBeCloseTo(MARGIN, 0);
});
