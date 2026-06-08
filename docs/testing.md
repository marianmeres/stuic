# Testing

STUIC has a **small, focused test suite** that's intentionally narrow. This doc explains what we test, what we don't, and how to add a new test.

## Philosophy

This is a component library. Most of its correctness guarantees come from:

1. **TypeScript + `svelte-check`** — API contracts, prop types, snippet shapes.
2. **`publint`** — package export hygiene.
3. **The build** — every component compiles, every export resolves.
4. **Manual/visual review** — styling, animation, keyboard interaction, a11y cues.

Tests are for what those tools can't see. There are **two layers**, split by filename:

- **`*.test.ts` — node, fast.** Pure deterministic logic where a regression silently corrupts data.
- **`*.svelte.test.ts` — real browser (Chromium).** Component _behavior_ the build can't see: events firing, two-way `bind:`, `aria`/`disabled`/`active` state, focus traps, computed layout/positioning.

We still explicitly don't try to test everything. The browser layer targets **behavior contracts**, not "does it render" — see [`component-testing/`](./component-testing/) for the strategy, roadmap, and how-to.

## What we test

### ✅ High value

- **Validation helpers** — `validateEmail`, `validateAddress`, `validateCustomerForm`, `validateLoginForm`, `validatePhoneNumber`, `addressesEqual`.
- **State-machine classes** — `NotificationsStack`, `AlertConfirmPromptStack`, `SwitchState`, `InputHistory`. Tri-state transitions, dedupe, ordering, cleanup semantics.
- **Pure utilities** — `replace-map`, `tr`, `storage-abstraction`, and anything else with non-trivial input/output logic.
- **Component behavior** (browser mode, `*.svelte.test.ts`) — prop→DOM/`aria` contracts, events firing, `bind:` updates, focus traps, viewport-clamped positioning. One component at a time, asserting contracts a consumer relies on — not every prop permutation.

### ⚠️ Maybe, if motivated by a regression

- **Logic extracted from a `.svelte` into a sibling `_internal/*.ts`** — once extracted, same rules as utilities apply. (Examples that would be good candidates if we ever extract them: Tree's `calcDropPosition()` and `isDescendantOf()`, CronInput's `cronToHuman()` and `fieldsToExpression()`.)

### ❌ We don't test

- **Exhaustive prop-matrix / "does it render" tests.** 50+ components × every prop combination = slow suite with tiny yield. Rendering is already gated by `svelte-check` + `publint` + the build; the browser layer asserts _behavior contracts_, not coverage of every permutation.
- **Visual regression**. A separate concern (Vitest's `toMatchScreenshot` / screenshot diffing) — deferred, not part of `pnpm test` today.
- **Heavy gestures & 3rd-party editors** (drag-drop reorder, file drop, Milkdown/CodeMirror) — deferred to a future standalone Playwright **E2E** layer, not the in-repo browser project. Extract and node-test their pure logic where practical.
- **Coverage % targets**. They're the wrong goal for a component library.

## Running tests

```bash
pnpm test          # both projects (node + browser), one-shot
pnpm test:watch    # watch mode
pnpm test:ui       # Vitest UI (handy for the browser project)
```

Vitest runs **two projects**, routed by filename: a node project for `*.test.ts` and a real-browser
(Chromium, via Playwright) project for `*.svelte.test.ts`. Tests live next to the code they test:
`foo.ts` → `foo.test.ts`; `Foo.svelte` → `Foo.svelte.test.ts`. The browser binary is installed once
with `pnpm exec playwright install chromium`.

## Writing a test

Match the style of existing tests — plain `vitest` with `assert`, no test framework wrapper ceremony.

```ts
// src/lib/utils/my-thing.test.ts
import { assert, test } from "vitest";
import { myThing } from "./my-thing.js";

test("myThing handles the empty case", () => {
	assert.equal(myThing(""), null);
});

test("myThing handles the happy path", () => {
	assert.equal(myThing("foo"), "FOO");
});
```

For things that take a `TranslateFn`, inject an identity stub so the output is just the key:

```ts
import type { TranslateFn } from "$lib/types.js";
const t: TranslateFn = (k) => k;
```

For **component** tests (`*.svelte.test.ts`), the patterns differ — `render()` from
`vitest-browser-svelte`, locators, and the retry-able `expect.element`; events are props (assert with
spies); snippet children come from `createRawSnippet`. See
[`component-testing/02-test-conventions.md`](./component-testing/02-test-conventions.md) for the full
how-to and the "what to assert" checklist.

## When in doubt

- **Logic in a `.ts` file with clear input/output?** Write a `*.test.ts`.
- **A component behavior that's a real contract** (event fires, value binds, focus traps, position
  clamps)? Write a `*.svelte.test.ts`.
- **A regression just bit you in production?** Write a test for that specific case before fixing.
- **"Does it render with these 12 props?"** Probably don't bother — the build already covers that.
