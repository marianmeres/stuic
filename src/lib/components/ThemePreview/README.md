# ThemePreview

A comprehensive theme preview component that serves two purposes:

1. **Visual Preview** - Shows all design tokens in action as a mini webpage layout
2. **Reference Implementation** - Demonstrates theming best practices for creating components

## Usage

```svelte
<script lang="ts">
  import { ThemePreview } from '@marianmeres/stuic';
</script>

<ThemePreview />
```

### Compact Mode

```svelte
<ThemePreview compact showLabels={false} />
```

### Custom Sections

```svelte
<ThemePreview>
  {#snippet header()}
    <h1>My Custom Theme</h1>
  {/snippet}

  {#snippet sidebar()}
    <nav>Custom navigation...</nav>
  {/snippet}
</ThemePreview>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLabels` | `boolean` | `true` | Show section labels |
| `compact` | `boolean` | `false` | Reduced spacing |
| `showAllVariants` | `boolean` | `true` | Show all button variants |
| `showInputs` | `boolean` | `true` | Show input examples |
| `class` | `string` | - | Additional CSS classes |
| `el` | `HTMLDivElement` | - | Bindable element reference |
| `header` | `Snippet` | - | Custom header content |
| `sidebar` | `Snippet` | - | Custom sidebar content |
| `footer` | `Snippet` | - | Custom footer content |

## Component Tokens

Override to customize appearance:

```css
:root {
  --stuic-theme-preview-radius: var(--radius-lg);
  --stuic-theme-preview-gap: 2rem;
  --stuic-theme-preview-transition: 200ms;
  --stuic-theme-preview-sidebar-width: 250px;
}
```

---

# Theming Best Practices

This component demonstrates the patterns used throughout stuic. Follow these when creating new components.

## 1. Theme Token Reference

### Intent Colors

Communicate **purpose** and **meaning**:

| Token | Purpose |
|-------|---------|
| `--stuic-color-primary` | Main actions ("do this") |
| `--stuic-color-accent` | Highlights ("notice this") |
| `--stuic-color-destructive` | Dangerous/irreversible actions |
| `--stuic-color-warning` | Caution states |
| `--stuic-color-success` | Positive outcomes |
| `--stuic-color-info` | Neutral information |

Each intent has states and foregrounds:
- `--stuic-color-{intent}` - base color
- `--stuic-color-{intent}-hover` - hover state
- `--stuic-color-{intent}-active` - active/pressed state
- `--stuic-color-{intent}-foreground` - text on base
- `--stuic-color-{intent}-foreground-hover`
- `--stuic-color-{intent}-foreground-active`

### Role Colors

Define **position** in the visual hierarchy:

| Token | Purpose |
|-------|---------|
| `--stuic-color-background` | Page background |
| `--stuic-color-foreground` | Primary text |
| `--stuic-color-surface` | Card/panel backgrounds |
| `--stuic-color-surface-foreground` | Text on surfaces |
| `--stuic-color-muted` | Subtle backgrounds |
| `--stuic-color-muted-foreground` | Secondary text |
| `--stuic-color-border` | Border color |
| `--stuic-color-input` | Input field backgrounds |
| `--stuic-color-ring` | Focus ring color |

## 2. Internal Variable Pattern

The core theming technique in stuic separates **what colors to use** (intent) from **how to apply them** (variant).

### Step 1: Intent Sets the Palette

```css
.my-component[data-intent="primary"] {
  --_color: var(--stuic-color-primary);
  --_color-hover: var(--stuic-color-primary-hover);
  --_color-active: var(--stuic-color-primary-active);
  --_fg: var(--stuic-color-primary-foreground);
  --_fg-hover: var(--stuic-color-primary-foreground-hover);
  --_fg-active: var(--stuic-color-primary-foreground-active);
}
```

### Step 2: Variant Determines Application

```css
/* Solid: filled background */
.my-component[data-variant="solid"] {
  --_bg: var(--_color);
  --_text: var(--_fg);
  --_border: var(--_color);
}

/* Outline: transparent, colored border */
.my-component[data-variant="outline"] {
  --_bg: transparent;
  --_bg-hover: color-mix(in srgb, var(--_color) 10%, transparent);
  --_text: var(--_color);
  --_border: var(--_color);
}
```

### Step 3: Base Styles Consume Variables

```css
.my-component {
  background: var(--_bg);
  color: var(--_text);
  border-color: var(--_border);
}

.my-component:hover {
  background: var(--_bg-hover);
  color: var(--_text-hover);
  border-color: var(--_border-hover);
}
```

This pattern allows any intent + variant combination to work automatically.

## 3. Foreground Pairing Convention

When using a background color, always use its paired foreground for text:

```css
.card {
  background: var(--stuic-color-surface);
  color: var(--stuic-color-surface-foreground);
}

.muted-section {
  background: var(--stuic-color-muted);
  color: var(--stuic-color-muted-foreground);
}
```

## 4. Component Tokens

Define component-level tokens in `:root` for easy customization:

```css
:root {
  --stuic-my-component-radius: var(--radius-md);
  --stuic-my-component-padding: 1rem;
  --stuic-my-component-transition: 150ms;
}

.my-component {
  border-radius: var(--stuic-my-component-radius);
  padding: var(--stuic-my-component-padding);
  transition: all var(--stuic-my-component-transition);
}
```

Users can override globally or locally:
```css
/* Global override */
:root {
  --stuic-my-component-radius: 0;
}
```

```svelte
<!-- Local override -->
<MyComponent style="--stuic-my-component-radius: 999px;" />
```

## 5. State Handling

Always define hover and active states using theme tokens:

```css
.element {
  background: var(--stuic-color-surface);
}

.element:hover {
  background: var(--stuic-color-surface-hover);
}

.element:active {
  background: var(--stuic-color-surface-active);
}

.element:focus-visible {
  outline: 3px solid var(--stuic-color-ring);
  outline-offset: 2px;
}
```

## 6. Dark Mode

Themes handle dark mode via `:root.dark` selector. When using theme tokens properly, components don't need explicit dark mode styles - the theme handles everything.

```css
/* Theme defines both modes */
:root {
  --stuic-color-background: var(--color-white);
  --stuic-color-foreground: var(--color-neutral-900);
}

:root.dark {
  --stuic-color-background: var(--color-neutral-950);
  --stuic-color-foreground: var(--color-neutral-100);
}

/* Component just uses tokens - works in both modes */
.my-component {
  background: var(--stuic-color-background);
  color: var(--stuic-color-foreground);
}
```

## 7. Accessibility

- Use `--stuic-color-ring` for focus indicators
- Ensure sufficient contrast between background and foreground pairs
- Respect reduced motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .my-component {
    transition: none;
  }
}
```

## 8. Data Attributes

Use data attributes for styling variants instead of classes:

```svelte
<button
  data-intent={intent}
  data-variant={variant}
  data-size={size}
>
```

```css
.button[data-intent="primary"] { ... }
.button[data-variant="outline"] { ... }
.button[data-size="lg"] { ... }
```

This keeps the class attribute clean for user customization via `class` prop.
