# STUIC - Agent Guide

> Svelte 5 + Tailwind CSS v4 component library with centralized design tokens.

---

## Quick Reference

|            | Command          |
| ---------- | ---------------- |
| **Dev**    | `npm run dev`    |
| **Build**  | `npm run build`  |
| **Test**   | `npm run test`   |
| **Check**  | `npm run check`  |
| **Lint**   | `npm run lint`   |
| **Format** | `npm run format` |

**Stack:** Svelte 5 (runes) · Tailwind CSS v4 · SvelteKit (library mode) · Vite

---

## Project Structure

```
src/lib/
├── components/     # 50 UI components
├── actions/        # 15 Svelte actions
├── utils/          # 43 utility modules
├── themes/         # Generated theme CSS (css/) — definitions from @marianmeres/design-tokens
├── icons/          # Icon re-exports
├── index.css       # Centralized CSS imports
└── index.ts        # Main exports
```

---

## Critical Conventions

### DO NOT

1. Use abbreviated CSS var names (`--stuic-lib-bg` wrong → `--stuic-list-item-button-bg`)
2. Use `-dark` suffix (use `:root.dark {}` selector instead)
3. Put state before property (`--stuic-button-hover-bg` wrong → `--stuic-button-bg-hover`)
4. Use Svelte 4 syntax (`export let`, `$:`) — use runes (`$props()`, `$derived()`)
5. Create components without `unstyled`, `class`, `el` props
6. Use `dark:` Tailwind prefix when CSS vars handle dark mode
7. Import CSS inside components — centralize in `src/lib/index.css`
8. Declare component tokens at `:root` that reference shared structural tokens (use fallback pattern instead)

### CSS Variable Pattern

```
--stuic-{component}-{element?}-{property}-{state?}
```

### Shared Structural Tokens

Global tokens that control cross-component visual properties. Defined in `src/lib/index.css`:

| Token                      | Default              | Purpose                                       |
| -------------------------- | -------------------- | --------------------------------------------- |
| `--stuic-radius`           | `var(--radius-md)`   | Element-level radius (inputs, badges, list items) |
| `--stuic-radius-button`    | `var(--radius-md)`   | Button-specific radius (independent from general elements) |
| `--stuic-radius-container` | `var(--radius-lg)`   | Container-level radius (cards, modals, dropdowns) |
| `--stuic-shadow`           | `var(--shadow-sm)`   | Default resting shadow                        |
| `--stuic-shadow-hover`     | `var(--shadow-md)`   | Hover/elevated shadow                         |
| `--stuic-shadow-overlay`   | `var(--shadow-lg)`   | Overlays (dropdowns, notifications)           |
| `--stuic-shadow-dialog`    | `var(--shadow-xl)`   | Dialogs/modals                                |
| `--stuic-border-width`     | `1px`                | Default border width                          |
| `--stuic-transition`       | `150ms`              | Default transition duration                   |

**When creating new components**, use the fallback pattern at CSS usage sites:

```css
/* CORRECT: fallback resolved at element level — scoped overrides work */
.stuic-my-component {
    border-radius: var(--stuic-my-component-radius, var(--stuic-radius));
    box-shadow: var(--stuic-my-component-shadow, var(--stuic-shadow));
    border-width: var(--stuic-my-component-border-width, var(--stuic-border-width));
    transition: background var(--stuic-my-component-transition, var(--stuic-transition));
}
```

```css
/* WRONG: :root declarations resolve eagerly — scoped overrides on child elements are ignored */
:root {
    --stuic-my-component-radius: var(--stuic-radius); /* DO NOT DO THIS */
}
```

**Element vs Container classification:**
- **Element** (`--stuic-radius`): inputs, badges, list items, checkboxes, tabs — interactive controls
- **Button** (`--stuic-radius-button`): buttons, button groups — allows rounded buttons even with flat elements
- **Container** (`--stuic-radius-container`): cards, modals, dropdowns, notifications, accordions — content wrappers

---

## Before Making Changes

- [ ] Check existing patterns in similar components
- [ ] Follow centralized CSS import pattern
- [ ] Run `npm run build` to verify
- [ ] Test both light and dark modes
- [ ] Verify `--stuic-color-primary` changes cascade

---

## Documentation Index

### Core Docs

- [Architecture](./docs/architecture.md) — System design, data flow
- [Conventions](./docs/conventions.md) — Code standards, patterns
- [Tasks](./docs/tasks.md) — Common procedures

### Domain Docs

- [Components](./docs/domains/components.md) — 46 component directories, Props pattern, snippets
- [Theming](./docs/domains/theming.md) — CSS tokens, dark mode, themes
- [Actions](./docs/domains/actions.md) — 15 Svelte directives
- [Utils](./docs/domains/utils.md) — 43 utility modules

### Reference

- [Design Tokens Manual](./docs/DESIGN_TOKENS_MANUAL.md) — Token philosophy
- [Tailwind v4 Variables](./docs/TAILWIND_V4_CSS_VARIABLES.md) — CSS variable reference

---

## Key Files

| File                             | Purpose                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/index.css`              | CSS entry point                                                        |
| `src/lib/index.ts`               | JS entry point                                                         |
| `src/lib/utils/design-tokens.ts` | Re-exports from `@marianmeres/design-tokens`                          |
| `src/lib/themes/css/stone.css`   | Default theme (generated from `@marianmeres/design-tokens/themes`)     |
| `src/lib/components/Button/`     | Reference component                                                    |
| `scripts/generate-theme.ts`      | CLI: `pnpm run build:theme:all`                                        |

---

## Svelte MCP Server

You have access to the Svelte MCP server providing comprehensive Svelte 5 documentation.
This is a **component library**, not a SvelteKit application — skip SvelteKit-specific guidance (routing, load functions, hooks, adapters, etc.).

### Available Tools

1. **list-sections**: Call FIRST to discover available documentation sections.
2. **get-documentation**: Fetch full docs for specific sections (runes, lifecycle, snippets, etc.).
3. **svelte-autofixer**: Validate Svelte code for correctness — always run before finalizing component changes.
4. **playground-link**: Generate a Svelte Playground link — only after user confirms they want one.
