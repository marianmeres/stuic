# Design Tokens Manual

Design tokens are the atomic values that define a design system's visual language. They provide a shared vocabulary between design and implementation, enabling consistency and themability.

## Related files

- [design tokens (theme) generator helper](../src/lib/utils/design-tokens.ts)

---

## Token Categories

### 1. Intent Colors

Intent colors communicate **purpose** and **meaning**. They answer: "What does this element signify?"

| Token         | Purpose                                               |
| ------------- | ----------------------------------------------------- |
| `primary`     | Main actions and key interactive elements ("do this") |
| `secondary`   | Alternative or less prominent actions                 |
| `accent`      | Highlights and points of interest ("notice this")     |
| `destructive` | Dangerous or irreversible actions                     |
| `warning`     | Caution states requiring attention                    |
| `success`     | Positive outcomes or confirmations                    |
| `info`        | Neutral informational messages                        |

### 2. Role Colors

Role colors define **position** in the visual hierarchy. They answer: "Where does this sit in the UI?"

| Token        | Purpose                                             |
| ------------ | --------------------------------------------------- |
| `background` | Base page layer (e.g. `<body>`)                     |
| `foreground` | Default text/content color                          |
| `surface`    | Raised containers (cards, modals, panels, sidebars) |
| `surface-1`  | Darker surface level (inset areas, nested cards)    |
| `surface-2`  | Darkest surface level (deeply nested elements)      |
| `border`     | Default border color                                |
| `input`      | Form field backgrounds                              |
| `ring`       | Focus indicator color                               |
| `muted`      | De-emphasized text and subtle backgrounds           |

> **Numeric surface convention:** Higher numbers indicate deeper layering in light mode and higher elevation in dark mode.

### 3. Foreground Pairing Convention

Every color token that serves as a background should have a `-foreground` counterpart for text/content rendered on top of it. This ensures accessible contrast.

```
{token}           → background/fill color
{token}-foreground → text color on that background
```

Examples:

- `primary` / `primary-foreground`
- `surface` / `surface-foreground`
- `surface-1` / `surface-1-foreground`
- `destructive` / `destructive-foreground`

---

## Scales

Scales define **ranges of values** for non-color properties.

Usage of standard Tailwind classes in encouraged.

- Size (w-..., size-...)
- Spacing (p-..., m-...)
- Border Radius (rounded-...)
- Border Width (border-...)
- Shadow / Elevation (shadow-...)
- Typography (font-..., leading-..., tracking-...)

---

## Component Variants

Components typically vary across these dimensions:

| Dimension | Common Values                               | Controls                  |
| --------- | ------------------------------------------- | ------------------------- |
| `variant` | `solid`, `outline`, `ghost`, `link`, `soft` | Visual treatment          |
| `intent`  | `primary`, `secondary`, `destructive`, etc. | Color/meaning             |
| `size`    | `sm`, `md`, `lg`                            | Dimensions and typography |

### Variant Definitions

- **solid** — filled background with contrasting text
- **outline** — transparent background with colored border and text
- **ghost** — transparent background, colored text, subtle hover state
- **soft** — muted/translucent background tint with colored text
- **link** — appears as inline text link, minimal styling

---

## Implementation Notes

### Ring Implementation

Rings are implemented as `box-shadow` rather than `border` or `outline`:

- Does not affect layout
- Respects border-radius
- Can be offset and layered

```css
box-shadow: 0 0 0 {width} {color};
```

### Dark Mode Strategy

Role colors enable dark mode through value reassignment:

- `background` becomes dark
- `surface` becomes slightly lighter than background (elevation cue)
- `foreground` becomes light

Intent colors may need adjusted lightness but retain their hue.

### Token Minimalism

Define only the tokens you need. Each token is a decision point — more tokens means more choices during implementation. Start minimal and expand when genuine needs arise.
