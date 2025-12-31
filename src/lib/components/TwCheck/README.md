# TwCheck

A development utility component to verify that Tailwind CSS is properly loaded and working. Displays differently styled content at different breakpoints.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `string` | - | Tailwind color theme for background |
| `class` | `string` | - | Additional CSS classes |

## Usage

### Basic Check

```svelte
<script lang="ts">
  import { TwCheck } from 'stuic';
</script>

<TwCheck>
  TW Check
</TwCheck>
```

### With Theme

```svelte
<TwCheck theme="blue">
  Tailwind is working!
</TwCheck>
```

## Visual Indicators

When Tailwind CSS is properly loaded:
- **Mobile**: Yellow text, no border
- **Desktop (sm+)**: White text, teal border, larger font

If the component appears unstyled (plain text), Tailwind CSS is not loading correctly.

## Development Use

Add temporarily during development to verify Tailwind setup:

```svelte
<script lang="ts">
  import { dev } from '$app/environment';
</script>

{#if dev}
  <TwCheck>CSS OK</TwCheck>
{/if}
```
