# Implementation Progress — Component Testing

Living tracker for acting on [`00-overview-and-roadmap.md`](./00-overview-and-roadmap.md).
A fresh conversation should read this file first, then the relevant `NN-*.md` section.

**Status legend:** ⬜ not started · 🚧 in progress · ⏸️ blocked/awaiting decision · ✅ done · ⏭️ deferred

> Convention: branch `feat/component-testing`; **one commit per task**. Each task resolves its source
> doc's "Open questions" first (record in the Decisions log), then implement → `pnpm test` green →
> tick here → commit.

## First sprint (harness + easy tier + one hard proof + CI)

Branch: `feat/component-testing`

| # | Task | Source | Status | Commit |
|---|------|--------|--------|--------|
| 1 | Upgrade vitest 3→4; confirm 9 existing node suites still green | [01](./01-framework-setup.md) Step 1 | ✅ | `71e47e2` |
| 2 | Browser harness: add deps, `projects` config split, `playwright install chromium`, fix test scripts, Separator smoke test | [01](./01-framework-setup.md) Steps 2–5 | ✅ | _next_ |
| 3 | Reconcile [`docs/testing.md`](../testing.md) — add the browser-behavior layer | [02](./02-test-conventions.md) | ⬜ | — |
| 4 | **Button** — flagship; establish assertion patterns | [03](./03-component-coverage-roadmap.md) #1 | ⬜ | — |
| 5 | **Pill** — intent/active/dismissible event | [03](./03-component-coverage-roadmap.md) #2 | ⬜ | — |
| 6 | **Switch** — checked binding, toggle, disabled | [03](./03-component-coverage-roadmap.md) #3 | ⬜ | — |
| 7 | **Spinner** — size/count/direction | [03](./03-component-coverage-roadmap.md) #4 | ⬜ | — |
| 8 | **Skeleton** — variants, reduced-motion | [03](./03-component-coverage-roadmap.md) #5 | ⬜ | — |
| 9 | **DismissibleMessage** — intent, dismiss, auto-reset | [03](./03-component-coverage-roadmap.md) #6 | ⬜ | — |
| 10 | **Avatar** — initials/img/icon fallback, autoColor | [03](./03-component-coverage-roadmap.md) #7 | ⬜ | — |
| 11 | **Progress** — value→width/stroke (real layout) | [03](./03-component-coverage-roadmap.md) #8 | ⬜ | — |
| 12 | **Hard proof** — anchor-position viewport clamp (rec.) *or* focus trap | [04](./04-hard-cases-and-e2e.md) | ⏸️ | — |
| 13 | CI — minimal GitHub Actions `test.yml` | [05](./05-ci.md) | ⬜ | — |

## Backlog (ranked, post-sprint)

| Rank | Task | Source | Status |
|------|------|--------|--------|
| 14 | Rest of Tier 1 (Separator already smoke-tested · H, KbdShortcut, ButtonGroupRadio, ListItemButton, Card, TabbedMenu, IconSwap, Collapsible) | [03](./03-component-coverage-roadmap.md) #10–17 | ⬜ |
| 15 | Tier 2 — `FieldInput` first, then the Field* family + OtpInput, Nav, etc. | [03](./03-component-coverage-roadmap.md) | ⬜ |
| 16 | Portals/focus-traps in browser mode (Modal, ModalDialog, Backdrop, Drawer, AlertConfirmPrompt) | [04](./04-hard-cases-and-e2e.md) | ⬜ |
| 17 | Anchor-positioned menus (DropdownMenu, CommandMenu, UserAvatarMenu) + extract search logic to `_internal` | [04](./04-hard-cases-and-e2e.md) | ⬜ |
| 18 | Standalone Playwright E2E layer (drag: Tree/FieldOptions/FieldFile; Milkdown; Checkout/auth flows) | [04](./04-hard-cases-and-e2e.md) | ⏭️ |
| 19 | Add `pnpm check` + `pnpm lint` as a second CI job | [05](./05-ci.md) | ⬜ |
| 20 | (Maybe) visual-regression via `toMatchScreenshot`; multi-browser matrix | [00](./00-overview-and-roadmap.md) | ⏭️ |

## Decisions log

- **2026-06-08** — Adopt **Vitest 4 Browser Mode + `vitest-browser-svelte` + `@vitest/browser-playwright` (Chromium)** — verified the right default for a component library whose value is DOM/layout/focus behavior the current node/server-build setup can't test.
- **2026-06-08** — **Take the vitest 3→4 major upgrade now** (gating prerequisite) — `vitest-browser-svelte@^2` peer-requires `vitest ^4`; the vitest-3-compatible `0.1.0` is a dead-end.
- **2026-06-08** — **Scope:** easy warm-up (Button/Pill/Switch/…) then **one** hard proof — not full coverage up front.
- **2026-06-08** — **Browsers: Chromium only** — leanest CI; add Firefox/WebKit only if engine-specific behavior demands it.
- **2026-06-08** — **CI: yes, minimal GitHub Actions**, added late in the sprint once a few component tests pass locally.
- **2026-06-08** — **Config lives in `vite.config.ts`** (extend with a `test` block) rather than a separate `vitest.config.ts` — minimal change.
- **2026-06-08** — Task 1 done: **vitest 4.1.8** installed (vite already `^7.3.5`, compatible); all 9 node suites / 59 tests pass unchanged. `--dir src/` still supported in v4.
- **2026-06-08** — Task 2 done: harness works. Deps: `@vitest/browser-playwright 4.1.8`, `playwright 1.60.0`, `vitest-browser-svelte 2.1.1`. `projects` split added to `vite.config.ts`; scripts now `test` = `vitest run` (+ `test:watch`, `test:ui`). Separator smoke test (3 assertions) passes in Chromium → **10 files / 62 tests green**, `pnpm check` clean (0 errors). **The documented SvelteKit-plugin/server-build blocker is resolved** — browser mode resolves the client build, `toHaveClass("stuic-separator")` confirms tailwind + the client runtime run. No `client`-project plugin fallback needed.
- **⏸️ Open (task 12):** which single hard proof — anchor-position clamp (recommended, guards the `9d8c974` regression) vs focus trap.
- **⏸️ Open (task 13):** `packageManager` field vs pinned pnpm version in the CI action; Node version to pin.

## How to resume (for a fresh conversation)

1. Read this file + [`00-overview-and-roadmap.md`](./00-overview-and-roadmap.md).
2. Pick the next ⬜ task; open its source doc section for the verified detail.
3. Resolve that task's "Open questions" with the owner; record in the Decisions log.
4. On `feat/component-testing`: implement → `pnpm test` (both projects green) → update this file →
   commit when the owner asks (one commit per task).
