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
  value: 'a',       // optional, defaults to label
  disabled: true    // optional, disables just this option
}
```

### Disabling individual options

Set `disabled: true` on any option to make it non-interactive. Disabled options
can't be clicked or activated and are skipped by keyboard arrow navigation. To
disable the whole group instead, use the top-level `disabled` prop.

```svelte
<ButtonGroupRadio
	options={[
		{ label: "Free", value: "free" },
		{ label: "Pro", value: "pro" },
		{ label: "Enterprise", value: "enterprise", disabled: true },
	]}
	bind:value={plan}
/>
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

All tokens below are **declared** in the component's `:root`. That means a `:root` override
or a `style` prop override both work, but the `var(--token, <fallback>)` fallbacks visible in
`index.css` never fire — the defaults are the `:root` values listed here.

### Component Tokens

| Variable                                 | Default                   | Description                                    |
| ---------------------------------------- | ------------------------- | ---------------------------------------------- |
| `--stuic-button-group-radius`            | `9999px`                  | Border radius for container and buttons (pill) |
| `--stuic-button-group-padding-x`         | `4px`                     | Container horizontal padding                   |
| `--stuic-button-group-padding-y`         | `3px`                     | Container vertical padding                     |
| `--stuic-button-group-gap`               | `0.25rem`                 | Gap between buttons                            |
| `--stuic-button-group-border-width`      | `1px`                     | Container border width                         |
| `--stuic-button-group-ring-width`        | `4px`                     | Focus ring width                               |
| `--stuic-button-group-ring-color`        | `var(--stuic-color-ring)` | Focus ring color                               |
| `--stuic-button-group-button-padding-x`  | `0.75rem`                 | Button horizontal padding                      |
| `--stuic-button-group-button-padding-y`  | `0.375rem`                | Button vertical padding                        |
| `--stuic-button-group-button-min-height` | `2.25rem`                 | Button min height (36px)                       |
| `--stuic-button-group-transition`        | `var(--stuic-transition)` | Transition duration (not declared — fallback)  |

`--stuic-button-group-transition` is the one exception: it is _not_ declared, so it resolves
through its usage-site fallback to `--stuic-transition`.

### Color Tokens

| Variable                                        | Default                                   | Description                      |
| ----------------------------------------------- | ----------------------------------------- | -------------------------------- |
| `--stuic-button-group-bg`                       | `var(--stuic-color-muted)`                | Container background             |
| `--stuic-button-group-text`                     | `var(--stuic-color-muted-foreground)`     | Container text color             |
| `--stuic-button-group-border`                   | `var(--stuic-input-border)`               | Container border color           |
| `--stuic-button-group-border-focus`             | `var(--stuic-color-primary)`              | Container border on focus-within |
| `--stuic-button-group-button-bg`                | `transparent`                             | Inactive button background       |
| `--stuic-button-group-button-text`              | `var(--stuic-color-muted-foreground)`     | Inactive button text             |
| `--stuic-button-group-button-bg-hover`          | `transparent`                             | Inactive button hover background |
| `--stuic-button-group-button-text-hover`        | `var(--stuic-color-foreground)`           | Inactive button hover text       |
| `--stuic-button-group-button-bg-active`         | `var(--stuic-color-surface-1)`            | Active button background         |
| `--stuic-button-group-button-text-active`       | `var(--stuic-color-surface-1-foreground)` | Active button text               |
| `--stuic-button-group-button-bg-active-hover`   | `var(--stuic-color-surface-1)`            | Active button hover background   |
| `--stuic-button-group-button-text-active-hover` | `var(--stuic-color-surface-1-foreground)` | Active button hover text         |

### Size Variants

`size` sets `data-size` on the container, which re-declares a subset of the tokens above.
`md` is the `:root` default; `sm` and `lg` override these:

| Token                                    | `sm`       | `md` (default) | `lg`       |
| ---------------------------------------- | ---------- | -------------- | ---------- |
| `--stuic-button-group-padding-x`         | `3px`      | `4px`          | `8px`      |
| `--stuic-button-group-padding-y`         | `2px`      | `3px`          | `6px`      |
| `--stuic-button-group-gap`               | `0.125rem` | `0.25rem`      | `0.375rem` |
| `--stuic-button-group-button-padding-x`  | `0.5rem`   | `0.75rem`      | `1rem`     |
| `--stuic-button-group-button-padding-y`  | `0.375rem` | `0.375rem`     | `0.625rem` |
| `--stuic-button-group-button-min-height` | `2.25rem`  | `2.25rem`      | `3rem`     |
| overall height                           | 42px       | 44px           | 62px       |

Because the size variants declare these on the container itself, they beat the inherited
`:root` values — but an inline `style` on the same element still wins over both.

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
