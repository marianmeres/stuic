# Spinner

A family of loading spinner components with different visual styles. All spinners inherit color from `currentColor`, making them easy to style with Tailwind text color classes.

## Components

| Component | Description |
|-----------|-------------|
| `Spinner` | Radial bar spinner with fading segments |
| `SpinnerCircle` | Simple circular border spinner |
| `SpinnerCircleOscillate` | Circle with oscillating progress animation |
| `SpinnerUnicode` | Unicode character-based spinner (17+ variants) |

---

## Spinner

Rotating segments that fade in sequence. Pure CSS animation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `8` | Number of segments (3-12 recommended) |
| `thickness` | `"thin" \| "normal" \| "thick"` | `"normal"` | Segment width |
| `height` | `"short" \| "normal" \| "tall"` | `"normal"` | Segment length |
| `direction` | `"cw" \| "ccw"` | `"cw"` | Rotation direction |
| `duration` | `number` | `750` | Animation duration (ms) |
| `rounded` | `number` | `2` | Border radius of segments (px) |
| `class` | `string` | - | Additional CSS classes |

### Usage

```svelte
<Spinner />
<Spinner thickness="thin" count={12} />
<Spinner class="text-blue-500" direction="ccw" />
```

---

## SpinnerCircle

Simple circular spinner using CSS border animation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `thickness` | `"thin" \| "normal" \| "thick"` | `"normal"` | Border thickness |
| `direction` | `"cw" \| "ccw"` | `"cw"` | Rotation direction |
| `duration` | `number` | `750` | Animation duration (ms) |
| `class` | `string` | - | Additional CSS classes |

### Usage

```svelte
<SpinnerCircle />
<SpinnerCircle thickness="thick" class="size-8" />
<SpinnerCircle class="text-red-500 size-6" direction="ccw" />
```

---

## SpinnerCircleOscillate

Circle progress indicator with oscillating completeness animation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bgStrokeColor` | `string` | CSS variable | Background stroke color |
| `strokeWidth` | `number` | - | Stroke width |
| `noOscillate` | `boolean` | `false` | Disable oscillation (static 66%) |
| `rotateDuration` | `string` | CSS variable | Rotation duration (e.g., ".75s") |
| `class` | `string` | - | Additional CSS classes |

### Usage

```svelte
<SpinnerCircleOscillate />
<SpinnerCircleOscillate class="text-blue-500 size-8" />
<SpinnerCircleOscillate noOscillate bgStrokeColor="" />
```

---

## SpinnerUnicode

Text-based spinner cycling through Unicode characters.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `SpinnerUnicodeVariant` | `"braille_bar_dot"` | Built-in animation variant |
| `speed` | `number` | `100` | Frame duration (ms) |
| `reversed` | `boolean` | `false` | Reverse animation direction |
| `frames` | `string[]` | - | Custom frame array |
| `class` | `string` | - | Additional CSS classes |

### Built-in Variants

`braille_bar`, `braille_bar_dot`, `braille_dot_circle`, `braille_dot_bounce`, `half_circle`, `quarter_circle`, `ascii`, `bar_v`, `bar_h`, `shade`, `arrows`, `arrows2`, `asterix`, `asterix2`, `asterix3`, `asterix4`, `asterix5`

### Usage

```svelte
<SpinnerUnicode />
<SpinnerUnicode variant="ascii" />
<SpinnerUnicode variant="arrows" class="text-green-500" />

<!-- Custom frames -->
<SpinnerUnicode frames={spinnerCreateBackAndForthCharFrames(5, "■", "□")} />
```

---

## CSS Customization

All spinners support customization via CSS variables.

### Available Variables

```css
:root {
  /* Spinner (radial bars) */
  --stuic-spinner-opacity: 0.8;
  --stuic-spinner-fade-end-opacity: 0.12;
  --stuic-spinner-duration: 750ms;

  /* SpinnerCircle */
  --stuic-spinner-circle-thickness-thin: 1px;
  --stuic-spinner-circle-thickness-normal: 2px;
  --stuic-spinner-circle-thickness-thick: 4px;
  --stuic-spinner-circle-duration: 750ms;

  /* SpinnerCircleOscillate */
  --stuic-spinner-circle-oscillate-bg-stroke: var(--stuic-color-border, rgba(0 0 0 / 0.1));
  --stuic-spinner-circle-oscillate-duration: 0.75s;

  /* SpinnerUnicode */
  --stuic-spinner-unicode-font-size: var(--text-xl);
}
```

### Global Override

```css
:root {
  --stuic-spinner-opacity: 1;
  --stuic-spinner-circle-thickness-normal: 3px;
}
```

### Local Override

```svelte
<Spinner style="--stuic-spinner-opacity: 0.5;" />
<SpinnerCircle style="--stuic-spinner-circle-duration: 500ms;" />
```

---

## Color Customization

All spinners use `currentColor`, so apply Tailwind text color classes:

```svelte
<Spinner class="text-blue-500" />
<SpinnerCircle class="text-red-600" />
<SpinnerUnicode class="text-green-500" />
```

---

## Loading Button Example

```svelte
<script lang="ts">
  import { Button, SpinnerCircle } from 'stuic';
  let loading = $state(false);
</script>

<Button disabled={loading}>
  {#if loading}
    <SpinnerCircle class="size-4" />
  {/if}
  Submit
</Button>
```
