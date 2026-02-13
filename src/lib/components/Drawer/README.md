# Drawer

A slide-out panel component with configurable position, fly animation, and backdrop support.

## Props

| Prop                   | Type                                     | Default  | Description                           |
| ---------------------- | ---------------------------------------- | -------- | ------------------------------------- |
| `visible`              | `boolean`                                | `false`  | Controls visibility (bindable)        |
| `position`             | `"left" \| "top" \| "right" \| "bottom"` | `"left"` | Slide direction                       |
| `transitionDuration`   | `number`                                 | `200`    | Animation duration (ms)               |
| `animOffset`           | `string \| number`                       | `"75vw"` | Fly animation distance                |
| `focusTrap`            | `boolean \| FocusTrapOptions`            | -        | Enable focus trapping                 |
| `onEscape`             | `() => void`                             | -        | Callback on Escape key                |
| `onOutside`            | `() => void`                             | -        | Callback on backdrop click            |
| `noBackdropScrollLock` | `boolean`                                | `false`  | Disable body scroll lock              |
| `class`                | `string`                                 | -        | CSS for drawer panel                  |
| `classBackdrop`        | `string`                                 | -        | CSS for backdrop                      |
| `labelledby`           | `string`                                 | -        | ARIA labelledby ID                    |
| `describedby`          | `string`                                 | -        | ARIA describedby ID                   |
| `el`                   | `HTMLDivElement`                         | -        | Panel element reference (bindable)    |
| `elBackdrop`           | `HTMLDivElement`                         | -        | Backdrop element reference (bindable) |

## Methods

| Method          | Description                                           |
| --------------- | ----------------------------------------------------- |
| `open(opener?)` | Open drawer, optionally track opener for focus return |
| `close()`       | Close drawer                                          |
| `setOpener(el)` | Set element to refocus when closed                    |

## Usage

### Basic Side Drawer

```svelte
<script lang="ts">
	import { Drawer } from "stuic";

	let drawer: Drawer;
</script>

<button onclick={(e) => drawer.open(e)}>Open Drawer</button>

<Drawer
	bind:this={drawer}
	onEscape={() => drawer.close()}
	onOutside={() => drawer.close()}
	class="bg-white dark:bg-neutral-900 max-w-md"
>
	<div class="p-6">
		<h2>Drawer Content</h2>
		<p>This is a side drawer.</p>
		<button onclick={() => drawer.close()}>Close</button>
	</div>
</Drawer>
```

### Right-Side Drawer

```svelte
<Drawer
	bind:this={drawer}
	position="right"
	onEscape={() => drawer.close()}
	onOutside={() => drawer.close()}
	class="bg-white dark:bg-neutral-900 max-w-sm"
>
	<nav class="p-4">
		<ul>
			<li>Menu Item 1</li>
			<li>Menu Item 2</li>
		</ul>
	</nav>
</Drawer>
```

### Bottom Sheet

```svelte
<Drawer
	bind:this={drawer}
	position="bottom"
	animOffset="50vh"
	onEscape={() => drawer.close()}
	class="bg-white dark:bg-neutral-900 max-h-[50vh]"
>
	<div class="p-6">Bottom sheet content</div>
</Drawer>
```

### With Visible Binding

```svelte
<script lang="ts">
	let visible = $state(false);
</script>

<button onclick={() => (visible = true)}>Open</button>

<Drawer
	bind:visible
	onEscape={() => (visible = false)}
	onOutside={() => (visible = false)}
>
	<div class="p-4">Content</div>
</Drawer>
```
