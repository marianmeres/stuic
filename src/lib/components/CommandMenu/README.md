# CommandMenu

A searchable command palette/menu modal for quick navigation and selection. Supports keyboard navigation, option grouping, and async search.

## Props

| Prop                | Type                                                                      | Default               | Description                                                                      |
| ------------------- | ------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------- |
| `value`             | `any`                                                                     | -                     | Selected item (bindable)                                                         |
| `q`                 | `string`                                                                  | `""`                  | Search query (bindable)                                                          |
| `getOptions`        | `(q: string, current: Item[], ctx: GetOptionsContext) => Promise<Item[]>` | -                     | Async function to fetch options; `ctx.append` shows batches before it settles    |
| `sortOptions`       | `false \| (a: Item, b: Item) => number`                                   | -                     | Option order: a comparator, or `false` for arrival order (default: group, label) |
| `renderOptionLabel` | `(item: Item) => string`                                                  | -                     | Custom label renderer                                                            |
| `renderOptionGroup` | `(s: string) => string`                                                   | -                     | Custom group label renderer                                                      |
| `itemIdPropName`    | `string`                                                                  | `"id"`                | Property name for item ID                                                        |
| `t`                 | `TranslateFn`                                                             | -                     | Translation function for i18n                                                    |
| `notifications`     | `NotificationsStack`                                                      | -                     | Notifications stack for errors                                                   |
| `searchPlaceholder` | `string`                                                                  | `"Type to search..."` | Input placeholder                                                                |
| `noScrollLock`      | `boolean`                                                                 | `false`               | Disable body scroll lock                                                         |
| `showAllOnEmptyQ`   | `boolean`                                                                 | `false`               | Show all options when query is empty                                             |
| `classOption`       | `string`                                                                  | -                     | CSS for option buttons                                                           |
| `classOptionActive` | `string`                                                                  | -                     | CSS for active option                                                            |
| `input`             | `HTMLInputElement`                                                        | -                     | Input element reference (bindable)                                               |

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

### Progressive results

`getOptions` receives a third argument, `{ append, signal }` (exported as
`CommandMenuGetOptionsContext`). Call `append(items)` to put options on screen before the
promise settles — useful when some sources answer at once (rows already in memory) and others
over the network.

```svelte
<script lang="ts">
	import { CommandMenu, type CommandMenuGetOptionsContext } from "stuic";

	async function getOptions(
		q: string,
		_current: Item[],
		ctx: CommandMenuGetOptionsContext
	) {
		// 1. local rows show immediately
		ctx.append(localRows.filter((r) => r.label.toLowerCase().includes(q.toLowerCase())));
		// 2. each remote source shows as it answers
		await Promise.allSettled(
			sources.map((s) => s.search(q, { signal: ctx.signal }).then(ctx.append))
		);
		// 3. the resolved array is the last batch (nothing more here)
		return [];
	}
</script>
```

How batches behave:

- A batch is an `append` call or the resolved array. The query's **first** batch replaces the
  previous query's options (which stay up until then, so the list does not flash empty on every
  keystroke); every later batch adds to them. A consumer that never calls `append` sees exactly
  the old behaviour: the resolved array replaces the list.
- The spinner stays on until the promise settles, however many batches arrived before.
- An option whose id is already on screen is skipped — the first batch to name an id wins.
  (A stale option kept for a named source, below, is the exception: a fresh one replaces it.)
- `append` does nothing once a newer query has superseded this one, or after the promise has
  settled. `signal` is aborted in the same cases and when the component is destroyed, so pass it
  on to `fetch` and similar.
- A rejection is reported once through `notifications` (only for the current query, never for
  one aborted by the component); batches already on screen stay.

### Named sources

With the rules above, a query whose first batch is the local rows takes every remote group
off the screen on each keystroke, and the groups come back one by one as their sources
answer: the list blinks. Name the source of a batch to keep its rows up in the meantime:

```ts
// 1. local rows: no source, replaced at once as before
ctx.append(localRows.filter((r) => r.label.toLowerCase().includes(q.toLowerCase())));
// 2. each remote source names itself
await Promise.allSettled(
	sources.map((s) =>
		s.search(q, { signal: ctx.signal }).then((hits) => ctx.append(hits, { source: s.id }))
	)
);
```

- Options appended with a `source` outlive their query. When the next query's first batch
  replaces the list they stay on screen, stale, until the **same source** appends again or
  that query **settles** — whichever comes first.
- An empty answer is an answer: `append([], { source })` takes the source's stale rows off
  the screen. A source that appends nothing at all keeps them until the query settles.
- A stale option can be highlighted and picked like any other. If its source names it again
  it keeps the highlight; if it goes, the highlight goes with it (it does not move to a
  neighbour).
- Emptying the query (without `showAllOnEmptyQ`) clears everything, stale rows included.
- Pair it with a `sortOptions` comparator that pins each group's place (see below). In
  arrival order (`sortOptions={false}`) a query's own rows lead and the stale ones follow,
  so a group moves to the end when its source answers.

### Ordering

By default options sort by `"<optgroup>__<label>"`, so groups and the labels within them come
out alphabetically. With progressive results that means a late group lands wherever its name
sorts — possibly above rows the person is already reading. Pass `sortOptions` to decide the
order yourself; it is read once, when the component is created (like `itemIdPropName`).

```svelte
<script lang="ts">
	const rank: Record<string, number> = { navigation: 0, actions: 1, data: 2 };
	const sortOptions = (a: Item, b: Item) =>
		rank[a.optgroup] - rank[b.optgroup] || a.label.localeCompare(b.label);
</script>

<!-- a comparator: navigation first, then actions, then data; alphabetical within -->
<CommandMenu {getOptions} {sortOptions} />

<!-- or keep the order the options arrived in (groups in the order they first appear) -->
<CommandMenu {getOptions} sortOptions={false} />
```

The active option keeps its highlight across a re-sort (it is tracked by id).

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
