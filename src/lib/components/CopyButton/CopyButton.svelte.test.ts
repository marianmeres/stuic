import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { afterEach, expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import CopyButton, { type CopyButtonState } from "./CopyButton.svelte";
import { createCopyButtonT } from "./i18n.js";
import { COPY_BUTTON_MESSAGES_SK } from "./i18n-sk.js";

// CopyButton IS a Button (variant/size/intent/data-* come from Button, proven in
// Button.svelte.test.ts); what's asserted here is the copy contract: what gets
// written, the copied/error feedback (data-state, intent swap, aria-label, live
// region) and its reset. The clipboard is stubbed — the real write path is covered
// by utils/copy-to-clipboard.svelte.test.ts, and stubbing keeps these tests
// independent of the shared OS clipboard. Browser tests load no component CSS.

/** Shadow navigator.clipboard with a controllable writeText. */
function stubClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
	const writeText = vi.fn(impl);
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

const btn = (c: HTMLElement) => c.querySelector<HTMLButtonElement>("button")!;
const status = (c: HTMLElement) => c.querySelector<HTMLElement>("[role=status]")!;
const click = (b: HTMLElement) => page.elementLocator(b).click();

// ============================================================================
// structure
// ============================================================================

test("default: icon-only ghost/sm Button, aria-label 'Copy', data-state=idle, empty live region", async () => {
	const { container } = await render(CopyButton, { text: "x" });
	const b = btn(container);
	expect(b).not.toBeNull();
	expect(b.getAttribute("type")).toBe("button");
	expect(b.classList.contains("stuic-copy-button")).toBe(true);
	expect(b.classList.contains("stuic-button")).toBe(true);
	expect(b.getAttribute("data-variant")).toBe("ghost");
	expect(b.getAttribute("data-size")).toBe("sm");
	expect(b.getAttribute("data-icon-button")).toBe("true");
	expect(b.getAttribute("data-state")).toBe("idle");
	expect(b.getAttribute("aria-label")).toBe("Copy");
	expect(b.hasAttribute("data-intent")).toBe(false);
	expect(b.querySelector(".stuic-copy-button-icon svg")).not.toBeNull();
	expect(b.querySelector(".stuic-copy-button-label")).toBeNull();
	// the live region is a sibling of the button, not inside it
	const s = status(container);
	expect(s).not.toBeNull();
	expect(b.contains(s)).toBe(false);
	expect(s.textContent?.trim()).toBe("");
});

test("label=true renders the localized label, drops aria-label and the icon-button mode", async () => {
	const { container } = await render(CopyButton, { text: "x", label: true });
	const b = btn(container);
	expect(b.querySelector(".stuic-copy-button-label")?.textContent?.trim()).toBe("Copy");
	expect(b.hasAttribute("aria-label")).toBe(false);
	expect(b.hasAttribute("data-icon-button")).toBe(false);
	expect(b.querySelector(".stuic-copy-button-icon svg")).not.toBeNull();
});

test("icon=false with a label renders no icon wrapper (in any state)", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, {
		text: "x",
		label: "Copy link",
		icon: false,
	});
	const b = btn(container);
	expect(b.querySelector(".stuic-copy-button-icon")).toBeNull();
	await click(b);
	await expect.poll(() => b.getAttribute("data-state")).toBe("copied");
	expect(b.querySelector(".stuic-copy-button-icon")).toBeNull();
});

// ============================================================================
// copy + feedback
// ============================================================================

test("click writes the text, fires onCopied, shows copied feedback, then resets", async () => {
	const writeText = stubClipboard();
	const onCopied = vi.fn();
	const { container } = await render(CopyButton, {
		text: "hello",
		onCopied,
		feedbackDuration: 300,
	});
	const b = btn(container);
	await click(b);

	await expect.poll(() => b.getAttribute("data-state")).toBe("copied");
	expect(writeText).toHaveBeenCalledOnce();
	expect(writeText).toHaveBeenCalledWith("hello");
	expect(onCopied).toHaveBeenCalledOnce();
	expect(onCopied).toHaveBeenCalledWith("hello");
	expect(b.getAttribute("aria-label")).toBe("Copied");
	expect(b.getAttribute("data-intent")).toBe("success");
	expect(status(container).textContent?.trim()).toBe("Copied");

	// auto-reset after feedbackDuration
	await expect.poll(() => b.getAttribute("data-state"), { timeout: 2000 }).toBe("idle");
	expect(b.getAttribute("aria-label")).toBe("Copy");
	expect(b.hasAttribute("data-intent")).toBe(false);
	expect(status(container).textContent?.trim()).toBe("");
});

test("labeled: label swaps to labelCopied (default t('copied')) while copied", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, {
		text: "x",
		label: "Copy link",
		feedbackDuration: 0,
	});
	const b = btn(container);
	const label = () => b.querySelector(".stuic-copy-button-label")?.textContent?.trim();
	expect(label()).toBe("Copy link");
	await click(b);
	await expect.poll(label).toBe("Copied");
});

test("custom labelCopied / iconCopied are used in the copied state", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, {
		text: "x",
		label: "Copy",
		labelCopied: "Link copied!",
		iconCopied: `<svg data-testid="custom-check"></svg>`,
		feedbackDuration: 0,
	});
	const b = btn(container);
	await click(b);
	await expect
		.poll(() => b.querySelector(".stuic-copy-button-label")?.textContent?.trim())
		.toBe("Link copied!");
	expect(b.querySelector("svg[data-testid=custom-check]")).not.toBeNull();
});

test("text getter: sync and async functions are resolved on click", async () => {
	const writeText = stubClipboard();
	const { container, rerender } = await render(CopyButton, {
		text: () => "sync value",
		feedbackDuration: 0,
	});
	const b = btn(container);
	await click(b);
	await expect.poll(() => writeText.mock.calls.length).toBe(1);
	expect(writeText).toHaveBeenLastCalledWith("sync value");

	await rerender({
		text: () => new Promise<string>((r) => setTimeout(() => r("async value"), 30)),
		feedbackDuration: 0,
	});
	await click(btn(container));
	await expect.poll(() => writeText.mock.calls.length).toBe(2);
	expect(writeText).toHaveBeenLastCalledWith("async value");
});

test("feedbackDuration=0 keeps the copied state (no auto-reset)", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, { text: "x", feedbackDuration: 0 });
	const b = btn(container);
	await click(b);
	await expect.poll(() => b.getAttribute("data-state")).toBe("copied");
	await new Promise((r) => setTimeout(r, 250));
	expect(b.getAttribute("data-state")).toBe("copied");
});

test("intentCopied=false keeps the base intent while copied", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, {
		text: "x",
		intent: "primary",
		intentCopied: false,
		feedbackDuration: 0,
	});
	const b = btn(container);
	expect(b.getAttribute("data-intent")).toBe("primary");
	await click(b);
	await expect.poll(() => b.getAttribute("data-state")).toBe("copied");
	expect(b.getAttribute("data-intent")).toBe("primary");
});

// ============================================================================
// error
// ============================================================================

test("copy failure: error feedback, onError with the cause, no onCopied", async () => {
	const boom = new DOMException("denied", "NotAllowedError");
	stubClipboard(() => Promise.reject(boom));
	// the legacy execCommand fallback must fail too
	vi.spyOn(document, "execCommand").mockReturnValue(false);
	const onCopied = vi.fn();
	const onError = vi.fn();
	const { container } = await render(CopyButton, {
		text: "x",
		label: true,
		onCopied,
		onError,
		feedbackDuration: 300,
	});
	const b = btn(container);
	await click(b);

	await expect.poll(() => b.getAttribute("data-state")).toBe("error");
	expect(onError).toHaveBeenCalledOnce();
	expect(onError).toHaveBeenCalledWith(boom);
	expect(onCopied).not.toHaveBeenCalled();
	expect(b.getAttribute("data-intent")).toBe("destructive");
	expect(b.querySelector(".stuic-copy-button-label")?.textContent?.trim()).toBe(
		"Copy failed"
	);
	expect(status(container).textContent?.trim()).toBe("Copy failed");

	await expect.poll(() => b.getAttribute("data-state"), { timeout: 2000 }).toBe("idle");
	expect(b.hasAttribute("data-intent")).toBe(false);
});

test("a throwing getter is an error too (nothing is written)", async () => {
	const writeText = stubClipboard();
	const onError = vi.fn();
	const { container } = await render(CopyButton, {
		text: () => {
			throw new Error("no value");
		},
		onError,
		feedbackDuration: 0,
	});
	const b = btn(container);
	await click(b);
	await expect.poll(() => b.getAttribute("data-state")).toBe("error");
	expect(writeText).not.toHaveBeenCalled();
	expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
	expect(b.getAttribute("aria-label")).toBe("Copy failed");
});

// ============================================================================
// click hooks + disabled
// ============================================================================

test("onclick runs first; preventDefault skips the copy", async () => {
	const writeText = stubClipboard();
	const onclick = vi.fn((e: MouseEvent) => e.preventDefault());
	const { container } = await render(CopyButton, { text: "x", onclick });
	const b = btn(container);
	await click(b);
	expect(onclick).toHaveBeenCalledOnce();
	await new Promise((r) => setTimeout(r, 50));
	expect(writeText).not.toHaveBeenCalled();
	expect(b.getAttribute("data-state")).toBe("idle");
});

test("disabled renders a disabled button", async () => {
	const { container } = await render(CopyButton, { text: "x", disabled: true });
	await expect.element(page.elementLocator(btn(container))).toBeDisabled();
});

// ============================================================================
// children override
// ============================================================================

test("children snippet replaces the default content and receives the state", async () => {
	const children = createRawSnippet((args: () => { state: CopyButtonState }) => ({
		render: () => `<span data-testid="custom">state=${args().state}</span>`,
	}));
	const { container } = await render(CopyButton, { text: "x", children });
	const b = btn(container);
	expect(b.querySelector("[data-testid=custom]")?.textContent).toBe("state=idle");
	expect(b.querySelector(".stuic-copy-button-icon")).toBeNull();
	// custom content => not icon-only => no aria-label
	expect(b.hasAttribute("aria-label")).toBe(false);
});

// ============================================================================
// i18n
// ============================================================================

test("t prop localizes the accessible name, labels and the announcement (SK)", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, {
		text: "x",
		t: createCopyButtonT(COPY_BUTTON_MESSAGES_SK),
		feedbackDuration: 0,
	});
	const b = btn(container);
	expect(b.getAttribute("aria-label")).toBe("Kopírovať");
	await click(b);
	await expect.poll(() => b.getAttribute("aria-label")).toBe("Skopírované");
	expect(status(container).textContent?.trim()).toBe("Skopírované");
});

// ============================================================================
// customization
// ============================================================================

test("class props merge; rest props pass through to the button", async () => {
	const { container } = await render(CopyButton, {
		text: "x",
		label: "Copy",
		class: "my-extra",
		classIcon: "my-icon",
		classLabel: "my-label",
		title: "Copy it",
		"data-foo": "bar",
	});
	const b = btn(container);
	expect(b.classList.contains("stuic-copy-button")).toBe(true);
	expect(b.classList.contains("my-extra")).toBe(true);
	expect(b.querySelector(".stuic-copy-button-icon")?.classList.contains("my-icon")).toBe(
		true
	);
	expect(
		b.querySelector(".stuic-copy-button-label")?.classList.contains("my-label")
	).toBe(true);
	expect(b.getAttribute("title")).toBe("Copy it");
	expect(b.getAttribute("data-foo")).toBe("bar");
});

test("unstyled drops every stuic class but keeps the behavior contract", async () => {
	stubClipboard();
	const { container } = await render(CopyButton, {
		text: "x",
		label: "Copy",
		unstyled: true,
		feedbackDuration: 0,
	});
	const b = btn(container);
	expect(b.classList.contains("stuic-copy-button")).toBe(false);
	expect(b.classList.contains("stuic-button")).toBe(false);
	expect(b.querySelector(".stuic-copy-button-icon")).toBeNull();
	expect(b.querySelector(".stuic-copy-button-label")).toBeNull();
	expect(b.hasAttribute("data-variant")).toBe(false);
	// state is behavior, not styling — still exposed
	await click(b);
	await expect.poll(() => b.getAttribute("data-state")).toBe("copied");
});
