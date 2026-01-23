# Nav

A navigation component for sidebars with support for groups, nested items, expand/collapse behavior, collapsed icon-only mode, and localStorage persistence.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `NavGroup[]` | - | Navigation groups to render |
| `title` | `MaybeLocalized` | - | Section title above groups (uppercase, non-interactive) |
| `locale` | `string` | - | Current locale for localized labels |
| `isCollapsed` | `boolean` | `false` | Collapsed mode (icon-only) |
| `isExpanding` | `boolean` | `false` | Transitioning from collapsed to expanded |
| `activeId` | `string` | - | Active item ID for highlighting |
| `isActive` | `(item: NavItem) => boolean` | - | Custom active check callback |
| `isGroupActive` | `(group: NavGroup) => boolean` | - | Custom group active check callback |
| `onSelect` | `(item: NavItem) => void` | - | Item selection callback |
| `onGroupSelect` | `(group: NavGroup) => void` | - | Group selection callback (groups without items) |
| `onGroupToggle` | `(groupIndex: number, isExpanded: boolean) => void` | - | Group expand/collapse callback |
| `touchFriendly` | `boolean \| "auto"` | `false` | Touch-friendly sizing mode |
| `persistState` | `boolean` | `true` | Enable localStorage persistence for expand/collapse state |
| `storageKeyPrefix` | `string` | `"stuic-nav"` | Storage key prefix for localStorage |
| `class` | `string` | - | Classes for wrapper element |
| `classTitle` | `string` | - | Classes for section title |
| `classGroupTitle` | `string` | - | Classes for group title/header |
| `classItem` | `string` | - | Classes for individual items |
| `classItemActive` | `string` | - | Classes for active items |
| `classItemCollapsed` | `string` | - | Classes for collapsed mode items |
| `classItemDisabled` | `string` | - | Classes for disabled items |
| `classIcon` | `string` | - | Classes for icons |
| `classLabel` | `string` | - | Classes for labels |
| `classChildren` | `string` | - | Classes for children container |
| `classChevron` | `string` | - | Classes for chevron icon |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `el` | `HTMLElement` | - | Element reference (bindable) |

## Interfaces

### NavGroup

A navigation group containing a title and items. Groups without items act as clickable nav items.

```typescript
interface NavGroup {
  /** Group title (supports localization) */
  title: MaybeLocalized;
  /** Navigation items in this group (empty = group acts as nav item) */
  items?: NavItem[];
  /** Group icon (optional) */
  icon?: THC;
  /** Whether the group starts collapsed */
  defaultCollapsed?: boolean;
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
  /** Nested children - parent items with children become expand/collapse toggles */
  children?: NavItem[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  class?: string;
  /** Arbitrary data to pass through */
  data?: Record<string, unknown>;
}
```

## Usage

### Basic Navigation

```svelte
<script lang="ts">
  import { Nav } from 'stuic';

  const groups = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'analytics', label: 'Analytics', href: '/analytics' },
        { id: 'reports', label: 'Reports', href: '/reports' },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        { id: 'profile', label: 'Profile', href: '/settings/profile' },
        { id: 'account', label: 'Account', href: '/settings/account' },
      ],
    },
  ];
</script>

<Nav {groups} activeId="dashboard" />
```

### With Icons

```svelte
<script lang="ts">
  import { Nav } from 'stuic';
  import { iconLucideHome } from '@marianmeres/icons-fns/lucide/iconLucideHome.js';
  import { iconLucideSettings } from '@marianmeres/icons-fns/lucide/iconLucideSettings.js';

  const groups = [
    {
      id: 'main',
      title: 'Navigation',
      items: [
        { id: 'home', label: 'Home', href: '/', icon: iconLucideHome({ size: 18 }) },
        { id: 'settings', label: 'Settings', href: '/settings', icon: iconLucideSettings({ size: 18 }) },
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
  import { Nav } from 'stuic';

  const groups = [
    {
      id: 'docs',
      title: 'Documentation',
      items: [
        {
          id: 'getting-started',
          label: 'Getting Started',
          children: [
            { id: 'installation', label: 'Installation', href: '/docs/installation' },
            { id: 'quick-start', label: 'Quick Start', href: '/docs/quick-start' },
          ],
        },
        {
          id: 'components',
          label: 'Components',
          children: [
            { id: 'button', label: 'Button', href: '/docs/button' },
            { id: 'input', label: 'Input', href: '/docs/input' },
            { id: 'nav', label: 'Nav', href: '/docs/nav' },
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
  import { Nav } from 'stuic';
  import { iconLucideHome } from '@marianmeres/icons-fns/lucide/iconLucideHome.js';

  const groups = [
    {
      id: 'home',
      title: 'Home',
      href: '/',
      icon: iconLucideHome({ size: 18 }),
    },
    {
      id: 'main',
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'settings', label: 'Settings', href: '/settings' },
      ],
    },
  ];
</script>

<Nav {groups} activeId="home" />
```

### Collapsed Mode

In collapsed mode, only icons are shown with tooltips on hover.

```svelte
<script lang="ts">
  import { Nav } from 'stuic';

  let isCollapsed = $state(false);
</script>

<button onclick={() => isCollapsed = !isCollapsed}>
  Toggle Sidebar
</button>

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

### Custom Active Check

```svelte
<script lang="ts">
  import { Nav } from 'stuic';
  import { page } from '$app/stores';

  const groups = [/* ... */];
</script>

<Nav
  {groups}
  isActive={(item) => $page.url.pathname === item.href}
  isGroupActive={(group) => $page.url.pathname === group.href}
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
  import { Nav } from 'stuic';
  import { goto } from '$app/navigation';

  function handleSelect(item) {
    console.log('Selected:', item.id);
    if (item.href) goto(item.href);
  }

  function handleGroupToggle(index, isExpanded) {
    console.log(`Group ${index} is now ${isExpanded ? 'expanded' : 'collapsed'}`);
  }
</script>

<Nav
  {groups}
  onSelect={handleSelect}
  onGroupToggle={handleGroupToggle}
/>
```

## Features

- **Hierarchical Navigation**: Groups with items, nested items with children
- **Expand/Collapse**: Groups and nested items can be expanded/collapsed
- **localStorage Persistence**: Expand/collapse state persists across page reloads
- **Collapsed Mode**: Icon-only sidebar with tooltips
- **Active State**: Highlight current item via `activeId` or custom callback
- **Localization**: Labels support `MaybeLocalized` type
- **Touch-Friendly**: Auto-detect or manually enable larger touch targets
- **ARIA Compliant**: Proper roles and aria-expanded attributes
- **Reduced Motion**: Respects user's reduced motion preference
- **SSR Safe**: localStorage persistence handles SSR gracefully

## CSS Classes

The component applies these base classes (when `unstyled` is false):

| Class | Element |
|-------|---------|
| `stuic-nav` | Root `<nav>` element |
| `stuic-nav-section-title` | Section title |
| `stuic-nav-group-title` | Group header/toggle |
| `stuic-nav-item` | Individual nav items |
| `stuic-nav-children` | Nested items container |

### Data Attributes

| Attribute | Applied When |
|-----------|--------------|
| `data-collapsed` | Sidebar is in collapsed mode |
| `data-expanding` | Transitioning from collapsed to expanded |
| `data-active` | Item/group is currently active |
| `data-touch-friendly` | Touch-friendly mode is active |
| `data-has-children` | Item has nested children |
| `data-disabled` | Item is disabled |
