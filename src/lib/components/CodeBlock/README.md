# CodeBlock

A copyable code sample for developer docs and API guides: a bordered, rounded box with a
header (the language or a file name, or tabs for several samples, and a `CopyButton`) over a
`<pre><code>`. JSON, HTTP and shell are syntax-highlighted out of the box, without markup and
without a dependency. Optional line numbers, highlighted lines, and a "Show all N lines"
collapse for long samples.

Renders `<div>` › optional header `<div>` › `<pre>` › `<code>` › optional footer `<div>`. The
code is always rendered as **text** — never as HTML — and what the button copies is exactly
what is shown.

## Props

| Prop               | Type                              | Default | Description                                                                                                                  |
| ------------------ | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `code`             | `string`                          | -       | The sample. Rendered as text. Ignored with `samples`                                                                         |
| `lang`             | `string`                          | -       | What it is written in: the header label (unless `title` is set), what gets highlighted, `data-lang`, `language-{lang}` class |
| `title`            | `THC`                             | -       | Header label in place of `lang` — e.g. a file name. `""` hides it. With `samples`: shown before the tabs, names the tab list |
| `samples`          | `CodeBlockSample[]`               | -       | Several samples of the same thing (curl / fetch / Python…), switched by tabs — see [Samples](#samples-tabs)                  |
| `active`           | `string`                          | -       | The shown sample's id (bindable) — see [Samples](#samples-tabs)                                                              |
| `highlight`        | `boolean \| CodeBlockHighlighter` | `true`  | Syntax highlighting: `true` = built-in `highlightCode`, a function = yours, `false` = off                                    |
| `lineNumbers`      | `boolean`                         | `false` | Show line numbers (never selected or copied)                                                                                 |
| `lineNumbersStart` | `number`                          | `1`     | The first line's number                                                                                                      |
| `highlightLines`   | `number[] \| string`              | -       | Lines to highlight — 1-based **positions in the sample**, e.g. `"1, 3-5"`, whatever `lineNumbersStart` says                  |
| `collapsedLines`   | `number`                          | -       | Collapse samples longer than this many lines to this many, with a toggle                                                     |
| `expanded`         | `boolean`                         | `false` | Whether a collapsible sample is expanded (bindable)                                                                          |
| `verbatim`         | `boolean`                         | `false` | Render `code` exactly as given (see [Normalization](#normalization))                                                         |
| `wrap`             | `boolean`                         | `false` | Soft-wrap long lines instead of scrolling horizontally                                                                       |
| `copy`             | `boolean`                         | `true`  | Render the copy button                                                                                                       |
| `copyButtonProps`  | `Partial<CopyButtonProps>`        | -       | Props for the `CopyButton` (`variant`, `label`, `onCopied`, …). A `text` here overrides what gets copied                     |
| `t`                | `TranslateFn`                     | English | i18n (see `createCodeBlockT`) — also localizes the copy button                                                               |
| `unstyled`         | `boolean`                         | `false` | Skip all default styling (no `stuic-*` classes, no `not-prose`; the buttons are unstyled too)                                |
| `class`            | `string`                          | -       | Additional CSS classes on the root (merged via twMerge)                                                                      |
| `classHeader`      | `string`                          | -       | The header row                                                                                                               |
| `classTitle`       | `string`                          | -       | The header label                                                                                                             |
| `classTabs`        | `string`                          | -       | The tab list                                                                                                                 |
| `classTab`         | `string`                          | -       | Every tab                                                                                                                    |
| `classPre`         | `string`                          | -       | The `<pre>`                                                                                                                  |
| `classCode`        | `string`                          | -       | The `<code>`                                                                                                                 |
| `classLine`        | `string`                          | -       | Every line (rendered only with `lineNumbers` / `highlightLines`)                                                             |
| `classFooter`      | `string`                          | -       | The footer holding the collapse toggle                                                                                       |
| `classToggle`      | `string`                          | -       | The collapse toggle                                                                                                          |
| `el`               | `HTMLDivElement`                  | -       | Root element reference (bindable)                                                                                            |

Any other attribute (`data-*`, `style`, `id`, …) goes to the root `<div>`. `title` is omitted
from the root's HTML attributes because the prop is a `THC`, not the tooltip.

The header renders when there is a label, tabs or a copy button; with `copy={false}` and no
label the block is just the `<pre>`. The copy button (borderless — `variant: "ghost"` — by
default) sits flush in the header's end corner: with it, the header keeps only its start
padding (where the label or the tabs begin), and the button is a square-cornered cell with an
inset focus ring, like a tab. Without it, the header is padded all around.

### Types

```ts
interface CodeBlockSample {
	code: string;
	lang?: string; // the tab label unless `label`; what gets highlighted
	label?: THC; // the tab label
	id?: string; // identity for `active` (default: a string `label`, else `lang`, else the index)
	highlightLines?: number[] | string; // overrides the block's
	copyText?: string; // what the copy button copies for this sample
}

type CodeBlockTokenType =
	| "comment"
	| "string"
	| "number"
	| "literal"
	| "keyword"
	| "property"
	| "variable"
	| "function"
	| "parameter"
	| "operator"
	| "punctuation"
	| "meta";
/** [start, end) offsets into the displayed text, and the type (custom types allowed) */
type CodeBlockToken = [start: number, end: number, type: CodeBlockTokenType | string];
type CodeBlockHighlighter = (code: string, lang?: string) => CodeBlockToken[];
```

## Usage

```svelte
<script lang="ts">
	import { CodeBlock } from "@marianmeres/stuic";

	const quickstart = `curl -H "Authorization: Bearer $TOKEN" \\
  https://api.example.com/v1/me`;
</script>

<CodeBlock lang="bash" code={quickstart} />
<CodeBlock lang="json" title="deno.json" code={config} />
```

## Syntax highlighting

On by default for the languages the built-in `highlightCode` knows (case insensitive):

| Language | `lang`                                                               | Tokens                                                                                            |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| JSON     | `json`, `jsonc`, `json5`                                             | keys, strings, numbers, `true`/`false`/`null`, punctuation, `//` and `/* */` comments             |
| HTTP     | `http`                                                               | request / status line, header names and values, a JSON body after the blank line                  |
| Shell    | `bash`, `sh`, `shell`, `zsh`, `console`, `terminal`, `shell-session` | `$ ` prompts, comments, strings (and the `$VARS` in them), expansions, commands, flags, operators |

Any other `lang` renders plain. The tokenizers are a reading aid, not parsers — tolerant of
placeholders (`...`), unterminated strings and comments, never throwing.

**How it is painted:** with the CSS Custom Highlight API (`CSS.highlights` + `::highlight()`),
not with markup. The `<code>` keeps plain text nodes, so selecting and copying are untouched,
the server-rendered HTML is the plain sample, and a browser without the API (all current
engines have it) simply shows the plain text. The colors appear once the page hydrates. The
API only allows color-like properties: no bold or italic tokens.

**Your own language** — any function returning `[start, end, type]` tokens; compose it with
the built-in one:

```svelte
<script lang="ts">
	import {
		CodeBlock,
		highlightCode,
		type CodeBlockHighlighter,
	} from "@marianmeres/stuic";

	const highlight: CodeBlockHighlighter = (code, lang) =>
		lang === "ts" ? myTsTokens(code) : highlightCode(code, lang);
</script>

<CodeBlock lang="ts" code={sample} {highlight} />
```

A highlighter that throws is caught (and logged) — the sample renders plain. A custom token
type `"regex"` is painted by `::highlight(stuic-code-block-regex)`, which you style:

```css
:is(.stuic-code-block-code, .stuic-code-block-code *)::highlight(stuic-code-block-regex) {
	color: darkorange;
}
```

(The descendant form matters: Firefox styles a highlight by the element that holds the text,
which is a line `<span>` when lines are rendered.) `highlightJson`, `highlightHttp` and
`highlightShell` are exported for reuse; `HIGHLIGHT_CODE_LANGS` lists the known `lang`s.

## Samples (tabs)

`samples` shows the same thing in several languages behind a tab list — the header's label
becomes the tabs; `title`, if given, is shown before them and names the tab list.

```svelte
<script lang="ts">
	import { CodeBlock, type CodeBlockSample } from "@marianmeres/stuic";

	const samples: CodeBlockSample[] = [
		{ label: "curl", lang: "bash", code: curlSample },
		{ label: "JavaScript", lang: "js", code: fetchSample, highlightLines: "2-4" },
		{ label: "Python", lang: "python", code: pythonSample },
	];

	// one bound value keeps every block on the page on the reader's language
	let language = $state<string>();
</script>

<CodeBlock title="Create an item" {samples} bind:active={language} />
<CodeBlock title="Read it back" samples={otherSamples} bind:active={language} />
```

- **Identity:** a sample's id is its `id`, else a string `label`, else `lang`, else its index
  (duplicates get the index appended). `active` holds that id.
- **Sync:** blocks bound to the same `active` switch together. A block that lacks the picked
  id keeps showing the sample it showed (initially its first) and never rewrites the value, so
  "Python" picked in one block survives a block that has only curl and fetch. Persist the
  choice across visits with `bind:active={lang.value}`, where
  `const lang = localStorageState("code-lang", "curl")`.
- **Per sample:** `highlightLines` and `copyText` override the block's; `lang` drives the
  highlighting, `data-lang` and the `language-*` class.
- In a narrow block the title moves to its own row above the tabs; many tabs scroll sideways.

## Lines

```svelte
<CodeBlock lang="bash" code={script} lineNumbers highlightLines="5-8" />
<CodeBlock lang="json" code={excerpt} lineNumbers lineNumbersStart={120} />
```

With `lineNumbers` or `highlightLines`, each line is rendered as its own block `<span>` that
**keeps its `\n`**, so the text content, a selected-and-copied range and the highlight offsets
are still exactly the sample. The numbers are `::before` content from `data-line` —
`user-select: none`, never part of a copy. `highlightLines` counts positions in the sample
(1 = its first line), not the displayed numbers. A highlighted line's band spans the full
scrolled width; with `wrap`, a wrapped line continues in the code column, not under the
numbers. Without either prop the `<code>` holds a single text node.

## Collapse

```svelte
<CodeBlock lang="json" code={bigResponse} collapsedLines={12} />
```

A sample longer than `collapsedLines` shows that many lines (padding included, measured in
`lh`), fades out, and gets a footer toggle — "Show all N lines" / "Show less" — with
`aria-expanded` and `aria-controls`. `expanded` is bindable. The hidden lines are behind the
toggle, not a scroll, so they don't make the `<pre>` a tab stop. Collapsing a block whose top
the reader has scrolled past scrolls it back into view. Independent of
`--stuic-code-block-max-height` (a scroll cap), which applies once expanded.

## Copy something other than what is shown

`copyButtonProps` reach the underlying `CopyButton`; its `text` overrides the copied string
(a sample's own `copyText` wins over it). Here the shell prompts are shown but not copied:

```svelte
<CodeBlock
	lang="shell"
	code={session}
	copyButtonProps={{
		text: session.replace(/^\$ /gm, ""),
		onCopied: () => notifications.success("Copied"),
	}}
/>
```

## i18n

```svelte
<script lang="ts">
	import {
		CodeBlock,
		createCodeBlockT,
		CODE_BLOCK_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createCodeBlockT(CODE_BLOCK_MESSAGES_SK);
</script>

<CodeBlock lang="bash" code={sample} collapsedLines={10} {t} />
```

Keys: `copy`, `copied`, `copy_failed` (the `CopyButton`'s — one `t` localizes both),
`show_all_lines` (`{count}`), `show_less`. A partial catalog falls back to English.

## Inside a typography column

The root carries `not-prose`, so inside a `prose` container the Tailwind typography plugin does
not restyle the `<pre>`, the `<code>` (it would add backticks) or the buttons. The class is
inert where the plugin isn't installed. Prose spaces its own elements, not a `<div>`, and the
component declares no outer margin — so give the block its own:

```svelte
<div class="prose">
	<p>…</p>
	<CodeBlock class="my-6" lang="bash" code={sample} />
</div>
```

## Normalization

By default the sample is normalized before it is displayed **and** copied:

- line endings become `\n`;
- blank (or whitespace-only) lines at both ends are dropped;
- the indentation every non-blank line shares is removed. The first line keeps its indentation
  relative to the rest (unlike `String#trim`), and tabs and spaces are never treated as the same
  indentation.

So a sample can sit indented in a template. `verbatim` turns all of it off.

## CSS Variables

| Variable                                    | Default                                     | Description                                                                                                                              |
| ------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--stuic-code-block-bg`                     | `transparent`                               | Box background                                                                                                                           |
| `--stuic-code-block-border-color`           | `var(--stuic-color-border)`                 | Box border color                                                                                                                         |
| `--stuic-code-block-border-width`           | `var(--stuic-border-width)`                 | Box border width (not declared — tier fallback at the usage site)                                                                        |
| `--stuic-code-block-radius`                 | `var(--stuic-radius-container)`             | Box radius (not declared — tier fallback at the usage site)                                                                              |
| `--stuic-code-block-rule-color`             | `var(--stuic-color-border)`                 | The rules under the header and above the footer                                                                                          |
| `--stuic-code-block-rule-width`             | `1px`                                       | Their width (own token, so a theme that zeroes box borders keeps them)                                                                   |
| `--stuic-code-block-text`                   | inherited color                             | Code color (not declared — falls back to `currentColor`)                                                                                 |
| `--stuic-code-block-padding-x`              | `1rem`                                      | Code inline padding — also the header's and the lines'                                                                                   |
| `--stuic-code-block-padding-y`              | `1rem`                                      | Code block padding                                                                                                                       |
| `--stuic-code-block-font-family`            | `var(--font-mono, ui-monospace, monospace)` | Code, label and tab font                                                                                                                 |
| `--stuic-code-block-font-size`              | `var(--text-sm)`                            | Code, label, tab and toggle size                                                                                                         |
| `--stuic-code-block-line-height`            | `1.625`                                     | Code line height                                                                                                                         |
| `--stuic-code-block-code-tab-size`          | `4`                                         | Width of a tab character                                                                                                                 |
| `--stuic-code-block-max-height`             | `none`                                      | Cap on the `<pre>` height (padding included); the rest scrolls                                                                           |
| `--stuic-code-block-ring-width`             | `2px`                                       | Focus ring of a scrollable `<pre>` and of the tabs (drawn inset)                                                                         |
| `--stuic-code-block-ring-color`             | `var(--stuic-color-ring)`                   | Its color                                                                                                                                |
| `--stuic-code-block-transition`             | `var(--stuic-transition)`                   | Tab hover, toggle icon (not declared — tier fallback at the usage site)                                                                  |
| `--stuic-code-block-header-bg`              | `var(--stuic-color-surface)`                | Header background                                                                                                                        |
| `--stuic-code-block-header-padding-x`       | `--stuic-code-block-padding-x`              | Header inline padding — only the start side with a copy button (not declared)                                                            |
| `--stuic-code-block-header-padding-y`       | `0.25rem`                                   | Header block padding — none with a copy button                                                                                           |
| `--stuic-code-block-header-gap`             | `0.5rem`                                    | Gap between the header's parts                                                                                                           |
| `--stuic-code-block-title-text`             | `var(--stuic-color-surface-foreground)`     | Label color                                                                                                                              |
| `--stuic-code-block-tab-text`               | `var(--stuic-color-surface-foreground)`     | Tab color (active and inactive alike)                                                                                                    |
| `--stuic-code-block-tab-padding-x`          | `0.75rem`                                   | Tab inline padding                                                                                                                       |
| `--stuic-code-block-tab-bg-hover`           | 8% surface-foreground                       | Tab hover background                                                                                                                     |
| `--stuic-code-block-tab-font-weight-active` | `var(--font-weight-semibold, 600)`          | Active tab weight                                                                                                                        |
| `--stuic-code-block-tab-indicator-color`    | `var(--stuic-color-surface-foreground)`     | Active tab's bar                                                                                                                         |
| `--stuic-code-block-tab-indicator-width`    | `2px`                                       | Its thickness                                                                                                                            |
| `--stuic-code-block-line-number-text`       | 65% foreground over background              | Line number color                                                                                                                        |
| `--stuic-code-block-line-number-gap`        | `1.25rem`                                   | Between the numbers and the code                                                                                                         |
| `--stuic-code-block-line-bg-highlighted`    | 12% primary                                 | Highlighted line band                                                                                                                    |
| `--stuic-code-block-line-marker-color`      | `var(--stuic-color-primary)`                | Highlighted line's start-edge marker                                                                                                     |
| `--stuic-code-block-line-marker-width`      | `3px`                                       | Its width                                                                                                                                |
| `--stuic-code-block-fade-size`              | `2lh`                                       | The fade over a collapsed sample's cut-off                                                                                               |
| `--stuic-code-block-token-{type}-text`      | a GitHub-like palette, light and dark       | Syntax colors — `comment`, `meta`, `string`, `number`, `literal`, `parameter`, `keyword`, `operator`, `property`, `variable`, `function` |

**Contrast.** The header label and the tabs use `surface-foreground` on `surface` (at least
7.3:1 light, 5.7:1 dark across the bundled themes); `muted-foreground` on `surface` falls below
4.5:1 in almost all of them, so it is not used. Inactive tabs are not dimmed for the same
reason — the active one is marked by its bar and weight. The line numbers (65% foreground) and
every syntax color keep at least 4.5:1 on the background of every bundled theme. The syntax
palette switches under `:root.dark`; a block with its own dark background sets the token
colors itself (the demo page has an example).

The copy button and the collapse toggle are `Button`s: theme them through the
`--stuic-button-*` tokens, or `copyButtonProps` / `classToggle`.

## Accessibility

- An overflowing `<pre>` (a long line, or a capped height) gets `tabindex="0"`, so its hidden
  part can be scrolled by keyboard (axe `scrollable-region-focusable`). It is **measured**, not
  always on: a sample that fits costs no tab stop.
- Tabs follow the WAI-ARIA tabs pattern: `role="tablist"` / `tab` / `tabpanel` (the `<pre>`),
  `aria-selected`, `aria-controls`, a roving `tabindex`, automatic activation on ←/→ (wrapping),
  Home and End. The tab panel is always a tab stop.
- The collapse toggle has `aria-expanded` and `aria-controls`.
- Line numbers and syntax colors are presentation only: neither is in the text a screen reader
  or a copy gets.
- The header is a `<div>`, not a `<header>`: outside `<main>` or sectioning content a `<header>`
  is a `banner` landmark, one per block.
- `unstyled` keeps the `language-*` class, the roles, the tab stop and the buttons — they are
  semantics, not styling.
