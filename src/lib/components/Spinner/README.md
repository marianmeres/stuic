# Spinner

A customizable loading spinner with rotating segments. Pure CSS animation with configurable appearance.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `duration` | `number` | `750` | One full rotation duration (ms) |
| `count` | `number` | `8` | Number of segments/hands (3-12) |
| `thickness` | `"thin" \| "normal" \| "thick"` | `"thick"` | Segment width |
| `height` | `"short" \| "normal" \| "tall"` | `"normal"` | Segment length |
| `direction` | `"cw" \| "ccw"` | `"cw"` | Rotation direction (clockwise/counter-clockwise) |
| `class` | `string` | - | CSS classes for sizing |

## Usage

### Basic Spinner

```svelte
<script lang="ts">
  import { Spinner } from 'stuic';
</script>

<Spinner />
```

### Different Sizes

```svelte
<Spinner class="w-4" />
<Spinner class="w-6" />
<Spinner class="w-8" />
<Spinner class="w-12" />
```

### Customized Appearance

```svelte
<!-- More segments, thinner -->
<Spinner count={12} thickness="thin" />

<!-- Fewer segments, thicker, taller -->
<Spinner count={4} thickness="thick" height="tall" />
```

### Slower/Faster Animation

```svelte
<Spinner duration={500} />  <!-- Faster -->
<Spinner duration={1500} /> <!-- Slower -->
```

### Counter-Clockwise

```svelte
<Spinner direction="ccw" />
```

### With Custom Color

```svelte
<Spinner class="w-8 text-blue-500" />
<Spinner class="w-8 text-green-500" />
```

### Loading Button

```svelte
<script lang="ts">
  let loading = $state(false);
</script>

<button disabled={loading}>
  {#if loading}
    <Spinner class="w-4 mr-2" />
  {/if}
  Submit
</button>
```
