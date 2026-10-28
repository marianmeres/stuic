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

## Props

Both components have **no props** — they are pure hydration components.

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

`setPreference("system")` clears the stored value, applies the OS setting and follows it from then on. `UserAvatarMenu` offers the same as `colorScheme={{ system: true }}`.

## Notes on `reset()`

`ColorScheme.reset()` removes the persisted preference from `localStorage`. While following the OS it is `setPreference("system")`: the OS setting applies at once. Otherwise it does **not** change the visual state in the current session — `toggle()` already painted the DOM, and the lib does not track an "original SSR default" to revert to. The next page load will paint from the SSR'd `<html>` class. If you need a same-session revert, persist your default explicitly (e.g. `localStorage.setItem(ColorScheme.KEY, "dark")` then call your toggle code).
