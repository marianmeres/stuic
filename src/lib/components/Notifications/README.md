# Notifications

A toast notification system with auto-disposal, deduplication, progress indicators, and flexible positioning.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `NotificationsStack` | - | Stack instance (required) |
| `posX` | `"left" \| "center" \| "right"` | `"right"` | Horizontal position (desktop) |
| `posY` | `"top" \| "center" \| "bottom"` | `"top"` | Vertical position (desktop) |
| `posXMobile` | `"left" \| "center" \| "right"` | `"center"` | Horizontal position (mobile) |
| `posYMobile` | `"top" \| "center" \| "bottom"` | `"top"` | Vertical position (mobile) |
| `themeInfo` | `TW_COLORS` | `"neutral"` | Color theme for info notifications |
| `themeError` | `TW_COLORS` | `"red"` | Color theme for error notifications |
| `themeWarn` | `TW_COLORS` | `"yellow"` | Color theme for warning notifications |
| `themeSuccess` | `TW_COLORS` | `"green"` | Color theme for success notifications |
| `noTheme` | `boolean` | `false` | Disable color theming |
| `noIcons` | `boolean` | `false` | Hide notification icons |
| `noProgress` | `boolean` | `false` | Hide TTL progress bar |
| `noXButton` | `boolean` | `false` | Hide close button |
| `duration` | `number` | `200` | Fade transition duration (ms) |
| `forceAsHtml` | `boolean` | - | Render content as HTML |
| `iconFns` | `Record<type, () => string>` | - | Custom icon functions |

## NotificationsStack API

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxCapacity` | `number` | `5` | Maximum notifications in queue |
| `defaultTtl` | `number` | `3000` | Default time-to-live (ms) |
| `extraTtlPerChar` | `number` | `20` | Extra TTL per content character |
| `sortOrder` | `"asc" \| "desc"` | `"asc"` | Stack sort order |
| `disposeInterval` | `number` | `500` | Auto-dispose check interval (ms) |

### Methods

| Method | Description |
|--------|-------------|
| `info(content, opts?)` | Add info notification |
| `success(content, opts?)` | Add success notification |
| `warn(content, opts?)` | Add warning notification |
| `error(content, opts?)` | Add error notification |
| `removeById(id)` | Remove notification by ID |
| `reset()` | Clear all notifications |
| `destroy()` | Cleanup and stop ticker |

### Notification Options

| Option | Type | Description |
|--------|------|-------------|
| `id` | `string \| number` | Unique ID (auto-generated from content if omitted) |
| `ttl` | `number` | Time-to-live in ms (0 = no auto-dismiss) |
| `iconFn` | `(() => string) \| false` | Custom icon or `false` to hide |
| `forceAsHtml` | `boolean` | Render content as HTML |

## Usage

### Basic Setup

```svelte
<script lang="ts">
  import { Notifications, NotificationsStack } from 'stuic';

  const notifications = new NotificationsStack();
</script>

<Notifications {notifications} />

<button onclick={() => notifications.info('Hello!')}>
  Show Info
</button>
```

### Different Types

```svelte
<script lang="ts">
  notifications.info('Information message');
  notifications.success('Operation successful!');
  notifications.warn('Warning: check this');
  notifications.error('An error occurred');
</script>
```

### Custom TTL

```svelte
<script lang="ts">
  // Auto-dismiss after 10 seconds
  notifications.info('Long message', { ttl: 10000 });

  // Never auto-dismiss
  notifications.error('Critical error', { ttl: 0 });
</script>
```

### Deduplication

```svelte
<script lang="ts">
  // Same content = same ID = increments count instead of duplicating
  notifications.info('Save completed');
  notifications.info('Save completed'); // Shows "2" badge
</script>
```

### Custom Positioning

```svelte
<Notifications
  {notifications}
  posX="left"
  posY="bottom"
  posXMobile="center"
  posYMobile="bottom"
/>
```

### Custom Stack Options

```svelte
<script lang="ts">
  const notifications = new NotificationsStack([], {
    maxCapacity: 3,
    defaultTtl: 5000,
    sortOrder: 'desc'
  });
</script>
```

## Cleanup

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';

  const notifications = new NotificationsStack();

  onDestroy(() => notifications.destroy());
</script>
```
