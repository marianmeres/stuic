# Avatar

A flexible avatar component that displays user photos, initials, or icons with automatic fallback handling and optional deterministic color generation.

## Props

| Prop             | Type                                              | Default  | Description                                                                                                                                  |
| ---------------- | ------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`            | `string`                                          | -        | Photo URL - when provided, renders in photo mode                                                                                             |
| `alt`            | `string`                                          | -        | Alt text for photo mode                                                                                                                      |
| `initials`       | `string`                                          | -        | String to extract initials from. Supports: "AB", "John Doe", or "john.doe@example.com"                                                       |
| `initialsLength` | `number`                                          | `2`      | Maximum length of extracted initials                                                                                                         |
| `icon`           | `IconFn`                                          | -        | Icon function to display - when provided alone, renders in icon mode                                                                         |
| `fallback`       | `AvatarFallback`                                  | `"icon"` | Fallback when photo fails to load                                                                                                            |
| `hashSource`     | `string`                                          | -        | String for color hash calculation (e.g., email, user ID). Falls back to `initials`                                                           |
| `size`           | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| string` | `"md"`   | Size preset or custom Tailwind size class                                                                                                    |
| `onclick`        | `(event: MouseEvent) => void`                     | -        | Click handler - when provided, renders as a button                                                                                           |
| `bg`             | `string`                                          | -        | Background color (Tailwind class). Ignored if `autoColor=true`                                                                               |
| `textColor`      | `string`                                          | -        | Text color (Tailwind class). Ignored if `autoColor=true`                                                                                     |
| `autoColor`      | `boolean`                                         | `false`  | Generate deterministic pastel colors from hashSource/initials                                                                                |
| `padding`        | `string`                                          | -        | CSS padding around the visual circle. Outer keeps its size, inner circle shrinks (e.g. `"4px"`, `"0.25rem"`). Useful for larger tap targets. |
| `class`          | `string`                                          | -        | Additional CSS classes                                                                                                                       |
| `classInner`     | `string`                                          | -        | Additional CSS classes for the inner element (only used when `padding` is set)                                                               |
| `el`             | `HTMLElement`                                     | -        | Bindable element reference                                                                                                                   |

## Usage

### Basic

```svelte
<script lang="ts">
	import { Avatar } from "@marianmeres/stuic";
</script>

<!-- Photo -->
<Avatar src="/path/to/photo.jpg" alt="John Doe" />

<!-- Initials -->
<Avatar initials="John Doe" />

<!-- Icon (default fallback) -->
<Avatar />
```

### Sizes

```svelte
<Avatar initials="AB" size="sm" />
<Avatar initials="AB" size="md" />
<Avatar initials="AB" size="lg" />
<Avatar initials="AB" size="xl" />
<Avatar initials="AB" size="2xl" />

<!-- Custom size with Tailwind -->
<Avatar initials="AB" size="size-20" />
```

### Auto Color

Generate deterministic pastel colors based on a hash source:

```svelte
<!-- Same input always produces same color -->
<Avatar initials="john@example.com" autoColor />
<Avatar initials="Jane Smith" autoColor hashSource="user-123" />
```

### Photo with Fallback

```svelte
<!-- Falls back to icon on error -->
<Avatar src="/maybe-broken.jpg" fallback="icon" />

<!-- Falls back to initials on error -->
<Avatar src="/maybe-broken.jpg" fallback="initials" initials="JD" />

<!-- Falls back to specific initials -->
<Avatar src="/maybe-broken.jpg" fallback={{ initials: "AB" }} />
```

### As Button

```svelte
<Avatar src="/photo.jpg" onclick={() => console.log("clicked")} />
```

### Padded (larger tap target / visually smaller circle)

Use `padding` to keep the avatar's outer footprint (e.g. a 44px tap target) while shrinking the visible colored circle. The padded ring is transparent.

```svelte
<!-- Outer stays at size="md" (2.75rem), circle shrinks by 4px on each side -->
<Avatar size="md" initials="AB" padding="4px" />
<Avatar
	size="md"
	autoColor
	initials="john@example.com"
	padding="0.25rem"
	onclick={() => {}}
/>
```

When `padding` is set, `bg`, `textColor`, and `autoColor` automatically apply to the inner circle (not the outer element).

### Custom Colors

```svelte
<!-- Using Tailwind classes -->
<Avatar initials="AB" bg="bg-blue-500" textColor="text-white" />

<!-- Using inline style for component tokens -->
<Avatar initials="AB" style="--stuic-avatar-bg: #3b82f6; --stuic-avatar-fg: white;" />
```

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via `style` prop:

| Variable                     | Default                          | Description                                                    |
| ---------------------------- | -------------------------------- | -------------------------------------------------------------- |
| `--stuic-avatar-radius`      | `9999px`                         | Border radius (circle by default)                              |
| `--stuic-avatar-font-weight` | `--font-weight-medium`           | Font weight for initials                                       |
| `--stuic-avatar-transition`  | `150ms`                          | Transition duration                                            |
| `--stuic-avatar-bg`          | `--stuic-color-muted`            | Default background color                                       |
| `--stuic-avatar-fg`          | `--stuic-color-muted-foreground` | Default text/icon color                                        |
| `--stuic-avatar-ring-width`  | `3px`                            | Focus ring width (button mode)                                 |
| `--stuic-avatar-ring-color`  | `--stuic-color-ring`             | Focus ring color                                               |
| `--stuic-avatar-padding`     | -                                | Set by the `padding` prop; can also be driven directly via CSS |

### Size Tokens

Each size preset has corresponding tokens (font sizes use Tailwind CSS variables):

| Size  | Width/Height                      | Font Size                                     |
| ----- | --------------------------------- | --------------------------------------------- |
| `sm`  | `--stuic-avatar-size-sm` (2rem)   | `--stuic-avatar-font-size-sm` (`--text-xs`)   |
| `md`  | `--stuic-avatar-size-md` (2.5rem) | `--stuic-avatar-font-size-md` (`--text-base`) |
| `lg`  | `--stuic-avatar-size-lg` (3rem)   | `--stuic-avatar-font-size-lg` (`--text-lg`)   |
| `xl`  | `--stuic-avatar-size-xl` (3.5rem) | `--stuic-avatar-font-size-xl` (`--text-xl`)   |
| `2xl` | `--stuic-avatar-size-2xl` (4rem)  | `--stuic-avatar-font-size-2xl` (`--text-2xl`) |

### Customization Examples

```css
/* Global override - square avatars */
:root {
	--stuic-avatar-radius: 0.5rem;
}

/* Global override - larger default size */
:root {
	--stuic-avatar-size-md: 3rem;
	--stuic-avatar-font-size-md: 1.25rem;
}
```

```svelte
<!-- Local override - square avatar -->
<Avatar initials="AB" style="--stuic-avatar-radius: 0.25rem;" />
```

## Data Attributes

The component uses data attributes for CSS styling:

| Attribute          | Values                        | Description                         |
| ------------------ | ----------------------------- | ----------------------------------- |
| `data-size`        | `sm`, `md`, `lg`, `xl`, `2xl` | Size preset (only for preset sizes) |
| `data-interactive` | `true`                        | Present when `onclick` is provided  |
| `data-padded`      | `""`                          | Present when `padding` is set       |

## Theming

The Avatar component uses theme tokens for default colors:

- Background: `--stuic-color-muted`
- Foreground: `--stuic-color-muted-foreground`
- Focus ring: `--stuic-color-ring`

These automatically adapt to light/dark mode when using the theming system.
