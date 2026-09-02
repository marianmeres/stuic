# Component Testing — archived plan

> **ARCHIVED — historical, not current guidance.** See [`docs/_archive/README.md`](../README.md) for why.

> **Archived.** This was the planning set that introduced real-browser component tests to STUIC
> (Vitest 4 Browser Mode + `vitest-browser-svelte` + Playwright/Chromium), produced 2026-06-08
> against the codebase at commit `cc9958b`. The plan was executed: the harness, the project split,
> CI, and the component suite all shipped, and `PROGRESS.md` is closed out apart from two
> deliberately deferred items.
>
> **For how to write a component test today, read
> [`docs/testing-components.md`](../../testing-components.md)** — the conventions doc was promoted
> out of this set and is the live reference. Everything below is provenance: why the stack was
> chosen, what the tiers were, and how the sprint ran.

## Documents

| #   | Doc                                                              | Scope               | Headline                                                                                        |
| --- | ---------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| 00  | [overview-and-roadmap](./00-overview-and-roadmap.md)             | synthesis + roadmap | The stack is the right default; the vitest 3→4 upgrade was the gating prerequisite.             |
| 01  | [framework-setup](./01-framework-setup.md)                       | infra               | Upgrade vitest 4, add a `projects` split (node `server` + browser `client`), route by filename. |
| 03  | [component-coverage-roadmap](./03-component-coverage-roadmap.md) | inventory + tiers   | 74 components split easy / medium / hard; easy tier first, one commit each.                     |
| 04  | [hard-cases-and-e2e](./04-hard-cases-and-e2e.md)                 | hard cases          | Most "hard" components are fine in browser mode; only drag/Milkdown need standalone E2E.        |
| 05  | [ci](./05-ci.md)                                                 | CI                  | One ~30-line GitHub Actions workflow that installs Chromium and runs `pnpm test`.               |
|     | [PROGRESS.md](./PROGRESS.md)                                     | tracker             | Execution log — what was built, in which commit.                                                |

Doc 02 (test conventions) is **not** here; it lives at
[`docs/testing-components.md`](../../testing-components.md).
