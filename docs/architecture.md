# Architecture

System design and structure of STUIC.

---

## Overview

STUIC is a Svelte 5 component library with centralized CSS theming via custom properties. Components are unstyled by default when `unstyled` prop is true.

---

## Three-Layer Styling System

```
Layer 1: Theme Tokens (--stuic-color-*)
    ↓
Layer 2: Component Tokens (--stuic-{component}-*)
    ↓
Layer 3: Internal Vars (--_bg, --_text, --_border)
```

**Layer 1 - Theme Tokens:** Global design tokens defining colors, defined in theme files (`src/lib/themes/css/`).

**Layer 2 - Component Tokens:** Component-specific customization points, defined in component `index.css` files.

**Layer 3 - Internal Vars:** Private variables set by intent/variant selectors, used in base styles.

---

## Component Map

```
src/lib/
├── components/           # 35 UI components
│   └── {Name}/
│       ├── {Name}.svelte     # Main component
│       ├── index.ts          # Exports
│       ├── index.css         # CSS tokens (if styled)
│       └── README.md         # Documentation
│
├── actions/              # 12 Svelte actions
│   ├── *.svelte.ts           # Reactive actions
│   ├── *.ts                  # Traditional actions
│   └── index.ts              # Barrel export
│
├── utils/                # 45+ utility functions
│   ├── *.svelte.ts           # Reactive utilities
│   ├── *.ts                  # Pure functions
│   └── index.ts              # Barrel export
│
├── themes/
│   └── css/              # 26 theme files
│       └── stone.css         # Default theme
│
├── icons/                # Icon re-exports
│
├── index.css             # CENTRALIZED CSS imports
└── index.ts              # Main barrel export
```

---

## CSS Import Architecture

**Critical:** All component CSS is centralized in `src/lib/index.css` to prevent race conditions with barrel exports.

```css
/* src/lib/index.css */

/* Theme tokens first */
@import "./themes/css/stone.css";

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

| Package | Purpose |
|---------|---------|
| `tailwind-merge` | CSS class conflict resolution |
| `runed` | Svelte 5 reactive utilities |
| `esm-env` | Environment detection |
| `@marianmeres/icons-fns` | Icon SVG generation |
| `@marianmeres/item-collection` | Collection management |
| `@marianmeres/ticker` | Animation timing |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/index.css` | CSS entry point (import this) |
| `src/lib/index.ts` | JS entry point (barrel export) |
| `src/lib/themes/css/stone.css` | Default theme |
| `src/lib/utils/tw-merge.ts` | Tailwind class merging |
| `src/lib/utils/design-tokens.ts` | Token generation helpers |

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
└── themes/css/           # Theme CSS files
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
