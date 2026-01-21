# @marianmeres/stuic

**S**velte **T**ailwind **UI** **C**omponents

An opinionated Svelte 5 component library built with Tailwind CSS v4. Featuring a centralized design token system for consistent theming across all components.

## Installation

```bash
npm install @marianmeres/stuic
```

## Quick Start

```svelte
<script>
  import { Button, Modal } from "@marianmeres/stuic";

  let modal;
</script>

<Button onclick={() => modal.open()}>Open Modal</Button>

<Modal bind:this={modal}>
  <p>Hello from Modal!</p>
</Modal>
```

## Theming System

STUIC uses a 3-layer CSS variable token system that enables both global theming and per-component customization.

### Architecture

```
Layer 1: Global Semantic Tokens (--stuic-accent, --stuic-surface, etc.)
    ↓ (used as fallback defaults)
Layer 2: Component Tokens (--stuic-button-bg, --stuic-input-accent, etc.)
    ↓ (Tailwind utility class references)
Layer 3: Instance Overrides (inline styles, class props)
```

### Global Theming

Override global tokens in your app's CSS to change the entire library's appearance:

```css
/* app.css */
:root {
  /* Change the accent color globally */
  --stuic-accent: #6366f1; /* Indigo brand color */
  --stuic-accent-hover: #4f46e5;
  --stuic-accent-active: #4338ca;
}

.dark {
  --stuic-accent: #818cf8;
  --stuic-accent-hover: #a5b4fc;
}
```

### Per-Component Customization

Override specific component tokens:

```css
:root {
  /* Only change switches to green */
  --stuic-switch-accent: #10b981;

  /* Custom button colors */
  --stuic-button-bg: #f3f4f6;
  --stuic-button-bg-hover: #e5e7eb;
}
```

### Instance Overrides

Use class props or inline styles for one-off customizations:

```svelte
<Button class="bg-purple-500 hover:bg-purple-600 text-white">
  Custom Button
</Button>

<div style="--stuic-list-item-button-bg-hover: var(--color-blue-500);">
  <ListItemButton>Blue hover</ListItemButton>
</div>
```

## Global Design Tokens

All tokens are defined in `src/lib/theme.css`. See the full reference below.

### Accent Colors

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--stuic-accent` | `sky-600` | `sky-400` | Primary accent for interactive elements |
| `--stuic-accent-hover` | `sky-700` | `sky-300` | Accent hover state |
| `--stuic-accent-active` | `sky-800` | `sky-200` | Accent active/pressed state |
| `--stuic-accent-destructive` | `red-600` | `red-400` | Destructive/error accent |
| `--stuic-accent-destructive-hover` | `red-700` | `red-300` | Destructive hover state |

### Surface Colors

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--stuic-surface` | `white` | `neutral-900` | Base page background |
| `--stuic-surface-elevated` | `white` | `neutral-800` | Cards, modals, popovers |
| `--stuic-surface-sunken` | `neutral-100` | `neutral-700` | Input backgrounds, wells |
| `--stuic-surface-overlay` | `neutral-800` | `neutral-950` | Backdrops, tooltips |
| `--stuic-surface-interactive` | `neutral-200` | `neutral-600` | Buttons, list items |
| `--stuic-surface-interactive-hover` | `neutral-500` | `neutral-200` | Interactive hover |
| `--stuic-surface-interactive-active` | `neutral-600` | `neutral-100` | Interactive active |

### Text Colors

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--stuic-text` | `black` | `neutral-100` | Primary text |
| `--stuic-text-muted` | `neutral-600` | `neutral-400` | Secondary/muted text |
| `--stuic-text-inverse` | `white` | `neutral-900` | Text on dark backgrounds |
| `--stuic-text-placeholder` | `neutral-400` | `neutral-500` | Placeholder text |
| `--stuic-text-on-accent` | `white` | `neutral-950` | Text on accent backgrounds |
| `--stuic-text-destructive` | `red-600` | `red-400` | Error/destructive text |

### Border Colors

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--stuic-border` | `neutral-300` | `neutral-600` | Default border |
| `--stuic-border-strong` | `neutral-400` | `neutral-500` | Emphasized border |
| `--stuic-border-subtle` | `neutral-200` | `neutral-700` | Subtle/light border |
| `--stuic-border-focus` | `sky-500` | `sky-400` | Focus ring border |
| `--stuic-border-error` | `red-500` | `red-400` | Error state border |

### Other Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--stuic-ring` | `sky-500` / `sky-400` | Focus ring color |
| `--stuic-ring-offset` | `2px` | Focus ring offset |
| `--stuic-ring-width` | `2px` | Focus ring width |
| `--stuic-radius-sm` | `--radius-sm` | Small border radius |
| `--stuic-radius` | `--radius-md` | Default border radius |
| `--stuic-radius-lg` | `--radius-lg` | Large border radius |
| `--stuic-radius-full` | `9999px` | Fully rounded |
| `--stuic-transition-fast` | `100ms` | Fast transitions |
| `--stuic-transition-normal` | `150ms` | Normal transitions |
| `--stuic-transition-slow` | `300ms` | Slow transitions |

## Component Tokens

Each component defines its own tokens that reference global tokens as defaults:

| Component | Token Prefix | Key Tokens |
|-----------|--------------|------------|
| Button | `--stuic-button-*` | `bg`, `text`, `border`, `border-focus` |
| Switch | `--stuic-switch-*` | `accent` |
| Input | `--stuic-input-*` | `accent`, `accent-error` |
| Progress | `--stuic-progress-*` | `bg`, `accent` |
| ListItemButton | `--stuic-list-item-button-*` | `bg`, `text`, `border`, `bg-hover`, `text-hover`, etc. |
| ButtonGroupRadio | `--stuic-button-group-*` | `bg`, `text`, `border`, `accent`, `bg-active`, `text-active` |
| TabbedMenu | `--stuic-tabbed-menu-*` | `tab-bg`, `tab-text`, `tab-bg-active`, `tab-text-active`, `border` |
| DismissibleMessage | `--stuic-dismissible-message-*` | `bg`, `text`, `border` |
| Notifications | `--stuic-notification-*` | `bg`, `text`, `border` |
| Tooltip | `--stuic-tooltip-*` | `bg`, `text` |
| Popover | `--stuic-popover-*` | `bg`, `text`, `border` |
| Skeleton | `--stuic-skeleton-*` | `bg`, `bg-highlight`, `duration` |

## CSS Variable Naming Convention

**STRICT REQUIREMENT**: All CSS variables follow this pattern:

```
--stuic-{component}-{element?}-{property}-{state?}
```

- **Full component names** (no abbreviations): `list-item-button` not `lib`
- **State at end**: `--stuic-button-bg-hover` not `--stuic-button-hover-bg`
- **No `-dark` suffix**: Dark mode defined in `.dark {}` selector
- **Properties**: `bg`, `text`, `border`, `ring`, `shadow`, `accent`
- **States**: `hover`, `active`, `focus`, `disabled`, `error`

### Examples

```css
/* Correct */
--stuic-button-bg
--stuic-button-bg-hover
--stuic-list-item-button-text-active
--stuic-input-accent-error

/* Incorrect */
--stuic-btn-bg                    /* abbreviated component name */
--stuic-button-hover-bg           /* state not at end */
--stuic-button-bg-dark           /* -dark suffix */
--color-lib-hover-bg              /* old naming convention */
```

## Customization Approaches

### 1. CSS Variables (Recommended)

Set variables in your CSS for theming:

```css
:root {
  --stuic-accent: #6366f1;
}
```

### 2. Class Props

Pass Tailwind classes directly to components:

```svelte
<Button class="bg-linear-to-r from-purple-500 to-pink-500">
  Gradient Button
</Button>
```

### 3. Unstyled Mode

Use `unstyled` prop to remove all default styling:

```svelte
<Button unstyled class="my-custom-button-class">
  Fully Custom
</Button>
```

## Components

See `src/lib/README.md` for the full component list and API documentation.

### Layout & Overlays
- AppShell, Backdrop, Modal, ModalDialog, Drawer

### Forms & Inputs
- FieldInput, FieldTextarea, FieldSelect, FieldCheckbox, FieldRadios, FieldFile, FieldAssets, FieldOptions, FieldKeyValues, FieldSwitch, Fieldset

### Buttons & Controls
- Button, ButtonGroupRadio, Switch, ListItemButton, X

### Feedback & Notifications
- Notifications, AlertConfirmPrompt, DismissibleMessage, Progress, Spinner, Skeleton

### Navigation & Menus
- CommandMenu, DropdownMenu, TabbedMenu, TypeaheadInput, KbdShortcut

### Utilities
- ColorScheme, Thc, SlidingPanels, HoverExpandableWidth, AnimatedElipsis

## Actions

```svelte
<input use:autogrow use:validate={{ required: true }} />
<button use:tooltip aria-label="Tooltip text">Hover me</button>
<div use:popover={{ content: 'Popover content' }}>Anchor</div>
```

- `autogrow` - Auto-expand textarea height
- `validate` - Form validation with custom validators
- `focusTrap` - Trap focus within element
- `tooltip` - Tooltip from aria-label
- `popover` - Anchored popover
- `fileDropzone` - Drag-and-drop file upload
- `highlightDragover` - Visual feedback for drag operations

## TypeScript

All components export their Props types:

```ts
import type { ButtonProps, ModalProps, ListItemButtonProps } from "@marianmeres/stuic";
```

## Requirements

- Svelte 5 (runes mode)
- Tailwind CSS v4
- Modern browser with CSS custom properties support

## Breaking Changes in v2

- All CSS variables renamed from `--color-*` to `--stuic-*` prefix
- ListItemButton variables renamed from `--color-lib-*` to `--stuic-list-item-button-*`
- State naming changed from `--*-hover-bg` to `--*-bg-hover` (state at end)
- Removed `-dark` suffix from variables (use `.dark {}` selector instead)
- Legacy variable names preserved as aliases for backwards compatibility

## License

MIT
