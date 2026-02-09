# STUIC - Agent Guide

> Svelte 5 + Tailwind CSS v4 component library with centralized design tokens.

---

## Quick Reference

| | Command |
|---|---------|
| **Dev** | `npm run dev` |
| **Build** | `npm run build` |
| **Test** | `npm run test` |
| **Check** | `npm run check` |
| **Lint** | `npm run lint` |
| **Format** | `npm run format` |

**Stack:** Svelte 5 (runes) · Tailwind CSS v4 · SvelteKit (library mode) · Vite

---

## Project Structure

```
src/lib/
├── components/     # 36 UI components
├── actions/        # 12 Svelte actions
├── utils/          # 42 utility functions
├── themes/         # 26 theme definitions (.ts) + generated CSS (css/)
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

### CSS Variable Pattern

```
--stuic-{component}-{element?}-{property}-{state?}
```

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
- [Components](./docs/domains/components.md) — 36 components, Props pattern, snippets
- [Theming](./docs/domains/theming.md) — CSS tokens, dark mode, themes
- [Actions](./docs/domains/actions.md) — 12 Svelte directives
- [Utils](./docs/domains/utils.md) — 42 utility functions

### Reference
- [Design Tokens Manual](./docs/DESIGN_TOKENS_MANUAL.md) — Token philosophy
- [Tailwind v4 Variables](./docs/TAILWIND_V4_CSS_VARIABLES.md) — CSS variable reference

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/index.css` | CSS entry point |
| `src/lib/index.ts` | JS entry point |
| `src/lib/utils/design-tokens.ts` | Theme types + CSS generation (`ThemeSchema`, `generateThemeCss`, etc.) |
| `src/lib/themes/*.ts` | Theme definitions (26 themes, `TokenSchema`-typed) |
| `src/lib/themes/css/stone.css` | Default theme (generated) |
| `src/lib/components/Button/` | Reference component |
| `scripts/generate-theme.ts` | CLI: `pnpm run build:theme:all` |

---

## Svelte MCP Server

You have access to the Svelte MCP server providing comprehensive Svelte 5 documentation.
This is a **component library**, not a SvelteKit application — skip SvelteKit-specific guidance (routing, load functions, hooks, adapters, etc.).

### Available Tools
1. **list-sections**: Call FIRST to discover available documentation sections.
2. **get-documentation**: Fetch full docs for specific sections (runes, lifecycle, snippets, etc.).
3. **svelte-autofixer**: Validate Svelte code for correctness — always run before finalizing component changes.
4. **playground-link**: Generate a Svelte Playground link — only after user confirms they want one.
