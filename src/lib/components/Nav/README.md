# Nav

A navigation component for sidebars with support for groups, nested items, dividers and headers at every level, expand/collapse behavior, collapsed icon-only mode, and localStorage persistence.

## Props

| Prop                   | Type                                                | Default       | Description                                                                             |
| ---------------------- | --------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `groups`               | `NavGroupEntry[]`                                   | -             | Navigation groups to render, optionally mixed with dividers and headers                 |
| `title`                | `MaybeLocalized`                                    | -             | Section title above groups (uppercase, non-interactive)                                 |
| `locale`               | `string \| string[]`                                | -             | Locale (or preference chain) for localized labels                                       |
| `isCollapsed`          | `boolean`                                           | `false`       | Collapsed mode (icon-only)                                                              |
| `isExpanding`          | `boolean`                                           | `false`       | Transitioning from collapsed to expanded                                                |
| `activeId`             | `string`                                            | -             | Active item ID for highlighting                                                         |
| `isActive`             | `(item: NavItem) => boolean`                        | -             | Custom active check callback                                                            |
| `isGroupActive`        | `(group: NavGroup) => boolean`                      | -             | Custom group active check callback                                                      |
| `onSelect`             | `(item: NavItem) => void`                           | -             | Item selection callback                                                                 |
| `onGroupSelect`        | `(group: NavGroup) => void`                         | -             | Group selection callback (groups without items)                                         |
| `onGroupToggle`        | `(groupIndex: number, isExpanded: boolean) => void` | -             | Group expand/collapse callback (`groupIndex` counts dividers and headers in `groups`)   |
| `touchFriendly`        | `boolean \| "auto"`                                 | `false`       | Touch-friendly sizing mode                                                              |
| `persistState`         | `boolean`                                           | `true`        | Enable localStorage persistence for expand/collapse state                               |
| `storageKeyPrefix`     | `string`                                            | `"stuic-nav"` | Storage key prefix for localStorage                                                     |
| `sectionId`            | `string`                                            | -             | Keys the collapsible title's saved state per section when several `Nav`s share a prefix |
| `collapsibleTitle`     | `boolean`                                           | `false`       | Make the section title clickable to collapse all groups                                 |
| `defaultTitleExpanded` | `boolean`                                           | `true`        | Initial expanded state when `collapsibleTitle` is true                                  |
| `onTitleToggle`        | `(isExpanded: boolean) => void`                     | -             | Callback when the section title is toggled                                              |
| `class`                | `string`                                            | -             | Classes for wrapper element                                                             |
| `classTitle`           | `string`                                            | -             | Classes for section title                                                               |
| `classGroupTitle`      | `string`                                            | -             | Classes for group title/header                                                          |
| `classItem`            | `string`                                            | -             | Classes for individual items                                                            |
| `classItemActive`      | `string`                                            | -             | Classes for active items                                                                |
| `classItemCollapsed`   | `string`                                            | -             | Classes for collapsed mode items                                                        |
| `classItemDisabled`    | `string`                                            | -             | Classes for disabled items                                                              |
| `classIcon`            | `string`                                            | -             | Classes for icons                                                                       |
| `classLabel`           | `string`                                            | -             | Classes for labels                                                                      |
| `classChildren`        | `string`                                            | -             | Classes for children container                                                          |
| `classChevron`         | `string`                                            | -             | Classes for chevron icon                                                                |
| `classDivider`         | `string`                                            | -             | Classes for dividers (every level)                                                      |
| `classHeader`          | `string`                                            | -             | Classes for headers (every level)                                                       |
| `unstyled`             | `boolean`                                           | `false`       | Skip all default styling                                                                |
| `el`                   | `HTMLElement`                                       | -             | Element reference (bindable)                                                            |

## Interfaces

### NavGroup

A navigation group containing a title and items. Groups without items act as clickable nav items.

```typescript
interface NavGroup {
	/** Optional discriminant, never required */
	type?: "group";
	/** Group title (supports localization) */
	title: MaybeLocalized;
	/** Navigation items, optionally mixed with dividers and headers (no items = group acts as nav item) */
	items?: NavItemEntry[];
	/** Group icon (optional) */
	icon?: THC;
	/** Whether the group starts expanded (default: false — groups are collapsed by default) */
	defaultExpanded?: boolean;
	/** Navigation URL for groups without items */
	href?: string;
	/** Click handler for groups without items */
	onClick?: () => void;
	/** Unique identifier (used for activeId matching and localStorage persistence) */
	id?: string;
}
```

### NavItem

A navigation item within a group. Items with children become expandable toggles.

```typescript
interface NavItem {
	/** Optional discriminant, never required */
	type?: "item";
	/** Unique identifier for the item */
	id: string;
	/** Display label (supports localization) */
	label: MaybeLocalized;
	/** Navigation URL (use href OR onClick, not both) */
	href?: string;
	/** Click handler (alternative to href) */
	onClick?: () => void;
	/** Icon content (THC for flexibility: string, html, component) */
	icon?: THC;
	/** Nested children, optionally mixed with dividers and headers - parent items with children become expand/collapse toggles */
	children?: NavItemEntry[];
	/** Whether this item is disabled */
	disabled?: boolean;
	/** Additional CSS classes */
	class?: string;
	/** Arbitrary data to pass through */
	data?: Record<string, unknown>;
}
```

### NavDivider

A break between entries. Draws a subtle line, or with `line: false` a blank break of the same height. Non-interactive (`role="separator"`).

```typescript
interface NavDivider {
	type: "divider";
	/** Draw the line (default: true). `false` leaves a blank break of the same height. */
	line?: boolean;
	/** Optional key. Defaults to the entry's position. */
	id?: string;
	/** Additional CSS classes */
	class?: string;
}
```

### NavHeader

A non-interactive heading. It labels the entries after it, up to the next divider or header, without nesting them.

```typescript
interface NavHeader {
	type: "header";
	/** Heading text (supports localization) */
	label: MaybeLocalized;
	/** Optional key. Defaults to the entry's position. */
	id?: string;
	/** Additional CSS classes */
	class?: string;
}
```

### Entry unions

```typescript
type NavGroupEntry = NavGroup | NavDivider | NavHeader; // entries of `groups`
type NavItemEntry = NavItem | NavDivider | NavHeader; // entries of `items` and `children`
```

Callbacks (`onSelect`, `isActive`, `onGroupSelect`, `isGroupActive`) only ever receive real items and groups. Code that walks its own nav tree narrows on `type`: `if (entry.type === "divider" || entry.type === "header") continue;`.

## Usage

### Basic Navigation

```svelte
<script lang="ts">
	import { Nav } from "stuic";

	const groups = [
		{
			id: "main",
			title: "Main",
			items: [
				{ id: "dashboard", label: "Dashboard", href: "/dashboard" },
				{ id: "analytics", label: "Analytics", href: "/analytics" },
				{ id: "reports", label: "Reports", href: "/reports" },
			],
		},
		{
			id: "settings",
			title: "Settings",
			items: [
				{ id: "profile", label: "Profile", href: "/settings/profile" },
				{ id: "account", label: "Account", href: "/settings/account" },
			],
		},
	];
</script>

<Nav {groups} activeId="dashboard" />
```

### With Icons

```svelte
<script lang="ts">
	import { Nav } from "stuic";
	import { iconLucideHome } from "@marianmeres/icons-fns/lucide/iconLucideHome.js";
	import { iconLucideSettings } from "@marianmeres/icons-fns/lucide/iconLucideSettings.js";

	const groups = [
		{
			id: "main",
			title: "Navigation",
			items: [
				{ id: "home", label: "Home", href: "/", icon: iconLucideHome({ size: 18 }) },
				{
					id: "settings",
					label: "Settings",
					href: "/settings",
					icon: iconLucideSettings({ size: 18 }),
				},
			],
		},
	];
</script>

<Nav {groups} />
```

### Nested Items

Items with children become expandable sections.

```svelte
<script lang="ts">
	import { Nav } from "stuic";

	const groups = [
		{
			id: "docs",
			title: "Documentation",
			items: [
				{
					id: "getting-started",
					label: "Getting Started",
					children: [
						{ id: "installation", label: "Installation", href: "/docs/installation" },
						{ id: "quick-start", label: "Quick Start", href: "/docs/quick-start" },
					],
				},
				{
					id: "components",
					label: "Components",
					children: [
						{ id: "button", label: "Button", href: "/docs/button" },
						{ id: "input", label: "Input", href: "/docs/input" },
						{ id: "nav", label: "Nav", href: "/docs/nav" },
					],
				},
			],
		},
	];
</script>

<Nav {groups} />
```

### Groups Without Items

Groups without items act as regular nav items (no chevron, directly clickable).

```svelte
<script lang="ts">
	import { Nav } from "stuic";
	import { iconLucideHome } from "@marianmeres/icons-fns/lucide/iconLucideHome.js";

	const groups = [
		{
			id: "home",
			title: "Home",
			href: "/",
			icon: iconLucideHome({ size: 18 }),
		},
		{
			id: "main",
			title: "Main",
			items: [
				{ id: "dashboard", label: "Dashboard", href: "/dashboard" },
				{ id: "settings", label: "Settings", href: "/settings" },
			],
		},
	];
</script>

<Nav {groups} activeId="home" />
```

### Dividers and Headers

Separate a long list logically without adding a level of nesting. Dividers and headers can be mixed in at every level: among `groups`, among a group's `items`, and among an item's `children`.

```svelte
<script lang="ts">
	import { Nav, type NavGroupEntry } from "stuic";

	const groups: NavGroupEntry[] = [
		{ id: "home", title: "Home", href: "/" },
		{ type: "divider" },
		{ type: "header", label: "Workspace" },
		{
			id: "catalog",
			title: "Catalog",
			items: [
				{ id: "products", label: "Products", href: "/products" },
				{ id: "categories", label: "Categories", href: "/categories" },
				{ type: "divider", line: false }, // blank break
				{ id: "inventory", label: "Inventory", href: "/inventory" },
				{
					id: "io",
					label: "Imports & exports",
					children: [
						{ type: "header", label: "Import" },
						{ id: "import-csv", label: "From CSV", href: "/import/csv" },
						{ type: "header", label: "Export" },
						{ id: "export-csv", label: "To CSV", href: "/export/csv" },
					],
				},
			],
		},
		{ type: "divider" },
		{ id: "help", title: "Help", href: "/help" },
	];
</script>

<Nav {groups} />
```

**Separators with nothing to separate are not rendered**, so a list you filter (e.g. by permission) never shows a dangling header or a double line:

- a header whose section — the entries up to the next divider or header — holds no item or group,
- a divider with no item or group before it, or none after it,
- every divider of a run but the first.

This happens at render time only. Your arrays are not modified, and `onGroupToggle`'s `groupIndex` still counts positions in `groups`, dividers and headers included.

A divider or header never makes a group or item expandable: a group whose `items` hold only dividers/headers behaves like a group without items.

In collapsed (icon-only) mode, dividers shrink to the icon column and headers render as divider lines, with the label kept as screen-reader-only text. A header directly below a line divider adds no second line.

Styling tokens (override globally on `:root` or locally via `style`): `--stuic-nav-divider-color`, `--stuic-nav-divider-thickness`, `--stuic-nav-divider-spacing`, `--stuic-nav-header-padding-x`, `--stuic-nav-header-padding-top`, `--stuic-nav-header-padding-bottom`, `--stuic-nav-header-font-size`, `--stuic-nav-header-font-weight`, `--stuic-nav-header-opacity`, `--stuic-nav-header-letter-spacing`, `--stuic-nav-header-text-transform`.

### Collapsed Mode

In collapsed mode, only icons are shown with tooltips on hover.

```svelte
<script lang="ts">
	import { Nav } from "stuic";

	let isCollapsed = $state(false);
</script>

<button onclick={() => (isCollapsed = !isCollapsed)}> Toggle Sidebar </button>

<Nav {groups} {isCollapsed} />
```

### localStorage Persistence

Expand/collapse state is persisted to localStorage by default. Groups and items must have an `id` for their state to be persisted.

```svelte
<!-- Persistence enabled (default) -->
<Nav {groups} />

<!-- Disable persistence -->
<Nav {groups} persistState={false} />

<!-- Custom storage key prefix (for multiple Nav instances) -->
<Nav {groups} storageKeyPrefix="my-app-sidebar" />
```

Storage keys follow the pattern:

- Groups: `{prefix}-group-{groupId}`
- Items: `{prefix}-item-{itemId}`
- Section title (when `collapsibleTitle`): `{prefix}-section`, or `{prefix}-section-{sectionId}` when `sectionId` is given

### Collapsible Section Title

Opt in with `collapsibleTitle` to make the section title clickable. Clicking it expands or collapses all groups beneath it as a unit. The expanded state is persisted (under `{storageKeyPrefix}-section`, or `{storageKeyPrefix}-section-{sectionId}` when `sectionId` is given) unless `persistState={false}`.

```svelte
<Nav title="Main" {groups} collapsibleTitle />

<!-- Start collapsed -->
<Nav title="Main" {groups} collapsibleTitle defaultTitleExpanded={false} />

<!-- React to toggle -->
<Nav
	title="Main"
	{groups}
	collapsibleTitle
	onTitleToggle={(expanded) => console.log("section expanded:", expanded)}
/>

<!-- Several collapsible sections sharing one prefix: give each its own sectionId -->
<Nav title="Plan" groups={planGroups} collapsibleTitle sectionId="plan" />
<Nav title="Stock" groups={stockGroups} collapsibleTitle sectionId="stock" />
```

Several `Nav`s may share a `storageKeyPrefix` on purpose, so that a group's memory (keyed by the group's id) follows the group wherever it is rendered. The section title, however, is keyed by the prefix alone, so collapsible sections sharing a prefix would all read and write the same `-section` key and the last one toggled would decide for all of them. Give each such section a `sectionId` to keep their states apart.

Note: in icon-only sidebar mode (`isCollapsed`), the section title is visually hidden but the saved collapsed state is still respected — if a user collapsed the section in expanded-sidebar mode, its groups will stay hidden in icon-only mode too.

### Custom Active Check

```svelte
<script lang="ts">
	import { Nav } from "stuic";
	import { page } from "$app/state";

	const groups = [/* ... */];
</script>

<Nav
	{groups}
	isActive={(item) => page.url.pathname === item.href}
	isGroupActive={(group) => page.url.pathname === group.href}
/>
```

### Touch-Friendly Mode

```svelte
<!-- Always touch-friendly -->
<Nav {groups} touchFriendly />

<!-- Auto-detect based on device -->
<Nav {groups} touchFriendly="auto" />
```

### With Selection Callbacks

```svelte
<script lang="ts">
	import { Nav } from "stuic";
	import { goto } from "$app/navigation";

	function handleSelect(item) {
		console.log("Selected:", item.id);
		if (item.href) goto(item.href);
	}

	function handleGroupToggle(index, isExpanded) {
		console.log(`Group ${index} is now ${isExpanded ? "expanded" : "collapsed"}`);
	}
</script>

<Nav {groups} onSelect={handleSelect} onGroupToggle={handleGroupToggle} />
```

## Features

- **Hierarchical Navigation**: Groups with items, nested items with children
- **Dividers and Headers**: Logical sections at any level without extra nesting; ones left with nothing to separate are skipped
- **Expand/Collapse**: Groups and nested items can be expanded/collapsed
- **localStorage Persistence**: Expand/collapse state persists across page reloads
- **Collapsed Mode**: Icon-only sidebar with tooltips
- **Active State**: Highlight current item via `activeId` or custom callback
- **Localization**: Labels support `MaybeLocalized`, resolved via `tr()` against `locale` (a single locale or a preference chain); a missing translation falls back to the label's first non-empty entry, never to `[object Object]`
- **Touch-Friendly**: Auto-detect or manually enable larger touch targets
- **ARIA Compliant**: Proper roles and aria-expanded attributes
- **Reduced Motion**: Respects user's reduced motion preference
- **SSR Safe**: localStorage persistence handles SSR gracefully

## CSS Classes

The component applies these base classes (when `unstyled` is false):

| Class                     | Element                |
| ------------------------- | ---------------------- |
| `stuic-nav`               | Root `<nav>` element   |
| `stuic-nav-section-title` | Section title          |
| `stuic-nav-group-title`   | Group header/toggle    |
| `stuic-nav-item`          | Individual nav items   |
| `stuic-nav-children`      | Nested items container |
| `stuic-nav-divider`       | Divider (every level)  |
| `stuic-nav-header`        | Header (every level)   |

### Data Attributes

| Attribute             | Applied When                                          |
| --------------------- | ----------------------------------------------------- |
| `data-collapsed`      | Sidebar is in collapsed mode                          |
| `data-expanding`      | Transitioning from collapsed to expanded              |
| `data-active`         | Item/group is currently active                        |
| `data-touch-friendly` | Touch-friendly mode is active                         |
| `data-has-children`   | Item has nested children                              |
| `data-disabled`       | Item is disabled                                      |
| `data-interactive`    | Section title is clickable (`collapsibleTitle` is on) |
| `data-expanded`       | Section title's content is currently expanded         |
| `data-blank`          | Divider has `line: false`                             |
