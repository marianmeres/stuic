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
  arrangement). See the note at the bottom on the inline-chip presentation variant.
- **File dropzone** — `actions/file-dropzone` + `FieldFile` / `FieldAssets`

## Tier 1 — staples nearly every comparable library ships

1. **Date picker / Calendar** — the single biggest gap. No calendar grid, no date-range
   picker anywhere in the lib (only native `type="date"` via `FieldInput`).
   `@marianmeres/calendar-utils` already does the date math, so this is mostly UI work.
   A `FieldDate` / `FieldDateRange` would slot naturally next to `FieldMoney` /
   `FieldPhoneNumber`. Most work of anything on this list, but also the absence
   consumers will actually notice.
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
7. **Rating (stars)** — display + input variants. `FieldLikeButton` is adjacent but not
   this.

## Tier 3 — common, but judge by actual app needs

8. **SplitPane / resizable panels** — general two-pane draggable splitter
   (horizontal/vertical, min/max, persisted size). `actions/resizable-width`,
   `WithSidePanel`, and `persistent-state` already provide the pieces.
9. **Range slider (dual-thumb)** — `Slider` is deliberately single-value; a min/max
   range variant (price filters etc.) is a recurring ask.
10. **Timeline / activity feed** — vertical event list with markers; common in
    admin/audit views.
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
capability. What stuic lacks is at most the _inline chip form factor_: chips inside the
field with per-chip remove ×, a text input riding alongside, suggestions in a popover
without leaving the page. Faster for dense desktop/admin work; the existing modal flow
is arguably better on mobile.

If ever built, the design to argue for: a presentation mode of `FieldOptions` (the
selection model — `ItemCollection`, `cardinality`, `allowUnknown` — is already there),
not a new component. Inline combobox on pointer devices, delegating to the existing
modal on touch/small screens (`breakpoint.svelte.ts` + `device-pointer.svelte.ts`
enable the switch).

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
