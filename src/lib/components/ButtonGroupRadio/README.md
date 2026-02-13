# ButtonGroupRadio

A radio button group styled as a segmented button toggle. Supports keyboard navigation and async validation.

## Props

| Prop                | Type                                           | Default | Description                                       |
| ------------------- | ---------------------------------------------- | ------- | ------------------------------------------------- |
| `options`           | `(string \| FieldRadiosOption)[]`              | -       | Array of options                                  |
| `value`             | `string`                                       | -       | Selected value (bindable)                         |
| `activeIndex`       | `number`                                       | -       | Selected index (bindable)                         |
| `size`              | `"sm" \| "md" \| "lg" \| string`               | `"md"`  | Button size                                       |
| `disabled`          | `boolean`                                      | `false` | Disable all buttons                               |
| `tabindex`          | `number`                                       | `0`     | Tab index for active button                       |
| `class`             | `string`                                       | -       | CSS classes for container                         |
| `classButton`       | `string`                                       | -       | CSS classes for all buttons                       |
| `classButtonActive` | `string`                                       | -       | CSS classes for active button                     |
| `style`             | `string`                                       | -       | Inline styles for container                       |
| `onButtonClick`     | `(index, coll) => Promise<boolean> \| boolean` | -       | Async validation hook (return `false` to prevent) |
| `buttonProps`       | `(index, coll) => Record<string, any>`         | -       | Dynamic props per button                          |
| `tooltip`           | `TooltipConfig`                                | -       | Tooltip configuration                             |

## Option Format

```ts
// Simple string
'Option A'

// Or object
{
  label: 'Option A',
  value: 'a'  // optional, defaults to label
}
```

## Usage

### Basic

```svelte
<script lang="ts">
	import { ButtonGroupRadio } from "@marianmeres/stuic";

	let selected = $state("monthly");
</script>

<ButtonGroupRadio options={["daily", "weekly", "monthly"]} bind:value={selected} />

<p>Selected: {selected}</p>
```

### With Object Options

```svelte
<script lang="ts">
	let plan = $state("pro");
</script>

<ButtonGroupRadio
	options={[
		{ label: "Free", value: "free" },
		{ label: "Pro", value: "pro" },
		{ label: "Enterprise", value: "enterprise" },
	]}
	bind:value={plan}
/>
```

### With Async Validation

```svelte
<script lang="ts">
	let value = $state("a");
</script>

<ButtonGroupRadio
	options={["a", "b", "c"]}
	bind:value
	onButtonClick={async (index, coll) => {
		// Return false to prevent selection
		if (index === 2) {
			alert("Option C is disabled");
			return false;
		}
	}}
/>
```

### Custom Styling

```svelte
<!-- Override component tokens inline -->
<ButtonGroupRadio
	options={["One", "Two", "Three"]}
	style="--stuic-button-group-radius: 9999px;"
/>

<!-- Override via Tailwind classes -->
<ButtonGroupRadio
	options={["One", "Two", "Three"]}
	class="bg-slate-100 border-slate-300"
	classButton="font-semibold"
	classButtonActive="bg-indigo-600 text-white"
/>
```

## Keyboard Navigation

- **Arrow Left/Up**: Select previous option
- **Arrow Right/Down**: Select next option

## CSS Variables

### Component Tokens

| Variable                                 | Default                   | Description                             |
| ---------------------------------------- | ------------------------- | --------------------------------------- |
| `--stuic-button-group-radius`            | `var(--radius-md)`        | Border radius for container and buttons |
| `--stuic-button-group-padding`           | `0.375rem`                | Container padding                       |
| `--stuic-button-group-gap`               | `0.25rem`                 | Gap between buttons                     |
| `--stuic-button-group-border-width`      | `1px`                     | Container border width                  |
| `--stuic-button-group-transition`        | `150ms`                   | Transition duration                     |
| `--stuic-button-group-ring-width`        | `3px`                     | Focus ring width                        |
| `--stuic-button-group-ring-color`        | `var(--stuic-color-ring)` | Focus ring color                        |
| `--stuic-button-group-button-padding-x`  | `0.75rem`                 | Button horizontal padding               |
| `--stuic-button-group-button-padding-y`  | `0.5rem`                  | Button vertical padding                 |
| `--stuic-button-group-button-min-height` | `2.75rem`                 | Button min height (44px touch target)   |

### Color Tokens

| Variable                                      | Default                                 | Description                      |
| --------------------------------------------- | --------------------------------------- | -------------------------------- |
| `--stuic-button-group-bg`                     | `var(--stuic-color-surface)`            | Container background             |
| `--stuic-button-group-text`                   | `var(--stuic-color-foreground)`         | Container text color             |
| `--stuic-button-group-border`                 | `var(--stuic-color-border)`             | Container border color           |
| `--stuic-button-group-button-bg`              | `transparent`                           | Inactive button background       |
| `--stuic-button-group-button-text`            | `var(--stuic-color-foreground)`         | Inactive button text             |
| `--stuic-button-group-button-bg-hover`        | `var(--stuic-color-muted)`              | Inactive button hover background |
| `--stuic-button-group-button-bg-active`       | `var(--stuic-color-primary)`            | Active button background         |
| `--stuic-button-group-button-text-active`     | `var(--stuic-color-primary-foreground)` | Active button text               |
| `--stuic-button-group-button-bg-active-hover` | `var(--stuic-color-primary-hover)`      | Active button hover background   |

### Customization Examples

```css
/* Global override */
:root {
	--stuic-button-group-radius: 0;
	--stuic-button-group-button-bg-active: var(--stuic-color-accent);
	--stuic-button-group-button-text-active: var(--stuic-color-accent-foreground);
}
```

```svelte
<!-- Local override via style prop -->
<ButtonGroupRadio
	options={["A", "B", "C"]}
	style="--stuic-button-group-radius: 9999px; --stuic-button-group-button-bg-active: #10b981;"
/>
```

## Data Attributes

The container uses:

- `data-size` - The size value (`sm`, `md`, `lg`)

The inner buttons use:

- `aria-checked` - `true` when selected (used for active state styling)
- `role="radio"` - Accessibility role
