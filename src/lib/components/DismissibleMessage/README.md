# DismissibleMessage

A dismissible alert/message component with semantic intents and slide transition.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `THC \| Error` | - | Message content (string, HTML, or Error object) |
| `intent` | `"destructive" \| "warning" \| "success" \| "info"` | - | Semantic color intent |
| `forceAsHtml` | `boolean` | `true` | Render message as HTML |
| `duration` | `number` | `150` | Slide transition duration (ms) |
| `onDismiss` | `(() => void) \| null \| false` | - | Dismiss callback (set to `false` to hide X button) |
| `class` | `string` | - | CSS for container |
| `classContent` | `string` | - | CSS for content area |

## Usage

### Basic Message

```svelte
<script lang="ts">
  import { DismissibleMessage } from '@marianmeres/stuic';

  let message = $state('This is an important notice.');
</script>

<DismissibleMessage
  {message}
  onDismiss={() => message = ''}
/>
```

### With Semantic Intents

```svelte
<script lang="ts">
  import { DismissibleMessage } from '@marianmeres/stuic';

  let error = $state('Something went wrong!');
  let success = $state('Operation completed successfully.');
</script>

<!-- Error/destructive message -->
<DismissibleMessage
  message={error}
  intent="destructive"
  onDismiss={() => error = ''}
/>

<!-- Success message -->
<DismissibleMessage
  message={success}
  intent="success"
  onDismiss={() => success = ''}
/>

<!-- Warning message -->
<DismissibleMessage
  message="Please review your changes"
  intent="warning"
/>

<!-- Info message -->
<DismissibleMessage
  message="New features are available"
  intent="info"
/>
```

### Non-Dismissible

```svelte
<DismissibleMessage
  message="This message cannot be dismissed."
  intent="info"
  onDismiss={false}
/>
```

### With Error Object

```svelte
<script lang="ts">
  let error = $state<Error | null>(null);

  function doSomething() {
    try {
      throw new Error('Network request failed');
    } catch (e) {
      error = e as Error;
    }
  }
</script>

{#if error}
  <DismissibleMessage
    message={error}
    intent="destructive"
    onDismiss={() => error = null}
  />
{/if}
```

## CSS Variables

### Component Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-dismissible-message-radius` | `var(--radius-md)` | Border radius |
| `--stuic-dismissible-message-padding-x` | `calc(var(--spacing) * 4)` | Horizontal padding |
| `--stuic-dismissible-message-padding-y` | `calc(var(--spacing) * 3)` | Vertical padding |
| `--stuic-dismissible-message-border-width` | `1px` | Border width |
| `--stuic-dismissible-message-transition` | `150ms` | Color transition duration |

### Customization Examples

```css
/* Global override */
:root {
  --stuic-dismissible-message-radius: var(--radius-lg);
  --stuic-dismissible-message-padding-x: calc(var(--spacing) * 6);
}
```

```svelte
<!-- Inline override -->
<DismissibleMessage
  message="Custom styled message"
  style="--stuic-dismissible-message-radius: 9999px;"
/>
```

### Intent Colors

Intent colors are derived from the global STUIC design tokens:

| Intent | Token Used |
|--------|------------|
| `destructive` | `--stuic-color-destructive` |
| `warning` | `--stuic-color-warning` |
| `success` | `--stuic-color-success` |

Customize these in your theme file to change all components at once.

## Data Attributes

The component uses data attributes for CSS targeting:

- `data-intent` - The intent value (when set)

```css
/* Custom styling for specific intent */
.stuic-dismissible-message[data-intent="destructive"] {
  font-weight: bold;
}
```

## Migration from v2

The `theme` prop has been replaced with `intent`:

| Old (v2) | New (v3) |
|----------|----------|
| `theme="red"` | `intent="destructive"` |
| `theme="orange"` | `intent="warning"` |
| `theme="green"` | `intent="success"` |
| `theme="blue"` | `intent="info"` |
| No theme | No intent (default) |

The `classDismiss` and `classX` props have been removed.
