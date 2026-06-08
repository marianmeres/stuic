<!--
GENERATED ANALYSIS — @marianmeres/stuic real-browser component testing
Produced 2026-06-08 by multi-agent research → adversarial verify → synthesize.
Claims verified against the codebase at commit cc9958b and the live Vitest 4 /
vitest-browser-svelte docs. Planning artifact; no code was changed.
-->

# Component Testing — @marianmeres/stuic

This directory holds the plan for introducing **real-browser component tests** to STUIC
(Vitest 4 Browser Mode + `vitest-browser-svelte` + Playwright/Chromium). It was produced
2026-06-08 from a research pass over the codebase and the current Svelte/Vitest ecosystem.
It is a **planning artifact — no code has been changed**; every claim is verified against the
repo at commit `cc9958b` or against the live docs cited in each section.

**Start here:** [`00-overview-and-roadmap.md`](./00-overview-and-roadmap.md). Then track and
resume execution from [`PROGRESS.md`](./PROGRESS.md).

## Documents

| # | Doc | Scope | Headline |
|---|-----|-------|----------|
| 00 | [overview-and-roadmap](./00-overview-and-roadmap.md) | synthesis + roadmap | The stack is the right default; vitest 3→4 upgrade is the gating prerequisite. |
| 01 | [framework-setup](./01-framework-setup.md) | infra | Upgrade vitest 4, add a `projects` split (node `server` + browser `client`), route by filename. |
| 02 | [test-conventions](./02-test-conventions.md) | how-to | `render()` + locators + `expect.element`; events are props (spies); snippets via `createRawSnippet`. |
| 03 | [component-coverage-roadmap](./03-component-coverage-roadmap.md) | what to cover | 74 components tiered; warm up on Button/Pill/Switch, one commit per component. |
| 04 | [hard-cases-and-e2e](./04-hard-cases-and-e2e.md) | the hard 30 | Portals/focus-traps/anchor-positioning: one "hard proof" now; standalone Playwright E2E deferred. |
| 05 | [ci](./05-ci.md) | automation | One ~30-line GitHub Actions workflow; install Chromium, run `pnpm test`. |

## How it was produced

Five parallel research agents (test-infra audit, full component inventory, multistep-format
extraction, two independent web-research angles on the stack) → synthesis → live-docs
verification of the exact Vitest 4 config syntax → this plan.

> Nothing here is decided beyond the four clarifying answers recorded in
> [`PROGRESS.md`](./PROGRESS.md) → Decisions log. Each doc's "Open questions / decisions needed"
> lists what still needs a call.
