# CommandMenu

A searchable command palette/menu modal for quick navigation and selection. Supports keyboard navigation, option grouping, and async search.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | - | Selected item (bindable) |
| `q` | `string` | `""` | Search query (bindable) |
| `getOptions` | `(q: string, current: Item[]) => Promise<Item[]>` | - | Async function to fetch options |
| `renderOptionLabel` | `(item: Item) => string` | - | Custom label renderer |
| `renderOptionGroup` | `(s: string) => string` | - | Custom group label renderer |
| `itemIdPropName` | `string` | `"id"` | Property name for item ID |
| `t` | `TranslateFn` | - | Translation function for i18n |
| `notifications` | `NotificationsStack` | - | Notifications stack for errors |
| `searchPlaceholder` | `string` | `"Type to search..."` | Input placeholder |
| `noScrollLock` | `boolean` | `false` | Disable body scroll lock |
| `showAllOnEmptyQ` | `boolean` | `false` | Show all options when query is empty |
| `classOption` | `string` | - | CSS for option buttons |
| `classOptionActive` | `string` | - | CSS for active option |
| `input` | `HTMLInputElement` | - | Input element reference (bindable) |

## Methods

| Method | Description |
|--------|-------------|
| `open(opener?)` | Open the command menu |
| `close()` | Close the command menu |

## Usage

### Basic

```svelte
<script lang="ts">
  import { CommandMenu } from 'stuic';

  let menu: CommandMenu;
  let selected = $state(null);

  async function getOptions(q: string) {
    const items = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'settings', label: 'Settings' },
      { id: 'profile', label: 'Profile' },
    ];
    return items.filter(i =>
      i.label.toLowerCase().includes(q.toLowerCase())
    );
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
      { id: 'new-file', label: 'New File', optgroup: 'file' },
      { id: 'open-file', label: 'Open File', optgroup: 'file' },
      { id: 'copy', label: 'Copy', optgroup: 'edit' },
      { id: 'paste', label: 'Paste', optgroup: 'edit' },
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

## Keyboard Navigation

- **Arrow Up/Down**: Navigate options
- **Cmd/Ctrl + Arrow Up**: Jump to first option
- **Cmd/Ctrl + Arrow Down**: Jump to last option
- **Enter**: Select active option
- **Escape**: Close menu (or clear input first)
- **Tab**: Focus back to search input
