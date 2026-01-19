# ListItemButton

A versatile button component for list-like contexts such as dropdown menus, command palettes, and option lists. Supports multiple visual states, touch-friendly sizing, and full CSS variable customization.

## Usage

```svelte
<script>
  import { ListItemButton } from "stuic";
</script>

<ListItemButton>Click me</ListItemButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | - | Content displayed in the button |
| `active` | `boolean` | `false` | Whether this item is currently active/selected |
| `focused` | `boolean` | `false` | Whether this item is focused via keyboard navigation |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size preset affecting padding and min-height |
| `unstyled` | `boolean` | `false` | Skip all default styling, use only custom classes |
| `touchFriendly` | `boolean \| "auto"` | `false` | Enable touch-friendly sizing. `"auto"` detects coarse pointer. |
| `iconBefore` | `THC` | - | Icon/content displayed before the main content |
| `iconAfter` | `THC` | - | Icon/content displayed after the main content |
| `href` | `string` | - | Render as anchor tag instead of button |
| `class` | `string` | - | CSS classes for the button element |
| `classIconBefore` | `string` | - | CSS classes for the icon before slot |
| `classIconAfter` | `string` | - | CSS classes for the icon after slot |
| `classActive` | `string` | - | CSS classes applied when active |
| `classFocused` | `string` | - | CSS classes applied when focused |
| `el` | `HTMLButtonElement \| HTMLAnchorElement` | - | Bindable element reference |

## Examples

### Basic States

```svelte
<ListItemButton>Default</ListItemButton>
<ListItemButton active>Active (selected)</ListItemButton>
<ListItemButton focused>Focused (keyboard nav)</ListItemButton>
<ListItemButton disabled>Disabled</ListItemButton>
```

### Sizes

```svelte
<ListItemButton size="sm">Small</ListItemButton>
<ListItemButton size="md">Medium (default)</ListItemButton>
<ListItemButton size="lg">Large</ListItemButton>
```

### Touch Friendly

```svelte
<!-- Always use touch-friendly sizing (min-height 44px) -->
<ListItemButton touchFriendly>Touch friendly</ListItemButton>

<!-- Auto-detect coarse pointer (touch screens) -->
<ListItemButton touchFriendly="auto">Auto detect</ListItemButton>
```

### With Icons

```svelte
<script>
  import { ListItemButton, iconUser, iconChevronRight } from "stuic";
</script>

<ListItemButton iconBefore={{ html: iconUser({}) }}>
  User Profile
</ListItemButton>

<ListItemButton iconAfter={{ html: iconChevronRight({}) }}>
  Settings
</ListItemButton>

<ListItemButton
  iconBefore={{ html: iconUser({}) }}
  iconAfter={{ html: iconChevronRight({}) }}
>
  Both icons
</ListItemButton>
```

### As Link

```svelte
<ListItemButton href="/settings">Settings</ListItemButton>
```

### Unstyled

```svelte
<ListItemButton unstyled class="my-custom-classes">
  Custom styled
</ListItemButton>
```

## CSS Variables

All colors support customization via CSS variables. Define them on a parent element to override defaults.

### Border Radius

| Variable | Default | Description |
|----------|---------|-------------|
| `--lib-radius` | `var(--radius-md)` | Border radius |

### Base State

| Variable | Default | Description |
|----------|---------|-------------|
| `--color-lib-bg` | `neutral-200` | Background color |
| `--color-lib-bg-dark` | `neutral-600` | Background color (dark mode) |
| `--color-lib-text` | `black` | Text color |
| `--color-lib-text-dark` | `neutral-100` | Text color (dark mode) |
| `--color-lib-border` | `transparent` | Border color |
| `--color-lib-border-dark` | `transparent` | Border color (dark mode) |

### Hover State

| Variable | Default | Description |
|----------|---------|-------------|
| `--color-lib-hover-bg` | `neutral-500` | Hover background |
| `--color-lib-hover-bg-dark` | `neutral-200` | Hover background (dark mode) |
| `--color-lib-hover-text` | `white` | Hover text color |
| `--color-lib-hover-text-dark` | `neutral-900` | Hover text color (dark mode) |
| `--color-lib-hover-border` | `transparent` | Hover border color |
| `--color-lib-hover-border-dark` | `transparent` | Hover border color (dark mode) |

### Active State

| Variable | Default | Description |
|----------|---------|-------------|
| `--color-lib-active-bg` | `neutral-500` | Active background |
| `--color-lib-active-bg-dark` | `neutral-200` | Active background (dark mode) |
| `--color-lib-active-text` | `white` | Active text color |
| `--color-lib-active-text-dark` | `neutral-900` | Active text color (dark mode) |
| `--color-lib-active-border` | `transparent` | Active border color |
| `--color-lib-active-border-dark` | `transparent` | Active border color (dark mode) |

### Focus State

| Variable | Default | Description |
|----------|---------|-------------|
| `--color-lib-focus-bg` | `neutral-500` | Focus background |
| `--color-lib-focus-bg-dark` | `neutral-200` | Focus background (dark mode) |
| `--color-lib-focus-text` | `white` | Focus text color |
| `--color-lib-focus-text-dark` | `neutral-900` | Focus text color (dark mode) |
| `--color-lib-focus-border` | `transparent` | Focus border color |
| `--color-lib-focus-border-dark` | `transparent` | Focus border color (dark mode) |

### Custom Theme Example

```svelte
<div style="
  --color-lib-hover-bg: var(--color-blue-500);
  --color-lib-hover-bg-dark: var(--color-blue-600);
  --color-lib-active-bg: var(--color-blue-600);
  --color-lib-active-bg-dark: var(--color-blue-500);
">
  <ListItemButton>Blue theme</ListItemButton>
  <ListItemButton active>Active blue</ListItemButton>
</div>
```

## Exported Constants

The component exports several class constants for advanced customization:

```typescript
import {
  LIST_ITEM_BUTTON_STUIC_BASE_CLASSES,
  LIST_ITEM_BUTTON_STUIC_PRESET_CLASSES,
  LIST_ITEM_BUTTON_ACTIVE_CLASSES,
  LIST_ITEM_BUTTON_FOCUSED_CLASSES,
} from "stuic";
```
