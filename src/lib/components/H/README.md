# H

A semantic heading component that renders `h1`–`h6` elements. Supports decoupling the
visual presentation from the semantic level via the `renderLevel` prop — useful when the
document outline requires a specific heading hierarchy but the design calls for a
different size.

## Props

| Prop          | Type                 | Default | Description                                          |
| ------------- | -------------------- | ------- | ---------------------------------------------------- |
| `level`       | `1 \| 2 \| … \| 6`   | `2`     | Semantic heading level (determines the HTML element) |
| `renderLevel` | `1 \| 2 \| … \| 6`   | —       | Visual level override (styles as this level)         |
| `unstyled`    | `boolean`            | `false` | Skip all default styling                             |
| `class`       | `string`             | —       | Additional CSS classes                               |
| `style`       | `string`             | —       | Inline styles                                        |
| `el`          | `HTMLHeadingElement` | —       | Bindable element reference                           |

All standard HTML heading attributes are forwarded via rest props.

## Usage

### Basic

```svelte
<script>
	import { H } from "@marianmeres/stuic";
</script>

<H level={1}>Page title</H>
<H level={2}>Section title</H>
<H>Default is h2</H>
```

### Visual level override

Render a semantic `h2` but style it like an `h4`:

```svelte
<H level={2} renderLevel={4}>Looks small, still an h2</H>
```

### Custom styling via CSS variables

```svelte
<H level={1} style="--stuic-h1-font-size: 3rem; --stuic-h-font-weight: 900;">
	Extra large bold heading
</H>
```

### Unstyled

```svelte
<H level={3} unstyled class="my-custom-heading">Fully custom styled</H>
```

## CSS Variables

| Variable                   | Default                        | Description    |
| -------------------------- | ------------------------------ | -------------- |
| `--stuic-h-font-family`    | `inherit`                      | Font family    |
| `--stuic-h-font-weight`    | `var(--font-weight-bold, 700)` | Font weight    |
| `--stuic-h-line-height`    | `1.2`                          | Line height    |
| `--stuic-h-letter-spacing` | `normal`                       | Letter spacing |
| `--stuic-h-color`          | `inherit`                      | Text color     |
| `--stuic-h-margin`         | `0`                            | Margin         |
| `--stuic-h1-font-size`     | `2.25rem`                      | H1 font size   |
| `--stuic-h2-font-size`     | `1.875rem`                     | H2 font size   |
| `--stuic-h3-font-size`     | `1.5rem`                       | H3 font size   |
| `--stuic-h4-font-size`     | `1.25rem`                      | H4 font size   |
| `--stuic-h5-font-size`     | `1.125rem`                     | H5 font size   |
| `--stuic-h6-font-size`     | `1rem`                         | H6 font size   |

## Data Attributes

| Attribute    | Values  | Description                             |
| ------------ | ------- | --------------------------------------- |
| `data-level` | `1`–`6` | Visual level (`renderLevel` or `level`) |
