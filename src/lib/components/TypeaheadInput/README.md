# TypeaheadInput

An input with typeahead/autocomplete suggestions. Shows inline suggestions that can be accepted with Tab, with support for async data fetching and keyboard navigation.

## Props

| Prop                | Type                                        | Default        | Description                           |
| ------------------- | ------------------------------------------- | -------------- | ------------------------------------- |
| `value`             | `any`                                       | -              | Current input value (bindable)        |
| `input`             | `HTMLInputElement`                          | -              | Input element reference (bindable)    |
| `placeholder`       | `string`                                    | -              | Input placeholder                     |
| `getOptions`        | `(q: string, current: T[]) => Promise<T[]>` | -              | Async function to fetch suggestions   |
| `renderOptionLabel` | `(item: T) => string`                       | -              | Render label for an option            |
| `itemIdPropName`    | `string`                                    | `"id"`         | Property name for item ID             |
| `name`              | `string`                                    | `"text_input"` | Input name attribute                  |
| `onSubmit`          | `(value: string) => void`                   | -              | Called on Enter or blur               |
| `onDeleteRequest`   | `() => void`                                | -              | Called on Backspace at position 0     |
| `noSpinner`         | `boolean`                                   | `false`        | Hide loading spinner                  |
| `noListAllOnEmptyQ` | `boolean`                                   | `false`        | Don't show all options on empty query |
| `appendHint`        | `string`                                    | `" [tab]"`     | Hint text appended to suggestion      |
| `class`             | `string`                                    | -              | CSS for container                     |
| `classInput`        | `string`                                    | -              | CSS for input element                 |

## Usage

### Basic Typeahead

```svelte
<script lang="ts">
	import { TypeaheadInput } from "stuic";

	let city = $state("");

	const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];

	async function getOptions(q: string) {
		return cities
			.filter((c) => c.toLowerCase().startsWith(q.toLowerCase()))
			.map((label, id) => ({ id, label }));
	}
</script>

<TypeaheadInput
	bind:value={city}
	{getOptions}
	renderOptionLabel={(item) => item.label}
	placeholder="Enter city name"
	onSubmit={(value) => console.log("Selected:", value)}
/>
```

### With API Fetch

```svelte
<script lang="ts">
	async function getOptions(q: string) {
		if (!q) return [];
		const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
		return res.json();
	}
</script>

<TypeaheadInput bind:value {getOptions} renderOptionLabel={(item) => item.name} />
```

### Tag Input Pattern

```svelte
<script lang="ts">
	let tags = $state<string[]>([]);
	let currentTag = $state("");
</script>

<div class="flex gap-2 flex-wrap">
	{#each tags as tag}
		<span class="bg-gray-200 px-2 py-1 rounded">{tag}</span>
	{/each}

	<TypeaheadInput
		bind:value={currentTag}
		{getOptions}
		renderOptionLabel={(item) => item.label}
		onSubmit={(value) => {
			if (value && !tags.includes(value)) {
				tags = [...tags, value];
				currentTag = "";
			}
		}}
		onDeleteRequest={() => {
			if (tags.length) {
				tags = tags.slice(0, -1);
			}
		}}
	/>
</div>
```

## Keyboard Navigation

- **Arrow Down/Up**: Cycle through suggestions
- **Tab**: Accept current suggestion
- **Enter**: Submit current value
- **Arrow Right**: Accept suggestion (when cursor at end)
- **Backspace** (at position 0): Triggers `onDeleteRequest`

## Features

- Case-insensitive and accent-insensitive matching
- Debounced search (150ms)
- Ghost text shows suggestion inline
- Optional spinner during fetch
- Supports listing all options on empty query with arrow keys
