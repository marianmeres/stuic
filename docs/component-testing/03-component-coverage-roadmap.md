<!--
GENERATED ANALYSIS — @marianmeres/stuic real-browser component testing
Produced 2026-06-08 by multi-agent research → adversarial verify → synthesize.
Component inventory verified against src/lib/components at commit cc9958b.
Planning artifact; no code was changed.
-->

# Component Coverage Roadmap

> The library has **74 components** (≈105 `.svelte` files incl. sub-components). Roughly **26 are
> "easy"** (deterministic prop→DOM, no portals/traps), **23 "medium"** (actions, focus jumps, layout
> reads), **30 "hard/E2E-only"** (portals, focus traps, anchor positioning, drag, Milkdown). The plan:
> **one commit per component**, starting with the easy primitives that are used everywhere, then a
> single "hard proof" to validate that browser mode earns its keep (see [04](./04-hard-cases-and-e2e.md)).

## Summary of recommendations

| #   | Recommendation                                                                         | Value | Effort | Risk |
| --- | -------------------------------------------------------------------------------------- | ----- | ------ | ---- |
| 1   | Cover the **easy tier** primitives first (Button, Pill, Switch, …), one commit each    | high  | S      | low  |
| 2   | Establish reusable assertion patterns on Button (the flagship), reuse everywhere       | high  | S      | low  |
| 3   | Do **one hard proof** early (focus trap or anchor positioning) to de-risk the approach | high  | M      | med  |
| 4   | Cover the **medium tier** (form fields with actions) once patterns are settled         | med   | M      | low  |
| 5   | Defer the **hard 30** to a later sprint / standalone Playwright E2E layer              | med   | L      | med  |

## Tier 1 — Easy, highest-value (the warm-up; one commit each)

Deterministic prop→DOM/aria/event surface; no portals, traps, or external geometry. Paths under
`src/lib/components/`.

| Order | Component              | Path                                           | What to assert                                                                                                                                                                               |
| ----- | ---------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | **Button**             | `Button/Button.svelte`                         | `intent`/`variant`/`size` → `data-*`; `disabled` attr + click suppressed; `href` → `<a>`; spinner shows/hides; `roleSwitch` toggle; `onclick` fires once. The flagship — sets every pattern. |
| 2     | **Pill**               | `Pill/Pill.svelte`                             | intent/variant → `data-*`; `active` state; dismissible click → `ondismiss` (+ `stopPropagation`); `href` → link; disabled blocks click.                                                      |
| 3     | **Switch**             | `Switch/Switch.svelte`                         | `checked` reflected in hidden input; click toggles; `disabled`; intent/size classes; on/off snippets. First real "reactivity in a browser" proof.                                            |
| 4     | **Spinner**            | `Spinner/Spinner.svelte`                       | size → dims; `count` → number of bars; thickness/direction/duration → style/CSS var. Pure CSS, no motion lib.                                                                                |
| 5     | **Skeleton**           | `Skeleton/Skeleton.svelte`                     | variant (text/circle/rect) markup; `lines` count; rounded class; animation off under `prefers-reduced-motion`; width/height inline style.                                                    |
| 6     | **DismissibleMessage** | `DismissibleMessage/DismissibleMessage.svelte` | message renders; `intent` → `data-intent`; dismiss button hidden when `onDismiss=false`; `ondismiss` fires; new message resets dismissed state.                                              |
| 7     | **Avatar**             | `Avatar/Avatar.svelte`                         | `src` → `<img>` + alt; initials extracted from name; icon fallback; error→fallback switch; `autoColor` deterministic; size class.                                                            |
| 8     | **Progress**           | `Progress/Progress.svelte`                     | `type=bar` vs `circle` markup; value → bar **width** / circle stroke (genuine layout read — jsdom can't).                                                                                    |
| 9     | **Separator**          | `Separator/Separator.svelte`                   | orientation → classes/role. Near-zero risk — good harness smoke test (see [01](./01-framework-setup.md) Step 5).                                                                             |
| 10    | **H**                  | `H/H.svelte`                                   | `level` → correct `h1`–`h6` tag; size override class.                                                                                                                                        |
| 11    | **KbdShortcut**        | `KbdShortcut/KbdShortcut.svelte`               | key labels rendered; modifier order; cross-platform output.                                                                                                                                  |
| 12    | **ButtonGroupRadio**   | `ButtonGroupRadio/ButtonGroupRadio.svelte`     | single selection; click changes selection; value binding.                                                                                                                                    |
| 13    | **ListItemButton**     | `ListItemButton/ListItemButton.svelte`         | active class; disabled blocks click; `onclick`; icon/avatar slot.                                                                                                                            |
| 14    | **Card**               | `Card/Card.svelte`                             | variant → `data-*`; header/footer/children snippets render.                                                                                                                                  |
| 15    | **TabbedMenu**         | `TabbedMenu/TabbedMenu.svelte`                 | tab click updates bound `activeTab`; active content renders; indicator moves.                                                                                                                |
| 16    | **IconSwap**           | `IconSwap/IconSwap.svelte`                     | `active` swaps icon; animation class applied.                                                                                                                                                |
| 17    | **Collapsible**        | `Collapsible/Collapsible.svelte`               | `needsCollapse` true when `scrollHeight > clientHeight` (browser-only); expand removes line-clamp; toggle visible only when needed.                                                          |

> The first sprint targets **#1–#9 plus one hard proof**; #10–#17 are ranked backlog (still Tier 1,
> just diminishing marginal value). Adjust freely as patterns settle.

## Tier 2 — Medium value, moderate complexity (next sprint)

Use actions (`trim`/`typeahead`/`validate`/`autogrow`/`tooltip`) and/or real focus/geometry, but stay
deterministic. Form fields are the bulk and share one harness pattern once `FieldInput` is solved.

`FieldInput`, `FieldTextarea`, `FieldCheckbox`, `FieldSelect`, `FieldRadios`, `FieldSwitch`,
`FieldKeyValues`, `FieldObject`, `FieldPhoneNumber`, `FieldLikeButton` · `OtpInput` (focus jumps,
paste) · `Nav` (expand/collapse) · `ImageCycler` · `AppShell`/`AppShellSimple` · `PricingTable` ·
`ThemePreview` · `AssetsPreview` · `SlidingPanels` · `Notifications` (timers; portal — borderline) ·
`TypeaheadInput` · `ColorScheme` (localStorage).

Pattern note: for the `validate` action, inject a stub validator (`(k) => k` style, as existing util
tests do) rather than exercising live validation — keeps these fast and deterministic.

## Tier 3 — Hard / E2E-only (later; see [04](./04-hard-cases-and-e2e.md))

Portals & focus traps (`Modal`, `ModalDialog`, `Backdrop`, `Drawer`, `AlertConfirmPrompt`), anchor
positioning (`DropdownMenu`, `CommandMenu`, `UserAvatarMenu`), drag (`Tree`, `FieldOptions`,
`FieldFile`, `FieldAssets`), scroll/observer (`Carousel`, `DataTable`, `Book`), heavy 3rd-party
(`MarkdownEditor`/Milkdown, `CronInput`), and the composite flows (`Checkout/*`, `LoginForm`,
`RegisterForm`, `EmailVerifyForm`, `LoginOrRegisterForm`, `FieldInputLocalized`).

Several of these _can_ be done in browser mode (focus traps, anchor positioning, observers all work
in a real Chromium); only drag-heavy and Milkdown components genuinely want standalone Playwright
E2E. [04](./04-hard-cases-and-e2e.md) draws that line.

## Cadence

- **One component per commit**, message like `test(Button): browser-mode coverage`.
- Each commit: write `ComponentName.svelte.test.ts`, run `pnpm test` (both projects green), tick the
  row in [`PROGRESS.md`](./PROGRESS.md), commit.
- Don't chase coverage %. Stop at the behavior contracts in [02](./02-test-conventions.md)'s checklist.

## Open questions / decisions needed

- **Depth per component** — assert the headline contracts (recommended) vs exhaustive prop-matrix.
  Default: headline contracts; expand only where a real regression happened.
- **Where to stop Tier 1 before pausing for the hard proof** — plan assumes after #9; confirm or
  extend.
