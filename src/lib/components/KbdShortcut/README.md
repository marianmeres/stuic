# KbdShortcut

Display keyboard shortcuts with platform-aware modifier key symbols. Automatically shows the correct symbols for macOS (⌘, ⌥, ⇧) vs Windows/Linux (Win, Ctrl, Alt).

## Props

| Prop       | Type                        | Default | Description                                    |
| ---------- | --------------------------- | ------- | ---------------------------------------------- |
| `keys`     | `string`                    | -       | The key(s) to display (e.g., `"K"`, `"Enter"`) |
| `metas`    | `KnownMeta[]`               | `[]`    | Array of modifier keys                         |
| `forcedOs` | `"mac" \| "win" \| "linux"` | -       | Force specific OS symbols                      |
| `class`    | `string`                    | -       | CSS classes                                    |

## Meta Keys

| Meta    | macOS | Windows/Linux |
| ------- | ----- | ------------- |
| `cmd`   | ⌘     | ⊞             |
| `meta`  | ⌘     | ⊞             |
| `win`   | ⌘     | ⊞             |
| `opt`   | ⌥     | Alt           |
| `alt`   | ⌥     | Alt           |
| `shift` | ⇧     | ⇧             |
| `ctrl`  | ⌃     | Ctrl          |

## Usage

### Basic Shortcut

```svelte
<script lang="ts">
	import { KbdShortcut } from "stuic";
</script>

<KbdShortcut metas={["cmd"]} keys="K" />
<!-- macOS: ⌘K -->
<!-- Windows: ⊞K -->
```

### Multiple Modifiers

```svelte
<KbdShortcut metas={["cmd", "shift"]} keys="P" />
<!-- macOS: ⌘⇧P -->
<!-- Windows: ⊞⇧P -->
```

### Key Only

```svelte
<KbdShortcut keys="Enter" />
<!-- Displays: Enter -->
```

### Force Specific OS

```svelte
<KbdShortcut metas={["cmd"]} keys="S" forcedOs="mac" />
<!-- Always shows: ⌘S -->

<KbdShortcut metas={["cmd"]} keys="S" forcedOs="win" />
<!-- Always shows: ⊞S -->
```

### In Context

```svelte
<p>
	Press <KbdShortcut metas={["cmd"]} keys="K" /> to open search
</p>
```

### Custom Styling

```svelte
<KbdShortcut metas={["cmd", "shift"]} keys="Z" class="bg-gray-100 px-2 py-1" />
```

## CSS Variables

Override to customize appearance:

| Variable                   | Default                      | Description              |
| -------------------------- | ---------------------------- | ------------------------ |
| `--stuic-kbd-font-family`  | `var(--font-mono)`           | Font family              |
| `--stuic-kbd-font-size`    | `var(--text-sm)`             | Font size                |
| `--stuic-kbd-padding-x`    | `calc(var(--spacing) * 1)`   | Horizontal padding       |
| `--stuic-kbd-padding-y`    | `0`                          | Vertical padding         |
| `--stuic-kbd-gap`          | `calc(var(--spacing) * 0.5)` | Gap between elements     |
| `--stuic-kbd-radius`       | `var(--radius-sm)`           | Border radius            |
| `--stuic-kbd-border-width` | `1px`                        | Border width             |
| `--stuic-kbd-border-color` | `var(--stuic-color-border)`  | Border color (themeable) |

### Global Override

```css
:root {
	--stuic-kbd-border-color: var(--color-blue-500);
	--stuic-kbd-radius: var(--radius-lg);
}
```

### Local Override

```svelte
<KbdShortcut
	metas={["cmd"]}
	keys="K"
	style="--stuic-kbd-border-color: blue; --stuic-kbd-radius: 0;"
/>
```
