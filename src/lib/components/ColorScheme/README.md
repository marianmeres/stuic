# ColorScheme

Hydration components and a small runtime for dark mode support. Add/remove the `dark` class on the `<html>` element based on a stored user preference. The runtime has **no opinion**: when `localStorage` is empty, it defers to whatever class the SSR'd `<html>` already has — so apps can ship dark-by-default just by SSR'ing `<html class="dark">`.

## Contract

- `localStorage["stuic-color-scheme"]` is `"dark"` or `"light"` → that wins.
- Otherwise → defer to the current `<html>` class (set by SSR, `app.html`, or your own bootstrap).
- `prefers-color-scheme` is **never** consulted implicitly. It is read only when the runtime follows the OS — an explicit opt-in:
  - You mount `<ColorSchemeSystemAware />` (it paints the OS setting at first paint when no preference is stored, and turns on `followSystem`), or
  - You call `ColorScheme.configure({ followSystem: true })`, or `ColorScheme.setPreference("system")`, or
  - You call `ColorScheme.getSystemValue()` from your own UI.
- While following the OS and no preference is stored, the scheme tracks the OS setting **live** (e.g. scheduled dark mode at sunset repaints an open page). A stored `"light"` / `"dark"` always wins.

## Components

### ColorSchemeLocal

Uses only the localStorage setting. If no preference is stored, the inline bootstrap leaves the `<html>` class alone — the SSR'd default wins.

### ColorSchemeSystemAware

Explicit opt-in for an OS-aware scheme. Checks localStorage first; if empty, falls back to `prefers-color-scheme: dark` at first paint, then keeps following the OS setting while the page is open (`followSystem`). Use this if you want the OS to decide until the viewer picks.

### ColorSchemeSwitcher

The System / Light / Dark control: a [`ButtonGroupRadio`](../ButtonGroupRadio/) wired to the runtime. Icon-only by default (monitor / sun / moon, each segment named for assistive tech and given a tooltip), compact, and stateless — the active segment is `ColorScheme.preference`, a click is `ColorScheme.setPreference()`. Anything else that changes the preference (the `UserAvatarMenu` Appearance group, another tab, the OS while following) moves the active segment on its own.

```svelte
<script lang="ts">
	import { ColorSchemeSwitcher, ColorSchemeSystemAware } from "stuic";
</script>

<!-- "System" must survive a reload: paint the OS setting first -->
<ColorSchemeSystemAware />

<ColorSchemeSwitcher />
```

**Pair it with `<ColorSchemeSystemAware />`.** Choosing "System" works in-session with either bootstrap (`setPreference("system")` turns `followSystem` on), but only the system-aware bootstrap paints the OS setting on the next load; with `<ColorSchemeLocal />` a reload falls back to the SSR'd `<html>` class and the viewer's "System" choice is not what they see.

Variants:

```svelte
<!-- icon + text -->
<ColorSchemeSwitcher showLabels />

<!-- light / dark only: the active segment mirrors ColorScheme.current (what is on
     screen), so a viewer who never chose still sees one segment active -->
<ColorSchemeSwitcher options={["light", "dark"]} />

<!-- i18n -->
<ColorSchemeSwitcher
	labels={{ group: "Vzhľad", system: "Systém", light: "Svetlý", dark: "Tmavý" }}
/>

<!-- own icons (any SVG string) -->
<ColorSchemeSwitcher icons={{ system: iconLaptop({ size: 16 }) }} />

<!-- the group's tokens apply: a dense, rounded-square toolbar control -->
<ColorSchemeSwitcher
	size="sm"
	style="
		--stuic-button-group-radius: 0.5rem;
		--stuic-button-group-button-min-height: 1.75rem;
		--stuic-button-group-button-padding-x: 0.5rem;
		--stuic-button-group-button-padding-y: 0.25rem;
	"
/>
```

## Props

`ColorSchemeLocal` and `ColorSchemeSystemAware` have **no props** — they are pure hydration components.

### ColorSchemeSwitcher

| Prop                | Type                                             | Default                       | Description                                                                                                |
| ------------------- | ------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `options`           | `ColorSchemePreference[]`                        | `["system", "light", "dark"]` | Which preferences to offer, in order. Without `"system"` the active segment mirrors `ColorScheme.current`. |
| `showLabels`        | `boolean`                                        | `false`                       | Render the label text next to each icon. Off: icon-only, named by `aria-label`.                            |
| `tooltips`          | `boolean`                                        | `true`                        | Tooltip on each icon-only segment. Ignored with `showLabels`.                                              |
| `labels`            | `ColorSchemeSwitcherLabels`                      | English                       | `group` ("Color scheme"), `system` ("System"), `light` ("Light mode"), `dark` ("Dark mode").               |
| `icons`             | `Partial<Record<ColorSchemePreference, string>>` | monitor / sun / moon          | Icon markup per preference (an SVG string).                                                                |
| `size`              | `"sm" \| "md" \| "lg"`                           | `"md"`                        | Forwarded to `ButtonGroupRadio`.                                                                           |
| `disabled`          | `boolean`                                        | `false`                       | Disable every segment.                                                                                     |
| `unstyled`          | `boolean`                                        | `false`                       | Skip the component's own class (compact width, icon sizing); a plain full-width group remains.             |
| `class`             | `string`                                         | —                             | Merged onto the radiogroup.                                                                                |
| `classButton`       | `string`                                         | —                             | Forwarded.                                                                                                 |
| `classButtonActive` | `string`                                         | —                             | Forwarded.                                                                                                 |
| `style`             | `string`                                         | —                             | Inline style on the radiogroup — the place for `--stuic-button-group-*` overrides.                         |
| `el`                | `HTMLDivElement`                                 | —                             | The radiogroup element (bindable).                                                                         |

### ColorSchemeSwitcher CSS

Every `--stuic-button-group-*` token of `ButtonGroupRadio` applies (radius, paddings, colors, size variants). The switcher adds two of its own, never declared — set them on the element or any ancestor:

| Token                                     | Fallback   | Description                                   |
| ----------------------------------------- | ---------- | --------------------------------------------- |
| `--stuic-color-scheme-switcher-icon-size` | `1rem`     | Icon width and height                         |
| `--stuic-color-scheme-switcher-gap`       | `0.375rem` | Gap between icon and text (with `showLabels`) |

## Storage Key

Default localStorage key: `stuic-color-scheme`.

- Value `"dark"` → adds `dark` class to `<html>`
- Value `"light"` → removes `dark` class
- Anything else / absent → no DOM change (defers to existing class)

Override via `ColorScheme.configure({ key: "myapp:color-scheme" })`. Call early in app boot. For FOUC-free hydration with a custom key, ship your own inline bootstrap in `app.html`.

## Usage

### Local (no system fallback)

```svelte
<script lang="ts">
	import { ColorSchemeLocal } from "stuic";
</script>

<ColorSchemeLocal />
```

### Dark by default

Just SSR the `dark` class on `<html>` (e.g. in `src/app.html`):

```html
<html lang="en" class="dark"></html>
```

With `<ColorSchemeLocal />` mounted, the app starts dark; toggling persists `"light"` to localStorage; calling `ColorScheme.reset()` clears the preference (the next reload restores the dark default).

### System-aware

```svelte
<script lang="ts">
	import { ColorSchemeSystemAware } from "stuic";
</script>

<ColorSchemeSystemAware />
```

### Toggle / reset / read

```svelte
<script lang="ts">
	import { ColorScheme, ColorSchemeLocal } from "stuic";
</script>

<ColorSchemeLocal />

<button onclick={() => ColorScheme.toggle()}>
	Current: {ColorScheme.current}
</button>

<!-- Clear persisted preference. Visual stays as-is until next reload. -->
<button onclick={() => ColorScheme.reset()}>Reset</button>
```

### Three states: system | light | dark

`ColorScheme.preference` is reactive: `"light"` / `"dark"` when the viewer picked one, `"system"` when nothing is stored. `ColorScheme.current` stays what is on screen.

```svelte
<script lang="ts">
	import { ColorScheme, ColorSchemeSystemAware } from "stuic";
	import type { ColorSchemePreference } from "stuic";

	const options: ColorSchemePreference[] = ["system", "light", "dark"];
</script>

<!-- "system" must survive a reload: paint the OS setting first -->
<ColorSchemeSystemAware />

{#each options as option (option)}
	<button
		aria-pressed={ColorScheme.preference === option}
		onclick={() => ColorScheme.setPreference(option)}
	>
		{option}
	</button>
{/each}
```

`setPreference("system")` clears the stored value, applies the OS setting and follows it from then on. This is what `<ColorSchemeSwitcher />` does, with icons, names and keyboard navigation already in place; `UserAvatarMenu` offers the same as `colorScheme={{ system: true }}`.

## Notes on `reset()`

`ColorScheme.reset()` removes the persisted preference from `localStorage`. While following the OS it is `setPreference("system")`: the OS setting applies at once. Otherwise it does **not** change the visual state in the current session — `toggle()` already painted the DOM, and the lib does not track an "original SSR default" to revert to. The next page load will paint from the SSR'd `<html>` class. If you need a same-session revert, persist your default explicitly (e.g. `localStorage.setItem(ColorScheme.KEY, "dark")` then call your toggle code).
