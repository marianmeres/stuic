import { render } from "vitest-browser-svelte";
import { beforeEach, expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { userEvent } from "vitest/browser";
import SplitPane from "./SplitPane.svelte";
import Harness from "./SplitPaneHarness.test.svelte";
import { createSplitPaneT } from "./i18n.js";
import { SPLIT_PANE_MESSAGES_SK } from "./i18n-sk.js";

// Component CSS is NOT loaded in browser tests: the root is a plain block (no flex),
// which is fine — the size lands as an inline width / height on the primary pane and
// resolves against the root's explicit inline size (400x200 here).
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

type Screen = { container: HTMLElement };
const sep = (screen: Screen) =>
	screen.container.querySelector("[data-separator]") as HTMLElement;
const pane = (screen: Screen, which: "start" | "end") =>
	screen.container.querySelector(`[data-pane="${which}"]`) as HTMLElement;

function pointer(target: Element, type: string, x: number, y: number) {
	target.dispatchEvent(
		new PointerEvent(type, {
			clientX: x,
			clientY: y,
			pointerId: 1,
			button: 0,
			buttons: type === "pointerup" ? 0 : 1,
			bubbles: true,
			cancelable: true,
		})
	);
}

beforeEach(() => {
	sessionStorage.clear();
	localStorage.clear();
});

test("renders two panes and a window-splitter separator, the size on the primary pane", async () => {
	const screen = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		size: 40,
		min: 10,
		max: 90,
		"data-testid": "sp",
		style: "width:400px",
	});
	const root = screen.getByTestId("sp");
	await expect.element(root).toHaveClass("stuic-split-pane");
	await expect.element(root).toHaveAttribute("data-orientation", "horizontal");
	await expect.element(screen.getByText("A")).toBeVisible();
	await expect.element(screen.getByText("B")).toBeVisible();

	const s = screen.getByRole("separator");
	await expect.element(s).toHaveAttribute("aria-orientation", "vertical");
	await expect.element(s).toHaveAttribute("tabindex", "0");
	await expect.element(s).toHaveAttribute("aria-label", "Resize");
	await expect.element(s).toHaveAttribute("aria-valuenow", "40");
	await expect.element(s).toHaveAttribute("aria-valuemin", "10");
	await expect.element(s).toHaveAttribute("aria-valuemax", "90");
	await expect.element(s).toHaveAttribute("aria-valuetext", "40%");
	await expect.element(s).toHaveClass("stuic-split-pane-separator");

	const a = pane(screen, "start");
	expect(a.hasAttribute("data-primary")).toBe(true);
	expect(pane(screen, "end").hasAttribute("data-primary")).toBe(false);
	expect(a.style.width).toBe("40%");
	expect(a.offsetWidth).toBe(160);
	expect(sep(screen).getAttribute("aria-controls")).toBe(a.id);
});

test("vertical resizes a height and the separator is a horizontal splitter", async () => {
	const screen = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		orientation: "vertical",
		size: 25,
		style: "height:200px",
	});
	const s = screen.getByRole("separator");
	await expect.element(s).toHaveAttribute("aria-orientation", "horizontal");
	const a = pane(screen, "start");
	expect(a.style.height).toBe("25%");
	expect(a.style.width).toBe("");
	expect(a.offsetHeight).toBe(50);

	sep(screen).focus();
	await userEvent.keyboard("{ArrowDown}");
	await expect.element(s).toHaveAttribute("aria-valuenow", "26");
	expect(a.style.height).toBe("26%");
});

test("primary=end sizes the second pane and the keys follow the handle", async () => {
	const screen = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		primary: "end",
		size: 30,
		style: "width:400px",
	});
	const s = screen.getByRole("separator");
	await expect.element(s).toHaveAttribute("aria-valuenow", "30");
	const b = pane(screen, "end");
	expect(b.hasAttribute("data-primary")).toBe(true);
	expect(pane(screen, "start").hasAttribute("data-primary")).toBe(false);
	expect(b.style.width).toBe("30%");
	expect(sep(screen).getAttribute("aria-controls")).toBe(b.id);

	// the handle sits on the end pane's start edge: moving it left grows the pane
	sep(screen).focus();
	await userEvent.keyboard("{ArrowLeft}");
	await expect.element(s).toHaveAttribute("aria-valuenow", "31");
	expect(b.style.width).toBe("31%");
});

test("keyboard resizes, updates bind:size and fires onResize", async () => {
	const onResize = vi.fn();
	const screen = render(Harness, { initialSize: 50, min: 10, onResize });
	const bound = screen.getByTestId("bound");
	await expect.element(bound).toHaveTextContent("50");

	sep(screen).focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.element(bound).toHaveTextContent("51");
	expect(onResize.mock.lastCall?.[0]).toEqual({
		size: 51,
		units: "%",
		axis: "x",
		container: 400,
	});
	expect(pane(screen, "start").style.width).toBe("51%");

	await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
	await expect.element(bound).toHaveTextContent("61");
	await userEvent.keyboard("{Home}");
	await expect.element(bound).toHaveTextContent("10");
	await userEvent.keyboard("{End}");
	await expect.element(bound).toHaveTextContent("100");
	await userEvent.keyboard("{Enter}");
	await expect.element(bound).toHaveTextContent("50");
});

test("writing `size` goes through the splitter (clamped, announced); reset() restores the mount size", async () => {
	const screen = render(Harness, { initialSize: 50, min: 10, max: 90 });
	const s = screen.getByRole("separator");
	const bound = screen.getByTestId("bound");
	await expect.element(s).toHaveAttribute("aria-valuenow", "50");

	await screen.getByTestId("set").click();
	await expect.element(s).toHaveAttribute("aria-valuenow", "30");
	expect(pane(screen, "start").style.width).toBe("30%");

	// out of range: clamped, and the clamped value is written back
	await screen.getByTestId("set-big").click();
	await expect.element(bound).toHaveTextContent("90");
	await expect.element(s).toHaveAttribute("aria-valuenow", "90");
	expect(pane(screen, "start").style.width).toBe("90%");

	await screen.getByTestId("reset").click();
	await expect.element(bound).toHaveTextContent("50");
	expect(pane(screen, "start").style.width).toBe("50%");
});

test("px units", async () => {
	const screen = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		units: "px",
		size: 120,
		max: 300,
		style: "width:400px",
	});
	const s = screen.getByRole("separator");
	await expect.element(s).toHaveAttribute("aria-valuetext", "120px");
	await expect.element(s).toHaveAttribute("aria-valuemax", "300");
	const a = pane(screen, "start");
	expect(a.style.width).toBe("120px");
	expect(a.offsetWidth).toBe(120);
	sep(screen).focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.element(s).toHaveAttribute("aria-valuenow", "130");
});

test("a size stored under `key` wins over the mount size and is written back; reset still means the mount size", async () => {
	const first = render(Harness, { initialSize: 50, key: "sp-k" });
	await expect.element(first.getByTestId("bound")).toHaveTextContent("50");
	sep(first).focus();
	await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
	await expect.element(first.getByTestId("bound")).toHaveTextContent("53");
	first.unmount();

	const second = render(Harness, { initialSize: 50, key: "sp-k" });
	await expect.element(second.getByTestId("bound")).toHaveTextContent("53");
	expect(pane(second, "start").style.width).toBe("53%");

	await second.getByTestId("reset").click();
	await expect.element(second.getByTestId("bound")).toHaveTextContent("50");
});

test("disabled renders an inert divider; re-enabling re-arms it without a jump", async () => {
	const screen = render(Harness, { initialSize: 50 });
	const s = screen.getByRole("separator");
	await expect.element(s).toHaveAttribute("tabindex", "0");

	await screen.getByTestId("toggle-disabled").click();
	await expect.element(screen.getByTestId("sp")).toHaveAttribute("data-disabled", "");
	await expect.element(s).not.toHaveAttribute("tabindex");
	await expect.element(s).not.toHaveAttribute("aria-valuenow");
	// still a (static) separator
	await expect.element(s).toHaveAttribute("role", "separator");

	// a consumer's write still lands (no attachment, the inline style carries it)
	await screen.getByTestId("set").click();
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("30");
	expect(pane(screen, "start").style.width).toBe("30%");

	await screen.getByTestId("toggle-disabled").click();
	await expect.element(s).toHaveAttribute("tabindex", "0");
	await expect.element(s).toHaveAttribute("aria-valuenow", "30");
	expect(pane(screen, "start").style.width).toBe("30%");
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("30");
});

test("pointer drag on the separator", async () => {
	const onResize = vi.fn();
	const screen = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		size: 50,
		onResize,
		style: "width:400px",
	});
	const s = screen.getByRole("separator");
	await expect.element(s).toHaveAttribute("aria-valuenow", "50");
	const h = sep(screen);
	const r = h.getBoundingClientRect();

	pointer(h, "pointerdown", r.left, r.top);
	await expect.element(s).toHaveAttribute("data-resizing", "");
	pointer(h, "pointermove", r.left + 40, r.top);
	await expect.element(s).toHaveAttribute("aria-valuenow", "60");
	expect(pane(screen, "start").style.width).toBe("60%");
	pointer(h, "pointerup", r.left + 40, r.top);
	await expect.element(s).not.toHaveAttribute("data-resizing");
	expect(onResize.mock.lastCall?.[0].size).toBe(60);
});

test("unstyled drops the stuic classes; `label` and `t` name the separator", async () => {
	const screen = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		unstyled: true,
		class: "custom",
		separatorClass: "custom-sep",
		label: "Divider",
		"data-testid": "sp",
	});
	const root = screen.getByTestId("sp");
	await expect.element(root).toHaveClass("custom");
	await expect.element(root).not.toHaveClass("stuic-split-pane");
	const s = screen.getByRole("separator");
	await expect.element(s).toHaveClass("custom-sep");
	await expect.element(s).not.toHaveClass("stuic-split-pane-separator");
	await expect.element(s).toHaveAttribute("aria-label", "Divider");
	screen.unmount();

	const sk = render(SplitPane, {
		start: text("A"),
		end: text("B"),
		t: createSplitPaneT(SPLIT_PANE_MESSAGES_SK),
	});
	await expect
		.element(sk.getByRole("separator"))
		.toHaveAttribute("aria-label", "Zmeniť veľkosť");
});
