<!--
GENERATED ANALYSIS — @marianmeres/stuic real-browser component testing
Produced 2026-06-08 by multi-agent research → adversarial verify → synthesize.
Claims verified against the codebase at commit cc9958b and the live Vitest 4 docs.
Planning artifact; no code was changed.
-->

# Framework Setup

> This is the infrastructure dimension: the one-time work that turns "no DOM, no `$effect`"
> into a working browser test harness. The single most important takeaway: **a Vitest
> `projects` split routed by filename** (`*.test.ts` → fast node, `*.svelte.test.ts` → real
> browser) keeps the 9 existing suites untouched while adding component tests on top. The one
> hard prerequisite is a **vitest 3 → 4 major upgrade** — `vitest-browser-svelte@^2` peer-requires
> `vitest ^4`, and Browser Mode only became *stable* in Vitest 4.

## Current state (verified at `cc9958b`)

- **Package manager:** pnpm. **Svelte:** 5.56.2. **SvelteKit:** 2.63.0 (adapter-auto). **Vitest:** 3.2.6.
- **Test config:** none dedicated. Vitest is configured only implicitly through
  [`vite.config.ts`](../../vite.config.ts) (`plugins: [tailwindcss(), sveltekit()]`), and the
  script is `"test": "vitest --dir src/"`.
- **What runs today:** 9 suites / ~59 tests, all **node environment, pure logic** — validation
  helpers, stack classes (`NotificationsStack`, `AlertConfirmPromptStack`), `tr`, `replace-map`,
  `storage-abstraction`, `checkout-utils`, `max-height`, `phone-validation`. Zero component tests.
- **Why components can't be tested today:** the `@sveltejs/kit/vite` plugin makes Vitest resolve
  Svelte's **server (SSR) build** in node, so components render as strings and `$effect` / actions /
  lifecycle never run (documented in project memory; an `$effect.root` + `flushSync` probe left the
  effect body unrun even with `resolve.conditions: ['browser']`). Real-browser mode fixes this by
  resolving the **client build** and running in an actual Chromium page.
- **No CI** (`.github/` absent). No browser-testing deps installed.

## Target state

A two-project Vitest config. Tests are routed purely by filename:

| Project | Environment | Matches | Runs |
|---------|-------------|---------|------|
| `server` | `node` | `src/**/*.test.ts` (excl. `*.svelte.test.ts`) | the existing 9 pure-logic suites — unchanged, fast |
| `client` | real browser (Chromium via Playwright) | `src/**/*.svelte.test.ts` | new component tests with DOM, `$effect`, layout, focus |

## Step 1 — Upgrade Vitest 3 → 4 (own commit, gating)

```bash
pnpm add -D vitest@^4
pnpm test          # confirm the 9 existing suites still pass before touching anything else
```

Vitest 4 breaking changes that touch this repo (budget for them):

1. **Browser providers are separate packages now** — there is no built-in `@vitest/browser` provider; you install `@vitest/browser-playwright` (Step 2).
2. **Browser context import moved** — `@vitest/browser/context` → `vitest/browser` (only matters if/when we import `page`, `userEvent`, etc. directly; not needed for the basics).
3. `test.workspace` is deprecated in favour of `test.projects` (we use `projects` from the start).

> **Risk:** an incidental break in the 9 node suites during the bump. Mitigation: this is its own
> commit; if `pnpm test` regresses, fix or revert before any browser work. Verify against
> `@sveltejs/vite-plugin-svelte@6.2.4` and `@tailwindcss/vite` — both are Vite-7-era and compatible
> with Vitest 4, but confirm the dev server (`pnpm dev`) and `pnpm build` still work after the bump.

## Step 2 — Add browser deps + Chromium

```bash
pnpm add -D @vitest/browser-playwright vitest-browser-svelte playwright
pnpm exec playwright install chromium     # without this, browser tests fail: "No browsers found"
```

We do **not** install `@vitest/browser` directly (pulled in transitively by the provider), and we
do **not** need `@testing-library/svelte` or `@testing-library/jest-dom` — `vitest-browser-svelte`'s
`render()` + `expect.element` replace both.

## Step 3 — The `projects` config

Add a `test` block to [`vite.config.ts`](../../vite.config.ts) (keep the file; just extend it).
Verified against the live Vitest 4 docs (`provider: playwright()` is an imported **function**, not
the old `'playwright'` string; `instances` is required):

```ts
/// <reference types="node" />
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: parseInt(process.env.DEV_PORT || "8886"),
		host: true,
	},
	test: {
		projects: [
			{
				extends: true, // inherit root plugins (tailwind + sveltekit)
				test: {
					name: "server",
					environment: "node",
					include: ["src/**/*.test.ts"],
					exclude: ["src/**/*.svelte.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "client",
					include: ["src/**/*.svelte.test.ts"],
					setupFiles: ["vitest-browser-svelte"],
					testTimeout: 2000,
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
```

Why this shape:

- **`extends: true`** makes each project inherit the root `plugins` array, so both the `tailwindcss()`
  (component CSS / variant classes resolve — several STUIC components assert on variant/size class
  output) and `sveltekit()` plugins apply. In the `client` project Vitest builds for the browser, so
  the **client** Svelte build is used and `$effect`/actions run — the exact thing the node setup can't do.
- **The filename glob is the routing mechanism** and the single most important config decision. Note
  `src/**/*.test.ts` *also* matches `foo.svelte.test.ts` (it ends in `.test.ts`), so the server
  project's `exclude` is **required**, not optional.
- **`setupFiles: ['vitest-browser-svelte']`** is the entire setup — it registers auto-cleanup and
  helpers. Browser mode eliminates the 60–250-line jsdom API-mock setup files older guides used.
- **`headless: true`** for CI; drop it (or `--browser.headless=false`) locally to watch tests run.

## Step 4 — Update the test scripts

`--dir src/` is now redundant (the `include` globs scope each project). Suggested:

```jsonc
"test":       "vitest run",   // one-shot, used by CI
"test:watch": "vitest",       // watch mode for local dev
"test:ui":    "vitest --ui"   // optional: the Vitest UI, handy for browser tests
```

`pnpm test` then runs **both** projects (node + browser) in one command.

## Step 5 — Smoke test (prove the harness before writing real tests)

Create one trivial browser test — e.g. `src/lib/components/Separator/Separator.svelte.test.ts`
that renders `<Separator />` and asserts it's in the document. If it goes green, the client build +
Chromium + tailwind + sveltekit-plugin chain all work. **This is where the project-memory
"server-build" risk is actually disproven or confirmed** — treat a passing smoke test as the gate to
the rest of the plan.

## Open questions / decisions needed

- **Config location** — keep it in `vite.config.ts` (recommended, minimal change; chosen here) vs a
  dedicated `vitest.config.ts`. Purely organizational; nothing functional depends on it.
- **`@sveltejs/kit/vite` vs plain `@sveltejs/vite-plugin-svelte` in the `client` project** — the
  SvelteKit plugin should be fine in browser mode (the `sv` CLI's own vitest add-on uses it), but if
  the smoke test surfaces SSR/`$lib` alias issues, the fallback is to give the `client` project a
  plain `svelte()` plugin instead of inheriting `sveltekit()`. Decide only if the smoke test fails.
