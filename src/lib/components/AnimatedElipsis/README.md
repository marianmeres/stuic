# AnimatedEllipsis

An animated loading indicator displaying three dots that fade in sequentially to create a pulsing ellipsis effect.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | - | CSS classes for the wrapper span |
| `enabled` | `boolean` | `true` | When `false`, all dots are visible (no animation) |

## Usage

### Basic

```svelte
<script lang="ts">
  import { AnimatedEllipsis } from 'stuic';
</script>

<span>Loading<AnimatedEllipsis /></span>
```

### Controlled Animation

```svelte
<script lang="ts">
  import { AnimatedEllipsis } from 'stuic';

  let isLoading = $state(true);
</script>

<span>
  Processing<AnimatedEllipsis enabled={isLoading} />
</span>
```

### With Custom Styling

```svelte
<AnimatedEllipsis class="text-blue-500 font-bold" />
```
