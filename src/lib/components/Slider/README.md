# Slider

A fancy `input[type="range"]` wrap — a pill-shaped track that fills with the value, with
an optional icon-capable thumb riding the fill edge (think iOS volume control). Supports
horizontal and vertical orientation, pointer dragging with step snapping, native keyboard
interaction, tick marks, a floating value label, form participation, and validation.

Not a replacement for `FieldInput type="range"` — this is the special-case "fancy"
variant for custom UI (volume/brightness controls, dashboards, media players).

## Props

| Prop            | Type                                                               | Default        | Description                                                                                                                                      |
| --------------- | ------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`         | `number`                                                           | `min`          | Current value (bindable; non-finite / out-of-range / off-grid writes are normalized back)                                                        |
| `min`           | `number`                                                           | `0`            | Minimum value                                                                                                                                    |
| `max`           | `number`                                                           | `100`          | Maximum value                                                                                                                                    |
| `step`          | `number \| "any"`                                                  | `1`            | Snap increment (`"any"` or non-positive = continuous)                                                                                            |
| `orientation`   | `"horizontal" \| "vertical"`                                       | `"horizontal"` | Slider direction (vertical fills bottom-up)                                                                                                      |
| `size`          | `"sm" \| "md" \| "lg" \| string`                                   | `"md"`         | Cross-axis thickness preset                                                                                                                      |
| `intent`        | `"primary" \| "accent" \| "success" \| "warning" \| "destructive"` | -              | Semantic fill color                                                                                                                              |
| `thumb`         | `boolean \| Snippet<[SliderRenderCtx]>`                            | `true`         | `false` hides the thumb (fill-only look), snippet renders inside thumb                                                                           |
| `thumbPosition` | `"value" \| "start"`                                               | `"value"`      | `"value"` rides the fill edge; `"start"` pins it to the left/bottom so only the bar moves (true iOS volume look)                                 |
| `fillRounded`   | `boolean`                                                          | `false`        | Round the fill's leading edge ("pill inside a pill")                                                                                             |
| `ticks`         | `boolean \| number[]`                                              | -              | `true` = tick at every `step` (positive numeric step only; skipped above 101 auto ticks — pass an array), array = ticks at given in-range values |
| `valueLabel`    | `Snippet<[SliderRenderCtx]>`                                       | -              | Floating label at the current value along the track                                                                                              |
| `disabled`      | `boolean`                                                          | `false`        | Disable interaction                                                                                                                              |
| `label`         | `string`                                                           | -              | Screen reader label for the underlying input                                                                                                     |
| `id`            | `string`                                                           | -              | Id for the underlying input (enables `<label for>` association)                                                                                  |
| `name`          | `string`                                                           | -              | Form field name for the hidden range input                                                                                                       |
| `required`      | `boolean`                                                          | `false`        | Forwarded to the input; per HTML spec inert on range inputs (use `validate.customValidator` for custom rules)                                    |
| `oninput`       | `(value: number) => void`                                          | -              | Fires on every value change (drag, keyboard)                                                                                                     |
| `onchange`      | `(value: number) => void`                                          | -              | Fires when a change is committed (drag release, keyboard)                                                                                        |
| `validate`      | `boolean \| ValidateOptions`                                       | -              | Enable validation (stuic validate action)                                                                                                        |
| `unstyled`      | `boolean`                                                          | `false`        | Skip all default styling                                                                                                                         |
| `class`         | `string`                                                           | -              | Classes for the root element                                                                                                                     |
| `trackClass`    | `string`                                                           | -              | Classes for the track (pill background)                                                                                                          |
| `fillClass`     | `string`                                                           | -              | Classes for the fill (value indicator)                                                                                                           |
| `thumbClass`    | `string`                                                           | -              | Classes for the thumb                                                                                                                            |
| `tickClass`     | `string`                                                           | -              | Classes for each tick mark                                                                                                                       |
| `valueClass`    | `string`                                                           | -              | Classes for the value label wrapper                                                                                                              |
| `el`            | `HTMLDivElement`                                                   | -              | Root element reference (bindable)                                                                                                                |
| `inputEl`       | `HTMLInputElement`                                                 | -              | Hidden range input reference (bindable)                                                                                                          |

`SliderRenderCtx` (passed to the `thumb` and `valueLabel` snippets):
`{ value: number; ratio: number /* 0..1 */; percent: number /* 0..100 */; dragging: boolean }`

Remaining props are spread onto the root `<div>`.

### Exported methods (via component instance binding)

| Method                  | Description                         |
| ----------------------- | ----------------------------------- |
| `validate()`            | Trigger validation now              |
| `clearValidation()`     | Clear the current validation result |
| `getValidation()`       | Read the current validation result  |
| `focus()`               | Focus the underlying range input    |
| `scrollIntoView(opts?)` | Scroll the slider into view         |

## Usage

### Basic

```svelte
<script lang="ts">
	import { Slider } from "@marianmeres/stuic";

	let volume = $state(30);
</script>

<Slider bind:value={volume} />
```

### Vertical volume control (thumb rides the fill edge)

```svelte
<Slider
	orientation="vertical"
	size="lg"
	bind:value={volume}
	style="--stuic-slider-length: 10rem; --stuic-slider-fill: white; --stuic-slider-track: rgb(255 255 255 / .25);"
>
	{#snippet thumb()}
		{@html iconVolume({ size: 16 })}
	{/snippet}
</Slider>
```

### Fill-only (no thumb)

```svelte
<Slider thumb={false} bind:value={brightness} />
```

### True iOS volume: fixed icon at the start, only the bar moves

```svelte
<!-- bare icon (no knob): drop the thumb's own background/shadow -->
<Slider
	orientation="vertical"
	thumbPosition="start"
	fillRounded
	thumbClass="bg-transparent shadow-none"
	bind:value={volume}
>
	{#snippet thumb()}
		{@html iconVolume({ size: 18 })}
	{/snippet}
</Slider>

<!-- or keep the white knob pinned at the bottom -->
<Slider orientation="vertical" thumbPosition="start" bind:value={volume}>
	{#snippet thumb()}
		{@html iconVolume({ size: 16 })}
	{/snippet}
</Slider>
```

With `thumbPosition="start"` the thumb is decorative (`pointer-events: none`) and the
value maps linearly across the full track — there is no thumb-travel inset.

### Steps and ticks

```svelte
<Slider min={0} max={10} step={1} ticks bind:value={rating} />
<Slider min={0} max={100} step={0.5} ticks={[0, 25, 50, 75, 100]} />
```

### Value label

```svelte
<Slider bind:value={percent}>
	{#snippet valueLabel({ value })}
		{value}%
	{/snippet}
</Slider>
```

### Continuous (no snapping)

```svelte
<Slider step="any" bind:value={gain} />
```

### In a form

```svelte
<form onsubmit={...}>
	<Slider name="volume" bind:value={volume} />
</form>
```

## Interaction

- **Pointer**: press anywhere on the track to jump the value there, then drag. Grabbing
  the thumb itself does not jump (drag continues from the grab point).
- **Keyboard**: focus and use Arrow keys / PageUp / PageDown / Home / End — native
  `input[type=range]` behavior (the real input is visually hidden but focusable).
- **Vertical**: bottom is `min`, top is `max`; ArrowUp increases.
- **RTL**: horizontal sliders flip automatically (logical CSS properties + pointer math).
- **Commit semantics**: `oninput` fires only on actual value changes; `onchange` only
  when a drag/keypress committed a _different_ value (native-faithful — a no-move tap
  fires neither).
- **Off-grid max**: when `max` is not on the step grid (e.g. `min=0 max=95 step=10`),
  the largest reachable value is the last grid point (`90`), matching native range
  sanitization.

## Caveats

- **Cross-axis sizing**: size the thickness via `size` presets or
  `--stuic-slider-thickness` — not via `h-*`/`w-*` utility classes. The pointer math
  and the CSS thumb positioning both derive from the thickness; a utility class
  resizes the box without updating `--_thickness`, misaligning them. (Main-axis
  length via a class — e.g. `class="h-40"` on a vertical slider — is fine.)
- **Root pointer handlers are reserved**: `onpointerdown/move/up/cancel` are excluded
  from `Props` (the drag machinery owns them). Wrap the slider if you need them.
- **Touch**: the slider claims the whole touch gesture (`touch-action: none`) —
  a touch starting on it adjusts the value and never scrolls the page.
- **The wrapper is not the control**: props spread onto the root `<div>` — including
  `aria-*` and `onfocus`/`onblur` — never reach the underlying `<input type="range">`
  and are inert for assistive tech. Use `label` (→ `aria-label`) and `id` (→ `<label for>`);
  for anything else, bind `inputEl` and wire it imperatively.

## CSS Variables

| Variable                          | Default                    | Description                       |
| --------------------------------- | -------------------------- | --------------------------------- |
| `--stuic-slider-track`            | `--stuic-color-muted`      | Track (pill background) color     |
| `--stuic-slider-fill`             | `--stuic-color-primary`    | Fill color                        |
| `--stuic-slider-thumb`            | `--color-white`            | Thumb background                  |
| `--stuic-slider-thumb-foreground` | `--stuic-color-foreground` | Thumb content color               |
| `--stuic-slider-tick`             | foreground 25% mix         | Tick mark color (over the track)  |
| `--stuic-slider-tick-on-fill`     | background 55% mix         | Tick mark color (over the fill)   |
| `--stuic-slider-ring-width`       | `4px`                      | Focus ring width                  |
| `--stuic-slider-ring-color`       | `--stuic-color-ring`       | Focus ring color                  |
| `--stuic-slider-thickness`        | `2rem` (`sm` 1.25, `lg` 3) | Cross-axis size                   |
| `--stuic-slider-length`           | `10rem`                    | Main-axis size                    |
| `--stuic-slider-thumb-inset`      | `3px`                      | Gap between thumb and track edge  |
| `--stuic-slider-radius`           | `9999px`                   | Track corner radius               |
| `--stuic-slider-fill-radius`      | `--stuic-slider-radius`    | Fill radius (when `fillRounded`)  |
| `--stuic-slider-thumb-radius`     | `9999px`                   | Thumb corner radius               |
| `--stuic-slider-thumb-shadow`     | `--stuic-shadow`           | Thumb shadow                      |
| `--stuic-slider-tick-size`        | `4px`                      | Tick mark diameter                |
| `--stuic-slider-value-gap`        | `0.375rem`                 | Gap between track and value label |
| `--stuic-slider-transition`       | `--stuic-transition`       | Fill/thumb movement transition    |
