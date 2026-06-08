<!--
GENERATED ANALYSIS — @marianmeres/stuic real-browser component testing
Produced 2026-06-08 by multi-agent research → adversarial verify → synthesize.
Claims verified against the codebase at commit cc9958b and the live
vitest-browser-svelte docs. Planning artifact; no code was changed.
-->

# Test Conventions

> How to write a STUIC browser component test, and — just as important — **what is worth
> asserting**. The headline: test _behavior the build can't see_ (events fire, bindings update,
> aria/disabled/active states, computed layout), not "does it render" (already gated by
> `svelte-check` + `publint` + the build). Use `render()` → locators → `expect.element`. In Svelte 5
> events are props, so you assert them with spies; snippet children come from `createRawSnippet`.

## Reconciling with `docs/testing.md`

[`docs/testing.md`](../testing.md) currently states the library **deliberately does not** test full
component rendering ("50+ components × prop combinations = slow suite with tiny yield... Rendering is
already gated by svelte-check + publint + the build") and treats interactive/visual behavior as
out of scope.

That reasoning was **correct for what it described and is not actually reversed here** — it just
predates a capability we didn't have:

- "Does it render / compile / export" → still low-yield, still covered by `svelte-check` + `publint` +
  build. We will **not** write tests for that.
- "Does it _behave_" — click handlers, two-way `bind:`, `aria-*`/`disabled`/`active` state, focus
  traps, viewport-clamped anchor positioning (cf. the recent `9d8c974` annotation-clamp fix) — was
  **previously impossible** (node/server build, no DOM, no `$effect`). Browser mode makes it possible,
  and _this_ is the high-yield target.

**Task in the roadmap:** update `docs/testing.md` to add this browser-test layer so the docs aren't
self-contradictory — promote "interactive behavior" from ❌ to ✅-when-it's-a-real-contract, and point
to this directory. (See [`PROGRESS.md`](./PROGRESS.md), sprint task.)

## File naming & location

- One test per component, **co-located** next to the `.svelte` file (matches the existing co-located
  style, e.g. `Input/phone-validation.test.ts`).
- Name it `ComponentName.svelte.test.ts` — the `.svelte.test.ts` suffix is what routes it into the
  browser `client` project (see [01](./01-framework-setup.md)). A plain `*.test.ts` next to a
  component stays in the fast node project (correct for extracted pure logic like `_internal/*.ts`).

## The canonical test

```ts
// src/lib/components/Pill/Pill.svelte.test.ts
import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Pill from "./Pill.svelte";

test("renders label and applies intent", async () => {
	const screen = render(Pill, { label: "Beta", intent: "primary" });
	const pill = screen.getByText("Beta");
	await expect.element(pill).toBeVisible();
	await expect.element(pill).toHaveAttribute("data-intent", "primary");
});

test("dismiss button fires ondismiss", async () => {
	const ondismiss = vi.fn();
	const screen = render(Pill, { label: "Beta", ondismiss });
	await screen.getByRole("button", { name: /dismiss/i }).click();
	expect(ondismiss).toHaveBeenCalledOnce();
});
```

Key facts (verified against the `vitest-browser-svelte` README):

- `render(Component, props)` returns a **screen** object with Playwright-style locator methods
  (`getByRole`, `getByText`, `getByLabelText`, …). `render` is imported from `"vitest-browser-svelte"`.
- **`expect.element(locator)` auto-retries** — it polls the DOM until the assertion passes or times
  out (`testTimeout`, set to 2000ms in our config). Prefer it over reading values synchronously; it
  removes the need for `act`/manual `tick()` for in-component reactivity.
- `.click()`, `.fill()`, etc. are awaited interactions on a locator.
- **No `@testing-library`, no `act`.** `vitest-browser-svelte` intentionally omits `act`.

## Events are props (Svelte 5)

There are no `component.$on` listeners in Svelte 5 — events are callback props (`onclick`,
`onchange`, and STUIC's own `ondismiss`, `onLogout`, etc.). Assert them by passing a spy:

```ts
const onclick = vi.fn();
render(Button, { onclick, children: text("Save") });
await screen.getByRole("button").click();
expect(onclick).toHaveBeenCalledOnce();
```

## Snippet props (`children`, `header`, etc.)

Many STUIC components take snippet props (`children`, header/footer snippets). A `.svelte.test.ts`
file can't contain markup, so build snippets with `createRawSnippet`:

```ts
import { createRawSnippet } from "svelte";

// tiny helper for static text children — keep it in a shared test util
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

render(Button, { children: text("Click me") });
```

For complex snippet scenarios (a snippet that itself renders a STUIC component, takes args, etc.),
the escape hatch is a **fixture component**: a small `ComponentName.fixture.svelte` next to the test
that composes the real component with markup, then `render(Fixture, props)`. Prefer `createRawSnippet`
for the common case; reach for a fixture only when markup composition is the thing under test.

## Two-way binding (`bind:value`, `bind:checked`)

To assert that user interaction updates bound state, render a fixture that binds the prop to local
state and exposes it, **or** assert the observable DOM proxy (e.g. the hidden `<input>`'s `checked`
for `Switch`, the `<input>`'s `value` for `FieldInput`). Default to asserting the DOM — it's what a
consumer observes — and use a fixture only when you must read the bound JS value directly.

## What to assert (the high-yield checklist)

For each component, prefer these over snapshot dumps:

1. **Prop → DOM contract** — `intent`/`variant`/`size` → `data-*` attribute or class; `href` → renders
   `<a>` vs `<button>`; `disabled` → the `disabled` attribute / blocked clicks.
2. **Events** — the right callback fires once, with the right argument, and `disabled` suppresses it.
3. **Binding** — interaction updates the value/checked state.
4. **A11y** — `role`, `aria-*`, label association, focus order where it's a contract.
5. **Computed layout** (browser-only superpower) — width from a `progress` value, viewport clamping
   of anchor-positioned elements, focus actually trapped. These are exactly what jsdom returns zeros
   for, and what regressed in recent commits.

Avoid: asserting exact class strings (brittle — assert the `data-*` contract or a single meaningful
class), and snapshotting full HTML (self-closing-tag / class-order differences make them noisy).

## Cleanup gotcha

`vitest-browser-svelte` cleans up **before** each test, not after — so the last rendered component
stays on screen for debugging. Import from `vitest-browser-svelte/pure` to opt out of auto-cleanup
when a test needs to manage it manually. Rarely needed.

## Timing / flakiness

Rely on `expect.element` retries and awaited locator actions — **never fixed `sleep`s**. In-component
reactivity resolves through the retry loop; only assertions on _external_ universal state living in a
`*.svelte.ts` module may need `flushSync()` from `svelte`.

## Open questions / decisions needed

- **Shared test utilities** — agree on one home for the `text()` snippet helper and any future
  fixtures (suggest `src/lib/test-utils/` or `src/test-helpers.ts`), so it's not redefined per file.
  Decide when the second snippet-needing component lands.
