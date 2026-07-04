import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./ModalDialog.fixture.svelte";

// ModalDialog wraps a native <dialog> opened imperatively via open()/close()
// (no bindable `visible` prop), so every assertion goes through the fixture that
// holds the ref. The contracts that only a real browser can prove:
//   - showModal() puts the dialog in the a11y tree with role "dialog", but only
//     ASYNCHRONOUSLY (open() does waitForNextRepaint().then(showModal)) — so we
//     never read synchronously, always expect.element auto-retry.
//   - the focus-trap action auto-focuses the first focusable descendant (the
//     inside button; the box div carries no positive tabindex by default).
//   - Escape (listener on the <dialog>) and a backdrop click (e.target === dialog)
//     close it; a click on the inner box / its children does NOT (box stops
//     propagation). The various no*Close props gate those paths.

test("starts closed; clicking the opener calls open() and shows role=dialog (async)", async () => {
	const screen = render(Fixture);
	// visible starts undefined -> nothing is rendered.
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

	await screen.getByTestId("opener").click();

	// showModal() runs after waitForNextRepaint() — expect.element retries until it lands.
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.element(screen.getByTestId("inside")).toBeInTheDocument();
});

test("the focus trap auto-focuses the first focusable element inside the dialog", async () => {
	const screen = render(Fixture);
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	// The box div has no positive tabindex by default, so the first focusable is
	// the inside <button>; the focus-trap action focuses it on mount.
	await expect.element(screen.getByTestId("inside")).toHaveFocus();
});

test("Escape (keydown on the dialog) closes it by default", async () => {
	const screen = render(Fixture);
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("noEscapeClose keeps the dialog open on Escape", async () => {
	const screen = render(Fixture, { noEscapeClose: true });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	// Still present — the escape handler bails out before close().
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});

test("preEscapeClose returning false vetoes the Escape close", async () => {
	const screen = render(Fixture, { preEscapeClose: () => false });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	// close() runs only when the hook resolves to !== false; `false` keeps it open.
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});

test("async preEscapeClose resolving to false keeps the dialog open", async () => {
	let calls = 0;
	const preEscapeClose = async () => {
		calls++;
		return false;
	};
	const screen = render(Fixture, { preEscapeClose });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	await expect.poll(() => calls).toBe(1);
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});

test("rapid double-Escape during a pending async preEscapeClose invokes the hook once (latch)", async () => {
	let calls = 0;
	let release!: () => void;
	// The hook stays pending until released, then resolves to undefined -> close.
	const gate = new Promise<void>((res) => (release = res));
	const preEscapeClose = () => {
		calls++;
		return gate.then(() => undefined);
	};
	const screen = render(Fixture, { preEscapeClose });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	// Both dispatched synchronously while the first hook is still pending: the
	// `_isEscaping` latch drops the second before it can call the hook again.
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	expect(calls).toBe(1);

	// Release the single pending hook -> the dialog closes exactly once.
	release();
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
	expect(calls).toBe(1);
});

test("a vetoed Escape can be retried: the latch resets so a later Escape re-runs the hook and closes", async () => {
	let calls = 0;
	// 1st Escape vetoes (false); 2nd allows (undefined -> close). This exercises
	// the `finally { _isEscaping = false }` reset — without it, _isEscaping would
	// stay true after the first veto and every later Escape would be dropped,
	// leaving the dialog permanently un-closeable by Escape.
	const preEscapeClose = () => {
		calls++;
		return calls === 1 ? false : undefined;
	};
	const screen = render(Fixture, { preEscapeClose });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;

	// 1st Escape: vetoed -> stays open, hook ran once.
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	await expect.poll(() => calls).toBe(1);
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// 2nd Escape: latch has reset, so the hook runs again and now closes.
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
	expect(calls).toBe(2);
});

test("programmatic close() is NOT gated by the Escape veto (preEscapeClose)", async () => {
	let calls = 0;
	// Would veto an ESCAPE close, but programmatic close() goes through preClose,
	// never preEscapeClose, so it must close regardless.
	const preEscapeClose = () => {
		calls++;
		return false;
	};
	const screen = render(Fixture, { preEscapeClose });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	await screen.getByTestId("programmatic-close").click();

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
	expect(calls).toBe(0); // the Escape-veto hook was never consulted
});

test("noEscapeClose keeps the dialog open AND never calls preEscapeClose", async () => {
	let calls = 0;
	const preEscapeClose = () => {
		calls++;
	};
	const screen = render(Fixture, { noEscapeClose: true, preEscapeClose });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	// Short-circuits before the hook: still open, hook never invoked.
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	expect(calls).toBe(0);
});

test("a click on the dialog backdrop (e.target === dialog) closes it", async () => {
	const screen = render(Fixture);
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// Dispatching the click ON the dialog makes e.target === dialog — the handler's
	// "clicked the backdrop area, not a child" branch -> close().
	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("clicking inside the box keeps the dialog open (box stops propagation)", async () => {
	const screen = render(Fixture);
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// The inner box has onclick={stopPropagation()}, so a click on the inside
	// button never reaches the dialog's close handler.
	await screen.getByTestId("inside").click();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.element(screen.getByTestId("inside")).toBeInTheDocument();
});

test("noClickOutsideClose keeps the dialog open on a backdrop click", async () => {
	const screen = render(Fixture, { noClickOutsideClose: true });
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const dialog = screen.getByRole("dialog").element() as HTMLDialogElement;
	dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));

	// e.target === dialog but noClickOutsideClose short-circuits the close.
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});

test("ariaLabelledby is forwarded to aria-labelledby on the dialog", async () => {
	const screen = render(Fixture, { ariaLabelledby: "the-title" });
	await screen.getByTestId("opener").click();
	await expect
		.element(screen.getByRole("dialog"))
		.toHaveAttribute("aria-labelledby", "the-title");
});
