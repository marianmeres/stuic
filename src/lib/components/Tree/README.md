# Tree

A generic hierarchical tree view with drag-and-drop reordering, keyboard navigation, expand/collapse state, optional `localStorage` persistence, and full ARIA `treeview` semantics.

Backed by [`@marianmeres/tree`](https://www.npmjs.com/package/@marianmeres/tree) for the data model — pass `tree.toJSON().children` or any compatible `TreeNodeDTO[]`.

## Usage

### Basic

```svelte
<script lang="ts">
	import { Tree } from "@marianmeres/stuic";

	const items = [
		{
			id: "root",
			value: "Projects",
			children: [
				{ id: "a", value: "Alpha", children: [] },
				{ id: "b", value: "Beta", children: [] },
			],
		},
	];
</script>

<Tree {items} activeId="a" onSelect={(item) => console.log(item.id)} />
```

### Drag & Drop

```svelte
<Tree
	{items}
	draggable
	onMove={({ source, target, position }) => {
		// Mutate your data to move `source` relative to `target`.
		// Return `false` (or throw) to reject the move.
		moveNode(source.id, target.id, position);
	}}
	isDraggable={(item) => !item.data?.locked}
	isDropTarget={(item) => item.data?.acceptsChildren !== false}
/>
```

`onMove` receives `{ source, target, position: "before" | "after" | "inside" }`. The component does **not** mutate items itself — you own the data. Return `false` or throw to reject.

### Expansion Control

Four priority tiers resolve a node's initial expansion state, highest wins:

1. `localStorage` value (when `persistState={true}`)
2. `expandedIds` prop (explicit initial set)
3. Auto-expanded if any descendant is active
4. `defaultExpanded` prop

```svelte
<Tree
	{items}
	defaultExpanded
	persistState
	storageKeyPrefix="my-app-tree"
	onToggle={(item, expanded) => console.log(item.id, expanded)}
/>
```

Collapsing a branch also collapses all of its descendants.

### Custom Rendering

```svelte
<Tree {items}>
	{#snippet renderIcon(item, depth, isExpanded)}
		<MyIcon type={item.data.kind} />
	{/snippet}
	{#snippet renderItem(item, depth, isExpanded)}
		<span class="font-medium">{item.value}</span>
		{#if item.data?.count}
			<span class="ml-auto text-xs opacity-60">{item.data.count}</span>
		{/if}
	{/snippet}
</Tree>
```

## Props

| Prop                | Type                                                 | Default           | Description                                                              |
| ------------------- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------------ |
| `items`             | `TreeNodeDTO<T>[]`                                   | required          | Tree data (e.g. from `tree.toJSON().children`)                           |
| `activeId`          | `string`                                             | -                 | ID of the currently active/selected node                                 |
| `isActive`          | `(item) => boolean`                                  | -                 | Alternative to `activeId` for custom active detection                    |
| `onSelect`          | `(item) => void`                                     | -                 | Called when a node is selected (click or Enter/Space)                    |
| `onToggle`          | `(item, expanded) => void`                           | -                 | Called when a branch is expanded/collapsed                               |
| `sort`              | `(a, b) => number`                                   | -                 | Per-level sort comparator                                                |
| `defaultExpanded`   | `boolean`                                            | `false`           | Default expansion state for branches                                     |
| `expandedIds`       | `Set<string>`                                        | -                 | Initially-expanded branch IDs                                            |
| `persistState`      | `boolean`                                            | `false`           | Persist expand/collapse to `localStorage`                                |
| `storageKeyPrefix`  | `string`                                             | `"stuic-tree"`    | Prefix used for `localStorage` keys                                      |
| `draggable`         | `boolean`                                            | `false`           | Enable drag-and-drop reordering                                          |
| `isDraggable`       | `(item) => boolean`                                  | -                 | Return `false` to block dragging a specific node                         |
| `isDropTarget`      | `(item) => boolean`                                  | -                 | Return `false` to block dropping onto a specific node                    |
| `onMove`            | `(event) => void \| false \| Promise<void \| false>` | -                 | Called when a valid drop happens; return `false` to reject               |
| `onError`           | `(err) => void`                                      | -                 | Called when `onMove` throws                                              |
| `dragExpandDelay`   | `number`                                             | `800`             | ms before auto-expanding a collapsed branch hovered during drag          |
| `t`                 | `TranslateFn`                                        | built-in          | Optional translation function (used for drag-drop a11y announcements)    |
| `getNodeLabel`      | `(item) => string`                                   | `String(v.value)` | String used in a11y announcements when a node is moved                   |
| `renderItem`        | `Snippet<[item, depth, isExpanded]>`                 | -                 | Custom node label renderer                                               |
| `renderIcon`        | `Snippet<[item, depth, isExpanded]>`                 | -                 | Custom node icon renderer                                                |
| `unstyled`          | `boolean`                                            | `false`           | Skip default styling                                                     |
| `class`             | `string`                                             | -                 | Classes for wrapper                                                      |
| `classItem`         | `string`                                             | -                 | Classes for each item button                                             |
| `classItemActive`   | `string`                                             | -                 | Extra classes when an item is active                                     |
| `classIcon`         | `string`                                             | -                 | Classes for the icon wrapper                                             |
| `classLabel`        | `string`                                             | -                 | Classes for the label wrapper                                            |
| `classChevron`      | `string`                                             | -                 | Classes for the expand/collapse chevron                                  |
| `classChildren`     | `string`                                             | -                 | Classes for the children container                                       |
| `el`                | `HTMLElement`                                        | -                 | Bindable wrapper reference                                               |

## Keyboard Navigation

| Key                   | Action                                                                |
| --------------------- | --------------------------------------------------------------------- |
| `ArrowDown`           | Focus next visible node                                               |
| `ArrowUp`             | Focus previous visible node                                           |
| `ArrowRight`          | Expand a collapsed branch, or move to first child of an expanded one  |
| `ArrowLeft`           | Collapse an expanded branch, or move to parent                        |
| `Home`                | Focus first visible node                                              |
| `End`                 | Focus last visible node                                               |
| `Enter` / `Space`     | Toggle expansion (if branch) and fire `onSelect`                      |

Focus follows the **roving tabindex** pattern: only the currently-focused node has `tabindex=0`, all others are `-1`.

## Accessibility

- Root has `role="tree"`; each node has `role="treeitem"`.
- Branches have `aria-expanded`; active nodes have `aria-selected`; all nodes have `aria-level`.
- Children wrappers have `role="group"`.
- Successful `onMove` calls announce the change via a visually-hidden `aria-live="polite"` region. Translate via the `t` prop — keys: `move_before`, `move_after`, `move_inside` with `{source}` and `{target}` placeholders.

### Drag-drop limitations

HTML5 drag-and-drop is **mouse-only** and not keyboard accessible. Touch support is device-dependent and unreliable. If keyboard/touch reordering matters for your app, layer your own UI on top (e.g. a context menu with "Move up / Move down / Move into…" actions that call your move logic directly).

## CSS Variables

Override globally in `:root` or locally via `style=""`. Radius / border-width / transition use the standard STUIC fallback pattern and inherit from their shared structural tokens unless overridden.

### Structure

| Variable                           | Default                  | Description                       |
| ---------------------------------- | ------------------------ | --------------------------------- |
| `--stuic-tree-indent`              | `1.25rem`                | Indentation per depth level       |
| `--stuic-tree-item-padding-x`      | `0.375rem`               | Item horizontal padding           |
| `--stuic-tree-item-padding-y`      | `0.125rem`               | Item vertical padding             |
| `--stuic-tree-item-height`         | `1.75rem`                | Item row height                   |
| `--stuic-tree-item-font-size`      | `var(--text-sm)`         | Item font size                    |
| `--stuic-tree-item-gap`            | `0.25rem`                | Gap between chevron, icon, label  |
| `--stuic-tree-chevron-size`        | `14px`                   | Chevron icon size                 |
| `--stuic-tree-chevron-opacity`     | `0.5`                    | Chevron opacity                   |
| `--stuic-tree-icon-opacity`        | `0.7`                    | Icon opacity                      |
| `--stuic-tree-item-radius`         | `var(--stuic-radius)`    | Item border radius                |
| `--stuic-tree-transition`          | `var(--stuic-transition)`| Transition duration               |

### Colors

| Variable                             | Default                                | Description               |
| ------------------------------------ | -------------------------------------- | ------------------------- |
| `--stuic-tree-item-bg`               | `transparent`                          | Item background           |
| `--stuic-tree-item-text`             | `inherit`                              | Item text color           |
| `--stuic-tree-item-bg-hover`         | `rgb(0 0 0 / 0.06)`                    | Hover background          |
| `--stuic-tree-item-bg-focus`         | `rgb(0 0 0 / 0.06)`                    | Keyboard-focus background |
| `--stuic-tree-item-bg-active`        | `var(--stuic-color-primary)`           | Active/selected bg        |
| `--stuic-tree-item-text-active`      | `var(--stuic-color-primary-foreground)`| Active/selected text      |

### Drag & drop

| Variable                                | Default                            | Description                     |
| --------------------------------------- | ---------------------------------- | ------------------------------- |
| `--stuic-tree-item-opacity-dragging`    | `0.4`                              | Opacity of the dragged item     |
| `--stuic-tree-drop-indicator-color`     | `var(--stuic-color-primary)`       | Before/after drop line color    |
| `--stuic-tree-drop-indicator-height`    | `2px`                              | Before/after drop line height   |
| `--stuic-tree-item-bg-dragover`         | `rgb(0 0 0 / 0.04)`                | "Inside"-drop highlight         |

## Limitations

- **No multi-select / checkbox selection.** Single active node only.
- **No lazy loading.** All nodes must be present in `items`.
- **Expansion state is private.** Observe via `onToggle`; set initial via `expandedIds`. There is currently no way to read the full set of expanded IDs from outside.
- **Drag-drop is mouse-only.** See the a11y section above.
