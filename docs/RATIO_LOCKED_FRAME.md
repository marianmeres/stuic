# Ratio-Locked Frame — Reference

Recipes, the measured gotcha list, and stuic overlay interop for the `.stuic-frame` CSS preset
(`src/lib/css/frame.css`).

**Start with [CSS Presets](./domains/css-presets.md)** — it has the classes, the token contract and
the decision tree. This document is the long-form companion: it is what you read when you are about
to write the CSS, or when something looks right and measures wrong.

---

## Recipes

### Recipe A — viewport letterbox (bars painted by a wrapper)

The full-screen shape: a fixed wrapper paints the bars, the frame sits centred in it.

```svelte
<div class="fixed inset-0 grid overflow-hidden bg-neutral-800">
	<div
		class="stuic-frame bg-white dark:bg-neutral-900"
		style="--stuic-frame-aspect-ratio: 0.5"
	>
		<!-- app -->
	</div>
</div>
```

`place-items: center` is unnecessary — `.stuic-frame`'s own `margin: auto` centres it on both axes
in a grid parent.

Bail out to full bleed on a real handset (**note the second condition — G6**):

```css
@media (max-width: 40rem) and (max-aspect-ratio: 3 / 5) {
	:root {
		--stuic-frame-width: 100vw;
		--stuic-frame-height: 100dvh;
	}
}
```

If the frame needs to scroll, add `overflow-y-auto` to it — **and then read G4b before adding
`contain-layout contain-paint`.**

### Recipe B — no wrapper, `body` is the letterbox

For a phone-proportioned column app clamped on tablet-and-up: there is exactly one element. `body`'s
background _is_ the letterbox and `.stuic-frame`'s `margin: auto` does the centring (in normal flow
the block-axis autos compute to `0`, so it behaves as `margin-inline: auto`).

```html
<body>
	<div class="stuic-frame bg-[var(--stuic-color-background)]">…</div>
</body>
```

```css
:root {
	--stuic-frame-aspect-ratio: 0.48;
}

body {
	background: var(--stuic-color-surface-1); /* the letterbox */
}

/* Bail out to full bleed on a real handset (note the second condition — G6) */
@media (max-width: 40rem) and (max-aspect-ratio: 3 / 5) {
	:root {
		--stuic-frame-width: 100vw;
		--stuic-frame-height: 100dvh;
	}
}
```

**Two things to decide consciously here.**

**A token cannot clear `aspect-ratio`.** The bail-out above works because
`--stuic-frame-height: 100dvh` beats `aspect-ratio` (**G14**). If instead you want the _content_ to
determine the height on a phone, you need the `aspect-auto` utility in the markup — and markup
cannot be media-queried.

**So if the frame only exists above a breakpoint, take the token and keep your own class.** That
is a legitimate, supported use of this preset — the value is the named formula, not the class:

```css
@media (min-width: 700px) and (min-height: 600px) {
	body {
		background: var(--stuic-color-surface-1);
	}

	.app-frame {
		width: var(
			--stuic-frame-width,
			min(100vw, calc(100dvh * (var(--stuic-frame-aspect-ratio))))
		);
		height: 100dvh;
		margin-inline: auto;
		overflow-y: auto;
	}
}
```

Applying `.stuic-frame` _unconditionally_ in a phone-first app, together with `overflow-y-auto` on
the frame, makes the frame the scroll container on phones too. iOS then stops collapsing the address
bar, and pull-to-refresh semantics change — on the one path that matters most. That is usually the
reason to keep the class conditional.

### Recipe C — nested under a header, container units

For a 16:9 scene inside a flex column below a header. The frame must fit whatever box it is handed,
not the screen.

```svelte
<header class="shrink-0">…</header>

<!-- the letterbox: a size container, so cqh resolves -->
<div class="@container-size grid min-h-0 grow overflow-hidden bg-neutral-900">
	<!-- the frame: sized in cq units; declares its own size container so
	     descendants scale with the FRAME, not the letterbox -->
	<div
		class="stuic-frame stuic-frame-cq @container-size relative bg-[var(--stuic-color-surface)]"
		style="--stuic-frame-aspect-ratio: calc(16 / 9)"
	>
		<div class="text-[clamp(0.75rem,1.25cqw,1.0625rem)]">…</div>
	</div>
</div>
```

**`@container-size` on the ancestor is mandatory, and `@container` is not enough.** With only
`container-type: inline-size`, `cqh` falls **through** to the next container — or silently to the
small viewport — and you get a ratio-correct, wrongly-scaled frame that overflows its parent and
tracks the window as you resize. See **G5** for the numbers.

Also note `min-h-0` on the letterbox: without it, a flex item's automatic minimum size can push the
whole thing off (**G13**, one level up).

### Recipe D — the unit-free `max-*` variant (needs a positioned parent)

There **is** a working `max-width`/`max-height` formulation, contrary to widespread belief. It needs
`position: absolute; inset: 0; margin: auto` inside a positioned parent with a definite size:

```html
<div class="relative h-dvh w-full overflow-hidden bg-neutral-800">
	<div
		class="absolute inset-0 m-auto max-h-full max-w-full bg-white"
		style="aspect-ratio: 0.5"
	>
		…
	</div>
</div>
```

Measured ratio-perfect and correctly centred in 4/4 parent × ratio combinations in both engines
(bars 287.5 / 300 / 44.4px). It is unit-free, which is genuinely attractive — no `vw`, no `dvh`, no
`cq`, no container declaration.

**Leave both axes `auto`.** The whole thing works because an absolutely-positioned box with
`inset: 0`, no stated axis and a non-`auto` `aspect-ratio` is sized like a replaced element — fit
inside the containing block, ratio preserved — and `margin: auto` then centres the leftover.
Adding `width: 100%` (or `w-full`) states an axis and destroys it: that is one of the only two
measured **engine divergences** in this whole study — Chromium 800×400 vs WebKit 200×400 for the
same markup (**G1**).

Its cost: it needs a positioned parent with a definite size, so it cannot express the one-element,
normal-flow shape of Recipe B, and it is the _only_ parent context where the max-pair works (**G1**).
`.stuic-frame` is not this shape because it has to work in normal flow, grid, flex, absolute and
container-unit parents. Use Recipe D when you already have the wrapper anyway.

---

## Gotchas

**Engine provenance, stated once.** Every number below was measured with Playwright on
**Chromium 151.0.7922.34** and **WebKit 26.5**, plus **Firefox 153** for the containment rows.
Results are identical across engines unless a row says otherwise. This says **nothing about old
Safari** — see G7. Four items (G6, G7, G8, G20) are explicitly _not_ browser measurements and are
labelled as such.

> **The one that will actually bite you — frame as containing block AND scroll container — is the
> callout at the top of [CSS Presets](./domains/css-presets.md#gotchas), referenced below as G4b.**

---

**G1 — `max-width: 100%; max-height: 100%; aspect-ratio: R` — the popular formulation. The usual
explanation of why it fails is wrong.**
The ratio is _not_ what gives. **`max-*` never grows a box**, so with `width: auto` the frame
shrink-wraps its content instead of filling the letterbox. Measured in a
`display: grid; place-items: center` parent: **0×0** with an empty child (both engines, all 4
parent/ratio combos), and **280.13×560.25 overflowing an 800×400 parent** with one line of text —
ratio correct, size wrong. Flex behaves differently from grid: flex _does_ clamp (200×400 for the
same markup; 800×400 once `width: 100%` is stated); grid does not, because `max-height: 100%` cannot
resolve against an auto row.
The rule that fits all 450 measured rows: **the axis you state explicitly wins, `aspect-ratio`
derives the other, and `max-*` truncates the derived axis without shrinking the stated one back.**
So `max-pair + width: 100%` is ratio-correct exactly when the letterboxing happens to fall on the
axis you did not state — half the time. The only two real engine divergences in the whole study live
here: block-level max-pair (Chromium 200×400 vs **WebKit 800×400**) and absolutely-positioned
`max-pair + width: 100%` (Chromium 800×400 vs WebKit 200×400).
There **is** a working `max-*` variant — see **Recipe D**. The `min()` formula in `.stuic-frame` was
16/16 ratio-correct, then 12/12, then 6/6, in both engines, with zero overflow and zero degenerate
cases.

**G2 — `container-type` does NOT create a fixed containing block. Readers arrive believing the
opposite.**
Neither `container-type: inline-size` nor `container-type: size` makes an element a containing block
for `position: fixed` (or `position: absolute`) descendants. Measured `0,0 1200x800` — untrapped —
on Chromium 149, Chromium 151, WebKit 26.5 and Firefox 153, at 1200×800 / 400×900 / 900×400.
Computed `contain` reads back `"none"`. The CSSWG removed layout containment from `container-type`
in 2024 (csswg-drafts#10544) and every engine shipped the change.
`src/lib/utils/containing-block.ts` already documents this and deliberately does not check
`container-type`; `src/lib/css/frame.svelte.test.ts` locks it.
**What _does_ trap, measured:** `contain: layout` alone is sufficient; `contain: paint` alone is
also sufficient; so are `content`, `strict`, `transform`, `perspective`,
`will-change: transform`, `backdrop-filter`, `content-visibility: auto`. `contain: size`,
`contain: style`, `overflow: hidden` and `container-type: *` do **not**. Containment and container
queries are orthogonal knobs — you opt into trapping explicitly.
Version caveat that _does_ matter: `filter: blur(0px)` **does** form a fixed containing block in
WebKit 26.5. `containing-block.ts` deliberately ignores `filter` on WebKit because older Safari did
not, so quote engine versions whenever you rely on this.

**G3 — the top layer escapes geometry, but NOT inheritance, and NOT container units.**
Geometry: confirmed and total. A `<dialog>.showModal()` or `[popover]` that is a DOM child of the
frame measures `0,0 1200x800` regardless of `contain: layout paint`, `contain: strict`,
`container-type: size`, `transform`, `filter`, `overflow: hidden`, or page scroll. Hit-testing
agrees. With the UA `max-width` left alone it measured `1162x762` at a 1200×800 viewport
(`calc(100% - 6px - 2em)` against the **viewport**).
**But custom properties inherit into the top layer normally.** Measured: a dialog that is a DOM child
of the frame reads `--fw: "137px"` and sizes to 137px; the same dialog moved to `<body>` reads `""`
and falls back. So the reason to hoist a var to `:root` is **portalling**, not the top layer.
**And `cq` units in the top layer are not lost either.** `50cqw`/`50cqh` inside an open modal dialog
that is a DOM descendant of a `container-type: size` frame measured **150×100** — resolved against
the frame. Only after the dialog is moved to `document.body` does it fall back to the viewport
(600×400).

**G4a — `contain: paint` clips, and without it the overflow escapes onto the bars.**
`paint`, `layout paint`, `content`, `strict` and plain `overflow: hidden` all clip and make the
overflow unhittable; `contain: layout` alone does not clip. The sharper version of this gotcha:
_without_ clipping, overflow doesn't disappear — it **escapes the letterbox and paints on the bars**,
which is arguably worse. Measured with `contain: layout` alone: content at `y = 620` outside a frame
that ends at `y = 260`, `scrollTop` pinned at 0, and **hittable** — it paints on the bars. Add
`paint` (or `overflow: hidden`) and the same content becomes unreachable (`elementFromPoint` →
`HTML`).
Also measured, so nobody re-derives it: `contain: layout paint` does **not** block scroll
reachability when the frame _is_ a scroll container — `scrollTop` reaches 400/400 and the bottom
element is hittable. The problem with that combination is G4b, not scrolling.

**G4b — see the callout above.** Frame as fixed containing block + frame as scroll container =
every `position: fixed` descendant at `y = -scrollTop`.

**G5 — `cq` units DO resolve on the element that declares `container-type`. They just resolve
against something else — silently.**
Readers commonly believe the single-element version "doesn't resolve". It resolves fine. An
element's own `container-type` never applies to itself, so `cq` units on it query the nearest
**ancestor** query container — and **fall back to the small viewport when there is none**, with a
plausible number and no warning.
Measured: `#frame { container-type: size; width: 50cqw; height: 25cqh }` with no ancestor container
→ **600×200** at 1200×800, **200×225** at 400×900, **450×100** at 900×400 — i.e. it tracks the
_window_. With an ancestor `container-type: size` sized 500×300 → **250×75 at every viewport**.
The nested shape (frame consumes the parent's `cq` units _and_ declares its own `container-type`)
measured **150×300, identical with or without the self-declaration**. The two-element split is
required **for the descendants**, not because the frame's own `min()` breaks.
**Axis eligibility, with a number:** ancestor `size` 500×300, frame `inline-size` 250 wide,
descendant `50cqw`/`50cqh` → **125×150**. `cqw` came from the frame; `cqh` fell _through_ it to the
ancestor. `container-type: inline-size` is safe only if nothing inside ever uses
`cqh`/`cqb`/`cqmin`/`cqmax`. **Use `size` (`@container-size`), not `inline-size`.**

**G6 — a width-only bail-out breakpoint is usually wrong. (Design guidance, NOT a browser
measurement.)**
A ratio-derived width collapses on a landscape phone, and a short-but-narrow desktop window is not a
handset. Both known viewport call sites needed a second condition — a `min-height: 600px`, or a
`max-aspect-ratio: 3 / 5`. This is a content fact about your layout, not something a probe can
measure.

**G7 — prefer classic `max-width:` / `max-aspect-ratio:` over media-query range syntax. (NOT
measured here.)**
Media-query range syntax (`(width <= 40rem)`) landed in Safari 16.4. On an older engine the query
fails to parse and is dropped **whole**, silently restoring the desktop layout on a phone. The
WebKit build used for this study was 26.5, so no pre-16.4 datapoint exists. Treat this as a
deployment-target rule, not a measurement.

**G8 — `dvh` vs `vh`: a real trade-off, with no measured mobile-chrome magnitude.**
Headless Chromium and WebKit report `100vh == 100dvh == 100svh == 100lvh`, so the mobile browser
chrome behaviour **was not exercised**. What _was_ measured: `100dvh` is live — resizing
1200×800 → 1200×400 moved the frame width from 400px to 200px.
Mechanically, therefore: on a browser where `dvh` shrinks as chrome expands, a height-derived width
shrinks by the same factor, so the frame's **horizontal** edges move during a vertical scroll.
`svh` pins them, at the cost of being wrong in the other chrome state. `.stuic-frame` uses `dvh`;
swapping it is a one-token change (`--stuic-frame-width: min(100vw, calc(100svh * (…)))`). Do not
quote a Safari magnitude — nobody measured one.

**G9 — `--stuic-frame-aspect-ratio: 16 / 9` plus an unparenthesised division is 81× too small.**
`calc(100vw / var(--r))` becomes `calc(100vw / 16 / 9)` = viewport ÷ 144. Measured **8.33px instead
of 675px** at 1200×800, **2.77px instead of 225px** at 400×900, and **8.33 / 2.77 / 6.25 instead of
675 / 225 / 506.25** in container-unit space. No parse error, no console warning.
Multiplication is coincidentally correct (`calc(100dvh * 16 / 9)` = 1422.22 = the right answer),
which is exactly what teaches the wrong habit. **Parenthesise every `var()` in every `calc()`, for
both operators.** `frame.css` does; your code must too. If the ratio arrives from config or YAML,
wrap it at the injection site: `style="--stuic-frame-aspect-ratio: calc({aspect})"` is valid for
both `"16 / 9"` and `"0.48"`.

**G10 — `@property`-registering the ratio converts a loud failure into a quiet one.**
`syntax: "<number>"` rejects `16 / 9` outright (both engines) and substitutes the initial/inherited
value — indistinguishable from a typo, with the page rendering plausibly at the library's default
ratio. It also collapses `calc(16 / 9)` to a rounded number at computed-value time (675 → 674.98).
stuic does not register it, deliberately.

**G11 — deriving the width at `:root` makes scoped ratio overrides a silent no-op.**
With `:root { --w: min(100vw, calc(100dvh * var(--r))) }`, `getComputedStyle(:root)['--w']` is
already the string `"min(100vw, calc(100dvh * 0.5))"` — the ratio is substituted **eagerly**, the
math is not evaluated, and descendants inherit that frozen string. Measured: overriding `--r` on the
frame element **or on any ancestor** → **400px, unchanged, no error**. Only a `:root` or
media-query override works.
This is the repo's documented anti-pattern (see the Fallback Pattern in
[conventions.md](./conventions.md)). Shipping **both** a `:root` declaration _and_ a usage-site
fallback is the worst of the three options: the fallback becomes dead code and the scoped override
still does nothing.

**G12 — `var(--stuic-frame-width)` without the repeated fallback goes full-bleed.**
Because nothing declares the token, a bare read is invalid-at-computed-value-time → the whole
declaration falls back to `unset` → `width: auto`. Measured **1200px instead of 400px**.
Repeat the entire expression at every read site — `.stuic-frame-col` in `frame.css` does exactly
that, on purpose — or alias it once at `:root` using the recipe in the token-contract section above.

**G13 — a grid/flex item's automatic minimum size overrides `aspect-ratio`.**
A 3000px-tall child stretches an otherwise-correct frame to **350×3000, ratio 0.117**, in both
engines. `min-height: 0` fixes it; `overflow: hidden` fixes it; `.stuic-frame` sets **both**, so a
consumer's `overflow-visible` stays survivable. A future "cleanup" that deletes `min-height: 0`
reintroduces this — `frame.svelte.test.ts` locks it.

**G14 — any specified `height`, `min-height` or biting `max-height` beats `aspect-ratio` outright.**
Measured: `aspect-ratio: .5; width: 300px; height: 100px` → 300×100 (r = 3.0);
`aspect-ratio: .5; width: 300px; min-height: 900px` → 300×900 (r = 0.333);
`aspect-ratio: .5; width: 100%; height: 100cqh` in a 300×800 container → 300×800 (r = 0.375).
`aspect-ratio` only ever supplies an `auto` axis. This is _why_ `--stuic-frame-height: 100dvh` needs
no `!important` and no specificity trick.

**G15 — `height: 100dvh` is not ratio-locking.**
Whenever `100vw < 100dvh × R`, the frame degenerates to **exactly the viewport**, with bars of 0 on
both axes, taking the viewport's own ratio. That happened in **6 of 12** measured viewport × ratio
combinations — including **every ratio at 390×844** (390×844, r = 0.462, where 0.48 / 0.5 / 1.778
were asked for) and 16/9 at 1200×800, 1440×900 and 900×1400.
It looks perfect on a 1440×900 desktop and is wrong on the target handset. That is why
`.stuic-frame` defaults to `height: auto`, and why `--stuic-frame-height: 100dvh` is a deliberate,
documented opt-out rather than the default.

**G16 — `container-type: size` zeroes intrinsic block size.**
Measured **500×0** on an auto-height element carrying 150px of content — the same as `contain: size`
and `contain: strict`. `inline-size` gives the correct 500×150.
`@container-size` is safe on `.stuic-frame` **only because the frame's height is always determined**.
Slap `@container-size` on an auto-height box and you get a 0-tall element.

**G17 — `position: fixed` + `overflow: hidden` on the letterbox traps and clips nothing.**
Measured: `#lb { position: fixed; left: 100; top: 60; 300×200; overflow: hidden }` with a
`position: fixed; inset: 0` **child** → child at `0,0 1200x800`, and still hittable at (700, 500).
Being fixed-positioned and clipping does not make an element a containing block; only
`contain: paint` / `contain: layout` (or a transform) does.
Consequence: an overlay dropped **beside** the frame — a sibling of the frame, i.e. a child of the
letterbox — escapes to the viewport. Only descendants of a `contain:`-ed **frame** are captured.

**G18 — stuic's own components measure in viewport units that know nothing about your frame.**
`src/lib/components/Backdrop/index.css` is `position: fixed; inset: 0; height: 100dvh`. Inside a
frame shorter than the viewport, `inset` binds to the frame but the explicit `height` wins: measured
a 300px-tall contained host rendering an 800px-tall fixed child, overflowing by 500px.
Same family: `Modal.svelte` (`md:max-w-[calc(100vw-2rem)]`, `md:max-h-[80dvh]`), `Drawer.svelte`
(`sm:w-[75vw]`), `AlertConfirmPrompt` (`max-h-[62vh]`), `Float/index.css` (`max-width: 100vw`,
`--stuic-float-body-max-height: 70vh`), `popover.svelte.ts` and `spotlight.svelte.ts`
(`max-width: calc(100vw - 1rem)`).
**Budget for per-call-site tweaks.** "Toasts stay inside the frame with zero component changes" is
not true of stuic's `Notifications` — see the interop section.

**G19 — the overlay _actions_ still portal to `<body>` by default.**
`popover`, `spotlight` and `dimBehind` all default their container to `document.body`
(`popover` first checks for an enclosing `dialog[open]`). A popover anchored inside the frame is
therefore portalled _out_ of it, and `fixedContainingBlockRect()` then measures the viewport — the
3.152.0 containing-block awareness never fires, because by then there is no CB ancestor left.
Pass `container: frameEl`. See the interop section.

**G20 — print. (Not measured; stated as a known consequence.)**
`fixed inset-0` + `overflow: hidden` + `100dvh` prints one page and clips everything else. stuic
ships no `@media print` rules for the frame. If print matters, write your own query that unsets the
frame's sizing.

**G21 — safe-area insets are unavailable in exactly the deployment that needs them.**
`.stuic-safe-area-*` and the `--stuic-safe-area-*` variables are gated behind
`@media (display-mode: standalone), (display-mode: fullscreen)` and hard-zero in a Capacitor
WKWebView — i.e. unusable in the packaged-app case where a letterboxed layout most wants them.
Cross-reference, do not try to solve it inside the frame preset. See the safe-area section below.

**G22 — `.stuic-frame` silently loses its ratio as a flex-column item.**
Measured at 1200×800 in a `flex-col` shell with a 60px header: **400×740, ratio 0.5405**, where the
same frame in a grid parent measures **400×800, ratio 0.5000** — both engines. The ratio-derived
800px becomes the flex base size, and `min-height: 0` — the declaration **G13** calls load-bearing —
removes the automatic minimum that would otherwise stop the shrink.
Nothing stuic ships is affected: every recipe, README example and demo uses a grid, block or
absolutely-positioned parent. But `<div class="flex flex-col h-dvh"><header/><div class="stuic-frame">`
is a natural app shell, and it fails with no error and a plausible-looking box.
`flex-shrink: 0` on the frame restores 400×800 — in markup, add `shrink-0`.

**G23 — an _invalid_ `--stuic-frame-aspect-ratio` fails silently and full-bleed.**
Measured at 1200×800 with content: a valid `0.48` gives **384×800 @ x = 408**, while `16 9`, `red`,
`1px`, `50%` **and a declared-but-empty value** all give **1200×48 @ x = 0** in normal flow — a
declared-but-empty value does _not_ fall back to the `var()` default of 1. `width` and
`aspect-ratio` go invalid-at-computed-value-time together, so the result is indistinguishable from
"the stylesheet didn't load", with no console warning. In a centred grid parent the same failure
shrink-wraps instead: **267.73×48**.
Contrast `--stuic-frame-height: banana`, which degrades gracefully back to 400×800. This is distinct
from **G10**, which is about `@property` rejecting the `16 / 9` pair form.

**Also fine, stated so nobody re-derives it:** RTL is clean. `margin-inline` is a logical
property and `place-items` is writing-mode-relative; `inset` is the shorthand for the _physical_
`top`/`right`/`bottom`/`left` (the logical forms are `inset-block`/`inset-inline`) and does not
appear in `frame.css` at all. Nothing in `frame.css` is direction-sensitive.

---

## Working with stuic's overlays

See the trapped / escaping / portalled table in
[CSS Presets](./domains/css-presets.md#interop-with-the-rest-of-stuic) first.

**Portalled actions — pass `container`.** `popover`, `spotlight` and `dimBehind` all accept
`container?: HTMLElement | (() => HTMLElement | null)`, resolved through
`resolveContainerOption()` in `src/lib/utils/overlay-container.ts`. A factory is useful when the
frame element does not exist yet at action-setup time; returning `null` means "use the default".

```svelte
<script lang="ts">
	let frameEl = $state<HTMLElement>();
</script>

<div bind:this={frameEl} class="stuic-frame contain-layout contain-paint">
	<button use:popover={() => ({ content: "…", container: () => frameEl ?? null })}>
		…
	</button>
</div>
```

Note that `dimBehind` keeps **one ref-counted backdrop per container**, so mixing framed and
body-level call sites gives you two independent backdrops — usually what you want.

**Top-layer escapees — reconcile with `.stuic-frame-col`.** A modal `<dialog>` and the
`Notifications` popover are in viewport space no matter what you do to their ancestors. Put
`.stuic-frame-col` on their **content wrapper** — not on the `<dialog>` itself, where the UA's
`max-width: calc(100% - 38px)` (**G3**) leaves the column 38px narrow: measured frame 1200 / col
1162 @ x = 19 at ratio 3, and frame 400 / col 362 @ x = 19 at 400×800 — still centred, but
detuned, and precisely on the handset/bail-out path. Prefer a full-bleed dialog with the class on
an inner wrapper, which re-aligns it onto the frame's column exactly. It reads the
same `--stuic-frame-width` contract, with the fallback expression repeated so it works even when
nothing declares the token (**G12**).

**`BodyScroll` — know what it locks.** `src/lib/utils/body-scroll-locker.ts` pins `document.body`
(`position: fixed; top: -scrollY`) and ref-counts nested locks. `ModalDialog` calls it on open
unless `noScrollLock` is set; `Backdrop` takes the same `noScrollLock`, and `Drawer` forwards it as
`noBackdropScrollLock`. **If your frame is
the scroll container, this does nothing useful** — the body has no scroll to lock. Either lock the
frame yourself, or do not make the frame the scroll container (**G4b**).

**Containment detection is already correct.** `src/lib/utils/containing-block.ts` implements the
G2-correct rule set (`contain: layout|paint|strict|content`, transforms, `perspective`,
`will-change`, `content-visibility: auto`; **not** `container-type`; `filter`/`backdrop-filter`
ignored on WebKit). It stops at top-layer elements (`:modal`, `:popover-open`, `:fullscreen`) since
the top layer escapes every ancestor CB. `frame.svelte.test.ts` asserts both halves of that rule
against the preset, so a regression in either file fails the suite.

---
