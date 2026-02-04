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

| Token | Purpose |
|-------|---------|
| `--stuic-color-background` | Page background |
| `--stuic-color-surface` | Raised containers (cards, modals) |
| `--stuic-color-surface-1` | Deeper surface level |
| `--stuic-color-muted` | De-emphasized elements |

Each has: `-foreground`, `-hover`, `-active` variants.

**Single:**

| Token | Purpose |
|-------|---------|
| `--stuic-color-foreground` | Default text color |
| `--stuic-color-border` | Default borders |
| `--stuic-color-input` | Form field backgrounds |
| `--stuic-color-ring` | Focus ring color |

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
--stuic-color-surface-primary:
  color-mix(in srgb, var(--stuic-color-primary) 15%, var(--stuic-color-background));

--stuic-color-surface-primary-border:
  color-mix(in srgb, var(--stuic-color-primary) 30%, var(--stuic-color-background));
```

This ensures semantic relationships across all themes.

---

## Theme Files

**Location:** `src/lib/themes/css/`

**Default:** `stone.css` (imported in `src/lib/index.css`)

**Available themes:** stone, gray, blue-orange, cyan-red, emerald-pink, fuchsia-emerald, indigo-amber, pink-teal, purple-yellow, rainbow, red-blue, rose-teal, sky-amber, slate-cyan, teal-rose, violet-lime, zinc, neutral, slate

### Using a Different Theme

Replace the default theme import:

```css
/* In your app's CSS */
@import "@marianmeres/stuic/dist/themes/css/blue-orange.css";
```

Or import alongside for switching:

```css
@import "@marianmeres/stuic/dist/themes/css/stone.css";
@import "@marianmeres/stuic/dist/themes/css/blue-orange.css" (prefers-color-scheme: dark);
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

| File | Purpose |
|------|---------|
| src/lib/themes/css/stone.css | Default theme, reference |
| src/lib/utils/design-tokens.ts | Token generator types |
| src/lib/index.css | Theme import location |
| docs/DESIGN_TOKENS_MANUAL.md | Token philosophy |
| docs/TAILWIND_V4_CSS_VARIABLES.md | Tailwind v4 variables |
