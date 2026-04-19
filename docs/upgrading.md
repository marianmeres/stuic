# Upgrading STUIC

Notes for coding agents (and humans) maintaining a project that consumes `@marianmeres/stuic`. This doc describes the deltas introduced on top of **v3.66.1** — grouped by what a consumer actually cares about, not by commit.

## TL;DR

**Everything is additive or internal.** No props removed, no snippets renamed, no public-type signatures changed in a breaking way. You can upgrade without changing any consumer code. The reasons to make targeted adjustments afterwards are:

1. Adopt new opt-in features (`unstyled` now on DropdownMenu / CronInput / CommandMenu; new Tree/DataTable snippets; cart/checkout helpers).
2. Take advantage of new a11y wiring (the library now emits `aria-current`, `role="combobox"`, `aria-live` announcements, etc. — your CSS may want to react).
3. Spot-check the few subtle behavior changes listed under *Subtle behavior deltas* below.

**Recommended post-upgrade check:** run the Browser Verification Checklist at the end of this doc.

---

## How to adopt

```bash
pnpm add @marianmeres/stuic@latest
```

No codemod needed. The library is backwards-compatible with v3.66.1 call sites.

---

## What's new (opt-in)

The following features are new and **only activate when you pass the prop**. Existing call sites continue to render exactly as before.

### Component-level `unstyled` prop coverage

`unstyled?: boolean` now exists on every Tier-1 component in the library. When set, the component strips its `stuic-*` base classes and you're expected to supply all styling through the `class*` escape hatches.

Newly gained in this release: **DropdownMenu**, **CronInput**, **CommandMenu** (the remaining holdouts — Button, DataTable, Tree, Nav, Cart, Carousel, most Field components already had it).

### DropdownMenu

| Prop | Type | Notes |
| --- | --- | --- |
| `unstyled` | `boolean` | Strips base classes; keeps functional layout. |
| `el` | `HTMLDivElement` (bindable) | Wrapper element ref. |

### DataTable

| Prop | Type | Notes |
| --- | --- | --- |
| `row` | `Snippet<[{ row, columns, rowIndex, isSelected }]>` | Desktop-only — replaces the entire `<tr>`. Parallel to the existing `mobileRow`. |
| `selectDisabledBy` | `(row, index) => boolean` | Per-row selection disable. Respected by "select all". |

The `cell` snippet gained an extra parameter:

```svelte
<!-- before -->
{#snippet cell({ column, row, value, rowIndex })} ... {/snippet}

<!-- after (both shapes compile; old callers ignore the new param) -->
{#snippet cell({ column, row, value, rowIndex, variant })} ... {/snippet}
```

`variant` is `"desktop" | "mobile"` — lets a single snippet adapt to the layout.

Also dropped: the **dead `children?: Snippet` prop** that was declared but never rendered. No consumer was using it.

### Tree

First README in this release. Also:

| Prop | Type | Notes |
| --- | --- | --- |
| `t` | `TranslateFn` | Translation function (used only for a11y move-announcements). |
| `getNodeLabel` | `(item) => string` | How to stringify a node for the a11y announcement. Defaults to `String(item.value)`. |

On a successful `onMove`, the component now announces the move via a visually-hidden `aria-live="polite"` region. Translation keys: `move_before`, `move_after`, `move_inside` with `{source}` and `{target}` placeholders.

### Input family (shared wrapper class props)

Every `Field*` component that uses `InputWrap` now accepts the full set of **9 wrapper class props**, exposed as a reusable interface:

```ts
import type { InputWrapClassProps } from "@marianmeres/stuic";

interface InputWrapClassProps {
  classLabel?: string;
  classLabelBox?: string;
  classInputBox?: string;
  classInputBoxWrap?: string;
  classInputBoxWrapInvalid?: string;
  classDescBox?: string;
  classDescBoxToggle?: string;   // newly forwarded
  classBelowBox?: string;
  classValidationBox?: string;   // newly forwarded
}
```

Previously most fields only accepted 5–7 of these. You can now pass any of them to **FieldInput, FieldTextarea, FieldSelect, FieldSwitch, FieldFile, FieldLikeButton, FieldObject, FieldOptions, FieldAssets, FieldPhoneNumber, FieldInputLocalized, FieldKeyValues** uniformly. `FieldCheckbox` and `FieldRadios` use bespoke layouts and keep their own narrower class-prop surface.

### Checkout

New util:

```ts
import { addressesEqual } from "@marianmeres/stuic";

addressesEqual(a, b); // true if both missing or all fields match (incl. label, is_default)
```

First README for the Checkout family (explains the kit-of-parts composition model).

### Cart

New translation key:

```ts
remove_item_aria: "Remove {name}"  // used as aria-label on the remove button
```

Override via your `t` prop to localize. README now also explains the `summary` variant and the caller's responsibility to keep `lineTotal` in sync after quantity changes.

### CronInput

First README. `unstyled` prop is the user-facing addition. Internals unchanged.

`CronNextRun` now has a prominent JSDoc note reminding consumers to call `destroy()` manually — it starts a 60s interval on construction and doesn't self-clean. If you already do `onDestroy(() => nr.destroy())`, no change needed.

### CommandMenu

`unstyled` prop added. Everything else about its public API is unchanged.

### Carousel

**Zero API changes.** 6 previously-undocumented props are now in the README: `syncActiveOnScroll`, `wheelScroll`, `scrollbar`, `arrows`, `classArrow`, `minItemWidth`. They existed before — just weren't documented.

Internally: programmatic scrolling now respects `prefers-reduced-motion: reduce`. When set, arrows, keyboard, and wheel navigation switch to `scrollBehavior: "instant"` automatically regardless of the `scrollBehavior` prop.

### Nav

**Doc/code drift fixed.** `NavGroup.defaultCollapsed` in the README was wrong — the real prop name is `defaultExpanded` (and always was). If you were blindly following the README, audit your call sites:

```svelte
<!-- incorrect (never worked) -->
<Nav groups={[{ title: "…", items: […], defaultCollapsed: true }]} />

<!-- correct -->
<Nav groups={[{ title: "…", items: […], defaultExpanded: false }]} />
```

Also added: `aria-current="page"` on active anchor items, `:root.dark` override for the hover background. See *Subtle behavior deltas* below.

---

## Subtle behavior deltas (BC-safe, but noticeable)

These don't break existing code, but output or rendering may differ in visible ways.

### Nav active-anchor styling

Active anchors now emit `aria-current="page"` **in addition to** the existing `[data-active]` data attribute. If your custom CSS targets only `[data-active]`, nothing changes. If you add new CSS targeting `[aria-current="page"]`, make sure it doesn't conflict with the existing active rule.

### Nav hover in dark mode

The hover background was previously `rgb(0 0 0 / 0.1)` with no dark-mode override — effectively invisible on dark surfaces. Now:

```css
:root.dark {
    --stuic-nav-item-bg-hover: rgb(255 255 255 / 0.08);
}
```

Dark-mode hover is now actually visible. If you had been overriding `--stuic-nav-item-bg-hover` globally and relied on it applying in both themes, you may want to add a `:root.dark` override of your own.

### Checkout: address equality now compares `label` + `is_default`

`CheckoutOrderReview` internally uses the new `addressesEqual` helper to decide whether to render a separate billing block. The helper now compares **all** `CheckoutAddressData` fields, including `label` and `is_default`, not just the 6 visible fields. If you populate `label` differently on shipping vs. billing (e.g. "home" vs "work") for the same street address, the review will now render them as two distinct blocks where it previously treated them as one. This is the correct behavior for the intent of those fields.

### DataTable: "Select all" aria-label

Default text changed from `"Select all rows"` → `"Select all rows on this page"`. Only visible to screen readers. Override via the `t` prop (`select_all_rows` key).

### DataTable: mobile card checkbox class

The mobile checkbox wrapper no longer uses inline Tailwind utilities; it uses `stuic-data-table-card-checkbox` (defined in the library's CSS). If you had any custom CSS targeting the old combo `.stuic-checkbox.flex.items-center.gap-2.mb-1` inside a mobile card, re-target to `.stuic-data-table-card-checkbox`.

### DropdownMenu fallback-mode width

When CSS anchor-positioning is unavailable (Safari <17.4, Firefox <115, or `forceFallback={true}`), the modal-style fallback is now **384px max-width** (`max-w-sm`) instead of the previously-buggy 128px (`max-w-32`). Longer menu items no longer get clipped into a nearly-unusable column.

### DropdownMenu default `position`

The README was wrong — the default was always `"bottom-span-right"`, not `"bottom-span-left"`. Updated. Your call sites are unaffected.

### observeExists

`forceCheck()` was previously a no-op due to a missing assignment. It now actually updates `current`. If you had been calling it (the flag was documented but didn't do anything), you'll now see reactive updates where you previously didn't.

Also, `observeExists` now observes attribute mutations (not just `childList`). Selectors like `.active` or `[data-busy]` that match based on class/attribute now react when those attributes toggle on existing elements. Previously, only DOM add/remove triggered rechecks.

### typeahead

- Stale asynchronous results are now discarded when a newer search has started (previously they could clobber the more recent results).
- Escape key now dismisses an active suggestion and **stops propagation**. If your typeahead is inside a `Modal`, pressing Escape while a suggestion is visible now clears the suggestion without closing the Modal. Pressing Escape again (with no active suggestion) closes the Modal as before.
- Parent element's inline `position` is now restored on teardown (it's still mutated to `relative` at setup when needed). If you're disabling/re-enabling typeahead repeatedly on the same container, you'll no longer see the parent stuck in `position: relative` after teardown.
- Main input now emits `role="combobox"`, `aria-autocomplete="inline"`, and `aria-expanded` reflecting whether a suggestion is active. All removed on teardown.

### CommandMenu `isFetching`

Previously flickered back to `false` whenever any in-flight request resolved, including stale ones. Now only the latest request toggles it off. The spinner stays visible as long as *any* fresh request is still in flight.

### Tree `data-tree-id` query

Internal: uses `CSS.escape()` when matching `data-tree-id` values to DOM elements. If you're using IDs with special characters (quotes, backslashes, etc.), they now work. Normal IDs are unaffected.

---

## Tree-shaking / dependency changes

- **`esm-env` removed** from direct dependencies (it's still resolvable as a transitive dep via `runed` and `svelte`). Nothing in STUIC imports it directly. If your project imports `esm-env` from your own code and relied on `@marianmeres/stuic` pulling it in transitively, add it to your own `package.json`.
- No other deps changed shape.

---

## Design-tokens update (visual)

`@marianmeres/design-tokens` bumped from **1.3.1 → 1.4.0**. This touches all 42 theme CSS files (small tweaks — no structural token renames). If you customize themes at the app level, this is low-risk; if you ship pixel-perfect branding, eyeball the themes you actually use.

No token names changed. No new tokens you need to adopt.

---

## Browser verification checklist

After upgrading, spot-check the following in a real browser. Tiered by likelihood of surprise.

### Tier 1 — definitely check

- [ ] **Themes**: load 2–3 of your in-use themes in light **and** dark. Scan for anything that looks off (color shifts are the most likely artifact of the design-tokens bump).
- [ ] **DropdownMenu in anchor-less browsers** (Safari <17.4 / Firefox <115) **or** with `forceFallback={true}`: verify the fallback-mode width is comfortable (~384px) and items aren't clipped.
- [ ] **Nav in dark mode**: hover over an item. The hover state should now be visible. Check that no CSS rule you own fights with the new `:root.dark` override.
- [ ] **DataTable**:
  - If you use `selectDisabledBy`, verify the disabled rows' checkboxes are disabled and excluded from "select all".
  - If you opted into the new `row` snippet, make sure your custom `<tr>` renders.
  - Mobile view: checkbox wrapper still lays out correctly (new `stuic-data-table-card-checkbox` class replaced the old inline Tailwind).
- [ ] **Cart summary variant**: if you use `variant="summary"`, check the compact receipt layout.

### Tier 2 — smoke test

- [ ] **Input family forms with validation errors**: verify the invalid-state styling looks right — the newly-forwarded `classInputBoxWrapInvalid` / `classValidationBox` won't change anything if you don't pass them, but a few field components are now forwarding more props by default.
- [ ] **Carousel with OS reduced-motion enabled**: arrow / keyboard / wheel nav should no longer animate.
- [ ] **typeahead inside a Modal**: Escape with an active suggestion clears it; Escape with no suggestion closes the Modal.

### Tier 3 — network & assistive-tech

- [ ] **CommandMenu with throttled network**: rapid typing with "Slow 3G" Chrome throttle — spinner should stay on, no stale results should leak.
- [ ] **Tree drag-drop with a screen reader**: perform a move; listen for the polite-live announcement.

---

## For coding agents specifically

When the user asks you to upgrade this library:

1. **Run `pnpm add @marianmeres/stuic@latest`, then `pnpm run build && pnpm run check && pnpm run test`.** If all three pass, the upgrade is functionally complete. No codemod required.
2. **Grep the consuming project for these strings** and confirm they still match your intent:
   - `defaultCollapsed` — if found on a `NavGroup`, this never worked; change to `defaultExpanded` and invert your boolean.
   - `classInputBoxWrap="..."` on a `FieldCheckbox` — `FieldCheckbox` uses a bespoke layout and doesn't forward this prop (it never did). No change needed.
   - `"bottom-span-left"` as a DropdownMenu position default — explicit values still work; it was only the *default* that was documented wrong. No change needed if you were passing it explicitly.
   - `stuic-checkbox.*flex.*items-center.*gap-2.*mb-1` (as a CSS selector combo in the consumer's own CSS) — re-target to `.stuic-data-table-card-checkbox`.
3. **If the consuming project has its own dark-mode CSS for Nav**, scan for overrides of `--stuic-nav-item-bg-hover` and confirm your rule still makes sense alongside the library's new `:root.dark` override.
4. **If the project exposes an `esm-env` import** in its own source, add `esm-env` to its own `package.json` — it's no longer a direct dep of STUIC.
5. **Run the Browser Verification Checklist** above manually, or delegate it to the human if you can't run browsers. Explicitly tell the user: "I cannot verify X visually — please eyeball it."
6. **Don't claim success if you skipped #5.** Type-checks + builds passing is necessary, not sufficient, for a library upgrade that touched this much a11y + CSS surface area.

---

## If something does break

None of the above should cause failures in `pnpm run build` / `pnpm run check` / existing tests. If it does:

- Run `git diff` on the consumer project to see if you accidentally edited a call site while upgrading.
- Check that the TypeScript version and `svelte-check` versions match what STUIC was built against (see STUIC's own `package.json` `devDependencies`).
- Open an issue with: the failing file, the full error, and which version you came from.
