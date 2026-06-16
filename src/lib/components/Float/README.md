# Float

A non-modal, draggable, collapsible floating panel — the reusable "container" half of a
dev/inspector tweak panel (dat.GUI / Tweakpane style). It has a header (optional leading
icon, a `THC` title, an actions slot, and minimize/close buttons) and an arbitrary body.

- **Positioned by params**: numeric `x`/`y` **or** a named `placement` preset (corners / edges / center).
- **`position: fixed`** relative to the viewport, with drag **clamped** so it never leaves the screen.
- **Draggable** by the whole header (buttons excepted).
- **Minimizable** to just the title bar (header button, double-click header, or methods).
- **Imperative control** via a `bind:this` ref (mirrors `Modal`/`ModalDialog`).
- Optional: leading icon, header actions, **localStorage persistence**, and **bring-to-front** stacking.

Resizing is intentionally out of scope (v1 is drag + minimize).

## Props

| Prop                                                                  | Type               | Default       | Description                                                              |
| --------------------------------------------------------------------- | ------------------ | ------------- | ------------------------------------------------------------------------ |
| `title`                                                               | `THC`              | -             | Header title (text/html/component/snippet). Stays visible when minimized |
| `x` / `y`                                                             | `number`           | -             | Initial position in px. Overrides the corresponding `placement` axis     |
| `placement`                                                           | `FloatPlacement`   | `"top-right"` | Initial preset for any axis `x`/`y` does not pin                         |
| `offset`                                                              | `number \| {x,y}`  | `16`          | Edge gap used when resolving `placement`                                 |
| `width`                                                               | `number \| string` | token (320px) | Panel width (number = px, or any CSS length)                             |
| `minimized`                                                           | `boolean`          | `false`       | Initial collapsed state (initial-only; runtime via methods)              |
| `draggable`                                                           | `boolean`          | `true`        | Enable header drag-repositioning                                         |
| `closable`                                                            | `boolean`          | `false`       | Show the close `×` and enable `close()` / Escape                         |
| `onClose`                                                             | `() => void`       | -             | Fired by `close()`, the `×` button, and Escape                           |
| `closeOnEscape`                                                       | `boolean`          | `true`        | Close on Escape when `closable`                                          |
| `bringToFrontOnClick`                                                 | `boolean`          | `true`        | Raise above sibling Floats on pointerdown                                |
| `storageKey`                                                          | `string`           | -             | Persist `{x, y, minimized}` in `localStorage` (`stuic-float-<key>`)      |
| `margin`                                                              | `number`           | `0`           | Minimum gap kept from every viewport edge while clamping                 |
| `minimizeLabel`                                                       | `string`           | `"Minimize"`  | Accessible label for the minimize button                                 |
| `restoreLabel`                                                        | `string`           | `"Restore"`   | Accessible label when minimized                                          |
| `closeLabel`                                                          | `string`           | `"Close"`     | Accessible label for the close button                                    |
| `class` / `classHeader` / `classTitle` / `classActions` / `classBody` | `string`           | -             | Merged class overrides for each part                                     |
| `unstyled`                                                            | `boolean`          | `false`       | Drop default styling (still positioned/draggable)                        |
| `el`                                                                  | `HTMLDivElement`   | -             | Root element reference (bindable)                                        |

## Snippets

| Snippet    | Description                                                          |
| ---------- | -------------------------------------------------------------------- |
| `icon`     | Leading header content (e.g. a grip/glyph). Drag still works over it |
| `actions`  | Header actions, placed left of the minimize/close buttons            |
| `children` | Body content (hidden when minimized)                                 |

## Methods

Accessed via a `bind:this` reference.

| Method                     | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `moveTo(x, y)`             | Move to an absolute position (clamped to the viewport) |
| `moveToPlacement(a, off?)` | Move to a named placement preset                       |
| `getPosition()`            | `{ x, y }` of the current top-left                     |
| `minimize()` / `expand()`  | Collapse to / expand from the title bar                |
| `toggleMinimize()`         | Toggle collapsed state                                 |
| `isMinimized()`            | Whether currently minimized                            |
| `close()`                  | Fire `onClose` (consumer unmounts)                     |
| `bringToFront()`           | Raise above sibling Floats                             |

## Data attributes

For CSS targeting: `data-minimized`, `data-dragging`, `data-draggable` (each `"true"`/`"false"`).

## Usage

### Basic tweak panel

```svelte
<script lang="ts">
	import { Float, Switch } from "stuic";

	let fov = $state(50);
	let wireframe = $state(false);
</script>

<Float title="Scene settings" placement="top-right" width={280}>
	<label>FOV: {fov}<input type="range" min="10" max="120" bind:value={fov} /></label>
	<Switch bind:checked={wireframe} label="Wireframe" />
</Float>
```

### Imperative control

```svelte
<script lang="ts">
	let panel: Float = $state()!;
</script>

<button onclick={() => panel.moveToPlacement("bottom-left")}>Dock bottom-left</button>
<button onclick={() => panel.minimize()}>Minimize</button>

<Float bind:this={panel} title="Inspector" x={24} y={24}>…</Float>
```

### Persisted position + leading icon + actions

```svelte
<Float title="Layers" placement="left" storageKey="layers-panel">
	{#snippet icon()}<MyGrip />{/snippet}
	{#snippet actions()}
		<button data-no-drag class="stuic-float-btn" onclick={reset}>↺</button>
	{/snippet}
	…
</Float>
```

`storageKey` remembers `{x, y, minimized}` across reloads. Mark any custom interactive
controls in the header with `data-no-drag` so they don't start a drag.

### Closable

```svelte
{#if open}
	<Float title="Hints" closable onClose={() => (open = false)} placement="bottom-right">
		…
	</Float>
{/if}
```

## CSS Variables

Structural tokens (radius/shadow/border-width/transition) resolve via the fallback pattern,
so global or per-instance overrides work.

| Variable                        | Default                            | Description                            |
| ------------------------------- | ---------------------------------- | -------------------------------------- |
| `--stuic-float-width`           | `320px`                            | Default panel width                    |
| `--stuic-float-z`               | `50`                               | Stacking floor (order is added on top) |
| `--stuic-float-bg`              | `--stuic-color-background`         | Panel background                       |
| `--stuic-float-text`            | `--stuic-color-foreground`         | Panel text                             |
| `--stuic-float-border-color`    | `--stuic-color-border`             | Border / header divider color          |
| `--stuic-float-header-bg`       | `--stuic-color-surface`            | Header background                      |
| `--stuic-float-header-text`     | `--stuic-color-surface-foreground` | Header text                            |
| `--stuic-float-body-max-height` | `70vh`                             | Body max height before it scrolls      |
| `--stuic-float-btn-bg-hover`    | `--stuic-color-muted`              | Header button hover background         |
| `--stuic-float-radius`          | `--stuic-radius-container`         | Corner radius (fallback)               |
| `--stuic-float-shadow`          | `--stuic-shadow-overlay`           | Drop shadow (fallback)                 |

```svelte
<Float style="--stuic-float-header-bg: var(--stuic-color-muted);" title="Custom">…</Float>
```

## Notes

- **Non-modal**: no backdrop, no focus trap, non-blocking. `role="dialog"` + `aria-modal="false"`.
- **No portal**: rendered in place with `position: fixed`. A `transform`ed ancestor would
  break `fixed` positioning — mount Float near the top of the tree if that applies.
- Built on the reusable [`draggable`](../../actions/draggable.svelte.ts) action and the pure
  [`float-utils`](./float-utils.ts) helpers (`resolvePlacement`, `clampToViewport`).
