# Notifications

A toast notification system with automatic stacking, progress indicators, and type-based theming using design tokens.

## Usage

### Basic Setup

```svelte
<script lang="ts">
	import { Notifications, NotificationsStack } from "@marianmeres/stuic";

	const notifications = new NotificationsStack();
</script>

<Notifications {notifications} />

<button onclick={() => notifications.info("Hello!")}> Show notification </button>
```

### Notification Types

```svelte
<script lang="ts">
	notifications.info("Information message");
	notifications.success("Operation successful!");
	notifications.warn("Warning: check this");
	notifications.error("An error occurred");
</script>
```

### Custom TTL (Time to Live)

```svelte
<script lang="ts">
	// Auto-dismiss after 10 seconds
	notifications.info("Long notification", { ttl: 10000 });

	// No auto-dismiss (sticky)
	notifications.error("Critical error", { ttl: 0 });
</script>
```

### Deduplication

```svelte
<script lang="ts">
	// Same content = same ID = increments count instead of duplicating
	notifications.info("Save completed");
	notifications.info("Save completed"); // Shows "2" badge
</script>
```

### Positioning

```svelte
<!-- Top right (default) -->
<Notifications {notifications} />

<!-- Bottom center -->
<Notifications {notifications} posX="center" posY="bottom" />

<!-- Different positions for mobile vs desktop -->
<Notifications
	{notifications}
	posX="right"
	posXMobile="center"
	posY="top"
	posYMobile="bottom"
/>
```

### Without Icons or Progress

```svelte
<Notifications {notifications} noIcons />
<Notifications {notifications} noProgress />
<Notifications {notifications} noXButton />
```

### Custom Icons

```svelte
<script lang="ts">
	const customIcons = {
		info: () => "<svg>...</svg>",
		success: () => "<svg>...</svg>",
		warn: () => "<svg>...</svg>",
		error: () => "<svg>...</svg>",
	};
</script>

<Notifications {notifications} iconFns={customIcons} />
```

## Props

| Prop                | Type                            | Default    | Description                                   |
| ------------------- | ------------------------------- | ---------- | --------------------------------------------- |
| `notifications`     | `NotificationsStack`            | required   | The notifications stack instance              |
| `posX`              | `"left" \| "center" \| "right"` | `"right"`  | Horizontal position (desktop)                 |
| `posXMobile`        | `"left" \| "center" \| "right"` | `"center"` | Horizontal position (mobile)                  |
| `posY`              | `"top" \| "center" \| "bottom"` | `"top"`    | Vertical position (desktop)                   |
| `posYMobile`        | `"top" \| "center" \| "bottom"` | `"top"`    | Vertical position (mobile)                    |
| `noIcons`           | `boolean`                       | `false`    | Hide notification icons                       |
| `noProgress`        | `boolean`                       | `false`    | Hide TTL progress bar                         |
| `noXButton`         | `boolean`                       | `false`    | Hide close button                             |
| `forceAsHtml`       | `boolean`                       | `false`    | Render content as HTML                        |
| `ariaCloseLabel`    | `string`                        | `"Close"`  | Accessibility label for close button          |
| `duration`          | `number`                        | `200`      | Fade transition duration (ms)                 |
| `iconFns`           | `Record<type, () => string>`    | -          | Custom icon render functions                  |
| `class`             | `string`                        | -          | Additional CSS classes for notification box   |
| `classWrapX`        | `string`                        | -          | Additional CSS classes for horizontal wrapper |
| `classWrapY`        | `string`                        | -          | Additional CSS classes for vertical wrapper   |
| `classNotifCount`   | `string`                        | -          | Additional CSS classes for count badge        |
| `classNotifIcon`    | `string`                        | -          | Additional CSS classes for icon               |
| `classNotifContent` | `string`                        | -          | Additional CSS classes for content            |
| `classProgress`     | `string`                        | -          | Additional CSS classes for progress container |
| `classProgressBar`  | `string`                        | -          | Additional CSS classes for progress bar       |
| `el`                | `HTMLDivElement`                | -          | Bindable element reference                    |

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via `style` attribute:

```css
:root {
	/* Layout */
	--stuic-notification-max-width: var(--container-sm); /* 24rem */
	--stuic-notification-radius: var(--radius-lg); /* 0.5rem */
	--stuic-notification-padding-x: calc(var(--spacing) * 4); /* 1rem */
	--stuic-notification-padding-y: calc(var(--spacing) * 3); /* 0.75rem */
	--stuic-notification-gap: calc(var(--spacing) * 4); /* 1rem */

	/* Typography */
	--stuic-notification-font-size: var(--text-sm);

	/* Animation */
	--stuic-notification-transition: 200ms;

	/* Shadow */
	--stuic-notification-shadow: var(--shadow-lg);

	/* Icon */
	--stuic-notification-icon-size: calc(var(--spacing) * 6); /* 1.5rem */

	/* Counter badge */
	--stuic-notification-badge-font-size: var(--text-xs);
	--stuic-notification-badge-padding-x: calc(var(--spacing) * 2);
	--stuic-notification-badge-padding-y: calc(var(--spacing) * 1);
	--stuic-notification-badge-radius: 9999px;
	--stuic-notification-badge-bg: var(--color-neutral-950);
	--stuic-notification-badge-text: var(--color-neutral-50);

	/* Progress bar */
	--stuic-notification-progress-opacity: 0.1;
}
```

### Example Override

```css
/* Make notifications more compact */
:root {
	--stuic-notification-padding-x: calc(var(--spacing) * 3);
	--stuic-notification-padding-y: calc(var(--spacing) * 2);
	--stuic-notification-radius: var(--radius-md);
}
```

```svelte
<!-- Local override -->
<Notifications {notifications} style="--stuic-notification-radius: 9999px;" />
```

### Type Colors

Notification types use the global STUIC design tokens:

| Type      | Background                  | Foreground                             | Border                            |
| --------- | --------------------------- | -------------------------------------- | --------------------------------- |
| `success` | `--stuic-color-success`     | `--stuic-color-success-foreground`     | `--stuic-color-success-hover`     |
| `warn`    | `--stuic-color-warning`     | `--stuic-color-warning-foreground`     | `--stuic-color-warning-hover`     |
| `error`   | `--stuic-color-destructive` | `--stuic-color-destructive-foreground` | `--stuic-color-destructive-hover` |

To customize type colors, override the global intent tokens:

```css
:root {
	--stuic-color-error: var(--color-blue-600);
	--stuic-color-error-foreground: var(--color-white);
	--stuic-color-error-hover: var(--color-blue-700);
}
```

## Data Attributes

The notification box uses data attributes for type-based styling:

- `data-type` - The notification type (`info`, `success`, `warn`, `error`)

## NotificationsStack API

### Constructor Options

| Option            | Type              | Default | Description                      |
| ----------------- | ----------------- | ------- | -------------------------------- |
| `maxCapacity`     | `number`          | `5`     | Maximum notifications in queue   |
| `defaultTtl`      | `number`          | `3000`  | Default time-to-live (ms)        |
| `extraTtlPerChar` | `number`          | `20`    | Extra TTL per content character  |
| `sortOrder`       | `"asc" \| "desc"` | `"asc"` | Stack sort order                 |
| `disposeInterval` | `number`          | `500`   | Auto-dispose check interval (ms) |

### Methods

| Method                    | Description               |
| ------------------------- | ------------------------- |
| `info(content, opts?)`    | Add info notification     |
| `success(content, opts?)` | Add success notification  |
| `warn(content, opts?)`    | Add warning notification  |
| `error(content, opts?)`   | Add error notification    |
| `removeById(id)`          | Remove notification by ID |
| `reset()`                 | Clear all notifications   |
| `destroy()`               | Cleanup and stop ticker   |

### Notification Options

| Option        | Type                      | Description                                        |
| ------------- | ------------------------- | -------------------------------------------------- |
| `id`          | `string \| number`        | Unique ID (auto-generated from content if omitted) |
| `ttl`         | `number`                  | Time-to-live in ms (0 = no auto-dismiss)           |
| `iconFn`      | `(() => string) \| false` | Custom icon or `false` to hide                     |
| `forceAsHtml` | `boolean`                 | Render content as HTML                             |

## Cleanup

```svelte
<script lang="ts">
	import { onDestroy } from "svelte";

	const notifications = new NotificationsStack();

	onDestroy(() => notifications.destroy());
</script>
```

## Accessibility

- Uses `role="alert"` for screen reader announcements
- Uses `aria-live="assertive"` on the container
- Close button has configurable `aria-label`
- Renders in a popover layer for proper stacking context
