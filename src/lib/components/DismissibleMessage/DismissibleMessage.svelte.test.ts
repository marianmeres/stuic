import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import DismissibleMessage from "./DismissibleMessage.svelte";
import Thc from "../Thc/Thc.svelte";

// `message` is a THC; a plain string is the simplest valid form. With the default
// `forceAsHtml=true` a string is rendered via {@html} inside `.content`, so for plain
// text the visible text content still equals the string. The other THC forms (object
// forms, snippets, components) have their own section further down.

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

// ============================================================================
// `message` is a THC — every form renders, not just the string one
// ============================================================================

const content = () =>
	document.querySelector<HTMLElement>(".stuic-dismissible-message > .content");

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

test("a { text } message renders its text, not [object Object]", async () => {
	const screen = render(DismissibleMessage, { message: { text: "Saved" } });
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	expect(content()?.textContent?.trim()).toBe("Saved");
});

test("an { html } message renders as markup", async () => {
	const screen = render(DismissibleMessage, { message: { html: "<b>Saved</b>" } });
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	expect(content()?.querySelector("b")?.textContent).toBe("Saved");
	expect(content()?.textContent?.trim()).toBe("Saved");
});

test("a bare snippet message renders as a subtree with working interactive children", async () => {
	const onResend = vi.fn();
	const body = createRawSnippet(() => ({
		render: () =>
			`<span>Your email is not verified. <button type="button">Resend</button></span>`,
		setup: (el) => {
			const btn = el.querySelector("button")!;
			btn.addEventListener("click", onResend);
			return () => btn.removeEventListener("click", onResend);
		},
	}));
	const screen = render(DismissibleMessage, { message: body });
	await expect
		.element(screen.getByRole("alert"))
		.toHaveTextContent("Your email is not verified.");

	await screen.getByRole("button", { name: "Resend" }).click();
	expect(onResend).toHaveBeenCalledOnce();
	// the action button is not the dismiss button — the alert stays
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
});

test("the { snippet } object form renders", async () => {
	const screen = render(DismissibleMessage, { message: { snippet: text("Wrapped") } });
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	expect(content()?.textContent?.trim()).toBe("Wrapped");
});

test("the { component } form renders the component", async () => {
	const screen = render(DismissibleMessage, {
		// `Thc` is a convenient stand-in for any single-prop component
		message: { component: Thc, props: { thc: "From a component" } },
	});
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	expect(content()?.textContent?.trim()).toBe("From a component");
});

// ============================================================================
// string and Error are unchanged
// ============================================================================

test("a plain string is html under the default forceAsHtml, escaped text when disabled", async () => {
	const screen = render(DismissibleMessage, { message: "<b>Bold</b>" });
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	expect(content()?.querySelector("b")?.textContent).toBe("Bold");

	await screen.rerender({ forceAsHtml: false });
	await expect.element(screen.getByRole("alert")).toHaveTextContent("<b>Bold</b>");
	expect(content()?.querySelector("b")).toBe(null);
});

test("an Error renders as String(error)", async () => {
	const screen = render(DismissibleMessage, { message: new Error("Boom") });
	await expect.element(screen.getByRole("alert")).toBeInTheDocument();
	expect(content()?.textContent?.trim()).toBe("Error: Boom");
});

// ============================================================================
// dismissed-state reset is keyed on content where there is content
// ============================================================================

test("dismissed stays dismissed across a re-render with an equal inline object literal", async () => {
	const screen = render(DismissibleMessage, { message: { text: "Saved" } });
	await screen.getByRole("button", { name: "Dismiss" }).click();
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();

	// A NEW object with the SAME content — what `message={{ text: t("saved") }}`
	// produces on every parent re-render. Must not pop the message back.
	await screen.rerender({ message: { text: "Saved" } });
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();

	// different content is a new message and re-shows
	await screen.rerender({ message: { text: "Saved again" } });
	await expect.element(screen.getByRole("alert")).toHaveTextContent("Saved again");
});

test("a snippet message is keyed on identity: same snippet stays dismissed, a new one re-shows", async () => {
	const first = text("First");
	const screen = render(DismissibleMessage, { message: first });
	await screen.getByRole("button", { name: "Dismiss" }).click();
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();

	await screen.rerender({ message: first });
	await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();

	await screen.rerender({ message: text("Second") });
	await expect.element(screen.getByRole("alert")).toHaveTextContent("Second");
});

// ============================================================================
// the dismiss button has an accessible name
// ============================================================================

test("the dismiss button is named 'Dismiss' by default (aria-label + title)", async () => {
	const screen = render(DismissibleMessage, { message: "Named" });
	const btn = screen.getByRole("button", { name: "Dismiss" });
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveAttribute("aria-label", "Dismiss");
	await expect.element(btn).toHaveAttribute("title", "Dismiss");
});

test("dismissLabel overrides the dismiss button's accessible name", async () => {
	const screen = render(DismissibleMessage, {
		message: "Named",
		dismissLabel: "Zavrieť",
	});
	const btn = screen.getByRole("button", { name: "Zavrieť" });
	await expect.element(btn).toBeInTheDocument();
	await expect.element(btn).toHaveAttribute("title", "Zavrieť");
});
