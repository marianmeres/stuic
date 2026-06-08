import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import DismissibleMessage from "./DismissibleMessage.svelte";

// `message` is a THC; a plain string is the simplest valid form. With the default
// `forceAsHtml=true` a string is rendered via {@html} inside `.content`, so for plain
// text the visible text content still equals the string.

test("renders the message inside role=alert with the base class", async () => {
	const screen = render(DismissibleMessage, { message: "Something happened" });
	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();
	await expect.element(alert).toHaveClass("stuic-dismissible-message");
	await expect.element(alert).toHaveTextContent("Something happened");
});

test("empty / nullish message renders nothing (no alert)", async () => {
	const screen = render(DismissibleMessage, { message: "" });
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
});

test("intent is reflected as data-intent on the alert container", async () => {
	const screen = render(DismissibleMessage, {
		message: "Boom",
		intent: "destructive",
	});
	await expect
		.element(screen.getByRole("alert"))
		.toHaveAttribute("data-intent", "destructive");
});

test("a dismiss button (data-x) is rendered by default", async () => {
	const screen = render(DismissibleMessage, { message: "Dismiss me" });
	const btn = screen.getByRole("button");
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveAttribute("data-x", "true");
});

test("onDismiss=false suppresses the dismiss button", async () => {
	const screen = render(DismissibleMessage, {
		message: "No dismiss here",
		onDismiss: false,
	});
	// alert still shows, but there is no button
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
});

test("custom onDismiss callback fires once on dismiss click", async () => {
	const onDismiss = vi.fn();
	const screen = render(DismissibleMessage, {
		message: "Click the x",
		onDismiss,
	});
	await screen.getByRole("button").click();
	expect(onDismiss).toHaveBeenCalledOnce();
});

test("default dismiss handler hides the message locally", async () => {
	const screen = render(DismissibleMessage, { message: "Bye" });
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	await screen.getByRole("button").click();
	// default handler sets _dismissed -> _show becomes false -> alert removed
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
});

test("a new message resets the dismissed state and re-shows", async () => {
	const screen = render(DismissibleMessage, { message: "First" });
	await screen.getByRole("button").click();
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();

	// Re-passing a NEW message should reset the local dismissed flag (the $effect
	// that watches `_message` clears `_dismissed`), so the alert re-appears.
	await screen.rerender({ message: "Second" });
	const alert = screen.getByRole("alert");
	await expect.element(alert).toBeInTheDocument();
	await expect.element(alert).toHaveTextContent("Second");
});
