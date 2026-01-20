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
| `contentBefore` | `THC` | - | Icon/content displayed before the main content |
| `contentAfter` | `THC` | - | Icon/content displayed after the main content |
| `href` | `string` | - | Render as anchor tag instead of button |
| `class` | `string` | - | CSS classes for the button element |
| `classContentBefore` | `string` | - | CSS classes for the icon before slot |
| `classContentAfter` | `string` | - | CSS classes for the icon after slot |
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

<ListItemButton contentBefore={{ html: iconUser({}) }}>
  User Profile
</ListItemButton>

<ListItemButton contentAfter={{ html: iconChevronRight({}) }}>
  Settings
</ListItemButton>

<ListItemButton
  contentBefore={{ html: iconUser({}) }}
  contentAfter={{ html: iconChevronRight({}) }}
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

All colors support customization via CSS variables. Define them on a parent element or in `:root` to override defaults.

### Border Radius

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-radius` | `--stuic-radius` | Border radius |

### Base State

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg` | `--stuic-surface-interactive` | Background color |
| `--stuic-list-item-button-text` | `--stuic-text` | Text color |
| `--stuic-list-item-button-border` | `transparent` | Border color |

### Hover State

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg-hover` | `--stuic-surface-interactive-hover` | Hover background |
| `--stuic-list-item-button-text-hover` | `--stuic-text-inverse` | Hover text color |
| `--stuic-list-item-button-border-hover` | `transparent` | Hover border color |

### Active State

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg-active` | `--stuic-surface-interactive-hover` | Active background |
| `--stuic-list-item-button-text-active` | `--stuic-text-inverse` | Active text color |
| `--stuic-list-item-button-border-active` | `transparent` | Active border color |

### Focus State

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg-focus` | `--stuic-surface-interactive-hover` | Focus background |
| `--stuic-list-item-button-text-focus` | `--stuic-text-inverse` | Focus text color |
| `--stuic-list-item-button-border-focus` | `transparent` | Focus border color |

### Custom Theme Example

```svelte
<div style="
  --stuic-list-item-button-bg-hover: var(--color-blue-500);
  --stuic-list-item-button-bg-active: var(--color-blue-600);
">
  <ListItemButton>Blue theme</ListItemButton>
  <ListItemButton active>Active blue</ListItemButton>
</div>
```

### Global Theme Override

```css
/* In your app.css */
:root {
  --stuic-list-item-button-bg-hover: var(--color-indigo-500);
  --stuic-list-item-button-text-hover: white;
}
```

## Legacy Variable Names (Backwards Compatibility)

The following legacy variable names are still supported as aliases:

| Legacy Name | New Name |
|-------------|----------|
| `--color-lib-bg` | `--stuic-list-item-button-bg` |
| `--color-lib-text` | `--stuic-list-item-button-text` |
| `--color-lib-border` | `--stuic-list-item-button-border` |
| `--color-lib-hover-bg` | `--stuic-list-item-button-bg-hover` |
| `--color-lib-hover-text` | `--stuic-list-item-button-text-hover` |
| `--color-lib-active-bg` | `--stuic-list-item-button-bg-active` |
| `--color-lib-focus-bg` | `--stuic-list-item-button-bg-focus` |
| etc. | etc. |

**Note:** Legacy names are deprecated and will be removed in a future version. Please migrate to the new `--stuic-list-item-button-*` naming convention.

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
