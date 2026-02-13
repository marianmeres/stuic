# TabbedMenu

A horizontal tab navigation component built on semantic `ul/li` markup with ARIA accessibility support.

## Usage

```svelte
<script>
	import { TabbedMenu } from "@marianmeres/stuic";

	let activeTab = $state("tab1");

	const items = [
		{ id: "tab1", label: "First Tab" },
		{ id: "tab2", label: "Second Tab" },
		{ id: "tab3", label: "Third Tab", disabled: true },
	];
</script>

<TabbedMenu {items} bind:value={activeTab} />
```

## Props

| Prop                  | Type                             | Default     | Description                        |
| --------------------- | -------------------------------- | ----------- | ---------------------------------- |
| `items`               | `TabbedMenuItem[]`               | required    | Array of tab items                 |
| `value`               | `string \| number`               | `undefined` | Active tab id (bindable)           |
| `disabled`            | `boolean`                        | `false`     | Disable all tabs                   |
| `onSelect`            | `(item: TabbedMenuItem) => void` | `undefined` | Callback when tab is selected      |
| `class`               | `string`                         | `undefined` | Class for the `ul` wrapper         |
| `classItem`           | `string`                         | `undefined` | Class for each `li` element        |
| `classButton`         | `string`                         | `undefined` | Class for tab buttons              |
| `classButtonActive`   | `string`                         | `undefined` | Additional class for active tab    |
| `classButtonDisabled` | `string`                         | `undefined` | Additional class for disabled tabs |
| `unstyled`            | `boolean`                        | `false`     | Skip default styling               |
| `el`                  | `HTMLUListElement`               | `undefined` | Element reference (bindable)       |

## TabbedMenuItem Interface

```typescript
interface TabbedMenuItem {
	id: string | number;
	label: THC; // Text, HTML, Component, or Snippet
	disabled?: boolean;
	class?: string;
	data?: Record<string, any>;
	onSelect?: () => void | boolean; // Return false to prevent selection
	href?: string; // Render as anchor instead of button
}
```

## CSS Variables

### Component Tokens

Override to customize appearance:

| Variable                                 | Default                          | Description                     |
| ---------------------------------------- | -------------------------------- | ------------------------------- |
| `--stuic-tabbed-menu-tab-bg`             | `--stuic-color-muted`            | Tab background                  |
| `--stuic-tabbed-menu-tab-text`           | `--stuic-color-muted-foreground` | Tab text color                  |
| `--stuic-tabbed-menu-tab-bg-active`      | `--stuic-color-surface`          | Active tab background           |
| `--stuic-tabbed-menu-tab-text-active`    | `--stuic-color-foreground`       | Active tab text color           |
| `--stuic-tabbed-menu-border`             | `--stuic-color-border`           | Border color                    |
| `--stuic-tabbed-menu-border-active`      | `--stuic-color-primary`          | Active tab border color         |
| `--stuic-tabbed-menu-gap`                | `calc(var(--spacing) * 1)`       | Gap between tabs                |
| `--stuic-tabbed-menu-radius`             | `var(--radius-md)`               | Tab border radius (top corners) |
| `--stuic-tabbed-menu-padding-x`          | `calc(var(--spacing) * 4)`       | Horizontal padding              |
| `--stuic-tabbed-menu-padding-y`          | `calc(var(--spacing) * 2)`       | Vertical padding                |
| `--stuic-tabbed-menu-transition`         | `150ms`                          | Transition duration             |
| `--stuic-tabbed-menu-font-weight-active` | `var(--font-weight-medium)`      | Active tab font weight          |
| `--stuic-tabbed-menu-item-max-width`     | `10rem`                          | Max width per tab item          |

### Example Overrides

```css
/* Global override */
:root {
	--stuic-tabbed-menu-tab-bg-active: var(--color-indigo-100);
	--stuic-tabbed-menu-tab-text-active: var(--color-indigo-900);
	--stuic-tabbed-menu-radius: var(--radius-lg);
}
```

```svelte
<!-- Local override -->
<TabbedMenu
	{items}
	style="--stuic-tabbed-menu-radius: 9999px; --stuic-tabbed-menu-padding-x: 2rem;"
/>
```

## Keyboard Navigation

- `ArrowRight` / `ArrowDown` - Move to next tab
- `ArrowLeft` / `ArrowUp` - Move to previous tab
- `Home` - Move to first tab
- `End` - Move to last tab
- `Enter` / `Space` - Select focused tab
