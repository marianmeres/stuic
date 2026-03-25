# Theming Domain

## Overview

Centralized design token system using CSS custom properties. 31 pre-built themes available (from `@marianmeres/design-tokens`).

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

**Definitions:** `@marianmeres/design-tokens/themes` — 31 TypeScript theme definitions

**Generated CSS:** `src/lib/themes/css/*.css` — CSS output from `pnpm run build:theme:all`

**Default:** `stone.css` (imported in `src/lib/index.css`)

### Subpath Exports

Consumers can import themes directly:

```ts
// Import a theme definition object (from design-tokens package)
import { stone } from "@marianmeres/design-tokens/themes";

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
import type { ThemeSchema } from "@marianmeres/design-tokens";
import { generateThemeCss } from "@marianmeres/design-tokens";
import { stone } from "@marianmeres/design-tokens/themes";

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

const css = generateThemeCss(custom, "stuic-");
// Write `css` to a file in your build pipeline
```

---

## Shared Structural Tokens

Global tokens defined in `src/lib/index.css` that control cross-component visual properties. Override these to change the entire library's visual character:

| Token                      | Default              | Purpose                                          |
| -------------------------- | -------------------- | ------------------------------------------------ |
| `--stuic-radius`           | `var(--radius-md)`   | Element-level radius (buttons, inputs, badges)    |
| `--stuic-radius-container` | `var(--radius-lg)`   | Container-level radius (cards, modals, dropdowns) |
| `--stuic-shadow`           | `var(--shadow-sm)`   | Default resting shadow                           |
| `--stuic-shadow-hover`     | `var(--shadow-md)`   | Hover/elevated shadow                            |
| `--stuic-shadow-overlay`   | `var(--shadow-lg)`   | Overlays (dropdowns, notifications)              |
| `--stuic-shadow-dialog`    | `var(--shadow-xl)`   | Dialogs/modals                                   |
| `--stuic-border-width`     | `1px`                | Default border width                             |
| `--stuic-transition`       | `150ms`              | Default transition duration                      |

Example — brutalist style in 7 lines:

```css
:root {
    --stuic-radius: 0;
    --stuic-radius-container: 0;
    --stuic-shadow: none;
    --stuic-shadow-hover: none;
    --stuic-shadow-overlay: none;
    --stuic-shadow-dialog: none;
    --stuic-border-width: 0;
}
```

Components reference these via the fallback pattern (not `:root` declarations):

```css
.stuic-button {
    border-radius: var(--stuic-button-radius, var(--stuic-radius));
}
```

---

## Component Tokens

Components define their own customization tokens in `:root` (for non-structural properties like colors, padding, typography):

```css
:root {
	--stuic-button-ring-color: var(--stuic-color-ring);
	--stuic-button-padding-x-md: 1rem;
	--stuic-button-font-weight: var(--font-weight-medium);
}
```

For structural properties (radius, shadow, border-width, transition), components use the **fallback pattern** at usage sites instead of `:root` declarations — see [Conventions: Shared Structural Tokens](../conventions.md#shared-structural-tokens).

Override per-component tokens globally:

```css
:root {
	--stuic-button-radius: 9999px; /* Pill buttons — overrides the shared fallback */
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
| src/lib/utils/design-tokens.ts    | Re-exports from `@marianmeres/design-tokens`                                    |
| src/lib/themes/css/\*.css         | Generated CSS output                                                             |
| src/lib/index.css                 | Theme import location (loads `stone.css` by default)                             |
| scripts/generate-theme.ts         | CLI script: `pnpm run build:theme:all`                                           |
| docs/DESIGN_TOKENS_MANUAL.md      | Token philosophy                                                                 |
| docs/TAILWIND_V4_CSS_VARIABLES.md | Tailwind v4 variables                                                            |
