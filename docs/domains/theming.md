# Theming Domain

## Overview

Centralized design token system using CSS custom properties. 26 pre-built themes available.

See also: [Design Tokens Manual](../DESIGN_TOKENS_MANUAL.md) for token philosophy.

---

## Token Schema

### Intent Colors (5 types)

Each intent has 6 variants:

```
--stuic-color-{intent}                    # Base color
--stuic-color-{intent}-hover              # Hover state
--stuic-color-{intent}-active             # Active/pressed state
--stuic-color-{intent}-foreground         # Text on base
--stuic-color-{intent}-foreground-hover   # Text on hover
--stuic-color-{intent}-foreground-active  # Text on active
```

**Intents:** `primary`, `accent`, `destructive`, `warning`, `success`

### Surface Intent Colors (auto-generated)

Soft backgrounds for callouts/alerts, derived via `color-mix()`:

```
--stuic-color-surface-{intent}            # 15% tint of intent
--stuic-color-surface-{intent}-foreground # Contrast text
--stuic-color-surface-{intent}-border     # 30% tint border
```

### Role Colors

**Paired (with foreground variants):**

| Token                      | Purpose                           |
| -------------------------- | --------------------------------- |
| `--stuic-color-background` | Page background                   |
| `--stuic-color-surface`    | Raised containers (cards, modals) |
| `--stuic-color-surface-1`  | Deeper surface level              |
| `--stuic-color-muted`      | De-emphasized elements            |

Each has: `-foreground`, `-hover`, `-active` variants.

**Single:**

| Token                      | Purpose                |
| -------------------------- | ---------------------- |
| `--stuic-color-foreground` | Default text color     |
| `--stuic-color-border`     | Default borders        |
| `--stuic-color-input`      | Form field backgrounds |
| `--stuic-color-ring`       | Focus ring color       |

Each has: `-hover`, `-active` variants.

---

## Dark Mode

Define in `:root.dark {}` selector. **No `-dark` suffix on variable names.**

```css
/* Light mode */
:root {
	--stuic-color-background: var(--color-stone-50);
	--stuic-color-foreground: var(--color-stone-900);
}

/* Dark mode */
:root.dark {
	--stuic-color-background: var(--color-stone-900);
	--stuic-color-foreground: var(--color-stone-50);
}
```

Enable dark mode by adding `class="dark"` to `<html>` element.

---

## color-mix() Usage

Surface intent colors use CSS `color-mix()` for derived values:

```css
--stuic-color-surface-primary: color-mix(
	in srgb,
	var(--stuic-color-primary) 15%,
	var(--stuic-color-background)
);

--stuic-color-surface-primary-border: color-mix(
	in srgb,
	var(--stuic-color-primary) 30%,
	var(--stuic-color-background)
);
```

This ensures semantic relationships across all themes.

---

## Exported Types & Functions

Consumer-facing theme API from `@marianmeres/stuic`:

| Export                                      | Kind     | Description                                                        |
| ------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `TokenSchema`                               | type     | Core schema interface for a single mode (light or dark)            |
| `ThemeSchema`                               | type     | `{ light: TokenSchema; dark?: TokenSchema }`                       |
| `ColorPair`                                 | type     | Paired color with foreground (used for intents, paired roles)      |
| `ColorValue`                                | type     | Color with optional hover/active states                            |
| `SingleColor`                               | type     | `string \| ColorValue` (used for single role colors)               |
| `IntentColorKey`                            | type     | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` |
| `RolePairedKey`                             | type     | `"background" \| "surface" \| "muted"`                             |
| `RoleSingleKey`                             | type     | `"foreground" \| "border" \| "input" \| "ring"`                    |
| `generateThemeCss(schema, prefix?)`         | function | Generate complete CSS string from a `ThemeSchema`                  |
| `generateCssTokens(schema, prefix?, mode?)` | function | Lower-level: generate token record from a single `TokenSchema`     |
| `toCssString(tokens, selector?)`            | function | Format token record as CSS `:root {}` string                       |

---

## Theme Files

**Definition files:** `src/lib/themes/*.ts` — TypeScript theme definitions (26 themes)

**Generated CSS:** `src/lib/themes/css/*.css` — CSS output from `pnpm run build:theme:all`

**Default:** `stone.css` (imported in `src/lib/index.css`)

### Subpath Exports

Consumers can import themes directly:

```ts
// Import a theme definition object (to customize/extend)
import stone from "@marianmeres/stuic/themes/stone";

// Import a pre-built CSS theme
import "@marianmeres/stuic/themes/css/stone.css";
```

### Using a Different Theme

Replace the default theme import:

```css
/* In your app's CSS */
@import "@marianmeres/stuic/themes/css/blue-orange.css";
```

### Creating a Custom Theme (Programmatic)

```ts
import type { ThemeSchema } from "@marianmeres/stuic";
import { generateThemeCss } from "@marianmeres/stuic";
import stone from "@marianmeres/stuic/themes/stone";

// Extend an existing theme
const custom: ThemeSchema = {
	light: {
		...stone.light,
		colors: {
			...stone.light.colors,
			intent: {
				...stone.light.colors.intent,
				primary: { DEFAULT: "#3b82f6", foreground: "#ffffff" },
			},
		},
	},
	dark: stone.dark,
};

const css = generateThemeCss(custom);
// Write `css` to a file in your build pipeline
```

---

## Component Tokens

Components define their own tokens referencing global tokens:

```css
:root {
	--stuic-button-radius: var(--radius-md);
	--stuic-button-ring-color: var(--stuic-color-ring);
	--stuic-button-padding-x-md: 1rem;
}
```

Override globally:

```css
:root {
	--stuic-button-radius: 9999px; /* Pill buttons */
}
```

Override locally:

```svelte
<Button style="--stuic-button-radius: 0;">Square</Button>
```

---

## Key Files

| File                              | Purpose                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------- |
| src/lib/utils/design-tokens.ts    | Types (`TokenSchema`, `ThemeSchema`, `ColorPair`, etc.) and generation functions |
| src/lib/themes/\*.ts              | Theme definition files (26 themes, `TokenSchema`-typed)                          |
| src/lib/themes/css/\*.css         | Generated CSS output                                                             |
| src/lib/index.css                 | Theme import location (loads `stone.css` by default)                             |
| scripts/generate-theme.ts         | CLI script: `pnpm run build:theme:all`                                           |
| docs/DESIGN_TOKENS_MANUAL.md      | Token philosophy                                                                 |
| docs/TAILWIND_V4_CSS_VARIABLES.md | Tailwind v4 variables                                                            |
