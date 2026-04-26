# Pill

A small rounded inline element for tags, badges, status indicators, and filter chips. Polymorphic (renders as `<span>`, `<a>`, or `<button>` depending on props), with optional dismiss button, status dot, and content slots.

## Props

| Prop            | Type                                                               | Default  | Description                                                          |
| --------------- | ------------------------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `intent`        | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | -        | Semantic color intent                                                |
| `variant`       | `"solid" \| "outline" \| "ghost" \| "soft" \| "link"`              | `"soft"` | Visual variant (how colors are applied)                              |
| `size`          | `"sm" \| "md" \| "lg"`                                             | `"md"`   | Pill size                                                            |
| `muted`         | `boolean`                                                          | `false`  | Reduce emphasis (lower opacity)                                      |
| `active`        | `boolean`                                                          | `false`  | Selected/active state (filter-chip behavior)                         |
| `roundedFull`   | `boolean`                                                          | `true`   | Fully rounded corners (9999px). Set `false` to use the element radius |
| `block`         | `boolean`                                                          | `false`  | Render as block-level flex (full width). `inline-flex` by default     |
| `unstyled`      | `boolean`                                                          | `false`  | Skip all default styling                                             |
| `href`          | `string`                                                           | -        | Render as `<a>` with this URL                                        |
| `target`        | `string`                                                           | -        | Link target (only when `href` is set)                                |
| `onclick`       | `(e: MouseEvent) => void`                                          | -        | Render as `<button>` with this handler (when no `href`)              |
| `disabled`      | `boolean`                                                          | -        | Disabled state (interactive variants only)                           |
| `dismissible`   | `boolean`                                                          | `false`  | Show built-in X dismiss button                                       |
| `ondismiss`     | `(e: MouseEvent) => void`                                          | -        | Called when X is clicked. Stops propagation                          |
| `dot`           | `boolean`                                                          | `false`  | Status dot rendered before content                                   |
| `contentBefore` | `THC`                                                              | -        | Content rendered before children                                     |
| `contentAfter`  | `THC`                                                              | -        | Content rendered after children                                      |
| `el`            | `HTMLElement`                                                      | -        | Element reference (bindable)                                         |
| `class`         | `string`                                                           | -        | Additional CSS classes                                               |

## Element Resolution

| Condition                         | Element                                                |
| --------------------------------- | ------------------------------------------------------ |
| Default                           | `<span>`                                               |
| `href` set                        | `<a>`                                                  |
| `onclick` set (no `href`)         | `<button>`                                             |
| `dismissible` set                 | `<span>` wrapper containing main element + X sibling   |

## Usage

### Intent x Variant

```svelte
<script lang="ts">
	import { Pill } from "@marianmeres/stuic";
</script>

<Pill intent="primary">primary</Pill>
<Pill intent="success" variant="solid">success</Pill>
<Pill intent="destructive" variant="outline">destructive</Pill>
<Pill intent="warning" variant="ghost">warning</Pill>
<Pill intent="accent" variant="link">accent</Pill>
```

### Sizes

```svelte
<Pill size="sm">Small</Pill>
<Pill size="md">Medium</Pill>
<Pill size="lg">Large</Pill>
```

### Polymorphic

```svelte
<!-- Plain inline marker (span) -->
<Pill intent="primary">tag</Pill>

<!-- Anchor link -->
<Pill intent="accent" href="/profile">Profile</Pill>

<!-- Button -->
<Pill intent="success" onclick={() => console.log("clicked")}>
	Click me
</Pill>
```

### Status Dot

```svelte
<Pill intent="success" dot>Online</Pill>
<Pill intent="warning" dot>Idle</Pill>
<Pill intent="destructive" dot>Offline</Pill>
```

### Dismissible

```svelte
<script lang="ts">
	let tags = $state(["svelte", "tailwind", "stuic"]);
</script>

{#each tags as tag (tag)}
	<Pill
		intent="primary"
		dismissible
		ondismiss={() => (tags = tags.filter((x) => x !== tag))}
	>
		{tag}
	</Pill>
{/each}
```

`dismissible` works alongside `onclick` and `href` — the X button stops propagation so the parent click/navigation only fires for clicks outside the X.

### Filter Chips (active state)

```svelte
<script lang="ts">
	let filters = $state(new Set<string>());
	function toggle(f: string) {
		filters.has(f) ? filters.delete(f) : filters.add(f);
		filters = new Set(filters);
	}
</script>

{#each ["new", "popular", "in-stock"] as opt}
	<Pill
		intent="primary"
		variant="outline"
		active={filters.has(opt)}
		onclick={() => toggle(opt)}
	>
		{opt}
	</Pill>
{/each}
```

### Icons via contentBefore / contentAfter

```svelte
<Pill intent="success" contentBefore={{ html: iconCheck() }}>Verified</Pill>
<Pill intent="primary" contentAfter={{ html: iconArrowRight() }}>Next</Pill>
```

`contentBefore` and `contentAfter` accept any `THC` value (string, `{ html }`, `{ text }`, component, snippet).

### Block (full width)

```svelte
<Pill intent="primary" block>Block-level pill</Pill>
```

### Custom Styling

```svelte
<!-- Override radius inline -->
<Pill intent="primary" style="--stuic-pill-radius: 4px;">Squared</Pill>

<!-- Disable rounded-full default for element-radius -->
<Pill intent="primary" roundedFull={false}>Element radius</Pill>

<!-- Unstyled for full control -->
<Pill unstyled class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
	Custom
</Pill>
```

## CSS Variables

### Component Tokens

| Variable                      | Default                | Description           |
| ----------------------------- | ---------------------- | --------------------- |
| `--stuic-pill-radius`         | `--stuic-radius`       | Border radius (overridden to `9999px` by `roundedFull`) |
| `--stuic-pill-font-family`    | `--font-sans`          | Font family           |
| `--stuic-pill-font-weight`    | `--font-weight-medium` | Font weight           |
| `--stuic-pill-transition`     | `--stuic-transition`   | Transition duration   |
| `--stuic-pill-border-width`   | `--stuic-border-width` | Border width          |
| `--stuic-pill-ring-width`     | `2px`                  | Focus ring width      |
| `--stuic-pill-ring-color`     | `--stuic-color-ring`   | Focus ring color      |
| `--stuic-pill-gap`            | `0.375rem`             | Gap between dot/before/children/after/dismiss |
| `--stuic-pill-dot-size`       | `0.5rem`               | Status dot diameter   |

### Size Tokens

Each size (sm, md, lg) has corresponding tokens:

- `--stuic-pill-padding-x-{size}`
- `--stuic-pill-padding-y-{size}`
- `--stuic-pill-font-size-{size}`
- `--stuic-pill-min-height-{size}`

Dismissible pills override `padding-y` to `0` (the X button defines the height).

### Intent Color Tokens

Pill reuses the global intent palette:

```css
:root {
	--stuic-color-primary: ...;
	--stuic-color-primary-hover: ...;
	--stuic-color-primary-foreground: ...;
	/* + accent, destructive, warning, success */
}
```

## Data Attributes

The component uses data attributes for styling:

- `data-intent` - intent value
- `data-variant` - variant value
- `data-size` - size value
- `data-muted` - present when `muted`
- `data-active` - present when `active`
- `data-rounded-full` - present when `roundedFull`
- `data-block` - present when `block`
- `data-with-dot` - present when `dot`
- `data-dismissible` - present when `dismissible`
- `data-interactive` - present on `<a>` / `<button>` non-dismissible variants
