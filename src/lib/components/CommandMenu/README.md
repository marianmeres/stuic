# CommandMenu

A searchable command palette/menu modal for quick navigation and selection. Supports keyboard navigation, option grouping, and async search.

## Props

| Prop                | Type                                              | Default               | Description                          |
| ------------------- | ------------------------------------------------- | --------------------- | ------------------------------------ |
| `value`             | `any`                                             | -                     | Selected item (bindable)             |
| `q`                 | `string`                                          | `""`                  | Search query (bindable)              |
| `getOptions`        | `(q: string, current: Item[]) => Promise<Item[]>` | -                     | Async function to fetch options      |
| `renderOptionLabel` | `(item: Item) => string`                          | -                     | Custom label renderer                |
| `renderOptionGroup` | `(s: string) => string`                           | -                     | Custom group label renderer          |
| `itemIdPropName`    | `string`                                          | `"id"`                | Property name for item ID            |
| `t`                 | `TranslateFn`                                     | -                     | Translation function for i18n        |
| `notifications`     | `NotificationsStack`                              | -                     | Notifications stack for errors       |
| `searchPlaceholder` | `string`                                          | `"Type to search..."` | Input placeholder                    |
| `noScrollLock`      | `boolean`                                         | `false`               | Disable body scroll lock             |
| `showAllOnEmptyQ`   | `boolean`                                         | `false`               | Show all options when query is empty |
| `classOption`       | `string`                                          | -                     | CSS for option buttons               |
| `classOptionActive` | `string`                                          | -                     | CSS for active option                |
| `input`             | `HTMLInputElement`                                | -                     | Input element reference (bindable)   |

## Methods

| Method          | Description            |
| --------------- | ---------------------- |
| `open(opener?)` | Open the command menu  |
| `close()`       | Close the command menu |

## Usage

### Basic

```svelte
<script lang="ts">
	import { CommandMenu } from "stuic";

	let menu: CommandMenu;
	let selected = $state(null);

	async function getOptions(q: string) {
		const items = [
			{ id: "dashboard", label: "Dashboard" },
			{ id: "settings", label: "Settings" },
			{ id: "profile", label: "Profile" },
		];
		return items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
	}
</script>

<button onclick={() => menu.open()}>Open Menu (Cmd+K)</button>

<CommandMenu
	bind:this={menu}
	bind:value={selected}
	{getOptions}
	renderOptionLabel={(item) => item.label}
/>

{#if selected}
	<p>Selected: {selected.label}</p>
{/if}
```

### With Option Groups

```svelte
<script lang="ts">
	async function getOptions(q: string) {
		return [
			{ id: "new-file", label: "New File", optgroup: "file" },
			{ id: "open-file", label: "Open File", optgroup: "file" },
			{ id: "copy", label: "Copy", optgroup: "edit" },
			{ id: "paste", label: "Paste", optgroup: "edit" },
		];
	}
</script>

<CommandMenu
	bind:this={menu}
	{getOptions}
	renderOptionLabel={(item) => item.label}
	renderOptionGroup={(group) => group.toUpperCase()}
/>
```

## Layout

The command menu uses `ModalDialog` internally with top-aligned positioning:

- **Mobile**: Input at top of screen with 1rem margins from edges
- **Desktop (md+)**: Input positioned at ~20% from top, max-width 768px, centered horizontally

## CSS Variables

All styling can be customized via CSS variables. Define them on a parent element or in `:root` to override defaults.

### Structure Tokens

| Variable                                  | Default | Description                                |
| ----------------------------------------- | ------- | ------------------------------------------ |
| `--stuic-command-menu-transition`         | `150ms` | Transition duration for hover/focus states |
| `--stuic-command-menu-options-max-height` | `15rem` | Maximum height of options container        |

### Color Tokens

| Variable                                      | Default                               | Description                            |
| --------------------------------------------- | ------------------------------------- | -------------------------------------- |
| `--stuic-command-menu-divider-color`          | `var(--stuic-color-border)`           | Border color between input and options |
| `--stuic-command-menu-group-header-color`     | `var(--stuic-color-muted-foreground)` | Option group header text color         |
| `--stuic-command-menu-group-header-font-size` | `var(--text-xs)`                      | Option group header font size          |

### Custom Theme Example

```svelte
<div
	style="
  --stuic-command-menu-divider-color: var(--color-blue-200);
"
>
	<CommandMenu ... />
</div>
```

### Global Theme Override

```css
/* In your app.css */
:root {
	--stuic-command-menu-options-max-height: 20rem;
	--stuic-command-menu-group-header-color: var(--color-indigo-500);
}
```

## Keyboard Navigation

- **Arrow Up/Down**: Navigate options
- **Cmd/Ctrl + Arrow Up**: Jump to first option
- **Cmd/Ctrl + Arrow Down**: Jump to last option
- **Enter**: Select active option
- **Escape**: Close menu (or clear input first)
- **Tab**: Focus back to search input
