# TabbedMenu

A horizontal tab navigation component built on semantic `ul/li` markup with ARIA accessibility support.

## Usage

```svelte
<script>
	import { TabbedMenu } from '@marianmeres/stuic';

	let activeTab = $state('tab1');

	const items = [
		{ id: 'tab1', label: 'First Tab' },
		{ id: 'tab2', label: 'Second Tab' },
		{ id: 'tab3', label: 'Third Tab', disabled: true },
	];
</script>

<TabbedMenu {items} bind:value={activeTab} />
```

## Props

| Prop                  | Type                              | Default     | Description                          |
| --------------------- | --------------------------------- | ----------- | ------------------------------------ |
| `items`               | `TabbedMenuItem[]`                | required    | Array of tab items                   |
| `value`               | `string \| number`                | `undefined` | Active tab id (bindable)             |
| `disabled`            | `boolean`                         | `false`     | Disable all tabs                     |
| `onSelect`            | `(item: TabbedMenuItem) => void`  | `undefined` | Callback when tab is selected        |
| `class`               | `string`                          | `undefined` | Class for the `ul` wrapper           |
| `classItem`           | `string`                          | `undefined` | Class for each `li` element          |
| `classButton`         | `string`                          | `undefined` | Class for tab buttons                |
| `classButtonActive`   | `string`                          | `undefined` | Additional class for active tab      |
| `classButtonDisabled` | `string`                          | `undefined` | Additional class for disabled tabs   |
| `unstyled`            | `boolean`                         | `false`     | Skip default styling                 |
| `el`                  | `HTMLUListElement`                | `undefined` | Element reference (bindable)         |

## TabbedMenuItem Interface

```typescript
interface TabbedMenuItem {
	id: string | number;
	label: THC; // Text, HTML, Component, or Snippet
	disabled?: boolean;
	class?: string;
	data?: Record<string, any>;
	onSelect?: () => void | boolean; // Return false to prevent selection
}
```

## CSS Variables

```css
/* Tab button */
--color-tabbed-menu-tab-bg
--color-tabbed-menu-tab-bg-dark
--color-tabbed-menu-tab-text
--color-tabbed-menu-tab-text-dark

/* Active tab */
--color-tabbed-menu-tab-active-bg
--color-tabbed-menu-tab-active-bg-dark
--color-tabbed-menu-tab-active-text
--color-tabbed-menu-tab-active-text-dark

/* Border */
--color-tabbed-menu-border
--color-tabbed-menu-border-dark

/* Sizing */
--tabbed-menu-border-radius: 0.5rem
--tabbed-menu-padding-x: 1rem
--tabbed-menu-padding-y: 0.5rem
--tabbed-menu-gap: 0.25rem
```

## Keyboard Navigation

- `ArrowRight` / `ArrowDown` - Move to next tab
- `ArrowLeft` / `ArrowUp` - Move to previous tab
- `Home` - Move to first tab
- `End` - Move to last tab
- `Enter` / `Space` - Select focused tab
