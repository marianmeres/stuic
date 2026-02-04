# Components Domain

## Overview

35 Svelte 5 components with consistent API patterns. All use runes-based reactivity.

## Component Categories

### Layout
| Component | Purpose |
|-----------|---------|
| AppShell, AppShellSimple | Page layouts with header/sidebar/content |
| Modal, ModalDialog | Overlay containers |
| Drawer | Side panel overlay |
| Collapsible | Expandable sections |
| SlidingPanels | Panel transitions |
| TabbedMenu | Tab navigation |
| Nav | Navigation wrapper |

### Interactive
| Component | Purpose |
|-----------|---------|
| Button | Actions with intent/variant/size |
| ButtonGroupRadio | Toggle group (single selection) |
| Switch | Boolean toggle |
| TwCheck | Styled checkbox/radio |
| DropdownMenu | Popover menu |
| CommandMenu | Command palette (keyboard-driven) |
| TypeaheadInput | Autocomplete input |

### Feedback
| Component | Purpose |
|-----------|---------|
| Notifications | Toast notification system |
| AlertConfirmPrompt | Dialog factory (alert/confirm/prompt) |
| DismissibleMessage | Closeable message banner |
| Progress | Progress bar |
| Spinner | Loading indicator |
| Skeleton | Loading placeholder |

### Form
| Component | Purpose |
|-----------|---------|
| Input (FieldInput, FieldSelect, etc.) | Form fields |
| Fieldset | Field grouping with legend |
| FieldKeyValues | Key-value pair editor |
| FieldAssets | File/asset management |

### Display
| Component | Purpose |
|-----------|---------|
| Avatar | User avatars with fallback |
| KbdShortcut | Keyboard shortcut hints |
| Carousel | Image/content slider |
| ListItemButton | List item with actions |
| AnimatedElipsis | Loading dots animation |
| ThemePreview | Theme color swatches |

---

## Props Pattern

All components share universal props:

```ts
interface CommonProps {
  unstyled?: boolean;  // Skip all default styling
  class?: string;      // Additional CSS classes (merged via twMerge)
  el?: HTMLElement;    // Bindable element reference
}
```

### Full Props Example

```svelte
<script lang="ts" module>
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  export interface Props extends Omit<HTMLButtonAttributes, "children"> {
    children?: Snippet;
    intent?: "primary" | "accent" | "destructive" | "warning" | "success";
    variant?: "solid" | "outline" | "ghost" | "soft" | "link";
    unstyled?: boolean;
    class?: string;
    el?: HTMLButtonElement;
  }
</script>

<script lang="ts">
  let {
    children,
    intent = "primary",
    variant = "solid",
    unstyled = false,
    class: classProp,
    el = $bindable(),
    ...rest
  }: Props = $props();
</script>
```

---

## Snippet Pattern

Content passed via Svelte 5 snippets (not slots):

```svelte
<Modal>
  {#snippet header()}
    <h2>Modal Title</h2>
  {/snippet}

  <p>Modal content goes here.</p>

  {#snippet footer()}
    <Button>Close</Button>
  {/snippet}
</Modal>
```

### Snippet with Parameters

```svelte
<Carousel items={images}>
  {#snippet renderItem({ item, index, active })}
    <img src={item.src} class:active />
  {/snippet}
</Carousel>
```

---

## Intent + Variant System

**Intent** defines semantic meaning (color palette):
- `primary` - Main actions
- `accent` - Secondary emphasis
- `destructive` - Dangerous actions
- `warning` - Caution states
- `success` - Positive states

**Variant** defines visual treatment:
- `solid` - Filled background, contrasting text
- `outline` - Transparent bg, colored border/text
- `ghost` - Transparent bg, subtle hover
- `soft` - Muted tinted background
- `link` - Minimal, text decoration only

```svelte
<Button intent="destructive" variant="outline">Delete</Button>
<Button intent="success" variant="soft">Saved</Button>
```

---

## CSS Architecture

### Data Attributes (not classes)

Variants use data attributes for CSS targeting:

```svelte
<button
  class="stuic-button"
  data-intent={intent}
  data-variant={variant}
  data-size={size}
>
```

### Internal Variables Pattern

Components use private CSS vars (`--_*`) set by intent/variant:

```css
/* Intent sets color palette */
.stuic-button[data-intent="primary"] {
  --_color: var(--stuic-color-primary);
  --_fg: var(--stuic-color-primary-foreground);
}

/* Variant determines how colors apply */
.stuic-button[data-variant="solid"] {
  --_bg: var(--_color);
  --_text: var(--_fg);
}

/* Base styles use internal vars */
.stuic-button {
  background: var(--_bg);
  color: var(--_text);
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| src/lib/components/Button/ | Reference implementation |
| src/lib/components/Modal/ | Complex component example |
| src/lib/components/Input/ | Form field patterns |
| src/lib/index.ts | All component exports |
