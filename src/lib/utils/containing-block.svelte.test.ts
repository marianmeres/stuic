import { expect, test, afterEach } from "vitest";
import {
	fixedContainingBlockAncestor,
	fixedContainingBlockRect,
	isFixedContainingBlock,
} from "./containing-block.js";

// Runs in real Chromium — getComputedStyle/getBoundingClientRect are live, so
// each containing-block trigger can be exercised for real (jsdom would return
// zeroed rects and empty computed styles).

const created: HTMLElement[] = [];

function ancestor(styles: Partial<CSSStyleDeclaration>): {
	parent: HTMLElement;
	child: HTMLElement;
} {
	const parent = document.createElement("div");
	Object.assign(parent.style, {
		position: "absolute",
		left: "60px",
		top: "40px",
		width: "300px",
		height: "200px",
		...styles,
	});
	const child = document.createElement("div");
	child.style.position = "fixed";
	parent.appendChild(child);
	document.body.appendChild(parent);
	created.push(parent);
	return { parent, child };
}

afterEach(() => {
	while (created.length) created.pop()!.remove();
});

test("no CB ancestor -> viewport rect (the BC guarantee)", () => {
	const el = document.createElement("div");
	el.style.position = "fixed";
	document.body.appendChild(el);
	created.push(el);
	const r = fixedContainingBlockRect(el);
	expect(r.left).toBe(0);
	expect(r.top).toBe(0);
	expect(r.width).toBe(window.innerWidth);
	expect(r.height).toBe(window.innerHeight);
});

// each CSS mechanism that forms a fixed containing block, one by one
for (const [label, styles] of Object.entries({
	transform: { transform: "translateZ(0)" },
	"translate (individual property)": { translate: "1px" },
	"rotate (individual property)": { rotate: "1deg" },
	"scale (individual property)": { scale: "1" },
	perspective: { perspective: "100px" },
	filter: { filter: "blur(0px)" },
	"backdrop-filter": { backdropFilter: "blur(0px)" },
	"will-change: transform": { willChange: "transform" },
	"contain: layout": { contain: "layout" },
	"contain: paint": { contain: "paint" },
	"contain: strict": { contain: "strict" },
	"contain: content": { contain: "content" },
	"content-visibility: auto": { contentVisibility: "auto" },
} as Record<string, Partial<CSSStyleDeclaration>>)) {
	test(`${label} ancestor is detected and its box returned`, () => {
		const { parent, child } = ancestor(styles);
		expect(isFixedContainingBlock(parent)).toBe(true);
		const r = fixedContainingBlockRect(child);
		const p = parent.getBoundingClientRect();
		expect(r.left).toBeCloseTo(p.left, 1);
		expect(r.top).toBeCloseTo(p.top, 1);
		expect(r.width).toBeCloseTo(p.width, 1);
		expect(r.height).toBeCloseTo(p.height, 1);
	});
}

test("container-type: inline-size does NOT form a fixed CB (CSSWG removed layout containment from it; Chrome 129+)", () => {
	const { parent, child } = ancestor({ containerType: "inline-size" });
	expect(isFixedContainingBlock(parent)).toBe(false);
	const r = fixedContainingBlockRect(child);
	expect(r.width).toBe(window.innerWidth);
	expect(r.height).toBe(window.innerHeight);
});

test("plain positioned/overflow ancestors do not form a fixed CB", () => {
	const { parent, child } = ancestor({
		position: "relative",
		overflow: "hidden",
		zIndex: "5",
	});
	expect(isFixedContainingBlock(parent)).toBe(false);
	const r = fixedContainingBlockRect(child);
	expect(r.width).toBe(window.innerWidth);
});

test("the NEAREST CB-forming ancestor wins", () => {
	const { parent: outer } = ancestor({ transform: "translateZ(0)" });
	const inner = document.createElement("div");
	Object.assign(inner.style, {
		position: "absolute",
		left: "10px",
		top: "20px",
		width: "100px",
		height: "50px",
		contain: "layout",
	});
	const child = document.createElement("div");
	child.style.position = "fixed";
	inner.appendChild(child);
	outer.appendChild(inner);

	const r = fixedContainingBlockRect(child);
	const i = inner.getBoundingClientRect();
	expect(r.left).toBeCloseTo(i.left, 1);
	expect(r.width).toBeCloseTo(i.width, 1);
});

test("returns the PADDING box of the CB ancestor (border excluded)", () => {
	const { parent, child } = ancestor({
		transform: "translateZ(0)",
		border: "7px solid red",
		padding: "5px", // padding stays INSIDE the CB box
	});
	const r = fixedContainingBlockRect(child);
	const p = parent.getBoundingClientRect();
	expect(r.left).toBeCloseTo(p.left + 7, 1);
	expect(r.top).toBeCloseTo(p.top + 7, 1);
	expect(r.width).toBeCloseTo(p.width - 14, 1);
	expect(r.height).toBeCloseTo(p.height - 14, 1);
});

test("border widths are scaled to visual px under a scaled CB ancestor", () => {
	// scale(0.5): the 20px layout border is 10px on screen — the inset must
	// use the visual thickness, not the computed layout value
	const { parent, child } = ancestor({
		transform: "scale(0.5)",
		border: "20px solid red",
		boxSizing: "content-box",
	});
	const r = fixedContainingBlockRect(child);
	const p = parent.getBoundingClientRect();
	expect(r.left).toBeCloseTo(p.left + 10, 1);
	expect(r.top).toBeCloseTo(p.top + 10, 1);
	expect(r.width).toBeCloseTo(p.width - 20, 1);
	expect(r.height).toBeCloseTo(p.height - 20, 1);
});

test("a modal dialog (top layer) STOPS the walk — fixed descendants resolve against the viewport again", () => {
	// the FR's framed-app case with a ModalDialog inside the frame: the top
	// layer escapes the frame's containing block by design
	const { parent: frame } = ancestor({ contain: "layout paint" });
	const dialog = document.createElement("dialog");
	const child = document.createElement("div");
	child.style.position = "fixed";
	dialog.appendChild(child);
	frame.appendChild(dialog);
	dialog.showModal();
	try {
		expect(fixedContainingBlockAncestor(child)).toBeNull();
		const r = fixedContainingBlockRect(child);
		expect(r.width).toBe(window.innerWidth);
		expect(r.height).toBe(window.innerHeight);
	} finally {
		dialog.close();
	}
});

test("a CB-forming ancestor BELOW the modal dialog still wins (nearest first)", () => {
	const { parent: frame } = ancestor({ contain: "layout paint" });
	const dialog = document.createElement("dialog");
	const inner = document.createElement("div");
	Object.assign(inner.style, {
		transform: "translateZ(0)",
		width: "80px",
		height: "40px",
	});
	const child = document.createElement("div");
	child.style.position = "fixed";
	inner.appendChild(child);
	dialog.appendChild(inner);
	frame.appendChild(dialog);
	dialog.showModal();
	try {
		expect(fixedContainingBlockAncestor(child)).toBe(inner);
	} finally {
		dialog.close();
	}
});

test("a non-modal (show()) dialog does NOT stop the walk", () => {
	// only the top layer escapes containing blocks; a plain open dialog is
	// ordinary flow content
	const { parent: frame } = ancestor({ contain: "layout paint" });
	const dialog = document.createElement("dialog");
	const child = document.createElement("div");
	child.style.position = "fixed";
	dialog.appendChild(child);
	frame.appendChild(dialog);
	dialog.show();
	try {
		expect(fixedContainingBlockAncestor(child)).toBe(frame);
	} finally {
		dialog.close();
	}
});
