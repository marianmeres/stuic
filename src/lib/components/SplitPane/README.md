# SplitPane

Two panes with one draggable separator between them. `horizontal` (default) puts the panes
side by side and resizes the primary pane's **width**, `vertical` stacks them and resizes its
**height**; the other pane flexes into whatever is left. The classic sidebar / editor /
inspector layout, nestable.

Built on the [`resizable` attachment](../../attachments/resizable.ts) with the separator as
its `handle`, so the separator is a proper ARIA window splitter: focusable `role="separator"`
with `aria-orientation`, `aria-valuenow` / `min` / `max` (in `units`) and `aria-controls`
pointing at the primary pane. Arrow keys along the axis move it by `step` (Shift ×10),
Home / End go to the bounds, Enter (or double-click) resets. Pointer Events with capture
cover mouse, touch and pen in one code path.

## Usage

```svelte
<script>
	import { SplitPane } from "@marianmeres/stuic";
	let size = $state(30);
</script>

<div class="h-screen">
	<SplitPane bind:size min={15} max={60} key="sidebar" storage="local">
		{#snippet start()}
			<nav>…</nav>
		{/snippet}
		{#snippet end()}
			<main>…</main>
		{/snippet}
	</SplitPane>
</div>
```

Vertical, px, nested:

```svelte
<SplitPane size={25} min={10}>
	{#snippet start()}<Sidebar />{/snippet}
	{#snippet end()}
		<SplitPane orientation="vertical" units="px" size={400} min={120}>
			{#snippet start()}<Editor />{/snippet}
			{#snippet end()}<Terminal />{/snippet}
		</SplitPane>
	{/snippet}
</SplitPane>
```

The root is `width: 100%; height: 100%`, so give the container a definite height: that is
what makes long pane content scroll instead of growing the layout, and what a `vertical`
split's `%` sizes resolve against. Without one, a `horizontal` split is as tall as its
content.

## Props

| Prop             | Type                            | Default           | Description                                                                                                                                                                                                          |
| ---------------- | ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`          | `Snippet`                       | —                 | Content of the first pane (left; top when vertical)                                                                                                                                                                  |
| `end`            | `Snippet`                       | —                 | Content of the second pane (right; bottom when vertical)                                                                                                                                                             |
| `orientation`    | `"horizontal" \| "vertical"`    | `"horizontal"`    | Side by side (resizes a width) or stacked (resizes a height)                                                                                                                                                         |
| `primary`        | `"start" \| "end"`              | `"start"`         | Which pane carries the size; the other one fills the rest. With `end` the separator sits on the second pane's start edge and the drag / keys are inverted accordingly                                                |
| `size`           | `number`                        | `50`              | **Bindable.** Size of the primary pane in `units`. Written on every resize; writing it resizes (clamped to `min` / `max`, persisted, announced). A size stored under `key` wins over it on mount and is written back |
| `units`          | `"%" \| "px"`                   | `"%"`             | Percent of the container, or px. Not meant to change after mount                                                                                                                                                     |
| `min` / `max`    | `number`                        | `0` / `0`         | Bounds in `units`; `0` = none (`%` is still capped at 100)                                                                                                                                                           |
| `step`           | `number`                        | `1` (%) `10` (px) | Keyboard step in `units`; Shift multiplies by 10                                                                                                                                                                     |
| `key`            | `string \| number \| null`      | —                 | Persist the size under this key (`resizable-width-<key>` / `resizable-height-<key>`)                                                                                                                                 |
| `storage`        | `"local" \| "session"`          | `"session"`       | Where `key` persists to                                                                                                                                                                                              |
| `disabled`       | `boolean`                       | `false`           | Renders the separator inert: no drag, no keyboard, not focusable, no grip. The layout stays; writing `size` still works                                                                                              |
| `label`          | `string`                        | `t("resize")`     | Accessible name of the separator ("Resize")                                                                                                                                                                          |
| `t`              | `TranslateFn`                   | English           | Translation function for the default name — see i18n below                                                                                                                                                           |
| `onResize`       | `(info: ResizableInfo) => void` | —                 | Fires whenever a size is applied: on mount, while dragging, per key press, on reset, on `size` writes. `info` = `{ size, units, axis, container }`                                                                   |
| `unstyled`       | `boolean`                       | `false`           | Skip all default styling (the size still lands as an inline width / height)                                                                                                                                          |
| `class`          | `string`                        | —                 | Root classes                                                                                                                                                                                                         |
| `startClass`     | `string`                        | —                 | First pane classes                                                                                                                                                                                                   |
| `endClass`       | `string`                        | —                 | Second pane classes                                                                                                                                                                                                  |
| `separatorClass` | `string`                        | —                 | Separator classes                                                                                                                                                                                                    |
| `el`             | `HTMLDivElement`                | —                 | Bindable root element                                                                                                                                                                                                |
| `separatorEl`    | `HTMLDivElement`                | —                 | Bindable separator element                                                                                                                                                                                           |

Other attributes (`style`, `data-*`, …) are spread onto the root.

### Methods (via `bind:this`)

| Method    | Description                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- |
| `reset()` | Restores the size the component mounted with (what Enter / double-click on the separator do) |

### `size`, `key` and reset — who wins

- **Mount:** a size stored under `key` (from an earlier drag) beats the `size` prop and is
  written back into `bind:size`. Without `key`, `size` is it.
- **Later writes** to `size` go through the splitter: clamped, persisted, announced — an
  out-of-range write is corrected in the binding.
- **Reset** (Enter, double-click, `reset()`) restores the size the component **mounted
  with** — the `size` prop's value at that time, not the stored one.

## Panes

Both panes are `min-width: 0; min-height: 0; overflow: auto`, so long content scrolls inside a
pane instead of blowing the layout, and a pane can shrink below its content's natural size.
The primary pane is `flex: 0 0 auto` with the size as an inline `width` / `height`; the other
one is `flex: 1 1 0`. Override per pane via `startClass` / `endClass`.

## Data attributes

| Where     | Attribute          | Meaning                                     |
| --------- | ------------------ | ------------------------------------------- |
| root      | `data-orientation` | `horizontal` / `vertical`                   |
| root      | `data-disabled`    | Present when `disabled`                     |
| panes     | `data-pane`        | `start` / `end`                             |
| panes     | `data-primary`     | Present on the sized pane                   |
| separator | `data-separator`   | Always                                      |
| separator | `data-resizing`    | Present while a pointer drag is in progress |

## CSS Tokens

Prefix: `--stuic-split-pane-*`. The defaults reproduce the `resizable` attachment's built-in
handle (what `resizableWidth` / `WithSidePanel` show): a faint 1px line with a small rounded
grip, palette-based rather than theme-based, with `:root.dark` variants.

| Token                   | Default (light / dark)                        | Description                                        |
| ----------------------- | --------------------------------------------- | -------------------------------------------------- |
| `separator-color`       | `rgb(0 0 0 / 0.2)` / `rgb(255 255 255 / 0.1)` | The separator line                                 |
| `separator-color-hover` | `rgb(0 0 0 / 0.3)` / `rgb(255 255 255 / 0.2)` | … while hovered, focused or dragged                |
| `separator-thickness`   | `1px`                                         | Line thickness (the flex basis of the separator)   |
| `separator-hit-area`    | `4px`                                         | Invisible grab zone added on each side of the line |
| `grip-color`            | `--color-gray-300` / `--color-gray-600`       | The centered grip (hidden when `disabled`)         |
| `grip-color-hover`      | `--color-gray-400` / `--color-gray-500`       | … while hovered, focused or dragged                |
| `grip-border-color`     | `rgb(0 0 0 / 0.2)` / `rgb(255 255 255 / 0.2)` | Grip border                                        |
| `grip-length`           | `20px`                                        | Grip size along the separator                      |
| `grip-thickness`        | `9px`                                         | Grip size across the separator                     |
| `grip-radius`           | `0.25rem`                                     | Grip corner radius                                 |
| `ring-color`            | `--stuic-color-ring`                          | `:focus-visible` outline of the separator          |
| `transition`            | `--stuic-transition`                          | Color transition duration                          |

```svelte
<SplitPane
	style="--stuic-split-pane-separator-thickness: 6px; --stuic-split-pane-grip-length: 3rem;"
	>…</SplitPane
>
```

## i18n

The only text is the separator's default accessible name. English is built in; Slovak is
bundled, opt-in:

```svelte
<script>
	import {
		SplitPane,
		createSplitPaneT,
		SPLIT_PANE_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createSplitPaneT(SPLIT_PANE_MESSAGES_SK);
</script>

<SplitPane {t}>…</SplitPane>
```

`createSplitPaneT(messages, fallback = SPLIT_PANE_MESSAGES_EN)` accepts a partial catalog
(missing keys fall back to English). Keys: `resize`. Or just pass `label`.

## Related

- [`resizable`](../../attachments/resizable.ts) attachment — the same behavior on any element
  (own handle or a created one, width or height), for layouts that aren't a two-pane split.
- [`WithSidePanel`](../WithSidePanel/) — a sidebar layout with responsive collapse and an
  optional resizable side (built on the same attachment via `resizableWidth`).
