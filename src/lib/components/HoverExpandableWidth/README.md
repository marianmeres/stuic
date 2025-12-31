# HoverExpandableWidth

A container that expands its width on hover, transitioning from a fixed width to a target width. Useful for sidebars or navigation that expand to show more content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` (if fine pointer) | Enable hover expansion |
| `targetWidth` | `number` | `256` | Expanded width in pixels |
| `duration` | `number` | `150` | Transition duration (ms) |
| `delayIn` | `number` | `500` | Delay before expanding (ms) |
| `delayOut` | `number` | `300` | Delay before shrinking (ms) |
| `shadowOpacity` | `number` | `0.5` | Box shadow opacity when expanded |
| `class` | `string` | - | CSS classes for container |

## Snippet Props

The `children` snippet receives state information:

| Prop | Type | Description |
|------|------|-------------|
| `isExpanded` | `boolean` | Currently expanded |
| `isExpanding` | `boolean` | Transition to expanded |
| `isShrinking` | `boolean` | Transition to collapsed |
| `inTransition` | `boolean` | Any transition active |

## Usage

### Basic Expandable Sidebar

```svelte
<script lang="ts">
  import { HoverExpandableWidth } from 'stuic';
</script>

<div class="w-16 h-screen">
  <HoverExpandableWidth targetWidth={256}>
    {#snippet children({ isExpanded })}
      <nav class="h-full bg-gray-100 p-2">
        {#if isExpanded}
          <ul>
            <li>Dashboard</li>
            <li>Settings</li>
            <li>Profile</li>
          </ul>
        {:else}
          <ul>
            <li>D</li>
            <li>S</li>
            <li>P</li>
          </ul>
        {/if}
      </nav>
    {/snippet}
  </HoverExpandableWidth>
</div>
```

### With Custom Delays

```svelte
<HoverExpandableWidth
  targetWidth={320}
  delayIn={300}
  delayOut={200}
  duration={200}
>
  {#snippet children({ isExpanded, inTransition })}
    <div class={inTransition ? 'opacity-50' : ''}>
      {isExpanded ? 'Expanded content...' : 'Icon'}
    </div>
  {/snippet}
</HoverExpandableWidth>
```

## Notes

- Respects `prefers-reduced-motion` - animations disabled when user prefers reduced motion
- Automatically disabled on touch devices (coarse pointer)
- Uses `position: fixed` during expansion for overlay effect
