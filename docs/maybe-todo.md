# Maybe-todo: missing component candidates

An analysis of typical (widely used) UI/UX components that stuic does not yet ship,
compared against the usual baseline of comparable libraries (shadcn, Bits UI, Melt,
Skeleton, Flowbite, DaisyUI). Snapshot as of 2026-09. Nothing here is committed work —
it is a menu to pick from.

## Already covered under non-obvious names (not gaps)

Checked first, to avoid false positives:

- **Tooltip / Popover** — actions (`actions/tooltip`, `actions/popover`), not components
- **Toast** — `Notifications` (notifications stack)
- **Badge** — `Pill`
- **Toggle group** — `ButtonGroupRadio`
- **Sheet** — `Drawer`
- **Alert / callout** — `DismissibleMessage`
- **Table pagination** — built into `DataTable` (`showpager`)
- **Multi-select / tags input** — `FieldOptions` (async `getOptions` search, typeahead,
  `cardinality`, option groups, `allowUnknown` for ad-hoc values, `ordered` for manual
  arrangement, `chips` for the inline tag form factor). See the note at the bottom on
  the inline-chip presentation.
- **File dropzone** — `actions/file-dropzone` + `FieldFile` / `FieldAssets`

## Tier 1 — staples nearly every comparable library ships

1. ~~**Date picker / Calendar**~~ — ✅ shipped (see `src/lib/components/Calendar/` and
   `FieldDate` / `FieldDateRange` in `Input/`): `Calendar` is the month grid (single /
   range, APG keyboard grid, min/max/blackouts, dropdown caption, multiple months, week
   numbers, `renderDay`, Intl names + `t` texts with Slovak bundled), built on
   `@marianmeres/calendar-utils`; the fields wrap it as trigger + dialog or embedded, with
   ISO `YYYY-MM-DD` hidden inputs and the usual validate API.
2. ~~**Breadcrumbs**~~ — ✅ shipped (see `src/lib/components/Breadcrumbs/`):
   APG nav/ol trail, collapsible long trails, schema.org `BreadcrumbList` JSON-LD
   helpers (`breadcrumbsJsonLd` / `breadcrumbsJsonLdScript` + inline `jsonLd` prop).
3. ~~**Pagination (standalone)**~~ — ✅ shipped (see `src/lib/components/Pagination/`):
   compact (the `DataTable` pager) + windowed page-numbers variants, consumes the same
   `PagingCalcResult` as `DataTable` so one paging store can feed both.

## Tier 2 — very common, clear use cases

4. ~~**Stepper / step indicator**~~ — ✅ shipped (see `src/lib/components/Stepper/`):
   numbered step indicator with completed/current/upcoming/error states, optional
   click navigation, horizontal (labels end/below) + vertical orientations; `current`
   is a zero-based index matching `@marianmeres/wizard`'s `step.index`.
5. ~~**ContextMenu**~~ — ✅ shipped (see `src/lib/components/ContextMenu/`): wraps the
   `DropdownMenu` engine behind context-menu trigger semantics — positions at the
   cursor via a 0×0 fixed anchor, `contextmenu` event, long-press on touch/pen (new
   reusable `longPress` attachment), Shift+F10 / menu key.
6. ~~**EmptyState**~~ — ✅ shipped (see `src/lib/components/EmptyState/`): icon +
   title + description + CTA placeholder for empty lists/tables/search results.
7. ~~**Rating (stars)**~~ — ✅ shipped (see `src/lib/components/Rating/`): input
   (radiogroup of per-star radios, half steps, hover preview, click-again-to-clear,
   keyboard, hidden input + `validate` with `required`) and `readonly` display
   (`role="img"`, fractional fill); custom `icon` / `iconEmpty`, `intent`, sizes,
   `t` texts with Slovak bundled.

## Tier 3 — common, but judge by actual app needs

8. ~~**SplitPane / resizable panels**~~ — ✅ shipped (see `src/lib/components/SplitPane/`
   and `src/lib/attachments/resizable.ts`): the `resizable-width` action generalised into a
   `resizable` attachment (`axis: "x" | "y"`, `px` / `%`, `min` / `max`, `key` persistence,
   `handle` for an own separator, `onInit` api) whose handle is an ARIA window splitter
   (arrows / Home / End / Enter); `resizableWidth` stays as a thin wrapper over it, so
   `WithSidePanel` got the keyboard for free. `SplitPane` wraps it: `start` / `end`
   snippets, `orientation`, `primary`, `bind:size`, `reset()`, `disabled`, tokens, `t` with
   Slovak bundled.
9. ~~**Range slider (dual-thumb)**~~ — ✅ shipped (see `src/lib/components/RangeSlider/`):
   `Slider`'s two-value sibling — `bind:start` / `bind:end` on one track with the fill
   between them; nearest-thumb press, grab-to-drag, thumbs never cross (`minRange`),
   per-thumb keyboard via two hidden range inputs (`nameStart` / `nameEnd`), ticks,
   value labels, `validate` with the pair, `t` thumb names with Slovak bundled.
10. ~~**Timeline / activity feed**~~ — ✅ shipped (see `src/lib/components/Timeline/`):
    vertical event list on a rail with dot / icon-bubble / custom (snippet) markers,
    per-item intent, `<time datetime>` support with an optional formatter, inline or
    opposite time column, `start` / `alternate` alignment; `subgrid` keeps the columns
    aligned without fixed widths.
11. ~~**Stat / KPI card**~~ — ✅ shipped (see `src/lib/components/Stat/`): label +
    value + delta with trend arrow and semantic coloring (`trendIntent` for
    down-is-good metrics), hint, corner icon, footer/sparkline area.
12. ~~**CopyButton**~~ — ✅ shipped (see `src/lib/components/CopyButton/`): a
    `Button` that copies `text` (string or sync/async getter) with copied/error
    feedback (icon + intent swap, localized label/name, sr live announcement),
    `onCopied` / `onError` callbacks; the write is the reusable `copyToClipboard()`
    util (async Clipboard API + `execCommand` fallback) in `utils/`.
13. **ColorPicker** — beyond native `type="color"`: swatch palette + custom input.
    Given stuic's theming/design-tokens focus, a swatch picker would be on-brand.

## Deliberately out of scope (or close enough to covered)

- scroll-area (native is fine)
- virtual list / infinite scroll (belongs closer to `@marianmeres/paging-store`)
- lightbox (`AssetsPreview` territory)
- menubar / mega-menu (`Nav` + `DropdownMenu` compose it)
- password strength meter, toolbar

## Note: inline-chip presentation of FieldOptions

Initially listed as a Tier-1 "tags input" gap; retracted — `FieldOptions` covers the
capability. What stuic lacked was the _inline chip form factor_. That splits into two
separable halves, and only the second one has a mobile problem:

1. ~~**Chips as the field's display**~~ — ✅ shipped (`FieldOptions` `chips` prop, see
   `Input/README.md`): the closed field shows the selection as removable `Pill` chips
   (per-chip ×, focus kept in the field, `change` dispatched so validation re-runs) plus a
   trailing button that opens the existing modal; the empty part of the row opens it too.
   Internally a `FieldLikeButton` sibling (`Input/_internal/FieldLikeChips.svelte`) — the
   chips carry their own buttons, so they cannot live inside the `<button>` trigger. Works
   on every device; the one touch concern (× target size) is handled with a padded hit
   area on `pointer: coarse`.
2. **Inline adding** (type into the field, suggestions, Enter commits) — not built. This is
   where every mobile hazard lives (see the reality check below). The design to argue for,
   if ever built:
   - a presentation mode of `FieldOptions`, not a new component — the selection model
     (`ItemCollection`, `cardinality`, `allowUnknown`, `ordered`) is already there. But the
     engine is currently bound to the modal lifecycle (hydrate on open, fetch while
     visible, clear on submit) and would need extracting into a shared `.svelte.ts` class
     rather than more branches in the 1250-line file; that is the real cost
   - no floating listbox popover: reuse the existing `typeahead` action (ghost text, Tab
     accepts, Enter commits, Backspace at position 0 removes the last chip via
     `onDeleteRequest`). No anchored dropdown means the soft-keyboard hazard disappears by
     construction; the modal stays the browse path via the trailing button. A real list
     popover can be added later behind the same prop if ghost text proves insufficient
   - gate it on the `md` breakpoint (`breakpoint.svelte.ts`), not on `DevicePointer` —
     that util uses `any-pointer`, so a touchscreen laptop counts as coarse and an iPad
     with a trackpad as fine; the breakpoint is deterministic and testable in the browser
     suite. If pointer detection is wanted as well, it should be the primary
     `pointer: coarse`
   - below the breakpoint, delegate to the modal — i.e. exactly the shipped `chips` mode

Mobile reality check for the inline variant, if it were ever made touch-capable
instead of delegating:

- a floating anchor-positioned dropdown is the first casualty of the on-screen
  keyboard (clipped/covered/scrolled); the mobile-viable idiom is a full-width
  suggestion list in document flow under the field (cf. Gmail's To: field), sized via
  the `visualViewport` API
- chip removal: tiny × falls below ~44px touch targets, and backspace-to-delete is
  unreliable (Android IMEs report `keyCode 229`); workable patterns are
  tap-to-select-then-delete or generously padded delete zones, detected via
  `beforeinput`/`input` rather than `keydown`
- committing unknown values: on separator via `input` event or on blur, not keydown

Once all three adaptations are made, the small-screen result is behaviorally ~90% of
what the `FieldOptions` modal already does — which is why delegating below a
breakpoint is the pragmatic answer.
