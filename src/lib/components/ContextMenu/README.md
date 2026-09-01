# ContextMenu

Right-click / long-press triggered menu, positioned at the pointer. Wrap any content
in `<ContextMenu items={...}>` and the wrapped area becomes a context target:
a `contextmenu` event (right-click), a long-press (touch/pen pointers), or
Shift+F10 / the dedicated menu key (keyboard) opens the menu anchored at the
interaction point.

The menu panel itself **is** a [`DropdownMenu`](../DropdownMenu/README.md) — the full
item model (actions, dividers, headers, custom content, expandable sections), keyboard
navigation, optional search, viewport-overflow handling (CSS anchor positioning with a
centered-modal fallback), and theming all come from there. What ContextMenu adds is the
trigger semantics and the cursor anchoring.

## Props

| Prop                                               | Type                                   | Default               | Description                                                                                        |
| -------------------------------------------------- | -------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `items`                                            | `ContextMenuItem[]`                    | required              | Menu items (the DropdownMenu item model)                                                           |
| `children`                                         | `Snippet`                              | -                     | The right-clickable / long-pressable target area content                                           |
| `isOpen`                                           | `boolean`                              | `false`               | Controlled open state (bindable); setting `true` programmatically anchors at the target area       |
| `disabled`                                         | `boolean`                              | `false`               | Triggers are inert — the browser's native context menu works again                                 |
| `longPress`                                        | `number \| false`                      | `500`                 | Long-press duration in ms (touch/pen); `false` disables the long-press trigger                     |
| `position`                                         | `ContextMenuPosition`                  | `"bottom-span-right"` | Menu placement relative to the pointer (below-right = the native convention); flips near the edges |
| `offset`                                           | `string`                               | `"0px"`               | Offset of the menu from the pointer (CSS value)                                                    |
| `maxHeight`                                        | `string`                               | `"300px"`             | Max menu height (CSS value)                                                                        |
| `closeOnSelect`                                    | `boolean`                              | `true`                | Close when an action item is selected                                                              |
| `closeOnClickOutside`                              | `boolean`                              | `true`                | Close on click outside                                                                             |
| `closeOnEscape`                                    | `boolean`                              | `true`                | Close on Escape                                                                                    |
| `search`                                           | `boolean \| ContextMenuSearchConfig`   | -                     | Search/filter input inside the menu (see DropdownMenu)                                             |
| `showBackdrop`                                     | `boolean`                              | `true`                | Backdrop in fallback (centered modal) mode                                                         |
| `scrollbarGutter`                                  | `boolean`                              | auto                  | Reserve scrollbar space (auto-enables at ≥ 7 items)                                                |
| `noScrollLock`                                     | `boolean`                              | -                     | Skip the body scroll lock in fallback mode                                                         |
| `forceFallback`                                    | `boolean`                              | `false`               | Force the centered-modal fallback (testing)                                                        |
| `onOpen` / `onClose`                               | `() => void`                           | -                     | Open/close callbacks                                                                               |
| `onSelect`                                         | `(item) => void \| boolean \| Promise` | -                     | Fallback select handler when an item has no own `onSelect`                                         |
| `t`                                                | `TranslateFn`                          | English               | i18n — localizes the screen-reader-only menu label (see below)                                     |
| `unstyled`                                         | `boolean`                              | `false`               | Skip all default styling                                                                           |
| `class`                                            | `string`                               | -                     | Classes for the target area wrapper                                                                |
| `classDropdown`, `classItem`, `classItemActive`, … | `string`                               | -                     | Menu part classes, passed to the underlying DropdownMenu                                           |
| `el`                                               | `HTMLDivElement`                       | -                     | Target area wrapper element (bindable)                                                             |
| `dropdownEl`                                       | `HTMLDivElement`                       | -                     | Open menu element (bindable)                                                                       |

`ContextMenuItem` / `ContextMenuActionItem` / `ContextMenuPosition` /
`ContextMenuSearchConfig` are aliases of the corresponding `DropdownMenu*` types —
see the [DropdownMenu README](../DropdownMenu/README.md) for the full item model
(action, divider, header, custom, expandable).

## Usage

### Basic

```svelte
<script lang="ts">
	import { ContextMenu, type ContextMenuItem } from "@marianmeres/stuic";

	const items: ContextMenuItem[] = [
		{ type: "action", id: "copy", label: "Copy", onSelect: () => copy() },
		{ type: "action", id: "rename", label: "Rename", onSelect: () => rename() },
		{ type: "divider", id: "d" },
		{ type: "action", id: "delete", label: "Delete", onSelect: () => remove() },
	];
</script>

<ContextMenu {items}>
	<div class="p-8">Right-click (or long-press) anywhere in here…</div>
</ContextMenu>
```

### Per-row menus (list/table)

Each `<ContextMenu>` instance is one target area — wrap each row and build the items
from the row's data:

```svelte
{#each files as file (file.id)}
	<ContextMenu items={itemsFor(file)}>
		<div class="row">{file.name}</div>
	</ContextMenu>
{/each}
```

(Nested target areas are fine — the innermost one wins.)

### Controlled / programmatic

```svelte
<ContextMenu {items} bind:isOpen>...</ContextMenu>
```

Setting `isOpen = true` programmatically (with no pointer interaction recorded yet)
anchors the menu at the target area's bottom-left corner.

### i18n

Only the screen-reader-only menu label ("Context menu") is localized — the item
labels are yours. Built-in English; bundled Slovak (`CONTEXT_MENU_MESSAGES_SK`) is
opt-in:

```svelte
<script lang="ts">
	import {
		ContextMenu,
		createContextMenuT,
		CONTEXT_MENU_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createContextMenuT(CONTEXT_MENU_MESSAGES_SK);
</script>

<ContextMenu {items} {t}>...</ContextMenu>
```

## Trigger semantics

- **Right-click** (`contextmenu` event): opens at the cursor, `preventDefault`s the
  native menu, `stopPropagation`s so the innermost of nested context areas wins.
  Right-clicking again while open just moves the menu.
- **Long-press** (touch/pen, via the exported [`longPress`](../../attachments/long-press.ts)
  attachment): fires after `longPress` ms without moving beyond ~10px; the platform's
  own long-press behaviors are suppressed (Android's native `contextmenu` synthesis is
  deduplicated; iOS's callout/text-selection via CSS on the target area — coarse
  pointers only, so desktop text selection inside the area stays intact). The click
  that some platforms fire when the finger lifts is swallowed so it can't activate
  whatever sits under it.
- **Keyboard**: Shift+F10 or the dedicated menu key while focus is inside the target
  area opens the menu at the focused element's bottom-left corner. Note the wrapper
  itself is not focusable — put focusable content inside (or add `tabindex="0"`
  yourself) for keyboard invocation to have somewhere to happen. Focus returns to the
  previously focused element on close.
- **`disabled`**: all triggers inert, the browser's native context menu works again.

## Accessibility

- The target area wrapper carries `aria-haspopup="menu"`; the menu is a
  `role="menu"` with `role="menuitem"` items (DropdownMenu's keyboard navigation:
  arrows, Home/End, Enter/Space, Escape).
- The menu's `aria-labelledby` points at a visually hidden label ("Context menu",
  localizable via `t`).
- Keyboard invocation (Shift+F10 / menu key) is supported, and focus is restored on
  close.

## Styling

The menu panel is a DropdownMenu — **theme it via the `--stuic-dropdown-menu-*`
tokens** (see the [DropdownMenu README](../DropdownMenu/README.md#css-variables)).
ContextMenu itself only styles the target area:

- `.stuic-context-menu` — the target area wrapper (`class` prop merges here)
- `.stuic-context-menu-anchor` — the invisible 0×0 fixed anchor the menu positions
  against (inline-positioned; not a styling hook)

## Data Attributes

On the target area wrapper:

- `data-open` — empty attribute while the menu is open (e.g. highlight the target:
  `.stuic-context-menu[data-open] { background: ... }`)
- `data-longpress` — empty attribute when the long-press trigger is enabled; drives
  the CSS that suppresses the platform's own long-press behaviors
