# ColorScheme

Hydration components for dark mode support. Add/remove the `dark` class on the document root based on localStorage and optionally system preference.

## Components

### ColorSchemeLocal

Uses only the localStorage setting to determine dark mode. Does not check system preference.

### ColorSchemeSystemAware

Checks localStorage first, then falls back to system preference (`prefers-color-scheme: dark`).

## Props

Both components have **no props** - they are pure hydration components.

## Storage Key

Both components use the localStorage key: `stuic-color-scheme`

- Value `"dark"` → adds `dark` class to `<html>`
- Any other value → removes `dark` class

## Usage

### System-Aware (Recommended)

```svelte
<script lang="ts">
	import { ColorSchemeSystemAware } from "stuic";
</script>

<ColorSchemeSystemAware />
```

### Local Only

```svelte
<script lang="ts">
	import { ColorSchemeLocal } from "stuic";
</script>

<ColorSchemeLocal />
```

### Toggle Dark Mode

```svelte
<script lang="ts">
	import { ColorSchemeSystemAware } from "stuic";

	function toggleDarkMode() {
		const root = document.documentElement;
		const isDark = root.classList.toggle("dark");
		localStorage.setItem("stuic-color-scheme", isDark ? "dark" : "light");
	}
</script>

<ColorSchemeSystemAware />

<button onclick={toggleDarkMode}>Toggle Dark Mode</button>
```
