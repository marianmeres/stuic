# Rating

Star rating — an input and a display in one component. Input mode is an accessible
`role="radiogroup"` of per-star (or per-half-star) radios with hover preview, roving
keyboard navigation, click-again-to-clear, a hidden input for form participation and
the stuic `validate` action (with `required` enforced). `readonly` turns it into a
display (`role="img"`) that renders any fraction — 4.2 is a 20%-filled fifth star.

Symbols are two stacked copies of an svg: the empty one underneath (muted) and the
filled one on top clipped to the value, so any fill-based icon works as-is (stars by
default; hearts, flames, anything drawn with `currentColor`). Adjacent but different:
`FieldLikeButton` (a field that opens something), `Slider` (a continuous range).

## Props

| Prop                  | Type                              | Default    | Description                                                                                                             |
| --------------------- | --------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value`               | `number`                          | `0`        | Current value (bindable); 0 = no rating. Rendered clamped to `[0, max]`, snapped to whole/half symbols in input mode    |
| `max`                 | `number`                          | `5`        | Number of symbols (integer ≥ 1)                                                                                         |
| `allowHalf`           | `boolean`                         | `false`    | Half-symbol values: each symbol gets two hit zones, arrows step by 0.5                                                  |
| `allowClear`          | `boolean`                         | `true`     | Clicking the selected symbol again, or Delete / Backspace, resets to 0                                                  |
| `readonly`            | `boolean`                         | `false`    | Display variant: `role="img"`, no interaction, no hidden input, fractional values rendered as-is                        |
| `disabled`            | `boolean`                         | `false`    | No interaction; the hidden input is disabled too (nothing submits)                                                      |
| `size`                | `"sm" \| "md" \| "lg"`            | `"md"`     | Symbol size preset (`--stuic-rating-size` overrides any preset)                                                         |
| `intent`              | `IntentColorKey`                  | -          | Theme color of the filled symbols; unset = the fixed "star amber" (`--stuic-rating-icon-color`)                         |
| `icon`                | `string`                          | star       | Raw svg/html string of the filled symbol (e.g. an `@marianmeres/icons-fns` result); must draw with `currentColor`       |
| `iconEmpty`           | `string`                          | = `icon`   | Raw svg/html string of the empty symbol (defaults to the same icon, muted — pass an outline for the outline-empty look) |
| `label`               | `string`                          | `"Rating"` | Accessible name of the group (via `t("rating")` by default); in `readonly` it prefixes the value announcement           |
| `name`                | `string`                          | -          | Form field name of the hidden input (input mode)                                                                        |
| `required`            | `boolean`                         | `false`    | Require a non-zero value — enforced by the built-in validator (hidden inputs skip native constraint validation)         |
| `t`                   | `TranslateFn`                     | English    | i18n translate function (see below)                                                                                     |
| `onchange`            | `(value: number) => void`         | -          | Fires when the user changes the value (click, keyboard, clear)                                                          |
| `validate`            | `boolean \| ValidateOptions`      | -          | Validation (stuic `validate` action): omitted/`true` = on, `false` = off, object = options (`customValidator`, …)       |
| `setValidationResult` | `(res: ValidationResult) => void` | -          | Receives every validation result                                                                                        |
| `unstyled`            | `boolean`                         | `false`    | Skip all default styling                                                                                                |
| `class`               | `string`                          | -          | Additional CSS classes (merged via twMerge)                                                                             |
| `classItem`           | `string`                          | -          | Class for every symbol wrapper                                                                                          |
| `classIcon`           | `string`                          | -          | Class for the icon stack inside each symbol                                                                             |
| `el`                  | `HTMLDivElement`                  | -          | Root element reference (bindable)                                                                                       |
| `inputEl`             | `HTMLInputElement`                | -          | Hidden input reference (bindable; input mode)                                                                           |

Other attributes (`id`, `style`, `data-*`, …) are passed to the root `div`.
`onkeydown` and `onpointerleave` are reserved by the component.

### Imperative API (via `bind:this`)

| Method              | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `validate()`        | Trigger validation now; returns the `ValidationResult`               |
| `clearValidation()` | Clear the stored result and the hidden input's custom validity       |
| `getValidation()`   | The last validation result (also reported via `setValidationResult`) |

## Usage

### Input

```svelte
<script lang="ts">
	import { Rating } from "@marianmeres/stuic";

	let value = $state(0);
</script>

<Rating bind:value />
<Rating bind:value allowHalf />
<Rating bind:value max={10} size="sm" />
<Rating bind:value allowClear={false} onchange={(v) => console.log("rated", v)} />
```

### Display

```svelte
<div class="flex items-center gap-2">
	<Rating value={4.2} readonly label="Average rating" />
	<span>4.2</span>
	<span class="text-neutral-500">(128 reviews)</span>
</div>
```

### In a form

The hidden input submits `name=value`. `required` is enforced by the built-in
validator; call `validate()` on submit so a never-touched field reports as well.

```svelte
<script lang="ts">
	import { Rating, type ValidationResult } from "@marianmeres/stuic";

	let rating: Rating;
	let validation: ValidationResult | undefined = $state();

	function onsubmit(e: SubmitEvent) {
		if (!rating.validate()?.valid) e.preventDefault();
	}
</script>

<form {onsubmit}>
	<Rating
		bind:this={rating}
		name="score"
		required
		setValidationResult={(r) => (validation = r)}
	/>
	{#if validation && !validation.valid}
		<p class="text-red-600">{validation.message}</p>
	{/if}
	<button>Submit</button>
</form>
```

Custom rules go through the action's `customValidator` (it receives the value as a
string; the built-in `required` check runs first):

```svelte
<Rating
	name="score"
	validate={{ customValidator: (v) => (Number(v) < 2 ? "Be kinder" : "") }}
/>
```

### Custom symbols

```svelte
<script lang="ts">
	import { Rating, iconStar } from "@marianmeres/stuic";
	import { iconBsHeartFill } from "@marianmeres/icons-fns/bootstrap/iconBsHeartFill.js";
	import { iconBsHeart } from "@marianmeres/icons-fns/bootstrap/iconBsHeart.js";
</script>

<!-- outline when empty, filled star when set -->
<Rating value={3.5} readonly iconEmpty={iconStar()} />

<!-- hearts -->
<Rating
	bind:value
	icon={iconBsHeartFill()}
	iconEmpty={iconBsHeart()}
	intent="destructive"
/>
```

Fill-based icons work best: the filled layer is clipped horizontally to the value, so
the symbol has to be drawn with `currentColor` (stroke-only icons render as a colored
outline — fine as `iconEmpty`, thin as `icon`).

### i18n

Built-in English; bundled Slovak (`RATING_MESSAGES_SK`) is opt-in. Localized: the
group label (`rating`), the per-symbol radio / display announcement (`value_of_max`,
"{value} of {max} stars") and the required message (`required`). With non-star
symbols override `value_of_max` ("{value} of {max} hearts").

```svelte
<script lang="ts">
	import { Rating, createRatingT, RATING_MESSAGES_SK } from "@marianmeres/stuic";
	const t = createRatingT(RATING_MESSAGES_SK);
</script>

<Rating bind:value {t} />
```

## Accessibility

- Input mode is a `role="radiogroup"` (named by `label` / `t("rating")`) of
  `role="radio"` buttons, one per symbol (two per symbol with `allowHalf`), each
  labeled "N of M stars" and `aria-checked` when selected. `aria-required`,
  `aria-disabled` and `aria-invalid` (after a failed validation) are reflected on
  the group.
- Roving tabindex: the selected symbol is the single tab stop (the first one when
  nothing is selected).
- Keyboard: `→` / `↑` +1 step, `←` / `↓` −1 step (never below one step), `Home` /
  `End` first / last, `Delete` / `Backspace` clear (when `allowClear`), `Space` /
  `Enter` select the focused symbol (no toggle — clearing by re-clicking is
  pointer-only, like native radios).
- Display mode is a `role="img"` with the value announcement as its label; the
  icons themselves are always `aria-hidden`.
- The hover preview is pointer-only and never changes the value.

## CSS Variables

| Variable                          | Default                                             | Description                                                            |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| `--stuic-rating-size`             | unset (`sm` 1.125rem / `md` 1.5rem / `lg` 2rem)     | Symbol size; when set it overrides whichever `size` preset is on       |
| `--stuic-rating-gap`              | `0.125rem`                                          | Gap between symbols                                                    |
| `--stuic-rating-icon-color`       | `#f59e0b`                                           | Filled symbol color (theme-independent on purpose; `intent` overrides) |
| `--stuic-rating-icon-color-empty` | `color-mix(in srgb, currentColor 20%, transparent)` | Empty symbol color (a tint of the surrounding text, so it adapts)      |
| `--stuic-rating-icon-scale-hover` | `1.15`                                              | Scale of the hovered symbol                                            |
| `--stuic-rating-ring-width`       | `3px`                                               | Focus ring width                                                       |
| `--stuic-rating-ring-color`       | `--stuic-color-ring`                                | Focus ring color                                                       |
| `--stuic-rating-radius`           | `--stuic-radius`                                    | Focus ring radius                                                      |
| `--stuic-rating-transition`       | `--stuic-transition`                                | Fill / hover-scale transition duration                                 |
| `--stuic-rating-opacity-disabled` | `0.5`                                               | Disabled opacity                                                       |

`--stuic-rating-fill` (`0%`–`100%`) is **set by the component** inline on every
symbol wrapper — an output, not an input. It survives `unstyled`, so a fully custom
presentation can read it (e.g. a Tailwind `before:w-(--stuic-rating-fill)` bar).

## Data Attributes

- `data-size` - `"sm" | "md" | "lg"` (root)
- `data-intent` - `IntentColorKey` (root, when set)
- `data-readonly` / `data-disabled` - empty attributes (root)
- `data-hover` - empty attribute (root while a symbol is hovered; and on the hovered symbol wrapper)
- `data-state` - `"full" | "partial" | "empty"` (symbol wrapper, for the displayed — hovered or actual — value)
- `data-value` - the zone's value, e.g. `"2.5"` (radio buttons)
- `data-half` - `"start" | "end"` (radio buttons, with `allowHalf`)
