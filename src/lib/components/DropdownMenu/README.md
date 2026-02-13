# DropdownMenu

A feature-rich dropdown menu component with CSS Anchor Positioning (with fallback), full keyboard navigation, and support for multiple item types including expandable sections.

## Props

| Prop                     | Type                   | Default              | Description                              |
| ------------------------ | ---------------------- | -------------------- | ---------------------------------------- |
| `items`                  | `DropdownMenuItem[]`   | -                    | Menu items to display                    |
| `isOpen`                 | `boolean`              | `false`              | Controlled open state (bindable)         |
| `position`               | `DropdownMenuPosition` | `"bottom-span-left"` | Popover position relative to trigger     |
| `offset`                 | `string`               | `"0.25rem"`          | Offset from trigger element (CSS value)  |
| `maxHeight`              | `string`               | `"300px"`            | Max height of dropdown                   |
| `closeOnSelect`          | `boolean`              | `true`               | Close menu when action item is selected  |
| `closeOnClickOutside`    | `boolean`              | `true`               | Close on click outside                   |
| `closeOnEscape`          | `boolean`              | `true`               | Close on Escape key                      |
| `forceFallback`          | `boolean`              | `false`              | Force fallback positioning (for testing) |
| `class`                  | `string`               | -                    | Classes for wrapper element              |
| `classTrigger`           | `string`               | -                    | Classes for trigger button               |
| `classDropdown`          | `string`               | -                    | Classes for dropdown container           |
| `classItem`              | `string`               | -                    | Classes for action items                 |
| `classItemActive`        | `string`               | -                    | Classes for active/focused item          |
| `classItemDisabled`      | `string`               | -                    | Classes for disabled items               |
| `classDivider`           | `string`               | -                    | Classes for dividers                     |
| `classHeader`            | `string`               | -                    | Classes for header items                 |
| `classExpandable`        | `string`               | -                    | Classes for expandable section header    |
| `classExpandableContent` | `string`               | -                    | Classes for expandable section content   |
| `triggerEl`              | `HTMLButtonElement`    | -                    | Trigger element reference (bindable)     |
| `dropdownEl`             | `HTMLDivElement`       | -                    | Dropdown element reference (bindable)    |

## Snippets

| Snippet    | Parameters                         | Description                               |
| ---------- | ---------------------------------- | ----------------------------------------- |
| `trigger`  | `{ isOpen, toggle, triggerProps }` | Custom trigger with full ARIA control     |
| `children` | -                                  | Simple content for default trigger button |

## Item Types

### Action Item

Clickable menu item with optional icon and shortcut.

```typescript
interface DropdownMenuActionItem {
	type: "action";
	id: string | number;
	label: THC; // Text, HTML, or component
	icon?: THC; // Optional leading icon
	shortcut?: string; // Keyboard shortcut hint
	disabled?: boolean;
	onSelect?: () => void | boolean;
	class?: string;
	data?: Record<string, any>;
}
```

### Divider Item

Visual separator between items.

```typescript
interface DropdownMenuDividerItem {
	type: "divider";
	id?: string | number;
	class?: string;
}
```

### Header Item

Non-interactive section header.

```typescript
interface DropdownMenuHeaderItem {
	type: "header";
	id?: string | number;
	label: THC;
	class?: string;
}
```

### Custom Item

Render arbitrary content (non-interactive).

```typescript
interface DropdownMenuCustomItem {
	type: "custom";
	id?: string | number;
	content: THC;
	class?: string;
}
```

### Expandable Item

Collapsible section containing nested items.

```typescript
interface DropdownMenuExpandableItem {
	type: "expandable";
	id: string | number;
	label: THC;
	icon?: THC;
	items: DropdownMenuFlatItem[]; // Nested items (no nested expandables)
	defaultExpanded?: boolean;
	disabled?: boolean;
	class?: string;
}
```

## Position Options

| Position                                | Description                       |
| --------------------------------------- | --------------------------------- |
| `top`, `bottom`                         | Centered above/below trigger      |
| `top-left`, `top-right`                 | Above, aligned to left/right edge |
| `bottom-left`, `bottom-right`           | Below, aligned to left/right edge |
| `top-span-left`, `top-span-right`       | Above, spanning from left/right   |
| `bottom-span-left`, `bottom-span-right` | Below, spanning from left/right   |
| `left`, `right`                         | Side-by-side with trigger         |

## Callbacks

| Callback   | Parameters                       | Description                                 |
| ---------- | -------------------------------- | ------------------------------------------- |
| `onOpen`   | -                                | Called when menu opens                      |
| `onClose`  | -                                | Called when menu closes                     |
| `onSelect` | `(item: DropdownMenuActionItem)` | Called when action item selected (fallback) |

## Keyboard Navigation

| Key                | Action                           |
| ------------------ | -------------------------------- |
| `Arrow Down`       | Move to next item                |
| `Arrow Up`         | Move to previous item            |
| `Home`             | Move to first item               |
| `End`              | Move to last item                |
| `Cmd/Ctrl + Arrow` | Jump to first/last               |
| `Enter` / `Space`  | Select item or toggle expandable |
| `Arrow Right`      | Expand section (on expandable)   |
| `Arrow Left`       | Collapse section (on expandable) |
| `Escape`           | Close menu                       |
| `Tab`              | Close menu                       |

## Usage

### Basic Menu

```svelte
<script lang="ts">
	import { DropdownMenu } from "stuic";

	const items = [
		{ type: "action", id: "edit", label: "Edit" },
		{ type: "action", id: "duplicate", label: "Duplicate" },
		{ type: "divider" },
		{ type: "action", id: "delete", label: "Delete", class: "text-red-500" },
	];
</script>

<DropdownMenu {items} onSelect={(item) => console.log("Selected:", item.id)}>
	Actions
</DropdownMenu>
```

### With Icons and Shortcuts

```svelte
<script lang="ts">
	import { DropdownMenu } from "stuic";
	import { iconLucideEdit } from "@marianmeres/icons-fns/lucide/iconLucideEdit.js";
	import { iconLucideTrash } from "@marianmeres/icons-fns/lucide/iconLucideTrash.js";

	const items = [
		{
			type: "action",
			id: "edit",
			label: "Edit",
			icon: iconLucideEdit({ size: 16 }),
			shortcut: "Cmd+E",
			onSelect: () => handleEdit(),
		},
		{ type: "divider" },
		{
			type: "action",
			id: "delete",
			label: "Delete",
			icon: iconLucideTrash({ size: 16 }),
			shortcut: "Cmd+D",
			onSelect: () => handleDelete(),
		},
	];
</script>

<DropdownMenu {items} position="bottom-right">More Options</DropdownMenu>
```

### With Section Headers

```svelte
<DropdownMenu
	items={[
		{ type: "header", label: "Navigation" },
		{ type: "action", id: "dashboard", label: "Dashboard" },
		{ type: "action", id: "settings", label: "Settings" },
		{ type: "divider" },
		{ type: "header", label: "Account" },
		{ type: "action", id: "profile", label: "Profile" },
		{ type: "action", id: "logout", label: "Logout" },
	]}
/>
```

### Expandable Sections

```svelte
<DropdownMenu
	items={[
		{ type: "action", id: "new", label: "New File" },
		{
			type: "expandable",
			id: "recent",
			label: "Recent Files",
			defaultExpanded: true,
			items: [
				{ type: "action", id: "file1", label: "document.pdf" },
				{ type: "action", id: "file2", label: "report.xlsx" },
				{ type: "action", id: "file3", label: "notes.txt" },
			],
		},
		{ type: "divider" },
		{ type: "action", id: "settings", label: "Settings" },
	]}
/>
```

### Custom Trigger

```svelte
<script lang="ts">
	import { Avatar, DropdownMenu } from "stuic";
</script>

<DropdownMenu
	items={[
		{ type: "action", id: "profile", label: "View Profile" },
		{ type: "action", id: "logout", label: "Logout" },
	]}
>
	{#snippet trigger({ isOpen, toggle, triggerProps })}
		<button {...triggerProps} onclick={toggle}>
			<Avatar input="john.doe@example.com" autoColor />
		</button>
	{/snippet}
</DropdownMenu>
```

### With Custom Content

```svelte
<script lang="ts">
	import { DropdownMenu } from "stuic";
</script>

<DropdownMenu
	items={[
		{
			type: "custom",
			content: customHeader,
		},
		{ type: "divider" },
		{ type: "action", id: "settings", label: "Settings" },
		{ type: "action", id: "logout", label: "Logout" },
	]}
/>

{#snippet customHeader()}
	<div class="px-3 py-2 text-center">
		<img src="/avatar.jpg" class="w-12 h-12 rounded-full mx-auto" alt="User" />
		<div class="mt-2 font-semibold">John Doe</div>
		<div class="text-sm text-gray-500">john@example.com</div>
	</div>
{/snippet}
```

### Controlled State

```svelte
<script lang="ts">
	import { DropdownMenu } from "stuic";

	let isOpen = $state(false);
</script>

<button onclick={() => (isOpen = true)}>Open Menu</button>

<DropdownMenu
	bind:isOpen
	items={[
		{ type: "action", id: "option1", label: "Option 1" },
		{ type: "action", id: "option2", label: "Option 2" },
	]}
/>
```

## Features

- **CSS Anchor Positioning**: Uses modern CSS anchor positioning with automatic fallback for unsupported browsers
- **Full Keyboard Navigation**: Complete arrow key navigation with Home/End support
- **Expandable Sections**: Collapsible groups with independent toggle state
- **ARIA Compliant**: Proper menu roles and keyboard interaction
- **Reduced Motion**: Respects user's reduced motion preference
- **Click Outside**: Automatically closes when clicking outside
- **Focus Management**: Returns focus to trigger on close

## CSS Variables

Override these tokens globally in `:root` or locally via inline `style`:

### Structure Tokens

| Variable                           | Default           | Description                            |
| ---------------------------------- | ----------------- | -------------------------------------- |
| `--stuic-dropdown-menu-radius`     | `--radius-md`     | Border radius for trigger and dropdown |
| `--stuic-dropdown-menu-padding`    | `--spacing * 1`   | Inner padding of dropdown container    |
| `--stuic-dropdown-menu-gap`        | `--spacing * 0.5` | Gap between trigger content            |
| `--stuic-dropdown-menu-min-width`  | `12rem`           | Minimum width of dropdown              |
| `--stuic-dropdown-menu-transition` | `150ms`           | Transition duration                    |

### Container Colors

| Variable                       | Default                            | Description               |
| ------------------------------ | ---------------------------------- | ------------------------- |
| `--stuic-dropdown-menu-bg`     | `--stuic-color-surface`            | Dropdown background color |
| `--stuic-dropdown-menu-text`   | `--stuic-color-surface-foreground` | Dropdown text color       |
| `--stuic-dropdown-menu-border` | `--stuic-color-border`             | Dropdown border color     |
| `--stuic-dropdown-menu-shadow` | subtle shadow                      | Dropdown shadow           |

### Trigger Button

| Variable                                      | Default                                   | Description                |
| --------------------------------------------- | ----------------------------------------- | -------------------------- |
| `--stuic-dropdown-menu-trigger-bg`            | `--stuic-color-surface`                   | Trigger background         |
| `--stuic-dropdown-menu-trigger-bg-hover`      | `--stuic-color-surface-hover`             | Trigger hover background   |
| `--stuic-dropdown-menu-trigger-bg-active`     | `--stuic-color-surface-active`            | Trigger active background  |
| `--stuic-dropdown-menu-trigger-text`          | `--stuic-color-surface-foreground`        | Trigger text color         |
| `--stuic-dropdown-menu-trigger-text-hover`    | `--stuic-color-surface-foreground-hover`  | Trigger hover text color   |
| `--stuic-dropdown-menu-trigger-text-active`   | `--stuic-color-surface-foreground-active` | Trigger active text color  |
| `--stuic-dropdown-menu-trigger-border`        | `--stuic-color-border`                    | Trigger border color       |
| `--stuic-dropdown-menu-trigger-border-hover`  | `--stuic-color-border-hover`              | Trigger hover border       |
| `--stuic-dropdown-menu-trigger-border-active` | `--stuic-color-border-active`             | Trigger active border      |
| `--stuic-dropdown-menu-trigger-padding-x`     | `--spacing * 3`                           | Trigger horizontal padding |
| `--stuic-dropdown-menu-trigger-padding-y`     | `--spacing * 2`                           | Trigger vertical padding   |

### Focus Ring

| Variable                            | Default              | Description       |
| ----------------------------------- | -------------------- | ----------------- |
| `--stuic-dropdown-menu-ring-width`  | `3px`                | Focus ring width  |
| `--stuic-dropdown-menu-ring-offset` | `0px`                | Focus ring offset |
| `--stuic-dropdown-menu-ring-color`  | `--stuic-color-ring` | Focus ring color  |

### Divider

| Variable                                 | Default                | Description             |
| ---------------------------------------- | ---------------------- | ----------------------- |
| `--stuic-dropdown-menu-divider-bg`       | `--stuic-color-border` | Divider color           |
| `--stuic-dropdown-menu-divider-height`   | `1px`                  | Divider height          |
| `--stuic-dropdown-menu-divider-margin-y` | `--spacing * 1`        | Divider vertical margin |

### Header (Section Label)

| Variable                                      | Default                          | Description               |
| --------------------------------------------- | -------------------------------- | ------------------------- |
| `--stuic-dropdown-menu-header-text`           | `--stuic-color-muted-foreground` | Header text color         |
| `--stuic-dropdown-menu-header-font-size`      | `--text-xs`                      | Header font size          |
| `--stuic-dropdown-menu-header-font-weight`    | `--font-weight-semibold`         | Header font weight        |
| `--stuic-dropdown-menu-header-padding-x`      | `--spacing * 2`                  | Header horizontal padding |
| `--stuic-dropdown-menu-header-padding-y`      | `--spacing * 1.5`                | Header vertical padding   |
| `--stuic-dropdown-menu-header-letter-spacing` | `0.05em`                         | Header letter spacing     |
| `--stuic-dropdown-menu-header-text-transform` | `uppercase`                      | Header text transform     |

### Backdrop (Fallback Mode)

| Variable                                 | Default             | Description      |
| ---------------------------------------- | ------------------- | ---------------- |
| `--stuic-dropdown-menu-backdrop-bg`      | `rgb(0 0 0 / 0.25)` | Backdrop color   |
| `--stuic-dropdown-menu-backdrop-z-index` | `40`                | Backdrop z-index |

### Close Button (Fallback Mode)

| Variable                                    | Default                    | Description                |
| ------------------------------------------- | -------------------------- | -------------------------- |
| `--stuic-dropdown-menu-close-bg`            | `--stuic-color-foreground` | Close button background    |
| `--stuic-dropdown-menu-close-text`          | `--stuic-color-background` | Close button text color    |
| `--stuic-dropdown-menu-close-opacity`       | `0.6`                      | Close button opacity       |
| `--stuic-dropdown-menu-close-opacity-hover` | `1`                        | Close button hover opacity |

### Expandable Section

| Variable                                  | Default         | Description               |
| ----------------------------------------- | --------------- | ------------------------- |
| `--stuic-dropdown-menu-expandable-indent` | `--spacing * 4` | Expandable content indent |

## Customization Examples

### Global Override

```css
/* Custom theme: pill-shaped dropdowns with more padding */
:root {
	--stuic-dropdown-menu-radius: 9999px;
	--stuic-dropdown-menu-padding: 1rem;
	--stuic-dropdown-menu-trigger-bg: var(--color-blue-500);
	--stuic-dropdown-menu-trigger-text: white;
}
```

### Local Override

```svelte
<DropdownMenu
	style="--stuic-dropdown-menu-radius: 0; --stuic-dropdown-menu-shadow: none;"
	{items}
>
	Sharp Corners, No Shadow
</DropdownMenu>
```

### Using Class Props

Class props override default styling with Tailwind classes:

```svelte
<!-- Blue-themed dropdown -->
<DropdownMenu
	{items}
	classTrigger="bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
	classDropdown="bg-blue-50 dark:bg-blue-950 border-blue-200"
	classItem="hover:bg-blue-100 dark:hover:bg-blue-900"
>
	Blue Theme
</DropdownMenu>
```

Class props always win over CSS variables due to Tailwind's specificity.
