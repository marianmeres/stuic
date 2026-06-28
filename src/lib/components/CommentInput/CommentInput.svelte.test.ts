import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import CommentInput from "./CommentInput.svelte";

// CommentInput renders, inside an InputWrap, a `.stuic-comment-input` card with a
// role="tablist" (Write/Preview tabs), a real <textarea> (role="textbox") that
// stays in the DOM across tabs, and a submit footer. Component CSS isn't loaded in
// browser tests, so we assert on roles / attributes / values / handler calls — the
// reactive contracts — not on visual hiding. Preview content is asserted with a
// deterministic custom `renderMarkdown` (the default marked+DOMPurify path is
// covered separately).

test("renders a textarea (textbox) seeded with the bound value", async () => {
	const screen = render(CommentInput, { value: "hello", label: "Comment" });
	const ta = screen.getByRole("textbox");
	await expect.element(ta).toBeInTheDocument();
	await expect.element(ta).toHaveValue("hello");
});

test("typing updates the value and fires onChange", async () => {
	const onChange = vi.fn();
	const screen = render(CommentInput, { onChange });
	const ta = screen.getByRole("textbox");
	await ta.fill("a comment");
	await expect.element(ta).toHaveValue("a comment");
	expect(onChange).toHaveBeenCalled();
	expect(onChange.mock.calls.at(-1)?.[0]).toBe("a comment");
});

test("Write/Preview tabs render; default tab is Write (aria-selected)", async () => {
	const screen = render(CommentInput, { value: "x" });
	await expect.element(screen.getByRole("tablist")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("tab", { name: "Write" }))
		.toHaveAttribute("aria-selected", "true");
	await expect
		.element(screen.getByRole("tab", { name: "Preview" }))
		.toHaveAttribute("aria-selected", "false");
});

test("clicking Preview switches mode and renders the renderMarkdown output", async () => {
	const renderMarkdown = (md: string) => `<em data-testid="rendered">${md}</em>`;
	const screen = render(CommentInput, { value: "hi there", renderMarkdown });
	await screen.getByRole("tab", { name: "Preview" }).click();
	// Two tabpanels exist (Write + Preview); the inactive Write one is `hidden`.
	const panel = screen.getByRole("tabpanel", { name: "Preview" });
	await expect.element(panel).toBeInTheDocument();
	await expect.element(panel).toHaveTextContent("hi there");
});

test("Preview shows the empty placeholder when there is nothing to render", async () => {
	const screen = render(CommentInput, {
		value: "   ",
		previewEmptyLabel: "Nothing here",
	});
	await screen.getByRole("tab", { name: "Preview" }).click();
	await expect
		.element(screen.getByRole("tabpanel", { name: "Preview" }))
		.toHaveTextContent("Nothing here");
});

test("default renderer (marked + DOMPurify) turns **bold** into <strong>", async () => {
	const screen = render(CommentInput, { value: "a **bold** word" });
	await screen.getByRole("tab", { name: "Preview" }).click();
	const panel = screen.getByRole("tabpanel", { name: "Preview" });
	// Lazy dynamic import of the optional peers resolves async; expect.element retries.
	await expect.element(panel.getByText("bold")).toBeInTheDocument();
	expect(panel.element().querySelector("strong")).toBeTruthy();
});

test("submit is disabled while empty and enabled once there is content", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, { onSubmit });
	const submit = screen.getByRole("button", { name: "Comment" });
	await expect.element(submit).toBeDisabled();
	await screen.getByRole("textbox").fill("something");
	await expect.element(submit).not.toBeDisabled();
});

test("clicking submit calls onSubmit with the value and clears on success", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, { onSubmit });
	const ta = screen.getByRole("textbox");
	await ta.fill("ship it");
	await screen.getByRole("button", { name: "Comment" }).click();
	expect(onSubmit).toHaveBeenCalledWith("ship it");
	// clearOnSubmit is on by default
	await expect.element(ta).toHaveValue("");
});

test("clearOnSubmit=false keeps the value after submit", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, { onSubmit, clearOnSubmit: false });
	const ta = screen.getByRole("textbox");
	await ta.fill("keep me");
	await screen.getByRole("button", { name: "Comment" }).click();
	expect(onSubmit).toHaveBeenCalledWith("keep me");
	await expect.element(ta).toHaveValue("keep me");
});

test("Cmd/Ctrl+Enter submits", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, { onSubmit });
	const ta = screen.getByRole("textbox");
	await ta.fill("via keyboard");
	ta.element().dispatchEvent(
		new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true })
	);
	await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith("via keyboard"));
});

test("no submit button is rendered without onSubmit (showSubmit default)", async () => {
	const screen = render(CommentInput, { value: "x" });
	await expect
		.element(screen.getByRole("button", { name: "Comment" }))
		.not.toBeInTheDocument();
});

test("Cancel button appears with onCancel and calls it", async () => {
	const onCancel = vi.fn();
	const screen = render(CommentInput, { onCancel });
	const cancel = screen.getByRole("button", { name: "Cancel" });
	await expect.element(cancel).toBeInTheDocument();
	await cancel.click();
	expect(onCancel).toHaveBeenCalled();
});

test("showTabs=false renders no tablist", async () => {
	const screen = render(CommentInput, { value: "x", showTabs: false, onSubmit: vi.fn() });
	await expect.element(screen.getByRole("tablist")).not.toBeInTheDocument();
	// the textarea is still there
	await expect.element(screen.getByRole("textbox")).toBeInTheDocument();
});

test("disabled disables the textarea and the tabs", async () => {
	const screen = render(CommentInput, { value: "x", disabled: true, onSubmit: vi.fn() });
	await expect.element(screen.getByRole("textbox")).toBeDisabled();
	await expect.element(screen.getByRole("tab", { name: "Write" })).toBeDisabled();
});

test("required is reflected on the textarea", async () => {
	const screen = render(CommentInput, { required: true, label: "Required" });
	await expect.element(screen.getByRole("textbox")).toBeRequired();
});

test("submit validates first: a required empty field does not call onSubmit", async () => {
	const onSubmit = vi.fn();
	// submitDisabledWhenEmpty:false makes the button clickable while empty, so the
	// validation gate (not the empty gate) is what must block the submit.
	const screen = render(CommentInput, {
		required: true,
		submitDisabledWhenEmpty: false,
		onSubmit,
	});
	await screen.getByRole("button", { name: "Comment" }).click();
	expect(onSubmit).not.toHaveBeenCalled();
});

test("ArrowRight on the Write tab moves selection to Preview (roving tablist)", async () => {
	const screen = render(CommentInput, { value: "x" });
	const write = screen.getByRole("tab", { name: "Write" });
	await expect.element(write).toHaveAttribute("aria-selected", "true");
	write
		.element()
		.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
	await expect
		.element(screen.getByRole("tab", { name: "Preview" }))
		.toHaveAttribute("aria-selected", "true");
});

test("each tab is wired to its panel via aria-controls", async () => {
	const screen = render(CommentInput, { value: "x" });
	await expect
		.element(screen.getByRole("tab", { name: "Write" }))
		.toHaveAttribute("aria-controls");
	await expect
		.element(screen.getByRole("tab", { name: "Preview" }))
		.toHaveAttribute("aria-controls");
});
