# Separator

A horizontal or vertical separator line. Renders an accessible `role="separator"` element by default; pass `decorative` for a purely visual divider (`aria-hidden`).

## Props

| Prop          | Type                         | Default        | Description                                              |
| ------------- | ---------------------------- | -------------- | -------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction. Also published as `data-orientation`.   |
| `decorative`  | `boolean`                    | `false`        | Drop `role` + `aria-orientation`, set `aria-hidden="true"`. |
| `unstyled`    | `boolean`                    | `false`        | Skip all default styling.                                |
| `class`       | `string`                     | -              | Additional CSS classes.                                  |
| `style`       | `string`                     | -              | Inline style.                                            |
| `el`          | `HTMLDivElement`             | -              | Bindable root element.                                   |

## Usage

```svelte
<script lang="ts">
	import { Separator } from "@marianmeres/stuic";
</script>

<p>Above</p>
<Separator />
<p>Below</p>

<div style="display: flex; align-items: center; gap: 0.5rem; height: 1.5rem;">
	<span>Left</span>
	<Separator orientation="vertical" />
	<span>Right</span>
</div>

<!-- Purely decorative — removed from the a11y tree -->
<Separator decorative />
```

## Data Attributes

- `data-orientation` — `"horizontal"` or `"vertical"`. Use for CSS targeting.

## Notes

- Vertical separators need a non-zero height from the surrounding layout (the component does not impose one).
- For semantic separation between landmark sections, prefer `<hr>` or native sectioning elements over a `Separator`.
