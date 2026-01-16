# Collapsible

A component that truncates content to a specified number of lines with an expand/collapse toggle. Automatically detects if truncation is needed and only shows the toggle when content overflows.

## Props

| Prop                 | Type            | Default       | Description                                      |
| -------------------- | --------------- | ------------- | ------------------------------------------------ |
| `children`           | `Snippet`       | -             | Content to display                               |
| `lines`              | `number`        | `1`           | Number of lines to show when collapsed           |
| `expanded`           | `boolean`       | `false`       | Expanded state (bindable)                        |
| `collapsedIndicator` | `string`        | `"↓"`         | Character/text shown when collapsed              |
| `expandedIndicator`  | `string`        | `"↑"`         | Character/text shown when expanded               |
| `class`              | `string`        | -             | Container element class                          |
| `classContent`       | `string`        | -             | Content wrapper class                            |
| `classToggle`        | `string`        | -             | Toggle button class                              |
| `toggleOpacity`      | `string`        | `"opacity-70"`| Opacity class for toggle button                  |
| `el`                 | `HTMLDivElement`| -             | Bind reference to container element              |

## Usage

### Basic Usage

```svelte
<script>
  import { Collapsible } from 'stuic';
</script>

<Collapsible>
  This is a long text that will be truncated to one line with an ellipsis
  and a toggle button to expand it.
</Collapsible>
```

### Multiple Lines

```svelte
<Collapsible lines={3}>
  This content will be truncated to 3 lines before showing the expand toggle.
  Add more content here to see the effect.
</Collapsible>
```

### Custom Indicators

```svelte
<Collapsible collapsedIndicator="▼" expandedIndicator="▲">
  Content with custom expand/collapse indicators.
</Collapsible>
```

### Controlled State

```svelte
<script>
  import { Collapsible } from 'stuic';

  let expanded = $state(false);
</script>

<button onclick={() => expanded = !expanded}>
  Toggle externally
</button>

<Collapsible bind:expanded>
  This collapsible can be controlled from outside.
</Collapsible>
```

### Custom Styling

```svelte
<Collapsible
  class="bg-gray-100 p-4 rounded"
  classContent="text-sm text-gray-600"
  classToggle="text-blue-500 font-bold"
  toggleOpacity="opacity-100"
>
  Styled collapsible content.
</Collapsible>
```
