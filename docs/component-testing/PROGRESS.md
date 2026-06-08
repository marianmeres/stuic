# Implementation Progress — Component Testing

Living tracker for acting on [`00-overview-and-roadmap.md`](./00-overview-and-roadmap.md).
A fresh conversation should read this file first, then the relevant `NN-*.md` section.

**Status legend:** ⬜ not started · 🚧 in progress · ⏸️ blocked/awaiting decision · ✅ done · ⏭️ deferred

> Convention: branch `feat/component-testing`; **one commit per task**. Each task resolves its source
> doc's "Open questions" first (record in the Decisions log), then implement → `pnpm test` green →
> tick here → commit.

## First sprint (harness + easy tier + one hard proof + CI)

Branch: `feat/component-testing`

| #   | Task                                                                                                                      | Source                                      | Status | Commit    |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------ | --------- |
| 1   | Upgrade vitest 3→4; confirm 9 existing node suites still green                                                            | [01](./01-framework-setup.md) Step 1        | ✅     | `71e47e2` |
| 2   | Browser harness: add deps, `projects` config split, `playwright install chromium`, fix test scripts, Separator smoke test | [01](./01-framework-setup.md) Steps 2–5     | ✅     | `980b323` |
| 3   | Reconcile [`docs/testing.md`](../testing.md) — add the browser-behavior layer                                             | [02](./02-test-conventions.md)              | ✅     | `977c431` |
| 4   | **Button** — flagship; establish assertion patterns                                                                       | [03](./03-component-coverage-roadmap.md) #1 | ✅     | `9485e97` |
| 5   | **Pill** — intent/active/dismissible event                                                                                | [03](./03-component-coverage-roadmap.md) #2 | ✅     | `2992faf` |
| 6   | **Switch** — checked binding, toggle, disabled                                                                            | [03](./03-component-coverage-roadmap.md) #3 | ✅     | `6aa1771` |
| 7   | **Spinner** — size/count/direction                                                                                        | [03](./03-component-coverage-roadmap.md) #4 | ✅     | `485b764` |
| 8   | **Skeleton** — variants, reduced-motion                                                                                   | [03](./03-component-coverage-roadmap.md) #5 | ✅     | `ff8bd7e` |
| 9   | **DismissibleMessage** — intent, dismiss, auto-reset                                                                      | [03](./03-component-coverage-roadmap.md) #6 | ✅     | `c520780` |
| 10  | **Avatar** — initials/img/icon fallback, autoColor                                                                        | [03](./03-component-coverage-roadmap.md) #7 | ✅     | `43ed174` |
| 11  | **Progress** — value→width/stroke (real layout)                                                                           | [03](./03-component-coverage-roadmap.md) #8 | ✅     | `c8cc0ef` |
| 12  | **Hard proof** — anchor-position viewport clamp                                                                           | [04](./04-hard-cases-and-e2e.md)            | ✅     | `5ae4470` |
| 13  | CI — minimal GitHub Actions `test.yml` (test + check jobs)                                                                | [05](./05-ci.md)                            | ✅     | `a61b8cb` |

**🎉 First sprint complete** (tasks 1–13). 146 tests green (node + Chromium browser), `pnpm check` clean, CI in place. Next: pick up the backlog below.

## Backlog (ranked, post-sprint)

| Rank | Task                                                                                                                                                                    | Source                                          | Status |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 14   | Rest of Tier 1 (Separator already smoke-tested · H, KbdShortcut, ButtonGroupRadio, ListItemButton, Card, TabbedMenu, IconSwap, Collapsible)                             | [03](./03-component-coverage-roadmap.md) #10–17 | ✅     |
| 15   | Tier 2 — `FieldInput` first, then the Field\* family + OtpInput, Nav, etc.                                                                                              | [03](./03-component-coverage-roadmap.md)        | 🚧     |
| 16   | Portals/focus-traps in browser mode (Modal, ModalDialog, Backdrop, Drawer, AlertConfirmPrompt)                                                                          | [04](./04-hard-cases-and-e2e.md)                | ⬜     |
| 17   | Anchor-positioned menus (DropdownMenu, CommandMenu, UserAvatarMenu) + extract search logic to `_internal`                                                               | [04](./04-hard-cases-and-e2e.md)                | ⬜     |
| 18   | Standalone Playwright E2E layer (drag: Tree/FieldOptions/FieldFile; Milkdown; Checkout/auth flows)                                                                      | [04](./04-hard-cases-and-e2e.md)                | ⏭️     |
| 19   | Clear the repo's **pre-existing lint debt** (8 eslint errors + 119 prettier files), then add a **`pnpm lint`** CI job. (`pnpm check` already runs in CI as of task 13.) | [05](./05-ci.md)                                | ✅     |
| 20   | (Maybe) visual-regression via `toMatchScreenshot`; multi-browser matrix                                                                                                 | [00](./00-overview-and-roadmap.md)              | ⏭️     |

### Task 14 — Tier 1 components (one commit each)

- [x] H — `H.svelte.test.ts` (8 tests)
- [x] KbdShortcut — `KbdShortcut.svelte.test.ts` (6 tests)
- [x] ButtonGroupRadio — `ButtonGroupRadio.svelte.test.ts`
- [x] ListItemButton — `ListItemButton.svelte.test.ts`
- [x] Card — `Card.svelte.test.ts`
- [x] TabbedMenu — `TabbedMenu.svelte.test.ts`
- [x] IconSwap — `IconSwap.svelte.test.ts`
- [x] Collapsible — `Collapsible.svelte.test.ts` (the browser-only star: real `scrollHeight > clientHeight`)

### Task 15 — Tier 2 (Field\* family first, then OtpInput, Nav, etc.)

Field\* family (all under `Input/`, co-located `*.svelte.test.ts`):

- [x] FieldInput — flagship; label/for, value/type/required/disabled, trim, validate (10 tests)
- [x] FieldTextarea — textarea + trim/validate + autogrow (11 tests)
- [x] FieldCheckbox — native checkbox, checked/toggle, validate-on-interaction (8 tests)
- [x] FieldSwitch — wraps Switch in InputWrap; checked/toggle (off-center click), disabled (9 tests)
- [x] FieldRadios — radio group, value binding, selection moves on click (7 tests)
- [x] FieldSelect — select options, value binding via selectOptions, validate, optgroup (9 tests)
- [ ] FieldLikeButton
- [ ] FieldPhoneNumber
- [ ] FieldKeyValues
- [ ] FieldObject

Other Tier 2:

- [ ] OtpInput (focus jumps, paste)
- [ ] Nav (expand/collapse)
- [ ] TypeaheadInput
- [ ] ColorScheme (localStorage)
- [ ] ImageCycler
- [ ] PricingTable
- [ ] ThemePreview
- [ ] SlidingPanels
- [ ] AppShell / AppShellSimple — _assess; may postpone (layout-heavy)_
- [ ] AssetsPreview — _assess; may postpone (heavy)_
- [ ] Notifications — _borderline Tier 3 (portal + timers); assess/postpone_

## Decisions log

- **2026-06-08** — **Backlog #14 done (rest of Tier 1).** 8 components, one commit each: H, KbdShortcut,
  ButtonGroupRadio, ListItemButton, Card, TabbedMenu, IconSwap, Collapsible (+64 tests → **210 total**,
  `pnpm test`/`check`/`lint` all green). Drafted+adversarially-reviewed in parallel via a subagent
  workflow, then verified against real Chromium + a full-suite gate before committing each. Notable
  findings: (1) **the browser test env loads NO component/Tailwind CSS** (setupFiles is only
  `vitest-browser-svelte`; nothing imports the stuic aggregator stylesheet) — only inline styles the
  component emits directly are reliable. **Collapsible** therefore injects the `line-clamp-{n}` rules
  Tailwind would generate (via `beforeAll` + a `<style>` tag) so its genuine browser-only measurement
  (`scrollHeight > clientHeight`) can run; everything else asserts `data-*`/class presence, never
  computed external-class styles. (2) **Card**'s `horizontal` variant auto-switches to `vertical` below
  `horizontalThreshold` (480px) — tests pass `horizontalThreshold={0}` to assert the raw variant.
  (3) **IconSwap** omits the motion-dependent `300ms` duration assertion (no per-test
  `prefers-reduced-motion` API — cf. the Skeleton decision); asserts `duration:0`/easing CSS vars instead.
- **2026-06-08** — Adopt **Vitest 4 Browser Mode + `vitest-browser-svelte` + `@vitest/browser-playwright` (Chromium)** — verified the right default for a component library whose value is DOM/layout/focus behavior the current node/server-build setup can't test.
- **2026-06-08** — **Take the vitest 3→4 major upgrade now** (gating prerequisite) — `vitest-browser-svelte@^2` peer-requires `vitest ^4`; the vitest-3-compatible `0.1.0` is a dead-end.
- **2026-06-08** — **Scope:** easy warm-up (Button/Pill/Switch/…) then **one** hard proof — not full coverage up front.
- **2026-06-08** — **Browsers: Chromium only** — leanest CI; add Firefox/WebKit only if engine-specific behavior demands it.
- **2026-06-08** — **CI: yes, minimal GitHub Actions**, added late in the sprint once a few component tests pass locally.
- **2026-06-08** — **Config lives in `vite.config.ts`** (extend with a `test` block) rather than a separate `vitest.config.ts` — minimal change.
- **2026-06-08** — Task 1 done: **vitest 4.1.8** installed (vite already `^7.3.5`, compatible); all 9 node suites / 59 tests pass unchanged. `--dir src/` still supported in v4.
- **2026-06-08** — Tasks 4–8 done (Button/Pill/Switch/Spinner/Skeleton). Drafted in parallel via a subagent workflow, then each verified in isolation + a full-suite gate before commit. **`prefers-reduced-motion`** has no simple per-test API in vitest browser mode → Skeleton omits that assertion (asserts always-on markup instead); revisit if Playwright context emulation is wired up. **Snippet `text()` helper kept inline per-file** (no shared util yet) — re-evaluate if it spreads further. **`testTimeout` 2000→5000ms** (`da9805f`): a multi-click reactive test (Switch) intermittently timed out under full-suite Chromium contention while green in isolation. Added `.vitest-attachments`/`__screenshots__` to `.gitignore` (`6294e63`).
- **2026-06-08** — Task 2 done: harness works. Deps: `@vitest/browser-playwright 4.1.8`, `playwright 1.60.0`, `vitest-browser-svelte 2.1.1`. `projects` split added to `vite.config.ts`; scripts now `test` = `vitest run` (+ `test:watch`, `test:ui`). Separator smoke test (3 assertions) passes in Chromium → **10 files / 62 tests green**, `pnpm check` clean (0 errors). **The documented SvelteKit-plugin/server-build blocker is resolved** — browser mode resolves the client build, `toHaveClass("stuic-separator")` confirms tailwind + the client runtime run. No `client`-project plugin fallback needed.
- **2026-06-08** — Task 12 resolved (owner): **anchor-position viewport clamp** as the single hard proof. `clampIntoViewport` gets a browser test (`utils/anchor-position.svelte.test.ts`, 8 tests — real `getBoundingClientRect` + `window.inner*`, jsdom-impossible, guards `9d8c974`); the pure `buildPositionTryFallbacks` math gets a fast node companion (`utils/anchor-position.test.ts`, 3 tests). Focus trap deferred to the portals/focus-trap backlog (#16).
- **2026-06-08** — Task 13 resolved (owner): CI is `.github/workflows/test.yml` with **two jobs** — `test` (installs Chromium via `playwright install --with-deps chromium`, runs `pnpm test`) and `check` (`pnpm check` / svelte-check). **pnpm pinned via `packageManager: "pnpm@11.5.0"`** in package.json (auto-read by `pnpm/action-setup@v4`); **Node 22** on both jobs. **`pnpm lint` deferred** (owner): the repo has pre-existing lint debt (8 eslint errors + 119 prettier files) unrelated to this sprint → folded into backlog #19 (clean up, then add the lint job) rather than shipping a red-on-arrival CI. Local parity verified: `pnpm install --frozen-lockfile` ✓, `pnpm test` (146) ✓, `pnpm check` (0 errors) ✓.
- **2026-06-08** — Backlog #19 done (owner): **repo lint debt cleared** and **`pnpm lint` folded into the CI `check` job**. eslint 8→0 — `let`→`const` split in `focus-trap`, empty-interface→type-alias, `_i18nSpanWrap`/`const out`/`as unknown as …` in assets-preview-utils; eslint config now ignores `_`-prefixed unused bindings and turns off `ban-ts-comment` for the Deno-targeted `mcp.ts`. Committed as a 2-way split: eslint/config (`019909c`) + repo-wide `prettier --write` (`331e070`, ~112 files). The CI `check` job now runs `pnpm check` **and** `pnpm lint`. `pnpm lint` / `check` / `test` all green.

## How to resume (for a fresh conversation)

1. Read this file + [`00-overview-and-roadmap.md`](./00-overview-and-roadmap.md).
2. Pick the next ⬜ task; open its source doc section for the verified detail.
3. Resolve that task's "Open questions" with the owner; record in the Decisions log.
4. On `feat/component-testing`: implement → `pnpm test` (both projects green) → update this file →
   commit when the owner asks (one commit per task).
