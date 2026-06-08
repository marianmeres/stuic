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
