# Architecture

System design and structure of STUIC.

---

## Overview

STUIC is a Svelte 5 component library with centralized CSS theming via custom properties. Components are unstyled by default when `unstyled` prop is true.

---

## Four-Layer Styling System

```
Layer 1: Theme Tokens         (--stuic-color-*)
    ↓
Layer 2: Structural Tokens    (--stuic-radius, --stuic-shadow, --stuic-border-width, --stuic-transition)
    ↓ (used as fallbacks)
Layer 3: Component Tokens     (--stuic-{component}-*)
    ↓
Layer 4: Internal Vars        (--_bg, --_text, --_border)
```

**Layer 1 - Theme Tokens:** Global design tokens defining colors, provided by `@marianmeres/design-tokens/css/`. Includes intent colors (`primary`, `accent`, `destructive`, `warning`, `success`), surface intents (15%/30% color-mix tints), and role colors (`background`, `surface`, `muted`, `foreground`, `border`, `input`, `ring`).

**Layer 2 - Structural Tokens:** Shared cross-component visuals defined in `src/lib/index.css`. Override these to reshape the entire library at once (e.g., a brutalist "no radius / no shadow / no border" pass). See [Conventions § Shared Structural Tokens](./conventions.md).

**Layer 3 - Component Tokens:** Component-specific customization points, defined in component `index.css` files. Reference structural tokens as fallbacks at usage sites (NOT at `:root`) so per-instance scoped overrides remain possible.

**Layer 4 - Internal Vars:** Private variables (`--_*`) set by intent/variant/size selectors and consumed in base styles.

---

## Component Map

```
src/lib/
├── components/           # 57 component directories
│   └── {Name}/
│       ├── {Name}.svelte     # Main component
│       ├── index.ts          # Exports
│       ├── index.css         # CSS tokens (if styled)
│       └── README.md         # Documentation
│
├── actions/              # 15 Svelte actions
│   ├── *.svelte.ts           # Reactive actions
│   ├── *.ts                  # Traditional actions
│   └── index.ts              # Barrel export
│
├── utils/                # 44 utility modules
│   ├── *.svelte.ts           # Reactive utilities
│   ├── *.ts                  # Pure functions
│   └── index.ts              # Barrel export
│
├── icons/                # Icon re-exports from @marianmeres/icons-fns
│
├── index.css             # CENTRALIZED CSS imports
└── index.ts              # Main barrel export
```

---

## CSS Import Architecture

**Critical:** All component CSS is centralized in `src/lib/index.css` to prevent race conditions with barrel exports.

```css
/* src/lib/index.css */

/* Theme tokens first (from @marianmeres/design-tokens) */
@import "@marianmeres/design-tokens/css/stone.css";

/* Component CSS in deterministic order */
@import "./components/Button/index.css";
@import "./components/Modal/index.css";
@import "./components/Input/index.css";
/* ... all component CSS ... */
```

**DO NOT** use `import './index.css'` inside component `.svelte` files.

---

## Data Flow

```
Props → Component → Data Attributes → CSS Selectors
```

1. Props define intent, variant, size
2. Component sets data attributes on DOM element
3. CSS uses attribute selectors for styling

```svelte
<!-- Component -->
<button
  data-intent={intent}
  data-variant={variant}
  data-size={size}
>
```

```css
/* CSS */
.stuic-button[data-intent="primary"][data-variant="solid"] {
	--_bg: var(--stuic-color-primary);
}
```

---

## External Dependencies

| Package                        | Purpose                       |
| ------------------------------ | ----------------------------- |
| `tailwind-merge`               | CSS class conflict resolution |
| `runed`                        | Svelte 5 reactive utilities   |
| `@marianmeres/icons-fns`       | Icon SVG generation           |
| `@marianmeres/item-collection` | Collection management         |
| `@marianmeres/ticker`          | Animation timing              |

---

## Key Files

| File                             | Purpose                                                                     |
| -------------------------------- | --------------------------------------------------------------------------- |
| `src/lib/index.css`              | CSS entry point (import this)                                               |
| `src/lib/index.ts`               | JS entry point (barrel export)                                              |
| `@marianmeres/design-tokens/css/stone.css` | Default theme (42 themes available)                               |
| `src/lib/utils/tw-merge.ts`      | Tailwind class merging                                                      |
| `src/lib/utils/design-tokens.ts` | Theme types (`ThemeSchema`, `ColorPair`, etc.) and CSS generation functions |

---

## Build Output

```
dist/
├── index.js              # Main barrel export
├── index.d.ts            # TypeScript definitions
├── index.css             # Compiled CSS
├── components/           # Individual component modules
├── actions/              # Individual action modules
├── utils/                # Individual utility modules
```

Theme CSS files are provided by the `@marianmeres/design-tokens` package (a regular dependency).

### Package Exports

```json
".":            Main entry (components, utils, actions, icons, theme types)
```

---

## Security Boundaries

- No external API calls
- No user data persistence (localStorage utils are opt-in)
- No cookies or tracking
- Pure UI components with no side effects

---

## Related Documentation

- [Conventions](./conventions.md) - Code standards
- [Tasks](./tasks.md) - Common procedures
- [Components](./domains/components.md) - Component patterns
- [Theming](./domains/theming.md) - CSS token system
