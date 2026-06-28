# CommentInput

A GitHub-style comment box: a **raw markdown** `<textarea>` with **Write / Preview**
tabs and a submit footer. It composes the same `InputWrap` scaffold as the
`Field*` components, so its label / description / validation / sizing / `class*`
props and look-and-feel match the rest of the form family.

Unlike `MarkdownEditor` (a WYSIWYG Milkdown/CodeMirror surface), `CommentInput` keeps
the lightweight "type raw markdown, flip to a rendered preview" model — ideal for
comments, replies and short discussion input.

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

## Preview rendering & dependencies

The Preview tab renders markdown to **sanitized** HTML. The bundled default
renderer uses `marked` + `dompurify`, declared as **optional peer dependencies**
and lazy-loaded the first time a Preview is opened:

```sh
npm i marked dompurify
```

If you don't install them, install your own renderer via `renderMarkdown` instead
(the bundled one is then never imported):

```svelte
<CommentInput bind:value renderMarkdown={(md) => mySanitizedHtml(md)} />
```

> Comment text is untrusted user content and `marked` emits embedded raw HTML
> verbatim. If you pass your own `renderMarkdown`, **you** are responsible for
> sanitizing its output.

## Props

| Prop                      | Type                                        | Default                  | Description                                                 |
| ------------------------- | ------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| `value`                   | `string` (bindable)                         | `""`                     | Comment text (raw markdown).                                |
| `mode`                    | `"write" \| "preview"` (bindable)           | `"write"`                | Active tab.                                                 |
| `input`                   | `HTMLTextAreaElement` (bindable)            | —                        | The underlying textarea element.                            |
| `name`                    | `string`                                    | —                        | Textarea `name`, for native form submission.                |
| `label`                   | `THC \| Snippet`                            | `""`                     | Field label (via InputWrap).                                |
| `description`             | `THC \| Snippet`                            | —                        | Collapsible hint below the box.                             |
| `placeholder`             | `string`                                    | —                        | Textarea placeholder.                                       |
| `renderSize`              | `"sm" \| "md" \| "lg" \| string`            | `"md"`                   | Size variant.                                               |
| `required`                | `boolean`                                   | `false`                  | Mark required + enforce on validation.                      |
| `disabled`                | `boolean`                                   | `false`                  | Disable the whole box.                                      |
| `validate`                | `boolean \| ValidateOptions`                | —                        | Enable validation (same contract as `FieldTextarea`).       |
| `useTrim`                 | `boolean`                                   | `true`                   | Trim surrounding whitespace on blur.                        |
| `useAutogrow`             | `boolean \| { enabled?, max? }`             | `true`                   | Grow the textarea with content (default max 250px).         |
| `showTabs`                | `boolean`                                   | `true`                   | Show Write/Preview tabs. `false` → plain markdown textarea. |
| `writeLabel`              | `string`                                    | `"Write"`                | Write tab label.                                            |
| `previewLabel`            | `string`                                    | `"Preview"`              | Preview tab label.                                          |
| `showMarkdownHint`        | `boolean`                                   | `true`                   | Show the subtle "Markdown supported" hint.                  |
| `markdownHintLabel`       | `string`                                    | `"Markdown supported"`   | Hint text.                                                  |
| `previewEmptyLabel`       | `string`                                    | `"Nothing to preview"`   | Shown in Preview when empty.                                |
| `previewLoadingLabel`     | `string`                                    | `"Loading preview…"`     | Shown while the Preview renderer is loading.                |
| `renderMarkdown`          | `(md: string) => string \| Promise<string>` | bundled marked+DOMPurify | Override the Preview renderer. Output is rendered as-is.    |
| `onSubmit`                | `(value: string) => void \| Promise<void>`  | —                        | Submit handler. Async → spinner + disabled while pending.   |
| `onCancel`                | `() => void`                                | —                        | Cancel handler.                                             |
| `onChange`                | `(value: string) => void`                   | —                        | Fired on every edit.                                        |
| `submitLabel`             | `string`                                    | `"Comment"`              | Submit button label.                                        |
| `cancelLabel`             | `string`                                    | `"Cancel"`               | Cancel button label.                                        |
| `showSubmit`              | `boolean`                                   | `!!onSubmit`             | Show the submit button.                                     |
| `showCancel`              | `boolean`                                   | `!!onCancel`             | Show the cancel button.                                     |
| `submitOnModEnter`        | `boolean`                                   | `true`                   | Submit on ⌘/Ctrl+Enter.                                     |
| `clearOnSubmit`           | `boolean`                                   | `true`                   | Clear value after a successful submit.                      |
| `submitDisabledWhenEmpty` | `boolean`                                   | `true`                   | Disable submit when empty/whitespace.                       |
| `busy`                    | `boolean`                                   | `false`                  | External busy state (disables box + submit).                |
| `avatar`                  | `THC \| Snippet`                            | —                        | Optional gutter to the left of the box.                     |
| `footer`                  | `Snippet`                                   | —                        | Extra footer content, left of the buttons.                  |

Plus the standard `InputWrap` layout props (`labelAfter`, `below`, `labelLeft`,
`labelLeftWidth`, `labelLeftBreakpoint`) and `class*` props (`classInput`,
`classBar`, `classPreview`, `classFooter`, and the shared `InputWrapClassProps`).

## Imperative API

Bind the component (`bind:this`) to call: `validate()`, `clearValidation()`,
`getValidation()`, `focus()`, `scrollIntoView()`, `submit()`.

## CSS variables

All optional; each falls back to the shared `--stuic-input-*` token, then a global
default.

| Variable                              | Falls back to                  |
| ------------------------------------- | ------------------------------ |
| `--stuic-comment-input-radius`        | `--stuic-input-radius`         |
| `--stuic-comment-input-border`        | `--stuic-input-border`         |
| `--stuic-comment-input-border-focus`  | `--stuic-input-border-focus`   |
| `--stuic-comment-input-bg`            | `--stuic-input-bg`             |
| `--stuic-comment-input-padding-x`     | `--stuic-input-padding-x-*`    |
| `--stuic-comment-input-padding-y`     | `--stuic-input-padding-y-*`    |
| `--stuic-comment-input-font-size`     | `--stuic-input-font-size-*`    |
| `--stuic-comment-input-min-height`    | `5rem` (`4rem` sm / `7rem` lg) |
| `--stuic-comment-input-gap`           | `0.625rem`                     |
| `--stuic-comment-input-tab-active-bg` | subtle overlay                 |
| `--stuic-comment-input-code-bg`       | subtle overlay                 |
