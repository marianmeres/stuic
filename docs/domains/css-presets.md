# CSS Presets Domain

## Overview

`src/lib/css/` holds **CSS presets**: a class plus a custom-property contract, with no JS and
no Svelte component. A preset is used by putting a class on **your own** element and (optionally)
setting a token on it or an ancestor.

Today there is exactly one: the **ratio-locked frame** (`src/lib/css/frame.css`). This document
also covers the two remaining global class surfaces that live directly in `src/lib/index.css`
— `.scrollbar-thin` and `.stuic-safe-area-*` — because they have no other home.

> **`G<n>` references** point at the measured gotcha list in
> [Ratio-Locked Frame Reference](../RATIO_LOCKED_FRAME.md#gotchas) — every entry there carries
> the number it was measured at, and in which engines.

**Two rules govern everything below.**

1. **Presets are in `@layer components`, so utilities always win.** Tailwind emits
   `@layer theme, base, components, utilities`. `class="stuic-frame h-dvh overflow-y-auto bg-white"`
   overrides every declaration in the preset. That is the escape hatch, by design. (Contrast:
   `.scrollbar-thin` and `.stuic-safe-area-*` are deliberately **unlayered**, so they beat a
   consumer's `utilities` layer — see their sections.)
2. **stuic declares none of the preset's tokens anywhere.** Defaults exist only as `var()`
   fallbacks at usage sites, per the Fallback Pattern in [conventions.md](../conventions.md).
   This is what makes a scoped override (`style="--stuic-frame-aspect-ratio: 0.25"` on the element,
   or on any ancestor) actually work. See **G11** for the measured cost of getting this wrong.

---

## Ratio-locked frame (letterbox)

Lock a box to an aspect ratio, size it to whichever axis binds first, centre it, and let the
leftover space become letterboxing.

### The pattern in one line

```
parent:  centre + clip
child:   width = min(available-width, available-height × ratio)
```

The child's height then comes from `aspect-ratio`. Deriving the width from the height and letting
`aspect-ratio` derive the height back is **not** circular: `width` resolves first, and
`aspect-ratio` only ever fills an `auto` axis (**G14**).

### Classes

| Class              | Does                                                                                                                                                | Use when                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `.stuic-frame`     | The ratio-locked box, sized in `vw`/`dvh`, centred via `margin: auto`                                                                               | The frame is anchored to the viewport                                                                |
| `.stuic-frame-cq`  | Same width formula in `cqw`/`cqh`. **Combine with** `.stuic-frame`                                                                                  | The frame is nested (under a header, inside a flex column)                                           |
| `.stuic-frame-col` | `width: min(100%, <frame width>)` + `margin-inline: auto`. Nothing else — no ratio. Viewport-space only — it cannot track a `.stuic-frame-cq` frame | Re-align a viewport-space element (top-layer dialog, body-portalled overlay) onto the frame's column |

`.stuic-frame` also sets `min-height: 0` and `overflow: hidden`. Both are **load-bearing for the
ratio**, not cosmetics — see **G13**. Do not "simplify" them away.

`.stuic-frame-cq` must stay **after** `.stuic-frame` in source order (equal specificity, same
layer). It is, in `frame.css`; do not reorder.

### Token contract

All three are consumer **inputs**. stuic declares none of them.

| Token                        | Default (as a `var()` fallback)                                                | Meaning                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--stuic-frame-aspect-ratio` | `1`                                                                            | width ÷ height. Any value valid in `aspect-ratio:`                                                                                                                             |
| `--stuic-frame-width`        | `min(100vw, calc(100dvh * (ratio)))`, or the `cq` form under `.stuic-frame-cq` | Wholesale width override. Bail-out value: `100vw` — **pair with `--stuic-frame-height: 100dvh`**; alone, `aspect-ratio` still supplies the height and you get a `100vw` square |
| `--stuic-frame-height`       | `auto` ⇒ ratio-locked                                                          | Wholesale height override. `100dvh` ⇒ fill the height, derive the width                                                                                                        |

The default ratio is **`1`**, not a plausible app ratio: a square is unmistakably "you forgot to set
the ratio", where a plausible default would ship a plausible-looking wrong layout.

**Ratio form.** Anything `aspect-ratio` accepts. Prefer `calc(16 / 9)` or a bare number. `16 / 9`
works too — `frame.css` parenthesises every `var()` inside every `calc()`, so the library is safe
with all three forms. **Your** `calc()`s are not: see **G9**.

**The four override scenarios**, each measured:

```css
/* 1. GLOBAL — measured 450x900 at ratio 0.5 on a 1440x900 viewport;
   384px wide at 1200x800 with the 0.48 below */
:root {
	--stuic-frame-aspect-ratio: 0.48;
}
```

```html
<!-- 2. SCOPED (per element, per ancestor; two frames, two ratios, one page) —
     measured 225x900 at r=0.25 next to 1440x810 at r=1.7778 -->
<div class="stuic-frame" style="--stuic-frame-aspect-ratio: 0.25"></div>
```

```css
/* 3. MEDIA-QUERY WHOLESALE (the bail-out) — measured 320x568 full bleed;
   without it, 284x568 with 18px bars */
@media (max-width: 40rem) and (max-aspect-ratio: 3 / 5) {
	:root {
		--stuic-frame-width: 100vw;
		--stuic-frame-height: 100dvh;
	}
}
```

```html
<!-- 4. TOP-LAYER READ — a dialog that is a DOM descendant of the frame measures 225px,
     tracking the scoped ratio (custom properties inherit into the top layer; geometry
     does not). The same dialog portalled to <body> measures 450px, the :root ratio. -->
<dialog class="m-0 h-dvh w-screen max-w-none border-0 p-0">
	<div class="stuic-frame-col">…</div>
</dialog>
```

**Aliasing the width** for call sites outside the frame (e.g. a dropdown that must not exceed the
column). Measured working, both engines:

```css
:root {
	--stuic-frame-aspect-ratio: 0.48;
	--app-width: var(
		--stuic-frame-width,
		min(100vw, calc(100dvh * (var(--stuic-frame-aspect-ratio))))
	);
}
```

The alias freezes the ratio at its `:root` value — a scoped `--stuic-frame-aspect-ratio` override
will not move it (**G11**), so use it only where the ratio is global.

### What this preset deliberately does NOT ship

Everything else in a letterbox layout is already a Tailwind v4 utility. All of these were compiled
against this repo's own `tailwindcss@4.3.3`:

| Job                                    | Tailwind v4 utility                       | Compiles to                   |
| -------------------------------------- | ----------------------------------------- | ----------------------------- |
| The letterbox bars                     | `fixed inset-0 grid overflow-hidden bg-*` | —                             |
| Trap `position: fixed` descendants     | `contain-layout contain-paint`            | `contain: layout paint`       |
| Frame is the scroll container          | `overflow-y-auto`                         | `overflow-y: auto`            |
| `cq` units resolve here                | `@container-size`                         | `container-type: size`        |
| (inline-size only — avoid, see **G5**) | `@container`                              | `container-type: inline-size` |
| Clear the ratio entirely               | `aspect-auto`                             | `aspect-ratio: auto`          |

Only the sizing formula is stuic's, because it is the only part Tailwind cannot express. The preset
ships **no background** either — three known call sites paint three different ways, one of them on
`body`.

---

## Decision tree

**1. Locked box, or derived-width column?**

- The whole composition scales proportionally, bars on one axis → `.stuic-frame` (leave
  `--stuic-frame-height: auto`).
- You want to fill the height and only clamp the width (a column that scrolls) →
  `--stuic-frame-height: 100dvh`. **This is no longer ratio-locked** — read **G15** before choosing it.

**2. Do fixed-positioned descendants belong to the frame, or to the screen?**

- **To the frame** → add `contain-layout contain-paint` to the frame element. Everything
  `position: fixed` inside now resolves against the frame, with zero component changes.
  **Then do not also make the frame the scroll container — G4b.**
- **To the screen** → add no containment. Top-layer dialogs and viewport-space overlays stay in
  viewport space, and you reconcile them onto the column with `.stuic-frame-col`. This is the safer
  default and the one that survives `Drawer`, `Backdrop` and scrolled routes.

**3. `vw`/`dvh`, or `cq`?**

- Frame anchored to the viewport (fixed wrapper, or `body`) → `.stuic-frame` alone.
- Frame nested inside a box of unknown size → `.stuic-frame .stuic-frame-cq` **plus**
  `@container-size` on an ancestor. `@container` (inline-size) is a silent trap (**G5**).

**4. Where does the bail-out query go?**

- On `:root` (or any ancestor), as tokens: `--stuic-frame-width: 100vw` and
  `--stuic-frame-height: 100dvh`. Not as a class override on `.stuic-frame` — a token override
  needs no `!important` and no specificity game, and it works without touching the markup.
- Give it a **second condition** — a `min-height`, or a `max-aspect-ratio`. A width-only breakpoint
  is almost always wrong (**G6**).

---

## Gotchas

**Engine provenance, stated once.** Every measured number in **both** this document and the
reference manual was taken with Playwright on **Chromium 151.0.7922.34** and **WebKit 26.5**, plus
**Firefox 153** for the containment rows; results are identical across engines unless a row says
otherwise, and none of it says anything about **old Safari**. The full list lives in
[Ratio-Locked Frame Reference](../RATIO_LOCKED_FRAME.md#gotchas), where the items that are _not_
browser measurements are labelled as such.

> ### G4b — THE ONE THAT WILL ACTUALLY BITE YOU
>
> **Do not make the frame BOTH the fixed containing block AND the scroll container.**
> `contain-layout contain-paint` + `overflow-y-auto` on the same element **breaks every
> `position: fixed` descendant.**
>
> Measured, byte-identical in both engines: at `scrollTop: 600`, a `position: fixed; inset: 0`
> child renders at **`y = -600`**, and a bottom-right FAB jumps from `y = 732` to `y = 132`. They
> are not fixed any more; they are effectively `absolute` against the scroll origin.
>
> **Concrete stuic consequence:** open a `Drawer` on a route scrolled to 600 and the backdrop and
> the drawer render at `y = -600`. The user taps, and nothing appears. `BodyScroll.lock()` does
> **not** rescue this: `src/lib/utils/body-scroll-locker.ts` only pins `document.body`, which in
> this layout has nothing to scroll (`window.scrollY === 0`), so the wheel keeps scrolling the
> frame and the invisible drawer travels on to `y = -900`.
>
> Modal `<dialog>`s survive (top layer, and they block wheel chaining). `Drawer`, `Backdrop`,
> `DropdownMenu` and the body-portalled actions do not.
>
> **Fix:** pick one. Either scroll an inner element and keep containment on the frame, or keep the
> frame scrollable and accept viewport-space overlays, reconciling them with `.stuic-frame-col`.
>
> This is the trap most likely to be shipped by someone following the naive advice, because the
> naive advice is internally consistent: _"`contain: paint` clips, so make the frame scroll."_

**The full list — G1 through G21, each with its measurement — is in
[Ratio-Locked Frame Reference](../RATIO_LOCKED_FRAME.md#gotchas).** The four most expensive, in
short: the popular `max-width`/`max-height`/`aspect-ratio` formulation collapses to 0×0 in a centred
grid/flex parent (G1); `container-type` does **not** create a fixed containing block (G2); `cq` units
on the element that declares `container-type` resolve against an _ancestor_ container, or silently
against the viewport (G5); and an explicit `height: 100dvh` is not ratio-locking (G15).

---

## Recipes

Four worked recipes — viewport letterbox, `body`-as-letterbox, nested container-units, and the
unit-free `max-*` variant — are in
[Ratio-Locked Frame Reference](../RATIO_LOCKED_FRAME.md#recipes).

---

## Interop with the rest of stuic

**The honest headline: adopting this preset does NOT make stuic's overlays frame-aware.** The
preset names an ancestor; it does not teach anything to measure against it. Expect per-call-site
tweaks.

Three categories — trapped, escaping, portalled — each verified against the source:

| Component / action                              | Rendering                                                                             | Behaviour under a `contain:`-ed frame                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Backdrop`                                      | `position: fixed; inset: 0; height: 100dvh`, in place                                 | **Trapped** by containment — but `height: 100dvh` overrides the inset-derived height, so it overflows a short frame (**G18**)                                                                                                                                                                                                                              |
| `Drawer`                                        | wraps `Backdrop`, `position: fixed`, in place                                         | **Trapped** — and the primary victim of **G4b**                                                                                                                                                                                                                                                                                                            |
| `DropdownMenu`, `Float`, `HoverExpandableWidth` | `position: fixed`, in place                                                           | **Trapped**, and already **CB-aware**: they measure via `fixedContainingBlockRect()` (3.152.0)                                                                                                                                                                                                                                                             |
| `ModalDialog`, and `Modal` through it           | `<dialog>` + **always** `.showModal()`, **no portal**                                 | **Escapes** — top layer, viewport geometry. But it is still a DOM descendant, so custom properties inherit (**G3**): size its content from the inherited `--stuic-frame-aspect-ratio`, or use `.stuic-frame-col`, which repeats the fallback (**G12**). `Modal`'s own box is `md:max-w-[calc(100vw-2rem)]` / `md:max-h-[80dvh]` — viewport units (**G18**) |
| `Notifications`                                 | `popover="manual"` + `showPopover()`, `position: fixed; inset: 0; width/height: 100%` | **Escapes** — top layer, viewport-sized. Toasts render on the bars, not in the frame                                                                                                                                                                                                                                                                       |
| `popover`, `spotlight`, `dimBehind` actions     | **portalled to `document.body`** by default                                           | **Escape by portalling** (**G19**). Pass the `container` option added in 3.152.0                                                                                                                                                                                                                                                                           |

**What to do about each** — passing `container` to the portalled actions, reconciling top-layer
escapees with `.stuic-frame-col`, and what `BodyScroll` does and does not lock — is in
[Ratio-Locked Frame Reference](../RATIO_LOCKED_FRAME.md#working-with-stuics-overlays).

---

## Safe-area insets (`.stuic-safe-area-*`)

Global, **unlayered** so a deliberate `pt-*` in a consumer's `utilities` layer cannot silently win
over a safe-area offset. Declared at the end of `src/lib/index.css`.

Two surfaces:

| Surface                                     | Semantics                                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--stuic-safe-area-{top,right,bottom,left}` | `0px` always; the real `env()` inset only under standalone/fullscreen. **Compose** them: `padding-block-start: calc(1rem + var(--stuic-safe-area-top))` |
| `.stuic-safe-area-{top,right,bottom,left}`  | **Set** the padding on that axis (they replace, not add). Only for elements that do not otherwise pad that side                                         |

Both are gated behind `@media (display-mode: standalone), (display-mode: fullscreen)` and are
therefore **inert in a normal browser tab** and **hard-zero in a Capacitor WKWebView** (**G21**).
Non-zero values also require the consuming app to declare `viewport-fit=cover`.

Full detail, including which components handle insets automatically and which do not, is in the
**PWA safe-area insets** section of [README.md](../../README.md).

---

## `.scrollbar-thin`

Global, unlayered, one declaration: `scrollbar-width: thin`. Declared in `src/lib/index.css`.

Standard-property only — no `::-webkit-scrollbar` rules, no colour token. Apply it to any scroll
container whose default scrollbar is too heavy. Because it is unlayered, a Tailwind utility will not
override it; use an inline style or your own more-specific rule if you need to opt an element back
out.

---

## Key files

| File                                    | Purpose                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/lib/css/frame.css`                 | The preset. Three classes, nine declarations, and the reasoning inline                                    |
| `src/lib/index.css`                     | `@import "./css/frame.css"`; also home to `.scrollbar-thin` and `.stuic-safe-area-*`                      |
| `src/lib/css/frame.svelte.test.ts`      | Browser (Chromium) regression locks: the formula, plus G11–G15 and the G2 distinction                     |
| `src/lib/css-wiring.test.ts`            | Asserts every stylesheet under `src/lib` is reachable from `index.css` — the failure nothing else can see |
| `src/lib/utils/containing-block.ts`     | `isFixedContainingBlock()` / `fixedContainingBlockRect()` — the G2 rule set                               |
| `src/lib/utils/overlay-container.ts`    | The `container` option shared by `popover` / `spotlight` / `dimBehind` (**G19**)                          |
| `src/lib/utils/body-scroll-locker.ts`   | `BodyScroll.lock()` — locks `document.body` only (**G4b**)                                                |
| `src/lib/components/Backdrop/index.css` | `position: fixed; inset: 0; height: 100dvh` (**G18**)                                                     |

Related: [theming.md](./theming.md) for the token system, [components.md](./components.md) for the
overlay components, [actions.md](./actions.md) for the portalled overlay actions.
