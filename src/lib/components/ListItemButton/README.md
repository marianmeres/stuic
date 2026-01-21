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
| `size` | `"sm" \| "md" \| "lg" \| string` | `"md"` | Size preset or custom Tailwind classes |
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

All styling can be customized via CSS variables. Define them on a parent element or in `:root` to override defaults.

### Structure Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-radius` | `var(--radius-md)` | Border radius |
| `--stuic-list-item-button-transition` | `150ms` | Transition duration |
| `--stuic-list-item-button-gap` | `0.5rem` | Gap between icon and content |

### Focus Ring Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-ring-width` | `3px` | Focus ring width |
| `--stuic-list-item-button-ring-offset` | `0px` | Focus ring offset |
| `--stuic-list-item-button-ring-color` | `var(--stuic-color-ring)` | Focus ring color |

### Size Tokens: Small (`size="sm"`)

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-padding-x-sm` | `0.5rem` | Horizontal padding |
| `--stuic-list-item-button-padding-y-sm` | `0.375rem` | Vertical padding |
| `--stuic-list-item-button-font-size-sm` | `var(--text-sm)` | Font size |
| `--stuic-list-item-button-min-height-sm` | `2.25rem` | Minimum height (36px) |

### Size Tokens: Medium (`size="md"`)

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-padding-x-md` | `0.625rem` | Horizontal padding |
| `--stuic-list-item-button-padding-y-md` | `0.5rem` | Vertical padding |
| `--stuic-list-item-button-font-size-md` | `var(--text-base)` | Font size |
| `--stuic-list-item-button-min-height-md` | `2.5rem` | Minimum height (40px) |

### Size Tokens: Large (`size="lg"`)

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-padding-x-lg` | `0.75rem` | Horizontal padding |
| `--stuic-list-item-button-padding-y-lg` | `0.625rem` | Vertical padding |
| `--stuic-list-item-button-font-size-lg` | `var(--text-base)` | Font size |
| `--stuic-list-item-button-min-height-lg` | `2.75rem` | Minimum height (44px) |

### Touch-Friendly Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-min-height-touch` | `2.75rem` | Touch-friendly min height (44px) |
| `--stuic-list-item-button-padding-y-touch` | `0.625rem` | Touch-friendly vertical padding |

### Color Tokens: Base State

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg` | `var(--stuic-color-muted)` | Background color |
| `--stuic-list-item-button-text` | `var(--stuic-color-foreground)` | Text color |
| `--stuic-list-item-button-border` | `transparent` | Border color |

### Color Tokens: Hover State

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg-hover` | `var(--stuic-color-primary)` | Hover background |
| `--stuic-list-item-button-text-hover` | `var(--stuic-color-primary-foreground)` | Hover text color |
| `--stuic-list-item-button-border-hover` | `transparent` | Hover border color |

### Color Tokens: Active State (selected)

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg-active` | `var(--stuic-color-primary)` | Active background |
| `--stuic-list-item-button-text-active` | `var(--stuic-color-primary-foreground)` | Active text color |
| `--stuic-list-item-button-border-active` | `transparent` | Active border color |

### Color Tokens: Focus State (keyboard navigation)

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-list-item-button-bg-focus` | `var(--stuic-color-primary)` | Focus background |
| `--stuic-list-item-button-text-focus` | `var(--stuic-color-primary-foreground)` | Focus text color |
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
  --stuic-list-item-button-radius: 0;
  --stuic-list-item-button-bg-hover: var(--color-indigo-500);
  --stuic-list-item-button-text-hover: white;
}
```

## Data Attributes

The component uses data attributes for styling states. These are automatically applied based on props:

| Attribute | Applied When | CSS Selector |
|-----------|--------------|--------------|
| `data-size="sm\|md\|lg"` | When `size` is a preset value | `.stuic-list-item-button[data-size="md"]` |
| `data-active` | When `active={true}` | `.stuic-list-item-button[data-active]` |
| `data-focused` | When `focused={true}` | `.stuic-list-item-button[data-focused]` |
| `data-touch-friendly` | When `touchFriendly={true}` or auto-detected | `.stuic-list-item-button[data-touch-friendly]` |

### Custom Styling via Data Attributes

```css
/* Example: Custom active state styling */
.stuic-list-item-button[data-active] {
  background: var(--color-green-500);
  color: white;
}

/* Example: Different padding for all sizes */
.stuic-list-item-button[data-size] {
  padding-left: 1rem;
  padding-right: 1rem;
}
```
