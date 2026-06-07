# MarkdownEditor

A textarea-like STUIC field for authoring longer markdown content. It presents a
**quasi-WYSIWYG** surface ([Milkdown](https://milkdown.dev), the markdown-first
ProseMirror distribution) that toggles to a **raw markdown source** editor
([CodeMirror 6](https://codemirror.net)). A single bindable markdown string is
the source of truth across both modes.

It is shipped as an **optional subpath export**, separate from the main barrel,
so its (heavy) editor dependencies never reach consumers who don't use it.

## Installation

The editor libraries are **optional peer dependencies** — install them only if
you use this component:

```sh
pnpm add @milkdown/core @milkdown/ctx @milkdown/transformer @milkdown/prose \
  @milkdown/preset-commonmark @milkdown/preset-gfm \
  @milkdown/plugin-listener @milkdown/plugin-history @milkdown/utils \
  @codemirror/state @codemirror/view @codemirror/commands \
  @codemirror/language @codemirror/lang-markdown @codemirror/language-data
```

## Usage

```svelte
<script lang="ts">
	import { MarkdownEditor } from "@marianmeres/stuic/markdown-editor";

	let value = $state("# Hello\n\nSome **markdown**.");
	let mode = $state<"wysiwyg" | "source">("wysiwyg");
</script>

<MarkdownEditor bind:value bind:mode label="Article body" required />
```

### Imperative API

Bind the component instance to access:

- `validate()` – run validation now, returns the `ValidationResult`
- `clearValidation()` – clear the inline message
- `getValidation()` – current validation state
- `focus()` – focus the active editor
- `scrollIntoView(opts?)`
- `getMarkdown()` – read current markdown from the active editor
- `toggleMode()` – switch WYSIWYG ⇄ source

## Key props

| Prop             | Type                         | Default     | Notes                                                               |
| ---------------- | ---------------------------- | ----------- | ------------------------------------------------------------------- |
| `value`          | `string` (bindable)          | `""`        | Markdown, single source of truth                                    |
| `mode`           | `"wysiwyg" \| "source"`      | `"wysiwyg"` | Active surface (bindable)                                           |
| `label`          | `THC \| Snippet`             | –           | Field label                                                         |
| `description`    | `THC \| Snippet`             | –           | Collapsible hint                                                    |
| `required`       | `boolean`                    | `false`     | Enforced over the markdown string                                   |
| `disabled`       | `boolean`                    | `false`     |                                                                     |
| `validate`       | `boolean \| ValidateOptions` | –           | Pass a `customValidator` to validate markdown                       |
| `renderSize`     | `"sm" \| "md" \| "lg"`       | `"md"`      |                                                                     |
| `toolbar`        | `boolean \| ToolbarItem[]`   | `true`      | `true` = default toolbar, `false` = none, or an ordered button list |
| `maxHeight`      | `number \| string`           | `32rem`     | Surface height cap (`number` = px). Long docs scroll internally     |
| `capToParent`    | `boolean`                    | `true`      | Also cap the surface to the parent's available height               |
| `showModeToggle` | `boolean`                    | `true`      | Show the WYSIWYG/source toggle                                      |
| `name`           | `string`                     | –           | Hidden input name for form submission                               |

Plus the standard `InputWrapClassProps` (`classLabel`, `classInputBox`, …),
`labelLeft*`, `placeholder`, `onChange`, and `classInput` / `classToolbar`.

### Toolbar

Pass an array of `ToolbarItem`s to choose exactly which buttons appear and in
what order; use `"|"` for a separator. Each button works in both WYSIWYG and
source modes.

```svelte
<script lang="ts">
	import { MarkdownEditor, type ToolbarItem } from "@marianmeres/stuic/markdown-editor";
	const toolbar: ToolbarItem[] = [
		"bold",
		"italic",
		"|",
		"blockquote",
		"codeBlock",
		"|",
		"undo",
		"redo",
	];
</script>

<MarkdownEditor bind:value {toolbar} />
```

Available items: `bold`, `italic`, `heading1`, `heading2`, `heading3`, `link`,
`image`, `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `hr`,
`hardBreak`, `undo`, `redo`, and `"|"` (separator). The default layout is
exported as `DEFAULT_TOOLBAR`.

### Height & scrolling

A long document never grows the editor unbounded (which would scroll the toolbar
out of view). The editing **surface** has a finite max height and scrolls
internally instead:

- **Fixed cap** — `maxHeight` (`number` → px, or any CSS length string like
  `"40rem"` / `"60vh"`), defaulting to `32rem` (themeable via
  `--stuic-markdown-editor-max-height`).
- **Parent cap** — with `capToParent` on (default), the surface is _also_ capped
  to the height available in the parent container, measured at runtime. The
  **smaller** of the two limits wins, so the editor fills — but never overflows —
  a height-constrained parent (e.g. a flex column, modal body, or split pane).

```svelte
<!-- explicit fixed cap; ignore the parent -->
<MarkdownEditor bind:value maxHeight="20rem" capToParent={false} />

<!-- fill a height-constrained pane, scrolling internally past its available height -->
<div style="height: 60vh; display: flex; flex-direction: column;">
	<MarkdownEditor bind:value maxHeight="100vh" />
</div>
```

The minimum height (`--stuic-markdown-editor-min-height`, `12rem` for `md`) still
applies, so the surface never collapses below a usable editing area.

### Link / image URL prompt

By default the link and image buttons ask for a URL via the native
`window.prompt`. Pass a `window.prompt`-compatible function (sync or async) to
the `prompt` prop to replace it — e.g. STUIC's ACP dialog via `createPrompt`:

```svelte
<script lang="ts">
	import { MarkdownEditor } from "@marianmeres/stuic/markdown-editor";
	import {
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		createPrompt,
	} from "@marianmeres/stuic";

	const acp = new AlertConfirmPromptStack();
</script>

<MarkdownEditor bind:value prompt={createPrompt(acp)} />

<!-- mount the ACP provider once, anywhere in the app -->
<AlertConfirmPrompt {acp} />
```

### Mobile / touch

`contenteditable` (the WYSIWYG view) is rougher on phones than a plain text
field, so on touch devices the editor adapts:

- **Starts in `source` mode** (the steadier CodeMirror view) — toggle
  `autoSourceOnMobile={false}` to keep WYSIWYG.
- **Shows a reduced toolbar** (`DEFAULT_MOBILE_TOOLBAR`) — override with
  `mobileToolbar` (same shape as `toolbar`).
- **Larger touch targets** (40px) via a `(pointer: coarse)` media query.

"Mobile" is defined by `mobileQuery`
(default `"(pointer: coarse) and (max-width: 640px)"`). The applied-once source
default never fights a later manual toggle. Both toggles are exported:
`DEFAULT_MOBILE_TOOLBAR`.

## Theming

All visuals are CSS-variable driven. Component tokens fall back to the shared
input/global tokens:

```css
--stuic-markdown-editor-radius      /* → --stuic-input-radius → --stuic-radius */
--stuic-markdown-editor-border
--stuic-markdown-editor-border-focus
--stuic-markdown-editor-bg
--stuic-markdown-editor-min-height  /* default 12rem (9/16rem for sm/lg) */
--stuic-markdown-editor-max-height  /* default 32rem; see "Height & scrolling" */
--stuic-markdown-editor-font-size
--stuic-markdown-editor-font-mono
--stuic-markdown-editor-code-bg
```

## Notes & caveats

- **CSS is imported locally** by this component (not via the central
  `src/lib/index.css`). This is a deliberate deviation from the STUIC convention,
  required so the styles ship only to subpath users. See `index.css` for the
  rationale.
- **SSR-safe / lazy-loaded.** Both editors are browser-only and loaded via
  dynamic `import()` inside a client-only effect, so they never run during SSR
  and split into their own chunk. The server renders only the field chrome.
- **Round-trip is normalizing, not byte-preserving.** The WYSIWYG leg sends
  markdown → ProseMirror → markdown via remark, which normalizes formatting:
  blank-line collapse, emphasis/bullet marker unification, Setext (`===`)
  headings → ATX (`#`), hard-break changes, and raw HTML that the schema can't
  model may be dropped/escaped. GFM constructs (tables, strikethrough, task
  lists) are supported via `@milkdown/preset-gfm`. **The editor owns canonical
  formatting after the first edit.** The raw **source** mode is lossless.
- Switching modes flushes the current content into `value` before tearing the
  editor down, so no edits are lost on toggle.
