# TwCheck

A development utility component to verify that Tailwind CSS is properly loaded and working. Displays different styles at different breakpoints.

## Props

| Prop    | Type     | Default | Description                                         |
| ------- | -------- | ------- | --------------------------------------------------- |
| `theme` | `string` | -       | Tailwind color palette name (e.g., "blue", "amber") |
| `class` | `string` | -       | Additional CSS classes                              |

## Component Tokens

Override to customize appearance:

```css
:root {
	--stuic-twcheck-bg: var(--stuic-color-primary);
	--stuic-twcheck-text: var(--stuic-color-primary-foreground);
	--stuic-twcheck-border-color: var(--stuic-color-accent);
	--stuic-twcheck-padding-x: calc(var(--spacing) * 2);
}
```

## Usage

### Basic Check

```svelte
<script lang="ts">
	import { TwCheck } from "@marianmeres/stuic";
</script>

<TwCheck>TW Check</TwCheck>
```

### Customization Strategies

```svelte
<!-- 1. Default styles (uses theme tokens) -->
<TwCheck>default</TwCheck>

<!-- 2. Tailwind class override -->
<TwCheck class="bg-green-600 text-white">green</TwCheck>

<!-- 3. CSS variable override -->
<TwCheck --stuic-twcheck-bg="var(--color-blue-600)">blue</TwCheck>

<!-- 4. Theme prop shorthand -->
<TwCheck theme="amber">amber</TwCheck>
```

## Visual Indicators

When Tailwind CSS is properly loaded:

- **Mobile**: Smaller text (text-base), no border
- **Desktop (sm+)**: Larger text (text-2xl), visible border

If the component appears unstyled (no size change, no border at wider viewports), Tailwind CSS is not loading correctly.

## Development Use

Add temporarily during development to verify Tailwind setup:

```svelte
<script lang="ts">
	import { dev } from "$app/environment";
</script>

{#if dev}
	<TwCheck>CSS OK</TwCheck>
{/if}
```
