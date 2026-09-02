# RangeSlider

The dual-thumb sibling of [`Slider`](../Slider/README.md): two values (`start` ≤ `end`) on
one pill-shaped track, with the fill spanning the selected range — price filters,
"between" queries, min/max limits. Same construction and look as `Slider`: horizontal
and vertical orientation, pointer dragging with step snapping (the thumbs never cross),
native keyboard interaction per thumb, tick marks, floating value labels, form
participation via two hidden range inputs, and validation.

Not a replacement for two `FieldInput type="range"`s — this is the "fancy" custom-UI
variant. The bound ends are two plain numbers (`bind:start` / `bind:end`), the same
shape `FieldDateRange` uses.

## Props

| Prop           | Type                                                               | Default        | Description                                                                                                                                      |
| -------------- | ------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `start`        | `number`                                                           | `min`          | Lower value (bindable; non-finite / out-of-range / off-grid writes are normalized back, a reversed pair is reordered, `minRange` enforced)       |
| `end`          | `number`                                                           | `max`          | Upper value (bindable; same normalization). Defaults to `max`, or the last step-grid point below it                                              |
| `min`          | `number`                                                           | `0`            | Minimum value                                                                                                                                    |
| `max`          | `number`                                                           | `100`          | Maximum value                                                                                                                                    |
| `step`         | `number \| "any"`                                                  | `1`            | Snap increment (`"any"` or non-positive = continuous)                                                                                            |
| `minRange`     | `number`                                                           | `0`            | Minimum distance between the two values; rounded up onto the step grid, capped at the span. `0` lets the thumbs coincide                         |
| `orientation`  | `"horizontal" \| "vertical"`                                       | `"horizontal"` | Slider direction (vertical fills bottom-up)                                                                                                      |
| `size`         | `"sm" \| "md" \| "lg" \| string`                                   | `"md"`         | Cross-axis thickness preset                                                                                                                      |
| `intent`       | `"primary" \| "accent" \| "success" \| "warning" \| "destructive"` | -              | Semantic fill color                                                                                                                              |
| `thumb`        | `boolean \| Snippet<[RangeSliderRenderCtx]>`                       | `true`         | `false` hides both thumbs (fill-only look), a snippet renders inside each thumb (its context says which one)                                     |
| `fillRounded`  | `boolean`                                                          | `false`        | Round the fill's edges ("pill inside a pill")                                                                                                    |
| `ticks`        | `boolean \| number[]`                                              | -              | `true` = tick at every `step` (positive numeric step only; skipped above 101 auto ticks — pass an array), array = ticks at given in-range values |
| `valueLabel`   | `Snippet<[RangeSliderRenderCtx]>`                                  | -              | Floating label per thumb, at its value along the track                                                                                           |
| `disabled`     | `boolean`                                                          | `false`        | Disable interaction                                                                                                                              |
| `label`        | `string`                                                           | -              | Accessible name of the whole control (`aria-label` on the `role="group"` root)                                                                   |
| `labelStart`   | `string`                                                           | `t("minimum")` | Accessible name of the start thumb's input ("Minimum")                                                                                           |
| `labelEnd`     | `string`                                                           | `t("maximum")` | Accessible name of the end thumb's input ("Maximum")                                                                                             |
| `nameStart`    | `string`                                                           | -              | Form field name of the hidden range input carrying `start`                                                                                       |
| `nameEnd`      | `string`                                                           | -              | Form field name of the hidden range input carrying `end`                                                                                         |
| `oninput`      | `(value: RangeSliderValue, thumb: RangeSliderThumb) => void`       | -              | Fires on every value change (drag, keyboard) with the pair and the thumb that moved                                                              |
| `onchange`     | `(value: RangeSliderValue, thumb: RangeSliderThumb) => void`       | -              | Fires when a change is committed (drag release, keyboard)                                                                                        |
| `validate`     | `boolean \| ValidateOptions`                                       | -              | Enable validation (stuic validate action). **`customValidator` receives the `{ start, end }` pair** as its value                                 |
| `t`            | `TranslateFn`                                                      | English        | i18n of the default thumb names (`createRangeSliderT`)                                                                                           |
| `unstyled`     | `boolean`                                                          | `false`        | Skip all default styling                                                                                                                         |
| `class`        | `string`                                                           | -              | Classes for the root element                                                                                                                     |
| `trackClass`   | `string`                                                           | -              | Classes for the track (pill background)                                                                                                          |
| `fillClass`    | `string`                                                           | -              | Classes for the fill (selected range)                                                                                                            |
| `thumbClass`   | `string`                                                           | -              | Classes for both thumbs                                                                                                                          |
| `tickClass`    | `string`                                                           | -              | Classes for each tick mark                                                                                                                       |
| `valueClass`   | `string`                                                           | -              | Classes for both value label wrappers                                                                                                            |
| `el`           | `HTMLDivElement`                                                   | -              | Root element reference (bindable)                                                                                                                |
| `inputStartEl` | `HTMLInputElement`                                                 | -              | Hidden range input carrying `start` (bindable)                                                                                                   |
| `inputEndEl`   | `HTMLInputElement`                                                 | -              | Hidden range input carrying `end` (bindable)                                                                                                     |

`RangeSliderValue` (the callback / validator payload): `{ start: number; end: number }`.

`RangeSliderThumb`: `"start" | "end"`.

`RangeSliderRenderCtx` (passed to the `thumb` and `valueLabel` snippets, once per thumb):
`{ thumb: RangeSliderThumb; value: number; ratio: number /* 0..1 */; percent: number /* 0..100 */; dragging: boolean; start: number; end: number }`

Remaining props are spread onto the root `<div>`.

### Exported methods (via component instance binding)

| Method                  | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `validate()`            | Trigger validation now                                              |
| `clearValidation()`     | Clear the current validation result                                 |
| `getValidation()`       | Read the current validation result                                  |
| `focus()`               | Focus the start thumb's range input (Tab moves on to the end thumb) |
| `scrollIntoView(opts?)` | Scroll the slider into view                                         |

### Other exports

| Export                     | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `createRangeSliderT`       | Builds the `t` prop from a (partial) message catalog |
| `RANGE_SLIDER_MESSAGES_EN` | Built-in English catalog (also the fallback)         |
| `RANGE_SLIDER_MESSAGES_SK` | Bundled Slovak catalog (opt-in)                      |
| `RangeSliderMessageKey`    | `"minimum" \| "maximum"`                             |
| `RangeSliderMessages`      | One locale's catalog                                 |

## Usage

### Basic

```svelte
<script lang="ts">
	import { RangeSlider } from "@marianmeres/stuic";

	let priceMin = $state(150);
	let priceMax = $state(600);
</script>

<RangeSlider bind:start={priceMin} bind:end={priceMax} min={0} max={1000} step={10} />
```

### Price filter with value labels

```svelte
<RangeSlider
	bind:start={priceMin}
	bind:end={priceMax}
	min={0}
	max={1000}
	step={10}
	label="Price"
	labelStart="Minimum price"
	labelEnd="Maximum price"
>
	{#snippet valueLabel({ value })}
		{eur.format(value)}
	{/snippet}
</RangeSlider>
```

Labels are rendered per thumb and will overlap when the thumbs are close; for a single
combined readout ("€150 – €600") render it yourself next to the slider from the bound
values.

### Minimum distance

```svelte
<!-- the thumbs can never get closer than 20 -->
<RangeSlider bind:start bind:end minRange={20} />
```

### Steps and ticks

```svelte
<RangeSlider min={0} max={24} step={1} ticks bind:start={from} bind:end={to} />
<RangeSlider min={0} max={100} step={0.5} ticks={[0, 25, 50, 75, 100]} />
```

### Fill-only (no thumbs)

```svelte
<RangeSlider thumb={false} start={30} end={70} />
```

With no thumbs there is nothing to reserve: the values map linearly across the whole
track and the fill collapses to zero when they coincide.

### Custom thumb content

The snippet renders once per thumb; use `thumb` from its context to tell them apart.

```svelte
<RangeSlider bind:start bind:end size="lg">
	{#snippet thumb({ thumb })}
		{@html (thumb === "start" ? iconChevronLeft : iconChevronRight)({ size: 18 })}
	{/snippet}
</RangeSlider>
```

### Vertical

```svelte
<RangeSlider orientation="vertical" class="h-40" bind:start bind:end />
```

### In a form

Two hidden `input[type=range]` carry the values:

```svelte
<form onsubmit={...}>
	<RangeSlider nameStart="price_min" nameEnd="price_max" bind:start bind:end />
</form>
```

### Validation

The stuic `validate` action is attached to the start input and re-run whenever either
thumb commits. Because a single input's DOM string is useless for a range rule,
`customValidator` receives the `{ start, end }` pair as its value (the start input is
still passed as the third argument):

```svelte
<RangeSlider
	bind:start
	bind:end
	validate={{
		customValidator: (v) => {
			const { start, end } = v as RangeSliderValue;
			return end - start < 25 ? "Span at least 25" : "";
		},
	}}
	setValidationResult={(res) => (validation = res)}
/>
```

### i18n

Only the default thumb names ("Minimum" / "Maximum") are translatable — pass explicit
`labelStart` / `labelEnd` for context-specific names.

```svelte
<script>
	import {
		RangeSlider,
		createRangeSliderT,
		RANGE_SLIDER_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createRangeSliderT(RANGE_SLIDER_MESSAGES_SK);
</script>

<RangeSlider bind:start bind:end {t} />
```

## Interaction

- **Pointer**: press anywhere on the track and the _nearest_ thumb jumps there, then
  drags. Grabbing a thumb itself does not jump (the drag continues from the grab point).
  When both thumbs sit on top of each other, a press beside them moves the thumb on that
  side (towards `max` the end thumb, towards `min` the start thumb), and a press _on_
  them is resolved by the first move's direction — drag right/up and the end thumb
  comes along, left/down the start thumb.
- **No crossing**: a thumb dragged (or stepped) past the other one stops at it —
  `minRange` apart when set. Thumbs never swap roles.
- **Keyboard**: Tab focuses the start thumb, then the end thumb; Arrow keys / PageUp /
  PageDown / Home / End step the focused one — native `input[type=range]` behavior, with
  the other thumb as the limit (End on the start thumb jumps up to the end thumb).
- **Thumb reserve**: with thumbs rendered the values map onto the thumb-center travel —
  the outer half-thumb at each end of the track resolves to `min` / `max`, and the fill
  never shrinks below one thumb (coinciding thumbs leave a thumb-sized nub).
  `thumb={false}` maps linearly across the whole track instead.
- **Vertical**: bottom is `min`, top is `max`; ArrowUp increases.
- **RTL**: horizontal sliders flip automatically (logical CSS properties + pointer math).
- **Commit semantics**: `oninput` fires only on actual value changes; `onchange` only
  when a drag / keypress committed a _different_ value (native-faithful — a no-move tap
  fires neither). Both receive the whole pair plus the thumb that moved.
- **Off-grid max**: when `max` is not on the step grid (e.g. `min=0 max=95 step=10`),
  the largest reachable value is the last grid point (`90`), matching native range
  sanitization — that is also the default `end`.

## Accessibility

The root is a `role="group"` named by `label`; inside it, each thumb is a real
`<input type="range">` (visually hidden, full thickness, covering the track from its end
up to the midpoint between the thumbs), so screen readers see two sliders named
`labelStart` / `labelEnd` — "Minimum" / "Maximum" by default (`t`) — with the native
value, min and max. Explore-by-touch on VoiceOver / TalkBack lands on the slider of the
side being touched. The focus ring is drawn around the focused thumb (around the track
when `thumb={false}`).

## Caveats

- **Cross-axis sizing**: size the thickness via `size` presets or
  `--stuic-range-slider-thickness` — not via `h-*`/`w-*` utility classes. The pointer math
  and the CSS thumb positioning both derive from the thickness; a utility class
  resizes the box without updating `--_thickness`, misaligning them. (Main-axis length
  via a class — e.g. `class="w-72"` — is fine.)
- **Root pointer handlers are reserved**: `onpointerdown/move/up/cancel` are excluded
  from `Props` (the drag machinery owns them). Wrap the slider if you need them.
- **Touch**: the slider claims the whole touch gesture (`touch-action: none`) — a touch
  starting on it adjusts a value and never scrolls the page.
- **The wrapper is not the control**: props spread onto the root `<div>` — including
  `onfocus` / `onblur` — never reach the hidden inputs. Use `label`, `labelStart`,
  `labelEnd`; for anything else bind `inputStartEl` / `inputEndEl` and wire it
  imperatively.
- **Independent tokens**: the look is deliberately not derived from `--stuic-slider-*`.
  A theme that restyles `Slider` restyles `RangeSlider` by setting the
  `--stuic-range-slider-*` twins.

## CSS Variables

| Variable                                | Default                       | Description                        |
| --------------------------------------- | ----------------------------- | ---------------------------------- |
| `--stuic-range-slider-track`            | `--stuic-color-muted`         | Track (pill background) color      |
| `--stuic-range-slider-fill`             | `--stuic-color-primary`       | Fill (selected range) color        |
| `--stuic-range-slider-thumb`            | `--color-white`               | Thumb background                   |
| `--stuic-range-slider-thumb-foreground` | `--stuic-color-foreground`    | Thumb content color                |
| `--stuic-range-slider-tick`             | foreground 25% mix            | Tick mark color (over the track)   |
| `--stuic-range-slider-tick-on-fill`     | background 55% mix            | Tick mark color (over the fill)    |
| `--stuic-range-slider-ring-width`       | `4px`                         | Focus ring width                   |
| `--stuic-range-slider-ring-color`       | `--stuic-color-ring`          | Focus ring color                   |
| `--stuic-range-slider-thickness`        | `2rem` (`sm` 1.25, `lg` 3)    | Cross-axis size                    |
| `--stuic-range-slider-length`           | `10rem`                       | Main-axis size                     |
| `--stuic-range-slider-thumb-inset`      | `3px`                         | Gap between thumb and track edge   |
| `--stuic-range-slider-radius`           | `9999px`                      | Track corner radius                |
| `--stuic-range-slider-fill-radius`      | `--stuic-range-slider-radius` | Fill radius (when `fillRounded`)   |
| `--stuic-range-slider-thumb-radius`     | `9999px`                      | Thumb corner radius                |
| `--stuic-range-slider-thumb-shadow`     | `--stuic-shadow`              | Thumb shadow                       |
| `--stuic-range-slider-tick-size`        | `4px`                         | Tick mark diameter                 |
| `--stuic-range-slider-value-gap`        | `0.375rem`                    | Gap between track and value labels |
| `--stuic-range-slider-transition`       | `--stuic-transition`          | Fill/thumb movement transition     |

Data attributes on the root, for custom CSS: `data-orientation`, `data-thumbs`
(`"true"` / `"false"`), `data-fill-rounded`, `data-size`, `data-intent`,
`data-disabled`, `data-dragging` / `data-ring` / `data-active-thumb` (each naming a
thumb: `"start"` / `"end"`). Thumbs, value labels and the hidden inputs carry
`data-thumb="start|end"`; tick layers `data-layer="before|on-fill|after"`.
