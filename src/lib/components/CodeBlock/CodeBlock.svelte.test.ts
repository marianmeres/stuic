import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import { afterEach, expect, onTestFinished, test, vi } from "vitest";
import CodeBlock from "./CodeBlock.svelte";
import CodeBlockFixture from "./CodeBlock.fixture.svelte";
// the scroll/tabindex tests measure real overflow, so they need the real stylesheet
import "./index.css";

// CodeBlock renders <div.stuic-code-block> › optional header <div> (label + CopyButton) ›
// <pre> › <code>. The CopyButton's own contract (feedback, live region, i18n) is proven
// in CopyButton.svelte.test.ts; what's asserted here is what CodeBlock adds: the text it
// displays AND copies (normalized unless `verbatim`), the header rules, the pass-through
// to the button, and the measured keyboard reachability of an overflowing <pre>. The
// clipboard is stubbed, as in CopyButton's test.

function stubClipboard() {
	const writeText = vi.fn(() => Promise.resolve());
	Object.defineProperty(navigator, "clipboard", {
		value: { writeText },
		configurable: true,
	});
	return writeText;
}

afterEach(() => {
	vi.restoreAllMocks();
	if (Object.getOwnPropertyDescriptor(navigator, "clipboard")) {
		delete (navigator as unknown as Record<string, unknown>).clipboard;
	}
});

const ROOT = "div.stuic-code-block";
const q = <T extends Element = HTMLElement>(c: HTMLElement, s: string) =>
	c.querySelector<T & HTMLElement>(s);
const pre = (c: HTMLElement) => q<HTMLPreElement>(c, "pre")!;
const code = (c: HTMLElement) => q(c, "pre > code")!;

const LONG = `curl -H "Authorization: Bearer $ITEMQR_TOKEN" "https://itemqr.app/api/v1/projects/my-wines/items?limit=10&cursor=eyJpZCI6MTIzNH0"`;

// ============================================================================
// structure
// ============================================================================

test("renders root › header (lang label + labelled copy button) › pre › code", async () => {
	const { container } = await render(CodeBlock, { code: "echo hi", lang: "bash" });
	const root = q(container, ROOT)!;
	expect(root).not.toBeNull();
	expect(root.classList.contains("not-prose")).toBe(true);
	expect(root.getAttribute("data-lang")).toBe("bash");
	expect(root.hasAttribute("data-wrap")).toBe(false);

	const header = q(root, ":scope > .stuic-code-block-header")!;
	expect(q(header, ".stuic-code-block-title")!.textContent).toBe("bash");
	const btn = q(header, "button")!;
	expect(btn.classList.contains("stuic-copy-button")).toBe(true);
	expect(btn.classList.contains("stuic-code-block-copy")).toBe(true);
	// borderless by default
	expect(btn.getAttribute("data-variant")).toBe("ghost");
	expect(btn.getAttribute("data-size")).toBe("sm");
	await expect.element(page.getByRole("button", { name: "Copy" })).toBeVisible();

	const p = q(root, ":scope > pre.stuic-code-block-pre")!;
	const c = q(p, ":scope > code")!;
	expect(c.classList.contains("stuic-code-block-code")).toBe(true);
	expect(c.classList.contains("language-bash")).toBe(true);
	expect(c.textContent).toBe("echo hi");
	// nothing but the <code> inside the <pre> — stray whitespace would render
	expect(p.childNodes.length).toBe(1);
});

test("code is rendered as text, never as HTML", async () => {
	const { container } = await render(CodeBlock, { code: "<b>x</b> &amp;" });
	expect(code(container).textContent).toBe("<b>x</b> &amp;");
	expect(q(container, "pre b")).toBeNull();
});

test("a multi-word lang becomes one language-* class", async () => {
	const { container } = await render(CodeBlock, { code: "x", lang: " shell session " });
	expect(code(container).classList.contains("language-shell-session")).toBe(true);
});

// ============================================================================
// the displayed (and copied) text
// ============================================================================

test("drops the blank lines at both ends and the shared indentation", async () => {
	const { container } = await render(CodeBlock, {
		code: '\n\t\t{\n\t\t  "a": 1\n\t\t}\n\t',
	});
	expect(code(container).textContent).toBe('{\n  "a": 1\n}');
});

test("verbatim renders the code exactly as given", async () => {
	const raw = "\n  a\n    b\n";
	const { container } = await render(CodeBlock, { code: raw, verbatim: true });
	expect(code(container).textContent).toBe(raw);
});

test("copies exactly what is displayed", async () => {
	const writeText = stubClipboard();
	await render(CodeBlock, { code: "\n    echo hi\n      && echo there\n" });
	await page.getByRole("button", { name: "Copy" }).click();
	expect(writeText).toHaveBeenCalledWith("echo hi\n  && echo there");
});

test("copyButtonProps pass through; their `text` overrides what is copied", async () => {
	const writeText = stubClipboard();
	const onCopied = vi.fn();
	const { container } = await render(CodeBlock, {
		code: "$ npm i foo",
		copyButtonProps: {
			text: "npm i foo",
			label: "Copy command",
			variant: "outline",
			onCopied,
			class: "copy-x",
		},
	});
	const btn = q(container, "button")!;
	expect(btn.getAttribute("data-variant")).toBe("outline");
	// merged, not replaced
	expect(btn.classList.contains("copy-x")).toBe(true);
	expect(btn.classList.contains("stuic-code-block-copy")).toBe(true);
	await page.getByRole("button", { name: "Copy command" }).click();
	expect(writeText).toHaveBeenCalledWith("npm i foo");
	expect(onCopied).toHaveBeenCalledWith("npm i foo");
	// the display is untouched
	expect(code(container).textContent).toBe("$ npm i foo");
});

test("the copy button follows a changed `code`", async () => {
	const writeText = stubClipboard();
	const { rerender } = await render(CodeBlock, { code: "one" });
	await rerender({ code: "two" });
	await page.getByRole("button", { name: "Copy" }).click();
	expect(writeText).toHaveBeenCalledWith("two");
});

// ============================================================================
// header rules
// ============================================================================

test("title replaces lang as the label; lang still marks the root and the code", async () => {
	const { container } = await render(CodeBlock, {
		code: "{}",
		lang: "json",
		title: "deno.json",
	});
	expect(q(container, ".stuic-code-block-title")!.textContent).toBe("deno.json");
	expect(q(container, ROOT)!.getAttribute("data-lang")).toBe("json");
	expect(code(container).classList.contains("language-json")).toBe(true);
});

test('title "" hides the label but keeps the copy button', async () => {
	const { container } = await render(CodeBlock, { code: "x", lang: "json", title: "" });
	expect(q(container, ".stuic-code-block-title")).toBeNull();
	expect(q(container, ".stuic-code-block-header button")).not.toBeNull();
});

test("no lang and no title: the header holds just the copy button", async () => {
	const { container } = await render(CodeBlock, { code: "x" });
	expect(q(container, ROOT)!.hasAttribute("data-lang")).toBe(false);
	expect(q(container, ".stuic-code-block-title")).toBeNull();
	expect(q(container, ".stuic-code-block-header button")).not.toBeNull();
	expect(code(container).className).toBe("stuic-code-block-code");
});

test("copy=false: no button; with no label either, no header at all", async () => {
	const labelled = await render(CodeBlock, { code: "x", lang: "bash", copy: false });
	expect(q(labelled.container, ".stuic-code-block-title")!.textContent).toBe("bash");
	expect(q(labelled.container, "button")).toBeNull();
	labelled.unmount();

	const bare = await render(CodeBlock, { code: "x", copy: false });
	expect(q(bare.container, ".stuic-code-block-header")).toBeNull();
	expect(q(bare.container, ROOT)!.firstElementChild!.tagName).toBe("PRE");
});

// ============================================================================
// classes, unstyled, rest
// ============================================================================

test("class slots merge; rest props land on the root", async () => {
	const { container } = await render(CodeBlock, {
		code: "x",
		lang: "bash",
		class: "my-6 root-x",
		classHeader: "header-x",
		classTitle: "title-x",
		classPre: "pre-x",
		classCode: "code-x",
		id: "sample",
		"data-testid": "cb",
	} as never);
	const root = q(container, ROOT)!;
	expect(root.classList.contains("root-x")).toBe(true);
	expect(root.id).toBe("sample");
	expect(root.getAttribute("data-testid")).toBe("cb");
	expect(q(root, ".stuic-code-block-header")!.classList.contains("header-x")).toBe(true);
	expect(q(root, ".stuic-code-block-title")!.classList.contains("title-x")).toBe(true);
	expect(pre(container).classList.contains("pre-x")).toBe(true);
	expect(code(container).classList.contains("code-x")).toBe(true);
	expect(code(container).classList.contains("language-bash")).toBe(true);
});

test("unstyled drops every stuic class (and not-prose) but keeps language-* and the parts", async () => {
	const { container } = await render(CodeBlock, {
		code: "x",
		lang: "bash",
		unstyled: true,
		classPre: "pre-x",
	});
	expect(q(container, "[class*='stuic-']")).toBeNull();
	expect(q(container, ".not-prose")).toBeNull();
	expect(pre(container).className).toBe("pre-x");
	expect(code(container).className).toBe("language-bash");
	// the button is unstyled too, and still works as a labelled button
	await expect.element(page.getByRole("button", { name: "Copy" })).toBeVisible();
});

// ============================================================================
// keyboard reachability of an overflowing <pre> (real stylesheet)
// ============================================================================

test("an overflowing <pre> is a tab stop; one that fits is not", async () => {
	const long = await render(CodeBlock, { code: LONG, style: "width: 240px" });
	await expect
		.element(page.elementLocator(pre(long.container)))
		.toHaveAttribute("tabindex", "0");
	long.unmount();

	const short = await render(CodeBlock, { code: "echo hi", style: "width: 240px" });
	// give the measurement a chance to (wrongly) flip it
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	expect(pre(short.container).hasAttribute("tabindex")).toBe(false);
});

test("wrap: long lines wrap instead of scrolling, so no tab stop", async () => {
	const { container } = await render(CodeBlock, {
		code: LONG,
		wrap: true,
		style: "width: 240px",
	});
	expect(q(container, ROOT)!.getAttribute("data-wrap")).toBe("true");
	const p = pre(container);
	expect(getComputedStyle(p).whiteSpace).toBe("pre-wrap");
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	expect(p.scrollWidth).toBeLessThanOrEqual(p.clientWidth);
	expect(p.hasAttribute("tabindex")).toBe(false);
});

test("re-measured when the box resizes", async () => {
	const { container } = await render(CodeBlock, { code: LONG, style: "width: 240px" });
	const loc = page.elementLocator(pre(container));
	await expect.element(loc).toHaveAttribute("tabindex", "0");
	q(container, ROOT)!.style.width = "3000px";
	await expect.element(loc).not.toHaveAttribute("tabindex");
	q(container, ROOT)!.style.width = "240px";
	await expect.element(loc).toHaveAttribute("tabindex", "0");
});

test("re-measured when only the code changes (same one-line box: no resize to observe)", async () => {
	// the fixture swaps `code` alone — `rerender()` would re-signal every prop
	const { container } = await render(CodeBlockFixture, {
		initial: "echo hi",
		next: LONG,
	});
	const loc = page.elementLocator(pre(container));
	const swap = page.getByRole("button", { name: "swap" });
	await swap.click();
	await expect.element(loc).toHaveAttribute("tabindex", "0");
	await swap.click();
	await expect.element(loc).not.toHaveAttribute("tabindex");
});

test("--stuic-code-block-max-height caps the height; the vertical overflow is a tab stop", async () => {
	const { container } = await render(CodeBlock, {
		code: Array.from({ length: 30 }, (_, i) => `line ${i}`).join("\n"),
		style: "width: 600px; --stuic-code-block-max-height: 120px",
	});
	const p = pre(container);
	expect(p.getBoundingClientRect().height).toBeLessThanOrEqual(120);
	await expect.element(page.elementLocator(p)).toHaveAttribute("tabindex", "0");
});

// ============================================================================
// syntax highlighting (CSS Custom Highlight API: ranges, no markup)
// ============================================================================

/** The text of this block's ranges in the `::highlight(stuic-code-block-<type>)` */
const painted = (c: HTMLElement, type: string) => {
	const root = code(c);
	const h = CSS.highlights.get(`stuic-code-block-${type}`);
	return [...(h ?? [])]
		.filter((r) => root.contains((r as Range).startContainer))
		.map((r) => (r as Range).toString());
};

test("a json sample is painted as ranges; the markup stays a single text node", async () => {
	const { container } = await render(CodeBlock, {
		lang: "json",
		code: '{ "a": "x", "n": 1, "ok": true }',
	});
	await expect.poll(() => painted(container, "property")).toEqual(['"a"', '"n"', '"ok"']);
	expect(painted(container, "string")).toEqual(['"x"']);
	expect(painted(container, "number")).toEqual(["1"]);
	expect(painted(container, "literal")).toEqual(["true"]);
	// no elements, one text node (Svelte's block anchor is a comment)
	expect(code(container).children.length).toBe(0);
	const texts = [...code(container).childNodes].filter(
		(n) => n.nodeType === Node.TEXT_NODE
	);
	expect(texts.length).toBe(1);
});

test("unmount removes exactly this block's ranges", async () => {
	const keep = await render(CodeBlock, { lang: "json", code: '{"keep": 1}' });
	const drop = await render(CodeBlock, { lang: "json", code: '{"drop": 1}' });
	const all = () =>
		[...(CSS.highlights.get("stuic-code-block-property") ?? [])].map((r) =>
			(r as Range).toString()
		);
	await expect.poll(all).toEqual(expect.arrayContaining(['"keep"', '"drop"']));
	drop.unmount();
	expect(all()).toContain('"keep"');
	expect(all()).not.toContain('"drop"');
	keep.unmount();
});

test("highlight=false and unknown languages paint nothing", async () => {
	const off = await render(CodeBlock, {
		lang: "json",
		code: '{"a": 1}',
		highlight: false,
	});
	const ts = await render(CodeBlock, { lang: "ts", code: 'const a = "x"' });
	await new Promise((r) => requestAnimationFrame(r));
	expect(painted(off.container, "property")).toEqual([]);
	expect(painted(ts.container, "string")).toEqual([]);
});

test("a custom highlighter gets the displayed text and lang; custom types are allowed", async () => {
	const highlight = vi.fn(
		(_text: string, _lang?: string) => [[0, 4, "my type"]] as [number, number, string][]
	);
	const { container } = await render(CodeBlock, {
		lang: "ts",
		code: "\n    const a\n",
		highlight,
	});
	await expect.poll(() => painted(container, "my-type")).toEqual(["cons"]);
	expect(highlight).toHaveBeenCalledWith("const a", "ts");
});

test("a throwing highlighter leaves the sample readable", async () => {
	const error = vi.spyOn(console, "error").mockImplementation(() => {});
	const { container } = await render(CodeBlock, {
		code: "boom",
		highlight: () => {
			throw new Error("nope");
		},
	});
	await expect.poll(() => error.mock.calls.length).toBeGreaterThan(0);
	expect(code(container).textContent).toBe("boom");
});

test("re-painted when only the code changes", async () => {
	const { container } = await render(CodeBlockFixture, {
		mode: "swap",
		lang: "json",
		initial: '{"before": 1}',
		next: '{"after": 2}',
	});
	await expect.poll(() => painted(container, "property")).toEqual(['"before"']);
	await page.getByRole("button", { name: "swap" }).click();
	await expect.poll(() => painted(container, "property")).toEqual(['"after"']);
	expect(painted(container, "number")).toEqual(["2"]);
});

test("re-painted when only the line layout changes (the text nodes are replaced)", async () => {
	const { container } = await render(CodeBlockFixture, {
		mode: "swap",
		lang: "json",
		initial: '{\n  "k": 1\n}',
	});
	await expect.poll(() => painted(container, "property")).toEqual(['"k"']);
	await page.getByRole("button", { name: "numbers" }).click();
	await expect
		.element(page.elementLocator(code(container).firstElementChild!))
		.toBeVisible();
	// a stale range would point into detached text nodes and read ""
	await expect.poll(() => painted(container, "property")).toEqual(['"k"']);
});

// ============================================================================
// lines: numbers and highlighted lines
// ============================================================================

const lines = (c: HTMLElement) => [
	...code(c).querySelectorAll<HTMLElement>(":scope > span"),
];

test("lineNumbers: one span per line, the text is untouched, numbers live in data-line", async () => {
	const sample = "a\n\nccc\nd";
	const { container } = await render(CodeBlock, { code: sample, lineNumbers: true });
	const root = q(container, ROOT)!;
	expect(root.getAttribute("data-lines")).toBe("true");
	expect(root.getAttribute("data-line-numbers")).toBe("true");
	const ls = lines(container);
	expect(ls.map((l) => l.getAttribute("data-line"))).toEqual(["1", "2", "3", "4"]);
	ls.forEach((l) => expect(l.classList.contains("stuic-code-block-line")).toBe(true));
	// the text (and so a selection, a copy, the ranges) is exactly the sample
	expect(code(container).textContent).toBe(sample);
	expect(pre(container).style.getPropertyValue("--_digits")).toBe("1");
});

test("lineNumbersStart shifts the numbers and widens the gutter", async () => {
	const { container } = await render(CodeBlock, {
		code: "a\nb",
		lineNumbers: true,
		lineNumbersStart: 99,
	});
	expect(lines(container).map((l) => l.getAttribute("data-line"))).toEqual(["99", "100"]);
	expect(pre(container).style.getPropertyValue("--_digits")).toBe("3");
});

test("highlightLines (positions, not numbers) marks lines; alone it renders lines without numbers", async () => {
	const { container } = await render(CodeBlock, {
		code: "1\n2\n3\n4\n5",
		highlightLines: "2, 4-5",
		lineNumbersStart: 10,
	});
	const root = q(container, ROOT)!;
	expect(root.getAttribute("data-lines")).toBe("true");
	expect(root.hasAttribute("data-line-numbers")).toBe(false);
	const ls = lines(container);
	expect(ls.map((l) => l.hasAttribute("data-highlighted"))).toEqual([
		false,
		true,
		false,
		true,
		true,
	]);
	expect(ls[0].hasAttribute("data-line")).toBe(false);
});

test("no lines, no spans: the default is a single text node", async () => {
	const { container } = await render(CodeBlock, { code: "a\nb", highlightLines: [] });
	expect(q(container, ROOT)!.hasAttribute("data-lines")).toBe(false);
	expect(lines(container)).toEqual([]);
});

test("ranges cross line spans: a multi-line token is painted whole", async () => {
	const { container } = await render(CodeBlock, {
		lang: "json",
		code: '{\n  /* one\n  two */\n  "k": 1\n}',
		lineNumbers: true,
	});
	await expect.poll(() => painted(container, "comment")).toEqual(["/* one\n  two */"]);
	expect(painted(container, "property")).toEqual(['"k"']);
});

test("layout: a highlighted line spans the scrolled width; numbers sit in a gutter", async () => {
	const { container } = await render(CodeBlock, {
		code: `short\n${LONG}`,
		lineNumbers: true,
		highlightLines: [1],
		style: "width: 300px",
	});
	const p = pre(container);
	const [first] = lines(container);
	// the short line's box is as wide as the longest line, not the viewport
	expect(first.offsetWidth).toBeGreaterThan(p.clientWidth);
	expect(first.offsetWidth).toBe(code(container).offsetWidth);
	expect(parseFloat(getComputedStyle(first).paddingInlineStart)).toBeGreaterThan(16);
	expect(getComputedStyle(first, "::before").content).toBe('"1"');
	expect(getComputedStyle(first, "::before").userSelect).toBe("none");
});

// ============================================================================
// collapse
// ============================================================================

const TWELVE = Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join("\n");

test("collapsedLines: N lines tall, a 'Show all' toggle wired to the <pre>", async () => {
	const { container } = await render(CodeBlock, { code: TWELVE, collapsedLines: 4 });
	const root = q(container, ROOT)!;
	expect(root.getAttribute("data-collapsed")).toBe("true");
	const toggle = page.getByRole("button", { name: "Show all 12 lines" });
	await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
	await expect.element(toggle).toHaveAttribute("aria-controls", pre(container).id);
	const p = pre(container);
	const lh = parseFloat(getComputedStyle(p).lineHeight);
	const pad = parseFloat(getComputedStyle(p).paddingTop) * 2;
	expect(p.getBoundingClientRect().height).toBeCloseTo(4 * lh + pad, 0);
	// the hidden lines are behind the toggle, not a scroll — no tab stop for them
	expect(p.hasAttribute("tabindex")).toBe(false);

	await toggle.click();
	const less = page.getByRole("button", { name: "Show less" });
	await expect.element(less).toHaveAttribute("aria-expanded", "true");
	expect(root.hasAttribute("data-collapsed")).toBe(false);
	expect(p.getBoundingClientRect().height).toBeCloseTo(12 * lh + pad, 0);
});

test("a sample that fits is not collapsible", async () => {
	const { container } = await render(CodeBlock, {
		code: "a\nb\nc\nd",
		collapsedLines: 4,
	});
	expect(q(container, ROOT)!.hasAttribute("data-collapsed")).toBe(false);
	expect(q(container, ".stuic-code-block-footer")).toBeNull();
});

test("expanded is bindable", async () => {
	await render(CodeBlockFixture, { mode: "expanded" });
	const out = page.getByTestId("expanded");
	await expect.element(out).toHaveTextContent("false");
	await page.getByRole("button", { name: "Show all 12 lines" }).click();
	await expect.element(out).toHaveTextContent("true");
});

test("t localizes the toggle and the copy button", async () => {
	const { createCodeBlockT } = await import("./i18n.js");
	const { CODE_BLOCK_MESSAGES_SK } = await import("./i18n-sk.js");
	await render(CodeBlock, {
		code: TWELVE,
		collapsedLines: 4,
		t: createCodeBlockT(CODE_BLOCK_MESSAGES_SK),
	});
	await expect
		.element(page.getByRole("button", { name: "Zobraziť všetky riadky (12)" }))
		.toBeVisible();
	await expect.element(page.getByRole("button", { name: "Kopírovať" })).toBeVisible();
});

// ============================================================================
// samples (tabs)
// ============================================================================

const SAMPLES = [
	{ label: "curl", lang: "bash", code: "curl https://x.test" },
	{ lang: "json", code: '{"a": 1}', copyText: "COPIED" },
	{ label: "Python", lang: "python", code: "requests.get(url)" },
];
const tabs = () => page.getByRole("tab");

test("samples: a tab list, the first sample shown in a labelled, focusable tab panel", async () => {
	const { container } = await render(CodeBlock, { samples: SAMPLES });
	await expect.element(page.getByRole("tablist")).toBeVisible();
	const ts = tabs().elements();
	expect(ts.map((t) => t.textContent?.trim())).toEqual(["curl", "json", "Python"]);
	expect(ts.map((t) => t.getAttribute("aria-selected"))).toEqual([
		"true",
		"false",
		"false",
	]);
	expect(ts.map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
	const p = pre(container);
	expect(p.getAttribute("role")).toBe("tabpanel");
	expect(p.getAttribute("aria-labelledby")).toBe(ts[0].id);
	expect(p.getAttribute("tabindex")).toBe("0");
	ts.forEach((t) => expect(t.getAttribute("aria-controls")).toBe(p.id));
	expect(code(container).textContent).toBe("curl https://x.test");
	expect(q(container, ROOT)!.getAttribute("data-lang")).toBe("bash");
	// the tabs replace the lang label
	expect(q(container, ".stuic-code-block-title")).toBeNull();
});

test("clicking a tab switches the sample, its highlighting and what is copied", async () => {
	const writeText = stubClipboard();
	const { container } = await render(CodeBlock, { samples: SAMPLES });
	await tabs().nth(1).click();
	await expect.element(tabs().nth(1)).toHaveAttribute("aria-selected", "true");
	expect(code(container).textContent).toBe('{"a": 1}');
	expect(code(container).classList.contains("language-json")).toBe(true);
	await expect.poll(() => painted(container, "property")).toEqual(['"a"']);
	await page.getByRole("button", { name: "Copy" }).click();
	expect(writeText).toHaveBeenCalledWith("COPIED");
});

test("arrow keys, Home and End move the selection and the focus (wrapping)", async () => {
	await render(CodeBlock, { samples: SAMPLES });
	const [a, b, c] = tabs().elements();
	a.focus();
	await userEvent.keyboard("{ArrowRight}");
	expect(document.activeElement).toBe(b);
	expect(b.getAttribute("aria-selected")).toBe("true");
	await userEvent.keyboard("{End}");
	expect(document.activeElement).toBe(c);
	await userEvent.keyboard("{ArrowRight}");
	expect(document.activeElement).toBe(a);
	await userEvent.keyboard("{ArrowLeft}");
	expect(document.activeElement).toBe(c);
	await userEvent.keyboard("{Home}");
	expect(document.activeElement).toBe(a);
	expect(a.getAttribute("aria-selected")).toBe("true");
});

test("a title is shown before the tabs and names the tab list", async () => {
	const { container } = await render(CodeBlock, {
		samples: SAMPLES,
		title: "Create an item",
	});
	const title = q(container, ".stuic-code-block-title")!;
	expect(title.textContent).toBe("Create an item");
	await expect
		.element(page.getByRole("tablist", { name: "Create an item" }))
		.toBeVisible();
});

test("active picks the sample by id (label, else lang); an unknown one shows the first", async () => {
	const byLabel = await render(CodeBlock, { samples: SAMPLES, active: "Python" });
	expect(code(byLabel.container).textContent).toBe("requests.get(url)");
	byLabel.unmount();
	const byLang = await render(CodeBlock, { samples: SAMPLES, active: "json" });
	expect(code(byLang.container).textContent).toBe('{"a": 1}');
	byLang.unmount();
	const unknown = await render(CodeBlock, { samples: SAMPLES, active: "rust" });
	expect(code(unknown.container).textContent).toBe("curl https://x.test");
});

test("blocks sharing a bound `active` stay in sync; one lacking the id stays where it was", async () => {
	const { container } = await render(CodeBlockFixture, { mode: "sync" });
	const block = (id: string) => q(container, `[data-testid=${id}] pre > code`)!;
	const active = page.getByTestId("active");

	await page.getByRole("tab", { name: "Python" }).click();
	await expect.element(active).toHaveTextContent("Python");
	expect(block("first").textContent).toBe("requests.get('https://x.test')");
	// `second` has no "Python": it keeps its sample, and does not rewrite the value
	expect(block("second").textContent).toBe("curl -X POST https://x.test");

	await page.getByRole("tab", { name: "fetch" }).click();
	await expect.element(active).toHaveTextContent("fetch");
	expect(block("second").textContent).toBe("await fetch('https://x.test')");
	// `first` stays on Python, not back on its first sample
	expect(block("first").textContent).toBe("requests.get('https://x.test')");

	await page.getByRole("tab", { name: "curl" }).first().click();
	await expect.element(active).toHaveTextContent("curl");
	expect(block("first").textContent).toBe("curl https://x.test");
	expect(block("second").textContent).toBe("curl -X POST https://x.test");
});

test("layout: narrow, a title over tabs gets its own row; wide, one row", async () => {
	const rowsOf = async (width: number) => {
		const { container, unmount } = await render(CodeBlock, {
			samples: SAMPLES,
			title: "Create an item",
			style: `width: ${width}px`,
		});
		const top = (s: string) => q(container, s)!.getBoundingClientRect().top;
		const tabsTop = top(".stuic-code-block-tabs [role=tab]");
		const out = {
			titleAboveTabs: top(".stuic-code-block-title") < tabsTop - 10,
			// the button stays on the tabs' row, not alone on a third
			copyWithTabs:
				Math.abs(
					q(container, ".stuic-code-block-copy")!.getBoundingClientRect().bottom -
						q(container, ".stuic-code-block-tabs")!.getBoundingClientRect().bottom
				) < 12,
		};
		unmount();
		return out;
	};
	expect(await rowsOf(360)).toEqual({ titleAboveTabs: true, copyWithTabs: true });
	expect(await rowsOf(800)).toEqual({ titleAboveTabs: false, copyWithTabs: true });
});

test("collapsing back scrolls a block the reader had scrolled past into view", async () => {
	const { container } = await render(CodeBlock, {
		code: Array.from({ length: 80 }, (_, i) => `line ${i + 1}`).join("\n"),
		collapsedLines: 4,
	});
	// room below, so the scroll position isn't simply clamped back when the page shrinks
	const spacer = document.body.appendChild(document.createElement("div"));
	spacer.style.height = "5000px";
	onTestFinished(() => spacer.remove());
	await page.getByRole("button", { name: "Show all 80 lines" }).click();
	const root = q(container, ROOT)!;
	// read to the end: the block's top is far above the viewport
	root.querySelector(".stuic-code-block-footer")!.scrollIntoView({ block: "end" });
	expect(root.getBoundingClientRect().top).toBeLessThan(0);
	await page.getByRole("button", { name: "Show less" }).click();
	await expect.poll(() => root.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
});

test("layout: with the copy button the header has start padding only; the button sits flush", async () => {
	const pad = (el: Element) => {
		const cs = getComputedStyle(el);
		return [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(
			parseFloat
		);
	};
	// Tailwind's `sr-only` isn't loaded here — without it CopyButton's live region would be
	// a flex item after the button (in an app it is absolutely positioned, out of the flow)
	const srOnly = document.head.appendChild(document.createElement("style"));
	srOnly.textContent =
		".sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }";
	onTestFinished(() => srOnly.remove());
	const withCopy = await render(CodeBlock, { code: "x", lang: "bash" });
	const header = q(withCopy.container, ".stuic-code-block-header")!;
	expect(pad(header)).toEqual([0, 0, 0, 16]);
	const h = header.getBoundingClientRect();
	const b = q(withCopy.container, ".stuic-code-block-copy")!.getBoundingClientRect();
	expect(b.top).toBe(h.top);
	expect(b.right).toBe(h.right);
	// only the header rule below it (0 here: the theme color tokens aren't loaded)
	expect(Math.round(h.bottom - b.bottom)).toBe(
		Math.round(parseFloat(getComputedStyle(header).borderBottomWidth))
	);
	withCopy.unmount();

	// no button: the label keeps its padding all around
	const noCopy = await render(CodeBlock, { code: "x", lang: "bash", copy: false });
	expect(pad(q(noCopy.container, ".stuic-code-block-header")!)).toEqual([4, 16, 4, 16]);
});

test("layout: tabs reach the header edges without overflowing them, with or without padding", async () => {
	for (const copy of [true, false]) {
		const { container, unmount } = await render(CodeBlock, {
			samples: SAMPLES,
			copy,
			style: "width: 800px",
		});
		const header = q(container, ".stuic-code-block-header")!;
		const h = header.getBoundingClientRect();
		const rule = parseFloat(getComputedStyle(header).borderBottomWidth);
		const t = q(container, "[role=tab]")!.getBoundingClientRect();
		expect(Math.round(t.top)).toBe(Math.round(h.top));
		expect(Math.round(t.bottom)).toBe(Math.round(h.bottom - rule));
		unmount();
	}
});
