# CommentInput

A GitHub-style **comment composer** built on top of [`MarkdownEditor`](../MarkdownEditor/README.md).
It pairs a rich **WYSIWYG / source** markdown editor (a minimal formatting toolbar
plus a built-in **Source** toggle) with an optional avatar gutter and a
submit / cancel footer. Field chrome (label / description / validation / sizing /
theming) comes from the same `InputWrap` scaffold as the `Field*` family, so it
matches the rest of the form family.

Where `MarkdownEditor` is the full-featured editor, `CommentInput` is the
lightweight, opinionated wrapper for the common "leave a comment / reply" use
case: a clean minimal toolbar, an avatar, a submit button, and
⌘/Ctrl+Enter-to-send — without you having to wire any of it up.

```svelte
<script>
	import { CommentInput } from "@marianmeres/stuic";

	let value = $state("");

	async function post(text) {
		await api.addComment(text); // your handler
	}
</script>

<CommentInput
	bind:value
	label="Add a comment"
	placeholder="Leave a comment…"
	onSubmit={post}
/>
```

## Dependencies

Because the editing surface **is** `MarkdownEditor`, `CommentInput` inherits its
**optional peer dependencies** — Milkdown (WYSIWYG) and CodeMirror (source) — which
are **lazy-loaded** the first time the editor mounts:

```sh
npm i @milkdown/core @milkdown/ctx @milkdown/plugin-history \
  @milkdown/plugin-listener @milkdown/preset-commonmark @milkdown/preset-gfm \
  @milkdown/prose @milkdown/transformer @milkdown/utils \
  @codemirror/commands @codemirror/lang-markdown @codemirror/language \
  @codemirror/language-data @codemirror/state @codemirror/view
```

This is the same peer set as `MarkdownEditor` — see its README for the
authoritative list. If they aren't installed, the surface stays empty and a
console error explains why.

## Toolbar

`toolbar` accepts `true` (the default), `false` (hidden), or an ordered
array of items (`"|"` for a separator):

```svelte
<!-- Default: ["bold", "italic", "|", "bulletList", "orderedList", "|", "link"] -->
<CommentInput bind:value onSubmit={post} />

<!-- Custom set -->
<CommentInput
	bind:value
	toolbar={["bold", "italic", "|", "bulletList", "orderedList", "|", "link"]}
	onSubmit={post}
/>

<!-- No toolbar (still WYSIWYG, drives via shortcuts / the Source toggle) -->
<CommentInput bind:value toolbar={false} onSubmit={post} />
```

Available items: `bold`, `italic`, `heading1`–`heading6`, `link`, `image`,
`bulletList`, `orderedList`, `blockquote`, `codeBlock`, `hr`, `hardBreak`, `undo`,
`redo` (and `"|"`). The default is exported as `DEFAULT_COMMENT_TOOLBAR`.

## Keyboard

| Shortcut           | Action               | Prop               |
| ------------------ | -------------------- | ------------------ |
| ⌘/Ctrl + Enter     | Submit               | `submitOnModEnter` |
| ⌘/Ctrl + B / I / K | Bold / Italic / Link | `useShortcuts`     |

## Props

| Prop                 | Type                                       | Default                                       | Description                                                                 |
| -------------------- | ------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------- |
| `value`              | `string` (bindable)                        | `""`                                          | Comment content (markdown).                                                 |
| `mode`               | `"wysiwyg" \| "source"` (bindable)         | `"source"`                                    | Active editing surface (opens on raw markdown).                             |
| `input`              | `HTMLDivElement` (bindable)                | —                                             | The editor surface wrapper element.                                         |
| `name`               | `string`                                   | —                                             | Hidden input `name`, for native form submission.                            |
| `label`              | `THC \| Snippet`                           | `""`                                          | Field label (via InputWrap).                                                |
| `description`        | `THC \| Snippet`                           | —                                             | Collapsible hint below the box.                                             |
| `placeholder`        | `string`                                   | —                                             | Editor placeholder.                                                         |
| `renderSize`         | `"sm" \| "md" \| "lg" \| string`           | `"md"`                                        | Size variant.                                                               |
| `required`           | `boolean`                                  | `false`                                       | Mark required + enforce on validation.                                      |
| `disabled`           | `boolean`                                  | `false`                                       | Disable the whole box.                                                      |
| `validate`           | `boolean \| ValidateOptions`               | —                                             | Enable validation (same contract as `MarkdownEditor`).                      |
| `toolbar`            | `boolean \| ToolbarItem[]`                 | `DEFAULT_COMMENT_TOOLBAR`                     | Formatting toolbar config.                                                  |
| `mobileToolbar`      | `boolean \| ToolbarItem[]`                 | MarkdownEditor default                        | Toolbar on touch devices.                                                   |
| `autoSourceOnMobile` | `boolean`                                  | `true`                                        | Start in source mode on mobile.                                             |
| `mobileQuery`        | `string`                                   | `(pointer: coarse) …`                         | Media query defining "mobile".                                              |
| `prompt`             | `PromptFn`                                 | `window.prompt`                               | URL prompt used by the link/image buttons.                                  |
| `maxHeight`          | `number \| string`                         | `32rem`                                       | Cap the editing surface height (scrolls inside).                            |
| `capToParent`        | `boolean`                                  | `true`                                        | Also cap the surface to the parent's available height.                      |
| `showModeToggle`     | `boolean`                                  | `true`                                        | Show the WYSIWYG/Source toggle.                                             |
| `sourceLabel`        | `string`                                   | `"Source"`                                    | Toggle label while in WYSIWYG mode.                                         |
| `previewLabel`       | `string`                                   | `"Preview"`                                   | Toggle label while in source mode.                                          |
| `useShortcuts`       | `boolean`                                  | `true`                                        | Wire ⌘/Ctrl+B / I / K to bold / italic / link.                              |
| `onSubmit`           | `(value: string) => void \| Promise<void>` | —                                             | Submit handler. Async → spinner + disabled while pending.                   |
| `onCancel`           | `() => void`                               | —                                             | Cancel handler.                                                             |
| `onChange`           | `(value: string) => void`                  | —                                             | Fired on every edit.                                                        |
| `submitLabel`        | `string`                                   | `"Comment"`                                   | Submit button label.                                                        |
| `cancelLabel`        | `string`                                   | `"Cancel"`                                    | Cancel button label.                                                        |
| `showSubmit`         | `boolean`                                  | `!!onSubmit`                                  | Show the submit button.                                                     |
| `showCancel`         | `boolean`                                  | `!!onCancel`                                  | Show the cancel button.                                                     |
| `submitOnModEnter`   | `boolean`                                  | `true`                                        | Submit on ⌘/Ctrl+Enter.                                                     |
| `clearOnSubmit`      | `boolean`                                  | `true`                                        | Clear value after a successful submit.                                      |
| `blockEmptySubmit`   | `boolean`                                  | `true`                                        | Block empty/whitespace submits via the inline error (submit stays enabled). |
| `emptyMessage`       | `string`                                   | `"Please write something before submitting."` | Inline error shown when an empty submit is blocked.                         |
| `busy`               | `boolean`                                  | `false`                                       | External busy state (disables box + submit).                                |
| `avatar`             | `THC \| Snippet`                           | —                                             | Optional gutter to the left of the box.                                     |
| `footer`             | `Snippet`                                  | —                                             | Extra footer content, left of the buttons.                                  |

Plus the standard `InputWrap` layout props (`labelAfter`, `below`, `labelLeft`,
`labelLeftWidth`, `labelLeftBreakpoint`) and `class*` props (`classInput` →
editor surface, `classBar` → toolbar, `classFooter` → button row, and the shared
`InputWrapClassProps`).

## Imperative API

Bind the component (`bind:this`) to call: `validate()`, `clearValidation()`,
`getValidation()`, `focus()`, `scrollIntoView()`, `submit()`. All delegate to the
embedded `MarkdownEditor`.

## Theming

The editor card, toolbar and field chrome are themed via the
`--stuic-markdown-editor-*` and shared `--stuic-input-*` tokens (see the
`MarkdownEditor` README). `CommentInput` adds only its own layout tokens:

| Variable                           | Default    | Description                                |
| ---------------------------------- | ---------- | ------------------------------------------ |
| `--stuic-comment-input-gap`        | `0.625rem` | Gap between the avatar and the box.        |
| `--stuic-comment-input-footer-gap` | `0.5rem`   | Gap between the editor and the footer.     |
| `--stuic-comment-input-min-height` | `5rem`     | Editor min-height (`4rem` sm / `7rem` lg). |
