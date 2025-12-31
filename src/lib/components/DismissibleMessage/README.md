# DismissibleMessage

A dismissible alert/message component with color themes and slide transition.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `THC \| Error` | - | Message content (string, HTML, or Error object) |
| `theme` | `TW_COLORS` | - | Tailwind color theme (e.g., `"red"`, `"green"`, `"blue"`) |
| `forceAsHtml` | `boolean` | `true` | Render message as HTML |
| `duration` | `number` | `150` | Slide transition duration (ms) |
| `onDismiss` | `(() => void) \| null \| false` | - | Dismiss callback (set to `false` to hide X button) |
| `class` | `string` | - | CSS for container |
| `classContent` | `string` | - | CSS for content area |
| `classDismiss` | `string` | - | CSS for dismiss button |
| `classX` | `string` | - | CSS for X icon |

## Usage

### Basic Message

```svelte
<script lang="ts">
  import { DismissibleMessage } from 'stuic';

  let message = $state('This is an important notice.');
</script>

<DismissibleMessage
  {message}
  onDismiss={() => message = ''}
/>
```

### With Theme Colors

```svelte
<script lang="ts">
  import { DismissibleMessage } from 'stuic';

  let error = $state('Something went wrong!');
  let success = $state('Operation completed successfully.');
</script>

<DismissibleMessage
  message={error}
  theme="red"
  onDismiss={() => error = ''}
/>

<DismissibleMessage
  message={success}
  theme="green"
  onDismiss={() => success = ''}
/>
```

### Non-Dismissible

```svelte
<DismissibleMessage
  message="This message cannot be dismissed."
  theme="blue"
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
    theme="red"
    onDismiss={() => error = null}
  />
{/if}
```
