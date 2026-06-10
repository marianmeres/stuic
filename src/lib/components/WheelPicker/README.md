# WheelPicker

iOS-style scrolling wheel / drum picker (à la `UIPickerView`) for selecting a value from a
list — hours, minutes, days, units, anything. Supports **infinite looping** (scroll past the
last option and the first reappears seamlessly, e.g. minutes 59 → 00).

Built entirely on native scroll + CSS scroll-snap, so momentum/inertia feel native on touch
devices for free — no hand-rolled physics. Looping works by silently teleporting the scroll
position by a whole number of option-cycles **only at rest**, which is provably invisible
(the centered value is identical before and after).

## Usage

```svelte
<script lang="ts">
	import { WheelPicker } from "@marianmeres/stuic";

	let hour = $state(9);
	const hours = Array.from({ length: 24 }, (_, i) => i);
</script>

<!-- looping wheel of 0..23 -->
<WheelPicker options={hours} bind:value={hour} loop label="Hour" />
```

A simple time picker is three wheels side by side:

```svelte
<script lang="ts">
	let h = $state(9),
		m = $state(30);
	const range = (n: number) => Array.from({ length: n }, (_, i) => i);
	const pad = (n: number) => ({ label: String(n).padStart(2, "0"), value: n });
</script>

<div style="display:flex; gap:0.5rem">
	<WheelPicker options={range(24).map(pad)} bind:value={h} loop label="Hour" />
	<WheelPicker options={range(60).map(pad)} bind:value={m} loop label="Minute" />
</div>
```

Options may be bare primitives or full objects:

```svelte
<WheelPicker
	options={[
		{ label: "Small", value: "s" },
		{ label: "Medium", value: "m" },
		{ label: "Large", value: "l", disabled: true },
	]}
	bind:value={size}
/>
```

## Props

| Prop                | Type                                                 | Default | Description                                                                 |
| ------------------- | ---------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `options`           | `(string \| number \| WheelPickerOption)[]`          | —       | Options to scroll through. Primitives become `{ label, value }`.            |
| `value`             | `T`                                                  | —       | **Bindable** selected value (the chosen option's `value`). Primary binding. |
| `index`             | `number`                                             | —       | **Bindable** selected real index. Alternative/companion to `value`.         |
| `loop`              | `boolean`                                            | `false` | Infinite wrap (59 → 00). When `false`, clamps at the ends.                  |
| `itemHeight`        | `number`                                             | `36`    | Row height in px. Prefer an integer.                                        |
| `visibleCount`      | `number`                                             | `5`     | How many rows are visible (forced odd, for an exact center).                |
| `tiles`             | `number`                                             | `3`     | Loop buffer copies (a floor; auto-grown to guarantee fling runway).         |
| `keyboard`          | `boolean`                                            | `true`  | Enable Arrow/Page/Home/End navigation.                                      |
| `announce`          | `boolean`                                            | `true`  | Announce the committed label via an `aria-live` region.                     |
| `label`             | `string`                                             | —       | Accessible name for the listbox. **Strongly recommended.**                  |
| `onchange`          | `(option: WheelPickerOption, index: number) => void` | —       | Fired when the selection **settles** on a new option (not during a fling).  |
| `unstyled`          | `boolean`                                            | `false` | Skip default styling.                                                       |
| `class`             | `string`                                             | —       | Additional CSS classes on the root.                                         |
| `classItem`         | `string`                                             | —       | Extra classes on each row.                                                  |
| `classItemSelected` | `string`                                             | —       | Extra classes on the selected row.                                          |
| `classBand`         | `string`                                             | —       | Extra classes on the center selection band.                                 |
| `el`                | `HTMLDivElement`                                     | —       | **Bindable** root element ref.                                              |
| `renderItem`        | `Snippet<[{ option, index, selected }]>`             | —       | Custom row renderer (alternative to the plain label).                       |

`WheelPickerOption` is `{ label: string; value: string \| number; disabled?: boolean }`.

## Behavior

- **Native momentum**: touch fling, trackpad, mouse wheel and scrollbar all drive the native
  scroll; CSS scroll-snap settles the nearest row under the center band. No custom physics.
- **Commit on settle**: `value`/`index`/`onchange` update only when scrolling comes to rest,
  not on every intermediate frame of a fling.
- **Infinite loop** (`loop`): options repeat in both directions. The buffer is recentered by a
  whole-cycle scroll teleport **only at rest**, so the seam is never visible and momentum is
  never interrupted (important on iOS Safari, where `scrollend` is unavailable before 26.2 —
  so the commit/settle path never depends on it).
- **Keyboard**: ↑/↓ step one, PageUp/PageDown step `visibleCount`, Home/End jump to the
  first/last option (wrapping when `loop`). Disabled options are skipped.
- **Programmatic set**: changing the bound `value` (e.g. a ticking clock) scrolls the wheel to
  match — deferred while the user is actively scrolling so it never yanks mid-gesture.
- **Reduced motion**: respects `prefers-reduced-motion` — programmatic scrolls jump instantly.
- **Accessibility**: the scroll viewport is a `role="listbox"` with `aria-activedescendant`
  tracking the selected option; in loop mode only the canonical copy of each option carries
  `role="option"` (duplicate tiles are `aria-hidden`), so screen readers never hear repeats.

## CSS Tokens

Prefix: `--stuic-wheel-picker-*`

`item-height`, `visible-count`, `min-width`, `font-size`, `font-family`, `color`,
`color-selected`, `font-weight-selected`, `band-bg`, `band-border-color`, `band-border-width`,
`fade` (0–1 edge-fade strength), `ring-width`, `ring-color`, plus optional `radius`, `bg`,
`transition` overrides.

> **Note:** set `item-height` / `visible-count` via the **props**, not CSS — the component
> writes them inline because the same numbers drive the scroll math. The shared structural
> token `--stuic-radius-container` is used as the radius fallback.
