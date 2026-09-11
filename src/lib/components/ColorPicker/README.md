# ColorPicker

A swatch palette plus a custom-color escape hatch — what `<input type="color">` alone
cannot do. The palette is a `role="radiogroup"` of swatch buttons (roving tabindex,
arrows / Home / End / Delete, an optional "no color" swatch), and the custom row is the
native `<input type="color">` next to a hex text field. A hidden input carries the value
into forms, with the stuic `validate` action and `required` enforced.

Swatch values are **never parsed** — they are handed to CSS as-is, so a palette may hold
`#3b82f6`, `oklch(...)`, `transparent`, or `var(--stuic-color-primary)`. The selected
swatch is marked by a ring drawn _outside_ it, which reads on any color without
measuring its luminance.

Mobile is the native picker's home turf: tapping the swatch button opens the platform's
own full-screen color UI, so there is no anchored popover to fight the on-screen
keyboard. Swatches grow to a ~44px hit target on a coarse pointer, and the hex field
carries the iOS zoom guard.

Adjacent but different: `Rating` (the same input-with-hidden-input shape),
`FieldSelect` (a labeled field wrapper), `ThemePreview` (theme token swatches).

## Props

| Prop                  | Type                                    | Default                | Description                                                                                                      |
| --------------------- | --------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `value`               | `string`                                | `""`                   | Current color (bindable). Any CSS color string, stored verbatim; `""` = no color                                 |
| `palette`             | `ColorPickerSwatch[]`                   | `COLOR_PICKER_PALETTE` | Swatches: color strings or `{ value, label }` objects. `[]` renders no palette                                   |
| `columns`             | `number`                                | —                      | Cap of N swatches per row (a narrower container wraps to fewer). Unset = as many as fit                          |
| `custom`              | `"both" \| "native" \| "text" \| false` | `"both"`               | Which custom-color controls to render under the palette                                                          |
| `allowClear`          | `boolean`                               | `true`                 | A crossed-out "no color" swatch, Delete / Backspace, and an emptied hex field all set `""`                       |
| `disabled`            | `boolean`                               | `false`                | No interaction; the hidden input is disabled too (nothing submits)                                               |
| `label`               | `string`                                | `"Color"`              | Accessible name of the swatch group (via `t("color")` by default)                                                |
| `name`                | `string`                                | —                      | Form field name of the hidden input                                                                              |
| `required`            | `boolean`                               | `false`                | Require a non-empty value — enforced by the built-in validator (hidden inputs skip native constraint validation) |
| `t`                   | `TranslateFn`                           | English                | i18n translate function (see below)                                                                              |
| `onchange`            | `(value: string) => void`               | —                      | Fires on a user **commit** (see "Preview vs commit")                                                             |
| `validate`            | `boolean \| ValidateOptions`            | —                      | Validation (stuic `validate` action): omitted/`true` = on, `false` = off, object = options                       |
| `setValidationResult` | `(res: ValidationResult) => void`       | —                      | Receives every validation result                                                                                 |
| `unstyled`            | `boolean`                               | `false`                | Skip all default styling (aria and `data-index` stay)                                                            |
| `class`               | `string`                                | —                      | Additional CSS classes (merged via twMerge)                                                                      |
| `classSwatch`         | `string`                                | —                      | Class for every swatch button                                                                                    |
| `el`                  | `HTMLDivElement`                        | —                      | Root element reference (bindable)                                                                                |
| `inputEl`             | `HTMLInputElement`                      | —                      | Hidden input reference (bindable)                                                                                |

Other attributes (`id`, `style`, `data-*`, …) are passed to the root `div`.

### Imperative API (via `bind:this`)

| Method              | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `validate()`        | Trigger validation now; returns the `ValidationResult`               |
| `clearValidation()` | Clear the stored result and the hidden input's custom validity       |
| `getValidation()`   | The last validation result (also reported via `setValidationResult`) |

## Usage

### Basic

```svelte
<script lang="ts">
	import { ColorPicker } from "@marianmeres/stuic";
	let color = $state("#3b82f6");
</script>

<ColorPicker bind:value={color} />
```

### Palette only, capped rows

```svelte
<ColorPicker
	bind:value={color}
	palette={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"]}
	columns={3}
	custom={false}
	allowClear={false}
/>
```

### Theme-token swatches

```svelte
<script lang="ts">
	import { ColorPicker, COLOR_PICKER_PALETTE_THEME } from "@marianmeres/stuic";
	let color = $state("var(--stuic-color-primary)");
</script>

<ColorPicker bind:value={color} palette={COLOR_PICKER_PALETTE_THEME} />
```

The stored value is the `var(--stuic-color-*)` reference itself, so it keeps following
the theme wherever it is applied later. The native picker cannot display such a value
(it shows black until a hex is picked), and on the monochrome themes several of these
resolve to near-identical greys.

### In a form

```svelte
<script lang="ts">
	import { ColorPicker, Button } from "@marianmeres/stuic";
	let picker: ColorPicker | undefined = $state();
	let color = $state("");

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!picker?.validate()?.valid) return;
		// ...
	}
</script>

<form {onsubmit}>
	<ColorPicker bind:this={picker} bind:value={color} name="brand_color" required />
	<Button type="submit">Save</Button>
</form>
```

## Preview vs commit

`value` updates **live** while the native picker is being dragged and while a valid
color is being typed into the hex field, so `bind:value` can drive a live preview.
`onchange` (and the hidden input's `change`, which is what re-runs validation) fires
only on a **commit**:

| Action                                           | `value` | `onchange`                   |
| ------------------------------------------------ | ------- | ---------------------------- |
| Swatch click / arrow key onto a different swatch | ✅      | ✅                           |
| Arrow / Home / End onto the already-checked one  | —       | — (a radio does not re-fire) |
| Dragging inside the native OS picker             | ✅      | —                            |
| The native picker's `change` (dialog committed)  | ✅      | ✅                           |
| Typing a valid color into the hex field          | ✅      | —                            |
| Enter / blur in the hex field                    | ✅      | ✅                           |
| Enter / blur with an unparseable hex field       | —       | — (the field snaps back)     |

The hex field accepts hex in any spelling (`#0f0`, `3b82f6`) and normalizes it to
lowercase `#rrggbb` on commit; anything else the browser accepts as a CSS color
(`rebeccapurple`, `rgb(0 0 255)`, `#rrggbbaa`) is kept verbatim. Emptying it clears the
value when `allowClear` is on.

## Accessibility

- The swatches are a `role="radiogroup"` of `role="radio"` buttons with a roving
  tabindex: the checked swatch is the single tab stop (the first one when the current
  color is off-palette), and arrows move + select. Left / Right wrap around the group;
  Up / Down step by one **rendered** row (measured from the layout, so it stays right
  when a narrow screen wraps to fewer per row) and stop at the edges.
  `aria-required` / `aria-invalid` sit on the group.
- Every swatch is named: an entry's `label` (through `t`) or, without one, its color
  string. The clear swatch is "No color".
- Selection is signalled by a ring drawn outside the swatch, not only by color.
- The native picker and hex field are outside the radiogroup and labeled
  ("Custom color", "Hex value").

## i18n

```svelte
<script lang="ts">
	import {
		ColorPicker,
		createColorPickerT,
		COLOR_PICKER_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createColorPickerT(COLOR_PICKER_MESSAGES_SK);
</script>

<ColorPicker bind:value={color} {t} />
```

Swatch labels are looked up with themselves as the fallback — `t(label, null, label)` —
so a consumer's own label ("Brand blue") renders verbatim while the bundled palettes'
short keys (`red`, `primary`, …) get translated by the catalog. English
(`COLOR_PICKER_MESSAGES_EN`) is the built-in default and the fallback for every partial
catalog.

## CSS Variables

Prefix `--stuic-color-picker-*`. Override globally at `:root` or locally via `style`:

```svelte
<ColorPicker style="--stuic-color-picker-swatch-size: 2.5rem;" />
```

| Variable                         | Default                                     | Description                                |
| -------------------------------- | ------------------------------------------- | ------------------------------------------ |
| `gap`                            | `0.375rem`                                  | Gap between swatches                       |
| `custom-gap`                     | `0.5rem`                                    | Gap between the palette and the custom row |
| `swatch-size`                    | `1.75rem`                                   | Swatch (and native picker) size            |
| `swatch-size-touch`              | `2.75rem`                                   | ...on a coarse pointer                     |
| `swatch-border`                  | `foreground 20%`                            | Hairline that keeps white swatches visible |
| `swatch-scale-hover`             | `1.1`                                       | Hover scale (fine pointers only)           |
| `swatch-ring-width` / `-gap`     | `2px` / `2px`                               | The selected ring and its gap              |
| `swatch-ring-color`              | `--stuic-color-foreground`                  | The selected ring color                    |
| `swatch-ring-gap-color`          | `--stuic-color-background`                  | The gap color (match your surface)         |
| `ring-width` / `ring-color`      | `2px` / `--stuic-color-ring`                | Focus ring                                 |
| `clear-color` / `clear-bg`       | `--stuic-color-destructive` / `transparent` | The "no color" slash and its background    |
| `text-width`                     | `10ch`                                      | Hex field width                            |
| `text-bg` / `-border` / `-color` | input tokens                                | Hex field colors                           |
| `text-font-family` / `-size`     | `--font-mono` / `--text-sm`                 | Hex field type                             |
| `text-font-size-touch-min`       | `16px`                                      | iOS zoom guard floor (`0px` opts out)      |
| `opacity-disabled`               | `0.5`                                       | Disabled opacity                           |

Radius and border width follow the shared tokens (`--stuic-radius`,
`--stuic-border-width`) unless `--stuic-color-picker-swatch-radius` /
`--stuic-color-picker-text-radius` / `--stuic-color-picker-*-border-width` are set.

## Exports

| Export                       | Kind      | Description                                      |
| ---------------------------- | --------- | ------------------------------------------------ |
| `ColorPicker`                | component | Main component                                   |
| `ColorPickerProps`           | type      | Props type                                       |
| `ColorPickerCustom`          | type      | `"both" \| "native" \| "text" \| false`          |
| `ColorPickerSwatch`          | type      | `string \| ColorPickerSwatchObject`              |
| `ColorPickerSwatchObject`    | type      | `{ value, label? }`                              |
| `COLOR_PICKER_PALETTE`       | constant  | The default palette (12 hues + white/grey/black) |
| `COLOR_PICKER_PALETTE_THEME` | constant  | Opt-in design-token palette                      |
| `createColorPickerT`         | function  | Builds the `t` prop from a (partial) catalog     |
| `COLOR_PICKER_MESSAGES_EN`   | constant  | Built-in English catalog (also the fallback)     |
| `COLOR_PICKER_MESSAGES_SK`   | constant  | Bundled Slovak catalog (opt-in)                  |
| `ColorPickerMessageKey`      | type      | Message key union                                |
| `ColorPickerMessages`        | type      | One locale's catalog                             |
