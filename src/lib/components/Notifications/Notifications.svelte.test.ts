import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Notifications from "./Notifications.svelte";
import { NotificationsStack } from "./notifications-stack.svelte.js";
// the boxes opt back into pointer events (`.stuic-notification`) from inside a
// pointer-events:none region, which hover needs
import "./index.css";

// Notifications renders a reactive NotificationsStack inside a
// <div popover="manual" class="stuic-notifs-popover" aria-live="assertive">. An
// $effect calls showPopover() once the stack is non-empty; popovers are
// display:none until shown, so first appearance is ALWAYS asserted through
// expect.element auto-retry, never a synchronous read. Each notification is a
// <div class="stuic-notification" data-type=... role="alert"> whose string
// content renders as plain text via Thc. Contracts proven here: type ->
// data-type, dedupe -> count badge, the default Close button removes the item
// (fade ~200ms -> auto-retry it gone), noXButton suppresses the button, and an
// empty stack renders no alert.
//
// The stack is created with ttl/extraTtlPerChar 0 so nothing auto-expires (no
// ticker disposal) AND no Progress bar renders ({#if n.ttl && !noProgress}),
// keeping the asserted DOM deterministic.
function makeStack() {
	return new NotificationsStack([], { defaultTtl: 0, extraTtlPerChar: 0 });
}

test("info(): a role=alert with the text and data-type='info' appears", async () => {
	const notifications = makeStack();
	notifications.info("Hello");

	const screen = await render(Notifications, { notifications });

	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();
	await expect.element(alert).toHaveTextContent("Hello");
	await expect.element(alert).toHaveAttribute("data-type", "info");
});

test("the stack is reactive: items added AFTER render still appear", async () => {
	const notifications = makeStack();
	const screen = await render(Notifications, { notifications });

	// Nothing yet.
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();

	notifications.info("Later");

	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();
	await expect.element(alert).toHaveTextContent("Later");
});

test("success / warn / error map to their data-type", async () => {
	const notifications = makeStack();
	notifications.success("S");
	notifications.warn("W");
	notifications.error("E");

	const screen = await render(Notifications, { notifications });

	// Wait for the stack to render (auto-retry on first appearance).
	await expect.element(screen.getByText("S")).toBeInTheDocument();
	await expect.element(screen.getByText("W")).toBeInTheDocument();
	await expect.element(screen.getByText("E")).toBeInTheDocument();

	expect(
		screen.container.querySelector('.stuic-notification[data-type="success"]')
	).not.toBeNull();
	expect(
		screen.container.querySelector('.stuic-notification[data-type="warn"]')
	).not.toBeNull();
	expect(
		screen.container.querySelector('.stuic-notification[data-type="error"]')
	).not.toBeNull();
});

test("adding the same content twice dedupes to one notification with a count badge of 2", async () => {
	const notifications = makeStack();
	notifications.info("Hello");
	notifications.info("Hello");

	const screen = await render(Notifications, { notifications });

	// One alert (same computed id -> deduped), count badge shows "2". Locate the
	// badge by its dedicated `.count` class (scoped, unambiguous) and poll its
	// text content through the popover showPopover() + reactive render.
	await expect.element(screen.getByText("Hello")).toBeInTheDocument();
	await expect
		.poll(() => screen.container.querySelector(".count")?.textContent?.trim())
		.toBe("2");

	const alerts = screen.container.querySelectorAll('[role="alert"]');
	expect(alerts.length).toBe(1);
});

test("Close button (aria-label 'Close') is present by default and removes the notification", async () => {
	const notifications = makeStack();
	notifications.info("Bye");

	const screen = await render(Notifications, { notifications });

	await expect.element(screen.getByText("Bye")).toBeInTheDocument();

	const closeBtn = screen.getByRole("button", { name: "Close" });
	await expect.element(closeBtn).toBeInTheDocument();

	// Native DOM click: the handler calls notifications.removeById(id), mutating
	// the reactive stack. Use a native click so no Playwright post-action wait can
	// be orphaned by the fade-out detach.
	(closeBtn.element() as HTMLElement).click();

	// The fade transition (duration 200) lingers ~200ms before the node leaves the
	// DOM -> auto-retry until it is gone.
	await expect.element(screen.getByText("Bye")).not.toBeInTheDocument();
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
});

test("noXButton with ttl 0 -> no Close button (showXButton = !noXButton || ttl > 1000)", async () => {
	const notifications = makeStack();
	notifications.info("NoClose");

	const screen = await render(Notifications, { notifications, noXButton: true });

	await expect.element(screen.getByText("NoClose")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Close" }))
		.not.toBeInTheDocument();
});

test("two distinct messages render two role=alert nodes", async () => {
	const notifications = makeStack();
	notifications.info("First");
	notifications.success("Second");

	const screen = await render(Notifications, { notifications });

	await expect.element(screen.getByText("First")).toBeInTheDocument();
	await expect.element(screen.getByText("Second")).toBeInTheDocument();

	const alerts = screen.container.querySelectorAll('[role="alert"]');
	expect(alerts.length).toBe(2);
});

test("an empty stack renders no role=alert", async () => {
	const notifications = makeStack();
	const screen = await render(Notifications, { notifications });

	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
});

// Pause on hover/focus: the ttl clock lives in the stack (`paused` getter); the
// component only decides when to hold it. A long ttl keeps the item alive for the
// whole test - only the paused flag is asserted, the timing is covered in the
// node-side notifications.test.ts.
function makeTtlStack() {
	return new NotificationsStack([], { defaultTtl: 60_000, extraTtlPerChar: 0 });
}

test("hovering a notification pauses the stack, leaving it resumes", async () => {
	const notifications = makeTtlStack();
	notifications.info("Hover me");

	const screen = await render(Notifications, { notifications });
	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();
	expect(notifications.paused).toBe(false);

	await alert.hover();
	await expect.poll(() => notifications.paused).toBe(true);

	await alert.unhover();
	await expect.poll(() => notifications.paused).toBe(false);
});

test("focus inside a notification pauses the stack, blur resumes", async () => {
	const notifications = makeTtlStack();
	notifications.info("Focus me");

	const screen = await render(Notifications, { notifications });
	const closeBtn = screen.getByRole("button", { name: "Close" });
	await expect.element(closeBtn).toBeInTheDocument();

	(closeBtn.element() as HTMLElement).focus();
	await expect.poll(() => notifications.paused).toBe(true);

	(closeBtn.element() as HTMLElement).blur();
	await expect.poll(() => notifications.paused).toBe(false);
});

test("removing the hovered notification releases the pause (no pointerleave fires)", async () => {
	const notifications = makeTtlStack();
	notifications.info("Stay");
	notifications.info("Remove me");

	const screen = await render(Notifications, { notifications });
	// the LAST one: removing it shifts nothing else under the pointer
	const alert = screen.getByRole("alert").last();
	await expect.element(alert).toHaveTextContent("Remove me");

	await alert.hover();
	await expect.poll(() => notifications.paused).toBe(true);

	notifications.removeById(notifications.stack.at(-1)!.id);
	await expect.element(screen.getByText("Remove me")).not.toBeInTheDocument();
	await expect.poll(() => notifications.paused).toBe(false);
});

test("noPauseOnHover: hovering does not pause", async () => {
	const notifications = makeTtlStack();
	notifications.info("Hover me");

	const screen = await render(Notifications, { notifications, noPauseOnHover: true });
	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();

	await alert.hover();
	// give the effect a chance to (wrongly) run
	await new Promise((r) => setTimeout(r, 50));
	expect(notifications.paused).toBe(false);
});

test("a pause made by app code is not released by the component", async () => {
	const notifications = makeTtlStack();
	notifications.info("Hover me");
	notifications.pause();

	const screen = await render(Notifications, { notifications });
	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();

	await alert.hover();
	await alert.unhover();
	await new Promise((r) => setTimeout(r, 50));
	expect(notifications.paused).toBe(true);
});

test("unmounting while hovered releases the pause", async () => {
	const notifications = makeTtlStack();
	notifications.info("Hover me");

	const screen = await render(Notifications, { notifications });
	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();

	await alert.hover();
	await expect.poll(() => notifications.paused).toBe(true);

	screen.unmount();
	expect(notifications.paused).toBe(false);
});
