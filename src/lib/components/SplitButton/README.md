# SplitButton

A primary action button fused with an adjacent secondary trigger on a shared pill
surface — the pattern seen in meeting toolbars (mic / camera controls) and classic
"Save ▾" split buttons. The secondary trigger opens a built-in [DropdownMenu](../DropdownMenu/README.md)
(`items`) or fires a custom callback (`onSecondaryClick`). Both segments support
tooltips out of the box.

Two visual modes:

- **Raised** (default) — a distinct primary button sitting on a shared pill surface,
  with a neutral ghost icon trigger beside it (the "meeting toolbar" look).
- **Divided** (`divided`) — classic split button: both segments flush on one surface,
  separated by a hairline divider, secondary inheriting the primary intent/variant.

## Props

| Prop                | Type                          | Default               | Description                                                                                                   |
| ------------------- | ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `children`          | `Snippet<[{ checked? }]>`     | -                     | Primary button content (label and/or custom markup)                                                           |
| `icon`              | `string \| Snippet`           | -                     | Convenience primary icon (SVG string or snippet), rendered before `children`. Icon-only → implies icon button |
| `onclick`           | `(e: MouseEvent) => void`     | -                     | Primary click handler                                                                                         |
| `intent`            | `IntentColorKey`              | -                     | Color intent forwarded to the primary button                                                                  |
| `variant`           | `ButtonVariant`               | `"solid"`             | Visual variant forwarded to the primary button                                                                |
| `size`              | `ButtonSize`                  | `"md"`                | Size preset forwarded to both segments                                                                        |
| `iconButton`        | `boolean`                     | auto                  | Icon-only primary. Auto-enabled when `icon` is set without `children`                                         |
| `checked`           | `boolean`                     | `false`               | Toggle state forwarded to the primary button (bindable, pairs with `iconSwap`)                                |
| `roleSwitch`        | `boolean`                     | `false`               | Switch/toggle behavior on the primary button                                                                  |
| `iconSwap`          | `[icon, icon]`                | -                     | Two icon states for the primary swap animation                                                                |
| `disabled`          | `boolean`                     | -                     | Disable the primary button only                                                                               |
| `tooltip`           | `string \| TooltipConfig`     | -                     | Tooltip for the primary button                                                                                |
| `primaryProps`      | `Partial<ButtonProps>`        | -                     | Escape hatch — any extra `ButtonProps` for the primary (wins over conveniences)                               |
| `classPrimary`      | `string`                      | -                     | Classes for the primary button                                                                                |
| `primaryEl`         | `HTMLElement`                 | -                     | Primary element reference (bindable)                                                                          |
| `placement`         | `"start" \| "end"`            | `"start"`             | Which side the secondary trigger sits on (logical, RTL-aware)                                                 |
| `secondaryIcon`     | `string \| Snippet`           | chevron               | Secondary trigger icon. The default chevron rotates while the menu is open                                    |
| `secondaryLabel`    | `string`                      | `"More options"`      | Accessible label for the (icon-only) secondary trigger                                                        |
| `secondaryTooltip`  | `string \| TooltipConfig`     | -                     | Tooltip for the secondary trigger                                                                             |
| `secondaryDisabled` | `boolean`                     | -                     | Disable the secondary trigger only                                                                            |
| `onSecondaryClick`  | `(e: MouseEvent) => void`     | -                     | Custom secondary handler — used instead of the dropdown. Ignored when `items` set                             |
| `secondaryProps`    | `Partial<ButtonProps>`        | -                     | Escape hatch — any extra `ButtonProps` for the secondary trigger                                              |
| `classSecondary`    | `string`                      | -                     | Classes for the secondary trigger                                                                             |
| `secondaryEl`       | `HTMLElement`                 | -                     | Secondary element reference (bindable)                                                                        |
| `items`             | `DropdownMenuItem[]`          | -                     | Menu items — when provided, the secondary trigger opens a `DropdownMenu`                                      |
| `menuOpen`          | `boolean`                     | `false`               | Menu open state (bindable)                                                                                    |
| `position`          | `DropdownMenuPosition`        | `"bottom-span-right"` | Menu position relative to the secondary trigger                                                               |
| `offset`            | `string`                      | `"0.25rem"`           | Menu offset from the secondary trigger (CSS value)                                                            |
| `menuProps`         | `Partial<DropdownMenuProps>`¹ | -                     | Escape hatch — any extra `DropdownMenuProps` (wins over `position`/`offset`)                                  |
| `divided`           | `boolean`                     | `false`               | Classic split-button look: flush segments + hairline divider                                                  |
| `roundedFull`       | `boolean`                     | `true`                | Fully-rounded pill. Set `false` to use the button radius                                                      |
| `unstyled`          | `boolean`                     | `false`               | Skip all default styling                                                                                      |
| `class`             | `string`                      | -                     | Additional CSS classes for the wrapper                                                                        |
| `el`                | `HTMLDivElement`              | -                     | Wrapper element reference (bindable)                                                                          |

¹ `menuProps` excludes the keys the component reserves for its own wiring:
`items`, `trigger`, `isOpen`, `triggerEl`, `class`.

Remaining props are spread onto the wrapper `<div role="group">` (e.g. `aria-label`, `data-testid`).

## Usage

### Meeting-toolbar pill (raised, icon swap, menu)

```svelte
<script lang="ts">
	import { SplitButton, type DropdownMenuItem } from "@marianmeres/stuic";
	import { iconLucideMic } from "@marianmeres/icons-fns/lucide/iconLucideMic.js";
	import { iconLucideMicOff } from "@marianmeres/icons-fns/lucide/iconLucideMicOff.js";
	import { iconLucideEllipsisVertical } from "@marianmeres/icons-fns/lucide/iconLucideEllipsisVertical.js";

	let muted = $state(false);
	const items: DropdownMenuItem[] = [
		{ type: "action", id: "a", label: "Audio settings", onSelect: () => {} },
	];
</script>

<SplitButton
	bind:checked={muted}
	roleSwitch
	iconSwap={[iconLucideMic({ size: 24 }), iconLucideMicOff({ size: 24 })]}
	intent={muted ? "destructive" : undefined}
	tooltip={muted ? "Turn on microphone" : "Turn off microphone"}
	secondaryIcon={iconLucideEllipsisVertical({ size: 20 })}
	secondaryLabel="Audio options"
	secondaryTooltip="Audio options"
	position="top-span-right"
	{items}
	primaryProps={{ "aria-label": "Toggle microphone" }}
/>
```

### Classic split button (divided, label, chevron at end)

```svelte
<SplitButton
	divided
	placement="end"
	intent="primary"
	roundedFull={false}
	onclick={() => save()}
	{items}
	tooltip="Save"
	secondaryTooltip="More save options"
>
	Save
</SplitButton>
```

### Callback instead of the built-in dropdown

```svelte
<script lang="ts">
	import { SplitButton, iconSettings } from "@marianmeres/stuic";
</script>

<SplitButton icon={iconSettings()} onSecondaryClick={() => openCustomPanel()} />
```

When `items` is provided, `onSecondaryClick` is ignored — the built-in dropdown wins.

## Accessibility

- Wrapper is a `role="group"` — pass `aria-label` to name the group.
- Two tab stops (primary, secondary). The secondary trigger carries
  `aria-haspopup="menu"` / `aria-expanded` / `aria-controls` wiring only when the
  built-in dropdown is active.
- The secondary trigger is icon-only; `secondaryLabel` provides its accessible
  name (and doubles as tooltip fallback content).
- Menu keyboard handling (arrows, Escape, focus return) comes from `DropdownMenu`.

## State attributes

| Attribute           | On      | Meaning                                    |
| ------------------- | ------- | ------------------------------------------ |
| `data-placement`    | wrapper | `start` / `end`                            |
| `data-divided`      | wrapper | Divided (classic) mode                     |
| `data-rounded-full` | wrapper | Fully-rounded pill                         |
| `data-size`         | wrapper | Size preset                                |
| `data-open`         | wrapper | Menu currently open (also when `unstyled`) |

## CSS Variables

```css
:root {
	/* Raised (default) mode: shared pill surface behind both segments */
	--stuic-split-button-bg: var(--stuic-color-surface);
	--stuic-split-button-padding: calc(var(--spacing) * 1);
	--stuic-split-button-gap: calc(var(--spacing) * 0.5);

	/* Divider (divided mode only) */
	--stuic-split-button-divider-bg: var(--stuic-color-border);
	--stuic-split-button-divider-width: 1px;
	--stuic-split-button-divider-inset: calc(var(--spacing) * 1.5);
}

/* structural (resolved at element level with global fallbacks) */
/* --stuic-split-button-radius: var(--stuic-radius-button) */
/* --stuic-split-button-transition: var(--stuic-transition) */
```

In `divided` mode with bordered variants (`outline`), the segment borders plus the
divider can read as a thicker seam — set `--stuic-split-button-divider-width: 0`
to rely on the borders alone.
