# Testing

STUIC has a **small, focused test suite** that's intentionally narrow. This doc explains what we test, what we don't, and how to add a new test.

## Philosophy

This is a component library. Most of its correctness guarantees come from:

1. **TypeScript + `svelte-check`** — API contracts, prop types, snippet shapes.
2. **`publint`** — package export hygiene.
3. **The build** — every component compiles, every export resolves.
4. **Manual/visual review** — styling, animation, keyboard interaction, a11y cues.

Unit tests are for what those tools can't see: **pure deterministic logic where a regression silently corrupts data**. We explicitly don't try to test everything.

## What we test

### ✅ High value

- **Validation helpers** — `validateEmail`, `validateAddress`, `validateCustomerForm`, `validateLoginForm`, `validatePhoneNumber`, `addressesEqual`.
- **State-machine classes** — `NotificationsStack`, `AlertConfirmPromptStack`, `SwitchState`, `InputHistory`. Tri-state transitions, dedupe, ordering, cleanup semantics.
- **Pure utilities** — `replace-map`, `tr`, `storage-abstraction`, and anything else with non-trivial input/output logic.

### ⚠️ Maybe, if motivated by a regression

- **Logic extracted from a `.svelte` into a sibling `_internal/*.ts`** — once extracted, same rules as utilities apply. (Examples that would be good candidates if we ever extract them: Tree's `calcDropPosition()` and `isDescendantOf()`, CronInput's `cronToHuman()` and `fieldsToExpression()`.)

### ❌ We don't test

- **Full component rendering** via `@testing-library/svelte`. 50+ components × prop combinations = slow suite with tiny yield. Rendering is already gated by `svelte-check` + `publint` + the build.
- **Visual regression**. That's a separate project (Playwright + screenshot diffing) — not part of `vitest --dir src/`.
- **Interactive behavior** (keyboard nav, drag-drop, scroll snap) unless the underlying math is extracted to a pure function.
- **Coverage % targets**. They're the wrong goal for a component library.

## Running tests

```bash
pnpm run test
```

Vitest is configured to run everything under `src/`. Tests live next to the code they test: `foo.ts` → `foo.test.ts`.

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

## When in doubt

- **Logic in a `.ts` file with clear input/output?** Write a test.
- **A regression just bit you in production?** Write a test for that specific case before fixing.
- **Anything else?** Probably don't bother.
