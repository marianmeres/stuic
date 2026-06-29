import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import CommentInput from "./CommentInput.svelte";

// CommentInput now composes `MarkdownEditor` (a rich WYSIWYG/source surface) with
// an avatar gutter + submit footer. The editor's backend (Milkdown/CodeMirror)
// mounts asynchronously behind a dynamic import, but the formatting toolbar, the
// mode toggle and the footer render synchronously from props — so the assertions
// below target those (roles / labels / handler calls), independent of the backend
// mount. Value-dependent flows seed `value` via prop rather than typing into the
// contenteditable surface.

test("renders the default toolbar (bold, italic, bullet/ordered list, link)", async () => {
	const screen = render(CommentInput, { label: "Comment" });
	await expect.element(screen.getByRole("toolbar")).toBeInTheDocument();
	for (const name of ["Bold", "Italic", "Bullet list", "Ordered list", "Link"]) {
		await expect.element(screen.getByRole("button", { name })).toBeInTheDocument();
	}
	// The reduced default deliberately omits these.
	await expect
		.element(screen.getByRole("button", { name: "Code block" }))
		.not.toBeInTheDocument();
});

test("honors a custom toolbar array", async () => {
	const screen = render(CommentInput, { toolbar: ["bold", "blockquote"] });
	await expect.element(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Blockquote" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Italic" }))
		.not.toBeInTheDocument();
});

test("toolbar={false} renders no toolbar", async () => {
	const screen = render(CommentInput, { toolbar: false });
	await expect.element(screen.getByRole("toolbar")).not.toBeInTheDocument();
});

test("mounts in source mode and shows a toggle to WYSIWYG", async () => {
	const screen = render(CommentInput, { sourceLabel: "Source", previewLabel: "Preview" });
	// Default mode is "source", so the toggle offers to switch to WYSIWYG ("Preview").
	const toggle = screen.getByRole("button", { name: "Preview" });
	await expect.element(toggle).toBeInTheDocument();
	await toggle.click();
	// Now in WYSIWYG, the toggle offers to switch back to source ("Source").
	await expect
		.element(screen.getByRole("button", { name: "Source" }))
		.toBeInTheDocument();
});

test("showModeToggle={false} hides the mode toggle", async () => {
	const screen = render(CommentInput, { showModeToggle: false });
	// At rest (source mode) the toggle would read "Preview"; assert it's absent.
	await expect
		.element(screen.getByRole("button", { name: "Preview" }))
		.not.toBeInTheDocument();
});

test("no submit button is rendered without onSubmit", async () => {
	const screen = render(CommentInput, { value: "x" });
	await expect
		.element(screen.getByRole("button", { name: "Comment" }))
		.not.toBeInTheDocument();
});

test("submit stays enabled while empty; an empty submit is blocked with an inline error", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, {
		onSubmit,
		emptyMessage: "Write something first",
	});
	const submit = screen.getByRole("button", { name: "Comment" });
	// No longer disabled just because the box is empty — it should feel alive.
	await expect.element(submit).not.toBeDisabled();
	await submit.click();
	// The empty submit is refused...
	expect(onSubmit).not.toHaveBeenCalled();
	// ...and surfaces the native inline validation error instead of disabling.
	await expect.element(screen.getByText("Write something first")).toBeInTheDocument();
});

test("blockEmptySubmit={false} lets an empty submit through to onSubmit", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, { onSubmit, blockEmptySubmit: false });
	await screen.getByRole("button", { name: "Comment" }).click();
	expect(onSubmit).toHaveBeenCalledWith("");
});

test("submit is enabled once there is content", async () => {
	const screen = render(CommentInput, { onSubmit: vi.fn(), value: "something" });
	await expect
		.element(screen.getByRole("button", { name: "Comment" }))
		.not.toBeDisabled();
});

test("clicking submit calls onSubmit with the value and clears on success", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, { onSubmit, value: "ship it" });
	const submit = screen.getByRole("button", { name: "Comment" });
	await submit.click();
	expect(onSubmit).toHaveBeenCalledWith("ship it");
	// clearOnSubmit is on by default → value is now empty, but the button stays
	// enabled (emptiness no longer disables it).
	await expect.element(submit).not.toBeDisabled();
});

test("clearOnSubmit=false keeps the value (submit stays enabled)", async () => {
	const onSubmit = vi.fn();
	const screen = render(CommentInput, {
		onSubmit,
		value: "keep me",
		clearOnSubmit: false,
	});
	const submit = screen.getByRole("button", { name: "Comment" });
	await submit.click();
	expect(onSubmit).toHaveBeenCalledWith("keep me");
	await expect.element(submit).not.toBeDisabled();
});

test("Cmd/Ctrl+Enter submits", async () => {
	const onSubmit = vi.fn();
	render(CommentInput, { onSubmit, value: "via keyboard" });
	const root = document.querySelector(".stuic-comment-input")!;
	root.dispatchEvent(
		new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true })
	);
	await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith("via keyboard"));
});

test("Cancel button appears with onCancel and calls it", async () => {
	const onCancel = vi.fn();
	const screen = render(CommentInput, { onCancel });
	const cancel = screen.getByRole("button", { name: "Cancel" });
	await expect.element(cancel).toBeInTheDocument();
	await cancel.click();
	expect(onCancel).toHaveBeenCalled();
});

test("disabled disables the toolbar buttons and the submit button", async () => {
	const screen = render(CommentInput, { value: "x", disabled: true, onSubmit: vi.fn() });
	await expect.element(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
	await expect.element(screen.getByRole("button", { name: "Comment" })).toBeDisabled();
});

test("submit validates first: a required empty field does not call onSubmit", async () => {
	const onSubmit = vi.fn();
	// blockEmptySubmit:false removes the empty gate, so the validation gate (the
	// `required` rule) is what must block the submit here.
	const screen = render(CommentInput, {
		required: true,
		blockEmptySubmit: false,
		onSubmit,
	});
	await screen.getByRole("button", { name: "Comment" }).click();
	expect(onSubmit).not.toHaveBeenCalled();
});
