# Progress

A progress indicator available as either a horizontal bar or circular display.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"bar" \| "circle"` | `"bar"` | Display type |
| `progress` | `number` | `0` | Progress value (0-100) |
| `class` | `string` | - | CSS for container |
| `classBar` | `string` | - | CSS for progress bar fill (bar type only) |
| `styleBar` | `string` | - | Inline styles for bar fill |

## Usage

### Basic Bar

```svelte
<script lang="ts">
  import { Progress } from 'stuic';

  let progress = $state(0);
</script>

<Progress {progress} />
```

### Circle Progress

```svelte
<Progress type="circle" progress={75} class="size-16" />
```

### Animated Progress

```svelte
<script lang="ts">
  let progress = $state(0);

  function start() {
    progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) clearInterval(interval);
    }, 300);
  }
</script>

<Progress {progress} />
<button onclick={start}>Start</button>
```

### Custom Styling

```svelte
<Progress
  progress={60}
  class="h-2 bg-gray-200 rounded-full"
  classBar="bg-blue-500 rounded-full"
/>
```

### With Transition

```svelte
<Progress
  progress={value}
  classBar="transition-all duration-300"
/>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-progress-bg` | `--stuic-surface-interactive` | Track background |
| `--stuic-progress-accent` | `--stuic-accent` | Progress bar fill color |

### Example Override

```css
:root {
  --stuic-progress-accent: var(--color-green-500);
}
```
