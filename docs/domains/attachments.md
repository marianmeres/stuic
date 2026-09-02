# Attachments Domain

## Overview

Svelte [attachments](https://svelte.dev/docs/svelte/@attach) (`{@attach ...}`, Svelte 5.29+)
for reusable DOM behavior. Attachments are the **preferred API for new DOM helpers** — they
run in an effect (so they're reactive), compose (any number per element), and can be forwarded
through components. The older [`actions/`](./actions.md) domain is kept for back-compat; new
helpers go here.

Live under `src/lib/attachments/`, exported from `src/lib/attachments/index.ts`, which is
re-exported from the package root (`src/lib/index.ts`).

---

## Available Attachments

| Attachment   | Purpose                                                                   | File             |
| ------------ | ------------------------------------------------------------------------- | ---------------- |
| `autoHeight` | Animate a host's height to its single child's natural height              | `auto-height.ts` |
| `longPress`  | Detect a touch/pen long-press on the host (factory)                       | `long-press.ts`  |
| `resizable`  | Drag / keyboard resizable width or height, ARIA window splitter (factory) | `resizable.ts`   |

---

## `autoHeight`

Drives the host element's `height` to match the natural height of its **single element child**,
re-measuring on resize via a `ResizeObserver`. Pair it with a CSS `height` transition to get a
smooth grow/shrink as the child's content changes (e.g. swapping between differently-sized views
that can't animate via a consumer-level `transition:` because the host stays mounted).

```svelte
<div class="viewport" {@attach autoHeight}>
	<div class="inner">
		<!-- variable-height content; changing it animates the viewport height -->
	</div>
</div>

<style>
	.inner {
		display: flex;
		flex-direction: column;
	}
	@media (prefers-reduced-motion: no-preference) {
		.viewport {
			transition: height 250ms ease;
		}
	}
</style>
```

### What the attachment owns vs. what you own

The attachment owns two inline styles on the host: the `height`, and — **only while that height
is transitioning** — `overflow: clip`. Clipping during the transition stops growing content from
spilling out as the box opens; clearing it at rest means focus rings, borders and shadows that
paint outside the box are **not** cut off when idle. So:

- **Don't set `overflow` on the host yourself** — it would override the at-rest reset and clip
  permanently.
- **You own the `transition`** (and gating it behind `prefers-reduced-motion`). With no
  transition configured, or under reduced-motion, the height just snaps and nothing is ever
  clipped.

### `overflow-clip-margin` (the per-consumer knob)

By default the clip edge sits at the box, so focus rings / borders that paint _outside_ a child's
box are sliced **while the transition runs** (they're fine at rest). To keep them visible during
the transition too, set `overflow-clip-margin` on the host — `overflow: clip` honours it, so paint
within that margin bleeds past the clip edge:

```css
.viewport {
	overflow-clip-margin: 0.5rem; /* let ~few-px focus outlines bleed through */
}
```

**This is consumer-specific** — different hosts wrap controls with different ring/shadow sizes:

- Size it to the largest thing painting outside a child's box: `outline-width + outline-offset`,
  or a shadow's blur + spread.
- Too small → rings still clip mid-transition; too large → growing content peeks a little further
  past the edge before it's clipped.
- If downstream consumers may need to tune it, expose it as a custom property with a default.

Example (`LoginOrRegisterForm`): the switcher's focus outline is ~4px, so the component sets
`overflow-clip-margin: var(--stuic-login-or-register-form-height-clip-margin, 0.5rem)`, letting an
app override the margin per its theme.

### Conditional / disabled

A falsy value means "no attachment" — toggling it removes the attachment (its cleanup clears the
inline `height` and `overflow`):

```svelte
<div {@attach enabled && autoHeight}>...</div>
```

### Notes

- **Single child:** the host must contain exactly one element child — that's what gets measured.
- **First paint:** the initial `auto → px` lock doesn't animate (`auto` isn't interpolatable), so
  there's no unwanted mount animation; px → px changes after that animate.
- **Async reflow:** web-font / image loads that change the child's height are caught by the
  `ResizeObserver`.

---

## `longPress`

Factory returning an attachment that calls `onLongPress(pointerdownEvent)` when a primary
touch/pen pointer stays down for `duration` ms (default 500) without moving beyond
`moveTolerance` px (default 10). Used by `ContextMenu` for its touch trigger; reusable for
any press-and-hold interaction.

```svelte
<script>
	import { longPress } from "@marianmeres/stuic";
</script>

<div {@attach longPress({ onLongPress: (e) => openAt(e.clientX, e.clientY) })}>...</div>
```

Semantics worth knowing:

- **Disarms itself** on pointer up/cancel, movement beyond the tolerance (a scroll), and on
  a native `contextmenu` event on the host — Android synthesizes one on long-press by
  itself, so a host handling `contextmenu` never gets both paths for one gesture.
- **Swallows the follow-up click** some platforms fire when the finger lifts after a fired
  long-press (`suppressClick: false` opts out), so it can't activate whatever sits under
  it. The suppress window closes right after the gesture ends — a later genuine click is
  never eaten.
- **Does not prevent the platform's own long-press UI** — that's CSS the consumer owns on
  the host: `-webkit-touch-callout: none` (iOS link/image callout) and `user-select: none`
  (text-selection long-press; scope it to `@media (pointer: coarse)` to keep desktop text
  selection working — see `ContextMenu/index.css` for the pattern).
- `pointerTypes` defaults to `["touch", "pen"]` — mouse users have right-click.

Options: `onLongPress` (required), `duration`, `moveTolerance`, `pointerTypes`,
`suppressClick`.

---

## `resizable`

Factory returning an attachment that makes the host's **width** (`axis: "x"`, default) or
**height** (`axis: "y"`) resizable by dragging its edge. The generalised core of the older
`resizableWidth` action (now a thin wrapper over it) and of the `SplitPane` component.

```svelte
<script>
	import { resizable } from "@marianmeres/stuic";
</script>

<!-- a draggable sidebar width -->
<div class="flex">
	<aside {@attach resizable({ initial: 300, min: 200, max: 600, key: "sidebar" })}>
		…
	</aside>
	<main class="flex-1">…</main>
</div>

<!-- a draggable height, in % of the (definite-height) parent -->
<div class="flex flex-col h-96">
	<div {@attach resizable({ axis: "y", units: "%", initial: 40, max: 80 })}>…</div>
	<div class="flex-1">…</div>
</div>
```

Semantics worth knowing:

- **The handle is an ARIA window splitter** — focusable `role="separator"` with
  `aria-orientation`, `aria-label` (`label`, default "Resize"), `aria-valuenow` / `min` /
  `max` / `valuetext` in `units` and `aria-controls` → the host (which gets an id if it has
  none). Arrow keys along the axis move it by `step` (default `10` px / `1` %; Shift ×10),
  Home / End go to `min` / `max` (or 0 / the container), Enter — like double-click — resets.
  Pointer Events with capture cover mouse, touch and pen; `data-resizing` sits on the handle
  while a drag is in progress, and the body gets a resize cursor + `user-select: none`.
- **Created or provided handle.** By default a thin strip with a grip is appended inside the
  host on the resized edge (`reverse` moves it to the start edge — left / top — and inverts
  the drag, for a host sitting at the end of its container) and the host becomes
  `position: relative`. Pass `handle` to drive an element of your own instead (a sibling
  separator, say — what `SplitPane` does): it receives the semantics, the listeners and
  `touch-action: none`, no styling; everything is restored on cleanup.
- **Sizes are in `units`**: `px`, or `%` of the parent element along the axis (the parent
  needs a definite height for `axis: "y"` + `%`). `min` / `max` clamp every path — drag,
  keys, `api.set()`.
- **`initial` vs stored.** `initial` (`0` = leave the CSS size alone) applies on setup unless
  a size is stored under `key` (`resizable-width-<key>` / `resizable-height-<key>`;
  `sessionStorage` by default, `storage: "local"` for localStorage). Reset restores
  `resetTo`, which defaults to `initial`.
- **Imperative api** through `onInit(api)`: `api.set(size)` (clamped, persisted, announced,
  reported), `api.reset()`, `api.current`.
- **Reactivity.** Options read in the template expression re-run the attachment, as do
  reactive reads inside an options _function_ (`resizable(() => ({ … }))`). A re-run tears
  the handle down and re-applies the (stored or initial) size, so don't feed it state that the
  drag itself writes — read that with `untrack`, or pass it as `initial` once.

Options: `enabled`, `axis`, `initial`, `min`, `max`, `units`, `reverse`, `key`, `storage`,
`step`, `label`, `resetTo`, `handle`, `handleClass`, `handleDragClass`, `onResize`, `onInit`,
`debug`.

---

## Attachment File Pattern

An attachment is a function `(node) => cleanup?`, typed `Attachment<T>` from `svelte/attachments`.
It runs in an effect when the element mounts (and re-runs if reactive state read inside it
changes); the returned function runs before a re-run and on unmount.

```ts
// auto-height.ts
import type { Attachment } from "svelte/attachments";

export const autoHeight: Attachment<HTMLElement> = (node) => {
	// setup (reads no reactive state here, so it runs once on mount)...
	return () => {
		/* cleanup */
	};
};
```

Contrast with an [action](./actions.md): an action runs once and is **not** reactive to its
argument (the codebase works around that by passing a `() => options` thunk read inside an
`$effect`). An attachment is the effect, so reactivity is built in, and unlike actions it can be
spread/forwarded onto a component's inner element.

A plain `.ts` file is fine when the attachment uses no runes (as above). Use `.svelte.ts` only if
it needs `$state` / `$derived` / a nested `$effect`.

---

## Key Files

| File                               | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| src/lib/attachments/index.ts       | All attachment exports             |
| src/lib/attachments/auto-height.ts | Height-animation attachment        |
| src/lib/attachments/long-press.ts  | Long-press detection (factory)     |
| src/lib/attachments/resizable.ts   | Resizable width / height (factory) |
