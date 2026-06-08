<!--
GENERATED ANALYSIS — @marianmeres/stuic real-browser component testing
Produced 2026-06-08 by multi-agent research → adversarial verify → synthesize.
Claims verified against src/lib at commit cc9958b. Planning artifact; no code was changed.
-->

# Hard Cases & E2E Strategy

> ~30 of the 74 components are "hard". But "hard" splits two ways: **most are hard for *jsdom* yet
> perfectly testable in Vitest browser mode** (focus traps, anchor positioning, ResizeObserver — all
> work in a real Chromium); only **drag-heavy and Milkdown-class** components genuinely need a
> separate Playwright **E2E** layer against a running app. The single most valuable near-term action
> is **one "hard proof"** test now — pick the thing that recently regressed — to prove browser mode
> earns its setup cost before we invest in the easy tier en masse.

## The two kinds of "hard"

| Kind | Examples | Where it's tested |
|------|----------|-------------------|
| **Hard for jsdom, fine in browser mode** | focus traps, anchor/viewport positioning, scroll/observer tracking, transitions, computed layout | **Vitest browser mode** (this plan) — a real Chromium page gives real `getBoundingClientRect`, focus, layout |
| **Hard even in browser mode** | drag-and-drop reorder, file drop, full WYSIWYG editors, multi-step composite flows | **Standalone Playwright E2E** against `pnpm dev`/`preview` (deferred to a later sprint) |

This matters because the naive read ("30 components are E2E-only") is wrong — it would defer exactly
the high-value behaviors (focus, positioning) that motivated this whole effort. Most of the 30 belong
in browser mode; only a handful are true E2E.

## The "hard proof" — do this once, early

Per the agreed scope (easy warm-up → one hard proof), after the first easy components land, write
**one** test that is impossible in jsdom and protects a real, recent regression. Two strong
candidates, both verified to exist:

### Candidate A (recommended) — anchor-position viewport clamping

- **Code:** [`src/lib/utils/anchor-position.ts`](../../src/lib/utils/anchor-position.ts), consumed by
  `DropdownMenu/DropdownMenu.svelte` (and others).
- **Why:** this is precisely what regressed in `9d8c974` *"clamp anchor-positioned annotations to
  viewport on all paths"* and `8c52afe`. A test here has immediate, proven value and prevents
  recurrence. It's also the textbook "jsdom returns all-zeros from `getBoundingClientRect`" case — so
  it can only exist in browser mode.
- **Shape:** render a host + an anchored element positioned near a viewport edge in a real page;
  assert the element's rect stays clamped inside `window.innerWidth/innerHeight`.
- **Bonus:** the *pure* clamp math in `anchor-position.ts` can additionally get a fast **node** test
  (`anchor-position.test.ts`) — cheap regression net independent of the browser.

### Candidate B (alternative) — focus trap

- **Code:** [`src/lib/actions/focus-trap.ts`](../../src/lib/actions/focus-trap.ts), used by
  `ModalDialog`, `Backdrop`, `Drawer`.
- **Why:** Tab/Shift-Tab cycling and `returnFocus`-on-teardown are core a11y contracts that node
  cannot exercise at all.
- **Shape:** render a container with the action + 3 focusables; assert Tab from the last wraps to the
  first, Shift-Tab from the first wraps to the last, and focus returns to the opener on destroy.

> **Open question (resolve at this task):** A or B as the single hard proof. Recommendation: **A** —
> it guards a regression that already happened twice. Doing both is fine but only one is required to
> de-risk the approach.

## Portals & focus traps (browser-mode, later sprint)

`Modal`, `ModalDialog`, `Backdrop`, `Drawer`, `AlertConfirmPrompt` — all use
[`focus-trap.ts`](../../src/lib/actions/focus-trap.ts), scroll-lock, and an Escape-key stack. These
are testable in browser mode (open → focus trapped → Escape closes → backdrop click closes →
`returnFocus`). The stack/queue *logic* is already unit-tested (`AlertConfirmPromptStack`,
`NotificationsStack`); browser tests add the DOM-interaction layer. Higher effort, real value —
schedule after Tier 1/2.

## Anchor positioning (browser-mode, later sprint)

`DropdownMenu`, `CommandMenu`, `UserAvatarMenu` — positioning + keyboard nav + click-outside. Test
positioning and keyboard nav in browser mode; the search/filter logic should be extracted to
`_internal/*.ts` and unit-tested in node where practical.

## True E2E candidates (standalone Playwright, deferred)

These want a running app, not isolated component mounts:

- **Drag & file drop:** `Tree` (reorder + auto-expand + async `onMove`), `FieldOptions`, `FieldFile`,
  `FieldAssets`. Extract and node-test the pure logic (`calcDropPosition`, `isDescendantOf` per
  `docs/testing.md`); E2E the gesture.
- **Heavy editors:** `MarkdownEditor` (Milkdown + CodeMirror) — E2E only; mock/skip at component
  level. `CronInput` — node-test the cron logic, E2E the builder UI.
- **Composite flows:** `Checkout/*`, `LoginForm`/`RegisterForm`/`EmailVerifyForm`/
  `LoginOrRegisterForm`, `FieldInputLocalized` — multi-step, cross-component; E2E the flow, browser-
  test the leaf fields individually.

A standalone Playwright E2E project (its own `playwright.config.ts` against `pnpm preview`) is a
**separate later initiative** — explicitly out of scope for the first sprint. Visual-regression
(Vitest 4 ships `toMatchScreenshot`) is likewise deferred.

## Open questions / decisions needed

- **Hard proof A vs B** (above) — recommend A.
- **When to start the standalone Playwright E2E layer** — not in sprint 1; revisit after Tier 2.
- **Logic-extraction appetite** — several hard components get much cheaper if pure logic moves to
  `_internal/*.ts` (already endorsed by `docs/testing.md`). Decide per-component whether to extract
  before testing.
